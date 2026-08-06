"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // adjust path if needed
import { ArrowLeft, CheckCircle2 } from "lucide-react";

type Status = "available" | "interested" | "sold";

const STATUS_META: Record<Status, { label: string; text: string; ring: string; bg: string }> = {
    available: { label: "Available", text: "text-green-500", ring: "ring-green-400", bg: "bg-green-600" },
    interested: { label: "Interested", text: "text-yellow-500", ring: "ring-yellow-300", bg: "bg-yellow-500" },
    sold: { label: "Sold", text: "text-red-500", ring: "ring-red-400", bg: "bg-red-600" },
};

export default function PlotDetailsPage() {
    const router = useRouter();
    const { projectId, plotId } = useParams<{ projectId: string; plotId: string }>();

    const supabase = createClient();
    const [status, setStatus] = useState<Status>("available");
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

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
            setLoading(false);
        };
        if (projectId && plotId) load();
    }, [projectId, plotId]);

    // Save status (upsert)
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
        if (error) alert("Failed to update: " + error.message);
    };

    const meta = STATUS_META[status];

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#111116] border-b border-zinc-800 px-5 py-5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/project/${projectId}/plots`)}
                        className="rounded-xl bg-[#1A1A22] p-3"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Plot {plotId}</h1>
                        <p className="text-zinc-400">Update status</p>
                    </div>
                </div>
            </div>

            <div className="space-y-5 p-5">
                {/* Current status */}
                <div className="rounded-3xl bg-[#17171D] p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-zinc-400">Current Status</p>
                            <h2 className={`mt-2 text-3xl font-bold ${meta.text}`}>
                                {loading ? "…" : meta.label}
                            </h2>
                        </div>
                        <CheckCircle2 size={55} className={meta.text} />
                    </div>
                </div>

                {/* Mark buttons */}
                <div className="grid grid-cols-1 gap-4">
                    {(["available", "interested", "sold"] as const).map((s) => {
                        const m = STATUS_META[s];
                        const active = status === s;
                        const textBlack = s === "interested" ? "text-black" : "";
                        return (
                            <button
                                key={s}
                                onClick={() => updateStatus(s)}
                                disabled={saving}
                                className={`rounded-xl py-4 font-semibold transition disabled:opacity-50 ${m.bg} ${textBlack} ${active ? `ring-2 ${m.ring}` : ""
                                    }`}
                            >
                                Mark {m.label}
                            </button>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}