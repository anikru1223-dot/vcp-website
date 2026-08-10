"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client"; // adjust path to your client

/**
 * Basava Ganguru — Interactive Master Layout
 * Premium 3D architectural-model view: extruded plot tiles, layered landscaping,
 * refined water & roads, luxury glass UI. Day / twilight lighting.
 */

type Plot = { id: string; pts: string; dim: string; facing: string; sqm: number; sqft: number };
type Status = "available" | "reserved" | "sold";
type MediaItem = { id: string; type: "image" | "video"; url: string; caption: string | null };

const STATUS_META: Record<Status, { label: string }> = {
    available: { label: "Available" },
    reserved: { label: "Reserved" },
    sold: { label: "Sold" },
};

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

const R9 = 58, R12 = 78;
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

// Translate a "x,y x,y" points string — used to build the extruded 3D side wall.
const shift = (pts: string, dx: number, dy: number) =>
    pts.trim().split(/\s+/).map((pr) => { const [x, y] = pr.split(",").map(Number); return `${x + dx},${y + dy}`; }).join(" ");

const EXTRUDE = 9; // block height in svg units

/* ---------------- Landscaping primitives (layered, dimensional) ---------------- */

function Tree({ x, y, s = 1, v = 0 }: { x: number; y: number; s?: number; v?: number }) {
    const grad = ["treeA", "treeB", "treeC"][v % 3];
    return (
        <g transform={`translate(${x},${y}) scale(${s})`} pointerEvents="none">
            <ellipse cx="4" cy="9" rx="14" ry="4.5" fill="#12240c" opacity="0.28" />
            <rect x="-1.4" y="1" width="2.8" height="7" rx="1.2" fill="#5b452b" />
            <circle cx="0" cy="-1" r="11" fill={`url(#${grad})`} />
            <circle cx="-6" cy="2" r="7.5" fill={`url(#${grad})`} />
            <circle cx="6" cy="2" r="7.5" fill={`url(#${grad})`} />
            <circle cx="0" cy="6" r="7" fill={`url(#${grad})`} />
            <circle cx="-3.5" cy="-5" r="4.6" fill="#a6d46a" opacity="0.5" />
            <circle cx="2.5" cy="-3" r="3" fill="#c2e28a" opacity="0.4" />
        </g>
    );
}

