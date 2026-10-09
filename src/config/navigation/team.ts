import { LayoutDashboard, Gift, MessageCircle, Search } from "lucide-react";

import type { NavigationConfig } from "./types";

/** Team member workspace: send outreach messages and run a few discovery searches a day (AD-044). */
export const teamNavigation: NavigationConfig = [
  {
    items: [
      { label: "Dashboard", href: "/team/dashboard", icon: LayoutDashboard },
      { label: "Outreach", href: "/team/outreach", icon: MessageCircle },
      { label: "Discover", href: "/team/discover", icon: Search },
      { label: "Refer & Earn", href: "/referrals", icon: Gift },
    ],
  },
];
