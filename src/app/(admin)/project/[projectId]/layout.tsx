"use client";

import { ReactNode } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ArrowLeft, LayoutDashboard, Map, Users, Mail } from "lucide-react";

const PROJECTS: Record<string, { name: string; sub: string }> = {
    "basava-ganguru": { name: "Basava Ganguru", sub: "Residential Layout" },
};

export default function ProjectLayout({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams<{ projectId: string }>();
    const projectId = params.projectId;

    const project = PROJECTS[projectId] || { name: "Project", sub: "Layout" };

    const nav = [
        { name: "Dashboard", href: `/project/${projectId}/dashboard`, icon: LayoutDashboard },
        { name: "Plots", href: `/project/${projectId}/plots`, icon: Map },
        { name: "Customers", href: `/project/${projectId}/customers`, icon: Users },
        { name: "Enquiries", href: `/project/${projectId}/enquiries`, icon: Mail },
    ];

    return (
        <main className="min-h-screen bg-[#0B0B0F] text-white">
            {/* Single header — the ONLY header in the whole admin */}
            <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-[#111114]/95 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center gap-4 px-5 py-4">
                    <button
                        onClick={() => router.push("/projects")}
                        className="rounded-xl bg-[#1A1A22] p-2.5 transition hover:bg-[#22222c] active:scale-95"
                        aria-label="Back to projects"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">{project.name}</h1>
                        <p className="text-xs text-zinc-400">{project.sub}</p>
                    </div>
                </div>
            </header>

            {/* Page content — pages render NO header of their own */}
            <section className="mx-auto max-w-5xl px-5 pb-28 pt-5">{children}</section>

            {/* Bottom navigation */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-[#111114]/95 backdrop-blur">
                <div className="mx-auto grid max-w-5xl grid-cols-4">
                    {nav.map((item) => {
                        const active = pathname.startsWith(item.href);
                        return (
                            <button
                                key={item.name}
                                onClick={() => router.push(item.href)}
                                className={`flex flex-col items-center gap-1 py-3 transition ${active ? "text-[#D4AF37]" : "text-zinc-500 hover:text-zinc-300"
                                    }`}
                            >
                                <item.icon size={22} />
                                <span className="text-[11px] font-medium">{item.name}</span>
                            </button>
                        );
                    })}
                </div>
            </nav>
        </main>
    );
}