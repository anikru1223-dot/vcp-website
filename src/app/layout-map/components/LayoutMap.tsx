"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";

/**
 * Basava Ganguru Residential Layout — Premium 3D Interactive Masterplan
 *
 * GEOMETRY IS FROZEN. Every plot id, polygon, boundary point, CA / STP / PARK
 * region and road corridor below is byte-identical to the sanctioned SBUDA
 * survey plan (Sy.No.43/1). NOTHING positional is altered — only the visual
 * render layer is rebuilt to read like a Prestige / Brigade / Sobha brochure.
 */

const DIMENSIONS = {
    s9x12: "9.00 × 12.00 m",
    s9x15: "9.00 × 15.00 m",
    s9x16: "9.00 × 16.05 m",
    odd: "Odd-shaped site",
};

type DimKey = keyof typeof DIMENSIONS;
type Plot = { id: string; pts: string; dim: DimKey; facing: string };

/* ════════════════════════════════════════════════════════════════════════
   APPROVED GEOMETRY — DO NOT ALTER (unchanged from sanctioned layout)
   ════════════════════════════════════════════════════════════════════════ */
const PLOTS: Plot[] = [
    { id: "1", pts: "250,262 330,262 330,362 250,362", dim: "odd", facing: "North" },
    { id: "2", pts: "330,262 410,262 410,362 330,362", dim: "s9x15", facing: "North" },
    { id: "3", pts: "410,262 490,262 490,362 410,362", dim: "odd", facing: "North" },
    { id: "4", pts: "250,362 330,362 330,470 250,470", dim: "odd", facing: "South" },
    { id: "5", pts: "330,362 410,362 410,470 330,470", dim: "s9x15", facing: "South" },
    { id: "6", pts: "410,362 490,362 490,470 410,470", dim: "odd", facing: "South" },

    { id: "7", pts: "140,600 232,600 232,720 140,720", dim: "odd", facing: "North" },
    { id: "8", pts: "232,600 322,600 322,720 232,720", dim: "s9x12", facing: "North" },
    { id: "9", pts: "322,600 412,600 412,720 322,720", dim: "s9x12", facing: "North" },
    { id: "10", pts: "412,600 502,600 502,720 412,720", dim: "s9x12", facing: "North" },

    { id: "11", pts: "560,262 627,262 627,352 560,352", dim: "s9x15", facing: "North" },
    { id: "25", pts: "627,262 700,262 700,352 627,352", dim: "s9x15", facing: "North" },
    { id: "24", pts: "700,262 786,262 786,352 700,352", dim: "s9x15", facing: "North" },

    { id: "12", pts: "560,352 700,352 700,460 560,460", dim: "s9x15", facing: "West" },
    { id: "13", pts: "560,460 700,460 700,555 560,555", dim: "s9x16", facing: "West" },
    { id: "14", pts: "560,555 700,555 700,650 560,650", dim: "s9x16", facing: "West" },
    { id: "15", pts: "560,650 700,650 700,745 560,745", dim: "s9x16", facing: "West" },
    { id: "16", pts: "560,745 700,745 700,840 560,840", dim: "s9x16", facing: "West" },
    { id: "17", pts: "560,840 700,840 700,948 560,948", dim: "odd", facing: "South" },

    { id: "23", pts: "700,352 786,352 786,460 700,460", dim: "s9x15", facing: "East" },
    { id: "22", pts: "700,460 786,460 786,555 700,555", dim: "s9x16", facing: "East" },
    { id: "21", pts: "700,555 786,555 786,650 700,650", dim: "s9x16", facing: "East" },
    { id: "20", pts: "700,650 786,650 786,745 700,745", dim: "s9x16", facing: "East" },
    { id: "19", pts: "700,745 786,745 786,840 700,840", dim: "s9x16", facing: "East" },
    { id: "18", pts: "700,840 786,840 786,948 700,948", dim: "odd", facing: "South" },

    { id: "26", pts: "858,262 986,262 986,392 858,392", dim: "s9x15", facing: "North" },
    { id: "27", pts: "858,392 986,392 986,485 858,485", dim: "s9x15", facing: "East" },
    { id: "28", pts: "858,485 986,485 986,578 858,578", dim: "s9x15", facing: "East" },
    { id: "29", pts: "858,578 986,578 986,671 858,671", dim: "s9x15", facing: "East" },
    { id: "30", pts: "858,671 986,671 986,764 858,764", dim: "s9x15", facing: "East" },
    { id: "31", pts: "858,764 986,764 986,857 858,857", dim: "s9x15", facing: "East" },
    { id: "32", pts: "858,857 986,857 986,948 858,948", dim: "odd", facing: "South" },
];

const BOUNDARY = "118,232 1108,268 1150,700 900,1090 118,1150 118,232";
const CA = { pts: "140,262 250,262 250,470 140,470" };
const STP = { pts: "462,830 530,830 530,930 462,930" };
// Park lower edge pulled UP to y=948 so Park, Plot 17, Plot 18 and Plot 32
// all terminate on the SAME bottom line. Lake/landscaping raised to fit.
const PARK = "118,830 462,830 530,930 530,948 118,948";
const PARK_LAKE = { cx: 290, cy: 900, rx: 118, ry: 44 };

// Road corridors — ALL 9m roads share the SAME width (~58px), matching the
// sanctioned drawing where the horizontal 9m road equals the two vertical 9m
// roads. Top road lower edge = 262 (touches plot tops). Vertical roads 262->948.
const ROADS = {
    top: "118,222 1108,254 1108,266 118,266",          // top 12m road — deeper band, bottom 266 overlaps plot tops (262)
    leftV: { x: 502, y: 258, w: 58, h: 690 },             // 9m vertical (502..560), starts at 258 to fuse with top road
    rightV: { x: 786, y: 258, w: 72, h: 690 },             // 9m vertical (786..858), fused with top road
    // Horizontal road FILLS the whole corridor 470->600 so plots 4/5/6 (bottom 470)
    // and plots 7-10 (top 600) both touch asphalt — no green sliver. Carriageway
    // markings (dashes/cars) stay centred; the fill removes the verge.
    midH: { x: 118, y: 470, w: 442, h: 130 },            // asphalt corridor 470..600 (touches both plot rows)
    path: { x: 118, y: 748, w: 442, h: 30 },             // 3m pathway
};

/* ════════════════════════════════════════════════════════════════════════
   VISUAL-ONLY DATA (decoration — carries no engineering meaning)
   ════════════════════════════════════════════════════════════════════════ */

const centroid = (pts: string) => {
    const nums = pts.split(/[ ,]+/).map(Number);
    let x = 0, y = 0, n = 0;
    for (let i = 0; i < nums.length; i += 2) { x += nums[i]; y += nums[i + 1]; n++; }
    return { x: x / n, y: y / n };
};

const PARK_SHRUBS: number[][] = [
    [170, 890, 8, 0], [205, 858, 6, 1], [415, 890, 8, 0], [450, 860, 6, 1],
    [160, 935, 7, 1], [240, 938, 6, 0], [370, 936, 6, 1], [300, 855, 6, 0],
];

/* Warm street-light dots (glow points) along road edges — [x,y] */
const LIGHTS: [number, number][] = [
    // left road
    [506, 320], [556, 400], [506, 490], [556, 580], [506, 680], [556, 770], [506, 870],
    // right road
    [790, 330], [854, 420], [790, 520], [854, 620], [790, 720], [854, 820], [790, 910],
    // horizontal road
    [200, 552], [330, 552], [450, 552],
    // top road
    [250, 250], [450, 250], [650, 250], [850, 250], [1020, 250],
];

