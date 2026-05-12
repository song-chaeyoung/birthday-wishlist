import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { wishlistDescription, wishlistTitle } from "@/src/lib/profile";
import { getSiteUrl } from "@/src/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: getSiteUrl(),
  title: wishlistTitle,
  description: wishlistDescription,
  openGraph: {
    title: wishlistTitle,
    description: wishlistDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: wishlistTitle,
    description: wishlistDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
