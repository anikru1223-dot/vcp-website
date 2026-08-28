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

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://vijayalaxmicpatildevelopersandpromoters.com"
  ),

  title: {
    default: "Vijayalaxmi C Patil Developers & Promoters | Shivamogga",
    template: "%s | Vijayalaxmi C Patil Developers & Promoters",
  },

  description:
    "Vijayalaxmi C Patil Developers & Promoters offers residential layouts, premium plots, home loans and complete house construction services in Shivamogga, Karnataka.",

  keywords: [
    "Vijayalaxmi C Patil Developers",
    "Vijayalaxmi C Patil Developers and Promoters",
    "real estate developers Shivamogga",
    "residential plots Shivamogga",
    "plots for sale Shivamogga",
    "residential layout Shivamogga",
    "property developers Shivamogga",
    "house construction Shivamogga",
    "home loans Shivamogga",
    "real estate Karnataka",
  ],

  authors: [
    {
      name: "Vijayalaxmi C Patil Developers & Promoters",
    },
  ],

  creator: "Vijayalaxmi C Patil Developers & Promoters",
  publisher: "Vijayalaxmi C Patil Developers & Promoters",

  alternates: {
    canonical: "/",
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
    url: "https://vijayalaxmicpatildevelopersandpromoters.com/",
    siteName: "Vijayalaxmi C Patil Developers & Promoters",
    title: "Vijayalaxmi C Patil Developers & Promoters | Shivamogga",
    description:
      "Premium residential layouts, plots, home loans and complete house construction services in Shivamogga, Karnataka.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Vijayalaxmi C Patil Developers & Promoters | Shivamogga",
    description:
      "Premium residential layouts, plots, home loans and complete house construction services in Shivamogga, Karnataka.",
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
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6DEW5S7VTN"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-6DEW5S7VTN');
          `}
        </Script>
      </body>
    </html>
  );
}