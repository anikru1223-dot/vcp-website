import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                ink: '#0b1120',
                'ink-soft': '#131b30',
                'ink-softer': '#1b2540',
                linen: '#f5f1e6',
                'linen-soft': '#ece5d4',
                paper: '#faf7ef',
                brass: '#b8894a',
                'brass-light': '#e3be86',
                'brass-dark': '#8f6a38',
                moss: '#4b5c42',
                'moss-light': '#7c8f6e',
                graphite: '#2b2a26',
                'graphite-soft': '#57544c',
                mist: '#e7e1d2',
            },
            fontFamily: {
                display: ['var(--font-display)', 'sans-serif'],
                body: ['var(--font-body)', 'sans-serif'],
                mono: ['var(--font-mono)', 'monospace'],
            },
            spacing: {
                128: '32rem',
                144: '36rem',
            },
            borderRadius: {
                '4xl': '2rem',
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'fade-in-up': 'fadeInUp 0.6s ease-out',
                'fade-in': 'fadeIn 0.6s ease-out',
                'slide-in-right': 'slideInRight 0.6s ease-out',
            },
            keyframes: {
                fadeInUp: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateY(20px)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateY(0)',
                    },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideInRight: {
                    '0%': {
                        opacity: '0',
                        transform: 'translateX(20px)',
                    },
                    '100%': {
                        opacity: '1',
                        transform: 'translateX(0)',
                    },
                },
            },
        },
    },
    plugins: [],
};

export default config;