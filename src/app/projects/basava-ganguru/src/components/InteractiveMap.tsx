'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import plotData from '../../plot-dimensions.json';

interface Plot {
    id: number;
    number: number;
    x: number;
    y: number;
    width: number;
    height: number;
    area_sqft: number;
    facing: string;
    status: 'available' | 'sold' | 'reserved';
}

interface InteractiveMapProps {
    onPlotSelect: (plotNumber: number) => void;
    selectedPlot: number | null;
    filterStatus?: string;
}

export default function InteractiveMap({
    onPlotSelect,
    selectedPlot,
    filterStatus = 'all',
}: InteractiveMapProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [plots, setPlots] = useState<Plot[]>([]);

    // Initialize plots with positions
    useEffect(() => {
        const initPlots: Plot[] = [];
        const cols = 8;
        const plotWidth = 80;
        const plotHeight = 100;
        const padding = 30;

        plotData.plots.forEach((plot, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;

            initPlots.push({
                id: plot.id,
                number: plot.number,
                x: col * (plotWidth + padding) + padding,
                y: row * (plotHeight + padding) + padding,
                width: plotWidth,
                height: plotHeight,
                area_sqft: plot.area_sqft,
                facing: plot.facing,
                status: plot.status as Plot['status'],
            });
        });

        setPlots(initPlots);
    }, []);

    // Handle mouse wheel zoom
    const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
        e.preventDefault();
        const zoomSpeed = 0.1;
        const newZoom = e.deltaY > 0 ? zoom - zoomSpeed : zoom + zoomSpeed;
        setZoom(Math.max(0.5, Math.min(newZoom, 3)));
    };

    // Handle pan with mouse drag
    const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        if (e.button !== 0) return; // Left click only
        setIsDragging(true);
        setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!isDragging) return;
        setPan({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Reset zoom and pan
    const handleReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    // Zoom controls
    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3));
    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));

    // Filter plots based on status
    const filteredPlots =
        filterStatus === 'all'
            ? plots
            : plots.filter((plot) => plot.status === filterStatus);

    return (
        <div className="relative w-full h-screen bg-gradient-to-br from-[#0b1120] to-[#1b2540]">
            {/* SVG Canvas */}
            <svg
                ref={svgRef}
                className="w-full h-full cursor-grab active:cursor-grabbing"
                viewBox="0 0 1000 1300"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <defs>
                    <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#b8894a" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#e3be86" stopOpacity="0.05" />
                    </linearGradient>

                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#b8894a" strokeWidth="0.5" opacity="0.1" />
                    </pattern>

                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background Grid */}
                <rect width="1000" height="1300" fill="url(#grid)" />
                <rect width="1000" height="1300" fill="url(#gridGradient)" />

                {/* Transform group for zoom and pan */}
                <g
                    transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}
                    style={{ transformOrigin: '500px 650px' }}
                >
                    {/* Roads and Boundaries */}
                    <rect
                        x="20"
                        y="20"
                        width="960"
                        height="1260"
                        fill="none"
                        stroke="#b8894a"
                        strokeWidth="2"
                        opacity="0.5"
                    />

                    {/* Main Road Labels */}
                    <text
                        x="500"
                        y="60"
                        textAnchor="middle"
                        fill="#e3be86"
                        fontSize="16"
                        fontFamily="IBM Plex Mono"
                        fontWeight="bold"
                    >
                        12m APPROVED ROAD
                    </text>

                    {/* Plots */}
                    {filteredPlots.map((plot) => {
                        const isSelected = selectedPlot === plot.number;
                        const isSold = plot.status === 'sold';
                        const isReserved = plot.status === 'reserved';

                        return (
                            <motion.g
                                key={plot.id}
                                onClick={() => onPlotSelect(plot.number)}
                                className="cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {/* Plot Rectangle */}
                                <rect
                                    x={plot.x}
                                    y={plot.y}
                                    width={plot.width}
                                    height={plot.height}
                                    fill={
                                        isSold
                                            ? '#4b5c42'
                                            : isReserved
                                                ? '#8f6a38'
                                                : isSelected
                                                    ? '#e3be86'
                                                    : '#faf7ef'
                                    }
                                    stroke={isSelected ? '#b8894a' : '#b8894a'}
                                    strokeWidth={isSelected ? 2.5 : 1.5}
                                    opacity={isSelected ? 1 : 0.8}
                                    filter={isSelected ? 'url(#glow)' : 'none'}
                                    style={{
                                        transition: 'all 0.3s ease',
                                    }}
                                />

                                {/* Plot Number */}
                                <text
                                    x={plot.x + plot.width / 2}
                                    y={plot.y + plot.height / 2 - 5}
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    fill={isSold ? '#f5f1e6' : isSelected ? '#0b1120' : '#0b1120'}
                                    fontSize={plot.width > 70 ? '24' : '18'}
                                    fontFamily="Bricolage Grotesque"
                                    fontWeight="bold"
                                >
                                    {plot.number}
                                </text>

                                {/* Status Badge */}
                                {(isSold || isReserved) && (
                                    <text
                                        x={plot.x + plot.width / 2}
                                        y={plot.y + plot.height / 2 + 15}
                                        textAnchor="middle"
                                        fill={isSold ? '#f5f1e6' : '#f5f1e6'}
                                        fontSize="10"
                                        fontFamily="IBM Plex Mono"
                                        fontWeight="bold"
                                    >
                                        {isSold ? 'Sold' : 'Reserved'}
                                    </text>
                                )}

                                {/* Tooltip on hover */}
                                <title>{`Plot ${plot.number} - ${plot.area_sqft} sq.ft - ${plot.facing} Facing - ₹${Math.round(plot.area_sqft * 2300).toLocaleString('en-IN')}`}</title>
                            </motion.g>
                        );
                    })}

                    {/* Park Area */}
                    <ellipse
                        cx="200"
                        cy="900"
                        rx="80"
                        ry="100"
                        fill="rgba(75, 92, 66, 0.3)"
                        stroke="#7c8f6e"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />
                    <text
                        x="200"
                        y="905"
                        textAnchor="middle"
                        fill="#7c8f6e"
                        fontSize="14"
                        fontFamily="Bricolage Grotesque"
                        fontWeight="bold"
                    >
                        PARK
                    </text>

                    {/* Compass Rose */}
                    <g transform="translate(900, 100)">
                        <circle cx="0" cy="0" r="25" fill="none" stroke="#b8894a" strokeWidth="1" opacity="0.5" />
                        <line x1="0" y1="-25" x2="0" y2="25" stroke="#b8894a" strokeWidth="1" opacity="0.3" />
                        <line x1="-25" y1="0" x2="25" y2="0" stroke="#b8894a" strokeWidth="1" opacity="0.3" />
                        <polygon points="0,-22 -3,-12 3,-12" fill="#b8894a" />
                        <text x="0" y="-35" textAnchor="middle" fill="#b8894a" fontSize="12">
                            N
                        </text>
                    </g>
                </g>
            </svg>

            {/* Controls */}
            <div className="absolute bottom-8 left-8 flex gap-4 z-10">
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleZoomIn}
                    className="p-3 rounded-full bg-[#b8894a] text-white shadow-lg hover:bg-[#e3be86] hover:text-[#0b1120] transition-all"
                    title="Zoom In (Scroll Up)"
                >
                    <ZoomIn size={20} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleZoomOut}
                    className="p-3 rounded-full bg-[#b8894a] text-white shadow-lg hover:bg-[#e3be86] hover:text-[#0b1120] transition-all"
                    title="Zoom Out (Scroll Down)"
                >
                    <ZoomOut size={20} />
                </motion.button>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="p-3 rounded-full bg-[#b8894a] text-white shadow-lg hover:bg-[#e3be86] hover:text-[#0b1120] transition-all"
                    title="Reset View"
                >
                    <RotateCcw size={20} />
                </motion.button>
            </div>

            {/* Info Panel */}
            <div className="absolute top-8 right-8 bg-[#0b1120] bg-opacity-90 backdrop-blur-md border border-[#b8894a] border-opacity-30 rounded-lg p-6 max-w-xs z-10">
                <h3 className="text-[#e3be86] font-bold text-sm uppercase tracking-widest mb-4 font-mono">
                    Map Controls
                </h3>
                <ul className="space-y-2 text-xs text-[#f5f1e6]">
                    <li>🖱️ <strong>Drag</strong> to pan the map</li>
                    <li>🔍 <strong>Scroll</strong> to zoom in/out</li>
                    <li>👆 <strong>Click</strong> on a plot to view details</li>
                    <li className="pt-2 border-t border-[#b8894a] border-opacity-20 mt-2">
                        <span className="text-[#b8894a]">Zoom:</span> {Math.round(zoom * 100)}%
                    </li>
                </ul>
            </div>
        </div>
    );
}