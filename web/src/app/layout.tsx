import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import GoogleAnalytics from "@/components/GoogleAnalytics";

// Viewport configuration (separated from metadata in Next.js 14+)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#08080a" },
  ],
};

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://haydihepberaber.com'),
  title: {
    default: "haydi hep beraber - Anonim İtiraf Platformu",
    template: "%s | haydi hep beraber",
  },
  description: "Türkiye'nin en güvenli anonim itiraf platformu. Kimseye söyleyemediğin şeyi buraya bırak. Yalnız değilsin. Binlerce kişi seninle aynı duyguları paylaşıyor.",
  keywords: ["itiraf", "anonim itiraf", "sır paylaşımı", "türkiye itiraf", "anonim sır", "itiraf sitesi", "gizli itiraf", "paylaşım", "destek"],
  authors: [{ name: "haydi hep beraber" }],
  creator: "haydi hep beraber",
  publisher: "haydi hep beraber",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "İtiraf",
  },
  openGraph: {
    title: "haydi hep beraber - Anonim İtiraf Platformu",
    description: "Türkiye'nin en güvenli anonim itiraf platformu. Kimseye söyleyemediğin şeyi buraya bırak. Yalnız değilsin.",
    type: "website",
    locale: "tr_TR",
    url: "https://haydihepberaber.com",
    siteName: "haydi hep beraber",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "haydi hep beraber - Anonim İtiraf Platformu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "haydi hep beraber - Anonim İtiraf Platformu",
    description: "Türkiye'nin en güvenli anonim itiraf platformu. Yalnız değilsin.",
    images: ["/og-image.png"],
    creator: "@haydihepberaber",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
  },
  category: 'social',
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "haydi hep beraber",
  "alternateName": "İtiraf Platformu",
  "url": "https://haydihepberaber.com",
  "description": "Türkiye'nin en güvenli anonim itiraf platformu",
  "inLanguage": "tr-TR",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://haydihepberaber.com/?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  "publisher": {
    "@type": "Organization",
    "name": "haydi hep beraber",
    "url": "https://haydihepberaber.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://haydihepberaber.com/icons/icon-512x512.png"
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        <GoogleAnalytics />
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4657585697913814"
          crossOrigin="anonymous"
        />
        <link rel="canonical" href="https://haydihepberaber.com" />
        <link rel="alternate" hrefLang="tr" href="https://haydihepberaber.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geist.variable} font-sans antialiased`}>
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
