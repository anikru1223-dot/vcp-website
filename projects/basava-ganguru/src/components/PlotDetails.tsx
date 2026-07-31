'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Ruler, IndianRupee, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { calculatePlotPrice, formatPrice, formatArea } from '@/lib/utils';
import plotData from '../../plot-dimensions.json';

interface PlotDetailsProps {
    plotNumber: number | null;
    onClose: () => void;
    onInterested: () => void;
    onDownloadBrochure: () => void;
    media?: Array<{ id: string; media_type: 'photo' | 'video'; file_url: string }>;
}

export default function PlotDetails({
    plotNumber,
    onClose,
    onInterested,
    onDownloadBrochure,
    media = [],
}: PlotDetailsProps) {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    if (!plotNumber) return null;

    const plot = plotData.plots.find((p) => p.number === plotNumber);
    if (!plot) return null;

    const totalPrice = calculatePlotPrice(plot.area_sqft);
    const photos = media.filter((m) => m.media_type === 'photo');
    const videos = media.filter((m) => m.media_type === 'video');
    const allMedia = [...photos, ...videos];

    const handleNextMedia = () => {
        setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
        setIsVideoPlaying(false);
    };

    const handlePrevMedia = () => {
        setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
        setIsVideoPlaying(false);
    };

    const currentMedia = allMedia[currentMediaIndex];
    const hasMedia = allMedia.length > 0;

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 bg-black bg-opacity-50 z-40"
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            />

            <motion.div
                className="fixed right-0 top-0 h-screen w-full max-w-md bg-[#faf7ef] shadow-2xl z-50 overflow-y-auto"
                initial={{ x: 400 }}
                animate={{ x: 0 }}
                exit={{ x: 400 }}
                transition={{ type: 'spring', damping: 30 }}
            >
                {/* Close Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 bg-[#b8894a] text-white rounded-full z-10"
                >
                    <X size={20} />
                </motion.button>

                {/* Media Section */}
                <div className="relative w-full h-64 bg-gradient-to-br from-[#0b1120] to-[#1b2540] overflow-hidden">
                    {hasMedia ? (
                        <>
                            {currentMedia?.media_type === 'video' && !isVideoPlaying ? (
                                <div className="w-full h-full flex items-center justify-center cursor-pointer">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsVideoPlaying(true)}
                                        className="p-4 bg-[#b8894a] text-white rounded-full"
                                    >
                                        <Play size={32} fill="#fff" />
                                    </motion.button>
                                </div>
                            ) : currentMedia?.media_type === 'video' && isVideoPlaying ? (
                                <video
                                    src={currentMedia.file_url}
                                    controls
                                    autoPlay
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src={currentMedia?.file_url || '/placeholder.jpg'}
                                    alt={`Plot ${plotNumber}`}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Navigation Arrows */}
                            {allMedia.length > 1 && (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handlePrevMedia}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                                    >
                                        <ChevronLeft size={20} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleNextMedia}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75"
                                    >
                                        <ChevronRight size={20} />
                                    </motion.button>

                                    {/* Media Counter */}
                                    <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                                        {currentMediaIndex + 1} / {allMedia.length}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#b8894a]">
                            <div className="text-center">
                                <Ruler size={48} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No photos yet</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-8">
                    {/* Plot Number Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mb-6"
                    >
                        <h2 className="text-4xl font-bold text-[#0b1120] mb-2 font-display">
                            Plot {plotNumber}
                        </h2>
                        <div className="flex items-center gap-2 text-sm text-[#8f6a38]">
                            <span className="px-3 py-1 bg-[#e3be86] text-[#0b1120] rounded-full font-bold">
                                {plot.facing} Facing
                            </span>
                        </div>
                    </motion.div>

                    {/* Plot Specifications */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="space-y-4 mb-8 pb-8 border-b border-[#b8894a] border-opacity-30"
                    >
                        {/* Dimensions */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#e3be86] bg-opacity-20 rounded-lg">
                                <Ruler size={20} className="text-[#8f6a38]" />
                            </div>
                            <div>
                                <p className="text-xs font-mono text-[#8f6a38] uppercase">Dimensions</p>
                                <p className="text-lg font-bold text-[#0b1120]">
                                    {plot.width}m × {plot.depth}m
                                </p>
                            </div>
                        </div>

                        {/* Area */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#e3be86] bg-opacity-20 rounded-lg">
                                <Ruler size={20} className="text-[#8f6a38]" />
                            </div>
                            <div>
                                <p className="text-xs font-mono text-[#8f6a38] uppercase">Plot Area</p>
                                <p className="text-lg font-bold text-[#0b1120]">{formatArea(plot.area_sqft)}</p>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#b8894a] bg-opacity-20 rounded-lg">
                                <IndianRupee size={20} className="text-[#8f6a38]" />
                            </div>
                            <div>
                                <p className="text-xs font-mono text-[#8f6a38] uppercase">Total Price</p>
                                <p className="text-lg font-bold text-[#0b1120]">{formatPrice(totalPrice)}</p>
                                <p className="text-xs text-[#8f6a38] mt-1">₹2,300 per sq.ft</p>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-[#e3be86] bg-opacity-20 rounded-lg">
                                <MapPin size={20} className="text-[#8f6a38]" />
                            </div>
                            <div>
                                <p className="text-xs font-mono text-[#8f6a38] uppercase">Location</p>
                                <p className="text-sm text-[#0b1120]">Basava Ganguru, Shivamogga</p>
                                <a
                                    href={`https://maps.google.com/?q=13.9299,75.5681`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#b8894a] hover:text-[#8f6a38] transition mt-1 inline-block"
                                >
                                    View on Map →
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    {/* Features */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <h3 className="text-sm font-bold text-[#0b1120] uppercase tracking-widest mb-4 font-mono">
                            Premium Features
                        </h3>
                        <ul className="space-y-2 text-sm text-[#57544c]">
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#b8894a] rounded-full" />
                                Wide Roads (40ft & 30ft)
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#b8894a] rounded-full" />
                                24x7 Electricity Supply
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#b8894a] rounded-full" />
                                Underground Drainage System
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#b8894a] rounded-full" />
                                Dedicated Park & Landscaping
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-[#b8894a] rounded-full" />
                                Ready for Registration
                            </li>
                        </ul>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="space-y-3"
                    >
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onInterested}
                            className="w-full py-4 bg-gradient-to-r from-[#e3be86] to-[#b8894a] text-[#0b1120] font-bold rounded-lg hover:shadow-lg transition-all uppercase tracking-wider"
                        >
                            I'm Interested
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onDownloadBrochure}
                            className="w-full py-4 border-2 border-[#b8894a] text-[#0b1120] font-bold rounded-lg hover:bg-[#e3be86] hover:bg-opacity-10 transition-all uppercase tracking-wider"
                        >
                            Download Brochure
                        </motion.button>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 p-4 bg-[#e3be86] bg-opacity-10 rounded-lg border border-[#b8894a] border-opacity-20"
                    >
                        <p className="text-xs text-[#8f6a38] uppercase tracking-widest font-mono mb-2">
                            Need Help?
                        </p>
                        <p className="text-sm font-bold text-[#0b1120] mb-1">+91 99801 23456</p>
                        <p className="text-xs text-[#57544c]">Available 24/7 for inquiries</p>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}