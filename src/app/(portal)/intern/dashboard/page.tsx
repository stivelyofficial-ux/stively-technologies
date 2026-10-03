import { redirect } from "next/navigation";

/** INTERN-role users' default landing (ROLE_HOME) - the real portal is /intern. */
export default function InternDashboardRedirect() {
  redirect("/intern");
}
