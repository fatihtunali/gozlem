import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "haydi hep beraber - itiraf duvarı",
  description: "Kimseye söyleyemediğin şeyi buraya bırak. Yalnız değilsin.",
  keywords: ["itiraf", "anonim", "sır", "paylaşım", "türkiye"],
  openGraph: {
    title: "haydi hep beraber",
    description: "Kimseye söyleyemediğin şeyi buraya bırak. Yalnız değilsin.",
    type: "website",
    locale: "tr_TR",
  },
  twitter: {
    card: "summary_large_image",
    title: "haydi hep beraber",
    description: "Kimseye söyleyemediğin şeyi buraya bırak. Yalnız değilsin.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${geist.variable} font-sans antialiased bg-[#0a0a0b]`}>
        {children}
      </body>
    </html>
  );
}
