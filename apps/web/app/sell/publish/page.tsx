import { redirect } from "next/navigation";

/**
 * Listing creation runs from the modal on `/sell`. This path exists for bookmarks
 * and redirects to the seller dashboard.
 */
export default function SellPublishRedirectPage() {
  redirect("/sell");
}
