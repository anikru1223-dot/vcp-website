import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  "https://vijayalaxmicpatildevelopersandpromoters.com";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,

  name: "Vijayalaxmi C Patil Developers & Promoters",

  alternateName: [
    "Vijayalaxmi C Patil Developers",
    "Vijayalaxmi C Patil Developers Shivamogga",
    "Vijayalaxmi Developers Shivamogga",
    "Vijayalaxmi Patil Developers",
  ],

  url: siteUrl,

  description:
    "Vijayalaxmi C Patil Developers & Promoters is a real estate development and property services company offering residential plots, residential layouts, property solutions, home loans and house construction services in Shivamogga, Karnataka.",

  areaServed: [
    {
      "@type": "City",
      name: "Shivamogga",
      addressCountry: "IN",
    },
    {
      "@type": "AdministrativeArea",
      name: "Shivamogga district",
      addressCountry: "IN",
    },
    {
      "@type": "State",
      name: "Karnataka",
      addressCountry: "IN",
    },
  ],

  address: {
    "@type": "PostalAddress",
    addressLocality: "Shivamogga",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,

  url: siteUrl,

  name: "Vijayalaxmi C Patil Developers & Promoters",

  alternateName:
    "Vijayalaxmi C Patil Developers Shivamogga",

  description:
    "Official website of Vijayalaxmi C Patil Developers & Promoters for residential plots, layouts, property services and house construction in Shivamogga, Karnataka.",

  publisher: {
    "@id": `${siteUrl}/#organization`,
  },

  inLanguage: "en-IN",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default:
      "Vijayalaxmi C Patil Developers & Promoters | Real Estate & Plots in Shivamogga",
    template:
      "%s | Vijayalaxmi C Patil Developers & Promoters",
  },

  description:
    "Vijayalaxmi C Patil Developers & Promoters offers residential plots, residential layouts, property solutions, home loans and house construction services in Shivamogga, Karnataka.",

  keywords: [
    // Brand
    "Vijayalaxmi C Patil Developers",
    "Vijayalaxmi C Patil Developers & Promoters",
    "Vijayalaxmi C Patil Developers Shivamogga",
    "Vijayalaxmi C Patil Developers and Promoters",
    "Vijayalaxmi Developers Shivamogga",
    "Vijayalaxmi Patil Developers",
    "Vijayalaxmi Patil Developers Shivamogga",

    // Main property searches
    "plots for sale in Shivamogga",
    "sites for sale in Shivamogga",
    "residential plots in Shivamogga",
    "residential sites in Shivamogga",
    "residential land for sale in Shivamogga",
    "land for sale in Shivamogga",
    "property for sale in Shivamogga",
    "property in Shivamogga",
    "properties in Shivamogga",
    "real estate in Shivamogga",

    // Developer searches
    "real estate developers in Shivamogga",
    "property developers in Shivamogga",
    "residential property developers Shivamogga",
    "layout developers in Shivamogga",
    "residential layout developers Shivamogga",
    "property development Shivamogga",

    // Layout searches
    "residential layouts in Shivamogga",
    "residential layout Shivamogga",
    "layouts for sale in Shivamogga",
    "new layouts in Shivamogga",
    "new residential layout Shivamogga",
    "developed plots in Shivamogga",
    "residential layout plots Shivamogga",
    "premium residential plots Shivamogga",
    "gated community plots Shivamogga",
    "gated community layout Shivamogga",

    // Buyer intent
    "buy plot in Shivamogga",
    "buy site in Shivamogga",
    "buy land in Shivamogga",
    "buy residential plot Shivamogga",
    "best plots in Shivamogga",
    "best residential plots in Shivamogga",
    "affordable plots in Shivamogga",
    "affordable sites in Shivamogga",
    "budget plots in Shivamogga",
    "investment plots in Shivamogga",
    "property investment Shivamogga",
    "land investment Shivamogga",

    // Plot types
    "corner plots in Shivamogga",
    "corner sites in Shivamogga",
    "east facing plots in Shivamogga",
    "west facing plots in Shivamogga",
    "north facing plots in Shivamogga",
    "south facing plots in Shivamogga",
    "road facing plots Shivamogga",
    "30x40 sites in Shivamogga",
    "30x50 sites in Shivamogga",
    "40x60 sites in Shivamogga",
    "1200 sq ft plots in Shivamogga",
    "1500 sq ft plots in Shivamogga",
    "2000 sq ft plots in Shivamogga",

    // Construction
    "house construction in Shivamogga",
    "home construction in Shivamogga",
    "house builders in Shivamogga",
    "home builders in Shivamogga",
    "construction company in Shivamogga",
    "house construction company Shivamogga",
    "residential construction Shivamogga",
    "house construction services Shivamogga",
    "plot and house construction Shivamogga",

    // Home loan / property finance
    "home loan assistance Shivamogga",
    "home loan for plot Shivamogga",
    "plot loan Shivamogga",
    "plot and construction loan Shivamogga",
    "property loan Shivamogga",

    // Shimoga spelling
    "plots for sale in Shimoga",
    "sites for sale in Shimoga",
    "residential plots in Shimoga",
    "residential sites in Shimoga",
    "land for sale in Shimoga",
    "property for sale in Shimoga",
    "real estate in Shimoga",
    "real estate developers in Shimoga",
    "layout developers in Shimoga",
    "residential layouts in Shimoga",
    "house construction in Shimoga",
    "Vijayalaxmi Developers Shimoga",

    // Shivamogga localities
    "plots for sale in Vinoba Nagar Shivamogga",
    "plots for sale in Bommanakatte Shivamogga",
    "plots for sale in Thyavarekoppa Shivamogga",
    "plots for sale in KR Puram Shivamogga",
    "plots for sale in Gadikoppa Shivamogga",
    "plots for sale in Gopala Gowda Extension Shivamogga",
    "plots for sale in Navule Shivamogga",
    "plots for sale in Hosamane Shivamogga",
    "plots for sale in Sominakoppa Shivamogga",
    "plots for sale in Ravindra Nagara Shivamogga",
    "plots for sale in Shanthi Nagar Shivamogga",
  ],

  authors: [
    {
      name: "Vijayalaxmi C Patil Developers & Promoters",
    },
  ],

  creator:
    "Vijayalaxmi C Patil Developers & Promoters",

  publisher:
    "Vijayalaxmi C Patil Developers & Promoters",

  alternates: {
    canonical: siteUrl,
  },

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName:
      "Vijayalaxmi C Patil Developers & Promoters",

    title:
      "Vijayalaxmi C Patil Developers & Promoters | Real Estate & Plots in Shivamogga",

    description:
      "Residential plots, residential layouts, property solutions, home loans and house construction services in Shivamogga, Karnataka.",
  },

  twitter: {
    card: "summary_large_image",

    title:
      "Vijayalaxmi C Patil Developers & Promoters | Shivamogga",

    description:
      "Residential plots, layouts, property solutions and house construction services in Shivamogga, Karnataka.",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />

        {/* Website Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>

      <body className="min-h-full flex flex-col">
        {children}

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6DEW5S7VTN"
          strategy="afterInteractive"
        />

        <Script
          id="google-analytics"
          strategy="afterInteractive"
        >
          {`
            window.dataLayer = window.dataLayer || [];

            function gtag() {
              window.dataLayer.push(arguments);
            }

            gtag('js', new Date());

            gtag('config', 'G-6DEW5S7VTN');
          `}
        </Script>
      </body>
    </html>
  );
}