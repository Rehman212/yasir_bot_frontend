import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SheetPress — Publish WordPress Articles From Spreadsheets",
    template: "%s · SheetPress",
  },
  description:
    "Upload your articles, connect WordPress, and publish or schedule all your content in a few clicks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-outfit)] text-foreground">
        {children}
      </body>
    </html>
  );
}
