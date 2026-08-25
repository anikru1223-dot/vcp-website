"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { createClient } from "@/lib/supabase/client"; // adjust path to your client

/**
 * Basava Ganguru — Interactive Master Layout (AR3D style)
 */

type Plot = {
    id: string; pts: string; dim: string; facing: string; sqm: number; sqft: number;
};

type Status = "available" | "reserved" | "sold";

type MediaItem = { id: string; type: "image" | "video"; url: string; caption: string | null };

const STATUS_META: Record<Status, { label: string; fill: string; sel: string; legend: string }> = {
    available: { label: "Available", fill: "url(#plotFill)", sel: "url(#plotSel)", legend: "linear-gradient(180deg,#568636,#365b21)" },
    reserved: { label: "Reserved", fill: "url(#plotInt)", sel: "url(#plotIntSel)", legend: "linear-gradient(180deg,#f5b942,#d98a1f)" },
    sold: { label: "Sold", fill: "url(#plotSold)", sel: "url(#plotSoldSel)", legend: "linear-gradient(180deg,#e0504a,#a52a24)" },
};

// Decorative background artwork rendered behind the map. Drop the supplied
// watercolor border illustration into your Next.js /public folder (e.g.
// /public/layout-bg-watercolor.png) and update the path below if needed.
const MAP_BG_IMAGE = "/layout-bg-watercolor.png";

const PLOTS: Plot[] = [
    { id: "1", pts: "250,262 330,262 330,366 250,366", dim: "9.00 × 15.00 m", facing: "North", sqm: 135.0, sqft: 1453 },
    { id: "2", pts: "330,262 410,262 410,366 330,366", dim: "9.00 × 15.00 m", facing: "North", sqm: 135.0, sqft: 1453 },
    { id: "3", pts: "410,262 490,262 490,366 410,366", dim: "7.60/8.70 × 15.05/15.00 m", facing: "North", sqm: 122.5, sqft: 1319 },
    { id: "4", pts: "250,366 330,366 330,470 250,470", dim: "9.00/9.05 × 12.15/11.50 m", facing: "South", sqm: 106.7, sqft: 1149 },
    { id: "5", pts: "330,366 410,366 410,470 330,470", dim: "9.00/9.05 × 11.50/10.80 m", facing: "South", sqm: 100.6, sqft: 1083 },
    { id: "6", pts: "410,366 490,366 490,470 410,470", dim: "8.70/9.50 × 10.10/10.80 m", facing: "South", sqm: 95.1, sqft: 1024 },
    { id: "7", pts: "140,528 230,528 230,648 140,648", dim: "8.15/9.80 × 9.45/9.30 m", facing: "North", sqm: 84.1, sqft: 905 },
    { id: "8", pts: "230,528 320,528 320,648 230,648", dim: "9.30 × 12.00 m", facing: "North", sqm: 111.6, sqft: 1201 },
    { id: "9", pts: "320,528 411,528 411,648 320,648", dim: "9.30 × 12.00 m", facing: "North", sqm: 111.6, sqft: 1201 },
    { id: "10", pts: "411,528 502,528 502,648 411,648", dim: "9.30 × 12.00 m", facing: "North", sqm: 111.6, sqft: 1201 },
    { id: "11", pts: "560,262 627,262 627,352 560,352", dim: "9.05/9.00 × 14.00/13.35 m", facing: "North", sqm: 123.4, sqft: 1328 },
    { id: "12", pts: "560,352 673,352 673,451 560,451", dim: "9.00 × 12.00 m", facing: "West", sqm: 108.0, sqft: 1163 },
    { id: "13", pts: "560,451 673,451 673,551 560,551", dim: "9.00 × 12.00 m", facing: "West", sqm: 108.0, sqft: 1163 },
    { id: "14", pts: "560,551 673,551 673,650 560,650", dim: "9.00 × 12.00 m", facing: "West", sqm: 108.0, sqft: 1163 },
    { id: "15", pts: "560,650 673,650 673,749 560,749", dim: "9.00 × 12.00 m", facing: "West", sqm: 108.0, sqft: 1163 },
    { id: "16", pts: "560,749 673,749 673,849 560,849", dim: "9.00 × 12.00 m", facing: "West", sqm: 108.0, sqft: 1163 },
    { id: "17", pts: "560,849 673,849 673,948 560,948", dim: "11.35/10.30 × 12.05/12.00 m", facing: "South", sqm: 130.2, sqft: 1401 },
    { id: "18", pts: "673,849 786,849 786,948 673,948", dim: "10.30/8.90 × 16.00/16.05 m", facing: "South", sqm: 153.8, sqft: 1655 },
    { id: "19", pts: "673,749 786,749 786,849 673,849", dim: "9.00 × 16.05 m", facing: "East", sqm: 144.5, sqft: 1555 },
    { id: "20", pts: "673,650 786,650 786,749 673,749", dim: "9.00 × 16.05 m", facing: "East", sqm: 144.5, sqft: 1555 },
    { id: "21", pts: "673,551 786,551 786,650 673,650", dim: "9.00 × 16.05 m", facing: "East", sqm: 144.5, sqft: 1555 },
    { id: "22", pts: "673,451 786,451 786,551 673,551", dim: "9.00 × 16.05 m", facing: "East", sqm: 144.5, sqft: 1555 },
    { id: "23", pts: "673,352 786,352 786,451 673,451", dim: "9.00 × 16.05 m", facing: "East", sqm: 144.5, sqft: 1555 },
    { id: "24", pts: "700,262 786,262 786,352 700,352", dim: "10.05 × 12.65/11.90 m", facing: "North", sqm: 123.4, sqft: 1328 },
    { id: "25", pts: "627,262 700,262 700,352 627,352", dim: "9.05/9.00 × 13.35 m", facing: "North", sqm: 120.5, sqft: 1297 },
    { id: "26", pts: "858,262 986,275 986,360 858,360", dim: "15.10/9.25 × 10.35/15.05 m", facing: "North", sqm: 154.6, sqft: 1664 },
    { id: "27", pts: "858,360 986,360 986,458 858,458", dim: "9.00 × 15.00 m", facing: "East", sqm: 135.0, sqft: 1453 },
    { id: "28", pts: "858,458 986,458 986,556 858,556", dim: "9.00 × 15.00 m", facing: "East", sqm: 135.0, sqft: 1453 },
    { id: "29", pts: "858,556 986,556 986,654 858,654", dim: "9.00 × 15.00 m", facing: "East", sqm: 135.0, sqft: 1453 },
    { id: "30", pts: "858,654 986,654 986,752 858,752", dim: "9.00 × 15.00 m", facing: "East", sqm: 135.0, sqft: 1453 },
    { id: "31", pts: "858,752 986,752 986,850 858,850", dim: "9.00 × 15.00 m", facing: "East", sqm: 135.0, sqft: 1453 },
    { id: "32", pts: "858,850 986,850 972,948 858,948", dim: "15.00/16.10 × 9.00/7.65 m", facing: "South", sqm: 129.5, sqft: 1394 },
];

type Sides = { n: string; e: string; s: string; w: string; facing: string };
const SIDES: Record<string, Sides> = {
    "1": { n: "9.00", e: "15.00", s: "9.00", w: "15.00", facing: "North" },
    "2": { n: "9.00", e: "15.00", s: "9.00", w: "15.00", facing: "North" },
    "3": { n: "7.60", e: "15.05", s: "8.70", w: "15.00", facing: "North-East" },
    "4": { n: "9.00", e: "12.15", s: "9.05", w: "11.50", facing: "South" },
    "5": { n: "9.00", e: "10.80", s: "9.05", w: "12.15", facing: "South" },
    "6": { n: "8.70", e: "10.10", s: "9.50", w: "10.80", facing: "South-East" },
    "7": { n: "8.15", e: "9.45", s: "9.80", w: "9.30", facing: "North-West" },
    "8": { n: "9.30", e: "12.00", s: "9.30", w: "12.00", facing: "North" },
    "9": { n: "9.30", e: "12.00", s: "9.30", w: "12.00", facing: "North" },
    "10": { n: "9.30", e: "12.00", s: "9.30", w: "12.00", facing: "North-East" },
    "11": { n: "9.05", e: "13.35", s: "9.00", w: "14.00", facing: "North-West" },
    "12": { n: "9.00", e: "12.00", s: "9.00", w: "12.00", facing: "West" },
    "13": { n: "9.00", e: "12.00", s: "9.00", w: "12.00", facing: "West" },
    "14": { n: "9.00", e: "12.00", s: "9.00", w: "12.00", facing: "West" },
    "15": { n: "9.00", e: "12.00", s: "9.00", w: "12.00", facing: "West" },
    "16": { n: "9.00", e: "12.00", s: "9.00", w: "12.00", facing: "West" },
    "17": { n: "11.35", e: "12.05", s: "10.30", w: "12.00", facing: "South-West" },
    "18": { n: "10.30", e: "16.00", s: "8.90", w: "16.05", facing: "North-East" },
    "19": { n: "9.00", e: "16.05", s: "9.00", w: "16.05", facing: "East" },
    "20": { n: "9.00", e: "16.05", s: "9.00", w: "16.05", facing: "East" },
    "21": { n: "9.00", e: "16.05", s: "9.00", w: "16.05", facing: "East" },
    "22": { n: "9.00", e: "16.05", s: "9.00", w: "16.05", facing: "East" },
    "23": { n: "9.00", e: "16.05", s: "9.00", w: "16.05", facing: "East" },
    "24": { n: "10.05", e: "12.65", s: "10.05", w: "11.90", facing: "North-East" },
    "25": { n: "9.05", e: "13.35", s: "9.00", w: "13.35", facing: "North" },
    "26": { n: "15.10", e: "15.00", s: "9.25", w: "10.35", facing: "North-West" },
    "27": { n: "9.00", e: "15.00", s: "9.00", w: "15.00", facing: "West" },
    "28": { n: "9.00", e: "15.00", s: "9.00", w: "15.00", facing: "West" },
    "29": { n: "9.00", e: "15.00", s: "9.00", w: "15.00", facing: "West" },
    "30": { n: "9.00", e: "15.00", s: "9.00", w: "15.00", facing: "West" },
    "31": { n: "9.00", e: "15.00", s: "9.00", w: "15.00", facing: "West" },
    "32": { n: "15.00", e: "9.00", s: "16.10", w: "7.65", facing: "South-West" },
};

const BOUNDARY = "118,232 1108,268 1150,700 900,1090 118,1150 118,232";

const CA = "140,262 250,262 250,470 140,470";
const STP = "434,690 502,690 502,760 434,760";
const KARAB = "118,690 434,690 502,760 502,948 118,948";
const KARAB_LAKE = { cx: 290, cy: 830, rx: 140, ry: 70 };

const R9 = 58;
const R12 = 78;
const ROADS = {
    top: `118,${262 - R12} 1108,${262 - R12} 1108,262 118,262`,
    leftV: { x: 502, y: 262, w: R9, h: 686 },
    rightV: { x: 786, y: 262, w: 72, h: 686 },
    midH: { x: 118, y: 470, w: 442, h: R9 },
    path: { x: 118, y: 648, w: 384, h: 42 },
};

type ViewBox = { x: number; y: number; w: number; h: number };
type Point = { x: number; y: number };

const BASE_VB: ViewBox = { x: 60, y: 190, w: 1130, h: 1010 };

const centroid = (pts: string): Point => {
    const n = pts.split(/[ ,]+/).map(Number);
    let x = 0, y = 0, c = 0;
    for (let i = 0; i < n.length; i += 2) { x += n[i]; y += n[i + 1]; c++; }
    return { x: x / c, y: y / c };
};

