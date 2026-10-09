import type { Metadata } from "next";

import { requireRole } from "@/lib/session";
import { SetPageTitle } from "@/components/dashboard-shell/layout/dashboard-title-context";
import { GooglePlacesSearchForm } from "@/features/lead-intelligence/components/admin/discover-panel";
import { getDiscoverQuota } from "@/features/lead-intelligence/server/discover-quota";

export const metadata: Metadata = { title: "Discover businesses" };

export default async function TeamDiscoverPage() {
  const user = await requireRole("TEAM_MEMBER");
  const quota = await getDiscoverQuota(user.id, user.role);

  return (
    <>
      <SetPageTitle title="Discover businesses" />
      <div className="flex max-w-2xl flex-col gap-6 p-6">
        <p className="text-muted-foreground text-sm">
          Search for local businesses to message, for example &quot;dentists&quot; in
          &quot;Jaipur&quot;. Results go straight into the outreach queue.
        </p>
        <GooglePlacesSearchForm remaining={quota.remaining} />
      </div>
    </>
  );
}
