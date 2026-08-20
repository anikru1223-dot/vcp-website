"use client";

import React, { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client"; // adjust path to your client

/**
 * Basava Ganguru — Interactive Master Layout (flat 2D)
 *
 * Centering fix: the previous version let the <svg viewBox> handle scaling
 * ("preserveAspectRatio=meet"), which silently letterboxes whichever axis
 * doesn't match the container's aspect ratio — on a tall phone that pushed
 * the whole layout down/right with a big dead zone above it. This version
 * sizes the viewBox to the stage's own pixel box every render, so there is
 * no hidden browser-side offset — ALL centering/zoom/pan math is ours, in
 * plain pixels, and the map is always framed around its content center.
 *
 * FIX (initial-camera race): computeFitCam() and clampPan() treat
 * `cam.tx/ty` as the on-screen position of SVG (0,0) — at rot=0 the paint
 * transform reduces to `screen(p) = tx + s * p`, so `tx/ty` is NOT the
 * screen position of CONTENT_CENTER. Both functions correctly account for
 * `s * CONTENT_CENTER` when computing/clamping.
 *
 * FIX (this revision — "Image 2" bug): the very first `useLayoutEffect`
 * measurement pass could occasionally read a 0×0 (or otherwise invalid)
 * `.lm-stage` rect — before layout has settled, before the mobile browser
 * chrome (address bar) has resolved its final height, etc. Previously
 * `hasFitRef.current` was set to `true` unconditionally on that first pass,
 * so `computeFitCam()`'s own zero-guard would return the degenerate
 * `{ s: 1, tx: 0, ty: 0, rot: 0 }` camera and the code would consider the
 * map "fitted" even though it wasn't. The loading splash was also gated
 * purely on data/timers (`ready`), with no dependency on whether a real
 * camera fit had actually happened — so the splash could disappear before,
 * or right as, a corrective re-fit landed, producing a visible flash of the
 * wrong framing ("Image 2"). This revision:
 *   1. Never marks the fit as "done" against a 0×0 rect — it retries via
 *      requestAnimationFrame until a real, non-zero rect is measured.
 *   2. Introduces `mapCameraReady`, flipped true only once a real fit has
 *      been computed and painted, and gates the splash overlay on
 *      `ready && mapCameraReady` so the map is never revealed mid-fit.
 *   3. Paints the camera group using the SVG-native `transform` attribute
 *      instead of a CSS `transform` + `transform-box:fill-box`, removing a
 *      known source of cross-engine inconsistency (fill-box resolves the
 *      transform origin against the group's full bounding box, which here
 *      includes the huge background rect, making the effective reference
 *      frame less predictable across mobile browser engines).
 * No plot geometry, roads, colors, UI controls, or existing interaction
 * behavior (pan/zoom/pinch/rotate/reset/filters/etc.) were changed.
 */

type Plot = {
    id: string; pts: string; dim: string; facing: string; sqm: number; sqft: number;
};

type Status = "available" | "reserved" | "sold";

type MediaItem = { id: string; type: "image" | "video"; url: string; caption: string | null };

const STATUS_META: Record<Status, { label: string; fill: string; sel: string }> = {
    available: { label: "Available", fill: "#4d7a34", sel: "#6dbf46" },
    reserved: { label: "Reserved", fill: "#d98a1f", sel: "#f5b942" },
    sold: { label: "Sold", fill: "#a52a24", sel: "#e0504a" },
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

type Box = { x: number; y: number; w: number; h: number };
type Point = { x: number; y: number };

// The natural drawing canvas all coordinates above are authored in.
const BASE_VB: Box = { x: 60, y: 190, w: 1130, h: 1010 };

// Tight bounds around the actual plotted layout — this (not the huge
// decorative canvas around it) is what the camera fits/centers on.
const CONTENT_BOUNDS: Box = { x: 108, y: 174, w: 902, h: 796 };
const CONTENT_CENTER: Point = { x: CONTENT_BOUNDS.x + CONTENT_BOUNDS.w / 2, y: CONTENT_BOUNDS.y + CONTENT_BOUNDS.h / 2 };

const centroid = (pts: string): Point => {
    const n = pts.split(/[ ,]+/).map(Number);
    let x = 0, y = 0, c = 0;
    for (let i = 0; i < n.length; i += 2) { x += n[i]; y += n[i + 1]; c++; }
    return { x: x / c, y: y / c };
};

// ---------------------------------------------------------------------------
// Landscaping v3 — premium master-plan style greenery.
//
// IMPORTANT / CAMERA SAFETY: everything below is pure decoration data. It is
// never read by computeFitScale/computeFitCam/CONTENT_BOUNDS/CONTENT_CENTER
// (those are fixed constants defined earlier and take no landscaping input),
// and every tree/bush/flower is rendered inside the SAME camera-transformed
// <g> as the plots/roads — it cannot expand or otherwise influence the
// camera fit. If the map ever appears "zoomed out" or the layout looks tiny,
// the cause is not this section.
//
// v3 fixes the v2 regression where landscaping was walked as a continuous
// evenly-spaced line, which reads as a dotted/confetti border once combined
// with realistic tree density. This version instead places small CLUSTERS
// of 2–4 items at irregular intervals along each zone (with occasional
// gaps), and the tree/bush symbols themselves are bigger, bolder, and built
// from fewer/larger overlapping canopy blobs so each instance reads clearly
// as a tree rather than a speck — while staying well under plot size.
//
// Geometry is still defined ONCE per shape as reusable <g id="..."> symbols
// in <defs> and instanced via lightweight <use> (see the <defs> block
// further down); per-instance color comes from CSS custom properties
// (--tc1/--tc2/--tc3) set inline on each <use>, so geometry is never
// duplicated no matter how many instances exist.
//
// Placement stays strictly zone-based (property boundary, KARAB, CA) — no
// full-canvas scatter — and every candidate point is checked against the
// real road rectangles and every plot polygon before being kept, so
// landscaping can never land on a road, a plot, or a plot number/road label.
// ---------------------------------------------------------------------------

type Pt = [number, number];
type Deco = { x: number; y: number; s: number; rot: number; sym: string; pal: [string, string, string] };

const parsePolygon = (pts: string): Pt[] => {
    const n = pts.split(/[ ,]+/).map(Number);
    const out: Pt[] = [];
    for (let i = 0; i < n.length; i += 2) out.push([n[i], n[i + 1]]);
    return out;
};

// Curated dark→light triads from the requested palette. Each tree picks one
// combination as a whole (never mixes across triads), so variation stays
// controlled rather than looking noisy.
const LEAF_PALETTES: [string, string, string][] = [
    ["#285C2D", "#3F7A35", "#73A84A"],
    ["#285C2D", "#568F3D", "#8DBB5A"],
    ["#3F7A35", "#568F3D", "#73A84A"],
    ["#285C2D", "#3F7A35", "#568F3D"],
    ["#3F7A35", "#73A84A", "#8DBB5A"],
];

const TREE_VARIANTS = ["tA", "tB", "tC", "tD", "tE", "tF"];
const ACCENT_TREE_VARIANTS = ["tB", "tD"];
const BUSH_VARIANTS = ["bA", "bB"];

const pickPalette = (rnd: () => number): [string, string, string] =>
    LEAF_PALETTES[Math.floor(rnd() * LEAF_PALETTES.length) % LEAF_PALETTES.length];

// Bigger/bolder than v2 so a single tree reads clearly at normal zoom
// instead of shrinking into a dot, while staying well under plot size
// (a plot side here is ~80–100 units; a tree's full canopy footprint at
// scale 1 is ~16 units, so even at the top of the range it's a fraction of
// a plot, not a giant tree).
const scaleForTree = (rnd: () => number, accent = false) =>
    accent ? 1.35 + rnd() * 0.25 : 0.75 + rnd() * 0.6; // 0.75–1.35 base, accents 1.35–1.6

function makeDeco(x: number, y: number, rot: number, rnd: () => number, pool: string[], accent = false): Deco {
    const sym = pool[Math.floor(rnd() * pool.length) % pool.length];
    return { x, y, s: scaleForTree(rnd, accent), rot, sym, pal: pickPalette(rnd) };
}

// Road rectangles (the top road is axis-aligned in practice, so it's
// normalized to a plain rect too) plus a safety margin. Any candidate
// landscaping point inside one of these — or too close to it — is rejected.
const ROAD_MARGIN = 7;
const ROAD_RECTS: Box[] = [
    { x: 118, y: 262 - R12, w: 1108 - 118, h: R12 },
    ROADS.leftV, ROADS.rightV, ROADS.midH, ROADS.path,
];
const isOnRoad = (x: number, y: number, margin = ROAD_MARGIN) =>
    ROAD_RECTS.some((r) => x > r.x - margin && x < r.x + r.w + margin && y > r.y - margin && y < r.y + r.h + margin);

// Point-in-polygon (ray casting) — used so landscaping never lands on top
// of a plot (and therefore never covers a plot number).
function pointInPolygon(x: number, y: number, poly: Pt[]): boolean {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        const hit = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
        if (hit) inside = !inside;
    }
    return inside;
}
const PLOT_POLYS: Pt[][] = PLOTS.map((p) => parsePolygon(p.pts));
const isInAnyPlot = (x: number, y: number) => PLOT_POLYS.some((poly) => pointInPolygon(x, y, poly));
const isBlocked = (x: number, y: number) => isOnRoad(x, y) || isInAnyPlot(x, y);

// Picks cluster CENTER points along a single edge, spaced irregularly
// (base ± variation), with an occasional chance to skip a slot entirely —
// this is what creates natural gaps instead of a continuous dotted line.
function clusterCenters(p1: Pt, p2: Pt, baseSpacing: number, spacingVariation: number, rnd: () => number, skipChance = 0): Pt[] {
    const [x1, y1] = p1, [x2, y2] = p2;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy);
    if (len < 1) return [];
    const ux = dx / len, uy = dy / len;
    const out: Pt[] = [];
    let d = baseSpacing * 0.5 + (rnd() - 0.5) * spacingVariation;
    while (d < len) {
        if (!(skipChance > 0 && rnd() < skipChance)) out.push([x1 + ux * d, y1 + uy * d]);
        d += baseSpacing + (rnd() - 0.5) * 2 * spacingVariation;
    }
    return out;
}

