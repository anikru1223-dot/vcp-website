"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, X, Upload, FileText, Trash2, Phone, Mail, MapPin } from "lucide-react";

type CStatus = "interested" | "sold";
type Doc = { name: string; url: string };

type Customer = {
    id: string;
    project_id: string;
    plot_id: string | null;
    status: CStatus;
    owner_name: string | null;
    contact: string | null;
    secondary_contact: string | null;
    email: string | null;
    address: string | null;
    documents: Doc[];
    created_at: string;
};

export default function CustomersPage() {
    const params = useParams<{ projectId: string }>();
    const projectId = params.projectId;
    const supabase = useMemo(() => createClient(), []);

    const [tab, setTab] = useState<CStatus>("interested");
    const [rows, setRows] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<Customer | null>(null);

    const load = async () => {
        const { data } = await supabase
            .from("customers")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false });
        setRows((data as Customer[]) || []);
        setLoading(false);
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const visible = rows.filter((r) => r.status === tab);

    const remove = async (id: string) => {
        if (!confirm("Delete this customer record?")) return;
        await supabase.from("customers").delete().eq("id", id);
        setRows((prev) => prev.filter((r) => r.id !== id));
    };

    return (
        <div>
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Customers</h2>
                    <p className="text-zinc-400">Interested leads and sold records</p>
                </div>
                <button
                    onClick={() => {
                        setEditing(null);
                        setFormOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 font-semibold text-black transition active:scale-95"
                >
                    <Plus size={18} /> Add
                </button>
            </div>

            <div className="mt-5 flex gap-2">
                {(["interested", "sold"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold capitalize transition ${tab === t
                                ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                : "border-zinc-700 bg-[#17171D] text-zinc-300"
                            }`}
                    >
                        {t} ({rows.filter((r) => r.status === t).length})
                    </button>
                ))}
            </div>

            {loading ? (
                <p className="mt-8 text-zinc-500">Loading…</p>
            ) : visible.length === 0 ? (
                <div className="mt-10 rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
                    No {tab} records yet.
                </div>
            ) : (
                <div className="mt-5 space-y-4">
                    {visible.map((c) => (
                        <div key={c.id} className="rounded-2xl border border-zinc-800 bg-[#141419] p-5">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg font-bold">{c.owner_name || "—"}</span>
                                        {c.plot_id && (
                                            <span className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2.5 py-0.5 text-xs font-semibold text-[#D4AF37]">
                                                Plot {c.plot_id}
                                            </span>
                                        )}
                                    </div>
                                    <div className="mt-2 space-y-1 text-sm text-zinc-400">
                                        {c.contact && (
                                            <div className="flex items-center gap-2">
                                                <Phone size={13} /> {c.contact}
                                                {c.secondary_contact && ` · ${c.secondary_contact}`}
                                            </div>
                                        )}
                                        {c.email && (
                                            <div className="flex items-center gap-2">
                                                <Mail size={13} /> {c.email}
                                            </div>
                                        )}
                                        {c.address && (
                                            <div className="flex items-center gap-2">
                                                <MapPin size={13} /> {c.address}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditing(c);
                                            setFormOpen(true);
                                        }}
                                        className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-semibold text-zinc-300"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => remove(c.id)}
                                        className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            {c.documents?.length > 0 && (
                                <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-800 pt-4">
                                    {c.documents.map((d, i) => (
                                        <a
                                            key={i}
                                            href={d.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-[#17171D] px-3 py-1.5 text-xs text-zinc-300 hover:border-[#D4AF37]/40"
                                        >
                                            <FileText size={13} /> {d.name}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {formOpen && (
                <CustomerForm
                    projectId={projectId}
                    supabase={supabase}
                    initial={editing}
                    defaultStatus={tab}
                    onClose={() => setFormOpen(false)}
                    onSaved={() => {
                        setFormOpen(false);
                        load();
                    }}
                />
            )}
        </div>
    );
}

function CustomerForm({
    projectId,
    supabase,
    initial,
    defaultStatus,
    onClose,
    onSaved,
}: {
    projectId: string;
    supabase: ReturnType<typeof createClient>;
    initial: Customer | null;
    defaultStatus: CStatus;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [status, setStatus] = useState<CStatus>(initial?.status || defaultStatus);
    const [plotId, setPlotId] = useState(initial?.plot_id || "");
    const [ownerName, setOwnerName] = useState(initial?.owner_name || "");
    const [contact, setContact] = useState(initial?.contact || "");
    const [secondary, setSecondary] = useState(initial?.secondary_contact || "");
    const [email, setEmail] = useState(initial?.email || "");
    const [address, setAddress] = useState(initial?.address || "");
    const [docs, setDocs] = useState<Doc[]>(initial?.documents || []);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [pendingName, setPendingName] = useState("");

    const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setPendingFile(f);
        setPendingName(f.name.replace(/\.[^.]+$/, ""));
        e.target.value = "";
    };

    const confirmUpload = async () => {
        if (!pendingFile) return;
        setUploading(true);
        const ext = pendingFile.name.split(".").pop() || "bin";
        const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("customer-docs").upload(path, pendingFile);
        if (error) {
            alert("Upload failed: " + error.message);
            setUploading(false);
            return;
        }
        const { data } = supabase.storage.from("customer-docs").getPublicUrl(path);
        setDocs((prev) => [...prev, { name: pendingName.trim() || pendingFile.name, url: data.publicUrl }]);
        setPendingFile(null);
        setPendingName("");
        setUploading(false);
    };

    const removeDoc = (i: number) => setDocs((prev) => prev.filter((_, idx) => idx !== i));

    const save = async () => {
        setSaving(true);
        const payload = {
            project_id: projectId,
            plot_id: plotId || null,
            status,
            owner_name: ownerName || null,
            contact: contact || null,
            secondary_contact: secondary || null,
            email: email || null,
            address: address || null,
            documents: docs,
        };
        const res = initial
            ? await supabase.from("customers").update(payload).eq("id", initial.id)
            : await supabase.from("customers").insert(payload);
        setSaving(false);
        if (res.error) {
            alert("Save failed: " + res.error.message);
            return;
        }
        onSaved();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center">
            <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-zinc-800 bg-[#141419] p-6 pb-10 sm:rounded-3xl">
                <div className="mb-5 flex items-center justify-between">
                    <h3 className="text-xl font-bold">{initial ? "Edit customer" : "Add customer"}</h3>
                    <button onClick={onClose} className="rounded-xl border border-zinc-700 p-2 text-zinc-400">
                        <X size={18} />
                    </button>
                </div>

                <div className="mb-4 flex gap-2">
                    {(["interested", "sold"] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => setStatus(s)}
                            className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold capitalize transition ${status === s
                                    ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                    : "border-zinc-700 bg-[#17171D] text-zinc-300"
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="space-y-3">
                    <Field label="Plot number" value={plotId} onChange={setPlotId} placeholder="e.g. 12" />
                    <Field label="Owner name" value={ownerName} onChange={setOwnerName} placeholder="Full name" />
                    <Field label="Contact number" value={contact} onChange={setContact} placeholder="Primary phone" />
                    <Field label="Secondary contact" value={secondary} onChange={setSecondary} placeholder="Optional" />
                    <Field label="Email" value={email} onChange={setEmail} placeholder="Optional" />
                    <Field label="Address" value={address} onChange={setAddress} placeholder="Full address" textarea />
                </div>

                <div className="mt-5">
                    <div className="mb-2 text-sm font-semibold text-zinc-300">Documents</div>

                    {docs.length > 0 && (
                        <div className="mb-3 space-y-2">
                            {docs.map((d, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between rounded-lg border border-zinc-700 bg-[#17171D] px-3 py-2"
                                >
                                    <span className="flex items-center gap-2 text-sm text-zinc-300">
                                        <FileText size={14} /> {d.name}
                                    </span>
                                    <button onClick={() => removeDoc(i)} className="text-red-400">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {pendingFile ? (
                        <div className="rounded-lg border border-[#D4AF37]/40 bg-[#17171D] p-3">
                            <div className="mb-2 truncate text-xs text-zinc-400">{pendingFile.name}</div>
                            <input
                                value={pendingName}
                                onChange={(e) => setPendingName(e.target.value)}
                                placeholder="Name this document"
                                className="w-full rounded-lg border border-zinc-700 bg-[#0F0F13] px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]"
                            />
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={confirmUpload}
                                    disabled={uploading}
                                    className="flex-1 rounded-lg bg-[#D4AF37] py-2 text-sm font-semibold text-black disabled:opacity-60"
                                >
                                    {uploading ? "Uploading…" : "Add document"}
                                </button>
                                <button
                                    onClick={() => setPendingFile(null)}
                                    className="rounded-lg border border-zinc-700 px-3 text-sm text-zinc-400"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-700 py-3 text-sm text-zinc-400 hover:border-[#D4AF37]/40">
                            <Upload size={16} /> Upload document
                            <input type="file" className="hidden" onChange={onPickFile} />
                        </label>
                    )}
                </div>

                <button
                    onClick={save}
                    disabled={saving}
                    className="mt-6 w-full rounded-xl bg-[#D4AF37] py-3.5 font-bold text-black transition active:scale-[0.99] disabled:opacity-60"
                >
                    {saving ? "Saving…" : initial ? "Update customer" : "Save customer"}
                </button>
            </div>
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    textarea,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    textarea?: boolean;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-zinc-400">{label}</span>
            {textarea ? (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={2}
                    className="w-full resize-none rounded-lg border border-zinc-700 bg-[#0F0F13] px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]"
                />
            ) : (
                <input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-zinc-700 bg-[#0F0F13] px-3 py-2.5 text-sm text-white outline-none focus:border-[#D4AF37]"
                />
            )}
        </label>
    );
}