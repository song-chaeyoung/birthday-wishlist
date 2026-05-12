import type { Metadata } from "next";
import { wishlistTitle } from "@/src/lib/profile";
import "./globals.css";

const wishlistDescription = "귀여운 생일 위시를 함께 채워주세요.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ),
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
      <body className="min-h-full">{children}</body>
    </html>
  );
}
