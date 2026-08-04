"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

/**
 * Basava Ganguru — Interactive Master Layout (AR3D style)
 * Geometry built from the OWNER-SUPPLIED dimensions. Odd/corner plots are true
 * quadrilaterals. Plot sizes are proportional to real metres (one global scale),
 * so bigger plots genuinely look bigger. Tap a plot for exact dimensions.
 */

type Plot = {
    id: string; pts: string; dim: string; facing: string; sqm: number; sqft: number;
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

// Odd irregular property boundary (traced to the sanctioned red line).
const BOUNDARY = "118,232 1108,268 1150,700 900,1090 118,1150 118,232";

// Amenities
const CA = "140,262 250,262 250,470 140,470";
const STP = "434,690 502,690 502,760 434,760";
const KARAB = "118,690 434,690 502,760 502,948 118,948";
const KARAB_LAKE = { cx: 290, cy: 830, rx: 140, ry: 70 };

// Roads (all 9m carriageways drawn at the SAME 58px width; 12m top wider).
// Roads. Top = 12m (WIDER). The three internal carriageways are all 9m (SAME width).
// 3m pathway is narrower. Left 9m road runs full height (plot 11 → 17) with no overlap.
const R9 = 58;   // 9m road width (all three identical)
const R12 = 78;  // 12m road width (wider, since it's a bigger road)
const R3 = 30;   // 3m pathway width
const ROADS = {
    top: `118,${262 - R12} 1108,${262 - R12 + 32} 1108,262 118,262`, // 12m approved layout road across the top
    leftV: { x: 502, y: 262, w: R9, h: 686 },   // 9m road: right of 7-10 & left of 11-17, full height 262→948
    rightV: { x: 786, y: 262, w: 72, h: 686 },   // 9m road: right of 11-18 & left of 26-32 (72 spans block gap)
    midH: { x: 118, y: 470, w: 442, h: R9 },   // 9m road: below 1-6 block, above 7-10
    path: { x: 118, y: 648, w: 384, h: R3 },   // 3m pathway: below 7-10, above KARAB (stops at road x=502)
};

type ViewBox = { x: number; y: number; w: number; h: number };
type Point = { x: number; y: number };

const BASE_VB: ViewBox = { x: 60, y: 190, w: 1130, h: 1010 };
const ASPECT = BASE_VB.h / BASE_VB.w;
const MIN_W = BASE_VB.w / 8;
const MAX_W = BASE_VB.w * 1.7;
const pivotX = BASE_VB.x + BASE_VB.w / 2;
const pivotY = BASE_VB.y + BASE_VB.h / 2;

function rotateDelta(dx: number, dy: number, deg: number): [number, number] {
    const r = (-deg * Math.PI) / 180;
    const cos = Math.cos(r), sin = Math.sin(r);
    return [dx * cos - dy * sin, dx * sin + dy * cos];
}

const centroid = (pts: string): Point => {
    const n = pts.split(/[ ,]+/).map(Number);
    let x = 0, y = 0, c = 0;
    for (let i = 0; i < n.length; i += 2) { x += n[i]; y += n[i + 1]; c++; }
    return { x: x / c, y: y / c };
};

/* Lush top-down tree with cast shadow and layered canopy */
function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
    return (
        <g transform={`translate(${x},${y}) scale(${s})`} pointerEvents="none">
            <ellipse cx="4" cy="5" rx="9" ry="3.5" fill="#000" opacity="0.28" />
            <g filter="url(#treeSh)">
                <circle cx="-4" cy="0" r="6" fill="#2c4a1c" />
                <circle cx="4" cy="0" r="6" fill="#2c4a1c" />
                <circle cx="0" cy="-4" r="7" fill="#3f6a26" />
                <circle cx="-3" cy="-2" r="5" fill="#4f8330" />
                <circle cx="3" cy="-3" r="4.5" fill="#5f9a3a" />
                <circle cx="-1" cy="-5" r="3.5" fill="#78b84c" />
                <circle cx="2" cy="-1" r="2.6" fill="#8ac85a" opacity="0.85" />
            </g>
        </g>
    );
}

function StreetLight({ x, y }: { x: number; y: number }) {
    return (
        <g transform={`translate(${x},${y})`} pointerEvents="none">
            <circle r="15" fill="url(#lightPool)" />
            <circle r="6" fill="#ffdd93" opacity="0.3" />
            <circle r="2" fill="#fff6da" />
        </g>
    );
}