function Tree({ x, y, s = 1, v = 0 }: { x: number; y: number; s?: number; v?: number }) {
    const fill = ["#3c6624", "#436f2c", "#345c20"][v % 3];
    return (
        <g transform={`translate(${x},${y}) scale(${s})`} pointerEvents="none">
            <ellipse cx="3" cy="7" rx="12" ry="4" fill="#0a1c08" opacity="0.32" />
            <circle cx="0" cy="0" r="12" fill={fill} />
            <circle cx="-3.5" cy="-3.5" r="4.5" fill="#6fa43f" opacity="0.55" />
        </g>
    );
}

function StreetLight({ x, y, night = false }: { x: number; y: number; night?: boolean }) {
    return (
        <g transform={`translate(${x},${y})`} pointerEvents="none">
            <circle r={night ? 28 : 15} fill="url(#lightPool)" opacity={night ? 1 : 0.6} />
            {night && <circle r="16" fill="#ffdd93" opacity="0.28" />}
            <circle r={night ? 8 : 6} fill="#ffdd93" opacity={night ? 0.6 : 0.3} />
            <circle r={night ? 3 : 2} fill="#fff9e6" />
        </g>
    );
}

function Stone({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
    return (
        <g transform={`translate(${x},${y}) scale(${s})`} pointerEvents="none">
            <ellipse cx="1.5" cy="2.5" rx="7" ry="2.6" fill="#000" opacity="0.18" />
            <ellipse cx="0" cy="0" rx="6" ry="4.2" fill="#a49c86" />
        </g>
    );
}

// ---------------------------------------------------------------------------
// Small shared icon set for the header / footer chrome
// ---------------------------------------------------------------------------

function IconCheck() {
    return (
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
        </svg>
    );
}

function IconLayers() {
    return (
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    );
}

function IconPin() {
    return (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.6" />
        </svg>
    );
}

function IconPhone() {
    return (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.62 10.79a15.1 15.1 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.02-.24 11 11 0 0 0 3.57.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C9.4 21 3 14.6 3 6a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1.02z" />
        </svg>
    );
}

function IconInfo() {
    return (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="12" y1="11" x2="12" y2="16.5" />
            <circle cx="12" cy="7.6" r="0.9" fill="currentColor" stroke="none" />
        </svg>
    );
}

function IconImage() {
    return (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <circle cx="8.5" cy="10" r="1.5" fill="currentColor" stroke="none" />
            <path d="M4 17l5-5 4 4 3-3 4 4" />
        </svg>
    );
}

function IconStar() {
    return (
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.8z" />
        </svg>
    );
}

export default function LayoutMap() {
    const [selected, setSelected] = useState<string | null>(null);
    const [tiqOpen, setTiqOpen] = useState(false);
    const [photosOpen, setPhotosOpen] = useState(false);
    const [contactOpen, setContactOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [amenitiesOpen, setAmenitiesOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<"location" | "contact" | "details" | "images" | "amenities" | null>(null);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [lightbox, setLightbox] = useState<number | null>(null);
    const [night, setNight] = useState(false);
    const [splash, setSplash] = useState(true);

    // Plot status (from Supabase) + active filter
    const [statusMap, setStatusMap] = useState<Record<string, Status>>({});
    const [filter, setFilter] = useState<Status | "all">("all");
    const [filterOpen, setFilterOpen] = useState(false);
    const projectId = "basava-ganguru";
    const supabase = createClient();

    // Log WhatsApp / Call taps to Supabase (non-blocking)
    const logEnquiry = async (type: "whatsapp" | "call", plotId: string) => {
        try {
            await supabase.from("enquiries").insert({
                project_id: projectId,
                plot_id: plotId,
                type,
                message: type === "whatsapp" ? `Interested in Plot ${plotId}` : `Call requested for Plot ${plotId}`,
            });
        } catch {
            /* never block the user */
        }
    };

    useEffect(() => {
        const t = window.setTimeout(() => setSplash(false), 2000);
        return () => window.clearTimeout(t);
    }, []);

    // Lock page scroll while the map is on screen so nothing shifts underneath it.
    useEffect(() => {
        const prevBody = document.body.style.overflow;
        const prevHtml = document.documentElement.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevBody;
            document.documentElement.style.overflow = prevHtml;
        };
    }, []);

    useEffect(() => {
        let active = true;

        const load = async () => {
            const { data } = await supabase
                .from("plot_status")
                .select("plot_id,status")
                .eq("project_id", projectId);
            if (!active || !data) return;
            const m: Record<string, Status> = {};
            data.forEach((r: { plot_id: string; status: Status }) => { m[r.plot_id] = r.status; });
            setStatusMap(m);
        };
        load();

        const channel = supabase
            .channel("plot_status_map")
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

    // Load project media (photos/videos) for the Photos popup
    useEffect(() => {
        let alive = true;
        (async () => {
            const { data } = await supabase
                .from("project_media")
                .select("id,type,url,caption")
                .eq("project_id", projectId)
                .order("sort_order", { ascending: true })
                .order("created_at", { ascending: false });
            if (alive && data) setMedia(data as MediaItem[]);
        })();
        return () => { alive = false; };
    }, [projectId]);

    const wrapRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const cameraRef = useRef<SVGGElement | null>(null);
    const compassRef = useRef<SVGGElement | null>(null);

    type Cam = { s: number; tx: number; ty: number; rot: number };
    const cur = useRef<Cam>({ s: 1, tx: 0, ty: 0, rot: 0 });
    const target = useRef<Cam>({ s: 1, tx: 0, ty: 0, rot: 0 });
    const raf = useRef<number | null>(null);
    const animating = useRef(false);
    const drag = useRef<{ px: number; py: number; tx: number; ty: number } | null>(null);
    const gesture = useRef<{ d: number; ang: number; cx: number; cy: number } | null>(null);
    const [, forceCompass] = useState(0);

    const sel = PLOTS.find((p) => p.id === selected) || null;
    const selStatus: Status | undefined = sel ? statusMap[sel.id] : undefined;

    const S_MIN = 0.35, S_MAX = 14;

    const baseScaleRef = useRef(1);
    const computeBaseScale = () => {
        const el = wrapRef.current; if (!el) return 1;
        const r = el.getBoundingClientRect();
        return Math.min(r.width / BASE_VB.w, r.height / BASE_VB.h) || 1;
    };

    const clampPan = (c: Cam, elastic = false): Cam => {
        const el = wrapRef.current; if (!el) return c;
        const r = el.getBoundingClientRect();
        const bs = baseScaleRef.current || 1;
        const contentW = BASE_VB.w * bs * c.s;
        const contentH = BASE_VB.h * bs * c.s;
        const slackX = r.width * 0.18, slackY = r.height * 0.18;
        const minTx = r.width - contentW - slackX, maxTx = slackX;
        const minTy = r.height - contentH - slackY, maxTy = slackY;
        const soft = (val: number, lo: number, hi: number) => {
            if (lo > hi) { const mid = (lo + hi) / 2; return mid; }
            if (val < lo) return elastic ? lo - (lo - val) * 0.35 : lo;
            if (val > hi) return elastic ? hi + (val - hi) * 0.35 : hi;
            return val;
        };
        return { ...c, tx: soft(c.tx, minTx, maxTx), ty: soft(c.ty, minTy, maxTy) };
    };

    const paint = (c: Cam) => {
        if (cameraRef.current) {
            const bs = baseScaleRef.current || 1;
            const cx = BASE_VB.x + BASE_VB.w / 2;
            const cy = BASE_VB.y + BASE_VB.h / 2;
            cameraRef.current.style.transform =
                `translate(${c.tx / bs}px,${c.ty / bs}px) scale(${c.s}) translate(${cx}px,${cy}px) rotate(${c.rot}deg) translate(${-cx}px,${-cy}px)`;
        }
        if (compassRef.current) compassRef.current.style.transform = `rotate(${-c.rot}deg)`;
    };

    const tick = useCallback(() => {
        const c = cur.current, t = target.current, k = 0.32;
        c.s += (t.s - c.s) * k;
        c.tx += (t.tx - c.tx) * k;
        c.ty += (t.ty - c.ty) * k;
        let dr = t.rot - c.rot; c.rot += dr * k;
        const done = Math.abs(t.s - c.s) < 0.0005 && Math.abs(t.tx - c.tx) < 0.1 &&
            Math.abs(t.ty - c.ty) < 0.1 && Math.abs(dr) < 0.05;
        if (done) {
            cur.current = { ...t }; paint(t); animating.current = false; raf.current = null;
            forceCompass((n) => n + 1); return;
        }
        paint(c); raf.current = requestAnimationFrame(tick);
    }, []);

    const startAnim = useCallback(() => {
        if (!animating.current) { animating.current = true; raf.current = requestAnimationFrame(tick); }
    }, [tick]);

    const setNow = (c: Cam) => {
        if (raf.current) { cancelAnimationFrame(raf.current); raf.current = null; }
        animating.current = false;
        cur.current = { ...c }; target.current = { ...c }; paint(c);
    };

    const zoomAt = (base: Cam, factor: number, cx: number, cy: number): Cam => {
        const ns = Math.min(S_MAX, Math.max(S_MIN, base.s * factor));
        const f = ns / base.s;
        return { s: ns, tx: cx - f * (cx - base.tx), ty: cy - f * (cy - base.ty), rot: base.rot };
    };

    const relPt = (clientX: number, clientY: number) => {
        const el = wrapRef.current; if (!el) return { x: 0, y: 0 };
        const r = el.getBoundingClientRect();
        return { x: clientX - r.left, y: clientY - r.top };
    };

    const smoothZoom = (factor: number, clientX: number, clientY: number) => {
        const p = relPt(clientX, clientY);
        target.current = clampPan(zoomAt(target.current, factor, p.x, p.y), false); startAnim();
    };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); smoothZoom(e.deltaY < 0 ? 1.22 : 1 / 1.22, e.clientX, e.clientY); };

    const dist = (a: React.Touch, b: React.Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const angle = (a: React.Touch, b: React.Touch) => Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI;

    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            const p = relPt((e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2);
            gesture.current = { d: dist(e.touches[0], e.touches[1]), ang: angle(e.touches[0], e.touches[1]), cx: p.x, cy: p.y };
            drag.current = null;
        } else if (e.touches.length === 1) {
            drag.current = { px: e.touches[0].clientX, py: e.touches[0].clientY, tx: cur.current.tx, ty: cur.current.ty };
        }
    };
    const onTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 2 && gesture.current) {
            e.preventDefault();
            const g = gesture.current, nd = dist(e.touches[0], e.touches[1]), na = angle(e.touches[0], e.touches[1]);
            const p = relPt((e.touches[0].clientX + e.touches[1].clientX) / 2, (e.touches[0].clientY + e.touches[1].clientY) / 2);
            let c = zoomAt(cur.current, nd / g.d, p.x, p.y);
            c = { ...c, tx: c.tx + (p.x - g.cx), ty: c.ty + (p.y - g.cy), rot: c.rot + (na - g.ang) };
            setNow(clampPan(c, true));
            g.d = nd; g.ang = na; g.cx = p.x; g.cy = p.y;
        } else if (e.touches.length === 1 && drag.current) {
            e.preventDefault();
            const d = drag.current;
            setNow(clampPan({ ...cur.current, tx: d.tx + (e.touches[0].clientX - d.px), ty: d.ty + (e.touches[0].clientY - d.py) }, true));
        }
    };
    const settle = () => { target.current = clampPan({ ...cur.current, s: Math.min(S_MAX, Math.max(S_MIN, cur.current.s)) }, false); startAnim(); };
    const onTouchEnd = (e: React.TouchEvent) => { if (e.touches.length === 0) { drag.current = null; gesture.current = null; settle(); } };
    const onMouseDown = (e: React.MouseEvent) => { drag.current = { px: e.clientX, py: e.clientY, tx: cur.current.tx, ty: cur.current.ty }; };
    const onMouseMove = (e: React.MouseEvent) => {
        const d = drag.current; if (!d) return;
        setNow(clampPan({ ...cur.current, tx: d.tx + (e.clientX - d.px), ty: d.ty + (e.clientY - d.py) }, true));
    };
    const onMouseUp = () => { if (drag.current) { drag.current = null; settle(); } };

    const reset = () => { target.current = { s: 1, tx: 0, ty: 0, rot: 0 }; startAnim(); };
    const btnZoom = (f: number) => { const el = wrapRef.current; if (el) { const r = el.getBoundingClientRect(); smoothZoom(f, r.left + r.width / 2, r.top + r.height / 2); } };
    const rotate = () => { target.current = { ...target.current, rot: target.current.rot + 45 }; startAnim(); };

    useEffect(() => {
        const el = wrapRef.current; if (!el) return;
        baseScaleRef.current = computeBaseScale();
        paint(cur.current);
        el.addEventListener("wheel", onWheel, { passive: false });
        const onResize = () => { baseScaleRef.current = computeBaseScale(); paint(cur.current); };
        window.addEventListener("resize", onResize);
        return () => { el.removeEventListener("wheel", onWheel); window.removeEventListener("resize", onResize); if (raf.current) cancelAnimationFrame(raf.current); };
    }, []);

    const trees: [number, number, number][] = [];
    const stones: [number, number, number][] = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const inCore = (x: number, y: number) => x > 108 && x < 1010 && y > 174 && y < 970;
    for (let g = 0; g < 34; g++) {
        const gx = -120 + rnd() * 1440;
        const gy = -60 + rnd() * 1420;
        const count = 5 + Math.floor(rnd() * 7);
        const spread = 55 + rnd() * 90;
        for (let j = 0; j < count; j++) {
            const ox = ((rnd() + rnd() - 1)) * spread;
            const oy = ((rnd() + rnd() - 1)) * spread;
            const x = gx + ox, y = gy + oy;
            if (inCore(x, y)) continue;
            trees.push([x, y, 1.1 + rnd() * 0.8]);
        }
    }
    for (let i = 0; i < 60; i++) {
        const x = -140 + rnd() * 1480;
        const y = -80 + rnd() * 1460;
        if (inCore(x, y)) continue;
        trees.push([x, y, 1.1 + rnd() * 0.7]);
    }
    for (let i = 0; i < 40; i++) {
        const x = -100 + rnd() * 1400;
        const y = -60 + rnd() * 1420;
        if (inCore(x, y)) continue;
        stones.push([x, y, 1 + rnd() * 1.2]);
    }

    const totalSites = PLOTS.length;

    return (
        <div className={`lm-root ${night ? "is-night" : ""}`}>
            <style>{css}</style>

            {splash && (
                <div className="lm-splash" onClick={() => setSplash(false)}>
                    <div className="lm-splash-inner">
                        <div className="lm-splash-logo" aria-hidden="true">
                            <svg viewBox="0 0 40 40" width="64" height="64">
                                <defs><linearGradient id="scg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6e6b0" /><stop offset="1" stopColor="#c9a24b" /></linearGradient></defs>
                                <path d="M20 3 L34 9 V21 C34 30 27 35 20 37 C13 35 6 30 6 21 V9 Z" fill="none" stroke="url(#scg)" strokeWidth="1.6" />
                                <rect x="14" y="16" width="5" height="12" fill="url(#scg)" /><rect x="21" y="13" width="5" height="15" fill="url(#scg)" />
                            </svg>
                        </div>
                        <div className="lm-splash-name">Basava Ganguru</div>
                        <div className="lm-splash-sub">VIJAYALAXMI C PATIL · SHIVAMOGGA</div>
                        <div className="lm-splash-tag">Residential Layout · 32 Plots</div>
                        <div className="lm-splash-bar"><span /></div>
                        <div className="lm-splash-loading">Loading master plan…</div>
                    </div>
                    <div className="lm-splash-credit">Built by Train IQ · trainiq.in</div>
                </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* HEADER — brand / Approved Layout badge, then search + Layers row  */}
            {/* ---------------------------------------------------------------- */}
            <header className="lm-head">
                <div className="lm-head-row1">
                    <div className="lm-brand">
                        <div className="lm-logo" aria-hidden="true">
                            <svg viewBox="0 0 40 40" width="30" height="30">
                                <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6e6b0" /><stop offset="1" stopColor="#c9a24b" /></linearGradient></defs>
                                <path d="M20 3 L34 9 V21 C34 30 27 35 20 37 C13 35 6 30 6 21 V9 Z" fill="none" stroke="url(#cg)" strokeWidth="1.6" />
                                <rect x="14" y="16" width="5" height="12" fill="url(#cg)" /><rect x="21" y="13" width="5" height="15" fill="url(#cg)" />
                            </svg>
                        </div>
                        <div>
                            <div className="lm-brand-name">Basava Ganguru</div>
                            <div className="lm-brand-sub">Interactive Masterplan</div>
                        </div>
                    </div>
                    <div className="lm-approved-badge">
                        <IconCheck />
                        <span>Approved Layout</span>
                    </div>
                </div>

                <div className="lm-head-row2">
                    <div className="lm-search">
                        <input
                            placeholder="Search plot (e.g. P-12)"
                            value={selected ?? ""}
                            onChange={(e) => { const v = e.target.value.trim(); setSelected(PLOTS.some((p) => p.id === v) ? v : null); }}
                        />
                    </div>

                    <div className="lm-filterwrap">
                        <button className="lm-layers-btn" onClick={() => setFilterOpen((v) => !v)} aria-label="Layers">
                            <IconLayers />
                            <span>Layers</span>
                            {filter !== "all" && <span className={`lm-layers-dot lm-fchip-${filter}`} />}
                        </button>

                        {filterOpen && (
                            <div className="lm-filtermenu">
                                <div className="lm-filtermenu-head">
                                    <span>Filter Plots</span>
                                    <button className="lm-menu-close" onClick={() => setFilterOpen(false)} aria-label="Close">
                                        <svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                                    </button>
                                </div>
                                {(["all", "available", "reserved", "sold"] as const).map((f) => (
                                    <button
                                        key={f}
                                        className={`lm-filteritem ${filter === f ? "active" : ""}`}
                                        onClick={() => { setFilter(f); setFilterOpen(false); }}
                                    >
                                        <span className={`lm-filteritem-dot lm-fchip-${f}`} />
                                        {f === "all" ? "All Plots" : STATUS_META[f].label}
                                    </button>
                                ))}
                            </div>
                        )}
                        {filterOpen && <div className="lm-filterbackdrop" onClick={() => setFilterOpen(false)} />}
                    </div>
                </div>
            </header>

            <div className="lm-stage" ref={wrapRef}
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>

                {/* Decorative watercolor base-art layer, sits behind the SVG map */}
                <div className="lm-bgart" style={{ backgroundImage: `url(${MAP_BG_IMAGE})` }} aria-hidden="true" />

                <svg ref={svgRef} viewBox={`${BASE_VB.x} ${BASE_VB.y} ${BASE_VB.w} ${BASE_VB.h}`} preserveAspectRatio="xMidYMid meet" className="lm-svg">
                    <defs>
                        <radialGradient id="terrain" cx="0.32" cy="0.22" r="1.15">
                            <stop offset="0" stopColor="#b6a468" /><stop offset="0.45" stopColor="#9c8a54" />
                            <stop offset="0.8" stopColor="#84733f" /><stop offset="1" stopColor="#6b5c32" />
                        </radialGradient>
                        <pattern id="terrainTex" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
                            <rect width="26" height="26" fill="transparent" />
                            <circle cx="5" cy="7" r="1" fill="#a89258" opacity="0.25" />
                            <circle cx="17" cy="15" r="0.9" fill="#75643a" opacity="0.3" />
                            <circle cx="12" cy="22" r="0.8" fill="#b6a468" opacity="0.2" />
                            <circle cx="22" cy="4" r="0.7" fill="#8a7846" opacity="0.25" />
                        </pattern>
                        <radialGradient id="patch" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0" stopColor="#8a9a4a" stopOpacity="0.35" /><stop offset="1" stopColor="#8a9a4a" stopOpacity="0" />
                        </radialGradient>

                        <linearGradient id="plotFill" x1="0" y1="0" x2="0.35" y2="1">
                            <stop offset="0" stopColor="#568636" /><stop offset="0.5" stopColor="#457029" /><stop offset="1" stopColor="#365b21" />
                        </linearGradient>
                        <linearGradient id="plotSel" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#8fd257" /><stop offset="1" stopColor="#5fa538" />
                        </linearGradient>
                        <linearGradient id="plotInt" x1="0" y1="0" x2="0.35" y2="1">
                            <stop offset="0" stopColor="#f5b942" /><stop offset="0.5" stopColor="#e09a2a" /><stop offset="1" stopColor="#b8791c" />
                        </linearGradient>
                        <linearGradient id="plotIntSel" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#ffd076" /><stop offset="1" stopColor="#e5a536" />
                        </linearGradient>
                        <linearGradient id="plotSold" x1="0" y1="0" x2="0.35" y2="1">
                            <stop offset="0" stopColor="#e0504a" /><stop offset="0.5" stopColor="#c23a34" /><stop offset="1" stopColor="#96271f" />
                        </linearGradient>
                        <linearGradient id="plotSoldSel" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#f27a74" /><stop offset="1" stopColor="#cc4038" />
                        </linearGradient>
                        <pattern id="turf" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                            <rect width="8" height="8" fill="transparent" />
                            <line x1="2" y1="7" x2="2.6" y2="3" stroke="#6aa347" strokeWidth="0.5" opacity="0.3" />
                            <line x1="5" y1="8" x2="5.5" y2="4" stroke="#3c6424" strokeWidth="0.5" opacity="0.3" />
                        </pattern>

                        <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#2e2a22" /><stop offset="0.12" stopColor="#413a2e" />
                            <stop offset="0.5" stopColor="#4c4436" /><stop offset="0.88" stopColor="#413a2e" /><stop offset="1" stopColor="#2e2a22" />
                        </linearGradient>
                        <linearGradient id="asphaltV" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stopColor="#2e2a22" /><stop offset="0.12" stopColor="#413a2e" />
                            <stop offset="0.5" stopColor="#4c4436" /><stop offset="0.88" stopColor="#413a2e" /><stop offset="1" stopColor="#2e2a22" />
                        </linearGradient>
                        <pattern id="asphaltTex" width="9" height="9" patternUnits="userSpaceOnUse">
                            <rect width="9" height="9" fill="transparent" />
                            <circle cx="2" cy="3" r="0.5" fill="#5c5342" opacity="0.4" />
                            <circle cx="6" cy="6" r="0.45" fill="#232019" opacity="0.5" />
                        </pattern>

                        <radialGradient id="lake" cx="0.38" cy="0.28" r="0.95">
                            <stop offset="0" stopColor="#bdeee6" /><stop offset="0.5" stopColor="#63b5ac" /><stop offset="1" stopColor="#2f7d78" />
                        </radialGradient>
                        <radialGradient id="grass" cx="0.4" cy="0.3" r="1">
                            <stop offset="0" stopColor="#a9d475" /><stop offset="0.6" stopColor="#8fbe5a" /><stop offset="1" stopColor="#77a648" />
                        </radialGradient>
                        <linearGradient id="ca" x1="0" y1="0" x2="0.4" y2="1">
                            <stop offset="0" stopColor="#a9d475" /><stop offset="1" stopColor="#77a648" />
                        </linearGradient>
                        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#f6e6b0" /><stop offset="0.5" stopColor="#d4ab54" /><stop offset="1" stopColor="#a9822f" />
                        </linearGradient>
                        <linearGradient id="stpRoof" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#cdb4ec" /><stop offset="1" stopColor="#9772c6" />
                        </linearGradient>

                        <filter id="plotSh" x="-25%" y="-25%" width="150%" height="150%">
                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.42" />
                        </filter>
                        <filter id="softSh" x="-40%" y="-40%" width="180%" height="180%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000" floodOpacity="0.4" />
                        </filter>
                        <filter id="selGlow" x="-70%" y="-70%" width="240%" height="240%">
                            <feDropShadow dx="0" dy="0" stdDeviation="9" floodColor="#a6ff7a" floodOpacity="0.95" />
                        </filter>
                        <filter id="treeSh" x="-60%" y="-60%" width="220%" height="220%">
                            <feDropShadow dx="2.5" dy="3" stdDeviation="1.6" floodColor="#000" floodOpacity="0.32" />
                        </filter>
                        <radialGradient id="lightPool" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0" stopColor="#ffe9b0" stopOpacity="0.6" /><stop offset="0.5" stopColor="#ffce6e" stopOpacity="0.2" /><stop offset="1" stopColor="#ffce6e" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="headBeam" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stopColor="#fff3c4" stopOpacity="0.7" /><stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
                        </linearGradient>
                        <radialGradient id="sun" cx="0.28" cy="0.16" r="0.9">
                            <stop offset="0" stopColor="#ffe4a0" stopOpacity="0.22" /><stop offset="0.5" stopColor="#ffd48a" stopOpacity="0.05" /><stop offset="1" stopColor="#000" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="vignette" cx="0.5" cy="0.46" r="0.85">
                            <stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.34" />
                        </radialGradient>
                    </defs>

                    <g ref={cameraRef} className="lm-camera">
                        <rect x={BASE_VB.x - 900} y={BASE_VB.y - 900} width={BASE_VB.w + 1800} height={BASE_VB.h + 1800} fill="url(#terrain)" />
                        <rect x={BASE_VB.x - 900} y={BASE_VB.y - 900} width={BASE_VB.w + 1800} height={BASE_VB.h + 1800} fill="url(#terrainTex)" />
                        <g pointerEvents="none">
                            <ellipse cx="220" cy="380" rx="130" ry="80" fill="url(#patch)" />
                            <ellipse cx="1000" cy="450" rx="150" ry="90" fill="url(#patch)" />
                            <ellipse cx="320" cy="1080" rx="160" ry="90" fill="url(#patch)" />
                            <ellipse cx="1050" cy="950" rx="140" ry="80" fill="url(#patch)" />
                            <ellipse cx="700" cy="1120" rx="180" ry="70" fill="url(#patch)" />
                        </g>

                        <g pointerEvents="none">
                            {[
                                { x: -700, y: -400, w: 520, h: 360, c: "#7ba045" },
                                { x: -700, y: 20, w: 520, h: 380, c: "#8caf52" },
                                { x: -700, y: 460, w: 470, h: 420, c: "#6f9a3e" },
                                { x: -680, y: 960, w: 560, h: 380, c: "#83a84c" },
                                { x: 1230, y: -360, w: 520, h: 420, c: "#7ba045" },
                                { x: 1260, y: 120, w: 500, h: 400, c: "#8caf52" },
                                { x: 1240, y: 580, w: 520, h: 440, c: "#6f9a3e" },
                                { x: 320, y: 1180, w: 640, h: 360, c: "#83a84c" },
                                { x: 120, y: -560, w: 560, h: 300, c: "#8caf52" },
                                { x: 760, y: -560, w: 520, h: 300, c: "#7ba045" },
                            ].map((f, i) => (
                                <g key={`fld${i}`}>
                                    <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="6" fill={f.c} opacity="0.9" />
                                    {Array.from({ length: Math.floor(f.h / 26) }).map((_, r) => (
                                        <line key={r} x1={f.x + 8} y1={f.y + 14 + r * 26} x2={f.x + f.w - 8} y2={f.y + 14 + r * 26} stroke="#5c8232" strokeWidth="1.5" opacity="0.4" />
                                    ))}
                                </g>
                            ))}

                            <rect x="300" y="-120" width="42" height="304" fill="#3a342a" />
                            <rect x="560" y="-120" width="46" height="304" fill="#3a342a" />
                            <rect x="820" y="-120" width="42" height="304" fill="#3a342a" />
                            <rect x="1108" y="184" width="60" height="900" fill="#3a342a" />
                            <rect x="1108" y="184" width="62" height="78" fill="#3a342a" />
                            <rect x="-40" y="470" width="158" height="58" fill="#3a342a" />
                            <rect x="502" y="948" width="58" height="360" fill="#3a342a" />
                            <rect x="786" y="948" width="72" height="360" fill="#3a342a" />

                            <g stroke="#e8d9a0" strokeWidth="2" strokeDasharray="10 12" opacity="0.5">
                                <line x1="321" y1="-110" x2="321" y2="180" />
                                <line x1="583" y1="-110" x2="583" y2="180" />
                                <line x1="841" y1="-110" x2="841" y2="180" />
                                <line x1="1138" y1="200" x2="1138" y2="1070" />
                            </g>

                            <g className="lm-syno">
                                <text x="300" y="-140" textAnchor="middle">Sy.No.39</text>
                                <text x="581" y="-140" textAnchor="middle">Sy.No.42</text>
                                <text x="70" y="430" textAnchor="middle" transform="rotate(-90 70 430)">Sy.No.44</text>
                                <text x="70" y="720" textAnchor="middle" transform="rotate(-90 70 720)">Sy.No.43/1</text>
                                <text x="1195" y="500" textAnchor="middle" transform="rotate(90 1195 500)">Sy.No.43/3</text>
                                <text x="1195" y="820" textAnchor="middle" transform="rotate(90 1195 820)">Sy.No.43/3</text>
                                <text x="600" y="1090" textAnchor="middle">Sy.No.46</text>
                            </g>

                            <g pointerEvents="none">
                                <text x="321" y="60" className="lm-exist-lbl" textAnchor="middle" transform="rotate(-90 321 60)">EXISTING 9m ROAD</text>
                                <text x="583" y="60" className="lm-exist-lbl" textAnchor="middle" transform="rotate(-90 583 60)">EXISTING 9m ROAD</text>
                                <text x="841" y="60" className="lm-exist-lbl" textAnchor="middle" transform="rotate(-90 841 60)">EXISTING 9m ROAD</text>
                                <text x="1138" y="640" className="lm-exist-lbl" textAnchor="middle" transform="rotate(90 1138 640)">EXISTING 12m ROAD</text>
                            </g>

                            {[
                                { x: -520, y: 120, s: 1.2 }, { x: 1420, y: 300, s: 1.1 }, { x: -420, y: 720, s: 1 },
                                { x: 1480, y: 820, s: 1.2 }, { x: 560, y: 1360, s: 1.1 }, { x: -560, y: 1080, s: 1 },
                            ].map((h, i) => (
                                <g key={`hut${i}`} transform={`translate(${h.x},${h.y}) scale(${h.s})`}>
                                    <rect x="-20" y="12" width="40" height="6" fill="#000" opacity="0.15" />
                                    <rect x="-18" y="-6" width="36" height="20" rx="1" fill="#e8ddc8" />
                                    <polygon points="-22,-6 22,-6 14,-20 -14,-20" fill="#a8552f" />
                                    <rect x="-4" y="2" width="8" height="12" fill="#7a5a3a" />
                                </g>
                            ))}

                            <rect x="112" y="180" width="1002" height="774" rx="4" fill="none" stroke="#6b5c3f" strokeWidth="3" strokeDasharray="2 6" opacity="0.45" />
                        </g>


                        <g>
                            <g filter="url(#plotSh)">
                                <polygon points={ROADS.top} fill="url(#asphalt)" />
                                <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} fill="url(#asphaltV)" />
                                <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} fill="url(#asphaltV)" />
                                <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} fill="url(#asphalt)" />
                            </g>
                            <g opacity="0.9" pointerEvents="none">
                                <polygon points={ROADS.top} fill="url(#asphaltTex)" />
                                <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} fill="url(#asphaltTex)" />
                                <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} fill="url(#asphaltTex)" />
                                <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} fill="url(#asphaltTex)" />
                            </g>
                            <g className="lm-kerb" pointerEvents="none">
                                <polygon points={ROADS.top} />
                                <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} />
                                <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} />
                                <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} />
                            </g>
                            <rect x={ROADS.path.x} y={ROADS.path.y} width={ROADS.path.w} height={ROADS.path.h} fill="#7d7454" opacity="0.95" />
                            <g className="lm-paver" pointerEvents="none">
                                {Array.from({ length: Math.floor((ROADS.path.w - 14) / 30) }).map((_, i) => (
                                    <line key={i} x1={ROADS.path.x + 14 + i * 30} y1={ROADS.path.y} x2={ROADS.path.x + 14 + i * 30} y2={ROADS.path.y + ROADS.path.h} />
                                ))}
                            </g>
                            <g className="lm-lane" pointerEvents="none">
                                <line x1="531" y1="270" x2="531" y2="944" />
                                <line x1="822" y1="270" x2="822" y2="944" />
                                <line x1="122" y1="499" x2="500" y2="499" />
                                <line x1="118" y1="223" x2="1108" y2="223" />
                            </g>
                            <g className="lm-drain" pointerEvents="none">
                                <circle cx="531" cy="360" r="3.4" /><circle cx="531" cy="640" r="3.4" /><circle cx="531" cy="880" r="3.4" />
                                <circle cx="822" cy="420" r="3.4" /><circle cx="822" cy="700" r="3.4" /><circle cx="822" cy="900" r="3.4" />
                            </g>
                            <g pointerEvents="none">
                                <text x="600" y="216" className="lm-road-lbl lm-road-lbl-lg">APPROVED LAYOUT 12m ROAD</text>
                                <text x="531" y="620" className="lm-road-lbl" transform="rotate(-90 531 620)">9m ROAD</text>
                                <text x="822" y="620" className="lm-road-lbl" transform="rotate(-90 822 620)">9m ROAD</text>
                                <text x="300" y="504" className="lm-road-lbl">9m ROAD</text>
                                <text x="300" y="666" className="lm-road-lbl lm-road-lbl-sm">3m PATHWAY</text>
                            </g>

                            <polygon points={KARAB} fill="url(#grass)" filter="url(#plotSh)" />
                            <polygon points={KARAB} fill="url(#turf)" opacity="0.5" pointerEvents="none" />
                            <polygon points={KARAB} className="lm-turf-edge" pointerEvents="none" />
                            <polygon points={KARAB} className="lm-amen-border" pointerEvents="none" />
                            <path d="M175,795 Q300,760 430,795 Q470,860 430,915 Q300,935 180,915 Q150,855 175,795 Z" className="lm-jog" pointerEvents="none" />
                            <ellipse cx={KARAB_LAKE.cx} cy={KARAB_LAKE.cy} rx={KARAB_LAKE.rx + 6} ry={KARAB_LAKE.ry + 5} fill="#7d8a5c" opacity="0.6" pointerEvents="none" />
                            <ellipse cx={KARAB_LAKE.cx} cy={KARAB_LAKE.cy} rx={KARAB_LAKE.rx} ry={KARAB_LAKE.ry} fill="url(#lake)" filter="url(#softSh)" />
                            <ellipse cx={KARAB_LAKE.cx + 10} cy={KARAB_LAKE.cy + 6} rx={KARAB_LAKE.rx * 0.62} ry={KARAB_LAKE.ry * 0.6} fill="#3f8f96" opacity="0.5" pointerEvents="none" />
                            <ellipse cx={KARAB_LAKE.cx - 40} cy={KARAB_LAKE.cy - 22} rx="54" ry="18" fill="#fff" opacity="0.28" pointerEvents="none" />
                            {[0.78, 0.55, 0.34].map((k, i) => (
                                <ellipse key={`rip${i}`} cx={KARAB_LAKE.cx} cy={KARAB_LAKE.cy} rx={KARAB_LAKE.rx * k} ry={KARAB_LAKE.ry * k} fill="none" stroke="#cfeef0" strokeWidth="1" opacity={0.22 - i * 0.04} pointerEvents="none" />
                            ))}
                            {Array.from({ length: 30 }).map((_, i) => {
                                const a = (i / 30) * Math.PI * 2;
                                return <circle key={i} cx={KARAB_LAKE.cx + Math.cos(a) * (KARAB_LAKE.rx + 6)} cy={KARAB_LAKE.cy + Math.sin(a) * (KARAB_LAKE.ry + 5)} r={2.4 + (i % 3) * 0.8} fill={i % 2 ? "#b3ab94" : "#9a927c"} opacity="0.85" pointerEvents="none" />;
                            })}
                            {[[200, 760, "#e07aa8"], [420, 770, "#f0b429"], [180, 905, "#c85a9a"], [440, 900, "#e8a020"]].map(([x, y, col], i) => (
                                <g key={i} pointerEvents="none">
                                    <circle cx={x as number} cy={y as number} r="9" fill="#3c6424" />
                                    <circle cx={(x as number) - 3} cy={(y as number) - 2} r="4" fill={col as string} />
                                    <circle cx={(x as number) + 3} cy={(y as number) + 1} r="3.4" fill={col as string} opacity="0.8" />
                                </g>
                            ))}
                            <text x="300" y="835" className="lm-amen-label">KARAB</text>

                            <polygon points={CA} fill="url(#ca)" filter="url(#plotSh)" />
                            <polygon points={CA} fill="url(#turf)" opacity="0.5" pointerEvents="none" />
                            <polygon points={CA} className="lm-turf-edge" pointerEvents="none" />
                            <polygon points={CA} className="lm-amen-border" pointerEvents="none" />
                            <g transform="translate(195,330)" pointerEvents="none">
                                <ellipse cx="0" cy="20" rx="30" ry="8" fill="#000" opacity="0.16" />
                                <rect x="-26" y="-6" width="52" height="24" rx="2" fill="#eef4ea" />
                                <polygon points="-30,-6 30,-6 22,-20 -22,-20" fill="#8fb87a" />
                                <rect x="-18" y="4" width="7" height="12" fill="#a9c99a" /><rect x="-4" y="4" width="7" height="12" fill="#a9c99a" /><rect x="10" y="4" width="7" height="12" fill="#a9c99a" />
                            </g>
                            <text x={centroid(CA).x} y={centroid(CA).y - 6} className="lm-ca-label">CA</text>
                            <text x={centroid(CA).x} y={centroid(CA).y + 40} className="lm-ca-sub">CIVIC AMENITY</text>

                            <polygon points={STP} fill="#e4d7f4" stroke="#9670c2" strokeWidth="1.4" strokeDasharray="4 3" filter="url(#softSh)" />
                            <rect x="446" y="704" width="40" height="38" rx="2" fill="#b9aecb" />
                            <polygon points="444,704 488,704 482,692 450,692" fill="url(#stpRoof)" />
                            <circle cx="456" cy="726" r="5" fill="#9d88c4" /><circle cx="474" cy="726" r="5" fill="#9d88c4" />
                            <text x={centroid(STP).x} y={centroid(STP).y + 6} className="lm-stp-label">STP</text>

                            {PLOTS.map((p) => {
                                const c = centroid(p.pts);
                                const isSel = p.id === selected;
                                const st = statusMap[p.id];
                                const effective: Status = st || "available";
                                const shown: Status = filter === "all" ? "available" : effective;
                                const meta = STATUS_META[shown];
                                const fillNormal = meta.fill;
                                const fillSel = meta.sel;
                                const dimmed = filter !== "all" && effective !== filter;
                                return (
                                    <g key={p.id} className="lm-plot" onClick={(e) => { e.stopPropagation(); setSelected(p.id); }}
                                        role="button" tabIndex={0}
                                        style={{ opacity: dimmed ? 0.25 : 1, transition: "opacity .25s ease" }}
                                        onKeyDown={(e: React.KeyboardEvent) => (e.key === "Enter" || e.key === " ") && setSelected(p.id)}>
                                        <polygon points={p.pts} className="lm-plot-shape"
                                            fill={isSel ? fillSel : fillNormal}
                                            stroke="url(#gold)" strokeWidth={isSel ? 2.6 : 1.3}
                                            filter={isSel ? "url(#selGlow)" : undefined} />
                                        <text x={c.x} y={c.y + 5} className="lm-plot-num">{p.id}</text>
                                    </g>
                                );
                            })}

                            <g>
                                {trees.map(([x, y, s], i) => <Tree key={i} x={x} y={y} s={s} v={i % 3} />)}
                                {stones.map(([x, y, s], i) => <Stone key={`s${i}`} x={x} y={y} s={s} />)}
                            </g>

                            {night
                                ? <rect x={BASE_VB.x - 900} y={BASE_VB.y - 900} width={BASE_VB.w + 1800} height={BASE_VB.h + 1800} fill="#0a1424" opacity="0.72" pointerEvents="none" />
                                : <polygon points={BOUNDARY} fill="url(#sun)" pointerEvents="none" />}

                            <g style={{ transition: "opacity .18s ease" }}>
                                {night && (
                                    <g pointerEvents="none">
                                        <polygon points={ROADS.top} fill="#5a5548" opacity="0.5" />
                                        <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} fill="#5a5548" opacity="0.5" />
                                        <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} fill="#5a5548" opacity="0.5" />
                                        <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} fill="#5a5548" opacity="0.5" />
                                        <polygon points={ROADS.top} fill="#4a463a" />
                                        <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} fill="#4a463a" />
                                        <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} fill="#4a463a" />
                                        <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} fill="#4a463a" />
                                        <g stroke="#fff0b8" strokeWidth="2.6" strokeDasharray="14 16" opacity="0.85" strokeLinecap="round">
                                            <line x1="531" y1="266" x2="531" y2="944" />
                                            <line x1="822" y1="266" x2="822" y2="944" />
                                            <line x1="122" y1="499" x2="556" y2="499" />
                                            <line x1="118" y1="223" x2="1108" y2="223" />
                                        </g>
                                    </g>
                                )}
                                {[
                                    [180, 223], [430, 223], [680, 223], [930, 223], [1060, 223],
                                    [531, 300], [531, 499], [531, 720], [531, 930],
                                    [822, 300], [822, 560], [822, 820], [822, 930],
                                    [150, 499], [340, 499],
                                ].map(([x, y], i) => <StreetLight key={i} x={x} y={y} night={night} />)}
                            </g>
                        </g>
                    </g>

                    <g transform="translate(1120,250)">
                        <circle r="20" fill="rgba(20,24,16,.72)" stroke="url(#gold)" strokeWidth="1.6" />
                        <path d="M0,-13 L4.5,3 L0,-1 L-4.5,3 Z" fill="#e0504a" />
                        <path d="M0,13 L4.5,-3 L0,1 L-4.5,-3 Z" fill="#6a7256" />
                        <text y="-24" textAnchor="middle" fill="#e7cd85" fontSize="12" fontWeight="800">N</text>
                    </g>
                </svg>

                {photosOpen && (
                    <div className="lm-photos-overlay" onClick={() => { setPhotosOpen(false); setActiveTab(null); }}>
                        <div className="lm-photos-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="lm-photos-head">
                                <span>Project Gallery</span>
                                <button className="lm-close" onClick={() => { setPhotosOpen(false); setActiveTab(null); }} aria-label="Close">
                                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                                </button>
                            </div>
                            {media.length === 0 ? (
                                <div className="lm-photos-empty">
                                    <svg viewBox="0 0 24 24" width="46" height="46" fill="none" stroke="#8b9280" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="M4 17l5-5 4 4 3-3 4 4" /></svg>
                                    <div>Photos coming soon</div>
                                </div>
                            ) : (
                                <div className="lm-photos-grid">
                                    {media.map((m, i) => (
                                        <button key={m.id} className="lm-photo-cell" onClick={() => setLightbox(i)}>
                                            {m.type === "video" ? (
                                                <>
                                                    <video src={m.url} muted playsInline preload="metadata" />
                                                    <span className="lm-photo-play">
                                                        <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
                                                    </span>
                                                </>
                                            ) : (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={m.url} alt={m.caption || "photo"} loading="lazy" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Lightbox — tap to enlarge */}
                {lightbox !== null && media[lightbox] && (
                    <div className="lm-lightbox" onClick={() => setLightbox(null)}>
                        <button className="lm-lightbox-close" onClick={() => setLightbox(null)} aria-label="Close">
                            <svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                        </button>
                        <div className="lm-lightbox-inner" onClick={(e) => e.stopPropagation()}>
                            {media[lightbox].type === "video" ? (
                                <video src={media[lightbox].url} controls autoPlay playsInline className="lm-lightbox-media" />
                            ) : (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={media[lightbox].url} alt={media[lightbox].caption || "photo"} className="lm-lightbox-media" />
                            )}
                            {media[lightbox].caption && <div className="lm-lightbox-cap">{media[lightbox].caption}</div>}
                        </div>
                        {media.length > 1 && (
                            <>
                                <button className="lm-lightbox-nav lm-prev" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + media.length) % media.length); }} aria-label="Previous">
                                    <svg viewBox="0 0 24 24" width="26" height="26"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                                <button className="lm-lightbox-nav lm-next" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % media.length); }} aria-label="Next">
                                    <svg viewBox="0 0 24 24" width="26" height="26"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Contact sheet */}
                {contactOpen && (
                    <div className="lm-sheet-overlay" onClick={() => { setContactOpen(false); setActiveTab(null); }}>
                        <div className="lm-sheet" onClick={(e) => e.stopPropagation()}>
                            <div className="lm-sheet-head">
                                <span>Contact Us</span>
                                <button className="lm-close" onClick={() => { setContactOpen(false); setActiveTab(null); }} aria-label="Close">
                                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                                </button>
                            </div>
                            <p className="lm-sheet-copy">Get in touch about Basava Ganguru — our team will help you pick the right plot.</p>
                            <div className="lm-cta-row">
                                <a className="lm-cta lm-cta-wa" href={`https://wa.me/919980061727?text=${encodeURIComponent("Hi, I'm interested in Basava Ganguru. Please share details.")}`} target="_blank" rel="noopener noreferrer">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.55 4.06 1.6 5.83L2 22l4.4-1.15a9.86 9.86 0 0 0 5.64 1.72c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.1c-.24.68-1.42 1.3-1.95 1.34-.5.04-1.13.23-3.7-.77-3.12-1.23-5.11-4.42-5.26-4.62-.15-.2-1.26-1.67-1.26-3.19 0-1.52.8-2.27 1.08-2.58.28-.31.61-.39.82-.39.2 0 .41 0 .59.01.19.01.44-.07.69.53.24.58.83 2.02.9 2.17.07.15.12.32.02.52-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.2.72-.84.91-1.13.19-.29.39-.24.65-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.72-.17 1.4z" /></svg>
                                    WhatsApp
                                </a>
                                <a className="lm-cta lm-cta-call" href="tel:+919980061727">
                                    <IconPhone />
                                    Call
                                </a>
                            </div>
                        </div>
                    </div>
                )}

                {/* Details sheet */}
                {detailsOpen && (
                    <div className="lm-sheet-overlay" onClick={() => { setDetailsOpen(false); setActiveTab(null); }}>
                        <div className="lm-sheet" onClick={(e) => e.stopPropagation()}>
                            <div className="lm-sheet-head">
                                <span>Layout Details</span>
                                <button className="lm-close" onClick={() => { setDetailsOpen(false); setActiveTab(null); }} aria-label="Close">
                                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                                </button>
                            </div>
                            <div className="lm-details-badge"><IconCheck /><span>Approved Layout</span></div>
                            <div className="lm-stats-grid">
                                <div className="lm-stat"><span className="lm-stat-v">{totalSites}</span><span className="lm-stat-l">Total Sites</span></div>
                                <div className="lm-stat"><span className="lm-stat-v">1,808 m²</span><span className="lm-stat-l">Park / Open Space</span></div>
                                <div className="lm-stat"><span className="lm-stat-v">2,778 m²</span><span className="lm-stat-l">Road Area</span></div>
                                <div className="lm-stat"><span className="lm-stat-v">9,552 m²</span><span className="lm-stat-l">Total Area</span></div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Amenities sheet */}
                {amenitiesOpen && (
                    <div className="lm-sheet-overlay" onClick={() => { setAmenitiesOpen(false); setActiveTab(null); }}>
                        <div className="lm-sheet" onClick={(e) => e.stopPropagation()}>
                            <div className="lm-sheet-head">
                                <span>Amenities</span>
                                <button className="lm-close" onClick={() => { setAmenitiesOpen(false); setActiveTab(null); }} aria-label="Close">
                                    <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                                </button>
                            </div>
                            <div className="lm-amen-list">
                                <div className="lm-amen-item">
                                    <div className="lm-amen-icon"><IconStar /></div>
                                    <div>
                                        <div className="lm-amen-name">Civic Amenity (CA)</div>
                                        <div className="lm-amen-desc">Dedicated civic amenity plot within the layout, reserved as per approved plan.</div>
                                    </div>
                                </div>
                                <div className="lm-amen-item">
                                    <div className="lm-amen-icon"><IconInfo /></div>
                                    <div>
                                        <div className="lm-amen-name">STP</div>
                                        <div className="lm-amen-desc">On-site sewage treatment plant serving the layout.</div>
                                    </div>
                                </div>
                                <div className="lm-amen-item">
                                    <div className="lm-amen-icon"><IconPin /></div>
                                    <div>
                                        <div className="lm-amen-name">Park / Open Space (Karab)</div>
                                        <div className="lm-amen-desc">Landscaped park with a lake feature, walking paths, and seating.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="lm-ctrl">
                    <button onClick={() => btnZoom(1.8)} aria-label="Zoom in"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg></button>
                    <button onClick={() => btnZoom(1 / 1.8)} aria-label="Zoom out"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg></button>
                    <button onClick={rotate} aria-label="Rotate"><svg viewBox="0 0 24 24" width="19" height="19"><path d="M4 9a8 8 0 1 1-.8 4" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" /><path d="M4 4v5h5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                    <button onClick={reset} aria-label="Reset"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" /></svg></button>
                    <button className={night ? "lm-ctrl-on" : ""} onClick={() => setNight((v) => !v)} aria-label="Toggle day / night">
                        {night ? (
                            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 2v2M12 20v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2 12h2M20 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4" strokeLinecap="round" /></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" strokeLinejoin="round" /></svg>
                        )}
                    </button>
                </div>

                <div className="lm-tiq-wrap">
                    {tiqOpen && (
                        <a className="lm-tiq-pop" href="https://trainiq.in" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <div className="lm-tiq-pop-title">Built by Train IQ</div>
                            <div className="lm-tiq-pop-sub">trainiq.in →</div>
                        </a>
                    )}
                    <button className="lm-tiq-logo" onClick={() => setTiqOpen((v) => !v)} aria-label="Train IQ">
                        <svg viewBox="0 0 62 34" width="46" height="25" aria-hidden="true">
                            <rect x="4" y="6" width="5.4" height="22" rx="1" fill="#14243c" />
                            <path d="M32 6.4 a11 11 0 1 0 6.4 19.9 l4.2 4.2 3.8-3.8 -4.1-4.1 A11 11 0 0 0 32 6.4 Z M32 11.4 a6 6 0 1 1 0 12 a6 6 0 0 1 0-12 Z" fill="#14243c" />
                            <rect x="50" y="22.5" width="5.6" height="5.6" rx="1" fill="#14243c" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Detail panel */}
            <div className={`lm-panel ${sel ? "open" : ""}`}>
                {sel && (
                    <>
                        <div className="lm-panel-head">
                            <div>
                                <div className="lm-panel-kicker">Plot</div>
                                <div className="lm-panel-title">#{sel.id}</div>
                            </div>
                            <button className="lm-close" onClick={() => setSelected(null)} aria-label="Close">
                                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                        <div className="lm-diagram">
                            <div className="lm-dimbox">
                                <span className="lm-dim lm-dim-top">{SIDES[sel.id]?.n} m</span>
                                <span className="lm-dim lm-dim-right">{SIDES[sel.id]?.e} m</span>
                                <span className="lm-dim lm-dim-bottom">{SIDES[sel.id]?.s} m</span>
                                <span className="lm-dim lm-dim-left">{SIDES[sel.id]?.w} m</span>
                                <div className="lm-dimbox-inner">
                                    <svg viewBox="0 0 24 24" width="16" height="16" className="lm-dim-compass"><path d="M12 3 L15 12 L12 10 L9 12 Z" fill="#d4ab54" /><path d="M12 21 L15 12 L12 14 L9 12 Z" fill="#7a6f4a" /></svg>
                                    <span className="lm-dim-facing">{SIDES[sel.id]?.facing}</span>
                                    <span className="lm-dim-facelbl">FACING</span>
                                </div>
                            </div>
                        </div>
                        <div className="lm-rows">
                            <div className="lm-row">
                                <span className="lm-row-l">STATUS</span>
                                <span className={`lm-status-badge lm-status-${selStatus || "available"}`}>
                                    {selStatus ? STATUS_META[selStatus].label : "Available"}
                                </span>
                            </div>
                            <Row label="SQ. FEET" value={`${sel.sqft.toLocaleString()} Sq.Ft`} />
                            <Row label="SQ. YARDS" value={`${Math.round(sel.sqft / 9)} Sq.Yrd`} />
                            <Row label="SQ. METERS" value={`${sel.sqm} Sq.M`} />
                            <Row label="FACING" value={SIDES[sel.id]?.facing || sel.facing} />
                        </div>
                        <div className="lm-cta-row">
                            <a className="lm-cta lm-cta-wa" onClick={() => logEnquiry("whatsapp", sel.id)} href={`https://wa.me/919980061727?text=${encodeURIComponent(`Hi, I'm interested in Plot ${sel.id} at Basava Ganguru. Please share details.`)}`} target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.55 4.06 1.6 5.83L2 22l4.4-1.15a9.86 9.86 0 0 0 5.64 1.72c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.1c-.24.68-1.42 1.3-1.95 1.34-.5.04-1.13.23-3.7-.77-3.12-1.23-5.11-4.42-5.26-4.62-.15-.2-1.26-1.67-1.26-3.19 0-1.52.8-2.27 1.08-2.58.28-.31.61-.39.82-.39.2 0 .41 0 .59.01.19.01.44-.07.69.53.24.58.83 2.02.9 2.17.07.15.12.32.02.52-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.2.72-.84.91-1.13.19-.29.39-.24.65-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.72-.17 1.4z" /></svg>
                                WhatsApp
                            </a>
                            <a className="lm-cta lm-cta-call" onClick={() => logEnquiry("call", sel.id)} href="tel:+919980061727">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
                                Call
                            </a>
                        </div>
                    </>
                )}
            </div>

            {!sel && <div className="lm-hint">Tap a plot · pinch to zoom · twist to rotate</div>}

            {/* ---------------------------------------------------------------- */}
            {/* FOOTER — bottom nav: Location · Contact · Details · Images · Amenities */}
            {/* ---------------------------------------------------------------- */}
            <nav className="lm-bottomnav">
                <a
                    className={`lm-navitem ${activeTab === "location" ? "active" : ""}`}
                    href="https://goo.gl/maps/JarvnMRnW7U7fYBp6?g_st=aw"
                    target="_blank" rel="noopener noreferrer"
                    onClick={() => setActiveTab("location")}
                >
                    <IconPin />
                    <span>Location</span>
                </a>
                <button
                    className={`lm-navitem ${activeTab === "contact" ? "active" : ""}`}
                    onClick={() => { setActiveTab("contact"); setContactOpen(true); }}
                >
                    <IconPhone />
                    <span>Contact</span>
                </button>
                <button
                    className={`lm-navitem ${activeTab === "details" ? "active" : ""}`}
                    onClick={() => { setActiveTab("details"); setDetailsOpen(true); }}
                >
                    <IconInfo />
                    <span>Details</span>
                </button>
                <button
                    className={`lm-navitem ${activeTab === "images" ? "active" : ""}`}
                    onClick={() => { setActiveTab("images"); setPhotosOpen(true); }}
                >
                    <IconImage />
                    <span>Images</span>
                </button>
                <button
                    className={`lm-navitem ${activeTab === "amenities" ? "active" : ""}`}
                    onClick={() => { setActiveTab("amenities"); setAmenitiesOpen(true); }}
                >
                    <IconStar />
                    <span>Amenities</span>
                </button>
            </nav>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="lm-row">
            <span className="lm-row-l">{label}</span>
            <span className="lm-row-v">{value}</span>
        </div>
    );
}

const css = `
.lm-root{
  --gold:#d4ab54; --gold-lt:#f2dd9a; --line:rgba(212,171,84,.32);
  --txt:#f3f6ee; --muted:#aeb6a4; --glass:rgba(18,22,16,.62); --navh:74px;
  position:fixed; top:0; left:0; right:0; bottom:0; width:100%; height:100%;
  background:radial-gradient(120% 90% at 30% 10%,#20261a,#0c0f0a);
  color:var(--txt); font-family:'Inter',system-ui,-apple-system,sans-serif;
  overflow:hidden; overscroll-behavior:none; touch-action:none;
}

.lm-head{ position:absolute; top:0; left:0; right:0; z-index:6;
  display:flex; flex-direction:column; gap:10px;
  padding:calc(env(safe-area-inset-top,0px) + 12px) 16px 12px;
  background:linear-gradient(180deg,rgba(8,11,7,.92),rgba(8,11,7,.55) 75%,transparent);
  backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); }
.lm-head-row1{ display:flex; align-items:center; justify-content:space-between; gap:12px; }
.lm-head-row2{ display:flex; align-items:center; gap:10px; }
.lm-brand{ display:flex; align-items:center; gap:11px; min-width:0; }
.lm-logo{ display:flex; flex-shrink:0; filter:drop-shadow(0 2px 10px rgba(212,171,84,.4)); }
.lm-brand-name{ font-family:'Playfair Display',Georgia,serif; font-weight:800; font-size:21px; line-height:1;
  background:linear-gradient(180deg,#fdf6e2,#e7cd85 55%,#c9a24b);
  -webkit-background-clip:text; background-clip:text; color:transparent; letter-spacing:-.01em;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.lm-brand-sub{ font-size:10px; color:var(--muted); letter-spacing:.1em; text-transform:uppercase; margin-top:3px; }

.lm-approved-badge{ display:flex; align-items:center; gap:6px; flex-shrink:0;
  background:rgba(86,134,54,.18); color:#8fd257; border:1px solid rgba(86,134,54,.5);
  border-radius:999px; padding:7px 13px; font-size:10.5px; font-weight:800; letter-spacing:.02em; white-space:nowrap; }

.lm-search{ flex:1; min-width:0; position:relative; }
.lm-search::before{ content:""; position:absolute; left:14px; top:50%; transform:translateY(-50%);
  width:15px; height:15px; border:2px solid var(--gold); border-radius:50%;
  box-shadow:0 0 0 0 transparent; opacity:.8; }
.lm-search::after{ content:""; position:absolute; left:25px; top:calc(50% + 4px); width:6px; height:2px;
  background:var(--gold); transform:rotate(45deg); opacity:.8; border-radius:2px; }
.lm-search input{ width:100%; box-sizing:border-box; background:var(--glass);
  border:1px solid var(--line); border-radius:999px; padding:11px 16px 11px 38px;
  color:var(--txt); font-size:13px; outline:none; backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
  transition:border-color .2s, box-shadow .2s; }
.lm-search input:focus{ border-color:var(--gold); box-shadow:0 0 0 3px rgba(212,171,84,.18); }
.lm-search input::placeholder{ color:#8b9280; }

.lm-layers-btn{ position:relative; flex-shrink:0; display:flex; align-items:center; gap:7px;
  background:var(--glass); border:1px solid var(--line); color:var(--txt); border-radius:999px;
  padding:11px 16px; font-size:12px; font-weight:700; letter-spacing:.02em; white-space:nowrap; cursor:pointer;
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); transition:background .15s; }
.lm-layers-btn:hover{ background:rgba(212,171,84,.12); }
.lm-layers-dot{ width:7px; height:7px; border-radius:50%; margin-left:-1px; }

.lm-stage{ position:absolute; top:0; left:0; right:0; bottom:0; touch-action:none; user-select:none; cursor:grab;
  overflow:hidden; background:radial-gradient(120% 90% at 38% 18%,#9c8a54,#5f5230);
  contain:layout size; }
.lm-stage:active{ cursor:grabbing; }
.lm-bgart{ position:absolute; inset:0; background-size:cover; background-position:center; background-repeat:no-repeat;
  opacity:.85; z-index:0; pointer-events:none; }
.lm-svg{ position:relative; z-index:1; display:block; width:100%; height:100%; }
.lm-camera{ transform-box:view-box; transform-origin:0 0; will-change:transform; }

.lm-filterwrap{ position:relative; flex-shrink:0; }
.lm-filterbackdrop{ position:absolute; inset:0; z-index:15; }
.lm-filtermenu-head{ display:flex; align-items:center; justify-content:space-between; padding:6px 8px 8px 12px; margin-bottom:2px; border-bottom:1px solid rgba(212,171,84,.16); font-size:13px; font-weight:700; color:var(--gold-lt); font-family:'Playfair Display',serif; }
.lm-menu-close{ width:30px; height:30px; border-radius:9px; border:1px solid var(--line); background:transparent; color:var(--muted); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .15s; }
.lm-menu-close:hover{ background:rgba(255,255,255,.06); }
.lm-filtermenu{ position:absolute; top:calc(100% + 10px); right:0; z-index:17;
  background:rgba(18,22,16,.97); border:1px solid var(--line); border-radius:16px; padding:6px;
  backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); box-shadow:0 12px 32px rgba(0,0,0,.5);
  display:flex; flex-direction:column; gap:2px; min-width:190px;
  animation:fmenu .18s ease; }
@keyframes fmenu{ from{ opacity:0; transform:translateY(-8px);} to{ opacity:1; transform:translateY(0);} }
.lm-filteritem{ display:flex; align-items:center; gap:10px; background:transparent; border:none; color:var(--txt); font-size:13px; font-weight:600; padding:11px 14px; border-radius:11px; cursor:pointer; text-align:left; transition:background .15s; white-space:nowrap; }
.lm-filteritem:hover{ background:rgba(212,171,84,.1); }
.lm-filteritem.active{ background:rgba(212,171,84,.16); }
.lm-filteritem-dot{ width:11px; height:11px; border-radius:50%; box-shadow:0 1px 2px rgba(0,0,0,.4); background:#568636; }
.lm-filteritem-dot.lm-fchip-all{ background:#8b93a4; }
.lm-filteritem-dot.lm-fchip-available, .lm-layers-dot.lm-fchip-available{ background:#568636; }
.lm-filteritem-dot.lm-fchip-reserved, .lm-layers-dot.lm-fchip-reserved{ background:#f5b942; }
.lm-filteritem-dot.lm-fchip-sold, .lm-layers-dot.lm-fchip-sold{ background:#e0504a; }

.lm-tiq-wrap{ position:absolute; right:calc(env(safe-area-inset-right,0px) + 16px);
  bottom:calc(env(safe-area-inset-bottom,0px) + var(--navh) + 12px); z-index:20; display:flex; flex-direction:column-reverse; align-items:flex-end; gap:10px; }
.lm-tiq-logo{ display:flex; align-items:center; justify-content:center; cursor:pointer;
  background:rgba(244,246,240,.94); border:1px solid rgba(20,32,54,.14); border-radius:12px;
  padding:6px 10px; box-shadow:0 6px 18px rgba(0,0,0,.35); transition:transform .15s; }
.lm-tiq-logo:active{ transform:scale(.94); }
.lm-tiq-pop{ text-decoration:none; background:rgba(20,36,60,.96); color:#fff; border-radius:12px;
  padding:9px 14px; box-shadow:0 8px 24px rgba(0,0,0,.45); backdrop-filter:blur(10px);
  white-space:nowrap; animation:tiqpop .2s ease; }
.lm-tiq-pop-title{ font-size:12px; font-weight:700; letter-spacing:.01em; }
.lm-tiq-pop-sub{ font-size:11px; color:#a9c4e6; margin-top:1px; }
@keyframes tiqpop{ from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:translateY(0); } }

.lm-kerb polygon, .lm-kerb rect{ fill:none; stroke:#b9b39c; stroke-width:2.4; opacity:.4; }
.lm-paver line{ stroke:#5f5945; stroke-width:1; opacity:.55; }
.lm-lane line{ stroke:#f4e6b0; stroke-width:2.4; stroke-dasharray:12 16; opacity:.62; stroke-linecap:round; }
.lm-road-lbl{ fill:#e8dcb8; font-size:12px; font-weight:600; letter-spacing:.16em; text-anchor:middle;
  font-family:'Inter',sans-serif; opacity:.85; }
.lm-road-lbl-lg{ font-size:15px; font-weight:700; letter-spacing:.2em; fill:#f4e6b0; opacity:.95; }
.lm-road-lbl-sm{ font-size:9.5px; letter-spacing:.12em; }
.lm-syno text{ fill:#5a4f38; font-size:15px; font-weight:700; letter-spacing:.04em; font-family:'Inter',sans-serif; }
.lm-exist-lbl{ fill:#cfc39a; font-size:11px; font-weight:700; letter-spacing:.12em; font-family:'Inter',sans-serif; opacity:.8; }
.lm-drain circle{ fill:#1e1b15; stroke:#4c4636; stroke-width:.8; }
.lm-turf-edge{ fill:none; stroke:#1e3510; stroke-width:3.5; opacity:.95; stroke-linejoin:round; }
.lm-amen-border{ fill:none; stroke:#14260a; stroke-width:1.6; stroke-dasharray:7 5; opacity:.9; stroke-linejoin:round; }

.lm-splash{ position:absolute; inset:0; z-index:100; display:flex; flex-direction:column;
  align-items:center; justify-content:center; cursor:pointer;
  background:radial-gradient(120% 100% at 50% 30%,#1c2417,#0a0d07 80%);
  animation:splashOut .4s ease forwards; animation-delay:1.6s; }
.lm-splash-inner{ display:flex; flex-direction:column; align-items:center; text-align:center;
  animation:splashIn .8s cubic-bezier(.22,1,.36,1); }
.lm-splash-logo{ filter:drop-shadow(0 4px 20px rgba(212,171,84,.5)); margin-bottom:18px;
  animation:logoFloat 3s ease-in-out infinite; }
@keyframes logoFloat{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.lm-splash-name{ font-family:'Playfair Display',serif; font-weight:800; font-size:34px; line-height:1;
  background:linear-gradient(180deg,#fdf6e2,#e7cd85 55%,#c9a24b);
  -webkit-background-clip:text; background-clip:text; color:transparent; letter-spacing:-.01em; }
.lm-splash-sub{ margin-top:10px; font-size:11px; letter-spacing:.24em; color:#b9c2a8; }
.lm-splash-tag{ margin-top:6px; font-size:12px; color:#8b9280; letter-spacing:.08em; }
.lm-splash-bar{ margin-top:26px; width:180px; height:3px; border-radius:99px; background:rgba(212,171,84,.18); overflow:hidden; }
.lm-splash-bar span{ display:block; height:100%; width:0; border-radius:99px;
  background:linear-gradient(90deg,#f2dd9a,#d4ab54); animation:barFill 1.7s ease forwards; }
@keyframes barFill{ 0%{width:0} 100%{width:100%} }
.lm-splash-loading{ margin-top:14px; font-size:11px; letter-spacing:.14em; color:#8b9280; text-transform:uppercase;
  animation:pulse 1.6s ease-in-out infinite; }
@keyframes pulse{ 0%,100%{opacity:.5} 50%{opacity:1} }
.lm-splash-credit{ position:absolute; bottom:calc(env(safe-area-inset-bottom,0px) + 22px);
  font-size:10px; letter-spacing:.1em; color:#6b7358; }
@keyframes splashIn{ from{opacity:0; transform:translateY(14px) scale(.97)} to{opacity:1; transform:none} }
@keyframes splashOut{ to{opacity:0; visibility:hidden} }
.lm-jog{ fill:none; stroke:#e6dbb2; stroke-width:8; opacity:.5; stroke-linecap:round; }
.lm-wall{ fill:none; stroke:#3a3527; stroke-width:8; stroke-linejoin:round; opacity:.75; }
.lm-redline{ fill:none; stroke:#e0504a; stroke-width:2.6; stroke-linejoin:round; opacity:.9;
  filter:drop-shadow(0 0 4px rgba(224,80,74,.45)); }

.lm-plot{ cursor:pointer; }
.lm-plot-shape{ transition:filter .22s ease, transform .22s ease; }
.lm-plot-bevel{ fill:none; stroke:#ffffff; stroke-width:1; opacity:.28; }
.lm-plot:hover .lm-plot-shape{ filter:url(#selGlow) brightness(1.06); }
.lm-plot:focus{ outline:none; }
.lm-plot:focus-visible .lm-plot-shape{ stroke:#fff; stroke-width:2.6; }
.lm-plot-num{ fill:#ffffff; font-size:15px; font-weight:800; text-anchor:middle; pointer-events:none;
  font-family:'Inter',sans-serif; paint-order:stroke; stroke:rgba(0,0,0,.4); stroke-width:2.2px; stroke-linejoin:round; }
.lm-amen-label{ fill:#2c4a1a; font-size:20px; font-weight:800; text-anchor:middle; letter-spacing:.16em;
  font-family:'Playfair Display',serif; }
.lm-ca-label{ fill:#234017; font-size:26px; font-weight:900; text-anchor:middle; font-family:'Playfair Display',serif; }
.lm-ca-sub{ fill:#2c4a1a; font-size:8px; font-weight:700; text-anchor:middle; letter-spacing:.14em; opacity:.85; }
.lm-stp-label{ fill:#3a2358; font-size:12px; font-weight:800; text-anchor:middle; }

.lm-photos-overlay{ position:absolute; inset:0; z-index:30; display:flex; align-items:center; justify-content:center;
  background:rgba(6,9,6,.6); backdrop-filter:blur(6px); animation:fadein .2s ease; }
.lm-photos-modal{ width:min(88vw,460px); background:linear-gradient(180deg,#1a2116,#0d120a);
  border:1px solid var(--line); border-radius:20px; padding:16px 18px 22px; box-shadow:0 24px 60px rgba(0,0,0,.6); }
.lm-photos-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;
  font-size:15px; font-weight:700; font-family:'Playfair Display',serif; color:var(--gold-lt); }
.lm-photos-empty{ display:flex; flex-direction:column; align-items:center; gap:12px; padding:36px 0;
  color:var(--muted); font-size:13px; letter-spacing:.02em; }
@keyframes fadein{ from{opacity:0} to{opacity:1} }

.lm-photos-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; max-height:60vh; overflow-y:auto; padding:2px; }
.lm-photo-cell{ position:relative; aspect-ratio:1; border:none; border-radius:12px; overflow:hidden; cursor:pointer; background:#000; padding:0; }
.lm-photo-cell img, .lm-photo-cell video{ width:100%; height:100%; object-fit:cover; display:block; }
.lm-photo-cell:active{ transform:scale(.97); }
.lm-photo-play{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.28); }
.lm-lightbox{ position:absolute; inset:0; z-index:120; display:flex; align-items:center; justify-content:center;
  background:rgba(0,0,0,.92); backdrop-filter:blur(4px); animation:fadein .2s ease; }
.lm-lightbox-inner{ max-width:92vw; max-height:82vh; display:flex; flex-direction:column; align-items:center; gap:12px; }
.lm-lightbox-media{ max-width:92vw; max-height:76vh; border-radius:12px; object-fit:contain; box-shadow:0 20px 60px rgba(0,0,0,.6); }
.lm-lightbox-cap{ color:#f3f6ee; font-size:14px; text-align:center; max-width:80vw; }
.lm-lightbox-close{ position:absolute; top:calc(env(safe-area-inset-top,0px) + 16px); right:16px; z-index:2;
  width:42px; height:42px; border-radius:12px; border:1px solid var(--line); background:rgba(20,24,16,.7); color:#fff;
  display:flex; align-items:center; justify-content:center; cursor:pointer; }
.lm-lightbox-nav{ position:absolute; top:50%; transform:translateY(-50%); width:46px; height:46px; border-radius:50%;
  border:1px solid var(--line); background:rgba(20,24,16,.7); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.lm-lightbox-nav.lm-prev{ left:12px; }
.lm-lightbox-nav.lm-next{ right:12px; }

.lm-sheet-overlay{ position:absolute; inset:0; z-index:30; display:flex; align-items:center; justify-content:center;
  background:rgba(6,9,6,.6); backdrop-filter:blur(6px); animation:fadein .2s ease; padding:16px; }
.lm-sheet{ width:min(88vw,460px); max-height:78vh; overflow-y:auto; background:linear-gradient(180deg,#1a2116,#0d120a);
  border:1px solid var(--line); border-radius:20px; padding:16px 18px 22px; box-shadow:0 24px 60px rgba(0,0,0,.6); }
.lm-sheet-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;
  font-size:15px; font-weight:700; font-family:'Playfair Display',serif; color:var(--gold-lt); }
.lm-sheet-copy{ font-size:12.5px; color:var(--muted); line-height:1.5; margin:0 0 16px; }
.lm-details-badge{ display:inline-flex; align-items:center; gap:6px; background:rgba(86,134,54,.18); color:#8fd257;
  border:1px solid rgba(86,134,54,.5); border-radius:999px; padding:6px 12px; font-size:11px; font-weight:800; margin-bottom:16px; }
.lm-stats-grid{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.lm-stat{ display:flex; flex-direction:column; gap:2px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:14px; }
.lm-stat-v{ font-size:19px; font-weight:800; color:var(--gold-lt); font-family:'Playfair Display',serif; }
.lm-stat-l{ font-size:10.5px; color:var(--muted); letter-spacing:.05em; text-transform:uppercase; }
.lm-amen-list{ display:flex; flex-direction:column; gap:12px; }
.lm-amen-item{ display:flex; gap:12px; align-items:flex-start; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.07); border-radius:14px; padding:12px 14px; }
.lm-amen-icon{ flex-shrink:0; width:36px; height:36px; border-radius:10px; background:rgba(212,171,84,.14); display:flex; align-items:center; justify-content:center; color:var(--gold); }
.lm-amen-name{ font-size:13.5px; font-weight:700; color:var(--txt); }
.lm-amen-desc{ font-size:11.5px; color:var(--muted); margin-top:2px; line-height:1.4; }

.lm-ctrl{ position:absolute; right:calc(env(safe-area-inset-right,0px) + 14px);
  bottom:calc(env(safe-area-inset-bottom,0px) + var(--navh) + 14px); z-index:8;
  display:flex; flex-direction:column; gap:1px; border-radius:16px; overflow:hidden;
  border:1px solid var(--line); background:var(--glass); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  box-shadow:0 10px 30px rgba(0,0,0,.5); }
.lm-ctrl button{ width:48px; height:48px; border:none; background:transparent; color:var(--gold);
  display:flex; align-items:center; justify-content:center; cursor:pointer;
  border-bottom:1px solid rgba(212,171,84,.14); transition:background .15s; }
.lm-ctrl button:last-child{ border-bottom:none; }
.lm-ctrl button.lm-ctrl-on{ background:linear-gradient(180deg,#2a3550,#1a2338); color:#ffd76a; }
.lm-ctrl button:hover{ background:rgba(212,171,84,.1); }
.lm-ctrl button:active{ background:rgba(212,171,84,.2); }

.lm-hint{ position:absolute; bottom:calc(env(safe-area-inset-bottom,0px) + var(--navh) + 12px); left:50%; transform:translateX(-50%);
  z-index:7; background:var(--glass); border:1px solid var(--line); color:var(--txt); font-size:12px;
  padding:9px 18px; border-radius:999px; backdrop-filter:blur(14px); white-space:nowrap; pointer-events:none;
  box-shadow:0 8px 24px rgba(0,0,0,.4); animation:fade 6s ease forwards; }
@keyframes fade{ 0%,70%{opacity:1;} 100%{opacity:0;} }

.lm-panel{ position:absolute; left:0; right:0; bottom:var(--navh); z-index:20;
  background:linear-gradient(180deg,rgba(24,30,20,.96),rgba(11,15,10,.98));
  border-top:1px solid var(--line); border-radius:24px 24px 0 0;
  padding:8px 20px 22px;
  transform:translateY(120%); transition:transform .4s cubic-bezier(.22,1,.36,1);
  box-shadow:0 -24px 60px rgba(0,0,0,.6); backdrop-filter:blur(20px); }
.lm-panel.open{ transform:translateY(0); }
.lm-panel::before{ content:""; display:block; width:44px; height:5px; border-radius:99px;
  background:rgba(212,171,84,.4); margin:2px auto 14px; }
.lm-panel-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.lm-panel-kicker{ font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold); font-weight:600; }
.lm-panel-title{ font-size:30px; font-weight:800; font-family:'Playfair Display',serif; line-height:1; margin-top:2px;
  background:linear-gradient(180deg,#fdf6e2,#d4ab54); -webkit-background-clip:text; background-clip:text; color:transparent; }
.lm-close{ width:38px; height:38px; border-radius:12px; border:1px solid var(--line); background:transparent; color:var(--muted);
  display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .15s; }
.lm-close:hover{ background:rgba(255,255,255,.05); }
.lm-diagram{ display:flex; justify-content:center; margin:6px 0 18px; }
.lm-dimbox{ position:relative; width:190px; height:110px; margin:22px 30px; }
.lm-dimbox-inner{ position:absolute; inset:0; border:2px solid var(--gold); border-radius:8px;
  background:rgba(212,171,84,.07); box-shadow:inset 0 0 22px rgba(212,171,84,.12);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }
.lm-dim-compass{ opacity:.9; }
.lm-dim-facing{ color:var(--gold-lt); font-weight:800; font-size:15px; letter-spacing:.01em; }
.lm-dim-facelbl{ color:var(--muted); font-size:8px; letter-spacing:.18em; }
.lm-dim{ position:absolute; color:var(--gold-lt); font-size:11px; font-weight:600; white-space:nowrap; }
.lm-dim-top{ top:-18px; left:50%; transform:translateX(-50%); }
.lm-dim-bottom{ bottom:-18px; left:50%; transform:translateX(-50%); }
.lm-dim-left{ left:-8px; top:50%; transform:translate(-100%,-50%); }
.lm-dim-right{ right:-8px; top:50%; transform:translate(100%,-50%); }
.lm-rows{ display:flex; flex-direction:column; margin-bottom:18px; }
.lm-row{ display:flex; justify-content:space-between; align-items:center; padding:13px 2px; border-bottom:1px solid rgba(255,255,255,.07); }
.lm-row:last-child{ border-bottom:none; }
.lm-row-l{ font-size:11.5px; color:var(--muted); letter-spacing:.08em; text-transform:uppercase; }
.lm-row-v{ font-size:14.5px; font-weight:700; text-align:right; }

.lm-status-badge{ font-size:12.5px; font-weight:800; letter-spacing:.02em; padding:5px 14px; border-radius:999px;
  border:1px solid transparent; }
.lm-status-available{ background:rgba(86,134,54,.18); color:#8fd257; border-color:rgba(86,134,54,.5); }
.lm-status-reserved{ background:rgba(245,185,66,.16); color:#ffcf72; border-color:rgba(245,185,66,.5); }
.lm-status-sold{ background:rgba(224,80,74,.16); color:#ff8079; border-color:rgba(224,80,74,.5); }

.lm-cta-row{ display:flex; gap:10px; }
.lm-cta{ flex:1; display:flex; align-items:center; justify-content:center; gap:8px; text-decoration:none;
  padding:14px; border:none; border-radius:14px; cursor:pointer; color:#fff; font-weight:800; font-size:15px;
  transition:transform .12s, filter .15s; }
.lm-cta-wa{ background:linear-gradient(180deg,#2fc463,#1faa4f); box-shadow:0 10px 26px rgba(37,180,80,.35); }
.lm-cta-call{ background:linear-gradient(180deg,#4a91e2,#2f6fc4); box-shadow:0 10px 26px rgba(47,111,196,.35); }
.lm-cta:hover{ transform:translateY(-1px); filter:brightness(1.05); }
.lm-cta:active{ transform:translateY(1px); }

.lm-bottomnav{ position:absolute; left:0; right:0; bottom:0; z-index:22; display:flex; align-items:stretch;
  background:linear-gradient(180deg,rgba(14,18,11,.9),rgba(8,11,7,.98));
  border-top:1px solid var(--line); backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  padding-bottom:env(safe-area-inset-bottom,0px); box-shadow:0 -8px 30px rgba(0,0,0,.4); }
.lm-navitem{ flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px;
  padding:10px 4px 8px; background:transparent; border:none; color:var(--muted); text-decoration:none;
  font-size:10px; font-weight:700; letter-spacing:.03em; cursor:pointer; transition:color .15s; }
.lm-navitem svg{ opacity:.85; transition:opacity .15s; }
.lm-navitem.active{ color:#8fd257; }
.lm-navitem.active svg{ opacity:1; }
.lm-navitem:active{ transform:scale(.96); }

@media (min-width:640px){
  .lm-brand-name{ font-size:24px; }
  .lm-panel{ max-width:420px; left:auto; right:22px; bottom:calc(var(--navh) + 12px); border-radius:20px; }
}
@media (prefers-reduced-motion:reduce){
  .lm-panel, .lm-plot-shape{ transition:none; }
  .lm-hint{ animation:none; }
}
`;