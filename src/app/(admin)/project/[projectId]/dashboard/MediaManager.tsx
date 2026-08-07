"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Upload, Trash2, ImageIcon, Video, X } from "lucide-react";

type MediaType = "image" | "video";
type Media = {
    id: string;
    project_id: string;
    type: MediaType;
    url: string;
    caption: string | null;
    sort_order: number;
    created_at: string;
};

export default function MediaManager({ projectId }: { projectId: string }) {
    const supabase = useMemo(() => createClient(), []);
    const [rows, setRows] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState<string>("");

    const load = async () => {
        const { data } = await supabase
            .from("project_media")
            .select("*")
            .eq("project_id", projectId)
            .order("sort_order", { ascending: true })
            .order("created_at", { ascending: false });
        setRows((data as Media[]) || []);
        setLoading(false);
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        e.target.value = "";
        if (!files.length) return;

        setUploading(true);
        let done = 0;
        for (const file of files) {
            done++;
            setProgress(`Uploading ${done} of ${files.length}…`);
            const isVideo = file.type.startsWith("video/");
            const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
            const path = `${projectId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

            const { error: upErr } = await supabase.storage
                .from("project-media")
                .upload(path, file, { contentType: file.type });
            if (upErr) {
                alert(`Upload failed for ${file.name}: ${upErr.message}`);
                continue;
            }
            const { data: pub } = supabase.storage.from("project-media").getPublicUrl(path);
            await supabase.from("project_media").insert({
                project_id: projectId,
                type: isVideo ? "video" : "image",
                url: pub.publicUrl,
                sort_order: rows.length + done,
            });
        }
        setUploading(false);
        setProgress("");
        load();
    };

    const remove = async (id: string) => {
        if (!confirm("Delete this media?")) return;
        await supabase.from("project_media").delete().eq("id", id);
        setRows((prev) => prev.filter((r) => r.id !== id));
    };

    const saveCaption = async (id: string, caption: string) => {
        await supabase.from("project_media").update({ caption }).eq("id", id);
        setRows((prev) => prev.map((r) => (r.id === id ? { ...r, caption } : r)));
    };

    return (
        <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold">Project Media</h3>
                    <p className="text-sm text-zinc-400">Photos & videos shown on the public layout map</p>
                </div>
                <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 font-semibold text-black transition active:scale-95">
                    <Upload size={18} /> Upload
                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        className="hidden"
                        onChange={onFiles}
                        disabled={uploading}
                    />
                </label>
            </div>

            {uploading && (
                <div className="mb-4 rounded-xl border border-[#D4AF37]/40 bg-[#17171D] px-4 py-3 text-sm text-[#D4AF37]">
                    {progress}
                </div>
            )}

            {loading ? (
                <p className="text-zinc-500">Loading media…</p>
            ) : rows.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 p-10 text-center text-zinc-500">
                    No media yet. Upload photos or videos to show them on the map.
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {rows.map((m) => (
                        <div key={m.id} className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#141419]">
                            <div className="relative aspect-video bg-black">
                                {m.type === "video" ? (
                                    <video src={m.url} className="h-full w-full object-cover" muted playsInline />
                                ) : (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={m.url} alt={m.caption || "media"} className="h-full w-full object-cover" />
                                )}
                                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-semibold text-white">
                                    {m.type === "video" ? <Video size={11} /> : <ImageIcon size={11} />}
                                    {m.type}
                                </span>
                                <button
                                    onClick={() => remove(m.id)}
                                    className="absolute right-2 top-2 rounded-lg bg-red-500/80 p-1.5 text-white"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <input
                                defaultValue={m.caption || ""}
                                placeholder="Add caption…"
                                onBlur={(e) => saveCaption(m.id, e.target.value)}
                                className="w-full border-t border-zinc-800 bg-transparent px-3 py-2 text-xs text-white outline-none placeholder:text-zinc-600"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}