import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import "@/app/globals.css";

const SITE_URL = "https://yildiztenis.com";
const SITE_NAME = "Yıldız Tenis";
const DESCRIPTION =
  "YTÜ öğrencileri, mezunları ve partner okullar için tenis workshop, etkinlik ve topluluk platformu.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    "tenis",
    "workshop",
    "YTÜ",
    "Yıldız Teknik Üniversitesi",
    "tenis kursu",
    "tenis topluluğu",
    "İstanbul tenis",
    "üniversite tenis",
    "tenis etkinlik",
    "tenis eğitim",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SportsOrganization",
              name: SITE_NAME,
              url: SITE_URL,
              logo: `${SITE_URL}/images/yildiz-tenis-logo-round.png`,
              description: DESCRIPTION,
              sport: "Tennis",
              address: {
                "@type": "PostalAddress",
                addressLocality: "İstanbul",
                addressCountry: "TR",
              },
              parentOrganization: {
                "@type": "CollegeOrUniversity",
                name: "Yıldız Teknik Üniversitesi",
              },
              sameAs: [],
            }),
          }}
        />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