// Scatters 2–4 items around a cluster center: some pulled further along the
// "across" direction (outward from the zone), some pulled slightly negative
// (inward), and spread a little along the edge's own tangent — this is what
// gives "some trees inside, some outside, some grouped" instead of every
// item sitting exactly on the boundary line.
function scatterCluster(
    center: Pt, normal: Pt, rnd: () => number,
    opts: { countMin: number; countMax: number; alongSpread: number; acrossBase: number; acrossVariation: number; treeChance: number }
): { pos: Pt; isTree: boolean }[] {
    const [cx, cy] = center;
    const [nx, ny] = normal;
    const txv = ny, tyv = -nx; // tangent, perpendicular to the normal
    const count = opts.countMin + Math.floor(rnd() * (opts.countMax - opts.countMin + 1));
    const out: { pos: Pt; isTree: boolean }[] = [];
    for (let i = 0; i < count; i++) {
        const along = (rnd() - 0.5) * opts.alongSpread;
        const across = opts.acrossBase + (rnd() - 0.5) * opts.acrossVariation;
        out.push({
            pos: [cx + txv * along + nx * across, cy + tyv * along + ny * across],
            isTree: rnd() < opts.treeChance,
        });
    }
    return out;
}

// Outward unit normal of a polygon edge — always points away from the
// polygon's own centroid (negate it for the inward direction).
function outwardNormal(p1: Pt, p2: Pt, cx: number, cy: number): Pt {
    const [x1, y1] = p1, [x2, y2] = p2;
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;
    let nx = -dy / len, ny = dx / len;
    const mx = x1 + dx / 2, my = y1 + dy / 2;
    if (nx * (cx - mx) + ny * (cy - my) > 0) { nx = -nx; ny = -ny; }
    return [nx, ny];
}

// --- Zone 1: property boundary — irregular clusters following the actual
// BOUNDARY polygon, with denser clusters at each corner and a few sparse,
// larger accent trees. Roughly ~26–34 clusters total along this perimeter
// (2–4 items each) rather than one item every ~20 units, so it reads as
// planted groves with gaps, not a dotted outline.
function generateBorderLandscaping(poly: Pt[], seed: number): { trees: Deco[]; bushes: Deco[] } {
    let s = seed;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const trees: Deco[] = [];
    const bushes: Deco[] = [];
    const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length;
    const cy = poly.reduce((a, p) => a + p[1], 0) / poly.length;

    for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i], p2 = poly[(i + 1) % poly.length];
        const normal = outwardNormal(p1, p2, cx, cy);

        clusterCenters(p1, p2, 130, 34, rnd, 0.12).forEach((center) => {
            scatterCluster(center, normal, rnd, {
                countMin: 2, countMax: 4, alongSpread: 26, acrossBase: 20, acrossVariation: 26, treeChance: 0.62,
            }).forEach(({ pos: [ox, oy], isTree }) => {
                if (isBlocked(ox, oy)) return;
                if (isTree) trees.push(makeDeco(ox, oy, (rnd() - 0.5) * 30, rnd, TREE_VARIANTS));
                else bushes.push(makeDeco(ox, oy, (rnd() - 0.5) * 40, rnd, BUSH_VARIANTS));
            });
        });

        // Sparse, larger accent trees at wide intervals.
        clusterCenters(p1, p2, 260, 60, rnd, 0.2).forEach(([px, py]) => {
            const ox = px + normal[0] * 34, oy = py + normal[1] * 34;
            if (isBlocked(ox, oy)) return;
            trees.push(makeDeco(ox, oy, (rnd() - 0.5) * 20, rnd, ACCENT_TREE_VARIANTS, true));
        });
    }

    // Corner clusters — denser groupings set back from each vertex (never
    // exactly on it).
    poly.forEach(([vx, vy], idx) => {
        const prev = poly[(idx - 1 + poly.length) % poly.length];
        const next = poly[(idx + 1) % poly.length];
        const [n1x, n1y] = outwardNormal(prev, [vx, vy], cx, cy);
        const [n2x, n2y] = outwardNormal([vx, vy], next, cx, cy);
        let bx = n1x + n2x, by = n1y + n2y;
        const bl = Math.hypot(bx, by) || 1;
        bx /= bl; by /= bl;
        scatterCluster([vx, vy], [bx, by], rnd, {
            countMin: 3, countMax: 5, alongSpread: 22, acrossBase: 26, acrossVariation: 20, treeChance: 0.6,
        }).forEach(({ pos: [ox, oy], isTree }) => {
            if (isBlocked(ox, oy)) return;
            if (isTree) trees.push(makeDeco(ox, oy, (rnd() - 0.5) * 30, rnd, TREE_VARIANTS));
            else bushes.push(makeDeco(ox, oy, (rnd() - 0.5) * 40, rnd, BUSH_VARIANTS));
        });
    });

    return { trees, bushes };
}

// --- Zone 2: KARAB — the richest landscaping. Clusters follow the park's
// own shape, staying clear of the lake and the pathway above it, with
// occasional flowering accents so it reads as an intentionally designed park.
function generateKarabLandscaping(poly: Pt[], seed: number): { trees: Deco[]; bushes: Deco[]; flowers: Deco[] } {
    let s = seed;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const trees: Deco[] = [];
    const bushes: Deco[] = [];
    const flowers: Deco[] = [];
    const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length;
    const cy = poly.reduce((a, p) => a + p[1], 0) / poly.length;
    const clearOfLake = (x: number, y: number, factor: number) =>
        Math.hypot(x - KARAB_LAKE.cx, y - KARAB_LAKE.cy) > KARAB_LAKE.rx * factor;

    for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i], p2 = poly[(i + 1) % poly.length];
        const outward = outwardNormal(p1, p2, cx, cy);
        const inward: Pt = [-outward[0], -outward[1]];

        clusterCenters(p1, p2, 78, 18, rnd, 0.08).forEach((center) => {
            scatterCluster(center, inward, rnd, {
                countMin: 2, countMax: 4, alongSpread: 20, acrossBase: 16, acrossVariation: 18, treeChance: 0.55,
            }).forEach(({ pos: [ox, oy], isTree }) => {
                if (isOnRoad(ox, oy)) return;
                if (!clearOfLake(ox, oy, isTree ? 0.72 : 0.58)) return;
                if (isTree) trees.push(makeDeco(ox, oy, (rnd() - 0.5) * 30, rnd, TREE_VARIANTS));
                else bushes.push(makeDeco(ox, oy, (rnd() - 0.5) * 40, rnd, BUSH_VARIANTS));
            });

            // Occasional flowering ornamental accent in the same cluster.
            if (rnd() < 0.4) {
                const ox = center[0] + inward[0] * 10, oy = center[1] + inward[1] * 10;
                if (clearOfLake(ox, oy, 0.62) && !isOnRoad(ox, oy)) {
                    flowers.push({ x: ox, y: oy, s: 0.85 + rnd() * 0.3, rot: (rnd() - 0.5) * 30, sym: "fC", pal: pickPalette(rnd) });
                }
            }
        });
    }

    return { trees, bushes, flowers };
}

// --- Zone 3: CA — a subtle planted buffer along the one edge that actually
// has open ground next to it (the boundary-facing side); the other three
// edges sit flush against roads/plots, so nothing is planted there, and the
// CA / CIVIC AMENITY labels stay fully clear.
function generateCaLandscaping(seed: number): { trees: Deco[]; bushes: Deco[] } {
    let s = seed;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const trees: Deco[] = [];
    const bushes: Deco[] = [];
    const p1: Pt = [140, 262], p2: Pt = [140, 470];
    const normal: Pt = [-1, 0]; // west, toward the boundary — the only open side

    clusterCenters(p1, p2, 70, 14, rnd, 0.1).forEach((center) => {
        scatterCluster(center, normal, rnd, {
            countMin: 2, countMax: 3, alongSpread: 16, acrossBase: 10, acrossVariation: 10, treeChance: 0.6,
        }).forEach(({ pos: [ox, oy], isTree }) => {
            if (isBlocked(ox, oy)) return;
            if (isTree) trees.push(makeDeco(ox, oy, (rnd() - 0.5) * 24, rnd, TREE_VARIANTS));
            else bushes.push(makeDeco(ox, oy, (rnd() - 0.5) * 36, rnd, BUSH_VARIANTS));
        });
    });

    return { trees, bushes };
}

