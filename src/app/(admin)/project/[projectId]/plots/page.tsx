"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Check } from "lucide-react";

type Status = "available" | "reserved" | "sold";

const STATUS_META: Record<Status, { label: string; dot: string; chip: string; ring: string }> = {
    available: {
        label: "Available",
        dot: "bg-green-500",
        chip: "bg-green-500/15 text-green-400 border-green-500/30",
        ring: "ring-green-500",
    },
    reserved: {
        label: "Reserved",
        dot: "bg-yellow-500",
        chip: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
        ring: "ring-yellow-500",
    },
    sold: {
        label: "Sold",
        dot: "bg-red-500",
        chip: "bg-red-500/15 text-red-400 border-red-500/30",
        ring: "ring-red-500",
    },
};

const PLOT_IDS = Array.from({ length: 32 }, (_, i) => String(i + 1));

export default function PlotsPage() {
    const params = useParams<{ projectId: string }>();
    const projectId = params.projectId;
    const supabase = useMemo(() => createClient(), []);

    const [statusMap, setStatusMap] = useState<Record<string, Status>>({});
    const [filter, setFilter] = useState<Status | "all">("all");
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let alive = true;

        const load = async () => {
            const { data } = await supabase
                .from("plot_status")
                .select("plot_id,status")
                .eq("project_id", projectId);
            if (!alive) return;
            const m: Record<string, Status> = {};
            data?.forEach((r: { plot_id: string; status: Status }) => {
                m[r.plot_id] = r.status;
            });
            setStatusMap(m);
            setLoading(false);
        };
        load();

        const channel = supabase
            .channel("plots_admin")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "plot_status", filter: `project_id=eq.${projectId}` },
                (payload) => {
                    const row = payload.new as { plot_id: string; status: Status };
                    if (row?.plot_id) setStatusMap((prev) => ({ ...prev, [row.plot_id]: row.status }));
                }
            )
            .subscribe();

        return () => {
            alive = false;
            supabase.removeChannel(channel);
        };
    }, [projectId, supabase]);

    const counts = {
        available: PLOT_IDS.filter((id) => (statusMap[id] || "available") === "available").length,
        reserved: PLOT_IDS.filter((id) => statusMap[id] === "reserved").length,
        sold: PLOT_IDS.filter((id) => statusMap[id] === "sold").length,
    };

    const visible = PLOT_IDS.filter((id) => {
        const st = statusMap[id] || "available";
        return filter === "all" || st === filter;
    });

    const setStatus = async (plotId: string, status: Status) => {
        setSaving(true);
        setStatusMap((prev) => ({ ...prev, [plotId]: status }));
        const { error } = await supabase
            .from("plot_status")
            .upsert(
                { project_id: projectId, plot_id: plotId, status, updated_at: new Date().toISOString() },
                { onConflict: "project_id,plot_id" }
            );
        setSaving(false);
        if (error) {
            alert("Failed to update: " + error.message);
        } else {
            setActive(null);
        }
    };

    return (
        <div>
            <div className="mb-1">
                <h2 className="text-2xl font-bold">Plot Management</h2>
                <p className="text-zinc-400">Tap a plot to change its status</p>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
                <Stat label="Available" value={counts.available} color="text-green-400" />
                <Stat label="Reserved" value={counts.reserved} color="text-yellow-400" />
                <Stat label="Sold" value={counts.sold} color="text-red-400" />
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                {(["all", "available", "reserved", "sold"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${filter === f
                                ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                : "border-zinc-700 bg-[#17171D] text-zinc-300 hover:bg-[#1E1E27]"
                            }`}
                    >
                        {f === "all" ? "All" : STATUS_META[f].label}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="mt-8 text-zinc-500">Loading plots…</p>
            ) : (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {visible.map((id) => {
                        const st: Status = statusMap[id] || "available";
                        const meta = STATUS_META[st];
                        return (
                            <button
                                key={id}
                                onClick={() => setActive(id)}
                                className="rounded-2xl border border-zinc-800 bg-[#17171D] p-5 text-left transition hover:bg-[#1E1E27] active:scale-[0.98]"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold">Plot {id}</span>
                                    <span className={`h-3 w-3 rounded-full ${meta.dot}`} />
                                </div>
                                <span
                                    className={`mt-4 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${meta.chip}`}
                                >
                                    {meta.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {active && (
                <div
                    className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setActive(null)}
                >
                    <div
                        className="w-full max-w-md rounded-t-3xl border border-zinc-800 bg-[#141419] p-6 pb-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-zinc-700" />
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <div className="text-xs uppercase tracking-widest text-[#D4AF37]">Plot</div>
                                <div className="text-2xl font-bold">#{active}</div>
                            </div>
                            <button
                                onClick={() => setActive(null)}
                                className="rounded-xl border border-zinc-700 p-2 text-zinc-400"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {(["available", "reserved", "sold"] as const).map((s) => {
                                const meta = STATUS_META[s];
                                const isCurrent = (statusMap[active] || "available") === s;
                                return (
                                    <button
                                        key={s}
                                        disabled={saving}
                                        onClick={() => setStatus(active, s)}
                                        className={`flex w-full items-center justify-between rounded-2xl border bg-[#17171D] p-4 transition hover:bg-[#1E1E27] ${isCurrent ? `ring-2 ${meta.ring}` : "border-zinc-800"
                                            }`}
                                    >
                                        <span className="flex items-center gap-3">
                                            <span className={`h-3.5 w-3.5 rounded-full ${meta.dot}`} />
                                            <span className="font-semibold">{meta.label}</span>
                                        </span>
                                        {isCurrent && <Check size={18} className="text-[#D4AF37]" />}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="mt-4 text-center text-xs text-zinc-500">
                            Changes reflect instantly on the public layout map.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-[#17171D] p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="mt-1 text-xs text-zinc-400">{label}</div>
        </div>
    );
}