export default function LayoutMap() {
    const [selected, setSelected] = useState<string | null>(null);
    const [tiqOpen, setTiqOpen] = useState(false);
    const [view, setView] = useState<ViewBox>({ ...BASE_VB });
    const [rot, setRot] = useState(0);

    const wrapRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const rotGRef = useRef<SVGGElement | null>(null);
    const compassRef = useRef<SVGGElement | null>(null);

    const target = useRef<{ view: ViewBox; rot: number }>({ view: { ...BASE_VB }, rot: 0 });
    const cur = useRef<{ view: ViewBox; rot: number }>({ view: { ...BASE_VB }, rot: 0 });
    const raf = useRef<number | null>(null);
    const animating = useRef(false);
    const drag = useRef<{ px: number; py: number; vx: number; vy: number } | null>(null);
    const gesture = useRef<{ d: number; ang: number } | null>(null);

    const sel = PLOTS.find((p) => p.id === selected) || null;

    const paint = (v: ViewBox, r: number) => {
        if (svgRef.current) svgRef.current.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`);
        if (rotGRef.current) rotGRef.current.setAttribute("transform", `rotate(${r} ${pivotX} ${pivotY})`);
        if (compassRef.current) compassRef.current.setAttribute("transform", `translate(1120,250) rotate(${-r})`);
    };

    const tick = useCallback(() => {
        const c = cur.current, t = target.current, eV = c.view, tV = t.view, k = 0.2;
        eV.x += (tV.x - eV.x) * k; eV.y += (tV.y - eV.y) * k;
        eV.w += (tV.w - eV.w) * k; eV.h += (tV.h - eV.h) * k;
        let dr = t.rot - c.rot; while (dr > 180) dr -= 360; while (dr < -180) dr += 360;
        c.rot += dr * k;
        const done = Math.abs(tV.x - eV.x) < 0.08 && Math.abs(tV.y - eV.y) < 0.08 &&
            Math.abs(tV.w - eV.w) < 0.08 && Math.abs(tV.h - eV.h) < 0.08 && Math.abs(dr) < 0.08;
        if (done) {
            c.view = { ...tV }; c.rot = t.rot; paint(tV, t.rot);
            setView({ ...tV }); setRot(t.rot); animating.current = false; raf.current = null; return;
        }
        paint(eV, c.rot); raf.current = requestAnimationFrame(tick);
    }, []);

    const startAnim = useCallback(() => {
        if (!animating.current) { animating.current = true; raf.current = requestAnimationFrame(tick); }
    }, [tick]);

    const setNow = useCallback((v: ViewBox, r?: number) => {
        if (raf.current) { cancelAnimationFrame(raf.current); raf.current = null; }
        animating.current = false;
        cur.current.view = { ...v }; if (r !== undefined) cur.current.rot = r;
        target.current.view = { ...v }; if (r !== undefined) target.current.rot = r;
        paint(v, r !== undefined ? r : cur.current.rot);
    }, []);

    const commit = useCallback(() => { setView({ ...cur.current.view }); setRot(cur.current.rot); }, []);

    const toUser = (clientX: number, clientY: number, v: ViewBox): Point => {
        const el = wrapRef.current;
        if (!el) return { x: v.x + v.w / 2, y: v.y + v.h / 2 };
        const rect = el.getBoundingClientRect();
        const scale = Math.min(rect.width / v.w, rect.height / v.h);
        const offX = (rect.width - v.w * scale) / 2, offY = (rect.height - v.h * scale) / 2;
        return { x: v.x + (clientX - rect.left - offX) / scale, y: v.y + (clientY - rect.top - offY) / scale };
    };
    const clampW = (w: number) => Math.min(MAX_W, Math.max(MIN_W, w));
    const zoomedView = (base: ViewBox, factor: number, cx: number, cy: number): ViewBox => {
        const nw = clampW(base.w / factor), nh = nw * ASPECT, f = toUser(cx, cy, base);
        const rx = (f.x - base.x) / base.w, ry = (f.y - base.y) / base.h;
        return { x: f.x - rx * nw, y: f.y - ry * nh, w: nw, h: nh };
    };
    const smoothZoom = (factor: number, cx: number, cy: number) => {
        target.current.view = zoomedView(target.current.view, factor, cx, cy); startAnim();
    };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); smoothZoom(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX, e.clientY); };

    const dist = (a: React.Touch, b: React.Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const angle = (a: React.Touch, b: React.Touch) => Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI;

    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) { gesture.current = { d: dist(e.touches[0], e.touches[1]), ang: angle(e.touches[0], e.touches[1]) }; drag.current = null; }
        else if (e.touches.length === 1) drag.current = { px: e.touches[0].clientX, py: e.touches[0].clientY, vx: cur.current.view.x, vy: cur.current.view.y };
    };
    const onTouchMove = (e: React.TouchEvent) => {
        const el = wrapRef.current;
        if (e.touches.length === 2 && gesture.current && el) {
            e.preventDefault();
            const g = gesture.current, nd = dist(e.touches[0], e.touches[1]), na = angle(e.touches[0], e.touches[1]);
            const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2, cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            setNow(zoomedView(cur.current.view, nd / g.d, cx, cy), cur.current.rot + (na - g.ang));
            g.d = nd; g.ang = na;
        } else if (e.touches.length === 1 && drag.current && el) {
            e.preventDefault();
            const d = drag.current, rect = el.getBoundingClientRect();
            const scale = Math.min(rect.width / cur.current.view.w, rect.height / cur.current.view.h);
            let dx = (e.touches[0].clientX - d.px) / scale, dy = (e.touches[0].clientY - d.py) / scale;
            [dx, dy] = rotateDelta(dx, dy, cur.current.rot);
            setNow({ ...cur.current.view, x: d.vx - dx, y: d.vy - dy });
        }
    };
    const onTouchEnd = (e: React.TouchEvent) => { if (e.touches.length === 0) { drag.current = null; gesture.current = null; commit(); } };
    const onMouseDown = (e: React.MouseEvent) => { drag.current = { px: e.clientX, py: e.clientY, vx: cur.current.view.x, vy: cur.current.view.y }; };
    const onMouseMove = (e: React.MouseEvent) => {
        const el = wrapRef.current, d = drag.current; if (!d || !el) return;
        const rect = el.getBoundingClientRect();
        const scale = Math.min(rect.width / cur.current.view.w, rect.height / cur.current.view.h);
        let dx = (e.clientX - d.px) / scale, dy = (e.clientY - d.py) / scale;
        [dx, dy] = rotateDelta(dx, dy, cur.current.rot);
        setNow({ ...cur.current.view, x: d.vx - dx, y: d.vy - dy });
    };
    const onMouseUp = () => { if (drag.current) { drag.current = null; commit(); } };

    const reset = () => { target.current = { view: { ...BASE_VB }, rot: 0 }; startAnim(); };
    const btnZoom = (f: number) => { const el = wrapRef.current; if (el) { const r = el.getBoundingClientRect(); smoothZoom(f, r.left + r.width / 2, r.top + r.height / 2); } };
    const rotate = () => { target.current.rot = Math.round((target.current.rot + 90) / 90) * 90; startAnim(); };

    useEffect(() => {
        const el = wrapRef.current; if (!el) return;
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => { el.removeEventListener("wheel", onWheel); if (raf.current) cancelAnimationFrame(raf.current); };
    }, []);

    // Trees: scattered across the OPEN terrain only — never on roads or the built-up core.
    const trees: [number, number, number][] = [];
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 260; i++) {
        const x = 90 + rnd() * 1090;
        const y = 210 + rnd() * 980;
        // skip the whole built-up band (plots, roads, amenities) so trees only sit in open land
        const inCore = x > 118 && x < 1000 && y > 184 && y < 960;
        if (inCore) continue;
        trees.push([x, y, 0.7 + rnd() * 0.7]);
    }

    return (
        <div className="lm-root">
            <style>{css}</style>

            <header className="lm-head">
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
                        <div className="lm-brand-sub">Vijayalaxmi C Patil · Shivamogga</div>
                    </div>
                </div>
                <div className="lm-search">
                    <input
                        placeholder="Search plot number"
                        value={selected ?? ""}
                        onChange={(e) => { const v = e.target.value.trim(); setSelected(PLOTS.some((p) => p.id === v) ? v : null); }}
                    />
                </div>
            </header>

            <div className="lm-stage" ref={wrapRef}
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
                <svg ref={svgRef} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} preserveAspectRatio="xMidYMid meet" className="lm-svg">
                    <defs>
                        {/* Terrain — layered earth with warm sun */}
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
                        {/* faint dry-grass patches */}
                        <radialGradient id="patch" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0" stopColor="#8a9a4a" stopOpacity="0.35" /><stop offset="1" stopColor="#8a9a4a" stopOpacity="0" />
                        </radialGradient>

                        {/* Plots — dark green, subtle turf sheen */}
                        <linearGradient id="plotFill" x1="0" y1="0" x2="0.35" y2="1">
                            <stop offset="0" stopColor="#568636" /><stop offset="0.5" stopColor="#457029" /><stop offset="1" stopColor="#365b21" />
                        </linearGradient>
                        <linearGradient id="plotSel" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#8fd257" /><stop offset="1" stopColor="#5fa538" />
                        </linearGradient>
                        <pattern id="turf" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                            <rect width="8" height="8" fill="transparent" />
                            <line x1="2" y1="7" x2="2.6" y2="3" stroke="#6aa347" strokeWidth="0.5" opacity="0.3" />
                            <line x1="5" y1="8" x2="5.5" y2="4" stroke="#3c6424" strokeWidth="0.5" opacity="0.3" />
                        </pattern>

                        {/* Asphalt roads — textured with sheen */}
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

                        {/* Water */}
                        <radialGradient id="lake" cx="0.38" cy="0.28" r="0.95">
                            <stop offset="0" stopColor="#bdeee6" /><stop offset="0.5" stopColor="#63b5ac" /><stop offset="1" stopColor="#2f7d78" />
                        </radialGradient>
                        {/* Light-green amenity turf */}
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

                        {/* Shadows & lighting */}
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
                        {/* warm sun wash + vignette over the whole plan */}
                        <radialGradient id="sun" cx="0.28" cy="0.16" r="0.9">
                            <stop offset="0" stopColor="#ffe4a0" stopOpacity="0.22" /><stop offset="0.5" stopColor="#ffd48a" stopOpacity="0.05" /><stop offset="1" stopColor="#000" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="vignette" cx="0.5" cy="0.46" r="0.85">
                            <stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.34" />
                        </radialGradient>
                    </defs>

                    {/* terrain base + texture */}
                    <rect x={BASE_VB.x} y={BASE_VB.y} width={BASE_VB.w} height={BASE_VB.h} fill="url(#terrain)" />
                    <rect x={BASE_VB.x} y={BASE_VB.y} width={BASE_VB.w} height={BASE_VB.h} fill="url(#terrainTex)" />
                    {/* scattered dry-grass patches for realism */}
                    <g pointerEvents="none">
                        <ellipse cx="220" cy="380" rx="130" ry="80" fill="url(#patch)" />
                        <ellipse cx="1000" cy="450" rx="150" ry="90" fill="url(#patch)" />
                        <ellipse cx="320" cy="1080" rx="160" ry="90" fill="url(#patch)" />
                        <ellipse cx="1050" cy="950" rx="140" ry="80" fill="url(#patch)" />
                        <ellipse cx="700" cy="1120" rx="180" ry="70" fill="url(#patch)" />
                    </g>


                    <g ref={rotGRef} transform={`rotate(${rot} ${pivotX} ${pivotY})`}>
                        {/* (parcel base removed — terrain shows through, no boundary shape) */}

                        {/* roads — recessed asphalt with texture */}
                        <g filter="url(#plotSh)">
                            <polygon points={ROADS.top} fill="url(#asphalt)" />
                            <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} fill="url(#asphaltV)" />
                            <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} fill="url(#asphaltV)" />
                            <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} fill="url(#asphalt)" />
                        </g>
                        {/* asphalt grain */}
                        <g opacity="0.9" pointerEvents="none">
                            <polygon points={ROADS.top} fill="url(#asphaltTex)" />
                            <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} fill="url(#asphaltTex)" />
                            <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} fill="url(#asphaltTex)" />
                            <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} fill="url(#asphaltTex)" />
                        </g>
                        {/* light concrete kerbs */}
                        <g className="lm-kerb" pointerEvents="none">
                            <polygon points={ROADS.top} />
                            <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} />
                            <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} />
                            <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} />
                        </g>
                        {/* interlocking-paver pathway */}
                        <rect x={ROADS.path.x} y={ROADS.path.y} width={ROADS.path.w} height={ROADS.path.h} fill="#7d7454" opacity="0.95" />
                        <g className="lm-paver" pointerEvents="none">
                            {Array.from({ length: Math.floor((ROADS.path.w - 14) / 30) }).map((_, i) => (
                                <line key={i} x1={ROADS.path.x + 14 + i * 30} y1={ROADS.path.y} x2={ROADS.path.x + 14 + i * 30} y2={ROADS.path.y + ROADS.path.h} />
                            ))}
                        </g>
                        {/* lane markings — bright centre dashes */}
                        <g className="lm-lane" pointerEvents="none">
                            <line x1="531" y1="270" x2="531" y2="944" />
                            <line x1="822" y1="270" x2="822" y2="944" />
                            <line x1="122" y1="499" x2="500" y2="499" />
                            <line x1="118" y1="223" x2="1108" y2="255" />
                        </g>
                        {/* manhole covers */}
                        <g className="lm-drain" pointerEvents="none">
                            <circle cx="531" cy="360" r="3.4" /><circle cx="531" cy="640" r="3.4" /><circle cx="531" cy="880" r="3.4" />
                            <circle cx="822" cy="420" r="3.4" /><circle cx="822" cy="700" r="3.4" /><circle cx="822" cy="900" r="3.4" />
                        </g>
                        {/* ROAD NAME LABELS */}
                        <g pointerEvents="none">
                            <text x="600" y="216" className="lm-road-lbl lm-road-lbl-lg">APPROVED LAYOUT 12m ROAD</text>
                            <text x="531" y="620" className="lm-road-lbl" transform="rotate(-90 531 620)">9m ROAD</text>
                            <text x="822" y="620" className="lm-road-lbl" transform="rotate(-90 822 620)">9m ROAD</text>
                            <text x="300" y="504" className="lm-road-lbl">9m ROAD</text>
                            <text x="300" y="666" className="lm-road-lbl lm-road-lbl-sm">3m PATHWAY</text>
                        </g>

                        {/* KARAB (open space) — turf + stone edge + landscaped lake */}
                        <polygon points={KARAB} fill="url(#grass)" filter="url(#plotSh)" />
                        <polygon points={KARAB} fill="url(#turf)" opacity="0.5" pointerEvents="none" />
                        <polygon points={KARAB} className="lm-turf-edge" pointerEvents="none" />
                        {/* jogging path loop */}
                        <path d="M175,795 Q300,760 430,795 Q470,860 430,915 Q300,935 180,915 Q150,855 175,795 Z" className="lm-jog" pointerEvents="none" />
                        {/* lake with rim + highlight */}
                        <ellipse cx={KARAB_LAKE.cx} cy={KARAB_LAKE.cy} rx={KARAB_LAKE.rx} ry={KARAB_LAKE.ry} fill="url(#lake)" filter="url(#softSh)" />
                        <ellipse cx={KARAB_LAKE.cx - 40} cy={KARAB_LAKE.cy - 20} rx="52" ry="18" fill="#fff" opacity="0.22" pointerEvents="none" />
                        {Array.from({ length: 26 }).map((_, i) => {
                            const a = (i / 26) * Math.PI * 2;
                            return <circle key={i} cx={KARAB_LAKE.cx + Math.cos(a) * (KARAB_LAKE.rx + 5)} cy={KARAB_LAKE.cy + Math.sin(a) * (KARAB_LAKE.ry + 4)} r={2 + (i % 3)} fill="#9a927c" opacity="0.7" pointerEvents="none" />;
                        })}
                        {/* flower beds */}
                        {[[200, 760, "#e07aa8"], [420, 770, "#f0b429"], [180, 905, "#c85a9a"], [440, 900, "#e8a020"]].map(([x, y, col], i) => (
                            <g key={i} pointerEvents="none">
                                <circle cx={x as number} cy={y as number} r="9" fill="#3c6424" />
                                <circle cx={(x as number) - 3} cy={(y as number) - 2} r="4" fill={col as string} />
                                <circle cx={(x as number) + 3} cy={(y as number) + 1} r="3.4" fill={col as string} opacity="0.8" />
                            </g>
                        ))}
                        <text x="300" y="835" className="lm-amen-label">KARAB</text>

                        {/* CA — light-green turf with clubhouse hint */}
                        <polygon points={CA} fill="url(#ca)" filter="url(#plotSh)" />
                        <polygon points={CA} fill="url(#turf)" opacity="0.5" pointerEvents="none" />
                        <polygon points={CA} className="lm-turf-edge" pointerEvents="none" />
                        <g transform="translate(195,330)" pointerEvents="none">
                            <ellipse cx="0" cy="20" rx="30" ry="8" fill="#000" opacity="0.16" />
                            <rect x="-26" y="-6" width="52" height="24" rx="2" fill="#eef4ea" />
                            <polygon points="-30,-6 30,-6 22,-20 -22,-20" fill="#8fb87a" />
                            <rect x="-18" y="4" width="7" height="12" fill="#a9c99a" /><rect x="-4" y="4" width="7" height="12" fill="#a9c99a" /><rect x="10" y="4" width="7" height="12" fill="#a9c99a" />
                        </g>
                        <text x={centroid(CA).x} y={centroid(CA).y - 6} className="lm-ca-label">CA</text>
                        <text x={centroid(CA).x} y={centroid(CA).y + 40} className="lm-ca-sub">CIVIC AMENITY</text>

                        {/* STP — utility compound */}
                        <polygon points={STP} fill="#e4d7f4" stroke="#9670c2" strokeWidth="1.4" strokeDasharray="4 3" filter="url(#softSh)" />
                        <rect x="474" y="702" width="44" height="40" rx="2" fill="#b9aecb" />
                        <polygon points="472,702 520,702 512,690 480,690" fill="url(#stpRoof)" />
                        <circle cx="486" cy="726" r="6" fill="#9d88c4" /><circle cx="506" cy="726" r="6" fill="#9d88c4" />
                        <text x={centroid(STP).x} y={centroid(STP).y + 6} className="lm-stp-label">STP</text>

                        {/* PLOTS */}
                        {PLOTS.map((p) => {
                            const c = centroid(p.pts);
                            const isSel = p.id === selected;
                            return (
                                <g key={p.id} className="lm-plot" onClick={(e) => { e.stopPropagation(); setSelected(p.id); }}
                                    role="button" tabIndex={0}
                                    onKeyDown={(e: React.KeyboardEvent) => (e.key === "Enter" || e.key === " ") && setSelected(p.id)}>
                                    <polygon points={p.pts} className="lm-plot-shape" fill={isSel ? "url(#plotSel)" : "url(#plotFill)"} stroke="url(#gold)" strokeWidth={isSel ? 2.6 : 1.3} filter={isSel ? "url(#selGlow)" : "url(#plotSh)"} />
                                    <polygon points={p.pts} fill="url(#turf)" opacity="0.4" pointerEvents="none" />
                                    <polygon points={p.pts} className="lm-plot-bevel" pointerEvents="none" />
                                    <text x={c.x} y={c.y + 5} className="lm-plot-num">{p.id}</text>
                                </g>
                            );
                        })}

                        {/* trees (with shadows) */}
                        {trees.map(([x, y, s], i) => <Tree key={i} x={x} y={y} s={s} />)}
                        {/* street lights */}
                        {[[531, 330], [531, 560], [531, 800], [822, 400], [822, 640], [822, 880], [300, 534], [200, 496], [400, 496]].map(([x, y], i) => <StreetLight key={i} x={x} y={y} />)}

                        {/* compass */}
                        <g ref={compassRef} transform={`translate(1120,250) rotate(${-rot})`}>
                            <circle r="20" fill="rgba(20,24,16,.72)" stroke="url(#gold)" strokeWidth="1.6" />
                            <path d="M0,-13 L4.5,3 L0,-1 L-4.5,3 Z" fill="#e0504a" />
                            <path d="M0,13 L4.5,-3 L0,1 L-4.5,-3 Z" fill="#6a7256" />
                            <text y="-24" textAnchor="middle" fill="#e7cd85" fontSize="12" fontWeight="800">N</text>
                        </g>

                        {/* boundary — compound wall + red property line */}
                        {/* sun wash + vignette */}
                        {/* sun wash only (no edge darkening) */}
                        <polygon points={BOUNDARY} fill="url(#sun)" pointerEvents="none" />
                    </g>
                </svg>

                {/* Google Maps location button */}
                <a className="lm-mapbtn" href="https://goo.gl/maps/JarvnMRnW7U7fYBp6?g_st=aw" target="_blank" rel="noopener noreferrer" aria-label="Open in Google Maps">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                        <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z" fill="#ea4335" />
                        <circle cx="12" cy="9" r="2.6" fill="#fff" />
                    </svg>
                    <span className="lm-mapbtn-txt">Maps</span>
                </a>

                {/* controls */}
                <div className="lm-ctrl">
                    <button onClick={() => btnZoom(1.3)} aria-label="Zoom in"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg></button>
                    <button onClick={() => btnZoom(0.77)} aria-label="Zoom out"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg></button>
                    <button onClick={rotate} aria-label="Rotate"><svg viewBox="0 0 24 24" width="19" height="19"><path d="M4 9a8 8 0 1 1-.8 4" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" /><path d="M4 4v5h5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                    <button onClick={reset} aria-label="Reset"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" /></svg></button>
                </div>

                <div className="lm-legend">
                    <span><i className="lg-plot" />Plots</span>
                    <span><i className="lg-ca" />CA</span>
                    <span><i className="lg-park" />Karab</span>
                    <span><i className="lg-stp" />STP</span>
                </div>

                {/* Train IQ credit — tap to open popup */}
                <div className="lm-tiq-wrap">
                    {tiqOpen && (
                        <a className="lm-tiq-pop" href="https://trainiq.in" target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                            <div className="lm-tiq-pop-title">Built by Train IQ</div>
                            <div className="lm-tiq-pop-sub">trainiq.in →</div>
                        </a>
                    )}
                    <button className="lm-tiq-logo" onClick={() => setTiqOpen((v) => !v)} aria-label="Train IQ">
                        <img src="/trainiq-logo.jpeg" alt="Train IQ" className="lm-tiq-img" />
                    </button>
                </div>
            </div>

            {/* Detail panel (AR3D style) */}
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
                            <div className="lm-diagram-box">
                                <span className="lm-diagram-face">← {sel.facing}</span>
                            </div>
                        </div>
                        <div className="lm-rows">
                            <Row label="SQ. FEET" value={`${sel.sqft.toLocaleString()} Sq.Ft`} />
                            <Row label="SQ. YARDS" value={`${Math.round(sel.sqft / 9)} Sq.Yrd`} />
                            <Row label="SQ. METERS" value={`${sel.sqm} Sq.M`} />
                            <Row label="DIMENSIONS" value={sel.dim} />
                            <Row label="FACING" value={`← ${sel.facing}`} />
                        </div>
                        <button className="lm-cta">Enquire about Plot {sel.id}</button>
                    </>
                )}
            </div>

            {!sel && <div className="lm-hint">Tap a plot · pinch to zoom · twist to rotate</div>}
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
  --txt:#f3f6ee; --muted:#aeb6a4; --glass:rgba(18,22,16,.62);
  position:fixed; inset:0; height:100dvh;
  background:radial-gradient(120% 90% at 30% 10%,#20261a,#0c0f0a);
  color:var(--txt); font-family:'Inter',system-ui,-apple-system,sans-serif; overflow:hidden;
}

/* ===== Header (glass) ===== */
.lm-head{ position:absolute; top:0; left:0; right:0; z-index:6;
  display:flex; align-items:center; gap:14px; flex-wrap:wrap;
  padding:calc(env(safe-area-inset-top,0px) + 12px) 16px 12px;
  background:linear-gradient(180deg,rgba(8,11,7,.9),rgba(8,11,7,.5) 70%,transparent);
  backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); }
.lm-brand{ display:flex; align-items:center; gap:11px; }
.lm-logo{ display:flex; filter:drop-shadow(0 2px 10px rgba(212,171,84,.4)); }
.lm-brand-name{ font-family:'Playfair Display',Georgia,serif; font-weight:800; font-size:21px; line-height:1;
  background:linear-gradient(180deg,#fdf6e2,#e7cd85 55%,#c9a24b);
  -webkit-background-clip:text; background-clip:text; color:transparent; letter-spacing:-.01em; }
.lm-brand-sub{ font-size:10px; color:var(--muted); letter-spacing:.1em; text-transform:uppercase; margin-top:3px; }

/* ===== Search (glass pill) ===== */
.lm-search{ flex:1; min-width:160px; position:relative; }
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

/* ===== Stage ===== */
.lm-stage{ position:absolute; inset:0; touch-action:none; user-select:none; cursor:grab;
  background:radial-gradient(120% 90% at 38% 18%,#9c8a54,#5f5230); }
.lm-stage:active{ cursor:grabbing; }
.lm-svg{ display:block; width:100%; height:100%; }

/* ===== Train IQ credit logo + popup ===== */
.lm-tiq-wrap{ position:absolute; right:calc(env(safe-area-inset-right,0px) + 16px);
  bottom:calc(env(safe-area-inset-bottom,0px) + 20px); z-index:9; display:flex; align-items:center; gap:10px; }
.lm-tiq-logo{ display:flex; align-items:center; justify-content:center; cursor:pointer;
  background:rgba(244,246,240,.94); border:1px solid rgba(20,32,54,.14); border-radius:12px;
  padding:6px 10px; box-shadow:0 6px 18px rgba(0,0,0,.35); transition:transform .15s; }
.lm-tiq-logo:active{ transform:scale(.94); }
.lm-tiq-img{ height:24px; width:auto; display:block; object-fit:contain; }
.lm-tiq-pop{ text-decoration:none; background:rgba(20,36,60,.96); color:#fff; border-radius:12px;
  padding:9px 14px; box-shadow:0 8px 24px rgba(0,0,0,.45); backdrop-filter:blur(10px);
  white-space:nowrap; animation:tiqpop .2s ease; }
.lm-tiq-pop-title{ font-size:12px; font-weight:700; letter-spacing:.01em; }
.lm-tiq-pop-sub{ font-size:11px; color:#a9c4e6; margin-top:1px; }
@keyframes tiqpop{ from{ opacity:0; transform:translateX(8px); } to{ opacity:1; transform:translateX(0); } }

/* ===== SVG map elements ===== */
.lm-kerb polygon, .lm-kerb rect{ fill:none; stroke:#b9b39c; stroke-width:2.4; opacity:.4; }
.lm-paver line{ stroke:#5f5945; stroke-width:1; opacity:.55; }
.lm-lane line{ stroke:#f4e6b0; stroke-width:2.4; stroke-dasharray:12 16; opacity:.62; stroke-linecap:round; }
.lm-road-lbl{ fill:#e8dcb8; font-size:12px; font-weight:600; letter-spacing:.16em; text-anchor:middle;
  font-family:'Inter',sans-serif; opacity:.85; }
.lm-road-lbl-lg{ font-size:15px; font-weight:700; letter-spacing:.2em; fill:#f4e6b0; opacity:.95; }
.lm-road-lbl-sm{ font-size:9.5px; letter-spacing:.12em; }
.lm-drain circle{ fill:#1e1b15; stroke:#4c4636; stroke-width:.8; }
.lm-turf-edge{ fill:none; stroke:#c7d69a; stroke-width:2.2; opacity:.5; stroke-linejoin:round; }
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

/* ===== Google Maps button ===== */
.lm-mapbtn{ position:absolute; left:calc(env(safe-area-inset-left,0px) + 14px);
  top:calc(env(safe-area-inset-top,0px) + 78px); z-index:8; text-decoration:none;
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px;
  width:56px; height:56px; border-radius:16px; cursor:pointer;
  border:1px solid var(--line); background:var(--glass); color:var(--txt);
  backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  box-shadow:0 10px 30px rgba(0,0,0,.5); transition:transform .15s, background .2s; }
.lm-mapbtn:hover{ background:rgba(212,171,84,.12); }
.lm-mapbtn:active{ transform:scale(.95); }
.lm-mapbtn-txt{ font-size:8.5px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; opacity:.85; }

/* ===== Apple-Maps-style control stack ===== */
.lm-ctrl{ position:absolute; right:calc(env(safe-area-inset-right,0px) + 14px);
  bottom:calc(env(safe-area-inset-bottom,0px) + 92px); z-index:8;
  display:flex; flex-direction:column; gap:1px; border-radius:16px; overflow:hidden;
  border:1px solid var(--line); background:var(--glass); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  box-shadow:0 10px 30px rgba(0,0,0,.5); }
.lm-ctrl button{ width:48px; height:48px; border:none; background:transparent; color:var(--gold);
  display:flex; align-items:center; justify-content:center; cursor:pointer;
  border-bottom:1px solid rgba(212,171,84,.14); transition:background .15s; }
.lm-ctrl button:last-child{ border-bottom:none; }
.lm-ctrl button:hover{ background:rgba(212,171,84,.1); }
.lm-ctrl button:active{ background:rgba(212,171,84,.2); }

/* ===== Legend (glass card) ===== */
.lm-legend{ position:absolute; left:calc(env(safe-area-inset-left,0px) + 14px);
  bottom:calc(env(safe-area-inset-bottom,0px) + 20px); z-index:8; display:flex; gap:14px; flex-wrap:wrap; max-width:62vw;
  background:var(--glass); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
  border:1px solid var(--line); border-radius:14px; padding:10px 14px; font-size:11.5px; color:var(--txt);
  box-shadow:0 10px 30px rgba(0,0,0,.45); }
.lm-legend span{ display:flex; align-items:center; gap:6px; }
.lm-legend i{ width:12px; height:12px; border-radius:4px; box-shadow:0 1px 2px rgba(0,0,0,.4); }
.lg-plot{ background:linear-gradient(180deg,#568636,#365b21); }
.lg-ca{ background:linear-gradient(180deg,#a9d475,#77a648); }
.lg-park{ background:linear-gradient(180deg,#a9d475,#77a648); }
.lg-stp{ background:linear-gradient(180deg,#cdb4ec,#9772c6); }

/* ===== Hint ===== */
.lm-hint{ position:absolute; bottom:calc(env(safe-area-inset-bottom,0px) + 74px); left:50%; transform:translateX(-50%);
  z-index:7; background:var(--glass); border:1px solid var(--line); color:var(--txt); font-size:12px;
  padding:9px 18px; border-radius:999px; backdrop-filter:blur(14px); white-space:nowrap; pointer-events:none;
  box-shadow:0 8px 24px rgba(0,0,0,.4); animation:fade 6s ease forwards; }
@keyframes fade{ 0%,70%{opacity:1;} 100%{opacity:0;} }

/* ===== Premium bottom sheet ===== */
.lm-panel{ position:absolute; left:0; right:0; bottom:0; z-index:20;
  background:linear-gradient(180deg,rgba(24,30,20,.96),rgba(11,15,10,.98));
  border-top:1px solid var(--line); border-radius:24px 24px 0 0;
  padding:8px 20px calc(env(safe-area-inset-bottom,0px) + 22px);
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
.lm-diagram{ display:flex; justify-content:center; margin-bottom:16px; }
.lm-diagram-box{ width:170px; height:82px; border:2px solid var(--gold); border-radius:6px; display:flex;
  align-items:center; justify-content:center; background:rgba(212,171,84,.07);
  box-shadow:inset 0 0 20px rgba(212,171,84,.12); }
.lm-diagram-face{ color:var(--gold-lt); font-weight:700; font-size:13px; letter-spacing:.02em; }
.lm-rows{ display:flex; flex-direction:column; margin-bottom:18px; }
.lm-row{ display:flex; justify-content:space-between; align-items:center; padding:13px 2px; border-bottom:1px solid rgba(255,255,255,.07); }
.lm-row:last-child{ border-bottom:none; }
.lm-row-l{ font-size:11.5px; color:var(--muted); letter-spacing:.08em; text-transform:uppercase; }
.lm-row-v{ font-size:14.5px; font-weight:700; text-align:right; }
.lm-cta{ width:100%; padding:15px; border:none; border-radius:14px; cursor:pointer;
  background:linear-gradient(180deg,#f2dd9a,#d4ab54); color:#1a1305; font-weight:800; font-size:15px; letter-spacing:.01em;
  box-shadow:0 10px 26px rgba(212,171,84,.32); transition:transform .12s; }
.lm-cta:hover{ transform:translateY(-1px); }
.lm-cta:active{ transform:translateY(1px); }

@media (min-width:640px){
  .lm-brand-name{ font-size:24px; }
  .lm-panel{ max-width:420px; left:auto; right:22px; bottom:22px; border-radius:20px; }
}
@media (prefers-reduced-motion:reduce){
  .lm-panel, .lm-plot-shape{ transition:none; }
  .lm-hint{ animation:none; }
}
`;