function generateAllLandscaping() {
    const boundaryPoly = parsePolygon(BOUNDARY);
    const karabPoly = parsePolygon(KARAB);
    const border = generateBorderLandscaping(boundaryPoly, 101);
    const karab = generateKarabLandscaping(karabPoly, 202);
    const ca = generateCaLandscaping(303);
    return {
        trees: [...border.trees, ...karab.trees, ...ca.trees],
        bushes: [...border.bushes, ...karab.bushes, ...ca.bushes],
        flowers: karab.flowers,
    };
}

const { trees: TREES, bushes: BUSHES, flowers: FLOWERS } = generateAllLandscaping();

// Single lightweight renderer for every tree/bush/flower instance — always
// just a <use> referencing a shared <defs> symbol, with per-instance color
// via CSS custom properties. No per-item SVG structure is ever generated.
const DecoUse = React.memo(function DecoUse({ d }: { d: Deco }) {
    return (
        <use
            href={`#${d.sym}`}
            transform={`translate(${d.x} ${d.y}) rotate(${d.rot}) scale(${d.s})`}
            style={{ ["--tc1" as any]: d.pal[0], ["--tc2" as any]: d.pal[1], ["--tc3" as any]: d.pal[2] }}
            pointerEvents="none"
        />
    );
});

const STREET_LIGHT_POS: [number, number][] = [
    [180, 223], [430, 223], [680, 223], [930, 223], [1060, 223],
    [531, 300], [531, 499], [531, 720], [531, 930],
    [822, 300], [822, 560], [822, 820], [822, 930],
    [150, 499], [340, 499],
];

const StreetLight = React.memo(function StreetLight({ x, y, night = false }: { x: number; y: number; night?: boolean }) {
    return (
        <g transform={`translate(${x},${y})`} pointerEvents="none">
            <circle r={night ? 5 : 3.5} fill="#ffdd93" opacity={night ? 0.9 : 0.4} />
        </g>
    );
});

// ---------------------------------------------------------------------------
// Camera — all math in real stage pixels. cam.s is an absolute px-per-unit
// scale (not a multiplier), cam.tx/ty are absolute px translate for the SVG
// origin. The on-screen position of CONTENT_CENTER at rot=0 is
// (tx + s*CONTENT_CENTER.x, ty + s*CONTENT_CENTER.y) — every place that
// needs to reason about "where the content center sits on screen" must add
// that offset back in; treating tx/ty as that position directly was the bug.
// ---------------------------------------------------------------------------

