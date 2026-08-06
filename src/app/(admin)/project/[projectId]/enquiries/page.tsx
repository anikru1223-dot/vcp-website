"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MessageCircle, Phone, Trash2 } from "lucide-react";

type EType = "whatsapp" | "call";

type Enquiry = {
    id: string;
    project_id: string;
    plot_id: string | null;
    name: string | null;
    phone: string | null;
    type: EType;
    message: string | null;
    created_at: string;
};

export default function EnquiriesPage() {
    const params = useParams<{ projectId: string }>();
    const projectId = params.projectId;
    const supabase = useMemo(() => createClient(), []);

    const [rows, setRows] = useState<Enquiry[]>([]);
    const [filter, setFilter] = useState<EType | "all">("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;

        const load = async () => {
            const { data } = await supabase
                .from("enquiries")
                .select("*")
                .eq("project_id", projectId)
                .order("created_at", { ascending: false });
            if (!alive) return;
            setRows((data as Enquiry[]) || []);
            setLoading(false);
        };
        load();

        const channel = supabase
            .channel("enquiries_admin")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "enquiries", filter: `project_id=eq.${projectId}` },
                (payload) => {
                    setRows((prev) => [payload.new as Enquiry, ...prev]);
                }
            )
            .subscribe();

        return () => {
            alive = false;
            supabase.removeChannel(channel);
        };
    }, [projectId, supabase]);

    const visible = rows.filter((r) => filter === "all" || r.type === filter);

    const remove = async (id: string) => {
        if (!confirm("Delete this enquiry?")) return;
        await supabase.from("enquiries").delete().eq("id", id);
        setRows((prev) => prev.filter((r) => r.id !== id));
    };

    const fmt = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    return (
        <div>
            <div>
                <h2 className="text-2xl font-bold">Enquiries</h2>
                <p className="text-zinc-400">WhatsApp and call requests from the layout map</p>
            </div>

            <div className="mt-5 flex gap-2">
                {(["all", "whatsapp", "call"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold capitalize transition ${filter === f
                                ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                : "border-zinc-700 bg-[#17171D] text-zinc-300"
                            }`}
                    >
                        {f === "all" ? "All" : f}
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="mt-8 text-zinc-500">Loading…</p>
            ) : visible.length === 0 ? (
                <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
                    No enquiries yet.
                </div>
            ) : (
                <div className="mt-5 space-y-3">
                    {visible.map((e) => {
                        const isWa = e.type === "whatsapp";
                        return (
                            <div
                                key={e.id}
                                className="flex items-start gap-4 rounded-2xl border border-zinc-800 bg-[#141419] p-4"
                            >
                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${isWa ? "bg-green-500/15 text-green-400" : "bg-blue-500/15 text-blue-400"
                                        }`}
                                >
                                    {isWa ? <MessageCircle size={20} /> : <Phone size={20} />}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{e.name || "Anonymous"}</span>
                                        {e.plot_id && (
                                            <span className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2 py-0.5 text-xs font-semibold text-[#D4AF37]">
                                                Plot {e.plot_id}
                                            </span>
                                        )}
                                    </div>
                                    {e.phone && <div className="mt-0.5 text-sm text-zinc-400">{e.phone}</div>}
                                    {e.message && <div className="mt-1.5 text-sm text-zinc-300">{e.message}</div>}
                                    <div className="mt-1.5 text-xs text-zinc-500">{fmt(e.created_at)}</div>
                                </div>
                                <button
                                    onClick={() => remove(e.id)}
                                    className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}