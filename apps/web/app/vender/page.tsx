import { redirect } from "next/navigation";

/** Old path; canonical route is `/sell`. */
export default function VenderLegacyRedirectPage() {
  redirect("/sell");
}
