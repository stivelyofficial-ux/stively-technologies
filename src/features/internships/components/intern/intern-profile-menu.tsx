import Link from "next/link";
import { IdCard, User, LifeBuoy, LogOut } from "lucide-react";

import { signOutAction } from "@/actions/auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * The account menu inside the Intern Portal. Deliberately its own menu, not
 * the shared student/dashboard ProfileDropdown: here the person is an
 * intern, so it identifies them as one and links only to intern pages (ID
 * card, intern profile, intern help) - never the student dashboard's
 * profile/settings screens.
 */
function InternProfileMenu({ user }: { user: { name?: string | null; email?: string | null } }) {
  const displayName = user.name ?? "Intern";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Intern account menu"
          className="bg-primary/10 text-primary hover:ring-ring flex size-11 shrink-0 items-center justify-center rounded-full text-base font-bold transition-shadow outline-none hover:ring-2"
        >
          {initialsOf(displayName) || <User className="size-4" aria-hidden="true" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex flex-col gap-0.5 normal-case">
          <span className="text-foreground text-sm font-medium">{displayName}</span>
          {user.email && (
            <span className="text-muted-foreground truncate text-xs">{user.email}</span>
          )}
          <span className="text-primary text-xs font-semibold">Intern · Stively Technologies</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/intern/id-card">
            <IdCard />
            My ID card
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/intern/profile">
            <User />
            Intern profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/intern/help">
            <LifeBuoy />
            Help Center
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem asChild variant="destructive">
            <button type="submit" className="w-full">
              <LogOut />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { InternProfileMenu };
