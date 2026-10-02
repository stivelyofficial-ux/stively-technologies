"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { loginUser } from "@/actions/auth";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/forms/google-signin-button";
import { ResendVerificationForm } from "@/components/forms/resend-verification-form";
import { DatabaseMaintenanceDialog } from "@/components/shared/database-maintenance-dialog";

export interface LoginFormProps {
  callbackUrl?: string;
}

function LoginForm({ callbackUrl }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(loginUser, null);
  const needsVerification = state?.success === false && state.error.includes("verify your email");

  // Opens once per new failed-with-maintenance result, closeable afterward
  // without the dialog reopening itself - "adjust state during render"
  // (react.dev's own pattern for this), not a useEffect+setState, which
  // the lint rule here flags as cascading-render-prone for exactly this
  // "derive from a prop/state change" case.
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [lastHandledState, setLastHandledState] = useState(state);
  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.success === false && state.isDbMaintenance) setShowMaintenance(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <DatabaseMaintenanceDialog open={showMaintenance} onOpenChange={setShowMaintenance} />
      <form action={formAction} className="flex flex-col gap-5">
        {callbackUrl && <input type="hidden" name="callbackUrl" value={callbackUrl} />}

        <FormField id="email" label="Email">
          <Input name="email" type="email" required autoComplete="email" />
        </FormField>

        <FormField id="password" label="Password">
          <Input name="password" type="password" required autoComplete="current-password" />
        </FormField>

        <div className="flex items-center justify-between">
          <label className="text-muted-foreground flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="remember"
              className="border-input accent-primary size-4 rounded"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-primary text-sm font-medium underline-offset-4 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        {state?.success === false && (
          <p role="alert" className="text-destructive text-sm">
            {state.error}
          </p>
        )}

        <Button type="submit" size="lg" loading={isPending} className="w-full">
          Sign in
        </Button>
      </form>

      {needsVerification && (
        <div className="border-border flex flex-col gap-2 border-t pt-5">
          <p className="text-muted-foreground text-sm">Need a new verification link?</p>
          <ResendVerificationForm />
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="bg-border h-px flex-1" />
        <span className="text-muted-foreground text-xs">or</span>
        <div className="bg-border h-px flex-1" />
      </div>

      {/* No role toggle on this page (unlike /register), so the role for a
          brand-new Google account is decided by googleSignIn from context -
          see resolveNewAccountRole in src/actions/auth.ts. Only ever affects
          an account's first sign-in. */}
      <GoogleSignInButton callbackUrl={callbackUrl} roleIsDefault />

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-primary font-medium underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}

export { LoginForm };
