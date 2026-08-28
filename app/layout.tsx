import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Restock",
  description: "Natural-language B2B ordering portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
