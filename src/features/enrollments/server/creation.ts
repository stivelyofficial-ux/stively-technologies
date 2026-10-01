import "server-only";

import { prisma } from "@/lib/prisma";
import type { OfferingEnrollment, Order, OfferingRequest, OfferingEnrollmentStatus, AccessGrantReason } from "@prisma/client";
import { emitEnrollmentEvent } from "../lib/events";
import { ensureInternshipTrack } from "@/features/internships/server/creation";
import { convertReferralOnEnrollment } from "@/features/referrals/server/conversion";
import { getOrIssueCertificate } from "@/features/certificates/server/issuance";

interface CreateEnrollmentInput {
  studentId: string;
  offeringId: string;
  orderId?: string;
  offeringRequestId?: string;
  status: OfferingEnrollmentStatus;
  /** Only meaningful when status is ACTIVE at creation - why access was granted immediately. */
  accessGrantReason?: AccessGrantReason;
}

/**
 * The one real insert both origin-specific wrappers below call - a Draft
 * request or a Pending order never reaches this function at all (see each
 * wrapper's call site), so "one engine regardless of origin" holds without
 * duplicating the actual creation logic per origin.
 */
async function createEnrollment(input: CreateEnrollmentInput): Promise<OfferingEnrollment> {
  const isActive = input.status === "ACTIVE";
  const now = new Date();

  const enrollment = await prisma.offeringEnrollment.create({
    data: {
      studentId: input.studentId,
      offeringId: input.offeringId,
      orderId: input.orderId,
      offeringRequestId: input.offeringRequestId,
      status: input.status,
      startDate: isActive ? now : null,
      accessGranted: isActive,
      accessGrantedAt: isActive ? now : null,
      history: {
        create: { eventType: "CREATED", toStatus: input.status },
      },
      progressSnapshots: {
        // One real snapshot at creation, not a fabricated history - the
        // append-only log a future LMS writes into as real progress happens.
        create: { progressPercentage: 0 },
      },
      ...(isActive && input.accessGrantReason
        ? { accessGrants: { create: { granted: true, reason: input.accessGrantReason } } }
        : {}),
    },
  });

  emitEnrollmentEvent(isActive ? "ENROLLMENT_ACTIVATED" : "ENROLLMENT_CREATED", enrollment);
  return enrollment;
}

/**
 * Order PAID always means access is confirmed - payment already happened,
 * nothing left to wait for. Called from orders/actions/order-actions.ts's
 * verifyPayment success branch, the FREE short-circuit in createOrder, and
 * the webhook's PAID branch - the same three call sites Phase 7's
 * createOperationItemForOrder already touches.
 */
export async function createEnrollmentFromOrder(order: Order): Promise<OfferingEnrollment | null> {
  // Guest-checkout orders (Offering.allowsGuestCheckout) start with no
  // userId - by the time an order is genuinely PAID, guest-fulfillment.ts
  // has already backfilled it, so this should never actually be null in
  // practice. Guarding anyway rather than assuming, since Order.userId is
  // nullable at the type level now.
  if (!order.userId) return null;

  // A "membership" product's own paid Order is what actually grants the
  // perk - see Offering.grantsPrimeMembership's schema comment for why this
  // rides on the normal checkout flow rather than a separate mechanism.
  const offering = await prisma.offering.findUnique({
    where: { id: order.offeringId },
    select: { grantsPrimeMembership: true, referralRewardAmount: true },
  });
  if (offering?.grantsPrimeMembership) {
    await prisma.user.update({ where: { id: order.userId }, data: { isPrimeMember: true, primeMemberSince: new Date() } });
  }

  const enrollment = await createEnrollment({
    studentId: order.userId,
    offeringId: order.offeringId,
    orderId: order.id,
    status: "ACTIVE",
    accessGrantReason: "PAYMENT_CONFIRMED",
  });

  // Referral Program (AD-035) - converts on PURCHASE, not on finishing the
  // course, so this belongs here rather than in completeEnrollment below.
  await convertReferralOnEnrollment(order.userId, order.offeringId, offering?.referralRewardAmount ?? null);

  return enrollment;
}

/**
 * An Approved request only means access is confirmed today when the
 * offering is FREE - a paid CONSULTATION-flow offering has no online
 * payment step yet (the brief's own "Approved -> Payment (future) ->
 * Enrollment"), so it creates a PENDING, access-not-yet-granted enrollment
 * instead. An admin activates it manually once payment is confirmed
 * offline - see actions/admin-enrollment-actions.ts's activateEnrollment.
 */
export async function createEnrollmentFromRequest(request: OfferingRequest): Promise<OfferingEnrollment> {
  const offering = await prisma.offering.findUnique({ where: { id: request.offeringId } });
  const isFree = offering?.pricingType === "FREE";

  return createEnrollment({
    studentId: request.userId,
    offeringId: request.offeringId,
    offeringRequestId: request.id,
    status: isFree ? "ACTIVE" : "PENDING",
    accessGrantReason: isFree ? "FREE_OFFERING" : undefined,
  });
}

/**
 * The actual "mark an enrollment COMPLETED" write - extracted so both the
 * admin-triggered action (actions/admin-enrollment-actions.ts's
 * markCompleted, which wraps this with requireRole) and the
 * student-triggered automatic path (Phase 9's
 * src/features/learning/server/progression.ts, reached only via the
 * student's own ownership-checked lesson-completion actions - never a
 * second, unguarded entry point) share one real implementation instead of
 * two copies of the same status transition.
 */
export async function completeEnrollment(enrollmentId: string): Promise<OfferingEnrollment | null> {
  const current = await prisma.offeringEnrollment.findUnique({ where: { id: enrollmentId } });
  if (!current || current.status === "COMPLETED") return current;

  const updated = await prisma.offeringEnrollment.update({
    where: { id: enrollmentId },
    data: {
      status: "COMPLETED",
      completionDate: new Date(),
      progressPercentage: 100,
      history: { create: { eventType: "COMPLETED", fromStatus: current.status, toStatus: "COMPLETED" } },
    },
  });
  emitEnrollmentEvent("ENROLLMENT_COMPLETED", updated);
  await ensureInternshipTrack(enrollmentId, updated.studentId);

  // Automatic certificate issuance - was previously a manual "Generate My
  // Certificate" button; getOrIssueCertificate is already idempotent
  // (unique on enrollmentId) and doesn't depend on an authenticated
  // session, so calling it right here is safe and makes "automatically"
  // literal rather than "the button now works slightly better." A no-op
  // for any course without a COURSE_CERTIFICATE_CONFIG entry - returns a
  // clean failure result, never throws.
  try {
    await getOrIssueCertificate(enrollmentId, updated.studentId);
  } catch (error) {
    console.error("completeEnrollment: automatic certificate issuance failed:", error);
  }

  return updated;
}
