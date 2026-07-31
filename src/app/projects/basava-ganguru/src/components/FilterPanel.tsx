'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown } from 'lucide-react';
import { getPlotStats } from '@/lib/utils';
import plotData from '../../plot-dimensions.json';

interface FilterPanelProps {
    onStatusChange: (status: string) => void;
    onFacingChange: (facing: string) => void;
    onPriceChange: (min: number, max: number) => void;
    onSearchChange: (plotNumber: string) => void;
    selectedStatus: string;
    selectedFacing: string;
    priceRange: [number, number];
}

const FACINGS = ['North', 'South', 'East', 'West', 'NE', 'NW', 'SE', 'SW'];

export default function FilterPanel({
    onStatusChange,
    onFacingChange,
    onPriceChange,
    onSearchChange,
    selectedStatus,
    selectedFacing,
    priceRange,
}: FilterPanelProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isExpanded, setIsExpanded] = useState(true);

    const stats = getPlotStats(plotData.plots);
    const minPrice = Math.floor(stats.minPrice / 100000) * 100000;
    const maxPrice = Math.ceil(stats.maxPrice / 100000) * 100000;

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        onSearchChange(value);
    };

    const handlePriceRangeChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        type: 'min' | 'max'
    ) => {
        const value = parseInt(e.target.value);
        if (type === 'min') {
            onPriceChange(value, priceRange[1]);
        } else {
            onPriceChange(priceRange[0], value);
        }
    };

    return (
        <motion.div
            className="w-full max-w-xs bg-[#faf7ef] border-l border-[#b8894a] border-opacity-20 flex flex-col h-screen"
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            transition={{ type: 'spring', damping: 30 }}
        >
            {/* Header */}
            <motion.div className="p-6 border-b border-[#b8894a] border-opacity-20">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-[#0b1120] font-display">Filters</h2>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1 hover:bg-[#e3be86] hover:bg-opacity-20 rounded transition"
                    >
                        <ChevronDown
                            size={20}
                            className={`text-[#8f6a38] transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </motion.button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#e3be86] bg-opacity-10 p-2 rounded">
                        <p className="text-[#8f6a38]">Available</p>
                        <p className="text-lg font-bold text-[#0b1120]">{stats.available}</p>
                    </div>
                    <div className="bg-[#4b5c42] bg-opacity-10 p-2 rounded">
                        <p className="text-[#4b5c42]">Sold</p>
                        <p className="text-lg font-bold text-[#0b1120]">{stats.sold}</p>
                    </div>
                </div>
            </motion.div>

            {/* Scrollable Content */}
            <motion.div
                className="flex-1 overflow-y-auto p-6 space-y-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ delay: 0.1 }}
            >
                {/* Search by Plot Number */}
                <div>
                    <label className="block text-xs font-mono text-[#8f6a38] uppercase tracking-widest mb-3">
                        Search Plot
                    </label>
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-3 text-[#b8894a]" />
                        <input
                            type="text"
                            placeholder="Plot number..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full pl-9 pr-4 py-2 border border-[#b8894a] border-opacity-30 rounded-lg focus:outline-none focus:border-[#b8894a] focus:ring-2 focus:ring-[#b8894a] focus:ring-opacity-10 text-sm"
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <div>
                    <label className="block text-xs font-mono text-[#8f6a38] uppercase tracking-widest mb-3">
                        Plot Status
                    </label>
                    <div className="space-y-2">
                        {['all', 'available', 'sold', 'reserved'].map((status) => (
                            <motion.label
                                key={status}
                                whileHover={{ x: 4 }}
                                className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-[#e3be86] hover:bg-opacity-10 transition"
                            >
                                <input
                                    type="radio"
                                    name="status"
                                    value={status}
                                    checked={selectedStatus === status}
                                    onChange={(e) => onStatusChange(e.target.value)}
                                    className="w-4 h-4 accent-[#b8894a]"
                                />
                                <span className="ml-3 text-sm text-[#0b1120] capitalize font-medium">
                                    {status === 'all' ? 'All Plots' : status}
                                </span>
                                <span className="ml-auto text-xs text-[#8f6a38] font-mono">
                                    {status === 'all'
                                        ? stats.total
                                        : status === 'available'
                                            ? stats.available
                                            : status === 'sold'
                                                ? stats.sold
                                                : stats.reserved}
                                </span>
                            </motion.label>
                        ))}
                    </div>
                </div>

                {/* Facing Filter */}
                <div>
                    <label className="block text-xs font-mono text-[#8f6a38] uppercase tracking-widest mb-3">
                        Plot Facing
                    </label>
                    <div className="space-y-2">
                        {['all', ...FACINGS].map((facing) => (
                            <motion.label
                                key={facing}
                                whileHover={{ x: 4 }}
                                className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-[#e3be86] hover:bg-opacity-10 transition"
                            >
                                <input
                                    type="radio"
                                    name="facing"
                                    value={facing}
                                    checked={selectedFacing === facing}
                                    onChange={(e) => onFacingChange(e.target.value)}
                                    className="w-4 h-4 accent-[#b8894a]"
                                />
                                <span className="ml-3 text-sm text-[#0b1120] font-medium">
                                    {facing === 'all' ? 'All Directions' : facing}
                                </span>
                                {facing !== 'all' && (
                                    <span className="ml-auto text-xs text-[#8f6a38] font-mono">
                                        {plotData.plots.filter((p) => p.facing === facing).length}
                                    </span>
                                )}
                            </motion.label>
                        ))}
                    </div>
                </div>

                {/* Price Range */}
                <div>
                    <label className="block text-xs font-mono text-[#8f6a38] uppercase tracking-widest mb-3">
                        Price Range
                    </label>
                    <div className="space-y-4">
                        {/* Minimum Price */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-[#0b1120] font-bold">Min</span>
                                <span className="text-sm text-[#b8894a] font-bold">
                                    ₹{(priceRange[0] / 100000).toFixed(1)}L
                                </span>
                            </div>
                            <input
                                type="range"
                                min={minPrice}
                                max={maxPrice}
                                value={priceRange[0]}
                                onChange={(e) => handlePriceRangeChange(e, 'min')}
                                className="w-full accent-[#b8894a]"
                            />
                        </div>

                        {/* Maximum Price */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-[#0b1120] font-bold">Max</span>
                                <span className="text-sm text-[#b8894a] font-bold">
                                    ₹{(priceRange[1] / 100000).toFixed(1)}L
                                </span>
                            </div>
                            <input
                                type="range"
                                min={minPrice}
                                max={maxPrice}
                                value={priceRange[1]}
                                onChange={(e) => handlePriceRangeChange(e, 'max')}
                                className="w-full accent-[#b8894a]"
                            />
                        </div>
                    </div>
                </div>

                {/* Statistics */}
                <motion.div
                    className="p-4 bg-[#e3be86] bg-opacity-10 border border-[#b8894a] border-opacity-20 rounded-lg mt-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <p className="text-xs font-mono text-[#8f6a38] uppercase tracking-widest mb-3">
                        Pricing Overview
                    </p>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-[#0b1120]">Average Price:</span>
                            <span className="font-bold text-[#b8894a]">₹{(stats.avgPrice / 100000).toFixed(1)}L</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-[#0b1120]">Price Range:</span>
                            <span className="font-bold text-[#b8894a]">
                                ₹{(stats.minPrice / 100000).toFixed(1)}L - ₹{(stats.maxPrice / 100000).toFixed(1)}L
                            </span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Footer Info */}
            <div className="p-6 border-t border-[#b8894a] border-opacity-20 bg-[#f5f1e6]">
                <p className="text-xs text-[#8f6a38] leading-relaxed">
                    💡 <strong>Pro Tip:</strong> Click on plots in the map to view detailed information and download brochures.
                </p>
            </div>
        </motion.div>
    );
}