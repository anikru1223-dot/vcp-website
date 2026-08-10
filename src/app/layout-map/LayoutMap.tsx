"use client";

import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client"; // adjust path to your client

/**
 * Basava Ganguru — Interactive Master Layout
 * Enterprise cartographic workspace (flat CAD/GIS styling, semantic status system).
 */

type Plot = {
    id: string; pts: string; dim: string; facing: string; sqm: number; sqft: number;
};

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

export default function LayoutMap() {
    const [selected, setSelected] = useState<string | null>(null);
    const [tiqOpen, setTiqOpen] = useState(false);
    const [photosOpen, setPhotosOpen] = useState(false);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [lightbox, setLightbox] = useState<number | null>(null);
    const [dark, setDark] = useState(false);
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
        const t = window.setTimeout(() => setSplash(false), 1400);
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

    // Live availability tally for the legend / summary strip.
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

    return (
        <div className={`lm-root ${dark ? "is-dark" : ""}`}>
            <style>{css}</style>

            {splash && (
                <div className="lm-splash" onClick={() => setSplash(false)}>
                    <div className="lm-splash-inner">
                        <div className="lm-splash-mark" aria-hidden="true">BG</div>
                        <div className="lm-splash-name">Basava Ganguru</div>
                        <div className="lm-splash-sub">Master Layout · Shivamogga</div>
                        <div className="lm-splash-bar"><span /></div>
                        <div className="lm-splash-loading">Loading layout</div>
                    </div>
                </div>
            )}

            <header className="lm-head">
                <div className="lm-brand">
                    <div className="lm-mark" aria-hidden="true">BG</div>
                    <div>
                        <div className="lm-brand-name">Basava Ganguru</div>
                        <div className="lm-brand-sub">Master Layout · Vijayalaxmi C Patil, Shivamogga</div>
                    </div>
                </div>

                <div className="lm-head-tools">
                    <div className="lm-search">
                        <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
                            <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                        <input
                            placeholder="Search plot no."
                            value={selected ?? ""}
                            onChange={(e) => { const v = e.target.value.trim(); setSelected(PLOTS.some((p) => p.id === v) ? v : null); }}
                        />
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
                        <pattern id="lmGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M40 0H0V40" fill="none" stroke="var(--grid)" strokeWidth="0.8" />
                        </pattern>
                        <pattern id="lmGridMajor" width="200" height="200" patternUnits="userSpaceOnUse">
                            <path d="M200 0H0V200" fill="none" stroke="var(--grid-major)" strokeWidth="1.1" />
                        </pattern>
                        <filter id="lmSelSh" x="-25%" y="-25%" width="150%" height="150%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="var(--sel-sh)" floodOpacity="0.5" />
                        </filter>
                    </defs>

                    <g ref={cameraRef} className="lm-camera">
                        {/* Canvas + CAD grid */}
                        <rect x={BASE_VB.x - 900} y={BASE_VB.y - 900} width={BASE_VB.w + 1800} height={BASE_VB.h + 1800} fill="var(--canvas)" />
                        <rect x={BASE_VB.x - 900} y={BASE_VB.y - 900} width={BASE_VB.w + 1800} height={BASE_VB.h + 1800} fill="url(#lmGrid)" pointerEvents="none" />
                        <rect x={BASE_VB.x - 900} y={BASE_VB.y - 900} width={BASE_VB.w + 1800} height={BASE_VB.h + 1800} fill="url(#lmGridMajor)" pointerEvents="none" />

                        {/* Site parcel */}
                        <polygon points={BOUNDARY} className="lm-site" />

                        {/* Survey-number annotations (cadastral) */}
                        <g className="lm-syno" pointerEvents="none">
                            <text x="300" y="248" textAnchor="middle">Sy.No. 39</text>
                            <text x="581" y="248" textAnchor="middle">Sy.No. 42</text>
                            <text x="150" y="430" textAnchor="middle" transform="rotate(-90 150 430)">Sy.No. 44</text>
                            <text x="150" y="720" textAnchor="middle" transform="rotate(-90 150 720)">Sy.No. 43/1</text>
                            <text x="1120" y="500" textAnchor="middle" transform="rotate(90 1120 500)">Sy.No. 43/3</text>
                            <text x="1120" y="820" textAnchor="middle" transform="rotate(90 1120 820)">Sy.No. 43/3</text>
                            <text x="600" y="1075" textAnchor="middle">Sy.No. 46</text>
                        </g>
                        <g className="lm-exist" pointerEvents="none">
                            <text x="321" y="230" textAnchor="middle">EXISTING 9m ROAD</text>
                            <text x="1124" y="640" textAnchor="middle" transform="rotate(90 1124 640)">EXISTING 12m ROAD</text>
                        </g>

                        {/* Circulation network (flat) */}
                        <g className="lm-roads">
                            <polygon points={ROADS.top} />
                            <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} />
                            <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} />
                            <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} />
                        </g>
                        <rect x={ROADS.path.x} y={ROADS.path.y} width={ROADS.path.w} height={ROADS.path.h} className="lm-path" />
                        <g className="lm-lane" pointerEvents="none">
                            <line x1="531" y1="270" x2="531" y2="944" />
                            <line x1="822" y1="270" x2="822" y2="944" />
                            <line x1="122" y1="499" x2="500" y2="499" />
                            <line x1="118" y1="223" x2="1108" y2="223" />
                        </g>
                        <g className="lm-roadlbl" pointerEvents="none">
                            <text x="600" y="220" className="lm-roadlbl-lg">APPROVED LAYOUT 12m ROAD</text>
                            <text x="531" y="620" transform="rotate(-90 531 620)">9m ROAD</text>
                            <text x="822" y="620" transform="rotate(-90 822 620)">9m ROAD</text>
                            <text x="300" y="503" >9m ROAD</text>
                            <text x="300" y="672" className="lm-roadlbl-sm">3m PATHWAY</text>
                        </g>

                        {/* Reserved parcels */}
                        <polygon points={KARAB} className="lm-park" />
                        <ellipse cx={KARAB_LAKE.cx} cy={KARAB_LAKE.cy} rx={KARAB_LAKE.rx} ry={KARAB_LAKE.ry} className="lm-water" />
                        <text x="300" y={KARAB_LAKE.cy - KARAB_LAKE.ry - 14} className="lm-parcel-lbl">KARAB</text>
                        <text x={KARAB_LAKE.cx} y={KARAB_LAKE.cy + 5} className="lm-water-lbl">WATER BODY</text>

                        <polygon points={CA} className="lm-amenity" />
                        <text x={centroid(CA).x} y={centroid(CA).y - 4} className="lm-amenity-lbl-lg">CA</text>
                        <text x={centroid(CA).x} y={centroid(CA).y + 16} className="lm-amenity-lbl-sm">CIVIC AMENITY</text>

                        <polygon points={STP} className="lm-amenity" />
                        <text x={centroid(STP).x} y={centroid(STP).y + 5} className="lm-amenity-lbl">STP</text>

                        {/* Plots */}
                        {PLOTS.map((p) => {
                            const c = centroid(p.pts);
                            const isSel = p.id === selected;
                            const effective: Status = statusMap[p.id] || "available";
                            const dimmed = filter !== "all" && effective !== filter;
                            return (
                                <g key={p.id} className={`lm-plot ${dimmed ? "is-dim" : ""}`}
                                    onClick={(e) => { e.stopPropagation(); setSelected(p.id); }}
                                    role="button" tabIndex={0}
                                    onKeyDown={(e: React.KeyboardEvent) => (e.key === "Enter" || e.key === " ") && setSelected(p.id)}>
                                    <polygon points={p.pts}
                                        className={`lm-plot-shape is-${effective} ${isSel ? "is-sel" : ""}`}
                                        filter={isSel ? "url(#lmSelSh)" : undefined} />
                                    <text x={c.x} y={c.y + 5} className="lm-plot-num">{p.id}</text>
                                </g>
                            );
                        })}
                    </g>

                    {/* Compass — inner group counter-rotates to keep North true */}
                    <g className="lm-compass" transform="translate(1128,244)">
                        <circle r="20" className="lm-compass-bg" />
                        <g ref={compassRef}>
                            <path d="M0,-13 L4,3 L0,-0.5 L-4,3 Z" className="lm-compass-n" />
                            <path d="M0,13 L4,-3 L0,0.5 L-4,-3 Z" className="lm-compass-s" />
                            <text y="-24" textAnchor="middle" className="lm-compass-lbl">N</text>
                        </g>
                    </g>
                </svg>

                {/* Bottom toolbar — Filter · Maps · Photos */}
                <div className="lm-toolbar">
                    <div className="lm-filterwrap">
                        <button
                            className={`lm-tbtn lm-filterbtn ${filter !== "all" ? `is-${filter}` : ""}`}
                            onClick={() => setFilterOpen((v) => !v)}
                            aria-label="Filter plots"
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 5h16M7 12h10M10 19h4" strokeLinecap="round" />
                            </svg>
                            <span>{filter === "all" ? "All plots" : STATUS_META[filter].label}</span>
                        </button>
                    </div>

                    <a className="lm-tbtn" href="https://goo.gl/maps/JarvnMRnW7U7fYBp6?g_st=aw" target="_blank" rel="noopener noreferrer" aria-label="Open in Google Maps">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" strokeLinejoin="round" />
                            <circle cx="12" cy="10" r="2.4" />
                        </svg>
                        <span>Location</span>
                    </a>

                    <button className="lm-tbtn" onClick={() => setPhotosOpen(true)} aria-label="Gallery">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.4" /><path d="M4 17l5-5 4 4 3-3 4 4" />
                        </svg>
                        <span>Gallery</span>
                    </button>
                </div>

                {/* Filter menu */}
                {filterOpen && (
                    <div className="lm-filtermenu">
                        <div className="lm-filtermenu-head">
                            <span>Filter by status</span>
                            <button className="lm-iconbtn" onClick={() => setFilterOpen(false)} aria-label="Close">
                                <svg viewBox="0 0 24 24" width="15" height="15"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                        {(["all", "available", "reserved", "sold"] as const).map((f) => (
                            <button
                                key={f}
                                className={`lm-filteritem ${filter === f ? "active" : ""}`}
                                onClick={() => { setFilter(f); setFilterOpen(false); }}
                            >
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
                                <span>Project gallery</span>
                                <button className="lm-iconbtn" onClick={() => setPhotosOpen(false)} aria-label="Close">
                                    <svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                                </button>
                            </div>
                            {media.length === 0 ? (
                                <div className="lm-photos-empty">
                                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="M4 17l5-5 4 4 3-3 4 4" /></svg>
                                    <div>No media uploaded yet</div>
                                </div>
                            ) : (
                                <div className="lm-photos-grid">
                                    {media.map((m, i) => (
                                        <button key={m.id} className="lm-photo-cell" onClick={() => setLightbox(i)}>
                                            {m.type === "video" ? (
                                                <>
                                                    <video src={m.url} muted playsInline preload="metadata" />
                                                    <span className="lm-photo-play">
                                                        <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M8 5v14l11-7z" /></svg>
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

                {/* Lightbox */}
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

                {/* Map controls */}
                <div className="lm-ctrl">
                    <button onClick={() => btnZoom(1.8)} aria-label="Zoom in"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg></button>
                    <button onClick={() => btnZoom(1 / 1.8)} aria-label="Zoom out"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg></button>
                    <button onClick={rotate} aria-label="Rotate"><svg viewBox="0 0 24 24" width="17" height="17"><path d="M4 9a8 8 0 1 1-.8 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /><path d="M4 4v5h5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                    <button onClick={reset} aria-label="Reset view"><svg viewBox="0 0 24 24" width="17" height="17"><path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" fill="none" /></svg></button>
                    <button className={dark ? "is-on" : ""} onClick={() => setDark((v) => !v)} aria-label="Toggle theme">
                        {dark ? (
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
                    <button className="lm-tiq-logo" onClick={() => setTiqOpen((v) => !v)} aria-label="Train IQ">Train IQ</button>
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
                                <i className={`lm-dot is-${selStatus || "available"}`} />
                                {selStatus ? STATUS_META[selStatus].label : "Available"}
                            </span>
                            <button className="lm-iconbtn lm-panel-close" onClick={() => setSelected(null)} aria-label="Close">
                                <svg viewBox="0 0 24 24" width="17" height="17"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                            </button>
                        </div>

                        <div className="lm-diagram">
                            <div className="lm-dimbox">
                                <span className="lm-dim lm-dim-top">{SIDES[sel.id]?.n} m</span>
                                <span className="lm-dim lm-dim-right">{SIDES[sel.id]?.e} m</span>
                                <span className="lm-dim lm-dim-bottom">{SIDES[sel.id]?.s} m</span>
                                <span className="lm-dim lm-dim-left">{SIDES[sel.id]?.w} m</span>
                                <div className="lm-dimbox-inner">
                                    <svg viewBox="0 0 24 24" width="15" height="15" className="lm-dim-compass"><path d="M12 3 L15 12 L12 10 L9 12 Z" fill="var(--accent)" /><path d="M12 21 L15 12 L12 14 L9 12 Z" fill="var(--text-muted)" /></svg>
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
  /* Light (default) — cartographic workspace */
  --bg:#eef1f5; --canvas:#f6f8fb; --grid:#e4e9ef; --grid-major:#d7dee6;
  --surface:#ffffff; --surface-2:#f4f6f9; --border:#e2e7ee; --border-2:#cfd7e0;
  --text:#1d2632; --text-muted:#63707f; --text-faint:#8a95a3;
  --accent:#2f6bed; --accent-weak:rgba(47,107,237,.10); --accent-border:rgba(47,107,237,.4);

  --site:#eef2f6; --site-line:#c3ccd6;
  --road:#d6dce4; --road-line:#a7b2bf;
  --park:#cadfc9; --park-line:#a7c7a6; --water:#b8d4e4; --water-line:#8fb6cc;
  --amenity:#dbe2ea; --amenity-line:#bcc7d3; --on-parcel:#3b4a3a; --on-water:#2c4a5c; --on-amenity:#3a4552;

  --st-available:#4f9d78; --st-reserved:#d6a13c; --st-sold:#c85f57;
  --st-available-weak:#e4f1ea; --st-reserved-weak:#f8efdc; --st-sold-weak:#f6e2e0;
  --plot-stroke:rgba(20,32,48,.30); --plot-num:#ffffff; --plot-num-sh:rgba(0,0,0,.45);
  --sel-sh:#0f172a;

  --shadow-sm:0 1px 2px rgba(16,24,40,.06),0 1px 3px rgba(16,24,40,.10);
  --shadow-md:0 4px 12px rgba(16,24,40,.10),0 2px 4px rgba(16,24,40,.06);
  --shadow-lg:0 12px 32px rgba(16,24,40,.16);

  position:fixed; inset:0; width:100%; height:100%;
  background:var(--bg); color:var(--text);
  font-family:'Inter',system-ui,-apple-system,'Segoe UI',sans-serif;
  overflow:hidden; overscroll-behavior:none; touch-action:none;
  -webkit-font-smoothing:antialiased;
}
.lm-root.is-dark{
  --bg:#0c1017; --canvas:#0f141c; --grid:#1a2230; --grid-major:#232d3d;
  --surface:#151b25; --surface-2:#1a212d; --border:#232c39; --border-2:#2e3a49;
  --text:#e6ebf2; --text-muted:#94a3b8; --text-faint:#6b7787;
  --accent:#5b8cff; --accent-weak:rgba(91,140,255,.14); --accent-border:rgba(91,140,255,.5);

  --site:#131a24; --site-line:#2a3646;
  --road:#2a323f; --road-line:#414d5d;
  --park:#243a2e; --park-line:#345343; --water:#22485c; --water-line:#356b84;
  --amenity:#232c39; --amenity-line:#323e4d; --on-parcel:#a9c3ad; --on-water:#9dc4d6; --on-amenity:#9aa7b6;

  --st-available:#3f9068; --st-reserved:#c39236; --st-sold:#c15c54;
  --plot-stroke:rgba(255,255,255,.20); --plot-num:#f4f7fb; --plot-num-sh:rgba(0,0,0,.6);
  --sel-sh:#000000;

  --shadow-sm:0 1px 2px rgba(0,0,0,.4);
  --shadow-md:0 6px 18px rgba(0,0,0,.45);
  --shadow-lg:0 16px 40px rgba(0,0,0,.55);
}

/* ---------- Header ---------- */
.lm-head{ position:absolute; top:0; left:0; right:0; z-index:6;
  display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;
  padding:calc(env(safe-area-inset-top,0px) + 10px) 16px 10px;
  background:color-mix(in srgb, var(--surface) 88%, transparent);
  border-bottom:1px solid var(--border);
  backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px); }
.lm-brand{ display:flex; align-items:center; gap:11px; min-width:0; }
.lm-mark{ width:34px; height:34px; flex:none; border-radius:9px; display:grid; place-items:center;
  background:var(--accent); color:#fff; font-weight:800; font-size:13px; letter-spacing:.02em;
  box-shadow:var(--shadow-sm); }
.lm-brand-name{ font-weight:700; font-size:16px; line-height:1.15; letter-spacing:-.01em; color:var(--text); }
.lm-brand-sub{ font-size:11px; color:var(--text-muted); margin-top:2px; letter-spacing:.01em;
  white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

.lm-head-tools{ display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.lm-search{ position:relative; display:flex; align-items:center; }
.lm-search svg{ position:absolute; left:11px; color:var(--text-faint); pointer-events:none; }
.lm-search input{ width:180px; box-sizing:border-box; background:var(--surface-2);
  border:1px solid var(--border); border-radius:8px; padding:9px 12px 9px 34px;
  color:var(--text); font-size:13px; outline:none; transition:border-color .15s, box-shadow .15s, background .15s; }
.lm-search input:focus{ border-color:var(--accent); background:var(--surface); box-shadow:0 0 0 3px var(--accent-weak); }
.lm-search input::placeholder{ color:var(--text-faint); }

.lm-legend{ display:flex; align-items:center; gap:6px; padding:4px; border:1px solid var(--border);
  border-radius:10px; background:var(--surface-2); }
.lm-leg{ display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:500;
  color:var(--text-muted); padding:4px 8px; border-radius:7px; white-space:nowrap; }
.lm-leg b{ color:var(--text); font-weight:700; font-variant-numeric:tabular-nums; }
.lm-dot{ width:9px; height:9px; border-radius:2.5px; flex:none; }
.lm-dot.is-all{ background:var(--text-faint); }
.lm-dot.is-available{ background:var(--st-available); }
.lm-dot.is-reserved{ background:var(--st-reserved); }
.lm-dot.is-sold{ background:var(--st-sold); }

/* ---------- Stage / SVG ---------- */
.lm-stage{ position:absolute; inset:0; touch-action:none; user-select:none; cursor:grab;
  overflow:hidden; background:var(--canvas); contain:layout size; }
.lm-stage:active{ cursor:grabbing; }
.lm-svg{ display:block; width:100%; height:100%; }
.lm-camera{ transform-box:view-box; transform-origin:0 0; will-change:transform; }

/* Scene */
.lm-site{ fill:var(--site); stroke:var(--site-line); stroke-width:1.6; stroke-dasharray:2 5; }
.lm-syno text{ fill:var(--text-faint); font-size:12px; font-weight:600; letter-spacing:.02em; }
.lm-exist text{ fill:var(--text-faint); font-size:10px; font-weight:600; letter-spacing:.14em; opacity:.85; }

.lm-roads polygon, .lm-roads rect{ fill:var(--road); }
.lm-path{ fill:var(--road); opacity:.55; }
.lm-lane line{ stroke:var(--road-line); stroke-width:1.4; stroke-dasharray:12 12; opacity:.75; stroke-linecap:round; }
.lm-roadlbl text{ fill:var(--text-muted); font-size:11px; font-weight:600; letter-spacing:.14em; text-anchor:middle; }
.lm-roadlbl-lg{ font-size:12.5px !important; letter-spacing:.2em !important; fill:var(--text) !important; opacity:.75; }
.lm-roadlbl-sm{ font-size:9px !important; letter-spacing:.1em !important; }

.lm-park{ fill:var(--park); stroke:var(--park-line); stroke-width:1.4; }
.lm-water{ fill:var(--water); stroke:var(--water-line); stroke-width:1.4; }
.lm-amenity{ fill:var(--amenity); stroke:var(--amenity-line); stroke-width:1.4; }
.lm-parcel-lbl{ fill:var(--on-parcel); font-size:15px; font-weight:800; letter-spacing:.16em; text-anchor:middle; }
.lm-water-lbl{ fill:var(--on-water); font-size:9px; font-weight:700; letter-spacing:.12em; text-anchor:middle; opacity:.9; }
.lm-amenity-lbl{ fill:var(--on-amenity); font-size:12px; font-weight:800; letter-spacing:.08em; text-anchor:middle; }
.lm-amenity-lbl-lg{ fill:var(--on-amenity); font-size:22px; font-weight:800; text-anchor:middle; }
.lm-amenity-lbl-sm{ fill:var(--on-amenity); font-size:8px; font-weight:700; letter-spacing:.14em; text-anchor:middle; opacity:.8; }

.lm-plot{ cursor:pointer; transition:opacity .2s ease; }
.lm-plot.is-dim{ opacity:.22; }
.lm-plot-shape{ stroke:var(--plot-stroke); stroke-width:1; transition:fill .2s, stroke .15s; }
.lm-plot-shape.is-available{ fill:var(--st-available); }
.lm-plot-shape.is-reserved{ fill:var(--st-reserved); }
.lm-plot-shape.is-sold{ fill:var(--st-sold); }
.lm-plot:hover .lm-plot-shape{ stroke:var(--accent); stroke-width:1.8; }
.lm-plot-shape.is-sel{ stroke:var(--accent); stroke-width:2.6; }
.lm-plot:focus{ outline:none; }
.lm-plot:focus-visible .lm-plot-shape{ stroke:var(--accent); stroke-width:2.6; }
.lm-plot-num{ fill:var(--plot-num); font-size:14px; font-weight:700; text-anchor:middle; pointer-events:none;
  paint-order:stroke; stroke:var(--plot-num-sh); stroke-width:2.4px; stroke-linejoin:round; }

.lm-compass-bg{ fill:var(--surface); stroke:var(--border-2); stroke-width:1.4; filter:drop-shadow(0 2px 4px rgba(0,0,0,.15)); }
.lm-compass-n{ fill:var(--st-sold); }
.lm-compass-s{ fill:var(--text-muted); }
.lm-compass-lbl{ fill:var(--text); font-size:11px; font-weight:800; }

/* ---------- Bottom toolbar ---------- */
.lm-toolbar{ position:absolute; left:50%; transform:translateX(-50%);
  bottom:calc(env(safe-area-inset-bottom,0px) + 18px); z-index:16;
  display:flex; gap:6px; padding:6px; border-radius:14px;
  background:var(--surface); border:1px solid var(--border); box-shadow:var(--shadow-md); }
.lm-filterwrap{ position:relative; }
.lm-tbtn{ display:inline-flex; align-items:center; gap:8px; text-decoration:none;
  height:40px; padding:0 15px; border-radius:9px; cursor:pointer;
  border:1px solid transparent; background:transparent; color:var(--text);
  font-size:13px; font-weight:600; transition:background .15s, border-color .15s; white-space:nowrap; }
.lm-tbtn svg{ color:var(--text-muted); }
.lm-tbtn:hover{ background:var(--surface-2); }
.lm-tbtn:active{ transform:translateY(.5px); }
.lm-filterbtn.is-available{ border-color:var(--st-available); background:var(--st-available-weak); }
.lm-filterbtn.is-reserved{ border-color:var(--st-reserved); background:var(--st-reserved-weak); }
.lm-filterbtn.is-sold{ border-color:var(--st-sold); background:var(--st-sold-weak); }

.lm-backdrop{ position:fixed; inset:0; z-index:15; }
.lm-filtermenu{ position:absolute; left:50%;
  bottom:calc(env(safe-area-inset-bottom,0px) + 76px); z-index:17;
  background:var(--surface); border:1px solid var(--border); border-radius:12px; padding:6px;
  box-shadow:var(--shadow-lg); display:flex; flex-direction:column; gap:2px; min-width:220px;
  transform:translateX(-50%); animation:fmenu .16s ease; }
@keyframes fmenu{ from{ opacity:0; transform:translate(-50%,8px);} to{ opacity:1; transform:translate(-50%,0);} }
.lm-filtermenu-head{ display:flex; align-items:center; justify-content:space-between;
  padding:6px 6px 8px 10px; font-size:11px; font-weight:700; text-transform:uppercase;
  letter-spacing:.08em; color:var(--text-muted); border-bottom:1px solid var(--border); margin-bottom:4px; }
.lm-filteritem{ display:flex; align-items:center; gap:10px; background:transparent; border:none;
  color:var(--text); font-size:13px; font-weight:500; padding:10px 12px; border-radius:8px;
  cursor:pointer; text-align:left; transition:background .12s; white-space:nowrap; }
.lm-filteritem b{ margin-left:auto; color:var(--text-muted); font-weight:700; font-variant-numeric:tabular-nums; }
.lm-filteritem:hover{ background:var(--surface-2); }
.lm-filteritem.active{ background:var(--accent-weak); color:var(--accent); }
.lm-filteritem.active b{ color:var(--accent); }

.lm-iconbtn{ width:30px; height:30px; border-radius:7px; border:1px solid var(--border);
  background:transparent; color:var(--text-muted); display:flex; align-items:center; justify-content:center;
  cursor:pointer; transition:background .12s, color .12s; }
.lm-iconbtn:hover{ background:var(--surface-2); color:var(--text); }

/* ---------- Map controls ---------- */
.lm-ctrl{ position:absolute; right:calc(env(safe-area-inset-right,0px) + 14px);
  bottom:calc(env(safe-area-inset-bottom,0px) + 82px); z-index:8;
  display:flex; flex-direction:column; border-radius:11px; overflow:hidden;
  border:1px solid var(--border); background:var(--surface); box-shadow:var(--shadow-md); }
.lm-ctrl button{ width:42px; height:42px; border:none; background:transparent; color:var(--text-muted);
  display:flex; align-items:center; justify-content:center; cursor:pointer;
  border-bottom:1px solid var(--border); transition:background .12s, color .12s; }
.lm-ctrl button:last-child{ border-bottom:none; }
.lm-ctrl button:hover{ background:var(--surface-2); color:var(--text); }
.lm-ctrl button.is-on{ background:var(--accent); color:#fff; }

/* ---------- Build credit ---------- */
.lm-tiq-wrap{ position:absolute; right:calc(env(safe-area-inset-right,0px) + 14px);
  bottom:calc(env(safe-area-inset-bottom,0px) + 18px); z-index:12;
  display:flex; flex-direction:column-reverse; align-items:flex-end; gap:8px; }
.lm-tiq-logo{ cursor:pointer; background:var(--surface); border:1px solid var(--border); border-radius:8px;
  padding:6px 11px; font-size:11px; font-weight:700; color:var(--text-muted); letter-spacing:.02em;
  box-shadow:var(--shadow-sm); transition:color .12s; }
.lm-tiq-logo:hover{ color:var(--text); }
.lm-tiq-pop{ text-decoration:none; background:var(--text); color:var(--surface); border-radius:9px;
  padding:9px 13px; box-shadow:var(--shadow-md); white-space:nowrap; animation:tiqpop .18s ease; }
.lm-tiq-pop-title{ font-size:12px; font-weight:700; }
.lm-tiq-pop-sub{ font-size:11px; opacity:.7; margin-top:1px; }
@keyframes tiqpop{ from{ opacity:0; transform:translateY(6px);} to{ opacity:1; transform:translateY(0);} }

/* ---------- Hint ---------- */
.lm-hint{ position:absolute; bottom:calc(env(safe-area-inset-bottom,0px) + 74px); left:50%; transform:translateX(-50%);
  z-index:7; background:var(--surface); border:1px solid var(--border); color:var(--text-muted); font-size:12px;
  padding:8px 16px; border-radius:999px; box-shadow:var(--shadow-sm); white-space:nowrap; pointer-events:none;
  animation:fade 7s ease forwards; }
@keyframes fade{ 0%,72%{opacity:1;} 100%{opacity:0;} }

/* ---------- Splash ---------- */
.lm-splash{ position:absolute; inset:0; z-index:100; display:flex; align-items:center; justify-content:center;
  cursor:pointer; background:var(--bg); animation:splashOut .35s ease forwards; animation-delay:1.1s; }
.lm-splash-inner{ display:flex; flex-direction:column; align-items:center; text-align:center;
  animation:splashIn .5s cubic-bezier(.22,1,.36,1); }
.lm-splash-mark{ width:52px; height:52px; border-radius:13px; display:grid; place-items:center;
  background:var(--accent); color:#fff; font-weight:800; font-size:19px; box-shadow:var(--shadow-md); margin-bottom:16px; }
.lm-splash-name{ font-weight:700; font-size:22px; letter-spacing:-.01em; color:var(--text); }
.lm-splash-sub{ margin-top:6px; font-size:12px; color:var(--text-muted); letter-spacing:.02em; }
.lm-splash-bar{ margin-top:22px; width:160px; height:3px; border-radius:99px; background:var(--border); overflow:hidden; }
.lm-splash-bar span{ display:block; height:100%; width:0; border-radius:99px; background:var(--accent);
  animation:barFill 1.1s ease forwards; }
@keyframes barFill{ from{width:0} to{width:100%} }
.lm-splash-loading{ margin-top:12px; font-size:11px; letter-spacing:.1em; color:var(--text-faint); text-transform:uppercase; }
@keyframes splashIn{ from{opacity:0; transform:translateY(10px)} to{opacity:1; transform:none} }
@keyframes splashOut{ to{opacity:0; visibility:hidden} }

/* ---------- Photos ---------- */
.lm-photos-overlay{ position:absolute; inset:0; z-index:30; display:flex; align-items:center; justify-content:center;
  background:rgba(12,16,23,.5); backdrop-filter:blur(4px); animation:fadein .18s ease; }
.lm-photos-modal{ width:min(88vw,460px); background:var(--surface);
  border:1px solid var(--border); border-radius:16px; padding:16px 18px 20px; box-shadow:var(--shadow-lg); }
.lm-photos-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;
  font-size:15px; font-weight:700; color:var(--text); }
.lm-photos-empty{ display:flex; flex-direction:column; align-items:center; gap:12px; padding:34px 0;
  color:var(--text-muted); font-size:13px; }
.lm-photos-empty svg{ color:var(--text-faint); }
@keyframes fadein{ from{opacity:0} to{opacity:1} }
.lm-photos-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; max-height:60vh; overflow-y:auto; padding:2px; }
.lm-photo-cell{ position:relative; aspect-ratio:1; border:1px solid var(--border); border-radius:10px; overflow:hidden;
  cursor:pointer; background:var(--surface-2); padding:0; }
.lm-photo-cell img, .lm-photo-cell video{ width:100%; height:100%; object-fit:cover; display:block; }
.lm-photo-cell:active{ transform:scale(.98); }
.lm-photo-play{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.28); }

.lm-lightbox{ position:absolute; inset:0; z-index:120; display:flex; align-items:center; justify-content:center;
  background:rgba(6,9,14,.94); backdrop-filter:blur(4px); animation:fadein .18s ease; }
.lm-lightbox-inner{ max-width:92vw; max-height:82vh; display:flex; flex-direction:column; align-items:center; gap:12px; }
.lm-lightbox-media{ max-width:92vw; max-height:76vh; border-radius:10px; object-fit:contain; box-shadow:var(--shadow-lg); }
.lm-lightbox-cap{ color:#f3f6ee; font-size:14px; text-align:center; max-width:80vw; }
.lm-lightbox-close{ position:absolute; top:calc(env(safe-area-inset-top,0px) + 16px); right:16px; z-index:2;
  width:40px; height:40px; border-radius:10px; border:1px solid rgba(255,255,255,.18); background:rgba(20,24,30,.7);
  color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.lm-lightbox-nav{ position:absolute; top:50%; transform:translateY(-50%); width:44px; height:44px; border-radius:50%;
  border:1px solid rgba(255,255,255,.18); background:rgba(20,24,30,.7); color:#fff;
  display:flex; align-items:center; justify-content:center; cursor:pointer; }
.lm-lightbox-nav.lm-prev{ left:12px; } .lm-lightbox-nav.lm-next{ right:12px; }

/* ---------- Detail panel ---------- */
.lm-panel{ position:absolute; left:0; right:0; bottom:0; z-index:20;
  background:var(--surface); border-top:1px solid var(--border); border-radius:18px 18px 0 0;
  padding:8px 20px calc(env(safe-area-inset-bottom,0px) + 20px);
  transform:translateY(120%); transition:transform .34s cubic-bezier(.22,1,.36,1);
  box-shadow:var(--shadow-lg); }
.lm-panel.open{ transform:translateY(0); }
.lm-panel::before{ content:""; display:block; width:40px; height:4px; border-radius:99px;
  background:var(--border-2); margin:2px auto 14px; }
.lm-panel-head{ display:flex; align-items:center; gap:12px; margin-bottom:16px; }
.lm-panel-heading{ min-width:0; }
.lm-panel-kicker{ font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--text-muted); font-weight:700; }
.lm-panel-title{ font-size:24px; font-weight:700; line-height:1.1; margin-top:2px; letter-spacing:-.01em; color:var(--text); }
.lm-panel-close{ margin-left:auto; width:36px; height:36px; }

.lm-status-badge{ display:inline-flex; align-items:center; gap:7px; font-size:12.5px; font-weight:700;
  padding:6px 12px; border-radius:8px; border:1px solid transparent; }
.lm-status-badge .lm-dot{ width:8px; height:8px; }
.lm-status-available{ background:var(--st-available-weak); color:var(--st-available); border-color:color-mix(in srgb,var(--st-available) 40%, transparent); }
.lm-status-reserved{ background:var(--st-reserved-weak); color:var(--st-reserved); border-color:color-mix(in srgb,var(--st-reserved) 45%, transparent); }
.lm-status-sold{ background:var(--st-sold-weak); color:var(--st-sold); border-color:color-mix(in srgb,var(--st-sold) 42%, transparent); }

.lm-diagram{ display:flex; justify-content:center; margin:4px 0 18px; }
.lm-dimbox{ position:relative; width:196px; height:112px; margin:20px 30px; }
.lm-dimbox-inner{ position:absolute; inset:0; border:1.5px solid var(--border-2); border-radius:8px;
  background:var(--surface-2); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }
.lm-dim-facing{ color:var(--accent); font-weight:800; font-size:15px; }
.lm-dim-facelbl{ color:var(--text-muted); font-size:8px; letter-spacing:.16em; text-transform:uppercase; }
.lm-dim{ position:absolute; color:var(--text); font-size:11px; font-weight:600; white-space:nowrap; font-variant-numeric:tabular-nums; }
.lm-dim-top{ top:-17px; left:50%; transform:translateX(-50%); }
.lm-dim-bottom{ bottom:-17px; left:50%; transform:translateX(-50%); }
.lm-dim-left{ left:-8px; top:50%; transform:translate(-100%,-50%); }
.lm-dim-right{ right:-8px; top:50%; transform:translate(100%,-50%); }

.lm-rows{ display:flex; flex-direction:column; margin-bottom:18px; border:1px solid var(--border); border-radius:12px; overflow:hidden; }
.lm-row{ display:flex; justify-content:space-between; align-items:center; gap:12px; padding:12px 14px;
  border-bottom:1px solid var(--border); background:var(--surface); }
.lm-row:nth-child(even){ background:var(--surface-2); }
.lm-row:last-child{ border-bottom:none; }
.lm-row-l{ font-size:12.5px; color:var(--text-muted); }
.lm-row-v{ font-size:13.5px; font-weight:600; text-align:right; color:var(--text); font-variant-numeric:tabular-nums; }

.lm-cta-row{ display:flex; gap:10px; }
.lm-cta{ display:flex; align-items:center; justify-content:center; gap:8px; text-decoration:none;
  padding:13px; border:none; border-radius:10px; cursor:pointer; color:#fff; font-weight:700; font-size:14px;
  transition:filter .15s, transform .1s; box-shadow:var(--shadow-sm); }
.lm-cta-wa{ flex:1; background:#1faa4f; }
.lm-cta-call{ width:52px; background:var(--accent); }
.lm-cta:hover{ filter:brightness(1.05); }
.lm-cta:active{ transform:translateY(1px); }

@media (min-width:720px){
  .lm-panel{ max-width:400px; left:auto; right:18px; bottom:18px; border-radius:14px; }
}
@media (max-width:520px){
  .lm-legend{ order:3; width:100%; justify-content:space-between; }
  .lm-search input{ width:100%; }
  .lm-search{ flex:1; }
  .lm-head-tools{ flex:1; }
}
@media (prefers-reduced-motion:reduce){
  .lm-panel, .lm-plot, .lm-plot-shape{ transition:none; }
  .lm-hint, .lm-splash{ animation:none; }
}
`;
