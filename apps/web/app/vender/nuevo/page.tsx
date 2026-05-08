import { redirect } from "next/navigation";

/** La creación se hace desde el modal en `/vender`. Esta ruta mantiene compatibilidad. */
export default function VenderNuevoRedirectPage() {
  redirect("/vender");
}
