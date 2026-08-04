"use client";

import { X } from "lucide-react";

interface PlotDetailsDrawerProps {
    open: boolean;
    onClose: () => void;
}

export default function PlotDetailsDrawer({
    open,
    onClose,
}: PlotDetailsDrawerProps) {
    if (!open) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-50 bg-black/60"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-[32px] bg-[#17171D]">

                {/* Handle */}

                <div className="flex justify-center pt-3">
                    <div className="h-1.5 w-14 rounded-full bg-zinc-600" />
                </div>

                <div className="flex items-center justify-between px-6 py-5">

                    <div>

                        <h2 className="text-2xl font-bold text-white">
                            Plot 12
                        </h2>

                        <p className="text-zinc-400">
                            Basava Ganguru
                        </p>

                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-xl bg-[#0B0B0F] p-2"
                    >
                        <X />
                    </button>

                </div>

                <div className="space-y-5 px-6 pb-8">

                    {/* Status */}

                    <div>

                        <label className="mb-2 block text-sm text-zinc-400">
                            Plot Status
                        </label>

                        <select className="w-full rounded-2xl border border-zinc-700 bg-[#0B0B0F] p-4 text-white">

                            <option>Available</option>

                            <option>Reserved</option>

                            <option>Sold</option>

                        </select>

                    </div>

                    {/* Price */}

                    <div>

                        <label className="mb-2 block text-sm text-zinc-400">
                            Total Price
                        </label>

                        <input
                            className="w-full rounded-2xl border border-zinc-700 bg-[#0B0B0F] p-4 text-white"
                            defaultValue="2350000"
                        />

                    </div>

                    {/* Facing */}

                    <div>

                        <label className="mb-2 block text-sm text-zinc-400">
                            Facing
                        </label>

                        <input
                            className="w-full rounded-2xl border border-zinc-700 bg-[#0B0B0F] p-4 text-white"
                            defaultValue="East"
                        />

                    </div>

                    {/* Size */}

                    <div className="grid grid-cols-2 gap-4">

                        <div>

                            <label className="mb-2 block text-sm text-zinc-400">
                                Width
                            </label>

                            <input
                                className="w-full rounded-2xl border border-zinc-700 bg-[#0B0B0F] p-4 text-white"
                                defaultValue="30"
                            />

                        </div>

                        <div>

                            <label className="mb-2 block text-sm text-zinc-400">
                                Length
                            </label>

                            <input
                                className="w-full rounded-2xl border border-zinc-700 bg-[#0B0B0F] p-4 text-white"
                                defaultValue="40"
                            />

                        </div>

                    </div>

                    {/* Owner */}

                    <div>

                        <label className="mb-2 block text-sm text-zinc-400">
                            Owner Name
                        </label>

                        <input
                            placeholder="Enter owner name"
                            className="w-full rounded-2xl border border-zinc-700 bg-[#0B0B0F] p-4 text-white"
                        />

                    </div>

                    <div>

                        <label className="mb-2 block text-sm text-zinc-400">
                            Owner Phone
                        </label>

                        <input
                            placeholder="Enter phone number"
                            className="w-full rounded-2xl border border-zinc-700 bg-[#0B0B0F] p-4 text-white"
                        />

                    </div>

                    <div>

                        <label className="mb-2 block text-sm text-zinc-400">
                            Remarks
                        </label>

                        <textarea
                            rows={4}
                            className="w-full rounded-2xl border border-zinc-700 bg-[#0B0B0F] p-4 text-white"
                        />

                    </div>

                    <button className="w-full rounded-2xl bg-[#D4AF37] p-4 font-bold text-black">

                        Save Plot

                    </button>

                </div>

            </div>
        </>
    );
}