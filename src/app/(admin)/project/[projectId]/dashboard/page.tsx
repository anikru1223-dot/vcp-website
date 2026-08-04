"use client";

import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowUpRight,
    LayoutDashboard,
    Map,
    Users,
    Mail,
    Home,
    MapPinned,
    TrendingUp,
    UserPlus,
    FileText,
    Clock,
    Sparkles,
} from "lucide-react";

// ---- Data (unchanged from the source page) ----
const PROJECT_STATS = {
    totalPlots: 32,
    available: 18,
    reserved: 3,
    sold: 11,
    customers: 27,
};

// Sample data — no activity feed was provided by the source page.
// Swap this for a real query (e.g. Supabase) keyed by projectId; shape is
// kept simple on purpose so it's a drop-in replacement.
const RECENT_ACTIVITY = [
    { id: 1, title: "Plot A12 Sold", time: "2 hours ago", meta: "Customer: John", tint: "rose" as const },
    { id: 2, title: "Plot B04 Reserved", time: "6 hours ago", meta: "Customer: Priya", tint: "amber" as const },
    { id: 3, title: "New enquiry received", time: "Yesterday", meta: "Plot C09", tint: "blue" as const },
];

function useGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
}

export default function DashboardPage() {
    const router = useRouter();
    const pathname = usePathname();
    const { projectId } = useParams<{ projectId: string }>();
    const greeting = useGreeting();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { totalPlots, available, reserved, sold, customers } = PROJECT_STATS;
    const availablePct = Math.round((available / totalPlots) * 100);
    const reservedPct = Math.round((reserved / totalPlots) * 100);
    const soldPct = Math.round((sold / totalPlots) * 100);
    const occupancyPct = Math.round(((sold + reserved) / totalPlots) * 100);

    const today = new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    const navItems = [
        { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: `/project/${projectId}/dashboard` },
        { key: "plots", label: "Plots", icon: Map, href: `/project/${projectId}/plots` },
        { key: "customers", label: "Customers", icon: Users, href: `/project/${projectId}/customers` },
        { key: "enquiries", label: "Enquiries", icon: Mail, href: `/project/${projectId}/enquiries` },
    ];

    return (
        <main className="relative min-h-screen overflow-hidden bg-white text-[#111111]">
            {/* Layered background */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute -top-16 right-[-15%] h-72 w-72 rounded-full bg-[#D4AF37]/[0.07] blur-[100px]" />
                <div className="absolute bottom-[15%] left-[-20%] h-72 w-72 rounded-full bg-gray-200/60 blur-[100px]" />
                <svg className="absolute inset-0 h-full w-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="dash-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#111111" strokeWidth="0.6" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dash-grid)" />
                </svg>
                <div
                    className="absolute inset-0 opacity-[0.02] mix-blend-multiply"
                    style={{
                        backgroundImage:
                            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                    }}
                />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-md">
                {/* Header */}
                <header
                    className={`sticky top-0 z-20 border-b border-[#ECECEC] bg-white/75 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-xl transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push("/projects")}
                            aria-label="Back to projects"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#F8F8FA] text-[#111111] transition active:scale-90"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div className="min-w-0">
                            <p className="text-[12px] font-medium text-[#6B7280]">
                                {greeting} · {today}
                            </p>
                            <div className="mt-0.5 flex items-center gap-2">
                                <h1 className="truncate text-[19px] font-bold tracking-tight">Basava Ganguru</h1>
                                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
                                    Active
                                </span>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className="inline-flex items-center rounded-full bg-[#F8F8FA] px-2.5 py-1 text-[11px] font-medium text-[#6B7280]">
                                    <MapPinned size={11} className="mr-1 text-[#D4AF37]" />
                                    Residential Layout
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="space-y-7 px-5 pb-[136px] pt-6">
                    {/* Hero */}
                    <section
                        style={sectionAnim(mounted, 0)}
                        className="relative overflow-hidden rounded-[28px] border border-[#ECECEC] bg-gradient-to-br from-[#F8F8FA] via-white to-[#FBF8EE] p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                    >
                        <Sparkles size={16} className="absolute right-6 top-6 text-[#D4AF37]/40" />
                        <p className="text-[13px] font-medium text-[#6B7280]">Portfolio Overview</p>

                        <div className="mt-4 flex items-center justify-between gap-4">
                            <div>
                                <p className="text-[13px] text-[#6B7280]">Total Plots</p>
                                <p className="mt-1 text-[44px] font-bold leading-none tracking-tight">
                                    {totalPlots}
                                </p>
                                <p className="mt-3 text-[13px] text-[#6B7280]">
                                    {sold + reserved} of {totalPlots} plots committed
                                </p>
                            </div>

                            <ProgressRing percent={occupancyPct} />
                        </div>
                    </section>

                    {/* Stats grid */}
                    <section className="grid grid-cols-2 gap-3.5">
                        <StatCard
                            delay={1}
                            mounted={mounted}
                            icon={<Home size={20} />}
                            value={available}
                            label="Available"
                            share={`${availablePct}% of total`}
                            color="emerald"
                        />
                        <StatCard
                            delay={2}
                            mounted={mounted}
                            icon={<MapPinned size={20} />}
                            value={reserved}
                            label="Reserved"
                            share={`${reservedPct}% of total`}
                            color="amber"
                        />
                        <StatCard
                            delay={3}
                            mounted={mounted}
                            icon={<TrendingUp size={20} />}
                            value={sold}
                            label="Sold"
                            share={`${soldPct}% of total`}
                            color="rose"
                        />
                        <StatCard
                            delay={4}
                            mounted={mounted}
                            icon={<Users size={20} />}
                            value={customers}
                            label="Customers"
                            share="Total enquiries"
                            color="blue"
                        />
                    </section>

                    {/* Sales summary */}
                    <section style={sectionAnim(mounted, 5)} className="rounded-[28px] border border-[#ECECEC] bg-[#F8F8FA] p-6">
                        <h2 className="text-[16px] font-semibold">Sales Summary</h2>
                        <div className="mt-5 space-y-4">
                            <SummaryBar label="Available" value={available} pct={availablePct} mounted={mounted} color="bg-emerald-500" />
                            <SummaryBar label="Reserved" value={reserved} pct={reservedPct} mounted={mounted} color="bg-amber-500" />
                            <SummaryBar label="Sold" value={sold} pct={soldPct} mounted={mounted} color="bg-rose-500" />
                        </div>
                    </section>

                    {/* Performance */}
                    <section style={sectionAnim(mounted, 6)} className="rounded-[28px] border border-[#ECECEC] bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                        <h2 className="text-[16px] font-semibold">Performance</h2>
                        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                            <PerformanceMetric label="Sales" pct={soldPct} color="text-rose-500" />
                            <PerformanceMetric label="Reservation" pct={reservedPct} color="text-amber-500" />
                            <PerformanceMetric label="Occupancy" pct={occupancyPct} color="text-[#D4AF37]" />
                        </div>
                    </section>

                    {/* Recent activity */}
                    <section style={sectionAnim(mounted, 7)}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-[16px] font-semibold">Recent Activity</h2>
                            <span className="text-[12px] text-[#6B7280]">Sample data</span>
                        </div>

                        <div className="mt-3 space-y-2.5">
                            {RECENT_ACTIVITY.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 rounded-2xl border border-[#ECECEC] bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
                                >
                                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${tintBg(item.tint)}`}>
                                        <Clock size={15} className={tintText(item.tint)} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-[14px] font-semibold">{item.title}</p>
                                        <p className="text-[12px] text-[#6B7280]">
                                            {item.time} · {item.meta}
                                        </p>
                                    </div>
                                    <ArrowUpRight size={16} className="shrink-0 text-[#6B7280]" />
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Quick actions */}
                    <section style={sectionAnim(mounted, 8)}>
                        <h2 className="text-[16px] font-semibold">Quick Actions</h2>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <QuickAction
                                icon={<Map size={20} />}
                                label="View Plots"
                                gradient="from-emerald-50 to-white"
                                iconColor="text-emerald-600"
                                onClick={() => router.push(`/project/${projectId}/plots`)}
                            />
                            <QuickAction
                                icon={<UserPlus size={20} />}
                                label="Add Customer"
                                gradient="from-blue-50 to-white"
                                iconColor="text-blue-600"
                                onClick={() => router.push(`/project/${projectId}/customers`)}
                            />
                            <QuickAction
                                icon={<Mail size={20} />}
                                label="New Enquiry"
                                gradient="from-amber-50 to-white"
                                iconColor="text-amber-600"
                                onClick={() => router.push(`/project/${projectId}/enquiries`)}
                            />
                            <QuickAction
                                icon={<FileText size={20} />}
                                label="Generate Report"
                                gradient="from-[#FBF8EE] to-white"
                                iconColor="text-[#D4AF37]"
                                onClick={() => {
                                    // No report route exists yet on the source app —
                                    // wire this to your report endpoint/page when ready.
                                }}
                            />
                        </div>
                    </section>
                </div>
            </div>

            {/* Floating bottom navigation */}
            <nav
                aria-label="Primary"
                className="fixed inset-x-0 z-30 flex justify-center px-5"
                style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
                <div className="flex w-full max-w-[380px] items-center justify-between rounded-full border border-[#ECECEC] bg-white/80 px-2 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.08)] backdrop-blur-xl">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.key}
                                onClick={() => router.push(item.href)}
                                aria-label={item.label}
                                aria-current={active ? "page" : undefined}
                                className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 transition-all duration-300 active:scale-90 ${active ? "bg-[#D4AF37]/10" : ""
                                    }`}
                            >
                                <Icon size={20} className={active ? "text-[#D4AF37]" : "text-[#6B7280]"} />
                                <span className={`text-[10px] font-medium ${active ? "text-[#D4AF37]" : "text-[#6B7280]"}`}>
                                    {item.label}
                                </span>
                                {active && (
                                    <span className="absolute -top-1 h-1 w-1 rounded-full bg-[#D4AF37]" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            <style jsx global>{`
                @keyframes fadeSlideUp {
                    from {
                        opacity: 0;
                        transform: translateY(16px);
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

function sectionAnim(mounted: boolean, index: number): React.CSSProperties {
    return {
        animation: mounted ? "fadeSlideUp 0.6s cubic-bezier(0.16,1,0.3,1) both" : undefined,
        animationDelay: `${index * 70}ms`,
        opacity: mounted ? undefined : 0,
    };
}

function ProgressRing({ percent }: { percent: number }) {
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
            <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
                <circle cx="48" cy="48" r={radius} fill="none" stroke="#ECECEC" strokeWidth="8" />
                <circle
                    cx="48"
                    cy="48"
                    r={radius}
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.16,1,0.3,1)" }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-[18px] font-bold leading-none">{percent}%</span>
                <span className="mt-0.5 text-[9px] text-[#6B7280]">Occupied</span>
            </div>
        </div>
    );
}

type Tint = "emerald" | "amber" | "rose" | "blue";

function tintBg(t: Tint) {
    return { emerald: "bg-emerald-50", amber: "bg-amber-50", rose: "bg-rose-50", blue: "bg-blue-50" }[t];
}
function tintText(t: Tint) {
    return { emerald: "text-emerald-600", amber: "text-amber-600", rose: "text-rose-600", blue: "text-blue-600" }[t];
}

function StatCard({
    icon,
    value,
    label,
    share,
    color,
    mounted,
    delay,
}: {
    icon: React.ReactNode;
    value: number;
    label: string;
    share: string;
    color: Tint;
    mounted: boolean;
    delay: number;
}) {
    const accent = { emerald: "bg-emerald-500", amber: "bg-amber-500", rose: "bg-rose-500", blue: "bg-blue-500" }[color];
    const iconWrap = tintBg(color);
    const iconText = tintText(color);

    return (
        <div
            style={sectionAnim(mounted, delay)}
            className="relative overflow-hidden rounded-[26px] border border-[#ECECEC] bg-gradient-to-b from-[#F8F8FA] to-white p-5 shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-transform duration-200 active:scale-[0.97]"
        >
            <span className={`absolute left-0 top-0 h-full w-1 ${accent}`} />
            <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${iconWrap} ${iconText}`}>
                {icon}
            </div>
            <p className="mt-4 text-[30px] font-bold leading-none tracking-tight">{value}</p>
            <p className="mt-1.5 text-[13px] font-medium text-[#111111]">{label}</p>
            <p className="mt-0.5 text-[11px] text-[#6B7280]">{share}</p>
        </div>
    );
}

function SummaryBar({
    label,
    value,
    pct,
    mounted,
    color,
}: {
    label: string;
    value: number;
    pct: number;
    mounted: boolean;
    color: string;
}) {
    return (
        <div>
            <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-[#111111]">{label}</span>
                <span className="text-[#6B7280]">
                    {value} plots · {pct}%
                </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#ECECEC]">
                <div
                    className={`h-full rounded-full ${color} transition-all duration-[1100ms] ease-out`}
                    style={{ width: mounted ? `${pct}%` : "0%" }}
                />
            </div>
        </div>
    );
}

function PerformanceMetric({ label, pct, color }: { label: string; pct: number; color: string }) {
    return (
        <div className="rounded-2xl bg-[#F8F8FA] px-2 py-4">
            <p className={`text-[20px] font-bold ${color}`}>{pct}%</p>
            <p className="mt-1 text-[11px] text-[#6B7280]">{label}</p>
        </div>
    );
}

function QuickAction({
    icon,
    label,
    gradient,
    iconColor,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    gradient: string;
    iconColor: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`flex min-h-[88px] flex-col items-start justify-between rounded-[22px] border border-[#ECECEC] bg-gradient-to-br ${gradient} p-4 text-left shadow-[0_4px_16px_rgba(0,0,0,0.03)] transition-all duration-200 active:scale-[0.96]`}
        >
            <span className={iconColor}>{icon}</span>
            <span className="text-[13px] font-semibold text-[#111111]">{label}</span>
        </button>
    );
}