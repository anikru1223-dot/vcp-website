import type { Metadata } from 'next';
import { Bricolage_Grotesque, Manrope, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const display = Bricolage_Grotesque({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-display',
});

const body = Manrope({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700', '800'],
    variable: '--font-body',
});

const mono = IBM_Plex_Mono({
    subsets: ['latin'],
    weight: ['400', '500', '600'],
    variable: '--font-mono',
});

export const metadata: Metadata = {
    title: 'Basava Ganguru Residential Layout | VCP Developers',
    description:
        'Premium residential plots in Shivamogga. 32 plots starting from ₹2,300/sq.ft. Wide roads, modern infrastructure, and excellent connectivity. Book your plot today!',
    keywords: [
        'residential plots',
        'Shivamogga',
        'real estate',
        'property investment',
        'Basava Ganguru',
        'VCP Developers',
    ],
    openGraph: {
        title: 'Basava Ganguru Residential Layout',
        description: 'Premium residential layout in Shivamogga, Karnataka',
        type: 'website',
        url: 'https://basava-ganguru.vcpdevelopers.com',
        images: [
            {
                url: '/og-image.jpg',
                width: 1200,
                height: 630,
            },
        ],
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link rel="icon" href="/favicon.ico" />
                <meta name="theme-color" content="#0b1120" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body className={`${display.variable} ${body.variable} ${mono.variable}`}>
                {children}
            </body>
        </html>
    );
}