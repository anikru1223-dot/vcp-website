'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

    useEffect(() => {
        // Check authentication
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        setIsAuthenticated(true);
        setIsLoading(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        router.push('/admin/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#faf7ef] flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
                    <div className="w-12 h-12 border-4 border-[#b8894a] border-t-[#e3be86] rounded-full" />
                </motion.div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#faf7ef]">
            {/* Admin Header */}
            <header className="sticky top-0 z-40 bg-[#0b1120] border-b border-[#b8894a] border-opacity-20">
                <div className="container flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#e3be86] to-[#b8894a] rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-white">🏘️</span>
                        </div>
                        <div>
                            <p className="text-sm font-mono text-[#b8894a] uppercase tracking-wider">Basava Ganguru</p>
                            <p className="text-xs text-[#f5f1e6]">Admin Dashboard</p>
                        </div>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <a
                            href="/admin/dashboard"
                            className="text-[#f5f1e6] text-sm font-semibold hover:text-[#e3be86] transition"
                        >
                            Dashboard
                        </a>
                        <a
                            href="/admin/dashboard?tab=plots"
                            className="text-[#f5f1e6] text-sm font-semibold hover:text-[#e3be86] transition"
                        >
                            Plots
                        </a>
                        <a
                            href="/admin/dashboard?tab=inquiries"
                            className="text-[#f5f1e6] text-sm font-semibold hover:text-[#e3be86] transition"
                        >
                            Inquiries
                        </a>
                    </nav>

                    {/* Logout Button */}
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleLogout}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold text-sm"
                        >
                            <LogOut size={16} />
                            Logout
                        </motion.button>

                        {/* Mobile Menu Button */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden p-2 text-[#e3be86]"
                        >
                            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden bg-[#131b30] border-t border-[#b8894a] border-opacity-20 p-4 space-y-3"
                    >
                        <a
                            href="/admin/dashboard"
                            className="block text-[#f5f1e6] font-semibold py-2 hover:text-[#e3be86]"
                        >
                            Dashboard
                        </a>
                        <a
                            href="/admin/dashboard?tab=plots"
                            className="block text-[#f5f1e6] font-semibold py-2 hover:text-[#e3be86]"
                        >
                            Plots
                        </a>
                        <a
                            href="/admin/dashboard?tab=inquiries"
                            className="block text-[#f5f1e6] font-semibold py-2 hover:text-[#e3be86]"
                        >
                            Inquiries
                        </a>
                        <button
                            onClick={handleLogout}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-center font-bold"
                        >
                            Logout
                        </button>
                    </motion.div>
                )}
            </header>

            {/* Main Content */}
            <main className="container py-8">
                {children}
            </main>
        </div>
    );
}