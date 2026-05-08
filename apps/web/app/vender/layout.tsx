import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Selling · Marketplace",
  description: "Manage your published listings",
};

export default function VenderLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