function Shrub({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
    return (
        <g transform={`translate(${x},${y}) scale(${s})`} pointerEvents="none">
            <ellipse cx="2" cy="4" rx="8" ry="2.6" fill="#13260d" opacity="0.22" />
            <circle cx="-3" cy="0" r="4.4" fill="url(#treeB)" />
            <circle cx="3" cy="0" r="4.4" fill="url(#treeA)" />
            <circle cx="0" cy="-2" r="4.8" fill="url(#treeC)" />
            <circle cx="-1" cy="-3" r="2.2" fill="#b4dd77" opacity="0.5" />
        </g>
    );
}

function StreetLight({ x, y, on = false }: { x: number; y: number; on?: boolean }) {
    return (
        <g transform={`translate(${x},${y})`} pointerEvents="none">
            {on && <circle r="30" fill="url(#lightPool)" />}
            <circle r={on ? 4 : 2.6} fill={on ? "#ffe6a6" : "#c9c2a8"} opacity={on ? 0.95 : 0.5} />
            {on && <circle r="2" fill="#fffbe9" />}
        </g>
    );
}

export default function LayoutMap() {
    const [selected, setSelected] = useState<string | null>(null);
    const [tiqOpen, setTiqOpen] = useState(false);
    const [photosOpen, setPhotosOpen] = useState(false);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [lightbox, setLightbox] = useState<number | null>(null);
    const [night, setNight] = useState(false);
    const [splash, setSplash] = useState(true);

    const [statusMap, setStatusMap] = useState<Record<string, Status>>({});
    const [filter, setFilter] = useState<Status | "all">("all");
    const [filterOpen, setFilterOpen] = useState(false);
    const projectId = "basava-ganguru";
    const supabase = createClient();

    const logEnquiry = async (type: "whatsapp" | "call", plotId: string) => {
        try {
            await supabase.from("enquiries").insert({
                project_id: projectId, plot_id: plotId, type,
                message: type === "whatsapp" ? `Interested in Plot ${plotId}` : `Call requested for Plot ${plotId}`,
            });
        } catch { /* never block the user */ }
    };

    useEffect(() => {
        const t = window.setTimeout(() => setSplash(false), 1900);
        return () => window.clearTimeout(t);
    }, []);

    useEffect(() => {
        const prevBody = document.body.style.overflow;
        const prevHtml = document.documentElement.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        return () => { document.body.style.overflow = prevBody; document.documentElement.style.overflow = prevHtml; };
    }, []);

    useEffect(() => {
        let active = true;
        const load = async () => {
            const { data } = await supabase.from("plot_status").select("plot_id,status").eq("project_id", projectId);
            if (!active || !data) return;
            const m: Record<string, Status> = {};
            data.forEach((r: { plot_id: string; status: Status }) => { m[r.plot_id] = r.status; });
            setStatusMap(m);
        };
        load();
        const channel = supabase
            .channel("plot_status_map")
            .on("postgres_changes",
                { event: "*", schema: "public", table: "plot_status", filter: `project_id=eq.${projectId}` },
                (payload) => {
                    const row = payload.new as { plot_id: string; status: Status };
                    if (row?.plot_id) setStatusMap((prev) => ({ ...prev, [row.plot_id]: row.status }));
                })
            .subscribe();
        return () => { active = false; supabase.removeChannel(channel); };
    }, [projectId]);

    useEffect(() => {
        let alive = true;
        (async () => {
            const { data } = await supabase
                .from("project_media").select("id,type,url,caption").eq("project_id", projectId)
                .order("sort_order", { ascending: true }).order("created_at", { ascending: false });
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

    const counts = useMemo(() => {
        let a = 0, r = 0, s = 0;
        PLOTS.forEach((p) => {
            const st = statusMap[p.id] || "available";
            if (st === "available") a++; else if (st === "reserved") r++; else s++;
        });
        return { available: a, reserved: r, sold: s, total: PLOTS.length };
    }, [statusMap]);

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
        const contentW = BASE_VB.w * bs * c.s, contentH = BASE_VB.h * bs * c.s;
        const slackX = r.width * 0.18, slackY = r.height * 0.18;
        const minTx = r.width - contentW - slackX, maxTx = slackX;
        const minTy = r.height - contentH - slackY, maxTy = slackY;
        const soft = (val: number, lo: number, hi: number) => {
            if (lo > hi) return (lo + hi) / 2;
            if (val < lo) return elastic ? lo - (lo - val) * 0.35 : lo;
            if (val > hi) return elastic ? hi + (val - hi) * 0.35 : hi;
            return val;
        };
        return { ...c, tx: soft(c.tx, minTx, maxTx), ty: soft(c.ty, minTy, maxTy) };
    };

    const paint = (c: Cam) => {
        if (cameraRef.current) {
            const bs = baseScaleRef.current || 1;
            const cx = BASE_VB.x + BASE_VB.w / 2, cy = BASE_VB.y + BASE_VB.h / 2;
            cameraRef.current.style.transform =
                `translate(${c.tx / bs}px,${c.ty / bs}px) scale(${c.s}) translate(${cx}px,${cy}px) rotate(${c.rot}deg) translate(${-cx}px,${-cy}px)`;
        }
        if (compassRef.current) compassRef.current.style.transform = `rotate(${-c.rot}deg)`;
    };

    const tick = useCallback(() => {
        const c = cur.current, t = target.current, k = 0.32;
        c.s += (t.s - c.s) * k; c.tx += (t.tx - c.tx) * k; c.ty += (t.ty - c.ty) * k;
        let dr = t.rot - c.rot; c.rot += dr * k;
        const done = Math.abs(t.s - c.s) < 0.0005 && Math.abs(t.tx - c.tx) < 0.1 &&
            Math.abs(t.ty - c.ty) < 0.1 && Math.abs(dr) < 0.05;
        if (done) { cur.current = { ...t }; paint(t); animating.current = false; raf.current = null; forceCompass((n) => n + 1); return; }
        paint(c); raf.current = requestAnimationFrame(tick);
    }, []);

    const startAnim = useCallback(() => {
        if (!animating.current) { animating.current = true; raf.current = requestAnimationFrame(tick); }
    }, [tick]);

    const setNow = (c: Cam) => {
        if (raf.current) { cancelAnimationFrame(raf.current); raf.current = null; }
        animating.current = false; cur.current = { ...c }; target.current = { ...c }; paint(c);
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

    // Deterministic landscaping placement (kept outside the built parcel core).
    const { trees, shrubs, huts } = useMemo(() => {
        let seed = 11;
        const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        const inCore = (x: number, y: number) => x > 108 && x < 1015 && y > 172 && y < 972;
        const tr: [number, number, number][] = [];
        const sh: [number, number, number][] = [];
        for (let g = 0; g < 30; g++) {
            const gx = -120 + rnd() * 1460, gy = -60 + rnd() * 1440;
            const count = 4 + Math.floor(rnd() * 6), spread = 55 + rnd() * 85;
            for (let j = 0; j < count; j++) {
                const x = gx + (rnd() + rnd() - 1) * spread, y = gy + (rnd() + rnd() - 1) * spread;
                if (inCore(x, y)) continue;
                tr.push([x, y, 1.0 + rnd() * 0.8]);
            }
        }
        for (let i = 0; i < 46; i++) {
            const x = -140 + rnd() * 1500, y = -80 + rnd() * 1480;
            if (inCore(x, y)) continue;
            (rnd() > 0.4 ? tr : sh).push([x, y, 0.9 + rnd() * 0.8]);
        }
        const ht = [
            { x: -520, y: 120, s: 1.2 }, { x: 1440, y: 300, s: 1.1 }, { x: -420, y: 720, s: 1 },
            { x: 1490, y: 820, s: 1.15 }, { x: 560, y: 1380, s: 1.05 }, { x: -560, y: 1080, s: 1 },
            { x: 300, y: -520, s: 1 }, { x: 900, y: -520, s: 1.05 },
        ];
        return { trees: tr, shrubs: sh, huts: ht };
    }, []);

    const nightLights: [number, number][] = [
        [180, 223], [430, 223], [680, 223], [930, 223], [1060, 223],
        [531, 300], [531, 499], [531, 720], [531, 930],
        [822, 300], [822, 560], [822, 820], [822, 930],
        [150, 499], [340, 499],
    ];

    return (
        <div className={`lm-root ${night ? "is-night" : ""}`}>
            <style>{css}</style>

            {splash && (
                <div className="lm-splash" onClick={() => setSplash(false)}>
                    <div className="lm-splash-inner">
                        <div className="lm-splash-logo" aria-hidden="true">
                            <svg viewBox="0 0 40 40" width="60" height="60">
                                <defs><linearGradient id="scg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f7ecc6" /><stop offset="1" stopColor="#c9a24b" /></linearGradient></defs>
                                <path d="M20 3 L34 9 V21 C34 30 27 35 20 37 C13 35 6 30 6 21 V9 Z" fill="none" stroke="url(#scg)" strokeWidth="1.6" />
                                <rect x="14" y="16" width="5" height="12" fill="url(#scg)" /><rect x="21" y="13" width="5" height="15" fill="url(#scg)" />
                            </svg>
                        </div>
                        <div className="lm-splash-name">Basava Ganguru</div>
                        <div className="lm-splash-sub">VIJAYALAXMI C PATIL · SHIVAMOGGA</div>
                        <div className="lm-splash-tag">Residential Layout · 32 Premium Plots</div>
                        <div className="lm-splash-bar"><span /></div>
                    </div>
                    <div className="lm-splash-credit">Built by Train IQ · trainiq.in</div>
                </div>
            )}

            <header className="lm-head">
                <div className="lm-brand">
                    <div className="lm-logo" aria-hidden="true">
                        <svg viewBox="0 0 40 40" width="30" height="30">
                            <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f7ecc6" /><stop offset="1" stopColor="#c9a24b" /></linearGradient></defs>
                            <path d="M20 3 L34 9 V21 C34 30 27 35 20 37 C13 35 6 30 6 21 V9 Z" fill="none" stroke="url(#cg)" strokeWidth="1.6" />
                            <rect x="14" y="16" width="5" height="12" fill="url(#cg)" /><rect x="21" y="13" width="5" height="15" fill="url(#cg)" />
                        </svg>
                    </div>
                    <div>
                        <div className="lm-brand-name">Basava Ganguru</div>
                        <div className="lm-brand-sub">Master Layout · Shivamogga</div>
                    </div>
                </div>

                <div className="lm-head-tools">
                    <div className="lm-search">
                        <input placeholder="Search plot number"
                            value={selected ?? ""}
                            onChange={(e) => { const v = e.target.value.trim(); setSelected(PLOTS.some((p) => p.id === v) ? v : null); }} />
                    </div>
                    <div className="lm-legend" role="group" aria-label="Status legend">
                        <span className="lm-leg"><i className="lm-dot is-available" />Available<b>{counts.available}</b></span>
                        <span className="lm-leg"><i className="lm-dot is-reserved" />Reserved<b>{counts.reserved}</b></span>
                        <span className="lm-leg"><i className="lm-dot is-sold" />Sold<b>{counts.sold}</b></span>
                    </div>
                </div>
            </header>

            <div className="lm-stage" ref={wrapRef}
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
                <svg ref={svgRef} viewBox={`${BASE_VB.x} ${BASE_VB.y} ${BASE_VB.w} ${BASE_VB.h}`} preserveAspectRatio="xMidYMid meet" className="lm-svg">
                    <defs>
                        <radialGradient id="terrain" cx="0.34" cy="0.2" r="1.2">
                            <stop offset="0" stopColor="#e7dfc6" /><stop offset="0.45" stopColor="#d8cca9" />
                            <stop offset="0.82" stopColor="#c3b58e" /><stop offset="1" stopColor="#a89a74" />
                        </radialGradient>
                        <pattern id="terrainTex" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(16)">
                            <rect width="30" height="30" fill="transparent" />
                            <circle cx="6" cy="8" r="1" fill="#b3a37a" opacity="0.22" />
                            <circle cx="19" cy="17" r="0.9" fill="#8f8058" opacity="0.24" />
                            <circle cx="13" cy="25" r="0.8" fill="#cabb92" opacity="0.2" />
                        </pattern>
                        <radialGradient id="patch" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0" stopColor="#9aa863" stopOpacity="0.3" /><stop offset="1" stopColor="#9aa863" stopOpacity="0" />
                        </radialGradient>

                        {/* plot faces */}
                        <linearGradient id="pAvailTop" x1="0" y1="0" x2="0.5" y2="1">
                            <stop offset="0" stopColor="#7fce93" /><stop offset="0.5" stopColor="#4faa6c" /><stop offset="1" stopColor="#3a9760" />
                        </linearGradient>
                        <linearGradient id="pResTop" x1="0" y1="0" x2="0.5" y2="1">
                            <stop offset="0" stopColor="#f4cb78" /><stop offset="0.5" stopColor="#dea63f" /><stop offset="1" stopColor="#c88c2c" />
                        </linearGradient>
                        <linearGradient id="pSoldTop" x1="0" y1="0" x2="0.5" y2="1">
                            <stop offset="0" stopColor="#ef8f80" /><stop offset="0.5" stopColor="#d06254" /><stop offset="1" stopColor="#b0463b" />
                        </linearGradient>
                        <linearGradient id="pSelTop" x1="0" y1="0" x2="0.5" y2="1">
                            <stop offset="0" stopColor="#a9ecb7" /><stop offset="1" stopColor="#63c184" />
                        </linearGradient>

                        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#f7ecc6" /><stop offset="0.5" stopColor="#d9bd6f" /><stop offset="1" stopColor="#b0894a" />
                        </linearGradient>
                        <linearGradient id="road" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#c9c2b1" /><stop offset="0.12" stopColor="#d7d1c2" /><stop offset="0.5" stopColor="#c2bba9" /><stop offset="0.88" stopColor="#d7d1c2" /><stop offset="1" stopColor="#b7b09d" />
                        </linearGradient>
                        <linearGradient id="roadV" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stopColor="#c9c2b1" /><stop offset="0.12" stopColor="#d7d1c2" /><stop offset="0.5" stopColor="#c2bba9" /><stop offset="0.88" stopColor="#d7d1c2" /><stop offset="1" stopColor="#b7b09d" />
                        </linearGradient>

                        <radialGradient id="water" cx="0.36" cy="0.28" r="1">
                            <stop offset="0" stopColor="#bfeee6" /><stop offset="0.5" stopColor="#5db6ac" /><stop offset="1" stopColor="#2f8079" />
                        </radialGradient>
                        <radialGradient id="park" cx="0.4" cy="0.3" r="1">
                            <stop offset="0" stopColor="#a7cf72" /><stop offset="0.6" stopColor="#8bbb55" /><stop offset="1" stopColor="#6f9f43" />
                        </radialGradient>
                        <linearGradient id="civic" x1="0" y1="0" x2="0.4" y2="1">
                            <stop offset="0" stopColor="#aed079" /><stop offset="1" stopColor="#79a548" />
                        </linearGradient>

                        <radialGradient id="treeA" cx="0.4" cy="0.32" r="0.75"><stop offset="0" stopColor="#77b448" /><stop offset="0.6" stopColor="#4c8a30" /><stop offset="1" stopColor="#2f5f1f" /></radialGradient>
                        <radialGradient id="treeB" cx="0.4" cy="0.32" r="0.75"><stop offset="0" stopColor="#8bc255" /><stop offset="0.6" stopColor="#5a9a38" /><stop offset="1" stopColor="#356c24" /></radialGradient>
                        <radialGradient id="treeC" cx="0.4" cy="0.32" r="0.75"><stop offset="0" stopColor="#6ba63f" /><stop offset="0.6" stopColor="#437d2a" /><stop offset="1" stopColor="#28551b" /></radialGradient>

                        <radialGradient id="lightPool" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0" stopColor="#ffe6a6" stopOpacity="0.55" /><stop offset="0.5" stopColor="#ffcf6e" stopOpacity="0.18" /><stop offset="1" stopColor="#ffcf6e" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="sun" cx="0.28" cy="0.14" r="0.95">
                            <stop offset="0" stopColor="#fff0c8" stopOpacity="0.25" /><stop offset="0.5" stopColor="#ffe4a0" stopOpacity="0.06" /><stop offset="1" stopColor="#000" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="vignette" cx="0.5" cy="0.46" r="0.85">
                            <stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#1c1608" stopOpacity="0.3" />
                        </radialGradient>

                        <filter id="plotSh" x="-30%" y="-30%" width="160%" height="170%">
                            <feDropShadow dx="0" dy="7" stdDeviation="6" floodColor="#20301a" floodOpacity="0.4" />
                        </filter>
                        <filter id="selGlow" x="-70%" y="-70%" width="240%" height="240%">
                            <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#ffe08a" floodOpacity="0.9" />
                            <feDropShadow dx="0" dy="9" stdDeviation="7" floodColor="#20301a" floodOpacity="0.45" />
                        </filter>
                        <filter id="softSh" x="-40%" y="-40%" width="180%" height="180%">
                            <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#000" floodOpacity="0.35" />
                        </filter>
                    </defs>

                    <g ref={cameraRef} className="lm-camera">
                        {/* Terrain */}
                        <rect x={BASE_VB.x - 900} y={BASE_VB.y - 900} width={BASE_VB.w + 1800} height={BASE_VB.h + 1800} fill="url(#terrain)" />
                        <rect x={BASE_VB.x - 900} y={BASE_VB.y - 900} width={BASE_VB.w + 1800} height={BASE_VB.h + 1800} fill="url(#terrainTex)" pointerEvents="none" />
                        <g pointerEvents="none">
                            <ellipse cx="220" cy="380" rx="140" ry="86" fill="url(#patch)" />
                            <ellipse cx="1000" cy="450" rx="160" ry="96" fill="url(#patch)" />
                            <ellipse cx="320" cy="1080" rx="170" ry="96" fill="url(#patch)" />
                            <ellipse cx="1050" cy="950" rx="150" ry="86" fill="url(#patch)" />
                            <ellipse cx="700" cy="1140" rx="190" ry="74" fill="url(#patch)" />
                        </g>

                        {/* Surrounding cultivated context */}
                        <g pointerEvents="none">
                            {[
                                { x: -700, y: -400, w: 520, h: 360, c: "#9bab6a" }, { x: -700, y: 20, w: 520, h: 380, c: "#a7b578" },
                                { x: -700, y: 460, w: 470, h: 420, c: "#8fa061" }, { x: -680, y: 960, w: 560, h: 380, c: "#9fae70" },
                                { x: 1240, y: -360, w: 520, h: 420, c: "#9bab6a" }, { x: 1270, y: 120, w: 500, h: 400, c: "#a7b578" },
                                { x: 1250, y: 580, w: 520, h: 440, c: "#8fa061" }, { x: 320, y: 1200, w: 640, h: 360, c: "#9fae70" },
                                { x: 120, y: -560, w: 560, h: 300, c: "#a7b578" }, { x: 760, y: -560, w: 520, h: 300, c: "#9bab6a" },
                            ].map((f, i) => (
                                <g key={`fld${i}`} opacity="0.9">
                                    <rect x={f.x} y={f.y} width={f.w} height={f.h} rx="10" fill={f.c} />
                                    {Array.from({ length: Math.floor(f.h / 30) }).map((_, r) => (
                                        <line key={r} x1={f.x + 10} y1={f.y + 16 + r * 30} x2={f.x + f.w - 10} y2={f.y + 16 + r * 30} stroke="#6f8443" strokeWidth="1.4" opacity="0.3" />
                                    ))}
                                </g>
                            ))}

                            {/* Cottages in surrounding context */}
                            {huts.map((h, i) => (
                                <g key={`hut${i}`} transform={`translate(${h.x},${h.y}) scale(${h.s})`}>
                                    <ellipse cx="2" cy="16" rx="26" ry="6" fill="#000" opacity="0.16" />
                                    <rect x="-18" y="-6" width="36" height="20" rx="2" fill="#efe7d4" />
                                    <polygon points="-22,-6 22,-6 14,-21 -14,-21" fill="#b06a3c" />
                                    <polygon points="-22,-6 22,-6 20,-3 -20,-3" fill="#8f5330" opacity="0.5" />
                                    <rect x="-4" y="2" width="8" height="12" fill="#7a5a3a" />
                                </g>
                            ))}
                        </g>

                        {/* Survey number annotations */}
                        <g className="lm-syno" pointerEvents="none">
                            <text x="300" y="-140" textAnchor="middle">Sy.No.39</text>
                            <text x="581" y="-140" textAnchor="middle">Sy.No.42</text>
                            <text x="70" y="430" textAnchor="middle" transform="rotate(-90 70 430)">Sy.No.44</text>
                            <text x="70" y="720" textAnchor="middle" transform="rotate(-90 70 720)">Sy.No.43/1</text>
                            <text x="1195" y="500" textAnchor="middle" transform="rotate(90 1195 500)">Sy.No.43/3</text>
                            <text x="1195" y="820" textAnchor="middle" transform="rotate(90 1195 820)">Sy.No.43/3</text>
                            <text x="600" y="1090" textAnchor="middle">Sy.No.46</text>
                        </g>

                        <polygon points={BOUNDARY} className="lm-siteline" pointerEvents="none" />

                        {/* ---------- Circulation ---------- */}
                        <g filter="url(#softSh)">
                            <polygon points={ROADS.top} fill="url(#road)" />
                            <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} fill="url(#roadV)" />
                            <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} fill="url(#roadV)" />
                            <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} fill="url(#road)" />
                        </g>
                        <rect x={ROADS.path.x} y={ROADS.path.y} width={ROADS.path.w} height={ROADS.path.h} fill="#b9ac86" opacity="0.9" />
                        <g className="lm-paver" pointerEvents="none">
                            {Array.from({ length: Math.floor((ROADS.path.w - 14) / 30) }).map((_, i) => (
                                <line key={i} x1={ROADS.path.x + 14 + i * 30} y1={ROADS.path.y} x2={ROADS.path.x + 14 + i * 30} y2={ROADS.path.y + ROADS.path.h} />
                            ))}
                        </g>
                        <g className="lm-kerb" pointerEvents="none">
                            <polygon points={ROADS.top} />
                            <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} />
                            <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} />
                            <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} />
                        </g>
                        <g className="lm-lane" pointerEvents="none">
                            <line x1="531" y1="270" x2="531" y2="944" />
                            <line x1="822" y1="270" x2="822" y2="944" />
                            <line x1="122" y1="499" x2="500" y2="499" />
                            <line x1="118" y1="223" x2="1108" y2="223" />
                        </g>
                        <g className="lm-roadlbl" pointerEvents="none">
                            <text x="600" y="217" className="lm-roadlbl-lg">APPROVED LAYOUT · 12m ROAD</text>
                            <text x="531" y="620" transform="rotate(-90 531 620)">9m ROAD</text>
                            <text x="822" y="620" transform="rotate(-90 822 620)">9m ROAD</text>
                            <text x="300" y="503">9m ROAD</text>
                            <text x="300" y="670" className="lm-roadlbl-sm">3m PATHWAY</text>
                        </g>

                        {/* ---------- Amenity parcels ---------- */}
                        <polygon points={KARAB} fill="url(#park)" filter="url(#softSh)" />
                        <polygon points={KARAB} className="lm-parcel-edge" pointerEvents="none" />
                        <ellipse cx={KARAB_LAKE.cx} cy={KARAB_LAKE.cy} rx={KARAB_LAKE.rx + 5} ry={KARAB_LAKE.ry + 4} fill="#6f8a54" opacity="0.55" pointerEvents="none" />
                        <ellipse cx={KARAB_LAKE.cx} cy={KARAB_LAKE.cy} rx={KARAB_LAKE.rx} ry={KARAB_LAKE.ry} fill="url(#water)" filter="url(#softSh)" />
                        <ellipse cx={KARAB_LAKE.cx - 38} cy={KARAB_LAKE.cy - 22} rx="52" ry="17" fill="#fff" opacity="0.26" pointerEvents="none" />
                        {[0.78, 0.55, 0.34].map((k, i) => (
                            <ellipse key={`rip${i}`} cx={KARAB_LAKE.cx} cy={KARAB_LAKE.cy} rx={KARAB_LAKE.rx * k} ry={KARAB_LAKE.ry * k} fill="none" stroke="#d3f0ef" strokeWidth="1" opacity={0.2 - i * 0.04} pointerEvents="none" />
                        ))}
                        <text x="300" y={KARAB_LAKE.cy - KARAB_LAKE.ry - 16} className="lm-parcel-lbl">KARAB · OPEN SPACE</text>

                        <polygon points={CA} fill="url(#civic)" filter="url(#softSh)" />
                        <polygon points={CA} className="lm-parcel-edge" pointerEvents="none" />
                        <g transform="translate(195,332)" pointerEvents="none">
                            <ellipse cx="0" cy="22" rx="30" ry="8" fill="#000" opacity="0.16" />
                            <rect x="-26" y="-6" width="52" height="26" rx="3" fill="#f2f6ec" />
                            <polygon points="-30,-6 30,-6 22,-22 -22,-22" fill="#8fb87a" />
                            <polygon points="-30,-6 30,-6 27,-2 -27,-2" fill="#6f9a5c" opacity="0.5" />
                            <rect x="-18" y="4" width="8" height="14" fill="#cfe3bf" /><rect x="-4" y="4" width="8" height="14" fill="#cfe3bf" /><rect x="10" y="4" width="8" height="14" fill="#cfe3bf" />
                        </g>
                        <text x={centroid(CA).x} y={centroid(CA).y - 4} className="lm-ca-label">CA</text>
                        <text x={centroid(CA).x} y={centroid(CA).y + 38} className="lm-ca-sub">CIVIC AMENITY</text>

                        <polygon points={STP} fill="#e6dbf4" stroke="#9670c2" strokeWidth="1.4" filter="url(#softSh)" />
                        <rect x="446" y="704" width="40" height="38" rx="3" fill="#c3b7d6" />
                        <polygon points="444,704 488,704 482,692 450,692" fill="#a487ca" />
                        <circle cx="456" cy="726" r="5" fill="#9d88c4" /><circle cx="474" cy="726" r="5" fill="#9d88c4" />
                        <text x={centroid(STP).x} y={centroid(STP).y + 6} className="lm-stp-label">STP</text>

                        {/* ---------- 3D extruded plots ---------- */}
                        {PLOTS.map((p) => {
                            const c = centroid(p.pts);
                            const isSel = p.id === selected;
                            const effective: Status = statusMap[p.id] || "available";
                            const dimmed = filter !== "all" && effective !== filter;
                            const topFill = isSel ? "url(#pSelTop)"
                                : effective === "available" ? "url(#pAvailTop)"
                                    : effective === "reserved" ? "url(#pResTop)" : "url(#pSoldTop)";
                            const sideFill = isSel ? "#3f9a5f"
                                : effective === "available" ? "#2c7b48"
                                    : effective === "reserved" ? "#9a6d1f" : "#8f3a30";
                            const lift = isSel ? 4 : 0;
                            return (
                                <g key={p.id} className={`lm-plot ${dimmed ? "is-dim" : ""}`}
                                    onClick={(e) => { e.stopPropagation(); setSelected(p.id); }}
                                    role="button" tabIndex={0}
                                    onKeyDown={(e: React.KeyboardEvent) => (e.key === "Enter" || e.key === " ") && setSelected(p.id)}>
                                    {/* extruded side wall */}
                                    <polygon points={shift(p.pts, 0, EXTRUDE - lift)} fill={sideFill} className="lm-plot-side" />
                                    {/* top face */}
                                    <g transform={lift ? `translate(0,${-lift})` : undefined}>
                                        <polygon points={p.pts} className="lm-plot-top"
                                            fill={topFill} stroke="url(#gold)" strokeWidth={isSel ? 2.4 : 1.2}
                                            filter={isSel ? "url(#selGlow)" : "url(#plotSh)"} />
                                        <polygon points={p.pts} className="lm-plot-bevel" pointerEvents="none" />
                                        <text x={c.x} y={c.y + 5} className="lm-plot-num">{p.id}</text>
                                    </g>
                                </g>
                            );
                        })}

                        {/* ---------- Landscaping (over ground, around plots) ---------- */}
                        <g pointerEvents="none">
                            {shrubs.map(([x, y, s], i) => <Shrub key={`sh${i}`} x={x} y={y} s={s} />)}
                            {trees.map(([x, y, s], i) => <Tree key={`t${i}`} x={x} y={y} s={s} v={i % 3} />)}
                            {/* curated greenery inside amenity park */}
                            <Tree x={200} y={770} s={1.2} v={1} /><Tree x={410} y={782} s={1.1} v={0} />
                            <Tree x={175} y={905} s={1.15} v={2} /><Tree x={430} y={905} s={1.05} v={1} />
                            <Shrub x={300} y={745} s={1.2} /><Shrub x={360} y={905} s={1.1} />
                        </g>

                        {/* ---------- Lighting overlays ---------- */}
                        {night
                            ? <rect x={BASE_VB.x - 900} y={BASE_VB.y - 900} width={BASE_VB.w + 1800} height={BASE_VB.h + 1800} fill="#0b1526" opacity="0.62" pointerEvents="none" />
                            : <polygon points={BOUNDARY} fill="url(#sun)" pointerEvents="none" />}
                        <rect x={BASE_VB.x - 200} y={BASE_VB.y - 200} width={BASE_VB.w + 400} height={BASE_VB.h + 400} fill="url(#vignette)" pointerEvents="none" />
                        <g>{nightLights.map(([x, y], i) => <StreetLight key={i} x={x} y={y} on={night} />)}</g>
                    </g>

                    {/* Compass */}
                    <g className="lm-compass" transform="translate(1128,246)">
                        <circle r="21" className="lm-compass-bg" />
                        <g ref={compassRef}>
                            <path d="M0,-14 L4.5,3 L0,-1 L-4.5,3 Z" fill="#e0504a" />
                            <path d="M0,14 L4.5,-3 L0,1 L-4.5,-3 Z" fill="#8a7f63" />
                            <text y="-25" textAnchor="middle" className="lm-compass-lbl">N</text>
                        </g>
                    </g>
                </svg>

                {/* Bottom toolbar */}
                <div className="lm-toolbar">
                    <div className="lm-filterwrap">
                        <button className={`lm-tbtn lm-filterbtn ${filter !== "all" ? `is-${filter}` : ""}`} onClick={() => setFilterOpen((v) => !v)} aria-label="Filter plots">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h16M7 12h10M10 19h4" strokeLinecap="round" /></svg>
                            <span>{filter === "all" ? "All plots" : STATUS_META[filter].label}</span>
                        </button>
                    </div>
                    <a className="lm-tbtn" href="https://goo.gl/maps/JarvnMRnW7U7fYBp6?g_st=aw" target="_blank" rel="noopener noreferrer" aria-label="Open in Google Maps">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" strokeLinejoin="round" /><circle cx="12" cy="10" r="2.4" /></svg>
                        <span>Location</span>
                    </a>
                    <button className="lm-tbtn" onClick={() => setPhotosOpen(true)} aria-label="Gallery">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.4" /><path d="M4 17l5-5 4 4 3-3 4 4" /></svg>
                        <span>Gallery</span>
                    </button>
                </div>

                {filterOpen && (
                    <div className="lm-filtermenu">
                        <div className="lm-filtermenu-head">
                            <span>Filter by status</span>
                            <button className="lm-iconbtn" onClick={() => setFilterOpen(false)} aria-label="Close"><svg viewBox="0 0 24 24" width="15" height="15"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg></button>
                        </div>
                        {(["all", "available", "reserved", "sold"] as const).map((f) => (
                            <button key={f} className={`lm-filteritem ${filter === f ? "active" : ""}`} onClick={() => { setFilter(f); setFilterOpen(false); }}>
                                <span className={`lm-dot is-${f}`} />
                                {f === "all" ? "All plots" : STATUS_META[f].label}
                                <b>{f === "all" ? counts.total : counts[f]}</b>
                            </button>
                        ))}
                    </div>
                )}
                {filterOpen && <div className="lm-backdrop" onClick={() => setFilterOpen(false)} />}

                {photosOpen && (
                    <div className="lm-photos-overlay" onClick={() => setPhotosOpen(false)}>
                        <div className="lm-photos-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="lm-photos-head">
                                <span>Project Gallery</span>
                                <button className="lm-iconbtn" onClick={() => setPhotosOpen(false)} aria-label="Close"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg></button>
                            </div>
                            {media.length === 0 ? (
                                <div className="lm-photos-empty">
                                    <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="M4 17l5-5 4 4 3-3 4 4" /></svg>
                                    <div>Photos coming soon</div>
                                </div>
                            ) : (
                                <div className="lm-photos-grid">
                                    {media.map((m, i) => (
                                        <button key={m.id} className="lm-photo-cell" onClick={() => setLightbox(i)}>
                                            {m.type === "video" ? (
                                                <><video src={m.url} muted playsInline preload="metadata" /><span className="lm-photo-play"><svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M8 5v14l11-7z" /></svg></span></>
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

                {lightbox !== null && media[lightbox] && (
                    <div className="lm-lightbox" onClick={() => setLightbox(null)}>
                        <button className="lm-lightbox-close" onClick={() => setLightbox(null)} aria-label="Close"><svg viewBox="0 0 24 24" width="22" height="22"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg></button>
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
                                <button className="lm-lightbox-nav lm-prev" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + media.length) % media.length); }} aria-label="Previous"><svg viewBox="0 0 24 24" width="26" height="26"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                                <button className="lm-lightbox-nav lm-next" onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % media.length); }} aria-label="Next"><svg viewBox="0 0 24 24" width="26" height="26"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                            </>
                        )}
                    </div>
                )}

                {/* Controls */}
                <div className="lm-ctrl">
                    <button onClick={() => btnZoom(1.8)} aria-label="Zoom in"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg></button>
                    <button onClick={() => btnZoom(1 / 1.8)} aria-label="Zoom out"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg></button>
                    <button onClick={rotate} aria-label="Rotate"><svg viewBox="0 0 24 24" width="17" height="17"><path d="M4 9a8 8 0 1 1-.8 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M4 4v5h5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                    <button onClick={reset} aria-label="Reset view"><svg viewBox="0 0 24 24" width="17" height="17"><path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg></button>
                    <button className={night ? "is-on" : ""} onClick={() => setNight((v) => !v)} aria-label="Toggle day / twilight">
                        {night ? (
                            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5" /><path d="M12 2v2M12 20v2M4.5 4.5l1.4 1.4M18.1 18.1l1.4 1.4M2 12h2M20 12h2M4.5 19.5l1.4-1.4M18.1 5.9l1.4-1.4" strokeLinecap="round" /></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" strokeLinejoin="round" /></svg>
                        )}
                    </button>
                </div>

                {/* Build credit */}
                <div className="lm-tiq-wrap">
                    {tiqOpen && (
                        <a className="lm-tiq-pop" href="https://trainiq.in" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <div className="lm-tiq-pop-title">Built by Train IQ</div>
                            <div className="lm-tiq-pop-sub">trainiq.in →</div>
                        </a>
                    )}
                    <button className="lm-tiq-logo" onClick={() => setTiqOpen((v) => !v)} aria-label="Train IQ">
                        <svg viewBox="0 0 62 34" width="42" height="23" aria-hidden="true">
                            <rect x="4" y="6" width="5.4" height="22" rx="1" fill="currentColor" />
                            <path d="M32 6.4 a11 11 0 1 0 6.4 19.9 l4.2 4.2 3.8-3.8 -4.1-4.1 A11 11 0 0 0 32 6.4 Z M32 11.4 a6 6 0 1 1 0 12 a6 6 0 0 1 0-12 Z" fill="currentColor" />
                            <rect x="50" y="22.5" width="5.6" height="5.6" rx="1" fill="currentColor" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Detail panel */}
            <div className={`lm-panel ${sel ? "open" : ""}`}>
                {sel && (
                    <>
                        <div className="lm-panel-head">
                            <div className="lm-panel-heading">
                                <div className="lm-panel-kicker">Plot</div>
                                <div className="lm-panel-title">No. {sel.id}</div>
                            </div>
                            <span className={`lm-status-badge lm-status-${selStatus || "available"}`}>
                                <i className={`lm-dot is-${selStatus || "available"}`} />{selStatus ? STATUS_META[selStatus].label : "Available"}
                            </span>
                            <button className="lm-iconbtn lm-panel-close" onClick={() => setSelected(null)} aria-label="Close"><svg viewBox="0 0 24 24" width="17" height="17"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg></button>
                        </div>

                        <div className="lm-diagram">
                            <div className="lm-dimbox">
                                <span className="lm-dim lm-dim-top">{SIDES[sel.id]?.n} m</span>
                                <span className="lm-dim lm-dim-right">{SIDES[sel.id]?.e} m</span>
                                <span className="lm-dim lm-dim-bottom">{SIDES[sel.id]?.s} m</span>
                                <span className="lm-dim lm-dim-left">{SIDES[sel.id]?.w} m</span>
                                <div className="lm-dimbox-inner">
                                    <svg viewBox="0 0 24 24" width="15" height="15"><path d="M12 3 L15 12 L12 10 L9 12 Z" fill="#d9bd6f" /><path d="M12 21 L15 12 L12 14 L9 12 Z" fill="#8a7f63" /></svg>
                                    <span className="lm-dim-facing">{SIDES[sel.id]?.facing}</span>
                                    <span className="lm-dim-facelbl">Facing</span>
                                </div>
                            </div>
                        </div>

                        <div className="lm-rows">
                            <Row label="Area (sq. ft)" value={`${sel.sqft.toLocaleString()}`} />
                            <Row label="Area (sq. yards)" value={`${Math.round(sel.sqft / 9)}`} />
                            <Row label="Area (sq. metres)" value={`${sel.sqm}`} />
                            <Row label="Facing" value={SIDES[sel.id]?.facing || sel.facing} />
                            <Row label="Dimensions" value={sel.dim} />
                        </div>

                        <div className="lm-cta-row">
                            <a className="lm-cta lm-cta-wa" onClick={() => logEnquiry("whatsapp", sel.id)} href={`https://wa.me/919980061727?text=${encodeURIComponent(`Hi, I'm interested in Plot ${sel.id} at Basava Ganguru. Please share details.`)}`} target="_blank" rel="noopener noreferrer">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 2.1.55 4.06 1.6 5.83L2 22l4.4-1.15a9.86 9.86 0 0 0 5.64 1.72c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.8 14.1c-.24.68-1.42 1.3-1.95 1.34-.5.04-1.13.23-3.7-.77-3.12-1.23-5.11-4.42-5.26-4.62-.15-.2-1.26-1.67-1.26-3.19 0-1.52.8-2.27 1.08-2.58.28-.31.61-.39.82-.39.2 0 .41 0 .59.01.19.01.44-.07.69.53.24.58.83 2.02.9 2.17.07.15.12.32.02.52-.1.2-.15.32-.29.5-.15.17-.31.39-.44.52-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.2.72-.84.91-1.13.19-.29.39-.24.65-.15.27.1 1.7.8 1.99.95.29.15.48.22.55.34.07.13.07.72-.17 1.4z" /></svg>
                                Enquire on WhatsApp
                            </a>
                            <a className="lm-cta lm-cta-call" onClick={() => logEnquiry("call", sel.id)} href="tel:+919980061727" aria-label="Call">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>
                                Call
                            </a>
                        </div>
                    </>
                )}
            </div>

            {!sel && <div className="lm-hint">Tap a plot to view details · scroll or pinch to zoom · twist to rotate</div>}
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
  /* Apple system palette */
  --txt:#1a2230; --muted:#586472; --faint:#8b94a1;
  --accent:#0a84ff; --green:#34c759; --orange:#ff9f0a; --red:#ff3b30;

  /* Liquid Glass material (light) */
  --lg-bg:linear-gradient(180deg,rgba(255,255,255,.58),rgba(255,255,255,.30) 46%,rgba(255,255,255,.44));
  --lg-blur:blur(26px) saturate(185%) brightness(1.05);
  --lg-hi:inset 0 1.5px .5px rgba(255,255,255,.9), inset 0 -1px 1px rgba(255,255,255,.4);
  --lg-ring:inset 0 0 0 1px rgba(255,255,255,.55);
  --lg-shadow:0 12px 32px rgba(18,28,45,.16), 0 4px 12px rgba(18,28,45,.10);
  --lg-glass:var(--lg-hi), var(--lg-ring), var(--lg-shadow);
  --hair:rgba(28,38,54,.10);

  position:fixed; inset:0; width:100%; height:100%;
  background:radial-gradient(130% 100% at 30% 6%,#e9e3d2,#cdc4ac);
  color:var(--txt);
  font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','SF Pro Display','Inter',system-ui,sans-serif;
  overflow:hidden; overscroll-behavior:none; touch-action:none; -webkit-font-smoothing:antialiased;
}
.lm-root.is-night{
  --txt:#f3f6fb; --muted:#aab4c2; --faint:#7c8697;
  --lg-bg:linear-gradient(180deg,rgba(70,78,94,.5),rgba(28,32,44,.42) 46%,rgba(46,52,66,.5));
  --lg-blur:blur(30px) saturate(150%) brightness(1);
  --lg-hi:inset 0 1.5px .5px rgba(255,255,255,.32), inset 0 -1px 1px rgba(255,255,255,.12);
  --lg-ring:inset 0 0 0 1px rgba(255,255,255,.16);
  --lg-shadow:0 16px 40px rgba(0,0,0,.5);
  --hair:rgba(255,255,255,.12);
  background:radial-gradient(130% 100% at 30% 6%,#141d2e,#070a11);
}

/* ---------- Header: floating glass capsules ---------- */
.lm-head{ position:absolute; top:0; left:0; right:0; z-index:6; background:transparent;
  display:flex; align-items:flex-start; justify-content:space-between; gap:12px; flex-wrap:wrap;
  padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 12px; pointer-events:none; }
.lm-head > *{ pointer-events:auto; }
.lm-brand{ display:flex; align-items:center; gap:11px; min-width:0;
  background:var(--lg-bg); backdrop-filter:var(--lg-blur); -webkit-backdrop-filter:var(--lg-blur);
  box-shadow:var(--lg-glass); border-radius:20px; padding:8px 15px 8px 11px; }
.lm-logo{ display:flex; filter:drop-shadow(0 1px 3px rgba(0,0,0,.2)); }
.lm-brand-name{ font-weight:700; font-size:16px; line-height:1.1; letter-spacing:-.02em; color:var(--txt); }
.lm-brand-sub{ font-size:10.5px; color:var(--muted); letter-spacing:.01em; margin-top:2px; }

.lm-head-tools{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; justify-content:flex-end; }
.lm-search input{ width:170px; box-sizing:border-box; color:var(--txt); font-size:13px; font-weight:500; outline:none;
  background:var(--lg-bg); backdrop-filter:var(--lg-blur); -webkit-backdrop-filter:var(--lg-blur);
  border:none; box-shadow:var(--lg-glass); border-radius:999px; padding:11px 17px; transition:box-shadow .2s; }
.lm-search input:focus{ box-shadow:var(--lg-hi), inset 0 0 0 1.5px var(--accent), var(--lg-shadow); }
.lm-search input::placeholder{ color:var(--faint); }
.lm-legend{ display:flex; align-items:center; gap:2px; padding:5px 6px; border-radius:999px;
  background:var(--lg-bg); backdrop-filter:var(--lg-blur); -webkit-backdrop-filter:var(--lg-blur); box-shadow:var(--lg-glass); }
.lm-leg{ display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:500; color:var(--muted);
  padding:3px 9px; border-radius:999px; white-space:nowrap; }
.lm-leg b{ color:var(--txt); font-weight:700; font-variant-numeric:tabular-nums; }
.lm-dot{ width:9px; height:9px; border-radius:50%; flex:none; box-shadow:0 0 0 1px rgba(255,255,255,.5), 0 1px 2px rgba(0,0,0,.25); }
.lm-dot.is-all{ background:#8e98a6; } .lm-dot.is-available{ background:var(--green); }
.lm-dot.is-reserved{ background:var(--orange); } .lm-dot.is-sold{ background:var(--red); }

/* ---------- Stage / scene (unchanged model) ---------- */
.lm-stage{ position:absolute; inset:0; touch-action:none; user-select:none; cursor:grab;
  overflow:hidden; background:radial-gradient(120% 90% at 38% 18%,#cabf9c,#8a7d58); contain:layout size; }
.lm-stage:active{ cursor:grabbing; }
.lm-svg{ display:block; width:100%; height:100%; }
.lm-camera{ transform-box:view-box; transform-origin:0 0; will-change:transform; }
.lm-siteline{ fill:none; stroke:#6b5c3f; stroke-width:2.4; stroke-dasharray:3 7; opacity:.5; }
.lm-syno text{ fill:#5a4f38; font-size:14px; font-weight:700; letter-spacing:.03em; }
.lm-kerb polygon, .lm-kerb rect{ fill:none; stroke:#efe9d8; stroke-width:2.4; opacity:.5; }
.lm-paver line{ stroke:#8a7f5e; stroke-width:1; opacity:.5; }
.lm-lane line{ stroke:#f6ecc0; stroke-width:2.4; stroke-dasharray:12 16; opacity:.7; stroke-linecap:round; }
.lm-roadlbl text{ fill:#6a5f42; font-size:11.5px; font-weight:700; letter-spacing:.16em; text-anchor:middle; }
.lm-roadlbl-lg{ font-size:13px !important; letter-spacing:.2em !important; }
.lm-roadlbl-sm{ font-size:9px !important; letter-spacing:.1em !important; }
.lm-parcel-edge{ fill:none; stroke:#274415; stroke-width:2.6; stroke-dasharray:8 5; opacity:.7; stroke-linejoin:round; }
.lm-parcel-lbl{ fill:#264018; font-size:14px; font-weight:800; letter-spacing:.12em; text-anchor:middle; }
.lm-ca-label{ fill:#234017; font-size:26px; font-weight:900; text-anchor:middle; }
.lm-ca-sub{ fill:#2c4a1a; font-size:8px; font-weight:700; letter-spacing:.14em; text-anchor:middle; opacity:.85; }
.lm-stp-label{ fill:#40296b; font-size:12px; font-weight:800; text-anchor:middle; }

.lm-plot{ cursor:pointer; transition:opacity .22s ease; }
.lm-plot.is-dim{ opacity:.28; }
.lm-plot-top{ transition:filter .22s ease, transform .22s ease; }
.lm-plot-side{ opacity:.95; }
.lm-plot-bevel{ fill:none; stroke:#ffffff; stroke-width:1; opacity:.3; }
.lm-plot:hover .lm-plot-top{ filter:url(#selGlow) brightness(1.05) !important; }
.lm-plot:focus{ outline:none; }
.lm-plot:focus-visible .lm-plot-top{ stroke:#fff !important; stroke-width:2.6 !important; }
.lm-plot-num{ fill:#ffffff; font-size:14px; font-weight:800; text-anchor:middle; pointer-events:none;
  paint-order:stroke; stroke:rgba(0,0,0,.42); stroke-width:2.4px; stroke-linejoin:round; }
.lm-compass-bg{ fill:rgba(255,255,255,.42); stroke:rgba(255,255,255,.6); stroke-width:1.4; }
.lm-root.is-night .lm-compass-bg{ fill:rgba(40,46,60,.5); stroke:rgba(255,255,255,.24); }
.lm-compass-lbl{ fill:var(--txt); font-size:12px; font-weight:800; }

/* ---------- Bottom toolbar ---------- */
.lm-toolbar{ position:absolute; left:50%; transform:translateX(-50%);
  bottom:calc(env(safe-area-inset-bottom,0px) + 18px); z-index:16; display:flex; gap:4px; padding:6px;
  border-radius:24px; background:var(--lg-bg); backdrop-filter:var(--lg-blur); -webkit-backdrop-filter:var(--lg-blur); box-shadow:var(--lg-glass); }
.lm-filterwrap{ position:relative; }
.lm-tbtn{ display:inline-flex; align-items:center; gap:8px; text-decoration:none; height:44px; padding:0 17px;
  border-radius:19px; cursor:pointer; border:none; background:transparent; color:var(--txt); font-size:13.5px; font-weight:600;
  white-space:nowrap; transition:background .18s, box-shadow .18s; }
.lm-tbtn svg{ color:var(--accent); }
.lm-tbtn:hover{ background:rgba(255,255,255,.35); }
.lm-tbtn:active{ transform:translateY(.5px); }
.lm-root.is-night .lm-tbtn:hover{ background:rgba(255,255,255,.12); }
.lm-filterbtn.is-available{ box-shadow:inset 0 0 0 1.5px var(--green); }
.lm-filterbtn.is-reserved{ box-shadow:inset 0 0 0 1.5px var(--orange); }
.lm-filterbtn.is-sold{ box-shadow:inset 0 0 0 1.5px var(--red); }

.lm-backdrop{ position:fixed; inset:0; z-index:15; }
.lm-filtermenu{ position:absolute; left:50%; bottom:calc(env(safe-area-inset-bottom,0px) + 80px); z-index:17;
  background:var(--lg-bg); backdrop-filter:var(--lg-blur); -webkit-backdrop-filter:var(--lg-blur); box-shadow:var(--lg-glass);
  border-radius:22px; padding:7px; display:flex; flex-direction:column; gap:2px; min-width:224px;
  transform:translateX(-50%); animation:fmenu .2s cubic-bezier(.22,1,.36,1); }
@keyframes fmenu{ from{opacity:0; transform:translate(-50%,10px) scale(.97);} to{opacity:1; transform:translate(-50%,0) scale(1);} }
.lm-filtermenu-head{ display:flex; align-items:center; justify-content:space-between; padding:6px 8px 9px 13px;
  font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.08em; color:var(--muted);
  border-bottom:1px solid var(--hair); margin-bottom:4px; }
.lm-filteritem{ display:flex; align-items:center; gap:11px; background:transparent; border:none; color:var(--txt);
  font-size:13.5px; font-weight:500; padding:11px 14px; border-radius:15px; cursor:pointer; text-align:left; transition:background .14s; white-space:nowrap; }
.lm-filteritem b{ margin-left:auto; color:var(--muted); font-weight:700; font-variant-numeric:tabular-nums; }
.lm-filteritem:hover{ background:rgba(255,255,255,.4); }
.lm-filteritem.active{ background:rgba(10,132,255,.16); color:var(--accent); }
.lm-filteritem.active b{ color:var(--accent); }
.lm-root.is-night .lm-filteritem:hover{ background:rgba(255,255,255,.12); }

.lm-iconbtn{ width:32px; height:32px; border-radius:50%; border:none; background:rgba(120,130,145,.14);
  color:var(--muted); display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .14s, color .14s; }
.lm-iconbtn:hover{ background:rgba(120,130,145,.24); color:var(--txt); }

/* ---------- Zoom / view controls ---------- */
.lm-ctrl{ position:absolute; right:calc(env(safe-area-inset-right,0px) + 14px); bottom:calc(env(safe-area-inset-bottom,0px) + 84px);
  z-index:8; display:flex; flex-direction:column; border-radius:22px; padding:5px; gap:3px;
  background:var(--lg-bg); backdrop-filter:var(--lg-blur); -webkit-backdrop-filter:var(--lg-blur); box-shadow:var(--lg-glass); }
.lm-ctrl button{ width:42px; height:42px; border:none; background:transparent; color:var(--accent); border-radius:15px;
  display:flex; align-items:center; justify-content:center; cursor:pointer; transition:background .14s; }
.lm-ctrl button:hover{ background:rgba(255,255,255,.35); }
.lm-root.is-night .lm-ctrl button:hover{ background:rgba(255,255,255,.12); }
.lm-ctrl button.is-on{ background:var(--accent); color:#fff; }

/* ---------- Build credit ---------- */
.lm-tiq-wrap{ position:absolute; right:calc(env(safe-area-inset-right,0px) + 14px); bottom:calc(env(safe-area-inset-bottom,0px) + 18px);
  z-index:12; display:flex; flex-direction:column-reverse; align-items:flex-end; gap:8px; }
.lm-tiq-logo{ display:flex; align-items:center; justify-content:center; cursor:pointer; color:var(--txt);
  background:var(--lg-bg); backdrop-filter:var(--lg-blur); -webkit-backdrop-filter:var(--lg-blur); box-shadow:var(--lg-glass);
  border:none; border-radius:14px; padding:7px 11px; transition:transform .15s; }
.lm-tiq-logo:active{ transform:scale(.94); }
.lm-tiq-pop{ text-decoration:none; color:var(--txt); border-radius:16px; padding:10px 14px; white-space:nowrap;
  background:var(--lg-bg); backdrop-filter:var(--lg-blur); -webkit-backdrop-filter:var(--lg-blur); box-shadow:var(--lg-glass);
  animation:tiqpop .2s cubic-bezier(.22,1,.36,1); }
.lm-tiq-pop-title{ font-size:12.5px; font-weight:700; } .lm-tiq-pop-sub{ font-size:11px; color:var(--accent); margin-top:1px; }
@keyframes tiqpop{ from{opacity:0; transform:translateY(8px) scale(.96);} to{opacity:1; transform:translateY(0) scale(1);} }

/* ---------- Hint ---------- */
.lm-hint{ position:absolute; bottom:calc(env(safe-area-inset-bottom,0px) + 76px); left:50%; transform:translateX(-50%);
  z-index:7; color:var(--muted); font-size:12px; font-weight:500; padding:10px 18px; border-radius:999px;
  background:var(--lg-bg); backdrop-filter:var(--lg-blur); -webkit-backdrop-filter:var(--lg-blur); box-shadow:var(--lg-glass);
  white-space:nowrap; pointer-events:none; animation:fade 7s ease forwards; }
@keyframes fade{ 0%,72%{opacity:1;} 100%{opacity:0;} }

/* ---------- Splash ---------- */
.lm-splash{ position:absolute; inset:0; z-index:100; display:flex; flex-direction:column; align-items:center; justify-content:center;
  cursor:pointer; background:radial-gradient(120% 100% at 50% 30%,#efe9d8,#d3c9b0 82%); animation:splashOut .4s ease forwards; animation-delay:1.5s; }
.lm-root.is-night .lm-splash{ background:radial-gradient(120% 100% at 50% 30%,#18202f,#070a11 82%); }
.lm-splash-inner{ display:flex; flex-direction:column; align-items:center; text-align:center; animation:splashIn .7s cubic-bezier(.22,1,.36,1); }
.lm-splash-logo{ width:96px; height:96px; display:grid; place-items:center; border-radius:28px; margin-bottom:18px;
  background:var(--lg-bg); backdrop-filter:var(--lg-blur); box-shadow:var(--lg-glass); animation:logoFloat 3s ease-in-out infinite; }
@keyframes logoFloat{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
.lm-splash-name{ font-weight:700; font-size:32px; line-height:1; letter-spacing:-.02em; color:var(--txt); }
.lm-splash-sub{ margin-top:10px; font-size:11px; letter-spacing:.2em; color:var(--muted); }
.lm-splash-tag{ margin-top:6px; font-size:12px; color:var(--faint); letter-spacing:.02em; }
.lm-splash-bar{ margin-top:24px; width:180px; height:4px; border-radius:99px; background:rgba(120,130,145,.2); overflow:hidden; }
.lm-splash-bar span{ display:block; height:100%; width:0; border-radius:99px; background:var(--accent); animation:barFill 1.5s ease forwards; }
@keyframes barFill{ from{width:0} to{width:100%} }
.lm-splash-credit{ position:absolute; bottom:calc(env(safe-area-inset-bottom,0px) + 22px); font-size:10px; letter-spacing:.08em; color:var(--faint); }
@keyframes splashIn{ from{opacity:0; transform:translateY(12px) scale(.98)} to{opacity:1; transform:none} }
@keyframes splashOut{ to{opacity:0; visibility:hidden} }

/* ---------- Photos ---------- */
.lm-photos-overlay{ position:absolute; inset:0; z-index:30; display:flex; align-items:center; justify-content:center;
  background:rgba(20,24,30,.4); backdrop-filter:blur(8px) saturate(160%); animation:fadein .2s ease; }
.lm-photos-modal{ width:min(88vw,460px); background:var(--lg-bg); backdrop-filter:var(--lg-blur); -webkit-backdrop-filter:var(--lg-blur);
  box-shadow:var(--lg-glass); border-radius:28px; padding:18px 18px 22px; }
.lm-photos-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:14px; font-size:17px; font-weight:700; letter-spacing:-.01em; color:var(--txt); }
.lm-photos-empty{ display:flex; flex-direction:column; align-items:center; gap:12px; padding:34px 0; color:var(--muted); font-size:13px; }
@keyframes fadein{ from{opacity:0} to{opacity:1} }
.lm-photos-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; max-height:60vh; overflow-y:auto; padding:2px; }
.lm-photo-cell{ position:relative; aspect-ratio:1; border:none; border-radius:16px; overflow:hidden; cursor:pointer; background:rgba(0,0,0,.2); padding:0; }
.lm-photo-cell img, .lm-photo-cell video{ width:100%; height:100%; object-fit:cover; display:block; }
.lm-photo-cell:active{ transform:scale(.97); }
.lm-photo-play{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.26); }
.lm-lightbox{ position:absolute; inset:0; z-index:120; display:flex; align-items:center; justify-content:center; background:rgba(10,12,16,.9); backdrop-filter:blur(6px); animation:fadein .2s ease; }
.lm-lightbox-inner{ max-width:92vw; max-height:82vh; display:flex; flex-direction:column; align-items:center; gap:12px; }
.lm-lightbox-media{ max-width:92vw; max-height:76vh; border-radius:18px; object-fit:contain; box-shadow:0 20px 60px rgba(0,0,0,.6); }
.lm-lightbox-cap{ color:#f3f6ee; font-size:14px; text-align:center; max-width:80vw; }
.lm-lightbox-close{ position:absolute; top:calc(env(safe-area-inset-top,0px) + 16px); right:16px; z-index:2; width:44px; height:44px; border-radius:50%;
  border:none; color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer;
  background:rgba(255,255,255,.16); backdrop-filter:blur(16px) saturate(160%); box-shadow:inset 0 1px 1px rgba(255,255,255,.4); }
.lm-lightbox-nav{ position:absolute; top:50%; transform:translateY(-50%); width:48px; height:48px; border-radius:50%; border:none; color:#fff;
  display:flex; align-items:center; justify-content:center; cursor:pointer;
  background:rgba(255,255,255,.16); backdrop-filter:blur(16px) saturate(160%); box-shadow:inset 0 1px 1px rgba(255,255,255,.4); }
.lm-lightbox-nav.lm-prev{ left:12px; } .lm-lightbox-nav.lm-next{ right:12px; }

/* ---------- Detail panel ---------- */
.lm-panel{ position:absolute; left:12px; right:12px; bottom:0; z-index:20;
  background:var(--lg-bg); backdrop-filter:var(--lg-blur); -webkit-backdrop-filter:var(--lg-blur);
  box-shadow:var(--lg-glass); border-radius:30px 30px 22px 22px;
  padding:8px 20px calc(env(safe-area-inset-bottom,0px) + 16px); margin-bottom:calc(env(safe-area-inset-bottom,0px) + 10px);
  transform:translateY(130%); transition:transform .42s cubic-bezier(.22,1,.36,1); }
.lm-panel.open{ transform:translateY(0); }
.lm-panel::before{ content:""; display:block; width:38px; height:5px; border-radius:99px; background:rgba(120,130,145,.4); margin:6px auto 14px; }
.lm-panel-head{ display:flex; align-items:center; gap:12px; margin-bottom:16px; }
.lm-panel-heading{ min-width:0; }
.lm-panel-kicker{ font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--accent); font-weight:700; }
.lm-panel-title{ font-size:26px; font-weight:700; line-height:1; margin-top:3px; letter-spacing:-.02em; color:var(--txt); }
.lm-panel-close{ margin-left:auto; width:34px; height:34px; }
.lm-status-badge{ display:inline-flex; align-items:center; gap:7px; font-size:12.5px; font-weight:700; padding:6px 13px; border-radius:999px; color:#fff; }
.lm-status-badge .lm-dot{ width:8px; height:8px; box-shadow:none; background:rgba(255,255,255,.9); }
.lm-status-available{ background:var(--green); } .lm-status-reserved{ background:var(--orange); } .lm-status-sold{ background:var(--red); }

.lm-diagram{ display:flex; justify-content:center; margin:4px 0 18px; }
.lm-dimbox{ position:relative; width:196px; height:112px; margin:20px 30px; }
.lm-dimbox-inner{ position:absolute; inset:0; border-radius:16px; background:rgba(120,130,145,.1);
  box-shadow:inset 0 0 0 1.5px var(--accent), inset 0 0 22px rgba(10,132,255,.1);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }
.lm-dim-facing{ color:var(--accent); font-weight:800; font-size:15px; }
.lm-dim-facelbl{ color:var(--muted); font-size:8px; letter-spacing:.16em; text-transform:uppercase; }
.lm-dim{ position:absolute; color:var(--txt); font-size:11px; font-weight:600; white-space:nowrap; font-variant-numeric:tabular-nums; }
.lm-dim-top{ top:-17px; left:50%; transform:translateX(-50%); } .lm-dim-bottom{ bottom:-17px; left:50%; transform:translateX(-50%); }
.lm-dim-left{ left:-8px; top:50%; transform:translate(-100%,-50%); } .lm-dim-right{ right:-8px; top:50%; transform:translate(100%,-50%); }

.lm-rows{ display:flex; flex-direction:column; margin-bottom:18px; border-radius:18px; overflow:hidden; background:rgba(120,130,145,.08); }
.lm-row{ display:flex; justify-content:space-between; align-items:center; gap:12px; padding:13px 16px; border-bottom:1px solid var(--hair); }
.lm-row:last-child{ border-bottom:none; }
.lm-row-l{ font-size:12.5px; color:var(--muted); }
.lm-row-v{ font-size:13.5px; font-weight:700; text-align:right; color:var(--txt); font-variant-numeric:tabular-nums; }

.lm-cta-row{ display:flex; gap:10px; }
.lm-cta{ display:flex; align-items:center; justify-content:center; gap:8px; text-decoration:none; padding:15px; border:none;
  border-radius:18px; cursor:pointer; color:#fff; font-weight:700; font-size:15px; transition:transform .12s, filter .15s;
  box-shadow:inset 0 1px 1px rgba(255,255,255,.45), 0 8px 22px rgba(0,0,0,.18); }
.lm-cta-wa{ flex:1; background:linear-gradient(180deg,#3ad06a,#25b455); }
.lm-cta-call{ width:58px; background:linear-gradient(180deg,#2f9bff,#0a84ff); }
.lm-cta:hover{ transform:translateY(-1px); filter:brightness(1.05); } .lm-cta:active{ transform:translateY(1px); }

@media (min-width:720px){ .lm-panel{ max-width:410px; left:auto; right:18px; bottom:18px; margin-bottom:0; border-radius:26px; } }
@media (max-width:520px){
  .lm-head-tools{ flex:1; } .lm-search{ flex:1; } .lm-search input{ width:100%; }
  .lm-legend{ order:3; width:100%; justify-content:space-between; }
}
@media (prefers-reduced-motion:reduce){ .lm-panel,.lm-plot,.lm-plot-top{ transition:none; } .lm-hint,.lm-splash,.lm-splash-logo{ animation:none; } }
`;
