'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import InteractiveMap from '@/components/InteractiveMap';
import PlotDetails from '@/components/PlotDetails';
import InquiryForm from '@/components/InquiryForm';
import FilterPanel from '@/components/FilterPanel';
import BrochureDownload from '@/components/BrochureDownload';
import { Phone, MessageCircle, Menu, X } from 'lucide-react';
import plotData from '../../plot-dimensions.json';

export default function Home() {
    const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
    const [showInquiryForm, setShowInquiryForm] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterFacing, setFilterFacing] = useState('all');
    const [priceRange, setPriceRange] = useState<[number, number]>([2000000, 11000000]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMobileNav, setShowMobileNav] = useState(false);
    const [plotMedia, setPlotMedia] = useState<Record<number, any[]>>({});

    // Fetch media for selected plot
    useEffect(() => {
        if (selectedPlot && !plotMedia[selectedPlot]) {
            fetchPlotMedia(selectedPlot);
        }
    }, [selectedPlot]);

    const fetchPlotMedia = async (plotNumber: number) => {
        try {
            const response = await fetch(`/api/plots/${plotNumber}/media`);
            if (response.ok) {
                const media = await response.json();
                setPlotMedia((prev) => ({
                    ...prev,
                    [plotNumber]: media,
                }));
            }
        } catch (error) {
            console.error('Error fetching plot media:', error);
        }
    };

    const handlePlotSelect = (plotNumber: number) => {
        setSelectedPlot(plotNumber);
    };

    const handleInterested = () => {
        setShowInquiryForm(true);
    };

    const handleDownloadBrochure = () => {
        // BrochureDownload component handles this
    };

    const handlePriceChange = (min: number, max: number) => {
        setPriceRange([min, max]);
    };

    const handleInquiryClose = () => {
        setShowInquiryForm(false);
    };

    return (
        <div className="min-h-screen bg-[#faf7ef]">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-30 bg-[#0b1120] border-b border-[#b8894a] border-opacity-20">
                <div className="container flex items-center justify-between h-20">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-[#e3be86] to-[#b8894a] rounded-lg flex items-center justify-center">
                            <span className="text-lg font-bold text-white">🏘️</span>
                        </div>
                        <div>
                            <p className="text-sm font-mono text-[#b8894a] uppercase tracking-wider">Basava Ganguru</p>
                            <p className="text-xs text-[#f5f1e6]">Residential Layout</p>
                        </div>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <a
                            href="#features"
                            className="text-[#f5f1e6] text-sm font-semibold hover:text-[#e3be86] transition"
                        >
                            Features
                        </a>
                        <a
                            href="#location"
                            className="text-[#f5f1e6] text-sm font-semibold hover:text-[#e3be86] transition"
                        >
                            Location
                        </a>
                        <a
                            href="#contact"
                            className="text-[#f5f1e6] text-sm font-semibold hover:text-[#e3be86] transition"
                        >
                            Contact
                        </a>
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-3">
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="tel:+919980123456"
                            className="flex items-center gap-2 px-4 py-2 bg-[#b8894a] text-white rounded-lg hover:bg-[#e3be86] hover:text-[#0b1120] transition"
                        >
                            <Phone size={16} />
                            <span className="text-sm font-bold">Call</span>
                        </motion.a>
                        <motion.a
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            href="https://wa.me/919980123456"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebd59] transition"
                        >
                            <MessageCircle size={16} />
                            <span className="text-sm font-bold">WhatsApp</span>
                        </motion.a>
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowMobileNav(!showMobileNav)}
                        className="md:hidden p-2 text-[#e3be86]"
                    >
                        {showMobileNav ? <X size={24} /> : <Menu size={24} />}
                    </motion.button>
                </div>

                {/* Mobile Menu */}
                {showMobileNav && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="md:hidden bg-[#131b30] border-t border-[#b8894a] border-opacity-20 p-4 space-y-3"
                    >
                        <a href="#features" className="block text-[#f5f1e6] font-semibold py-2">
                            Features
                        </a>
                        <a href="#location" className="block text-[#f5f1e6] font-semibold py-2">
                            Location
                        </a>
                        <a href="#contact" className="block text-[#f5f1e6] font-semibold py-2">
                            Contact
                        </a>
                        <a
                            href="tel:+919980123456"
                            className="block w-full px-4 py-2 bg-[#b8894a] text-white rounded-lg text-center font-bold"
                        >
                            Call Now
                        </a>
                    </motion.div>
                )}
            </nav>

            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="pt-24 pb-12 bg-gradient-to-br from-[#0b1120] to-[#1b2540] text-[#f5f1e6]"
            >
                <div className="container text-center py-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-5xl md:text-6xl font-bold font-display mb-4"
                    >
                        Your Dream Plot Awaits
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl text-[#e3be86] mb-8 max-w-2xl mx-auto"
                    >
                        32 premium residential plots in Shivamogga with complete infrastructure
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="inline-block px-6 py-3 bg-[#b8894a] text-[#0b1120] rounded-lg font-bold text-lg"
                    >
                        Starting from ₹28.1 Lakhs
                    </motion.div>
                </div>
            </motion.section>

            {/* Main Content - Map and Filters */}
            <div className="flex h-[calc(100vh-120px)] bg-white relative">
                {/* Filter Panel */}
                <FilterPanel
                    onStatusChange={setFilterStatus}
                    onFacingChange={setFilterFacing}
                    onPriceChange={handlePriceChange}
                    onSearchChange={setSearchTerm}
                    selectedStatus={filterStatus}
                    selectedFacing={filterFacing}
                    priceRange={priceRange}
                />

                {/* Interactive Map */}
                <div className="flex-1">
                    <InteractiveMap
                        onPlotSelect={handlePlotSelect}
                        selectedPlot={selectedPlot}
                        filterStatus={filterStatus}
                    />
                </div>
            </div>

            {/* Plot Details Sidebar */}
            {selectedPlot && (
                <PlotDetails
                    plotNumber={selectedPlot}
                    onClose={() => setSelectedPlot(null)}
                    onInterested={handleInterested}
                    onDownloadBrochure={handleDownloadBrochure}
                    media={plotMedia[selectedPlot] || []}
                />
            )}

            {/* Inquiry Form Modal */}
            {showInquiryForm && selectedPlot && (
                <InquiryForm
                    plotNumber={selectedPlot}
                    onClose={handleInquiryClose}
                    onSuccess={() => {
                        // Success handler
                    }}
                />
            )}

            {/* Floating Action Buttons */}
            <div className="fixed bottom-6 right-6 z-20 flex flex-col gap-3">
                <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href="https://wa.me/919980123456"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    title="WhatsApp"
                >
                    <MessageCircle size={24} />
                </motion.a>

                <motion.a
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href="tel:+919980123456"
                    className="flex items-center justify-center w-14 h-14 bg-[#b8894a] text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    title="Call"
                >
                    <Phone size={24} />
                </motion.a>
            </div>

            {/* Footer */}
            <footer className="bg-[#0b1120] text-[#f5f1e6] py-12 border-t border-[#b8894a] border-opacity-20">
                <div className="container">
                    <div className="grid md:grid-cols-3 gap-8 mb-8">
                        <div>
                            <h3 className="text-lg font-bold font-display mb-4 text-[#e3be86]">VCP Developers</h3>
                            <p className="text-sm opacity-75">
                                Building premium residential communities in Shivamogga for over 15 years.
                            </p>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-[#b8894a] mb-4">Quick Links</h4>
                            <ul className="space-y-2 text-sm">
                                <li>
                                    <a href="#features" className="opacity-75 hover:text-[#e3be86] transition">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a href="#location" className="opacity-75 hover:text-[#e3be86] transition">
                                        Location
                                    </a>
                                </li>
                                <li>
                                    <a href="#contact" className="opacity-75 hover:text-[#e3be86] transition">
                                        Contact
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-[#b8894a] mb-4">Contact</h4>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <span>📞</span>
                                    <a href="tel:+919980123456" className="opacity-75 hover:text-[#e3be86] transition">
                                        +91 99801 23456
                                    </a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span>📧</span>
                                    <a href="mailto:info@vcpdevelopers.com" className="opacity-75 hover:text-[#e3be86] transition">
                                        info@vcpdevelopers.com
                                    </a>
                                </li>
                                <li className="flex items-center gap-2">
                                    <span>📍</span>
                                    <span className="opacity-75">Shivamogga, Karnataka</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-[#b8894a] border-opacity-20 pt-8">
                        <p className="text-center text-sm opacity-60">
                            © 2024 Vijayalaxmi C Patil Developers & Promoters. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}