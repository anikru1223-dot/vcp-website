"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // adjust path to your client
import {
    ArrowLeft, Square, User, Phone, CreditCard, FileText,
    Pencil, CheckCircle2, Home,
} from "lucide-react";

type Status = "available" | "interested" | "sold";

export default function PlotDetailsPage() {
    const router = useRouter();
    const { projectId, plotId } = useParams<{ projectId: string; plotId: string }>();

    const supabase = createClient();
    const [status, setStatus] = useState<Status>("available");
    const [saving, setSaving] = useState(false);

    // Temporary static data (later from Supabase)
    const plot = {
        id: plotId,
        number: plotId,
        size: "30 × 40",
        facing: "East",
        area: "1200 Sq.ft",
        price: "₹48,00,000",
        owner: null,
    };

    // Load current status
    useEffect(() => {
        const load = async () => {
            const { data } = await supabase
                .from("plot_status")
                .select("status")
                .eq("project_id", projectId)
                .eq("plot_id", plotId)
                .maybeSingle();
            if (data?.status) setStatus(data.status as Status);
        };
        if (projectId && plotId) load();
    }, [projectId, plotId]);

    // Write status (upsert)
    const updateStatus = async (next: Status) => {
        setSaving(true);
        setStatus(next); // optimistic
        const { error } = await supabase
            .from("plot_status")
            .upsert(
                { project_id: projectId, plot_id: plotId, status: next, updated_at: new Date().toISOString() },
                { onConflict: "project_id,plot_id" }
            );
        setSaving(false);
        if (error) {
            alert("Failed to update: " + error.message);
        }
    };

    const statusLabel =
        status === "available" ? "Available" : status === "interested" ? "Interested" : "Sold";
    const statusColor =
        status === "available" ? "text-green-500" : status === "interested" ? "text-yellow-500" : "text-red-500";

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#111116] border-b border-zinc-800 px-5 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push(`/project/${projectId}/plots`)}
                            className="rounded-xl bg-[#1A1A22] p-3"
                        >
                            <ArrowLeft size={22} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">Plot {plot.number}</h1>
                            <p className="text-zinc-400">Plot Details</p>
                        </div>
                    </div>
                    <button className="rounded-xl bg-[#D4AF37] p-3 text-black">
                        <Pencil size={20} />
                    </button>
                </div>
            </div>

            <div className="space-y-5 p-5">
                {/* Status */}
                <div className="rounded-3xl bg-[#17171D] p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400">Current Status</p>
                            <h2 className={`mt-2 text-3xl font-bold ${statusColor}`}>{statusLabel}</h2>
                        </div>
                        <CheckCircle2 size={55} className={statusColor} />
                    </div>
                </div>

                {/* Plot Info */}
                <div className="rounded-3xl bg-[#17171D] p-6">
                    <h2 className="mb-5 text-xl font-semibold">Plot Information</h2>
                    <div className="space-y-4">
                        <InfoRow icon={<Square size={20} />} label="Plot Size" value={plot.size} />
                        <InfoRow icon={<Home size={20} />} label="Facing" value={plot.facing} />
                        <InfoRow icon={<Square size={20} />} label="Area" value={plot.area} />
                        <InfoRow icon={<CreditCard size={20} />} label="Price" value={plot.price} />
                    </div>
                </div>

                {/* Customer */}
                <div className="rounded-3xl bg-[#17171D] p-6">
                    <h2 className="mb-5 text-xl font-semibold">Customer</h2>
                    {plot.owner ? (
                        <>
                            <InfoRow icon={<User size={20} />} label="Owner" value="Darshan" />
                            <InfoRow icon={<Phone size={20} />} label="Phone" value="+91 9876543210" />
                        </>
                    ) : (
                        <div className="text-center py-10">
                            <User className="mx-auto text-zinc-500" size={55} />
                            <h3 className="mt-4 text-xl font-semibold">No Customer Assigned</h3>
                            <button className="mt-6 rounded-xl bg-[#D4AF37] px-6 py-3 font-semibold text-black">
                                Assign Customer
                            </button>
                        </div>
                    )}
                </div>

                {/* Documents */}
                <div className="rounded-3xl bg-[#17171D] p-6">
                    <h2 className="mb-5 text-xl font-semibold">Documents</h2>
                    <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-600 py-6">
                        <FileText />
                        Upload Documents
                    </button>
                </div>

                {/* Actions — write to Supabase */}
                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={() => updateStatus("available")}
                        disabled={saving}
                        className={`rounded-xl py-4 font-semibold disabled:opacity-50 ${status === "available" ? "ring-2 ring-green-400 bg-green-600" : "bg-green-600"
                            }`}
                    >
                        Mark Available
                    </button>
                    <button
                        onClick={() => updateStatus("interested")}
                        disabled={saving}
                        className={`rounded-xl py-4 font-semibold text-black disabled:opacity-50 ${status === "interested" ? "ring-2 ring-yellow-300 bg-yellow-500" : "bg-yellow-500"
                            }`}
                    >
                        Mark Interested
                    </button>
                    <button
                        onClick={() => updateStatus("sold")}
                        disabled={saving}
                        className={`rounded-xl py-4 font-semibold disabled:opacity-50 ${status === "sold" ? "ring-2 ring-red-400 bg-red-600" : "bg-red-600"
                            }`}
                    >
                        Mark Sold
                    </button>
                </div>
            </div>
        </main>
    );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="flex items-center justify-between rounded-xl bg-[#0F0F13] p-4">
            <div className="flex items-center gap-3">
                <div className="text-[#D4AF37]">{icon}</div>
                <span>{label}</span>
            </div>
            <span className="font-semibold">{value}</span>
        </div>
    );
}