import { redirect } from "next/navigation";

/** The internship now lives in its own portal - keep old links and bookmarks working. */
export default function StudentInternshipsRedirect() {
  redirect("/intern");
}
