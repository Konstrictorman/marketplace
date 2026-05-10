import { redirect } from "next/navigation";

/** Old path; canonical route is `/sell/publish`. */
export default function SellNuevoLegacyRedirectPage() {
  redirect("/sell/publish");
}
