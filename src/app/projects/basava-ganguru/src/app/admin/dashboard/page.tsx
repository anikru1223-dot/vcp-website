'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Plus, Edit2, CheckCircle, AlertCircle } from 'lucide-react';
import AdminUpload from '../../../components/AdminUpload';
import plotData from '../../../../plot-dimensions.json';

type Tab = 'overview' | 'plots' | 'inquiries';

interface PlotStatus {
    [key: number]: 'available' | 'sold' | 'reserved';
}

interface Inquiry {
    id: string;
    full_name: string;
    phone: string;
    email: string;
    plot_id: number;
    message?: string;
    status: string;
    created_at: string;
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [expandedPlot, setExpandedPlot] = useState<number | null>(null);
    const [plotStatuses, setPlotStatuses] = useState<PlotStatus>({});
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);

    useEffect(() => {
        // Initialize plot statuses
        const statuses: PlotStatus = {};
        plotData.plots.forEach((plot: any) => {
            statuses[plot.number] = plot.status as any;
        });
        setPlotStatuses(statuses);

        // Fetch inquiries
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const response = await fetch('/api/inquiries');
            if (response.ok) {
                const data = await response.json();
                setInquiries(data);
            }
        } catch (error) {
            console.error('Error fetching inquiries:', error);
        }
    };

    const handlePlotStatusChange = async (plotNumber: number, newStatus: 'available' | 'sold' | 'reserved') => {
        setPlotStatuses((prev) => ({
            ...prev,
            [plotNumber]: newStatus,
        }));

        try {
            await fetch(`/api/plots/${plotNumber}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
        } catch (error) {
            console.error('Error updating plot status:', error);
        }
    };

    // Statistics
    const stats = {
        total: plotData.plots.length,
        available: Object.values(plotStatuses).filter((s) => s === 'available').length,
        sold: Object.values(plotStatuses).filter((s) => s === 'sold').length,
        reserved: Object.values(plotStatuses).filter((s) => s === 'reserved').length,
        inquiries: inquiries.length,
    };

    return (
        <div className="space-y-8">
            {/* Tab Navigation */}
            <div className="flex gap-4 border-b border-[#b8894a] border-opacity-20">
                {(['overview', 'plots', 'inquiries'] as Tab[]).map((tab) => (
                    <motion.button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 font-semibold capitalize border-b-2 transition ${activeTab === tab
                            ? 'border-[#b8894a] text-[#b8894a]'
                            : 'border-transparent text-[#8f6a38] hover:text-[#b8894a]'
                            }`}
                    >
                        {tab}
                    </motion.button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-5 gap-4">
                        {[
                            { label: 'Total Plots', value: stats.total, color: '#b8894a' },
                            { label: 'Available', value: stats.available, color: '#4b5c42' },
                            { label: 'Sold', value: stats.sold, color: '#8f6a38' },
                            { label: 'Reserved', value: stats.reserved, color: '#57544c' },
                            { label: 'Inquiries', value: stats.inquiries, color: '#e3be86' },
                        ].map((stat, index: number) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white border border-[#b8894a] border-opacity-20 rounded-lg p-6"
                            >
                                <p className="text-sm text-[#8f6a38] mb-2">{stat.label}</p>
                                <p className="text-3xl font-bold text-[#0b1120]" style={{ color: stat.color }}>
                                    {stat.value}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-[#e3be86] bg-opacity-10 border border-[#b8894a] border-opacity-20 rounded-lg p-6">
                        <h3 className="text-lg font-bold text-[#0b1120] mb-4">Quick Actions</h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('plots')}
                                className="flex items-center gap-3 px-4 py-3 bg-[#b8894a] text-white rounded-lg font-semibold hover:bg-[#8f6a38] transition"
                            >
                                <Plus size={20} />
                                Manage Plots
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setActiveTab('inquiries')}
                                className="flex items-center gap-3 px-4 py-3 bg-[#b8894a] text-white rounded-lg font-semibold hover:bg-[#8f6a38] transition"
                            >
                                <AlertCircle size={20} />
                                View Inquiries ({stats.inquiries})
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex items-center gap-3 px-4 py-3 bg-[#b8894a] text-white rounded-lg font-semibold hover:bg-[#8f6a38] transition"
                            >
                                <CheckCircle size={20} />
                                Export Report
                            </motion.button>
                        </div>
                    </div>

                    {/* Recent Inquiries */}
                    <div>
                        <h3 className="text-lg font-bold text-[#0b1120] mb-4">Recent Inquiries</h3>
                        <div className="space-y-3">
                            {inquiries.slice(0, 5).map((inquiry: Inquiry, index: number) => (
                                <motion.div
                                    key={inquiry.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white border border-[#b8894a] border-opacity-20 rounded-lg p-4 flex items-center justify-between"
                                >
                                    <div>
                                        <p className="font-semibold text-[#0b1120]">{inquiry.full_name}</p>
                                        <p className="text-sm text-[#8f6a38]">Plot {inquiry.plot_id} • {inquiry.phone}</p>
                                    </div>
                                    <span className="px-3 py-1 bg-[#4b5c42] text-white text-xs font-bold rounded">
                                        New
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Plots Tab */}
            {activeTab === 'plots' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <h2 className="text-2xl font-bold text-[#0b1120] mb-6">Manage Plots</h2>

                    {/* Plot List */}
                    <div className="space-y-2">
                        {plotData.plots.map((plot: any, index: number) => (
                            <motion.div
                                key={plot.number}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: index * 0.02 }}
                                className="bg-white border border-[#b8894a] border-opacity-20 rounded-lg overflow-hidden"
                            >
                                <motion.button
                                    onClick={() => setExpandedPlot(expandedPlot === plot.number ? null : plot.number)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-[#f5f1e6] transition"
                                >
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-[#0b1120]">Plot {plot.number}</span>
                                            <span
                                                className="text-xs font-bold px-2 py-1 rounded"
                                                style={{
                                                    background:
                                                        plotStatuses[plot.number] === 'available'
                                                            ? 'rgba(75, 92, 66, 0.2)'
                                                            : plotStatuses[plot.number] === 'sold'
                                                                ? 'rgba(143, 106, 56, 0.2)'
                                                                : 'rgba(139, 137, 137, 0.2)',
                                                    color:
                                                        plotStatuses[plot.number] === 'available'
                                                            ? '#4b5c42'
                                                            : plotStatuses[plot.number] === 'sold'
                                                                ? '#8f6a38'
                                                                : '#57544c',
                                                }}
                                            >
                                                {plotStatuses[plot.number] || 'available'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-[#8f6a38]">
                                            {plot.width}m × {plot.depth}m • {plot.area_sqft} sq.ft • {plot.facing} Facing
                                        </p>
                                    </div>
                                    <ChevronDown
                                        size={20}
                                        className={`text-[#b8894a] transition ${expandedPlot === plot.number ? 'rotate-180' : ''}`}
                                    />
                                </motion.button>

                                {/* Expanded Content */}
                                {expandedPlot === plot.number && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="border-t border-[#b8894a] border-opacity-20 p-4 bg-[#faf7ef]"
                                    >
                                        {/* Status Update */}
                                        <div className="mb-6">
                                            <p className="text-sm font-semibold text-[#0b1120] mb-3">Plot Status</p>
                                            <div className="flex gap-2">
                                                {(['available', 'sold', 'reserved'] as const).map((status) => (
                                                    <motion.button
                                                        key={status}
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handlePlotStatusChange(plot.number, status)}
                                                        className={`px-4 py-2 rounded-lg font-semibold capitalize transition ${plotStatuses[plot.number] === status
                                                            ? 'bg-[#b8894a] text-white'
                                                            : 'bg-[#e3be86] bg-opacity-20 text-[#0b1120] hover:bg-opacity-30'
                                                            }`}
                                                    >
                                                        {status}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Media Upload */}
                                        <div>
                                            <p className="text-sm font-semibold text-[#0b1120] mb-3">Upload Photos & Videos</p>
                                            <AdminUpload
                                                plotNumber={plot.number}
                                                onUploadSuccess={() => console.log('Upload successful')}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Inquiries Tab */}
            {activeTab === 'inquiries' && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <h2 className="text-2xl font-bold text-[#0b1120] mb-6">Inquiries ({inquiries.length})</h2>

                    {inquiries.length === 0 ? (
                        <div className="bg-white border border-[#b8894a] border-opacity-20 rounded-lg p-8 text-center">
                            <p className="text-[#8f6a38]">No inquiries yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {inquiries.map((inquiry: Inquiry, index: number) => (
                                <motion.div
                                    key={inquiry.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white border border-[#b8894a] border-opacity-20 rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <p className="font-bold text-[#0b1120]">{inquiry.full_name}</p>
                                            <p className="text-sm text-[#8f6a38]">Plot {inquiry.plot_id}</p>
                                        </div>
                                        <span className="px-3 py-1 bg-[#4b5c42] text-white text-xs font-bold rounded">
                                            {inquiry.status}
                                        </span>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <p className="text-[#8f6a38] text-xs">Phone</p>
                                            <p className="font-semibold text-[#0b1120]">{inquiry.phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-[#8f6a38] text-xs">Email</p>
                                            <p className="font-semibold text-[#0b1120]">{inquiry.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-[#8f6a38] text-xs">Date</p>
                                            <p className="font-semibold text-[#0b1120]">
                                                {new Date(inquiry.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    {inquiry.message && (
                                        <div className="mt-3 pt-3 border-t border-[#b8894a] border-opacity-20">
                                            <p className="text-sm text-[#57544c]">{inquiry.message}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    );
}