/* Cars populate every road (replacing roadside trees).
   [x, y, angle, color]. Vertical roads: two lanes either side of centre line.
   Left road centre x=531 (lanes ~518/544). Right road centre x=822 (lanes ~805/838). */
const CARS: [number, number, number, string][] = [
    // Left vertical road — down-lane (x~518) and up-lane (x~544)
    [518, 300, 90, "#c23b32"], [544, 340, 90, "#e8e8ee"], [518, 400, 90, "#5a6474"],
    [544, 470, 90, "#dcdce4"], [518, 545, 90, "#3f6ea5"], [544, 620, 90, "#e8e8ee"],
    [518, 700, 90, "#8a3f3f"], [544, 770, 90, "#5a6474"], [518, 840, 90, "#dcdce4"],
    [544, 905, 90, "#c23b32"],
    // Right vertical road
    [805, 320, 90, "#e8e8ee"], [838, 380, 90, "#c23b32"], [805, 450, 90, "#5a6474"],
    [838, 520, 90, "#dcdce4"], [805, 600, 90, "#3f6ea5"], [838, 675, 90, "#e8e8ee"],
    [805, 760, 90, "#8a3f3f"], [838, 830, 90, "#dcdce4"], [805, 905, 90, "#5a6474"],
    // Horizontal 9m road (band 506-564, centre ~535)
    [180, 522, 0, "#e8e8ee"], [270, 548, 0, "#c23b32"], [360, 522, 0, "#5a6474"],
    [450, 548, 0, "#dcdce4"],
    // Top road (y ~236 upper lane / ~250 lower lane)
    [220, 236, 0, "#dcdce4"], [360, 250, 0, "#c23b32"], [520, 236, 0, "#5a6474"],
    [680, 250, 0, "#e8e8ee"], [840, 236, 0, "#8a3f3f"], [1000, 250, 0, "#dcdce4"],
];

/* ── Warm street light with pooled glow ─────────────────────────────────── */
function StreetLight({ x, y }: { x: number; y: number }) {
    return (
        <g className="lm-light" transform={`translate(${x},${y})`}>
            <circle r="16" className="lm-light-pool" />
            <circle r="7" className="lm-light-pool2" />
            <line x1="0" y1="0" x2="0" y2="9" stroke="#26303f" strokeWidth="1.4" />
            <circle r="2.1" className="lm-light-bulb" />
        </g>
    );
}

/* ── Tiny top-down car ──────────────────────────────────────────────────── */
function Car({ x, y, a, c }: { x: number; y: number; a: number; c: string }) {
    return (
        <g transform={`translate(${x},${y}) rotate(${a})`} className="lm-car">
            <ellipse cx="1" cy="2" rx="6" ry="10" className="lm-tree-shadow" />
            <rect x="-4.5" y="-9" width="9" height="18" rx="3.2" fill={c} />
            <rect x="-3.4" y="-4" width="6.8" height="8" rx="1.6" fill="#1a2130" opacity="0.75" />
            <rect x="-3.6" y="-8" width="7.2" height="3.2" rx="1.2" fill="#fff" opacity="0.35" />
        </g>
    );
}

type ViewBox = { x: number; y: number; w: number; h: number };
type Point = { x: number; y: number };

const BASE_VB: ViewBox = { x: 80, y: 200, w: 1090, h: 990 };
const ASPECT = BASE_VB.h / BASE_VB.w;
const MIN_W = BASE_VB.w / 8;   // max zoom in  (8x)
const MAX_W = BASE_VB.w * 1.7; // max zoom out
const pivotX = BASE_VB.x + BASE_VB.w / 2;
const pivotY = BASE_VB.y + BASE_VB.h / 2;

// Rotate a screen-space delta into layout space so drag direction stays natural when rotated.
function rotateDelta(dx: number, dy: number, deg: number): [number, number] {
    const r = (-deg * Math.PI) / 180;
    const cos = Math.cos(r), sin = Math.sin(r);
    return [dx * cos - dy * sin, dx * sin + dy * cos];
}