type Cam = { s: number; tx: number; ty: number; rot: number };
type StageRect = { left: number; top: number; width: number; height: number };

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function LayoutMap() {
    const [selected, setSelected] = useState<string | null>(null);
    const [tiqOpen, setTiqOpen] = useState(false);
    const [photosOpen, setPhotosOpen] = useState(false);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [lightbox, setLightbox] = useState<number | null>(null);
    const [night, setNight] = useState(false);

    // ---- Real loading gate (data + fonts + a small minimum, capped by a timeout) ----
    const [ready, setReady] = useState(false);
    const [loadPct, setLoadPct] = useState(6);
    const [dataLoaded, setDataLoaded] = useState(false);
    // True only after the camera has been measured against a REAL, non-zero
    // `.lm-stage` rect and painted at least once. The loading overlay must not
    // disappear until BOTH this and `ready` are true — otherwise the user can
    // see a frame of the map before it's actually framed correctly.
    const [mapCameraReady, setMapCameraReady] = useState(false);

    // The <svg viewBox> tracks the stage's own pixel size exactly, so there is
    // never a browser-computed letterbox offset to fight against.
    const [vb, setVb] = useState({ w: 360, h: 640 });

    const [statusMap, setStatusMap] = useState<Record<string, Status>>({});
    const [filter, setFilter] = useState<Status | "all">("all");
    const [filterOpen, setFilterOpen] = useState(false);
    const projectId = "basava-ganguru";
    const supabase = useMemo(() => createClient(), []);

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
            try {
                const { data } = await supabase
                    .from("plot_status")
                    .select("plot_id,status")
                    .eq("project_id", projectId);
                if (!active) return;
                if (data) {
                    const m: Record<string, Status> = {};
                    data.forEach((r: { plot_id: string; status: Status }) => { m[r.plot_id] = r.status; });
                    setStatusMap(m);
                }
            } finally {
                if (active) setDataLoaded(true);
            }
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
    }, [projectId, supabase]);

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
    }, [projectId, supabase]);

    useEffect(() => {
        let cancelled = false;
        const minDelay = new Promise((res) => setTimeout(res, 500));
        const fontsReady = (document as any).fonts?.ready ? (document as any).fonts.ready : Promise.resolve();
        const safetyTimeout = new Promise((res) => setTimeout(res, 4500));

        const tick = window.setInterval(() => {
            setLoadPct((p) => (p < 88 ? p + (88 - p) * 0.12 + 1 : p));
        }, 120);

        Promise.race([
            Promise.all([minDelay, fontsReady, new Promise((res) => {
                const check = () => (dataLoaded ? res(true) : setTimeout(check, 60));
                check();
            })]),
            safetyTimeout,
        ]).then(() => {
            if (cancelled) return;
            window.clearInterval(tick);
            setLoadPct(100);
            window.setTimeout(() => { if (!cancelled) setReady(true); }, 220);
        });

        return () => { cancelled = true; window.clearInterval(tick); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataLoaded]);

    const wrapRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const camGroupRef = useRef<SVGGElement | null>(null);
    const compassRef = useRef<SVGGElement | null>(null);

    const camRef = useRef<Cam>({ s: 1, tx: 0, ty: 0, rot: 0 });
    const animRef = useRef<{ from: Cam; to: Cam; start: number; dur: number } | null>(null);
    const loopRunning = useRef(false);
    const pendingPaint = useRef(false);

    const stageRectRef = useRef<StageRect>({ left: 0, top: 0, width: 0, height: 0 });
    const fitScaleRef = useRef(1); // the "100% / default" px-per-unit scale for the current stage size
    const hasFitRef = useRef(false); // true only once a fit has been computed against a REAL non-zero rect

    const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
    const dragState = useRef<{ px: number; py: number; tx: number; ty: number } | null>(null);
    const pinchState = useRef<{ d: number; ang: number; cx: number; cy: number } | null>(null);

    const idleTimer = useRef<number | null>(null);
    // True once the user has actually touched/dragged/zoomed the map. Until
    // then we keep re-fitting the camera to the content on every measurement
    // pass, so a late-settling layout (mobile address bar collapsing, web
    // fonts finishing, header height changing, etc.) can't leave the user
    // staring at an off-center/zoomed-in view with no way to know why.
    const interactedRef = useRef(false);

    const sel = PLOTS.find((p) => p.id === selected) || null;
    const selStatus: Status | undefined = sel ? statusMap[sel.id] : undefined;

    // FIX: paint via the SVG-native `transform` attribute instead of a CSS
    // `transform` on an element using `transform-box:fill-box`. fill-box
    // resolves the transform-origin against the group's full bounding box —
    // which here includes the huge background rect — so the effective
    // reference frame is less predictable across mobile browser engines.
    // The SVG attribute form is deterministic: it's always relative to the
    // SVG's own user-space origin, matching exactly what CONTENT_CENTER math
    // assumes.
    const paintNow = useCallback(() => {
        const c = camRef.current;
        if (camGroupRef.current) {
            camGroupRef.current.setAttribute(
                "transform",
                `translate(${c.tx} ${c.ty}) scale(${c.s}) translate(${CONTENT_CENTER.x} ${CONTENT_CENTER.y}) rotate(${c.rot}) translate(${-CONTENT_CENTER.x} ${-CONTENT_CENTER.y})`
            );
        }
        if (compassRef.current) compassRef.current.style.transform = `rotate(${-c.rot}deg)`;
    }, []);

    const frame = useCallback((now: number) => {
        let stillActive = false;
        if (animRef.current) {
            const { from, to, start, dur } = animRef.current;
            const t = Math.min(1, (now - start) / dur);
            const e = easeOutCubic(t);
            camRef.current = {
                s: from.s + (to.s - from.s) * e,
                tx: from.tx + (to.tx - from.tx) * e,
                ty: from.ty + (to.ty - from.ty) * e,
                rot: from.rot + (to.rot - from.rot) * e,
            };
            paintNow();
            if (t >= 1) { animRef.current = null; } else { stillActive = true; }
        } else if (pendingPaint.current) {
            paintNow();
            pendingPaint.current = false;
        }
        if (stillActive || pendingPaint.current) {
            requestAnimationFrame(frame);
        } else {
            loopRunning.current = false;
        }
    }, [paintNow]);

    const ensureLoop = useCallback(() => {
        if (!loopRunning.current) { loopRunning.current = true; requestAnimationFrame(frame); }
    }, [frame]);

    const setCameraImmediate = useCallback((c: Cam) => {
        animRef.current = null;
        camRef.current = c;
        pendingPaint.current = true;
        ensureLoop();
    }, [ensureLoop]);

    const animateTo = useCallback((to: Cam, dur = 220) => {
        animRef.current = { from: { ...camRef.current }, to, start: performance.now(), dur };
        ensureLoop();
    }, [ensureLoop]);

    const setFastMode = (on: boolean) => {
        const svg = svgRef.current;
        if (!svg) return;
        svg.classList.toggle("lm-fast", on);
    };
    const beginInteraction = () => {
        interactedRef.current = true;
        if (idleTimer.current) { window.clearTimeout(idleTimer.current); idleTimer.current = null; }
        setFastMode(true);
    };
    const scheduleIdleRestore = (delay = 140) => {
        if (idleTimer.current) window.clearTimeout(idleTimer.current);
        idleTimer.current = window.setTimeout(() => { setFastMode(false); idleTimer.current = null; }, delay);
    };

    const refreshStageRect = () => {
        const el = wrapRef.current; if (!el) return;
        const r = el.getBoundingClientRect();
        stageRectRef.current = { left: r.left, top: r.top, width: r.width, height: r.height };
    };

    // The scale that fits CONTENT_BOUNDS to ~92% of the current stage.
    const computeFitScale = () => {
        const r = stageRectRef.current;
        if (!r.width || !r.height) return 1;
        return Math.min((r.width * 0.92) / CONTENT_BOUNDS.w, (r.height * 0.92) / CONTENT_BOUNDS.h);
    };

    const sMin = () => fitScaleRef.current * 0.4;
    const sMax = () => fitScaleRef.current * 16;

    // clampPan works in terms of where the *content center* sits on screen.
    // At rot=0, screen(CONTENT_CENTER) = (tx + s*CONTENT_CENTER.x, ty + s*CONTENT_CENTER.y).
    // We clamp that screen position into range, then convert back to tx/ty.
    const clampPan = (c: Cam, elastic = false): Cam => {
        const r = stageRectRef.current;
        const contentW = CONTENT_BOUNDS.w * c.s;
        const contentH = CONTENT_BOUNDS.h * c.s;
        const slackX = r.width * 0.35, slackY = r.height * 0.35;

        const centerScreenX = c.tx + c.s * CONTENT_CENTER.x;
        const centerScreenY = c.ty + c.s * CONTENT_CENTER.y;

        const minX = -contentW / 2 - slackX, maxX = r.width + contentW / 2 + slackX;
        const minY = -contentH / 2 - slackY, maxY = r.height + contentH / 2 + slackY;
        const soft = (val: number, lo: number, hi: number) => {
            if (lo > hi) return (lo + hi) / 2;
            if (val < lo) return elastic ? lo - (lo - val) * 0.35 : lo;
            if (val > hi) return elastic ? hi + (val - hi) * 0.35 : hi;
            return val;
        };

        const clampedCenterX = soft(centerScreenX, minX, maxX);
        const clampedCenterY = soft(centerScreenY, minY, maxY);

        return {
            ...c,
            tx: clampedCenterX - c.s * CONTENT_CENTER.x,
            ty: clampedCenterY - c.s * CONTENT_CENTER.y,
        };
    };

    const zoomAt = (base: Cam, factor: number, cx: number, cy: number): Cam => {
        const ns = Math.min(sMax(), Math.max(sMin(), base.s * factor));
        const f = ns / base.s;
        return { s: ns, tx: cx - f * (cx - base.tx), ty: cy - f * (cy - base.ty), rot: base.rot };
    };

    const relPt = (clientX: number, clientY: number) => {
        const r = stageRectRef.current;
        return { x: clientX - r.left, y: clientY - r.top };
    };

    const settle = useCallback(() => {
        const c = clampPan({ ...camRef.current, s: Math.min(sMax(), Math.max(sMin(), camRef.current.s)) }, false);
        animateTo(c, 180);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animateTo]);

    // The default, centered camera: content center at stage center, at fitScale.
    // tx/ty are the screen position of SVG (0,0), so we back-solve them from
    // "content center should land at stage center":
    //   stageCenter = tx + s * CONTENT_CENTER  =>  tx = stageCenter - s * CONTENT_CENTER
    const computeFitCam = useCallback((): Cam => {
        const r = stageRectRef.current;
        if (!r.width || !r.height) return { s: 1, tx: 0, ty: 0, rot: 0 };
        const s = computeFitScale();
        return {
            s,
            tx: r.width / 2 - s * CONTENT_CENTER.x,
            ty: r.height / 2 - s * CONTENT_CENTER.y,
            rot: 0,
        };
    }, []);

    const fitToContent = useCallback((animated: boolean) => {
        const cam = computeFitCam();
        if (animated) animateTo(cam, 260); else setCameraImmediate(cam);
    }, [computeFitCam, animateTo, setCameraImmediate]);

    const onWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();
        refreshStageRect();
        beginInteraction();
        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 18;
        else if (e.deltaMode === 2) delta *= stageRectRef.current.height || 800;

        let factor = Math.exp(-delta * 0.0012);
        factor = Math.min(1.6, Math.max(1 / 1.6, factor));

        const p = relPt(e.clientX, e.clientY);
        const c = clampPan(zoomAt(camRef.current, factor, p.x, p.y), false);
        setCameraImmediate(c);
        scheduleIdleRestore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [setCameraImmediate]);

    const onPointerDown = (e: React.PointerEvent) => {
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        refreshStageRect();
        beginInteraction();
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointers.current.size === 1) {
            dragState.current = { px: e.clientX, py: e.clientY, tx: camRef.current.tx, ty: camRef.current.ty };
            pinchState.current = null;
        } else if (pointers.current.size === 2) {
            dragState.current = null;
            const pts = Array.from(pointers.current.values());
            const d = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            const ang = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x) * 180 / Math.PI;
            const p = relPt((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
            pinchState.current = { d, ang, cx: p.x, cy: p.y };
        }
    };

    const onPointerMove = (e: React.PointerEvent) => {
        if (!pointers.current.has(e.pointerId)) return;
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointers.current.size >= 2 && pinchState.current) {
            e.preventDefault();
            const pts = Array.from(pointers.current.values()).slice(0, 2);
            const nd = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            const na = Math.atan2(pts[1].y - pts[0].y, pts[1].x - pts[0].x) * 180 / Math.PI;
            const p = relPt((pts[0].x + pts[1].x) / 2, (pts[0].y + pts[1].y) / 2);
            const g = pinchState.current;
            let c = zoomAt(camRef.current, nd / g.d, p.x, p.y);
            c = clampPan({ ...c, tx: c.tx + (p.x - g.cx), ty: c.ty + (p.y - g.cy), rot: c.rot + (na - g.ang) }, true);
            setCameraImmediate(c);
            pinchState.current = { d: nd, ang: na, cx: p.x, cy: p.y };
        } else if (pointers.current.size === 1 && dragState.current) {
            e.preventDefault();
            const d = dragState.current;
            const c = clampPan({ ...camRef.current, tx: d.tx + (e.clientX - d.px), ty: d.ty + (e.clientY - d.py) }, true);
            setCameraImmediate(c);
        }
    };

    const endPointer = (e: React.PointerEvent) => {
        pointers.current.delete(e.pointerId);
        if (pointers.current.size === 0) {
            dragState.current = null;
            pinchState.current = null;
            settle();
            scheduleIdleRestore(0);
        } else if (pointers.current.size === 1) {
            pinchState.current = null;
            const [[, pt]] = Array.from(pointers.current.entries());
            dragState.current = { px: pt.x, py: pt.y, tx: camRef.current.tx, ty: camRef.current.ty };
        }
    };

    const reset = () => { fitToContent(true); };
    const btnZoom = (f: number) => {
        const r = stageRectRef.current;
        const c = clampPan(zoomAt(camRef.current, f, r.width / 2, r.height / 2), false);
        animateTo(c, 180);
    };
    const rotate = () => { animateTo({ ...camRef.current, rot: camRef.current.rot + 45 }, 220); };

    // ---- Mount / resize wiring: viewBox always matches the stage, camera always re-fits ----
    //
    // Uses useLayoutEffect (not useEffect) so this measure-and-paint pass runs
    // *before* the browser's first paint — the user should never see a frame
    // where the camera hasn't been fitted yet.
    //
    // FIX: a 0×0 (or otherwise invalid) stage rect is NOT treated as a
    // successful fit anymore. Previously `hasFitRef.current` was set to
    // `true` unconditionally on the very first pass, so if that pass happened
    // to read a zero-size rect (parent not laid out yet, mobile browser still
    // resolving the real viewport height, etc.) the code considered the map
    // "fitted" against the degenerate `{s:1,tx:0,ty:0}` camera. Now, on an
    // invalid rect, we simply retry on the next animation frame without
    // marking anything as fitted — and `mapCameraReady` (which gates the
    // splash) is only set once a REAL fit has been computed and painted.
    //
    // On top of that, until the user actually interacts with the map we keep
    // re-measuring and re-fitting on a short burst of follow-up passes (two
    // animation frames + a couple of short timeouts). This is deliberately
    // defensive: on real devices the stage's measured size can still change
    // shortly after mount for reasons outside our control — the mobile
    // browser's address bar collapsing/expanding, a web font swapping in and
    // changing header height, etc. Once `interactedRef` flips true (real
    // touch/drag/zoom), we stop overriding the user's own view.
    useLayoutEffect(() => {
        const el = wrapRef.current; if (!el) return;
        let cancelled = false;
        let pendingRetryRaf = 0;

        const recalc = (animated: boolean) => {
            if (cancelled) return;
            refreshStageRect();
            const r = stageRectRef.current;

            // A 0×0 (or negative/NaN) stage is not a valid state to fit against.
            // Retry next frame instead of locking in a degenerate camera and
            // marking the fit as "done".
            if (!r.width || !r.height) {
                pendingRetryRaf = requestAnimationFrame(() => recalc(false));
                return;
            }

            setVb({ w: r.width, h: r.height });
            // Set the viewBox on the real DOM node synchronously, right now —
            // not just via React state. The camera transform we're about to
            // compute/paint below is expressed in real stage px, and that only
            // means what we intend if the <svg viewBox> already matches the
            // stage's real size at the moment we paint.
            svgRef.current?.setAttribute("viewBox", `0 0 ${r.width} ${r.height}`);

            fitScaleRef.current = computeFitScale();

            if (!hasFitRef.current) {
                hasFitRef.current = true;
                fitToContent(false);
                // Only now — after a fit against a real, non-zero stage rect has
                // actually been computed and applied — is it safe to reveal the map.
                setMapCameraReady(true);
            } else if (!interactedRef.current) {
                fitToContent(animated);
            }
            paintNow();
        };

        recalc(false);
        el.addEventListener("wheel", onWheel, { passive: false });

        // Post-reveal auto-corrections ease in (no visible jump). Pre-reveal
        // passes stay immediate since `hasFitRef.current` gates that.
        const ro = new ResizeObserver(() => recalc(hasFitRef.current));
        ro.observe(el);

        const onWinResize = () => recalc(hasFitRef.current);
        window.addEventListener("resize", onWinResize);
        window.visualViewport?.addEventListener("resize", onWinResize);
        window.addEventListener("orientationchange", onWinResize);

        // Defensive follow-up passes: catch any layout settling that happens in
        // the first moment after mount, without fighting the user once they've
        // taken control of the camera themselves.
        const raf1 = requestAnimationFrame(() => {
            if (!interactedRef.current) recalc(false);
        });
        const t1 = window.setTimeout(() => { if (!interactedRef.current) recalc(false); }, 150);
        const t2 = window.setTimeout(() => { if (!interactedRef.current) recalc(false); }, 500);
        const t3 = window.setTimeout(() => { if (!interactedRef.current) recalc(false); }, 1200);

        return () => {
            cancelled = true;
            el.removeEventListener("wheel", onWheel);
            ro.disconnect();
            window.removeEventListener("resize", onWinResize);
            window.visualViewport?.removeEventListener("resize", onWinResize);
            window.removeEventListener("orientationchange", onWinResize);
            if (idleTimer.current) window.clearTimeout(idleTimer.current);
            cancelAnimationFrame(raf1);
            if (pendingRetryRaf) cancelAnimationFrame(pendingRetryRaf);
            window.clearTimeout(t1);
            window.clearTimeout(t2);
            window.clearTimeout(t3);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onWheel, paintNow, fitToContent]);

    // Safety net: if `vb` ever changes through a path that didn't also touch
    // the DOM viewBox directly, repaint once it lands so the transform is
    // never left stale relative to the viewBox actually on screen.
    useEffect(() => {
        paintNow();
    }, [vb.w, vb.h, paintNow]);

    return (
        <div className={`lm-root ${night ? "is-night" : ""}`}>
            <style>{css}</style>

            {(!ready || !mapCameraReady) && (
                <div className="lm-splash">
                    <div className="lm-splash-inner">
                        <div className="lm-splash-logo" aria-hidden="true">
                            <svg viewBox="0 0 40 40" width="56" height="56">
                                <path d="M20 3 L34 9 V21 C34 30 27 35 20 37 C13 35 6 30 6 21 V9 Z" fill="none" stroke="#d4ab54" strokeWidth="1.6" />
                                <rect x="14" y="16" width="5" height="12" fill="#d4ab54" /><rect x="21" y="13" width="5" height="15" fill="#d4ab54" />
                            </svg>
                        </div>
                        <div className="lm-splash-name">Basava Ganguru</div>
                        <div className="lm-splash-sub">VIJAYALAXMI C PATIL · SHIVAMOGGA</div>
                        <div className="lm-splash-tag">Residential Layout · 32 Plots</div>
                        <div className="lm-splash-bar"><span style={{ width: `${Math.min(100, loadPct)}%` }} /></div>
                        <div className="lm-splash-loading">{loadPct >= 100 ? "Ready" : "Loading master plan…"}</div>
                    </div>
                    <div className="lm-splash-credit">Built by Train IQ · trainiq.in</div>
                </div>
            )}

            <header className="lm-head">
                <div className="lm-brand">
                    <div className="lm-logo" aria-hidden="true">
                        <svg viewBox="0 0 40 40" width="28" height="28">
                            <path d="M20 3 L34 9 V21 C34 30 27 35 20 37 C13 35 6 30 6 21 V9 Z" fill="none" stroke="#d4ab54" strokeWidth="1.6" />
                            <rect x="14" y="16" width="5" height="12" fill="#d4ab54" /><rect x="21" y="13" width="5" height="15" fill="#d4ab54" />
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

            <div
                className="lm-stage"
                ref={wrapRef}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endPointer}
                onPointerCancel={endPointer}
                onPointerLeave={(e) => { if (pointers.current.has(e.pointerId)) endPointer(e); }}
            >
                <svg ref={svgRef} viewBox={`0 0 ${vb.w} ${vb.h}`} className="lm-svg">
                    <defs>
                        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" stopColor="#f6e6b0" /><stop offset="1" stopColor="#a9822f" />
                        </linearGradient>

                        {/* Reusable landscaping symbols — authored once, instanced many
                times via <use>. Canopy fills reference CSS custom properties
                (--tc1 dark / --tc2 mid / --tc3 light) so each instance can
                take a different palette combination without duplicating any
                geometry. v3: bigger, bolder, fewer/larger overlapping blobs
                per tree so each instance reads clearly as a tree at normal
                map zoom instead of shrinking into a dot. */}

                        {/* Tree A — round, compact canopy */}
                        <g id="tA">
                            <rect x="-0.8" y="-1" width="1.6" height="5" fill="#5a4326" />
                            <ellipse cx="0" cy="-9" rx="6.2" ry="5.4" fill="var(--tc1)" />
                            <ellipse cx="-3.6" cy="-7" rx="4.6" ry="4" fill="var(--tc2)" />
                            <ellipse cx="3.6" cy="-7.4" rx="4.9" ry="4.2" fill="var(--tc2)" />
                            <ellipse cx="0" cy="-13" rx="4.2" ry="3.6" fill="var(--tc3)" />
                        </g>

                        {/* Tree B — wider, fuller canopy */}
                        <g id="tB">
                            <rect x="-0.8" y="-1" width="1.6" height="4.6" fill="#5a4326" />
                            <ellipse cx="-4.8" cy="-7.4" rx="5.4" ry="4.4" fill="var(--tc1)" transform="rotate(-8 -4.8 -7.4)" />
                            <ellipse cx="4.8" cy="-7.2" rx="5.7" ry="4.5" fill="var(--tc1)" transform="rotate(8 4.8 -7.2)" />
                            <ellipse cx="0" cy="-9" rx="6.2" ry="4.6" fill="var(--tc2)" />
                            <ellipse cx="0" cy="-12" rx="4" ry="3.2" fill="var(--tc3)" />
                        </g>

                        {/* Tree C — layered/tiered canopy */}
                        <g id="tC">
                            <rect x="-0.7" y="-1" width="1.4" height="5.6" fill="#5a4326" />
                            <ellipse cx="0" cy="-6" rx="5.9" ry="3" fill="var(--tc1)" />
                            <ellipse cx="0" cy="-9.4" rx="4.6" ry="2.7" fill="var(--tc2)" />
                            <ellipse cx="0" cy="-12.4" rx="3.1" ry="2.3" fill="var(--tc3)" />
                        </g>

                        {/* Tree D — taller, narrower canopy */}
                        <g id="tD">
                            <rect x="-0.7" y="-1" width="1.4" height="6.6" fill="#5a4326" />
                            <ellipse cx="-1.6" cy="-9.4" rx="3.2" ry="5.6" fill="var(--tc1)" />
                            <ellipse cx="1.8" cy="-10" rx="3.4" ry="6" fill="var(--tc2)" />
                            <ellipse cx="0" cy="-14.8" rx="2.7" ry="3.5" fill="var(--tc3)" />
                        </g>

                        {/* Tree E — small ornamental tree, subtle blossom highlights */}
                        <g id="tE">
                            <rect x="-0.7" y="-1" width="1.4" height="4.4" fill="#5a4326" />
                            <ellipse cx="0" cy="-7.6" rx="4.9" ry="4.2" fill="var(--tc1)" />
                            <ellipse cx="-2.8" cy="-6.2" rx="3.2" ry="2.8" fill="var(--tc2)" />
                            <ellipse cx="2.8" cy="-6.1" rx="3.2" ry="2.8" fill="var(--tc2)" />
                            <circle cx="-1.6" cy="-8.6" r="0.95" fill="var(--tc3)" opacity="0.9" />
                            <circle cx="2.1" cy="-7.8" r="0.85" fill="var(--tc3)" opacity="0.9" />
                        </g>

                        {/* Tree F — low bush/tree hybrid, no visible trunk */}
                        <g id="tF">
                            <ellipse cx="-3.2" cy="-2.2" rx="4" ry="3" fill="var(--tc1)" />
                            <ellipse cx="3.2" cy="-2" rx="4" ry="3" fill="var(--tc1)" />
                            <ellipse cx="0" cy="-3.6" rx="4.6" ry="3.3" fill="var(--tc2)" />
                            <ellipse cx="0" cy="-4.9" rx="2.7" ry="1.9" fill="var(--tc3)" opacity="0.85" />
                        </g>

                        {/* Bush A / B — low layer-2 greenery, no trunk */}
                        <g id="bA">
                            <ellipse cx="-2.4" cy="0.3" rx="2.8" ry="2" fill="var(--tc1)" />
                            <ellipse cx="2.4" cy="0.3" rx="2.8" ry="2" fill="var(--tc1)" />
                            <ellipse cx="0" cy="-0.8" rx="3.1" ry="2.3" fill="var(--tc2)" />
                        </g>
                        <g id="bB">
                            <ellipse cx="0" cy="0" rx="3.5" ry="2.4" fill="var(--tc1)" />
                            <ellipse cx="-1.6" cy="-1.1" rx="2" ry="1.6" fill="var(--tc2)" />
                            <ellipse cx="1.6" cy="-1.2" rx="1.9" ry="1.5" fill="var(--tc3)" opacity="0.9" />
                        </g>

                        {/* Flower cluster — occasional ornamental accent near KARAB */}
                        <g id="fC">
                            <ellipse cx="0" cy="0" rx="2.9" ry="2.1" fill="var(--tc1)" />
                            <circle cx="-1.2" cy="-0.7" r="0.7" fill="#e7a7c0" />
                            <circle cx="0.5" cy="-1.2" r="0.65" fill="#f0c33e" />
                            <circle cx="1.3" cy="-0.4" r="0.65" fill="#e7a7c0" />
                        </g>
                    </defs>

                    <g ref={camGroupRef} className="lm-camera">
                        <rect x={BASE_VB.x - 900} y={BASE_VB.y - 900} width={BASE_VB.w + 1800} height={BASE_VB.h + 1800} fill="#8a794e" />

                        <g pointerEvents="none">
                            <rect x="300" y="-120" width="42" height="304" fill="#3a342a" />
                            <rect x="560" y="-120" width="46" height="304" fill="#3a342a" />
                            <rect x="820" y="-120" width="42" height="304" fill="#3a342a" />
                            <rect x="1108" y="184" width="60" height="900" fill="#3a342a" />
                            <rect x="-40" y="470" width="158" height="58" fill="#3a342a" />
                            <rect x="502" y="948" width="58" height="360" fill="#3a342a" />
                            <rect x="786" y="948" width="72" height="360" fill="#3a342a" />
                            <rect x="112" y="180" width="1002" height="774" rx="4" fill="none" stroke="#6b5c3f" strokeWidth="3" strokeDasharray="2 6" opacity="0.4" />
                        </g>

                        <g>
                            <polygon points={ROADS.top} fill="#40392d" />
                            <rect x={ROADS.leftV.x} y={ROADS.leftV.y} width={ROADS.leftV.w} height={ROADS.leftV.h} fill="#40392d" />
                            <rect x={ROADS.rightV.x} y={ROADS.rightV.y} width={ROADS.rightV.w} height={ROADS.rightV.h} fill="#40392d" />
                            <rect x={ROADS.midH.x} y={ROADS.midH.y} width={ROADS.midH.w} height={ROADS.midH.h} fill="#40392d" />
                            <rect x={ROADS.path.x} y={ROADS.path.y} width={ROADS.path.w} height={ROADS.path.h} fill="#7d7454" opacity="0.95" />

                            <g className="lm-lane" pointerEvents="none">
                                <line x1="531" y1="270" x2="531" y2="944" />
                                <line x1="822" y1="270" x2="822" y2="944" />
                                <line x1="122" y1="499" x2="500" y2="499" />
                                <line x1="118" y1="223" x2="1108" y2="223" />
                            </g>

                            <g pointerEvents="none">
                                <text x="600" y="216" className="lm-road-lbl lm-road-lbl-lg">APPROVED LAYOUT 12m ROAD</text>
                                <text x="531" y="620" className="lm-road-lbl" transform="rotate(-90 531 620)">9m ROAD</text>
                                <text x="822" y="620" className="lm-road-lbl" transform="rotate(-90 822 620)">9m ROAD</text>
                                <text x="300" y="504" className="lm-road-lbl">9m ROAD</text>
                                <text x="300" y="666" className="lm-road-lbl lm-road-lbl-sm">3m PATHWAY</text>
                            </g>

                            <polygon points={KARAB} fill="#77a648" />
                            <ellipse cx={KARAB_LAKE.cx} cy={KARAB_LAKE.cy} rx={KARAB_LAKE.rx} ry={KARAB_LAKE.ry} fill="#5fada6" />
                            <text x="300" y="835" className="lm-amen-label">KARAB</text>

                            <polygon points={CA} fill="#8fbe5a" />
                            <text x={centroid(CA).x} y={centroid(CA).y - 6} className="lm-ca-label">CA</text>
                            <text x={centroid(CA).x} y={centroid(CA).y + 40} className="lm-ca-sub">CIVIC AMENITY</text>

                            <polygon points={STP} fill="#e4d7f4" stroke="#9670c2" strokeWidth="1.4" strokeDasharray="4 3" />
                            <text x={centroid(STP).x} y={centroid(STP).y + 6} className="lm-stp-label">STP</text>

                            {PLOTS.map((p) => {
                                const c = centroid(p.pts);
                                const isSel = p.id === selected;
                                const st = statusMap[p.id];
                                const effective: Status = st || "available";
                                const shown: Status = filter === "all" ? "available" : effective;
                                const meta = STATUS_META[shown];
                                const dimmed = filter !== "all" && effective !== filter;
                                return (
                                    <g key={p.id} className="lm-plot" onClick={(e) => { e.stopPropagation(); setSelected(p.id); }}
                                        role="button" tabIndex={0}
                                        style={{ opacity: dimmed ? 0.25 : 1, transition: "opacity .25s ease" }}
                                        onKeyDown={(e: React.KeyboardEvent) => (e.key === "Enter" || e.key === " ") && setSelected(p.id)}>
                                        <polygon points={p.pts} className="lm-plot-shape"
                                            fill={isSel ? meta.sel : meta.fill}
                                            stroke={isSel ? "#fff" : "url(#gold)"} strokeWidth={isSel ? 2.4 : 1.2} />
                                        <text x={c.x} y={c.y + 5} className="lm-plot-num">{p.id}</text>
                                    </g>
                                );
                            })}

                            <g>
                                {BUSHES.map((d, i) => <DecoUse key={`b${i}`} d={d} />)}
                                {TREES.map((d, i) => <DecoUse key={`t${i}`} d={d} />)}
                                {FLOWERS.map((d, i) => <DecoUse key={`f${i}`} d={d} />)}
                            </g>

                            {night && <rect x={BASE_VB.x - 900} y={BASE_VB.y - 900} width={BASE_VB.w + 1800} height={BASE_VB.h + 1800} fill="#0a1424" opacity="0.72" pointerEvents="none" />}

                            {STREET_LIGHT_POS.map(([x, y], i) => <StreetLight key={i} x={x} y={y} night={night} />)}
                        </g>
                    </g>

                    <g transform="translate(1120,250)" ref={compassRef}>
                        <circle r="20" fill="rgba(20,24,16,.72)" stroke="url(#gold)" strokeWidth="1.6" />
                        <path d="M0,-13 L4.5,3 L0,-1 L-4.5,3 Z" fill="#e0504a" />
                        <path d="M0,13 L4.5,-3 L0,1 L-4.5,-3 Z" fill="#6a7256" />
                        <text y="-24" textAnchor="middle" fill="#e7cd85" fontSize="12" fontWeight="800">N</text>
                    </g>
                </svg>

                <div className="lm-actionrow">
                    <div className="lm-filterwrap">
                        <button
                            className={`lm-actbtn lm-filterbtn lm-fchip-${filter}`}
                            onClick={() => setFilterOpen((v) => !v)}
                            aria-label="Filter plots"
                        >
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#d4ab54" strokeWidth="2">
                                <path d="M4 5h16M7 12h10M10 19h4" strokeLinecap="round" />
                            </svg>
                            <span className="lm-actbtn-txt">{filter === "all" ? "All" : STATUS_META[filter].label}</span>
                        </button>
                    </div>

                    <a className="lm-actbtn" href="https://goo.gl/maps/JarvnMRnW7U7fYBp6?g_st=aw" target="_blank" rel="noopener noreferrer" aria-label="Open in Google Maps">
                        <svg viewBox="0 0 24 24" width="22" height="22">
                            <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7z" fill="#ea4335" />
                            <circle cx="12" cy="9" r="2.6" fill="#fff" />
                        </svg>
                        <span className="lm-actbtn-txt">Maps</span>
                    </a>

                    <button className="lm-actbtn" onClick={() => setPhotosOpen(true)} aria-label="Photos">
                        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#d4ab54" strokeWidth="2">
                            <rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" fill="#d4ab54" stroke="none" /><path d="M4 17l5-5 4 4 3-3 4 4" />
                        </svg>
                        <span className="lm-actbtn-txt">Photos</span>
                    </button>
                </div>

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

                {photosOpen && (
                    <div className="lm-photos-overlay" onClick={() => setPhotosOpen(false)}>
                        <div className="lm-photos-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="lm-photos-head">
                                <span>Project Gallery</span>
                                <button className="lm-close" onClick={() => setPhotosOpen(false)} aria-label="Close">
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

                <div className="lm-ctrl">
                    <button onClick={() => btnZoom(1.25)} aria-label="Zoom in"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg></button>
                    <button onClick={() => btnZoom(0.8)} aria-label="Zoom out"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M5 12h14" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg></button>
                    <button onClick={rotate} aria-label="Rotate"><svg viewBox="0 0 24 24" width="19" height="19"><path d="M4 9a8 8 0 1 1-.8 4" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" /><path d="M4 4v5h5" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                    <button onClick={reset} aria-label="Center map"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" fill="none" /></svg></button>
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
                        <svg viewBox="0 0 62 34" width="42" height="23" aria-hidden="true">
                            <rect x="4" y="6" width="5.4" height="22" rx="1" fill="#14243c" />
                            <path d="M32 6.4 a11 11 0 1 0 6.4 19.9 l4.2 4.2 3.8-3.8 -4.1-4.1 A11 11 0 0 0 32 6.4 Z M32 11.4 a6 6 0 1 1 0 12 a6 6 0 0 1 0-12 Z" fill="#14243c" />
                            <rect x="50" y="22.5" width="5.6" height="5.6" rx="1" fill="#14243c" />
                        </svg>
                    </button>
                </div>
            </div>

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

            {!sel && ready && mapCameraReady && <div className="lm-hint">Tap a plot · pinch to zoom · twist to rotate</div>}
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
  position:fixed; top:0; left:0; right:0; bottom:0; width:100%; height:100%;
  background:#1c2317;
  color:var(--txt); font-family:'Inter',system-ui,-apple-system,sans-serif;
  overflow:hidden; overscroll-behavior:none; touch-action:none;
}

.lm-head{ position:absolute; top:0; left:0; right:0; z-index:6;
  display:flex; align-items:center; gap:14px; flex-wrap:wrap;
  padding:calc(env(safe-area-inset-top,0px) + 12px) 16px 12px;
  background:linear-gradient(180deg,rgba(8,11,7,.9),rgba(8,11,7,.5) 70%,transparent);
  backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px); }
.lm-brand{ display:flex; align-items:center; gap:11px; }
.lm-logo{ display:flex; }
.lm-brand-name{ font-family:'Playfair Display',Georgia,serif; font-weight:800; font-size:21px; line-height:1; color:var(--gold-lt); letter-spacing:-.01em; }
.lm-brand-sub{ font-size:10px; color:var(--muted); letter-spacing:.1em; text-transform:uppercase; margin-top:3px; }

.lm-search{ flex:1; min-width:160px; position:relative; }
.lm-search input{ width:100%; box-sizing:border-box; background:var(--glass);
  border:1px solid var(--line); border-radius:999px; padding:11px 16px; color:var(--txt); font-size:13px; outline:none; }
.lm-search input:focus{ border-color:var(--gold); }
.lm-search input::placeholder{ color:#8b9280; }

.lm-stage{ position:absolute; top:0; left:0; right:0; bottom:0; touch-action:none; user-select:none; cursor:grab;
  overflow:hidden; background:#6b5c32; contain:layout size; }
.lm-stage:active{ cursor:grabbing; }
.lm-svg{ display:block; width:100%; height:100%; }
.lm-camera{ }

.lm-filterwrap{ position:relative; }
.lm-actbtn.lm-filterbtn.lm-fchip-available{ border-color:#5fa538; }
.lm-actbtn.lm-filterbtn.lm-fchip-reserved{ border-color:#f5b942; }
.lm-actbtn.lm-filterbtn.lm-fchip-sold{ border-color:#e0504a; }
.lm-filterbackdrop{ position:absolute; inset:0; z-index:15; }
.lm-filtermenu-head{ display:flex; align-items:center; justify-content:space-between; padding:6px 8px 8px 12px; margin-bottom:2px; border-bottom:1px solid rgba(212,171,84,.16); font-size:13px; font-weight:700; color:var(--gold-lt); font-family:'Playfair Display',serif; }
.lm-menu-close{ width:30px; height:30px; border-radius:9px; border:1px solid var(--line); background:transparent; color:var(--muted); display:flex; align-items:center; justify-content:center; cursor:pointer; }
.lm-filtermenu{ position:absolute; left:50%;
  bottom:calc(env(safe-area-inset-bottom,0px) + 92px); z-index:17;
  background:rgba(18,22,16,.97); border:1px solid var(--line); border-radius:16px; padding:6px;
  display:flex; flex-direction:column; gap:2px; min-width:200px;
  transform:translateX(-50%); }
.lm-filteritem{ display:flex; align-items:center; gap:10px; background:transparent; border:none; color:var(--txt); font-size:13px; font-weight:600; padding:11px 14px; border-radius:11px; cursor:pointer; text-align:left; white-space:nowrap; }
.lm-filteritem:hover{ background:rgba(212,171,84,.1); }
.lm-filteritem.active{ background:rgba(212,171,84,.16); }
.lm-filteritem-dot{ width:11px; height:11px; border-radius:50%; background:#568636; }
.lm-filteritem-dot.lm-fchip-all{ background:#8b93a4; }
.lm-filteritem-dot.lm-fchip-available{ background:#568636; }
.lm-filteritem-dot.lm-fchip-reserved{ background:#f5b942; }
.lm-filteritem-dot.lm-fchip-sold{ background:#e0504a; }

.lm-tiq-wrap{ position:absolute; right:calc(env(safe-area-inset-right,0px) + 16px);
  bottom:calc(env(safe-area-inset-bottom,0px) + 20px); z-index:40; display:flex; flex-direction:column-reverse; align-items:flex-end; gap:10px; }
.lm-tiq-logo{ display:flex; align-items:center; justify-content:center; cursor:pointer;
  background:rgba(244,246,240,.94); border:1px solid rgba(20,32,54,.14); border-radius:12px; padding:6px 10px; }
.lm-tiq-pop{ text-decoration:none; background:rgba(20,36,60,.96); color:#fff; border-radius:12px;
  padding:9px 14px; white-space:nowrap; }
.lm-tiq-pop-title{ font-size:12px; font-weight:700; }
.lm-tiq-pop-sub{ font-size:11px; color:#a9c4e6; margin-top:1px; }

.lm-lane line{ stroke:#f4e6b0; stroke-width:2.4; stroke-dasharray:12 16; opacity:.55; stroke-linecap:round; }
.lm-road-lbl{ fill:#e8dcb8; font-size:12px; font-weight:600; letter-spacing:.16em; text-anchor:middle; opacity:.85; }
.lm-road-lbl-lg{ font-size:15px; font-weight:700; letter-spacing:.2em; fill:#f4e6b0; }
.lm-road-lbl-sm{ font-size:9.5px; letter-spacing:.12em; }

.lm-splash{ position:absolute; inset:0; z-index:100; display:flex; flex-direction:column;
  align-items:center; justify-content:center;
  background:#151b10; }
.lm-splash-inner{ display:flex; flex-direction:column; align-items:center; text-align:center; }
.lm-splash-logo{ margin-bottom:18px; }
.lm-splash-name{ font-family:'Playfair Display',serif; font-weight:800; font-size:30px; line-height:1; color:var(--gold-lt); }
.lm-splash-sub{ margin-top:10px; font-size:11px; letter-spacing:.24em; color:#b9c2a8; }
.lm-splash-tag{ margin-top:6px; font-size:12px; color:#8b9280; letter-spacing:.08em; }
.lm-splash-bar{ margin-top:26px; width:180px; height:3px; border-radius:99px; background:rgba(212,171,84,.18); overflow:hidden; }
.lm-splash-bar span{ display:block; height:100%; border-radius:99px; background:#d4ab54; transition:width .25s ease; }
.lm-splash-loading{ margin-top:14px; font-size:11px; letter-spacing:.14em; color:#8b9280; text-transform:uppercase; }
.lm-splash-credit{ position:absolute; bottom:calc(env(safe-area-inset-bottom,0px) + 22px);
  font-size:10px; letter-spacing:.1em; color:#6b7358; }

.lm-plot{ cursor:pointer; }
.lm-plot-shape{ transition:filter .18s ease; }
.lm-plot:hover .lm-plot-shape{ filter:brightness(1.08); }
.lm-plot:focus{ outline:none; }
.lm-plot:focus-visible .lm-plot-shape{ stroke:#fff; stroke-width:2.6; }
.lm-plot-num{ fill:#ffffff; font-size:15px; font-weight:800; text-anchor:middle; pointer-events:none;
  paint-order:stroke; stroke:rgba(0,0,0,.4); stroke-width:2.2px; stroke-linejoin:round; }
.lm-amen-label{ fill:#2c4a1a; font-size:20px; font-weight:800; text-anchor:middle; letter-spacing:.16em; font-family:'Playfair Display',serif; }
.lm-ca-label{ fill:#234017; font-size:26px; font-weight:900; text-anchor:middle; font-family:'Playfair Display',serif; }
.lm-ca-sub{ fill:#2c4a1a; font-size:8px; font-weight:700; text-anchor:middle; letter-spacing:.14em; opacity:.85; }
.lm-stp-label{ fill:#3a2358; font-size:12px; font-weight:800; text-anchor:middle; }

.lm-actionrow{ position:absolute; left:50%; transform:translateX(-50%);
  bottom:calc(env(safe-area-inset-bottom,0px) + 20px); z-index:16;
  display:flex; gap:10px; align-items:flex-end; }
.lm-actbtn{ text-decoration:none; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:3px;
  width:64px; height:60px; border-radius:16px; cursor:pointer;
  border:1px solid var(--line); background:var(--glass); color:var(--txt); }
.lm-actbtn:hover{ background:rgba(212,171,84,.12); }
.lm-actbtn:active{ transform:scale(.95); }
.lm-actbtn-txt{ font-size:9px; font-weight:700; letter-spacing:.04em; text-transform:uppercase; opacity:.9; }

.lm-photos-overlay{ position:absolute; inset:0; z-index:30; display:flex; align-items:center; justify-content:center; background:rgba(6,9,6,.6); }
.lm-photos-modal{ width:min(88vw,460px); background:#151d0f; border:1px solid var(--line); border-radius:20px; padding:16px 18px 22px; }
.lm-photos-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; font-size:15px; font-weight:700; font-family:'Playfair Display',serif; color:var(--gold-lt); }
.lm-photos-empty{ display:flex; flex-direction:column; align-items:center; gap:12px; padding:36px 0; color:var(--muted); font-size:13px; }
.lm-photos-grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; max-height:60vh; overflow-y:auto; padding:2px; }
.lm-photo-cell{ position:relative; aspect-ratio:1; border:none; border-radius:12px; overflow:hidden; cursor:pointer; background:#000; padding:0; }
.lm-photo-cell img, .lm-photo-cell video{ width:100%; height:100%; object-fit:cover; display:block; }
.lm-photo-play{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.28); }
.lm-lightbox{ position:absolute; inset:0; z-index:120; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,.92); }
.lm-lightbox-inner{ max-width:92vw; max-height:82vh; display:flex; flex-direction:column; align-items:center; gap:12px; }
.lm-lightbox-media{ max-width:92vw; max-height:76vh; border-radius:12px; object-fit:contain; }
.lm-lightbox-cap{ color:#f3f6ee; font-size:14px; text-align:center; max-width:80vw; }
.lm-lightbox-close{ position:absolute; top:calc(env(safe-area-inset-top,0px) + 16px); right:16px; z-index:2;
  width:42px; height:42px; border-radius:12px; border:1px solid var(--line); background:rgba(20,24,16,.7); color:#fff;
  display:flex; align-items:center; justify-content:center; cursor:pointer; }
.lm-lightbox-nav{ position:absolute; top:50%; transform:translateY(-50%); width:46px; height:46px; border-radius:50%;
  border:1px solid var(--line); background:rgba(20,24,16,.7); color:#fff; display:flex; align-items:center; justify-content:center; cursor:pointer; }
.lm-lightbox-nav.lm-prev{ left:12px; }
.lm-lightbox-nav.lm-next{ right:12px; }

.lm-ctrl{ position:absolute; right:calc(env(safe-area-inset-right,0px) + 14px);
  bottom:calc(env(safe-area-inset-bottom,0px) + 92px); z-index:8;
  display:flex; flex-direction:column; gap:1px; border-radius:16px; overflow:hidden;
  border:1px solid var(--line); background:var(--glass); }
.lm-ctrl button{ width:48px; height:48px; border:none; background:transparent; color:var(--gold);
  display:flex; align-items:center; justify-content:center; cursor:pointer;
  border-bottom:1px solid rgba(212,171,84,.14); }
.lm-ctrl button:last-child{ border-bottom:none; }
.lm-ctrl button.lm-ctrl-on{ background:#1a2338; color:#ffd76a; }
.lm-ctrl button:hover{ background:rgba(212,171,84,.1); }
.lm-ctrl button:active{ background:rgba(212,171,84,.2); }

.lm-hint{ position:absolute; bottom:calc(env(safe-area-inset-bottom,0px) + 74px); left:50%; transform:translateX(-50%);
  z-index:7; background:var(--glass); border:1px solid var(--line); color:var(--txt); font-size:12px;
  padding:9px 18px; border-radius:999px; white-space:nowrap; pointer-events:none;
  animation:fade 6s ease forwards; }
@keyframes fade{ 0%,70%{opacity:1;} 100%{opacity:0;} }

.lm-panel{ position:absolute; left:0; right:0; bottom:0; z-index:20;
  background:#121810; border-top:1px solid var(--line); border-radius:24px 24px 0 0;
  padding:8px 20px calc(env(safe-area-inset-bottom,0px) + 22px);
  transform:translateY(120%); transition:transform .35s ease; }
.lm-panel.open{ transform:translateY(0); }
.lm-panel::before{ content:""; display:block; width:44px; height:5px; border-radius:99px;
  background:rgba(212,171,84,.4); margin:2px auto 14px; }
.lm-panel-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
.lm-panel-kicker{ font-size:10px; letter-spacing:.22em; text-transform:uppercase; color:var(--gold); font-weight:600; }
.lm-panel-title{ font-size:30px; font-weight:800; font-family:'Playfair Display',serif; line-height:1; margin-top:2px; color:var(--gold-lt); }
.lm-close{ width:38px; height:38px; border-radius:12px; border:1px solid var(--line); background:transparent; color:var(--muted);
  display:flex; align-items:center; justify-content:center; cursor:pointer; }
.lm-diagram{ display:flex; justify-content:center; margin:6px 0 18px; }
.lm-dimbox{ position:relative; width:190px; height:110px; margin:22px 30px; }
.lm-dimbox-inner{ position:absolute; inset:0; border:2px solid var(--gold); border-radius:8px;
  background:rgba(212,171,84,.07);
  display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }
.lm-dim-facing{ color:var(--gold-lt); font-weight:800; font-size:15px; }
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

.lm-status-badge{ font-size:12.5px; font-weight:800; padding:5px 14px; border-radius:999px; border:1px solid transparent; }
.lm-status-available{ background:rgba(86,134,54,.18); color:#8fd257; border-color:rgba(86,134,54,.5); }
.lm-status-reserved{ background:rgba(245,185,66,.16); color:#ffcf72; border-color:rgba(245,185,66,.5); }
.lm-status-sold{ background:rgba(224,80,74,.16); color:#ff8079; border-color:rgba(224,80,74,.5); }

.lm-cta-row{ display:flex; gap:10px; }
.lm-cta{ flex:1; display:flex; align-items:center; justify-content:center; gap:8px; text-decoration:none;
  padding:14px; border:none; border-radius:14px; cursor:pointer; color:#fff; font-weight:800; font-size:15px; }
.lm-cta-wa{ background:#25b450; }
.lm-cta-call{ background:#2f6fc4; }
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