import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import NavBar from "@/components/NavBar/NavBar";
import { CartProvider } from "@/context/CartContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sabana Marketplace",
  description: "Marketplace de la Universidad de La Sabana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        {/* Header */}
        <header style={{
          minHeight: '64px',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '24px',
          paddingRight: '24px',
          backgroundColor: 'rgb(0, 28, 100)',
        }}>
          <Image
            src="/images/unisabana-logo.png"
            alt="Unisabana logo"
            width={100}
            height={40}
            priority
          />
        </header>


        <CartProvider>
          <NavBar />
          <main className="flex-1 flex flex-col" style={{
            backgroundColor: 'rgb(239, 241, 244)',
          }}>
        {children}
        </main>
        </CartProvider>

        {/* Footer */}
        <footer style={{
          minHeight: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          paddingLeft: '24px',
          paddingRight: '24px',
          backgroundColor: 'rgb(0, 28, 100)',
          color: 'rgb(189, 197, 217)',
        }}>
          <span>© Sabana Marketplace</span>
        </footer>

      </body>
    </html>
  );
}