import type { Metadata } from "next";
import Link from "next/link";
import { IdCard } from "lucide-react";

import { getInternContext } from "@/features/internships/server/access";
import { formatInternId } from "@/features/internships/lib/id-card";
import { formatLongDate } from "@/features/internships/lib/stats";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Intern profile" };

export default async function InternProfilePage() {
  const { user, track } = await getInternContext({ requireOnboarded: true });
  const name = user.name ?? "Intern";

  const rows: [string, string][] = [
    ["Name", name],
    ["Email", user.email ?? "-"],
    ["Role", "Intern, Stively Technologies"],
  ];
  if (track) {
    rows.push(
      ["Intern ID", formatInternId(track.sequence, track.title)],
      ["Program", track.title],
      [
        "Duration",
        track.durationMonths
          ? `${track.durationMonths} month${track.durationMonths > 1 ? "s" : ""}`
          : "-",
      ],
      ["Started", formatLongDate(track.startedAt)],
      ["Valid till", track.endsAt ? formatLongDate(track.endsAt) : "-"],
      [
        "Status",
        track.status === "ACTIVE"
          ? "Active"
          : track.status === "COMPLETED"
            ? "Completed"
            : "Paused",
      ],
      [
        "Stipend terms",
        track.termsAcceptedAt
          ? `Accepted on ${formatLongDate(track.termsAcceptedAt)}`
          : "Not accepted yet",
      ]
    );
  }

  return (
    <div className="flex max-w-2xl flex-col gap-7">
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-3xl font-bold tracking-tight">Intern profile</h1>
        <p className="text-muted-foreground">Your details as a Stively intern.</p>
      </div>

      <div className="bg-card border-border flex flex-col gap-6 rounded-2xl border p-7">
        <div className="flex items-center gap-4">
          <span className="bg-primary/10 text-primary flex size-16 items-center justify-center rounded-full text-2xl font-bold">
            {name.trim()[0]?.toUpperCase()}
          </span>
          <div className="flex flex-col">
            <span className="text-foreground text-xl font-bold">{name}</span>
            <span className="text-primary text-sm font-semibold">Intern</span>
          </div>
        </div>
        <dl className="grid grid-cols-[130px_1fr] gap-x-4 gap-y-3 text-[15px]">
          {rows.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-foreground font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        {track && (
          <Button asChild variant="outline" className="w-fit">
            <Link href="/intern/id-card">
              <IdCard aria-hidden="true" />
              View my ID card
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
