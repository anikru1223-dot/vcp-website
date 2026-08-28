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
    "VCP Developers",
    "VCP Developers Shivamogga",
    "VCP Developers and Promoters",
    "Vijayalaxmi C Patil Promoters",
    "Vijayalaxmi C Patil real estate",
    "Vijayalaxmi C Patil builders Shivamogga",

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
    "sites in Shivamogga",
    "plots in Shivamogga",
    "open plots in Shivamogga",
    "vacant sites in Shivamogga",
    "land in Shivamogga",
    "villa plots in Shivamogga",
    "farm land in Shivamogga",
    "agricultural land in Shivamogga",

    // Developer searches
    "real estate developers in Shivamogga",
    "property developers in Shivamogga",
    "residential property developers Shivamogga",
    "layout developers in Shivamogga",
    "residential layout developers Shivamogga",
    "property development Shivamogga",
    "best real estate developers in Shivamogga",
    "top real estate developers in Shivamogga",
    "trusted developers in Shivamogga",
    "real estate company in Shivamogga",
    "real estate agents in Shivamogga",
    "property dealers in Shivamogga",
    "land developers in Shivamogga",
    "plot developers in Shivamogga",

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
    "approved layouts in Shivamogga",
    "SBUDA approved layouts Shivamogga",
    "DTCP approved plots Shivamogga",
    "RERA approved plots Shivamogga",
    "sanctioned layout Shivamogga",
    "upcoming layouts in Shivamogga",
    "newly launched layout Shivamogga",
    "premium layout Shivamogga",

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
    "low cost plots in Shivamogga",
    "cheap plots in Shivamogga",
    "ready to register plots Shivamogga",
    "plots near me Shivamogga",
    "sites near me Shivamogga",
    "book plot in Shivamogga",
    "plot booking Shivamogga",
    "clear title plots Shivamogga",

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
    "20x30 sites in Shivamogga",
    "50x80 sites in Shivamogga",
    "1200 sq ft plots in Shivamogga",
    "1500 sq ft plots in Shivamogga",
    "2000 sq ft plots in Shivamogga",
    "600 sq ft plots in Shivamogga",
    "2400 sq ft plots in Shivamogga",
    "dimension sites in Shivamogga",

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
    "turnkey house construction Shivamogga",
    "individual house construction Shivamogga",
    "villa construction Shivamogga",
    "duplex house construction Shivamogga",
    "civil contractors in Shivamogga",
    "building contractors in Shivamogga",
    "house construction cost Shivamogga",
    "custom home builders Shivamogga",

    // Home loan / property finance
    "home loan assistance Shivamogga",
    "home loan for plot Shivamogga",
    "plot loan Shivamogga",
    "plot and construction loan Shivamogga",
    "property loan Shivamogga",
    "housing loan Shivamogga",
    "home loan Shivamogga",
    "site loan Shivamogga",
    "loan for house construction Shivamogga",
    "bank loan for plot Shivamogga",

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
    "buy plot in Shimoga",
    "buy site in Shimoga",
    "property developers in Shimoga",
    "gated community plots Shimoga",
    "approved layouts in Shimoga",
    "villa plots in Shimoga",
    "VCP Developers Shimoga",

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
    "plots for sale in Vidyanagar Shivamogga",
    "plots for sale in Jayanagar Shivamogga",
    "plots for sale in Basaveshwara Nagar Shivamogga",
    "plots for sale in Ashoka Nagar Shivamogga",
    "plots for sale in Nehru Nagar Shivamogga",
    "plots for sale in Vijayanagar Shivamogga",
    "plots for sale in Sagar Road Shivamogga",
    "plots for sale in Bhadravathi Road Shivamogga",
    "plots for sale in Nidige Shivamogga",
    "plots for sale in Kuvempu Nagar Shivamogga",
    "plots for sale in Purle Shivamogga",
    "plots for sale in Holebenavalli Shivamogga",
    "plots for sale in Vinobanagar Shivamogga",
    "plots for sale in Machenahalli Shivamogga",

    // Nearby towns / district
    "plots for sale in Bhadravathi",
    "residential sites in Bhadravathi",
    "plots for sale in Sagar Karnataka",
    "plots for sale in Sagara",
    "plots for sale in Shikaripura",
    "plots for sale in Soraba",
    "plots for sale in Hosanagara",
    "plots for sale in Thirthahalli",
    "real estate in Shivamogga district",
    "plots in Malnad region",

    // Generic / regional
    "plots for sale in Karnataka",
    "residential plots in Karnataka",
    "real estate developers in Karnataka",
    "buy plot in Karnataka",
    "investment property Karnataka",
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