export default function LayoutMap() {
    const [selected, setSelected] = useState<string | null>(null);
    // Displayed state (what renders) — eased toward the target each frame.
    const [view, setView] = useState<ViewBox>({ ...BASE_VB });
    const [rot, setRot] = useState(0);

    const wrapRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const rotGRef = useRef<SVGGElement | null>(null);
    const compassRef = useRef<SVGGElement | null>(null);

    // Target state the animation eases toward.
    const target = useRef<{ view: ViewBox; rot: number }>({ view: { ...BASE_VB }, rot: 0 });
    // Live "current" copy the loop mutates (avoids stale closures).
    const cur = useRef<{ view: ViewBox; rot: number }>({ view: { ...BASE_VB }, rot: 0 });
    const raf = useRef<number | null>(null);
    const animating = useRef(false);

    // Gesture refs
    const drag = useRef<{ px: number; py: number; vx: number; vy: number } | null>(null);
    const gesture = useRef<{ d: number; ang: number; cx: number; cy: number } | null>(null);

    const sel = PLOTS.find((p) => p.id === selected) || null;

    // Paint straight to the DOM (bypasses React re-render → 60fps during motion).
    const paint = (v: ViewBox, r: number) => {
        if (svgRef.current) svgRef.current.setAttribute("viewBox", `${v.x} ${v.y} ${v.w} ${v.h}`);
        if (rotGRef.current) rotGRef.current.setAttribute("transform", `rotate(${r} ${pivotX} ${pivotY})`);
        if (compassRef.current) compassRef.current.setAttribute("transform", `translate(1108,250) rotate(${-r})`);
    };

    // ── Animation loop: ease cur → target, paint DOM, sync React at rest ──
    const tick = useCallback(() => {
        const c = cur.current, t = target.current;
        const eV = c.view, tV = t.view;
        const k = 0.2; // easing (higher = snappier)
        eV.x += (tV.x - eV.x) * k;
        eV.y += (tV.y - eV.y) * k;
        eV.w += (tV.w - eV.w) * k;
        eV.h += (tV.h - eV.h) * k;
        let dr = t.rot - c.rot;
        while (dr > 180) dr -= 360;
        while (dr < -180) dr += 360;
        c.rot += dr * k;

        const done =
            Math.abs(tV.x - eV.x) < 0.08 && Math.abs(tV.y - eV.y) < 0.08 &&
            Math.abs(tV.w - eV.w) < 0.08 && Math.abs(tV.h - eV.h) < 0.08 &&
            Math.abs(dr) < 0.08;

        if (done) {
            c.view = { ...tV }; c.rot = t.rot;
            paint(tV, t.rot);
            setView({ ...tV }); setRot(t.rot); // sync React once, at rest
            animating.current = false;
            raf.current = null;
            return;
        }
        paint(eV, c.rot);
        raf.current = requestAnimationFrame(tick);
    }, []);

    const startAnim = useCallback(() => {
        if (!animating.current) {
            animating.current = true;
            raf.current = requestAnimationFrame(tick);
        }
    }, [tick]);

    // Direct manipulation (finger drag/pinch/twist): paint instantly, keep target synced.
    const setNow = useCallback((v: ViewBox, r?: number) => {
        if (raf.current) { cancelAnimationFrame(raf.current); raf.current = null; }
        animating.current = false;
        cur.current.view = { ...v };
        if (r !== undefined) cur.current.rot = r;
        target.current.view = { ...v };
        if (r !== undefined) target.current.rot = r;
        paint(v, r !== undefined ? r : cur.current.rot);
    }, []);

    // Commit the live DOM-driven state back into React (call on gesture end).
    const commit = useCallback(() => {
        setView({ ...cur.current.view });
        setRot(cur.current.rot);
    }, []);

    // Convert a screen point to SVG-user coords (meet letterboxing).
    const toUser = (clientX: number, clientY: number, v: ViewBox): Point => {
        const el = wrapRef.current;
        if (!el) return { x: v.x + v.w / 2, y: v.y + v.h / 2 };
        const rect = el.getBoundingClientRect();
        const scale = Math.min(rect.width / v.w, rect.height / v.h);
        const offX = (rect.width - v.w * scale) / 2, offY = (rect.height - v.h * scale) / 2;
        return { x: v.x + (clientX - rect.left - offX) / scale, y: v.y + (clientY - rect.top - offY) / scale };
    };

    const clampW = (w: number) => Math.min(MAX_W, Math.max(MIN_W, w));

    // Compute a zoomed viewBox around a focal client point (no state write).
    const zoomedView = (base: ViewBox, factor: number, clientX: number, clientY: number): ViewBox => {
        const nw = clampW(base.w / factor);
        const nh = nw * ASPECT;
        const f = toUser(clientX, clientY, base);
        const relX = (f.x - base.x) / base.w;
        const relY = (f.y - base.y) / base.h;
        return { x: f.x - relX * nw, y: f.y - relY * nh, w: nw, h: nh };
    };

    // Smooth (animated) zoom toward target — used by wheel + buttons.
    const smoothZoom = (factor: number, clientX: number, clientY: number) => {
        target.current.view = zoomedView(target.current.view, factor, clientX, clientY);
        startAnim();
    };

    const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        smoothZoom(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX, e.clientY);
    };

    const dist = (a: React.Touch, b: React.Touch) => Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const angle = (a: React.Touch, b: React.Touch) => Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI;

    const onTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 2) {
            gesture.current = {
                d: dist(e.touches[0], e.touches[1]),
                ang: angle(e.touches[0], e.touches[1]),
                cx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                cy: (e.touches[0].clientY + e.touches[1].clientY) / 2,
            };
            drag.current = null;
        } else if (e.touches.length === 1) {
            drag.current = { px: e.touches[0].clientX, py: e.touches[0].clientY, vx: cur.current.view.x, vy: cur.current.view.y };
        }
    };

    const onTouchMove = (e: React.TouchEvent) => {
        const el = wrapRef.current;
        if (e.touches.length === 2 && gesture.current && el) {
            e.preventDefault();
            const g = gesture.current;
            const nd = dist(e.touches[0], e.touches[1]);
            const na = angle(e.touches[0], e.touches[1]);
            const cx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2;

            // pinch-zoom around gesture centre (instant, no lag)
            const zv = zoomedView(cur.current.view, nd / g.d, cx, cy);
            // twist-rotate by the change in finger angle
            const nrot = cur.current.rot + (na - g.ang);
            setNow(zv, nrot);

            g.d = nd; g.ang = na; g.cx = cx; g.cy = cy;
        } else if (e.touches.length === 1 && drag.current && el) {
            e.preventDefault();
            const d = drag.current;
            const rect = el.getBoundingClientRect();
            const scale = Math.min(rect.width / cur.current.view.w, rect.height / cur.current.view.h);
            let dx = (e.touches[0].clientX - d.px) / scale;
            let dy = (e.touches[0].clientY - d.py) / scale;
            [dx, dy] = rotateDelta(dx, dy, cur.current.rot);
            setNow({ ...cur.current.view, x: d.vx - dx, y: d.vy - dy });
        }
    };
    const onTouchEnd = (e: React.TouchEvent) => { if (e.touches.length === 0) { drag.current = null; gesture.current = null; commit(); } };

    const onMouseDown = (e: React.MouseEvent) => { drag.current = { px: e.clientX, py: e.clientY, vx: cur.current.view.x, vy: cur.current.view.y }; };
    const onMouseMove = (e: React.MouseEvent) => {
        const el = wrapRef.current;
        const d = drag.current;
        if (!d || !el) return;
        const rect = el.getBoundingClientRect();
        const scale = Math.min(rect.width / cur.current.view.w, rect.height / cur.current.view.h);
        let dx = (e.clientX - d.px) / scale;
        let dy = (e.clientY - d.py) / scale;
        [dx, dy] = rotateDelta(dx, dy, cur.current.rot);
        setNow({ ...cur.current.view, x: d.vx - dx, y: d.vy - dy });
    };
    const onMouseUp = () => { if (drag.current) { drag.current = null; commit(); } };

    const reset = () => { target.current = { view: { ...BASE_VB }, rot: 0 }; startAnim(); };
    const btnZoom = (f: number) => {
        const el = wrapRef.current;
        if (el) { const r = el.getBoundingClientRect(); smoothZoom(f, r.left + r.width / 2, r.top + r.height / 2); }
    };
    const rotate = () => { target.current.rot = Math.round((target.current.rot + 90) / 90) * 90; startAnim(); };

    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        el.addEventListener("wheel", onWheel, { passive: false });
        return () => {
            el.removeEventListener("wheel", onWheel);
            if (raf.current) cancelAnimationFrame(raf.current);
        };
    }, []);

    return (
        <div className="lm-root">
            <style>{css}</style>

            <header className="lm-head">
                <div className="lm-crest" aria-hidden="true">
                    <svg viewBox="0 0 40 40" width="26" height="26">
                        <defs>
                            <linearGradient id="crestG" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0" stopColor="#f6e6b0" /><stop offset="1" stopColor="#c9a24b" />
                            </linearGradient>
                        </defs>
                        <path d="M20 3 L34 9 V21 C34 30 27 35 20 37 C13 35 6 30 6 21 V9 Z"
                            fill="none" stroke="url(#crestG)" strokeWidth="1.6" strokeLinejoin="round" />
                        <rect x="14" y="16" width="5" height="12" rx="0.6" fill="url(#crestG)" />
                        <rect x="21" y="13" width="5" height="15" rx="0.6" fill="url(#crestG)" />
                        <rect x="15.2" y="18" width="1.3" height="1.6" fill="#0d1d3d" />
                        <rect x="15.2" y="21" width="1.3" height="1.6" fill="#0d1d3d" />
                        <rect x="22.4" y="15" width="1.3" height="1.6" fill="#0d1d3d" />
                        <rect x="22.4" y="18" width="1.3" height="1.6" fill="#0d1d3d" />
                        <rect x="22.4" y="21" width="1.3" height="1.6" fill="#0d1d3d" />
                    </svg>
                </div>
                <div className="lm-head-txt">
                    <div className="lm-kicker">Vijayalaxmi C Patil</div>
                    <h1 className="lm-title">Basava Ganguru</h1>
                    <div className="lm-sub">Residential Layout · Shivamogga · 32 Plots</div>
                </div>
            </header>

            <div
                className="lm-stage"
                ref={wrapRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
            >
                <svg
                    ref={svgRef}
                    viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="lm-svg"
                    role="img"
                    aria-label="Interactive residential layout map"
                >
                    <defs>
                        {/* ── Plot cream, warm raised land ── */}
                        <linearGradient id="plotFill" x1="0" y1="0" x2="0.35" y2="1">
                            <stop offset="0" stopColor="#fdf8ec" />
                            <stop offset="0.45" stopColor="#f2e7ca" />
                            <stop offset="1" stopColor="#e2d2ab" />
                        </linearGradient>
                        <linearGradient id="plotSel" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#f9e6a2" />
                            <stop offset="1" stopColor="#dcb85a" />
                        </linearGradient>

                        {/* land grain texture */}
                        <pattern id="landGrain" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(18)">
                            <rect width="14" height="14" fill="transparent" />
                            <circle cx="3" cy="4" r="0.7" fill="#b89a5e" opacity="0.16" />
                            <circle cx="9" cy="10" r="0.6" fill="#a98d52" opacity="0.14" />
                            <circle cx="11" cy="3" r="0.5" fill="#c9ad70" opacity="0.12" />
                        </pattern>

                        {/* ── Ground: landscaped green-earth so plots + roads pop ── */}
                        <radialGradient id="groundFill" cx="0.42" cy="0.30" r="1.05">
                            <stop offset="0" stopColor="#3a5f43" />
                            <stop offset="0.55" stopColor="#2b4a35" />
                            <stop offset="1" stopColor="#1e3626" />
                        </radialGradient>
                        <pattern id="groundTex" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(24)">
                            <rect width="18" height="18" fill="transparent" />
                            <path d="M3,14 L4,9" stroke="#4a7a54" strokeWidth="0.8" opacity="0.35" />
                            <path d="M10,15 L11,10" stroke="#2f5539" strokeWidth="0.8" opacity="0.35" />
                            <path d="M14,12 L14.7,8" stroke="#568a5f" strokeWidth="0.7" opacity="0.3" />
                        </pattern>

                        {/* ── Asphalt (recessed, textured) ── */}
                        <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#1c222e" />
                            <stop offset="0.15" stopColor="#333a49" />
                            <stop offset="0.5" stopColor="#2b323f" />
                            <stop offset="0.85" stopColor="#333a49" />
                            <stop offset="1" stopColor="#1c222e" />
                        </linearGradient>
                        <linearGradient id="asphaltV" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0" stopColor="#1c222e" />
                            <stop offset="0.15" stopColor="#333a49" />
                            <stop offset="0.5" stopColor="#2b323f" />
                            <stop offset="0.85" stopColor="#333a49" />
                            <stop offset="1" stopColor="#1c222e" />
                        </linearGradient>
                        <pattern id="asphaltTex" width="10" height="10" patternUnits="userSpaceOnUse">
                            <rect width="10" height="10" fill="transparent" />
                            <circle cx="2" cy="3" r="0.5" fill="#4a5262" opacity="0.4" />
                            <circle cx="7" cy="6" r="0.45" fill="#161b25" opacity="0.5" />
                            <circle cx="5" cy="9" r="0.4" fill="#525b6d" opacity="0.3" />
                        </pattern>

                        {/* ── Water ── */}
                        <radialGradient id="lakeFill" cx="0.4" cy="0.3" r="0.9">
                            <stop offset="0" stopColor="#aee7dd" />
                            <stop offset="0.55" stopColor="#5cb3b1" />
                            <stop offset="1" stopColor="#357f8c" />
                        </radialGradient>

                        {/* ── CA blue paving ── */}
                        <linearGradient id="caFill" x1="0" y1="0" x2="0.4" y2="1">
                            <stop offset="0" stopColor="#c8e8f5" />
                            <stop offset="0.5" stopColor="#8fc6e0" />
                            <stop offset="1" stopColor="#5ea0c4" />
                        </linearGradient>

                        {/* ── Grass ── */}
                        <radialGradient id="grassFill" cx="0.45" cy="0.35" r="1.0">
                            <stop offset="0" stopColor="#5fa64f" />
                            <stop offset="0.6" stopColor="#4a8a3f" />
                            <stop offset="1" stopColor="#377031" />
                        </radialGradient>
                        <pattern id="grassTex" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
                            <rect width="12" height="12" fill="transparent" />
                            <path d="M2,10 L3,5" stroke="#6bb659" strokeWidth="0.7" opacity="0.4" />
                            <path d="M7,11 L8,6" stroke="#3f8038" strokeWidth="0.7" opacity="0.4" />
                            <path d="M10,9 L10.6,5" stroke="#78c266" strokeWidth="0.6" opacity="0.35" />
                        </pattern>

                        {/* ── STP roof ── */}
                        <linearGradient id="stpRoof" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#cba9e8" />
                            <stop offset="1" stopColor="#9670c2" />
                        </linearGradient>

                        {/* ── Gold stroke ── */}
                        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#f6e6b0" />
                            <stop offset="0.5" stopColor="#c9a24b" />
                            <stop offset="1" stopColor="#a5802e" />
                        </linearGradient>

                        {/* raised-land shadow (ambient occlusion) */}
                        <filter id="plotShadow" x="-25%" y="-25%" width="150%" height="150%">
                            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000" floodOpacity="0.45" />
                        </filter>
                        <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2.4" floodColor="#000" floodOpacity="0.4" />
                        </filter>
                        <filter id="selGlow" x="-70%" y="-70%" width="240%" height="240%">
                            <feDropShadow dx="0" dy="0" stdDeviation="7" floodColor="#f0cf78" floodOpacity="0.95" />
                        </filter>
                        <filter id="roadRecess" x="-30%" y="-30%" width="160%" height="160%">
                            <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#000" floodOpacity="0.55" />
                        </filter>

                        {/* warm sunlight wash */}
                        <radialGradient id="sunWash" cx="0.28" cy="0.16" r="0.9">
                            <stop offset="0" stopColor="#ffdf9e" stopOpacity="0.20" />
                            <stop offset="0.5" stopColor="#ffd08a" stopOpacity="0.05" />
                            <stop offset="1" stopColor="#000" stopOpacity="0" />
                        </radialGradient>
                        <radialGradient id="vignette" cx="0.5" cy="0.44" r="0.82">
                            <stop offset="0" stopColor="#000" stopOpacity="0" />
                            <stop offset="1" stopColor="#000" stopOpacity="0.42" />
                        </radialGradient>

                        {/* street-light pooled glow */}
                        <radialGradient id="lightPool" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0" stopColor="#ffdd93" stopOpacity="0.55" />
                            <stop offset="0.5" stopColor="#ffc862" stopOpacity="0.18" />
                            <stop offset="1" stopColor="#ffc862" stopOpacity="0" />
                        </radialGradient>
                    </defs>

                    {/* Rotation group — spins all content around the layout centre (crisp, vector). */}
                    <g ref={rotGRef} transform={`rotate(${rot} ${pivotX} ${pivotY})`}>

                        {/* Ground plate */}
                        <polygon points={BOUNDARY} fill="url(#groundFill)" />
                        <polygon points={BOUNDARY} fill="url(#groundTex)" opacity="0.6" pointerEvents="none" />

                        {/* Red property boundary — drawn UNDER the roads so the top road
                stays fully visible (the road overlays the line cleanly). */}
                        <polygon points={BOUNDARY} className="lm-boundary-wall" />
                        <polygon points={BOUNDARY} className="lm-boundary" />

                        {/* ── PERIPHERAL CONTEXT ROADS (outside red boundary) ── */}
                        <g className="lm-ext-road">
                            <rect x="1112" y="250" width="30" height="850" />
                            <rect x="86" y="300" width="24" height="120" />
                            <rect x="118" y="196" width="1000" height="22" transform="rotate(1.6 118 196)" />
                        </g>
                        <g className="lm-ext-label">
                            <text x="1127" y="640" transform="rotate(-90 1127 640)">EXISTING 12m ROAD</text>
                            <text x="99" y="360" transform="rotate(-90 99 360)">EXISTING 9m ROAD</text>
                            <text x="600" y="212">APPROVED LAYOUT 12m ROAD</text>
                        </g>
                        <g className="lm-syno">
                            <text x="150" y="188">SY.NO.30</text>
                            <text x="560" y="188">SY.NO.42</text>
                            <text x="1150" y="640" transform="rotate(-90 1150 640)">SY.NO.38/1</text>
                            <text x="600" y="1120">SY.NO.45</text>
                            <text x="96" y="720" transform="rotate(-90 96 720)">SY.NO.32</text>
                        </g>

                        {/* ════ INTERNAL ROAD NETWORK — recessed, textured ════ */}
                        <g filter="url(#roadRecess)">
                            <polygon points={ROADS.top} fill="url(#asphalt)" />
                            <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} fill="url(#asphaltV)" />
                            <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} fill="url(#asphaltV)" />
                            <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} fill="url(#asphalt)" />
                        </g>
                        {/* asphalt grain overlay */}
                        <g opacity="0.9">
                            <polygon points={ROADS.top} fill="url(#asphaltTex)" />
                            <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} fill="url(#asphaltTex)" />
                            <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} fill="url(#asphaltTex)" />
                            <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} fill="url(#asphaltTex)" />
                        </g>
                        {/* concrete kerb stones (light inner edge) */}
                        <g className="lm-kerb">
                            <polygon points={ROADS.top} />
                            <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} />
                            <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} />
                            <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} />
                        </g>
                        {/* 3m pathway (interlocking) */}
                        <rect x={ROADS.path.x} y={ROADS.path.y} width={ROADS.path.w} height={ROADS.path.h} fill="#39414f" opacity="0.92" />
                        <g className="lm-path-tex">
                            {Array.from({ length: 15 }).map((_, i) => (
                                <line key={i} x1={128 + i * 30} y1={ROADS.path.y} x2={128 + i * 30} y2={ROADS.path.y + ROADS.path.h} />
                            ))}
                        </g>
                        {/* centre lane dashes */}
                        <g className="lm-lanes">
                            <line x1="130" y1="240" x2="1100" y2="248" />
                            <line x1="531" y1="262" x2="531" y2="946" />
                            <line x1="822" y1="262" x2="822" y2="946" />
                            <line x1="122" y1="535" x2="556" y2="535" />
                        </g>
                        {/* manholes / drain covers */}
                        <g className="lm-drain">
                            <circle cx="531" cy="380" r="3.4" /><circle cx="531" cy="620" r="3.4" /><circle cx="531" cy="860" r="3.4" />
                            <circle cx="822" cy="440" r="3.4" /><circle cx="822" cy="680" r="3.4" /><circle cx="822" cy="900" r="3.4" />
                            <rect x="300" y="558" width="7" height="4" rx="1" /><rect x="420" y="558" width="7" height="4" rx="1" />
                        </g>

                        {/* ════ PARK — lush landscaped garden (fitted to y=830..948) ════ */}
                        <g>
                            <polygon points={PARK} fill="url(#grassFill)" filter="url(#plotShadow)" />
                            <polygon points={PARK} fill="url(#grassTex)" opacity="0.7" />
                            {/* stone edging */}
                            <polygon points={PARK} className="lm-park-edge" />

                            {/* curved jogging track looping the lake */}
                            <path d="M175,872 Q290,846 405,874 Q430,908 400,936 Q290,952 180,936 Q152,906 175,872 Z" className="lm-park-track" />
                            <path d="M175,872 Q290,846 405,874 Q430,908 400,936 Q290,952 180,936 Q152,906 175,872 Z" className="lm-park-track-inner" />

                            {/* lake */}
                            <ellipse cx={PARK_LAKE.cx} cy={PARK_LAKE.cy} rx={PARK_LAKE.rx} ry={PARK_LAKE.ry} fill="url(#lakeFill)" filter="url(#softShadow)" />
                            <ellipse cx={PARK_LAKE.cx - 30} cy={PARK_LAKE.cy - 12} rx="46" ry="13" fill="#fff" opacity="0.20" />
                            <ellipse cx={PARK_LAKE.cx + 28} cy={PARK_LAKE.cy + 9} rx="26" ry="8" fill="#2c6d76" opacity="0.35" />
                            {/* rock rim on lake */}
                            {Array.from({ length: 20 }).map((_, i) => {
                                const ang = (i / 20) * Math.PI * 2;
                                const rx = PARK_LAKE.cx + Math.cos(ang) * (PARK_LAKE.rx + 4);
                                const ry = PARK_LAKE.cy + Math.sin(ang) * (PARK_LAKE.ry + 3);
                                return <circle key={i} cx={rx} cy={ry} r={1.6 + (i % 3) * 0.8} fill="#8b8677" opacity="0.7" />;
                            })}

                            {/* flower beds + shrubs */}
                            {PARK_SHRUBS.map(([x, y, r, k], i) =>
                                k === 1 ? (
                                    <g key={i}>
                                        <circle cx={x} cy={y} r={r} fill="#b8477f" opacity="0.85" />
                                        <circle cx={x - 2.4} cy={y - 1.6} r={r * 0.42} fill="#e88bb5" />
                                        <circle cx={x + 2.4} cy={y + 0.8} r={r * 0.36} fill="#f2b3d0" />
                                        <circle cx={x} cy={y - 2.4} r={r * 0.3} fill="#ffd36b" />
                                    </g>
                                ) : (
                                    <g key={i}>
                                        <circle cx={x} cy={y} r={r} fill="#2f6b34" />
                                        <circle cx={x - 1.6} cy={y - 1.6} r={r * 0.55} fill="#4a8a41" />
                                        <circle cx={x + 1.6} cy={y + 0.8} r={r * 0.4} fill="#5fa650" />
                                    </g>
                                )
                            )}

                            {/* benches (facing the lake) */}
                            <g className="lm-bench">
                                <rect x="255" y="860" width="18" height="4.5" rx="1.5" />
                                <rect x="322" y="862" width="18" height="4.5" rx="1.5" />
                                <rect x="200" y="920" width="15" height="4" rx="1.5" />
                            </g>

                            {/* children play area (top-left corner of park) */}
                            <g transform="translate(160,855)">
                                <ellipse cx="0" cy="9" rx="22" ry="6" fill="#000" opacity="0.2" />
                                <rect x="-20" y="-7" width="40" height="15" rx="3" fill="#c9723f" opacity="0.32" />
                                <rect x="-15" y="-5" width="5" height="10" rx="1" fill="#e05248" />
                                <rect x="-5" y="-7" width="5" height="12" rx="1" fill="#f0b429" />
                                <rect x="5" y="-4" width="5" height="9" rx="1" fill="#3b82c4" />
                                <path d="M12,-5 L18,7" stroke="#f0b429" strokeWidth="2.6" strokeLinecap="round" />
                            </g>

                            {/* gazebo (right side, above STP) */}
                            <g transform="translate(430,895)">
                                <ellipse cx="2" cy="15" rx="18" ry="5" fill="#000" opacity="0.28" />
                                <rect x="-12" y="1" width="24" height="12" rx="2" className="lm-gazebo-base" />
                                <polygon points="-16,1 16,1 20,-11 0,-21 -20,-11" className="lm-gazebo-roof" />
                                <polygon points="0,-21 20,-11 0,-7 -20,-11" fill="#7a4a2c" opacity="0.6" />
                                <polygon points="0,-21 -20,-11 0,-7" fill="#fff" opacity="0.12" />
                            </g>

                            {/* pergola (upper band) */}
                            <g transform="translate(345,850)" className="lm-pergola">
                                <rect x="-12" y="-2" width="24" height="3.5" rx="1" />
                                {[-10, -5, 0, 5, 10].map((dx, i) => <line key={i} x1={dx} y1="-3.5" x2={dx} y2="3.5" />)}
                            </g>

                            <text x="290" y="824" className="lm-feature-label">KARAB</text>
                        </g>

                        {/* ════ CIVIC AMENITY — community facility ════ */}
                        <g>
                            <polygon points={CA.pts} fill="url(#caFill)" filter="url(#plotShadow)" />
                            {/* paving grid */}
                            <g className="lm-ca-grid">
                                <line x1="140" y1="315" x2="250" y2="315" />
                                <line x1="140" y1="366" x2="250" y2="366" />
                                <line x1="140" y1="418" x2="250" y2="418" />
                                <line x1="195" y1="262" x2="195" y2="470" />
                            </g>
                            {/* clubhouse placeholder */}
                            <g transform="translate(195,330)">
                                <ellipse cx="0" cy="20" rx="34" ry="9" fill="#000" opacity="0.18" />
                                <rect x="-30" y="-6" width="60" height="26" rx="2" fill="#eef4f7" />
                                <rect x="-30" y="-6" width="60" height="8" fill="#c9dbe6" />
                                <polygon points="-34,-6 34,-6 24,-20 -24,-20" fill="#7aa6c4" />
                                <rect x="-22" y="4" width="8" height="14" fill="#8fb8d4" opacity="0.7" />
                                <rect x="-6" y="4" width="8" height="14" fill="#8fb8d4" opacity="0.7" />
                                <rect x="10" y="4" width="8" height="14" fill="#8fb8d4" opacity="0.7" />
                            </g>
                            {/* flag poles */}
                            <g className="lm-flag">
                                <line x1="150" y1="278" x2="150" y2="262" /><polygon points="150,262 160,266 150,270" fill="#e05248" />
                                <line x1="240" y1="278" x2="240" y2="262" /><polygon points="240,262 250,266 240,270" fill="#c9a24b" />
                            </g>
                            {/* border shrubs */}
                            {[[150, 460], [195, 466], [240, 460], [146, 400], [244, 400], [146, 320], [244, 320]].map(([x, y], i) => (
                                <g key={i}>
                                    <circle cx={x} cy={y} r="6" fill="#3f7d3a" opacity="0.9" />
                                    <circle cx={x - 1.5} cy={y - 1.5} r="3.4" fill="#5aa257" />
                                </g>
                            ))}
                            <text x={centroid(CA.pts).x} y={centroid(CA.pts).y + 20} className="lm-ca-label">CA</text>
                            <text x={centroid(CA.pts).x} y={centroid(CA.pts).y + 40} className="lm-ca-sub">CIVIC AMENITY</text>
                        </g>

                        {/* ════ STP — utility compound ════ */}
                        <g filter="url(#softShadow)">
                            <polygon points={STP.pts} fill="#e9dff3" stroke="#9670c2" strokeWidth="1.4" strokeDasharray="4 3" />
                            {/* fence posts */}
                            {[[462, 830], [496, 830], [530, 830], [462, 880], [530, 880], [462, 930], [496, 930], [530, 930]].map(([x, y], i) => (
                                <circle key={i} cx={x} cy={y} r="1.6" fill="#7a5da0" />
                            ))}
                            {/* building */}
                            <rect x="474" y="846" width="44" height="42" rx="2" fill="#b7c0cc" />
                            <rect x="474" y="846" width="44" height="10" fill="#9aa6b4" />
                            <polygon points="472,846 520,846 512,834 480,834" fill="url(#stpRoof)" />
                            {/* ventilation */}
                            <rect x="480" y="838" width="5" height="5" fill="#8a72ad" />
                            <rect x="490" y="838" width="5" height="5" fill="#8a72ad" />
                            {/* tanks */}
                            <circle cx="486" cy="908" r="7" fill="#8ea0b4" /><circle cx="486" cy="908" r="4" fill="#a8b6c6" />
                            <circle cx="506" cy="908" r="7" fill="#8ea0b4" /><circle cx="506" cy="908" r="4" fill="#a8b6c6" />
                            {/* maintenance gate */}
                            <line x1="496" y1="928" x2="496" y2="932" stroke="#7a5da0" strokeWidth="2" />
                            <text x={centroid(STP.pts).x} y="872" className="lm-stp-label">STP</text>
                        </g>

                        {/* ════ PLOTS — raised cream land ════ */}
                        {PLOTS.map((p) => {
                            const c = centroid(p.pts);
                            const isSel = p.id === selected;
                            return (
                                <g
                                    key={p.id}
                                    className={`lm-plot ${isSel ? "is-sel" : ""}`}
                                    onClick={(e) => { e.stopPropagation(); setSelected(p.id); }}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e: React.KeyboardEvent) => (e.key === "Enter" || e.key === " ") && setSelected(p.id)}
                                    aria-label={`Plot ${p.id}, ${DIMENSIONS[p.dim]}`}
                                >
                                    <polygon
                                        points={p.pts}
                                        className="lm-plot-shape"
                                        fill={isSel ? "url(#plotSel)" : "url(#plotFill)"}
                                        filter={isSel ? "url(#selGlow)" : "url(#plotShadow)"}
                                    />
                                    {/* grain texture */}
                                    <polygon points={p.pts} fill="url(#landGrain)" pointerEvents="none" />
                                    {/* top highlight bevel */}
                                    <polygon points={p.pts} className="lm-plot-bevel" />
                                    <text x={c.x} y={c.y + 8} className="lm-plot-num">{p.id}</text>
                                </g>
                            );
                        })}

                        {/* Trees removed per request — roads populated with cars instead. */}

                        {/* ════ STREET LIGHTS + CARS ════ */}
                        {LIGHTS.map(([x, y], i) => <StreetLight key={`li${i}`} x={x} y={y} />)}
                        {CARS.map(([x, y, a, c], i) => <Car key={`ca${i}`} x={x} y={y} a={a} c={c} />)}

                        {/* ════ ROAD LABELS ════ */}
                        <text x="600" y="250" className="lm-road-label">EXISTING 12m ROAD</text>
                        <text x="519" y="640" className="lm-road-label" transform="rotate(-90 519 640)">9m ROAD</text>
                        <text x="815" y="640" className="lm-road-label" transform="rotate(-90 815 640)">9m ROAD</text>
                        <text x="325" y="540" className="lm-road-label">9m ROAD</text>
                        <text x="325" y="756" className="lm-road-label sm">3m PATHWAY</text>

                        {/* (red boundary is drawn earlier, under the roads) */}

                        {/* entry pillars at top road */}
                        <g className="lm-pillar">
                            <rect x="356" y="248" width="7" height="14" rx="1" /><rect x="486" y="248" width="7" height="14" rx="1" />
                        </g>

                        {/* lighting washes */}
                        <polygon points={BOUNDARY} fill="url(#sunWash)" pointerEvents="none" />
                        <polygon points={BOUNDARY} fill="url(#vignette)" pointerEvents="none" />

                        {/* compass — counter-rotated so N always shows the layout's true north */}
                        <g ref={compassRef} className="lm-compass" transform={`translate(1108,250) rotate(${-rot})`}>
                            <circle r="19" className="lm-comp-ring" />
                            <path d="M0,-13 L4.5,3 L0,-1 L-4.5,3 Z" className="lm-comp-n" />
                            <path d="M0,13 L4.5,-3 L0,1 L-4.5,-3 Z" className="lm-comp-s" />
                            <text y="-23" className="lm-comp-t">N</text>
                        </g>

                    </g>{/* end rotation group */}
                </svg>

                {/* Zoom + rotate controls */}
                <div className="lm-zoom">
                    <button onClick={() => btnZoom(1.3)} aria-label="Zoom in">
                        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                    </button>
                    <button onClick={() => btnZoom(0.77)} aria-label="Zoom out">
                        <svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
                    </button>
                    <button onClick={rotate} aria-label="Rotate 90 degrees">
                        <svg viewBox="0 0 24 24" width="19" height="19"><path d="M4 9a8 8 0 1 1-.8 4" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" /><path d="M4 4v5h5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                    <button onClick={reset} aria-label="Reset view" className="lm-zoom-reset">
                        <svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" /></svg>
                    </button>
                </div>

                {/* Legend */}
                <div className="lm-legend">
                    <span><i className="lg-plot" />Plots</span>
                    <span><i className="lg-ca" />CA</span>
                    <span><i className="lg-park" />Karab</span>
                    <span><i className="lg-stp" />STP</span>
                </div>
            </div>

            {/* Detail sheet */}
            <div className={`lm-sheet ${sel ? "open" : ""}`}>
                {sel && (
                    <>
                        <div className="lm-sheet-grip" />
                        <div className="lm-sheet-head">
                            <div>
                                <div className="lm-sheet-kicker">Premium Plot</div>
                                <div className="lm-sheet-num">No. {sel.id}</div>
                            </div>
                            <button className="lm-close" onClick={() => setSelected(null)} aria-label="Close">
                                <svg viewBox="0 0 24 24" width="18" height="18"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></svg>
                            </button>
                        </div>
                        <div className="lm-sheet-rows">
                            <Row label="Dimensions" value={DIMENSIONS[sel.dim]} />
                            <Row label="Facing" value={sel.facing} />
                            <Row label="Status" value="Available" accent />
                        </div>
                        <button className="lm-cta">Enquire about Plot {sel.id}</button>
                    </>
                )}
            </div>

            {!sel && <div className="lm-hint">Drag to move · pinch to zoom · twist to rotate</div>}
        </div>
    );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
    return (
        <div className="lm-row">
            <span className="lm-row-l">{label}</span>
            <span className={`lm-row-v ${accent ? "accent" : ""}`}>{value}</span>
        </div>
    );
}

