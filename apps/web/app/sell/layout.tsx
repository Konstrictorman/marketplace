import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Selling · Marketplace",
  description: "Manage your published listings",
};

export default function SellLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
