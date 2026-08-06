"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client"; // adjust path if needed
import { ArrowLeft } from "lucide-react";

type Status = "available" | "reserved" | "sold";

const STATUS_META: Record<Status, { label: string; dot: string; chip: string }> = {
    available: { label: "Available", dot: "bg-green-500", chip: "bg-green-500/15 text-green-400 border-green-500/30" },
    reserved: { label: "Reserved", dot: "bg-yellow-500", chip: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
    sold: { label: "Sold", dot: "bg-red-500", chip: "bg-red-500/15 text-red-400 border-red-500/30" },
};

// 32 plots
const PLOT_IDS = Array.from({ length: 32 }, (_, i) => String(i + 1));

export default function PlotsPage() {
    const router = useRouter();
    const params = useParams<{ projectId: string }>();
    const projectId = params.projectId;

    const supabase = createClient();
    const [statusMap, setStatusMap] = useState<Record<string, Status>>({});
    const [filter, setFilter] = useState<Status | "all">("all");
    const [loading, setLoading] = useState(true);

    // Load all statuses + subscribe to live changes
    useEffect(() => {
        let active = true;

        const load = async () => {
            const { data } = await supabase
                .from("plot_status")
                .select("plot_id,status")
                .eq("project_id", projectId);
            if (!active) return;
            const m: Record<string, Status> = {};
            data?.forEach((r: { plot_id: string; status: Status }) => { m[r.plot_id] = r.status; });
            setStatusMap(m);
            setLoading(false);
        };
        load();

        const channel = supabase
            .channel("plots_list")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "plot_status", filter: `project_id=eq.${projectId}` },
                (payload) => {
                    const row = payload.new as { plot_id: string; status: Status };
                    if (row?.plot_id) setStatusMap((prev) => ({ ...prev, [row.plot_id]: row.status }));
                }
            )
            .subscribe();

        return () => { active = false; supabase.removeChannel(channel); };
    }, [projectId]);

    const counts = {
        available: PLOT_IDS.filter((id) => (statusMap[id] || "available") === "available").length,
        reserved: PLOT_IDS.filter((id) => statusMap[id] === "reserved").length,
        sold: PLOT_IDS.filter((id) => statusMap[id] === "sold").length,
    };

    const visible = PLOT_IDS.filter((id) => {
        const st = statusMap[id] || "available";
        return filter === "all" || st === filter;
    });

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#111116] border-b border-zinc-800 px-5 py-5">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/project/${projectId}/dashboard`)}
                        className="rounded-xl bg-[#1A1A22] p-3"
                    >
                        <ArrowLeft size={22} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Plots</h1>
                        <p className="text-zinc-400">Tap a plot to update its status</p>
                    </div>
                </div>

                {/* Summary counts */}
                <div className="mt-5 grid grid-cols-3 gap-3">
                    <Stat label="Available" value={counts.available} color="text-green-400" />
                    <Stat label="Reserved" value={counts.reserved} color="text-yellow-400" />
                    <Stat label="Sold" value={counts.sold} color="text-red-400" />
                </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto px-5 py-4">
                {(["all", "available", "reserved", "sold"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === f
                                ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                : "border-zinc-700 bg-[#17171D] text-zinc-300"
                            }`}
                    >
                        {f === "all" ? "All" : STATUS_META[f].label}
                    </button>
                ))}
            </div>

            {/* Plot grid */}
            {loading ? (
                <p className="px-5 text-zinc-500">Loading plots…</p>
            ) : (
                <div className="grid grid-cols-2 gap-4 px-5 sm:grid-cols-3">
                    {visible.map((id) => {
                        const st: Status = statusMap[id] || "available";
                        const meta = STATUS_META[st];
                        return (
                            <button
                                key={id}
                                onClick={() => router.push(`/project/${projectId}/plots/${id}`)}
                                className="rounded-2xl bg-[#17171D] p-5 text-left transition hover:bg-[#1E1E27] active:scale-[0.98]"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-bold">Plot {id}</span>
                                    <span className={`h-3 w-3 rounded-full ${meta.dot}`} />
                                </div>
                                <span className={`mt-4 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${meta.chip}`}>
                                    {meta.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </main>
    );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="rounded-2xl bg-[#17171D] p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="mt-1 text-xs text-zinc-400">{label}</div>
        </div>
    );
}