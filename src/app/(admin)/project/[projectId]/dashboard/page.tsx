"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Map, Users, MessageCircle, Phone, ChevronRight } from "lucide-react";

type Status = "available" | "reserved" | "sold";

const PLOT_IDS = Array.from({ length: 32 }, (_, i) => String(i + 1));

type Enquiry = {
    id: string;
    plot_id: string | null;
    name: string | null;
    type: "whatsapp" | "call";
    created_at: string;
};

export default function DashboardPage() {
    const params = useParams<{ projectId: string }>();
    const router = useRouter();
    const projectId = params.projectId;
    const supabase = useMemo(() => createClient(), []);

    const [statusMap, setStatusMap] = useState<Record<string, Status>>({});
    const [soldCount, setSoldCount] = useState(0);
    const [interestedCount, setInterestedCount] = useState(0);
    const [recent, setRecent] = useState<Enquiry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        const load = async () => {
            const [plots, custs, enqs] = await Promise.all([
                supabase.from("plot_status").select("plot_id,status").eq("project_id", projectId),
                supabase.from("customers").select("status").eq("project_id", projectId),
                supabase
                    .from("enquiries")
                    .select("id,plot_id,name,type,created_at")
                    .eq("project_id", projectId)
                    .order("created_at", { ascending: false })
                    .limit(5),
            ]);
            if (!alive) return;
            const m: Record<string, Status> = {};
            plots.data?.forEach((r: { plot_id: string; status: Status }) => {
                m[r.plot_id] = r.status;
            });
            setStatusMap(m);
            setSoldCount((custs.data || []).filter((c: { status: string }) => c.status === "sold").length);
            setInterestedCount(
                (custs.data || []).filter((c: { status: string }) => c.status === "interested").length
            );
            setRecent((enqs.data as Enquiry[]) || []);
            setLoading(false);
        };
        load();
        return () => {
            alive = false;
        };
    }, [projectId, supabase]);

    const counts = {
        available: PLOT_IDS.filter((id) => (statusMap[id] || "available") === "available").length,
        reserved: PLOT_IDS.filter((id) => statusMap[id] === "reserved").length,
        sold: PLOT_IDS.filter((id) => statusMap[id] === "sold").length,
    };

    const fmt = (iso: string) =>
        new Date(iso).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    return (
        <div>
            <h2 className="text-2xl font-bold">Dashboard</h2>
            <p className="text-zinc-400">Overview of your residential layout</p>

            <div className="mt-6 grid grid-cols-3 gap-3">
                <Metric label="Available" value={counts.available} color="text-green-400" />
                <Metric label="Reserved" value={counts.reserved} color="text-yellow-400" />
                <Metric label="Sold" value={counts.sold} color="text-red-400" />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
                <Metric label="Interested" value={interestedCount} color="text-[#D4AF37]" />
                <Metric label="Sold records" value={soldCount} color="text-white" />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <QuickAction
                    icon={<Map size={20} />}
                    label="Manage plots"
                    onClick={() => router.push(`/project/${projectId}/plots`)}
                />
                <QuickAction
                    icon={<Users size={20} />}
                    label="Customers"
                    onClick={() => router.push(`/project/${projectId}/customers`)}
                />
            </div>

            <div className="mt-8">
                <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-lg font-bold">Recent enquiries</h3>
                    <button
                        onClick={() => router.push(`/project/${projectId}/enquiries`)}
                        className="flex items-center gap-1 text-sm text-[#D4AF37]"
                    >
                        View all <ChevronRight size={16} />
                    </button>
                </div>

                {loading ? (
                    <p className="text-zinc-500">Loading…</p>
                ) : recent.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center text-zinc-500">
                        No enquiries yet.
                    </div>
                ) : (
                    <div className="space-y-2">
                        {recent.map((e) => {
                            const isWa = e.type === "whatsapp";
                            return (
                                <div
                                    key={e.id}
                                    className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-[#141419] p-3"
                                >
                                    <div
                                        className={`flex h-9 w-9 items-center justify-center rounded-full ${isWa ? "bg-green-500/15 text-green-400" : "bg-blue-500/15 text-blue-400"
                                            }`}
                                    >
                                        {isWa ? <MessageCircle size={17} /> : <Phone size={17} />}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 text-sm font-semibold">
                                            {e.name || "Anonymous"}
                                            {e.plot_id && (
                                                <span className="text-xs text-[#D4AF37]">Plot {e.plot_id}</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-zinc-500">{fmt(e.created_at)}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function Metric({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-[#141419] p-4 text-center">
            <div className={`text-3xl font-bold ${color}`}>{value}</div>
            <div className="mt-1 text-xs text-zinc-400">{label}</div>
        </div>
    );
}

function QuickAction({
    icon,
    label,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-[#141419] p-4 text-left transition hover:border-[#D4AF37]/40 hover:bg-[#1A1A22] active:scale-[0.98]"
        >
            <span className="text-[#D4AF37]">{icon}</span>
            <span className="font-semibold">{label}</span>
        </button>
    );
}