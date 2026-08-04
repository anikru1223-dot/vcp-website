"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Building2,
    MapPin,
    Plus,
    ArrowRight,
    LayoutGrid,
    CircleCheck,
    Clock,
    CheckCircle2,
} from "lucide-react";

type Project = {
    id: string;
    name: string;
    location: string;
    totalPlots: number;
    available: number;
    sold: number;
    reserved: number;
};

function useGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
}

export default function ProjectsPage() {
    const router = useRouter();
    const greeting = useGreeting();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const projects: Project[] = [
        {
            id: "basava-ganguru",
            name: "Basava Ganguru",
            location: "Shivamogga, Karnataka",
            totalPlots: 32,
            available: 18,
            sold: 11,
            reserved: 3,
        },
    ];

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    return (
        <main className="relative min-h-screen overflow-hidden bg-white text-[#111111]">
            {/* Layered background depth */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute -top-24 right-[-20%] h-72 w-72 rounded-full bg-[#D4AF37]/[0.08] blur-[100px]" />
                <div className="absolute bottom-[10%] left-[-25%] h-80 w-80 rounded-full bg-gray-200/50 blur-[100px]" />
                <svg className="absolute inset-0 h-full w-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="bp-grid" width="32" height="32" patternUnits="userSpaceOnUse">
                            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#111111" strokeWidth="0.6" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#bp-grid)" />
                </svg>
                <div
                    className="absolute inset-0 opacity-[0.02] mix-blend-multiply"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    }}
                />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[480px]">
                {/* Sticky header */}
                <header
                    className={`sticky top-0 z-20 border-b border-[#ECECEC] bg-white/75 px-5 pb-5 pt-[max(1.25rem,env(safe-area-inset-top))] backdrop-blur-xl transition-opacity duration-700 sm:px-6 ${mounted ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[13px] font-medium text-[#6B7280]">
                                {greeting} · {today}
                            </p>
                            <h1 className="mt-1 text-[26px] font-bold leading-tight tracking-tight text-[#111111] sm:text-[28px]">
                                Vijayalaxmi Developers
                            </h1>
                            <p className="mt-1 text-[13px] text-[#6B7280]">
                                {projects.length} Active {projects.length === 1 ? "Project" : "Projects"}
                            </p>
                        </div>

                        <div className="relative shrink-0">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#F4D96C] opacity-30 blur-md" />
                            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-gradient-to-br from-[#F8F8FA] to-white text-sm font-semibold text-[#B8912C] shadow-sm">
                                VD
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="space-y-5 px-4 pb-10 pt-6 sm:px-6">
                    {projects.length === 0 ? (
                        <EmptyState />
                    ) : (
                        projects.map((project, index) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                index={index}
                                mounted={mounted}
                                onOpen={() => router.push(`/project/${project.id}/dashboard`)}
                            />
                        ))
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes fadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(18px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </main>
    );
}

function ProjectCard({
    project,
    index,
    mounted,
    onOpen,
}: {
    project: Project;
    index: number;
    mounted: boolean;
    onOpen: () => void;
}) {
    const availablePct = Math.round((project.available / project.totalPlots) * 100);
    const reservedPct = Math.round((project.reserved / project.totalPlots) * 100);
    const soldPct = Math.round((project.sold / project.totalPlots) * 100);

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label={`Open ${project.name} dashboard`}
            onClick={onOpen}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onOpen();
            }}
            style={{
                animation: mounted ? `fadeSlideUp 0.65s cubic-bezier(0.16,1,0.3,1) both` : undefined,
                animationDelay: `${index * 90}ms`,
                opacity: mounted ? undefined : 0,
            }}
            className="group relative overflow-hidden rounded-[28px] border border-[#ECECEC] bg-[#F8F8FA] shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 active:scale-[0.985] sm:rounded-[32px]"
        >
            {/* Banner */}
            <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-[#FBF8EE] via-[#F8F8FA] to-white sm:h-48">
                <div className="absolute right-[-20%] top-[-30%] h-40 w-40 rounded-full bg-[#D4AF37]/15 blur-[60px]" />

                <svg className="absolute inset-0 h-full w-full opacity-[0.35]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id={`grid-${project.id}`} width="26" height="26" patternUnits="userSpaceOnUse">
                            <path d="M 26 0 L 0 0 0 26" fill="none" stroke="#D4AF37" strokeWidth="0.6" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#grid-${project.id})`} />
                    {/* abstract architectural lines */}
                    <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#D4AF37" strokeWidth="0.8" opacity="0.4" />
                    <line x1="35%" y1="0" x2="35%" y2="100%" stroke="#D4AF37" strokeWidth="0.8" opacity="0.3" />
                </svg>

                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/30 bg-white/70 shadow-sm backdrop-blur-md sm:h-20 sm:w-20">
                    <Building2 size={32} className="text-[#B8912C] sm:size-9" />
                </div>

                <div className="absolute right-4 top-4 rounded-full border border-[#ECECEC] bg-white/80 px-3 py-1.5 text-xs font-medium text-[#111111] shadow-sm backdrop-blur-md">
                    {project.totalPlots} Plots
                </div>
            </div>

            {/* Body */}
            <div className="rounded-t-[24px] bg-white p-5 sm:p-6">
                <h2 className="text-[20px] font-bold tracking-tight text-[#111111] sm:text-[22px]">
                    {project.name}
                </h2>

                <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#6B7280]">
                    <MapPin size={14} className="shrink-0 text-[#D4AF37]" />
                    <span className="truncate">{project.location}</span>
                </div>

                {/* Progress bar */}
                <div className="mt-6">
                    <div className="relative flex h-2.5 w-full overflow-hidden rounded-full bg-[#ECECEC]">
                        <div
                            className="h-full bg-emerald-500 transition-all duration-[1100ms] ease-out"
                            style={{ width: `${availablePct}%` }}
                        />
                        <div
                            className="h-full bg-amber-500 transition-all duration-[1100ms] ease-out"
                            style={{ width: `${reservedPct}%` }}
                        />
                        <div
                            className="h-full bg-rose-500 transition-all duration-[1100ms] ease-out"
                            style={{ width: `${soldPct}%` }}
                        />
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[#6B7280]">
                        <LegendDot color="bg-emerald-500" label="Available" pct={availablePct} />
                        <LegendDot color="bg-amber-500" label="Reserved" pct={reservedPct} />
                        <LegendDot color="bg-rose-500" label="Sold" pct={soldPct} />
                    </div>
                </div>

                {/* Stats */}
                <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
                    <StatBlock
                        icon={<CircleCheck size={16} className="text-emerald-600" />}
                        value={project.available}
                        label="Available"
                        tint="from-emerald-50 to-white border-emerald-100"
                    />
                    <StatBlock
                        icon={<Clock size={16} className="text-amber-600" />}
                        value={project.reserved}
                        label="Reserved"
                        tint="from-amber-50 to-white border-amber-100"
                    />
                    <StatBlock
                        icon={<CheckCircle2 size={16} className="text-rose-600" />}
                        value={project.sold}
                        label="Sold"
                        tint="from-rose-50 to-white border-rose-100"
                    />
                </div>

                {/* CTA */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpen();
                    }}
                    className="mt-5 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F4D96C] font-semibold text-black shadow-[0_8px_20px_rgba(212,175,55,0.28)] transition-all duration-200 hover:shadow-[0_10px_26px_rgba(212,175,55,0.4)] active:scale-[0.97]"
                >
                    Open Dashboard
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}

function LegendDot({ color, label, pct }: { color: string; label: string; pct: number }) {
    return (
        <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
            {label} <span className="text-[#111111]/70">{pct}%</span>
        </span>
    );
}

function StatBlock({
    icon,
    value,
    label,
    tint,
}: {
    icon: React.ReactNode;
    value: number;
    label: string;
    tint: string;
}) {
    return (
        <div className={`rounded-2xl border bg-gradient-to-b px-2 py-4 text-center ${tint}`}>
            <div className="flex justify-center">{icon}</div>
            <p className="mt-1.5 text-[20px] font-bold text-[#111111] sm:text-[22px]">{value}</p>
            <p className="mt-0.5 text-[11px] text-[#6B7280]">{label}</p>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="relative overflow-hidden rounded-[28px] border border-dashed border-[#ECECEC] bg-[#F8F8FA] px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.06]">
                <LayoutGrid size={26} className="text-[#B8912C]" />
            </div>
            <h3 className="text-[17px] font-semibold text-[#111111]">No projects yet</h3>
            <p className="mx-auto mt-1.5 max-w-[260px] text-[13px] text-[#6B7280]">
                Add your first development site to start tracking plots, reservations, and sales.
            </p>
            <button className="mx-auto mt-5 flex min-h-[44px] items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F4D96C] px-5 font-semibold text-black active:scale-[0.97]">
                <Plus size={16} />
                Add Project
            </button>
        </div>
    );
}