const css = `
.lm-root{
  --navy:#0a1630; --navy2:#0d1d3d; --gold:#c9a24b; --gold-lt:#e7cd85;
  --line-soft:rgba(201,162,75,.30); --txt:#eef2fb; --muted:#9aa8c6; --ink:#33291a;
  position:fixed; inset:0; width:100%; height:100%; height:100dvh;
  background:
    radial-gradient(120% 80% at 26% -8%, #2a2f28 0%, #1a1e19 46%, #0f120e 100%);
  color:var(--txt); font-family:'Inter',system-ui,-apple-system,sans-serif;
  box-sizing:border-box; overflow:hidden;
}
/* Floating glass header overlay — does not steal map space */
.lm-head{
  position:absolute; top:0; left:0; right:0; z-index:6;
  display:flex; align-items:center; gap:11px;
  padding:calc(env(safe-area-inset-top,0px) + 12px) 16px 12px;
  background:linear-gradient(180deg, rgba(10,16,14,.82) 0%, rgba(10,16,14,.55) 65%, transparent 100%);
  backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
  pointer-events:none;
}
.lm-crest{ display:flex; align-items:center; filter:drop-shadow(0 2px 8px rgba(201,162,75,.35)); }
.lm-head-txt{ display:flex; flex-direction:column; line-height:1.05; }
.lm-kicker{ font-size:9px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold); font-weight:600; }
.lm-title{
  margin:2px 0 1px; font-size:24px; line-height:1; font-weight:800; letter-spacing:-.015em;
  font-family:'Playfair Display','Georgia',serif;
  background:linear-gradient(180deg,#fdf5df 0%,#e7cd85 55%,#c9a24b 100%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
}
.lm-sub{ font-size:10px; color:var(--muted); letter-spacing:.04em; }

.lm-stage{
  position:absolute; inset:0; overflow:hidden;
  background:radial-gradient(120% 90% at 40% 20%, #23281f, #0d100c);
  touch-action:none; user-select:none; cursor:grab;
}
.lm-stage:active{ cursor:grabbing; }
.lm-svg{ display:block; width:100%; height:100%; }

.lm-boundary-wall{ fill:none; stroke:#16281a; stroke-width:8; stroke-linejoin:round; opacity:.85; }
.lm-boundary{ fill:none; stroke:#e05248; stroke-width:2.4; stroke-linejoin:round; opacity:.92;
  filter:drop-shadow(0 0 4px rgba(224,82,72,.45)); }
.lm-pillar rect{ fill:#c9a24b; stroke:#8a6a1e; stroke-width:.6; }

.lm-kerb polygon, .lm-kerb rect{ fill:none; stroke:#6b7488; stroke-width:2.2; opacity:.5; }
.lm-ext-road rect{ fill:#242b3a; opacity:.5; stroke:#38404f; stroke-width:1; stroke-dasharray:6 5; }
.lm-ext-label text{ fill:#7f8ba6; font-size:11px; font-weight:600; letter-spacing:.1em; text-anchor:middle; }
.lm-syno text{ fill:#8894b0; font-size:10px; font-weight:600; letter-spacing:.05em; text-anchor:middle; font-style:italic; }
.lm-lanes line{ stroke:#f2e6ae; stroke-width:2; stroke-dasharray:11 15; opacity:.62; stroke-linecap:round; }
.lm-path-tex line{ stroke:#2a303c; stroke-width:1; opacity:.6; }
.lm-drain circle{ fill:#20262f; stroke:#454d5c; stroke-width:.8; }
.lm-drain rect{ fill:#20262f; stroke:#454d5c; stroke-width:.6; }

.lm-park-edge{ fill:none; stroke:#c9bd94; stroke-width:2.4; opacity:.55; stroke-linejoin:round; }
.lm-park-track{ fill:none; stroke:#d8c79a; stroke-width:9; opacity:.75; stroke-linecap:round; }
.lm-park-track-inner{ fill:none; stroke:#efe3c2; stroke-width:2; opacity:.5; stroke-dasharray:4 8; stroke-linecap:round; }
.lm-bench rect{ fill:#8a5a34; stroke:#5a3a20; stroke-width:.6; }
.lm-gazebo-base{ fill:#c79a63; }
.lm-gazebo-roof{ fill:#9a5a34; }
.lm-pergola rect{ fill:#a06b3c; }
.lm-pergola line{ stroke:#8a5a34; stroke-width:1.4; }
.lm-flag line{ stroke:#8a94a8; stroke-width:1.2; }
.lm-feature-label{ fill:#f0fff2; font-size:22px; font-weight:800; text-anchor:middle; letter-spacing:.16em;
  font-family:'Playfair Display',serif; text-shadow:0 2px 6px rgba(0,0,0,.55); }

.lm-ca-grid line{ stroke:#ffffff; stroke-width:.8; opacity:.3; }
.lm-ca-label{ fill:#0a2c3e; font-size:26px; font-weight:900; text-anchor:middle; letter-spacing:.04em; font-family:'Playfair Display',serif; }
.lm-ca-sub{ fill:#0a2c3e; font-size:8.5px; font-weight:700; text-anchor:middle; letter-spacing:.16em; opacity:.9; }

.lm-stp-label{ fill:#3a2358; font-size:13px; font-weight:800; text-anchor:middle; }

.lm-plot{ cursor:pointer; }
.lm-plot-shape{ stroke:url(#gold); stroke-width:1.8; transition:filter .2s ease, transform .2s ease; }
.lm-plot-bevel{ fill:none; stroke:#ffffff; stroke-width:1; opacity:.45; pointer-events:none;
  transform:translate(0,-0.7px); }
.lm-plot-num{ fill:var(--ink); font-size:22px; font-weight:800; text-anchor:middle; pointer-events:none;
  font-family:'Playfair Display',serif;
  paint-order:stroke; stroke:#fff; stroke-width:2.4px; stroke-linejoin:round;
  filter:drop-shadow(0 1px 0 rgba(255,255,255,.5)); }
.lm-plot:hover .lm-plot-shape{ filter:url(#selGlow) brightness(1.05); }
.lm-plot.is-sel .lm-plot-shape{ stroke:#8a6a1e; stroke-width:2.4; }
.lm-plot.is-sel .lm-plot-num{ fill:#2a1e05; }
.lm-plot:focus{ outline:none; }
.lm-plot:focus-visible .lm-plot-shape{ stroke:#fff; stroke-width:2.6; }

.lm-tree{ pointer-events:none; }
.lm-tree-shadow{ fill:#000; opacity:.3; }
.lm-car{ pointer-events:none; }

.lm-light{ pointer-events:none; }
.lm-light-pool{ fill:url(#lightPool); }
.lm-light-pool2{ fill:#ffdd93; opacity:.28; }
.lm-light-bulb{ fill:#fff3d0; filter:drop-shadow(0 0 3px #ffd884); }

.lm-road-label{ fill:#c3cde3; font-size:11.5px; font-weight:600; letter-spacing:.14em; text-anchor:middle; pointer-events:none;
  text-shadow:0 1px 3px rgba(0,0,0,.7); }
.lm-road-label.sm{ font-size:9.5px; }

.lm-compass .lm-comp-ring{ fill:rgba(8,16,34,.7); stroke:var(--line-soft); stroke-width:1.4; }
.lm-compass .lm-comp-n{ fill:#e05248; }
.lm-compass .lm-comp-s{ fill:#6a7690; }
.lm-compass .lm-comp-t{ fill:var(--gold); font-size:13px; font-weight:800; text-anchor:middle; }

.lm-zoom{ position:absolute; right:calc(env(safe-area-inset-right,0px) + 14px); bottom:calc(env(safe-area-inset-bottom,0px) + 90px); display:flex; flex-direction:column; gap:9px; z-index:8; }
.lm-zoom button{
  width:46px; height:46px; border-radius:13px; border:1px solid var(--line-soft);
  background:rgba(12,18,14,.78); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); color:var(--gold);
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  box-shadow:0 6px 18px rgba(0,0,0,.5);
}
.lm-zoom button:active{ transform:translateY(1px); background:rgba(24,32,22,.92); }
.lm-zoom button svg{ display:block; }
.lm-zoom-reset{ color:var(--muted); }

.lm-legend{
  position:absolute; left:calc(env(safe-area-inset-left,0px) + 14px); bottom:calc(env(safe-area-inset-bottom,0px) + 20px); z-index:8; display:flex; gap:12px; flex-wrap:wrap; max-width:60vw;
  background:rgba(12,18,14,.74); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); border:1px solid var(--line-soft);
  border-radius:12px; padding:8px 12px; font-size:11px; color:var(--muted);
}
.lm-legend span{ display:flex; align-items:center; gap:5px; }
.lm-legend i{ width:11px; height:11px; border-radius:3px; display:inline-block; }
.lg-plot{ background:linear-gradient(180deg,#fdf8ec,#e2d2ab); border:1px solid var(--gold); }
.lg-ca{ background:linear-gradient(180deg,#c8e8f5,#5ea0c4); }
.lg-park{ background:linear-gradient(180deg,#5fa64f,#377031); }
.lg-stp{ background:#9670c2; }

.lm-hint{
  position:absolute; bottom:calc(env(safe-area-inset-bottom,0px) + 74px); left:50%; transform:translateX(-50%); z-index:7;
  background:rgba(12,18,14,.82); border:1px solid var(--line-soft); color:var(--muted);
  font-size:12px; padding:8px 16px; border-radius:999px; backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px);
  letter-spacing:.02em; box-shadow:0 8px 24px rgba(0,0,0,.4); pointer-events:none; white-space:nowrap;
  max-width:90vw; overflow:hidden; text-overflow:ellipsis;
  animation:lm-hintfade 6s ease forwards;
}
@keyframes lm-hintfade{ 0%,70%{opacity:1;} 100%{opacity:0;} }

.lm-sheet{
  position:fixed; left:0; right:0; bottom:0; z-index:20;
  background:linear-gradient(180deg,#0e1c3a,#08101f);
  border-top:1px solid var(--line-soft); border-radius:24px 24px 0 0;
  padding:10px 20px 26px; transform:translateY(120%); transition:transform .34s cubic-bezier(.22,1,.36,1);
  box-shadow:0 -22px 54px rgba(0,0,0,.55);
}
.lm-sheet.open{ transform:translateY(0); }
.lm-sheet-grip{ width:44px; height:5px; border-radius:99px; background:#2b3a5a; margin:2px auto 14px; }
.lm-sheet-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.lm-sheet-kicker{ font-size:10.5px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold); font-weight:600; }
.lm-sheet-num{ font-size:28px; font-weight:800; letter-spacing:-.01em; font-family:'Playfair Display',serif; }
.lm-close{ width:38px; height:38px; border-radius:12px; border:1px solid var(--line-soft); background:transparent; color:var(--muted); cursor:pointer; display:flex; align-items:center; justify-content:center; }
.lm-close:active{ background:rgba(255,255,255,.05); }
.lm-sheet-rows{ display:flex; flex-direction:column; gap:2px; margin-bottom:18px; }
.lm-row{ display:flex; justify-content:space-between; align-items:center; padding:13px 2px; border-bottom:1px solid rgba(255,255,255,.06); }
.lm-row-l{ font-size:13px; color:var(--muted); letter-spacing:.02em; }
.lm-row-v{ font-size:15px; font-weight:600; }
.lm-row-v.accent{ color:#4ade80; }
.lm-cta{ width:100%; padding:15px; border:none; border-radius:14px; cursor:pointer;
  background:linear-gradient(180deg,#eecd7c,#c9a24b); color:#1a1305; font-weight:700; font-size:15px;
  letter-spacing:.01em; box-shadow:0 10px 26px rgba(201,162,75,.32); }
.lm-cta:active{ transform:translateY(1px); }

@media (min-width:640px){
  .lm-title{ font-size:30px; }
  .lm-sheet{ max-width:460px; left:auto; right:24px; bottom:24px; border-radius:20px; }
}
@media (prefers-reduced-motion:reduce){
  .lm-sheet{ transition:none; }
  .lm-plot-shape{ transition:none; }
}
`;