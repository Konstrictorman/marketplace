/**
 * Initials from the local part of an institutional email, e.g.
 * `karol.beltran@unisabana.edu.co` → `KB` (first letter of each dot-separated segment).
 * Single segment uses the first two letters.
 */
export function initialsFromInstitutionalEmail(email: string): string {
  const local = email.split("@")[0]?.trim().toLowerCase() ?? "";
  if (!local) return "?";
  const segments = local.split(".").filter((s) => s.length > 0);
  if (segments.length >= 2) {
    const a = segments[0]!.charAt(0);
    const b = segments[1]!.charAt(0);
    return (a + b).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "?";
}

/** Fallback when JWT has no `institutionalEmail` (e.g. old token): use display name words. */
export function initialsFromDisplayName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]!.charAt(0) + parts[1]!.charAt(0)).toUpperCase();
  }
  const w = parts[0] ?? "";
  return (w.slice(0, 2) || "?").toUpperCase();
}
