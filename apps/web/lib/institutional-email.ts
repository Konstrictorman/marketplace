/** Institutional email domain (Universidad de La Sabana). */
export const INSTITUTIONAL_EMAIL_DOMAIN = "@unisabana.edu.co" as const;

/**
 * Builds a full institutional email: if the user entered only the local part,
 * appends {@link INSTITUTIONAL_EMAIL_DOMAIN}; if they already included `@`, returns trimmed lowercase as-is.
 */
export function buildInstitutionalEmail(localOrFull: string): string {
  const trimmed = localOrFull.trim().toLowerCase();
  if (trimmed.includes("@")) {
    return trimmed;
  }
  if (!trimmed) {
    return "";
  }
  return `${trimmed}${INSTITUTIONAL_EMAIL_DOMAIN}`;
}
