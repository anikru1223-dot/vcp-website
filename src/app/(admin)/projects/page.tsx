"use client";

import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, Building2 } from "lucide-react";

type Project = {
    id: string;
    name: string;
    sub: string;
    location: string;
    plots: number;
    live: boolean;
};

const PROJECTS: Project[] = [
    {
        id: "basava-ganguru",
        name: "Basava Ganguru",
        sub: "Residential Layout",
        location: "Shivamogga, Karnataka",
        plots: 32,
        live: true,
    },
    // Second project goes here when ready:
    // { id: "project-two", name: "Project Two", sub: "Residential Layout", location: "…", plots: 0, live: false },
];

export default function ProjectsPage() {
    const router = useRouter();

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white">
            <div className="mx-auto max-w-3xl px-5 py-10">
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-[#D4AF37]">
                        <Building2 size={18} />
                        <span className="text-xs font-semibold uppercase tracking-widest">
                            Vijayalaxmi C Patil
                        </span>
                    </div>
                    <h1 className="mt-2 text-3xl font-bold">Projects</h1>
                    <p className="mt-1 text-zinc-400">Select a project to manage</p>
                </div>

                <div className="space-y-4">
                    {PROJECTS.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => p.live && router.push(`/project/${p.id}/dashboard`)}
                            disabled={!p.live}
                            className={`group flex w-full items-center justify-between rounded-2xl border border-zinc-800 bg-[#141419] p-6 text-left transition ${p.live
                                    ? "hover:border-[#D4AF37]/40 hover:bg-[#1A1A22] active:scale-[0.99]"
                                    : "cursor-not-allowed opacity-50"
                                }`}
                        >
                            <div>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-xl font-bold">{p.name}</h2>
                                    {p.live ? (
                                        <span className="rounded-full border border-green-500/30 bg-green-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-green-400">
                                            Live
                                        </span>
                                    ) : (
                                        <span className="rounded-full border border-zinc-600 bg-zinc-700/20 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-400">
                                            Coming soon
                                        </span>
                                    )}
                                </div>
                                <p className="mt-1 text-sm text-zinc-400">{p.sub}</p>
                                <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={13} />
                                        {p.location}
                                    </span>
                                    <span>{p.plots} plots</span>
                                </div>
                            </div>
                            {p.live && (
                                <ArrowRight
                                    size={22}
                                    className="text-zinc-600 transition group-hover:translate-x-1 group-hover:text-[#D4AF37]"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </main>
    );
}