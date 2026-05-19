import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not authorized · Sabana Marketplace",
  description: "You do not have permission to access this page",
};

export default function UnauthorizedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
