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
 * FIX ("Image 2" bug): the very first `useLayoutEffect` measurement pass
 * could occasionally read a 0×0 (or otherwise invalid) `.lm-stage` rect —
 * before layout has settled, before the mobile browser chrome (address
 * bar) has resolved its final height, etc. This is guarded via
 * `hasFitRef` / `mapCameraReady` — see the effect below.
 *
 * FIX (this revision — desktop clicks not registering): plots previously
 * relied entirely on the browser's synthetic "click" event firing on the
 * polygon after pointerdown/pointerup. With `setPointerCapture()` in play
 * and `e.preventDefault()` called inside `onPointerMove` on every frame
 * (even for a fraction-of-a-pixel mouse jitter while clicking), some
 * desktop browsers will suppress the synthetic click entirely — while
 * touch taps (which don't jitter the same way) kept working, masking the
 * bug on mobile. This revision adds an explicit tap/click detector: we
 * track total pointer movement between pointerdown and pointerup, and if
 * it stayed under a small threshold (a real tap/click, not a drag), we
 * hit-test the release point ourselves via `document.elementFromPoint`
 * and select the plot directly — independent of whether the browser
 * decides to fire "click". The original onClick handlers are left in
 * place too, so nothing regresses; this is pure redundancy for desktop.
 *
 * FIX (this revision — image "zooming out" / background bleeding in):
 * the default camera fit previously sized itself to CONTENT_BOUNDS (the
 * abstract plot-grid box) at 92% "contain", which — depending on the
 * screen's aspect ratio — often left the master-plan image smaller than
 * the stage, so the plain background color showed as a visible gap above
 * the image (between the header and the image top) and below it (between
 * the image bottom and the footer/controls). computeFitScale now fits in
 * "cover" mode against the actual image bounds (IMAGE_BOUNDS), so the
 * image always fills the entire stage edge-to-edge at the default zoom —
 * no background bleed, and users are never looking at an over-zoomed-out
 * view where the image and the surrounding filler don't make sense
 * together.
 *
 * FIX (this revision — remove selection highlight box): selecting a plot
 * no longer draws a white stroke/outline box around it. Only the fill
 * brightens slightly on selection now.
 *
 * No plot geometry, roads, colors, or other UI controls/interaction
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
    { id: "1", pts: "262.1,257.2 343.6,257.3 341.2,363.3 259.6,362.4", dim: "9.00 × 15.00 m", facing: "North", sqm: 135.0, sqft: 1453 },
    { id: "2", pts: "343.6,257.3 424.9,257.5 422.6,364.1 341.2,363.3", dim: "9.00 × 15.00 m", facing: "North", sqm: 135.0, sqft: 1453 },
    { id: "3", pts: "424.9,257.5 504.1,257.7 501.8,365.0 422.6,364.1", dim: "7.60/8.70 × 15.05/15.00 m", facing: "North", sqm: 122.5, sqft: 1319 },
    { id: "4", pts: "259.6,362.4 341.2,363.3 339.0,462.0 257.2,461.4", dim: "9.00/9.05 × 12.15/11.50 m", facing: "South", sqm: 106.7, sqft: 1149 },
    { id: "5", pts: "341.2,363.3 422.6,364.1 420.4,462.7 339.0,462.0", dim: "9.00/9.05 × 11.50/10.80 m", facing: "South", sqm: 100.6, sqft: 1083 },
    { id: "6", pts: "422.6,364.1 501.8,365.0 499.8,463.3 420.4,462.7", dim: "8.70/9.50 × 10.10/10.80 m", facing: "South", sqm: 95.1, sqft: 1024 },
    { id: "7", pts: "119.2,539.3 208.7,540.7 205.7,646.1 113.1,645.2", dim: "8.15/9.80 × 9.45/9.30 m", facing: "North", sqm: 84.1, sqft: 905 },
    { id: "8", pts: "208.7,540.7 300.2,542.1 297.5,646.9 205.7,646.1", dim: "9.30 × 12.00 m", facing: "North", sqm: 111.6, sqft: 1201 },
    { id: "9", pts: "300.2,542.1 395.4,543.5 393.6,647.8 297.5,646.9", dim: "9.30 × 12.00 m", facing: "North", sqm: 111.6, sqft: 1201 },
    { id: "10", pts: "395.4,543.5 496.0,545.1 493.7,648.8 393.6,647.8", dim: "9.30 × 12.00 m", facing: "North", sqm: 111.6, sqft: 1201 },
    { id: "11", pts: "568.4,258.4 642.7,259.8 642.7,365.5 567.2,364.8", dim: "9.05/9.00 × 14.00/13.35 m", facing: "North", sqm: 123.4, sqft: 1328 },
    { id: "12", pts: "568.0,364.8 682.9,365.8 681.8,464.0 566.3,463.2", dim: "9.00 × 12.00 m", facing: "West", sqm: 108.0, sqft: 1163 },
    { id: "13", pts: "566.3,463.2 681.8,464.0 680.7,561.9 564.7,561.2", dim: "9.00 × 12.00 m", facing: "West", sqm: 108.0, sqft: 1163 },
    { id: "14", pts: "564.7,561.2 680.7,561.9 679.6,661.3 563.0,661.0", dim: "9.00 × 12.00 m", facing: "West", sqm: 108.0, sqft: 1163 },
    { id: "15", pts: "563.0,661.0 679.6,661.3 678.5,761.6 561.3,760.9", dim: "9.00 × 12.00 m", facing: "West", sqm: 108.0, sqft: 1163 },
    { id: "16", pts: "561.3,760.9 678.5,761.6 677.4,864.6 559.6,864.6", dim: "9.00 × 12.00 m", facing: "West", sqm: 108.0, sqft: 1163 },
    { id: "17", pts: "559.6,864.6 677.4,864.6 676.2,966.1 557.9,967.3", dim: "11.35/10.30 × 12.05/12.00 m", facing: "South", sqm: 130.2, sqft: 1401 },
    { id: "18", pts: "677.4,864.6 793.0,864.7 791.8,965.0 676.2,966.1", dim: "10.30/8.90 × 16.00/16.05 m", facing: "South", sqm: 153.8, sqft: 1655 },
    { id: "19", pts: "678.5,761.6 794.2,762.4 793.0,864.7 677.4,864.6", dim: "9.00 × 16.05 m", facing: "East", sqm: 144.5, sqft: 1555 },
    { id: "20", pts: "679.6,661.3 795.3,661.6 794.2,762.4 678.5,761.6", dim: "9.00 × 16.05 m", facing: "East", sqm: 144.5, sqft: 1555 },
    { id: "21", pts: "680.7,561.9 796.5,562.6 795.3,661.6 679.6,661.3", dim: "9.00 × 16.05 m", facing: "East", sqm: 144.5, sqft: 1555 },
    { id: "22", pts: "681.8,464.0 797.6,464.8 796.5,562.6 680.7,561.9", dim: "9.00 × 16.05 m", facing: "East", sqm: 144.5, sqft: 1555 },
    { id: "23", pts: "682.9,365.8 798.7,366.8 797.6,464.8 681.8,464.0", dim: "9.00 × 16.05 m", facing: "East", sqm: 144.5, sqft: 1555 },
    { id: "24", pts: "711.5,261.0 726.3,261.3 725.5,366.2 710.7,366.1", dim: "10.05 × 12.65/11.90 m", facing: "North", sqm: 123.4, sqft: 1328 },
    { id: "25", pts: "642.7,259.8 711.5,261.0 710.7,366.1 642.7,365.5", dim: "9.05/9.00 × 13.35 m", facing: "North", sqm: 120.5, sqft: 1297 },
    { id: "26", pts: "726.3,261.3 798.4,262.7 797.4,366.8 725.5,366.2", dim: "15.10/9.25 × 10.35/15.05 m", facing: "North", sqm: 154.6, sqft: 1664 },
    { id: "27", pts: "859.5,375.7 976.1,376.5 976.1,486.5 858.6,484.8", dim: "9.00 × 15.00 m", facing: "East", sqm: 135.0, sqft: 1453 },
    { id: "28", pts: "860.3,266.7 976.1,272.2 976.1,376.5 859.5,375.7", dim: "9.00 × 15.00 m", facing: "East", sqm: 135.0, sqft: 1453 },
    { id: "29", pts: "858.6,484.8 976.1,486.5 976.1,596.5 857.8,595.1", dim: "9.00 × 15.00 m", facing: "East", sqm: 135.0, sqft: 1453 },
    { id: "30", pts: "857.8,595.1 976.1,596.5 976.1,709.0 856.9,709.0", dim: "9.00 × 15.00 m", facing: "East", sqm: 135.0, sqft: 1453 },
    { id: "31", pts: "856.9,709.0 976.1,709.0 976.1,823.6 856.0,823.6", dim: "9.00 × 15.00 m", facing: "East", sqm: 135.0, sqft: 1453 },
    { id: "32", pts: "856.0,823.6 976.1,823.6 976.1,962.8 854.9,963.8", dim: "15.00/16.10 × 9.00/7.65 m", facing: "South", sqm: 129.5, sqft: 1394 },
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
// decorative canvas around it) is what pan clamping/elastic slack uses.
const CONTENT_BOUNDS: Box = { x: 108, y: 174, w: 902, h: 796 };
const CONTENT_CENTER: Point = { x: CONTENT_BOUNDS.x + CONTENT_BOUNDS.w / 2, y: CONTENT_BOUNDS.y + CONTENT_BOUNDS.h / 2 };

// ---------------------------------------------------------------------------
// Master-plan image overlay.
//
// The realistic rendered master-plan (roads, plots, trees, KARAB, CA, STP —
// all baked into one image) replaces the previous generated-SVG landscaping
// entirely. It is rendered as a single <image> INSIDE the same camera-
// transformed <g> as the plots/roads (see camGroupRef further down), so it
// pans/zooms in perfect lockstep with the interactive layer — never as a
// separate HTML-positioned element.
//
// REGISTRATION: IMAGE_BOUNDS maps the source PNG's own pixel box into this
// component's SVG coordinate system. It was derived by measuring the pixel
// coordinates of several known plot-grid corners spread across the whole
// render (Plot 7's top-left corner on the far left, Plot 1's top-left
// corner, the Plot 3/11 row near the top, the Plot 1/4 row boundary, the
// Plot 31/32 boundary on the right column, and the Plot 17/18 bottom edge)
// and fitting a per-axis linear (scale + offset) map against those corners'
// KNOWN SVG coordinates (e.g. Plot 1's top-left corner is exactly (250, 262)
// in CONTENT_BOUNDS space). X and Y ended up with slightly different scales
// (~1.01 vs ~0.93 px/unit) because the source render isn't a true
// orthophoto — which is exactly the case preserveAspectRatio="none" exists
// for below.
//
// LIMITATION: measured residuals across these points run up to roughly
// 2% of the image's own size (a marketing render has real lens/perspective
// distortion a single global affine transform can't fully absorb — plots on
// the far left/right won't align quite as tightly as plots near the middle
// of the fit). If you need every one of the 32 plots pixel-perfect, the
// next step up is slicing the source image into 2–3 regional crops (e.g.
// left cluster / middle columns / right column) and giving each its own
// local IMAGE_BOUNDS fit — ask and I'll set that up.
const MASTER_PLAN_IMAGE_SRC = "/images/basava-ganguru-masterplan.png";
const IMAGE_BOUNDS: Box = { x: -110, y: 3, w: 1383, h: 1213 };


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

// How far (in screen px) a pointer is allowed to drift between down and up
// before we treat the gesture as a drag instead of a tap/click.
const TAP_MOVE_TOLERANCE_PX = 6;

function LayoutMapInner() {
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

    // Desktop-safe tap/click tracking (see top-of-file note). tapStartRef
    // holds the pointerdown position for the current single-pointer gesture;
    // tapMovedRef flips true the moment that gesture drifts past the
    // tolerance, at which point it's a drag/pan, not a tap.
    const tapStartRef = useRef<{ x: number; y: number } | null>(null);
    const tapMovedRef = useRef(false);

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

    // The scale used at default zoom. CONTAIN (not cover): sized so the
    // ENTIRE master-plan IMAGE is always visible inside the stage at the
    // default zoom — previously this fit in "cover" mode (Math.max), which
    // guaranteed no background bleed but, on stage aspect ratios that
    // differ a lot from the image's own aspect ratio (a short/wide desktop
    // browser window, for example), cropped a large chunk of the image
    // off-screen — the user only ever saw part of the map on load. Math.min
    // guarantees the whole image fits inside the stage; the 0.94 multiplier
    // leaves a small margin around it so the map doesn't touch the
    // header/footer/controls.
    const computeFitScale = () => {
        const r = stageRectRef.current;
        if (!r.width || !r.height) return 1;
        return Math.min(r.width / IMAGE_BOUNDS.w, r.height / IMAGE_BOUNDS.h) * 0.94;
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

    // FIX (mobile — action row / zoom / rotate / center / photos buttons not
    // responding to taps): onPointerDown below is bound to the whole `.lm-stage`
    // wrapper (for pan/zoom/pinch), and it was unconditionally calling
    // `setPointerCapture()` and `preventDefault()`-ing pointermove — for EVERY
    // pointer that landed anywhere inside the stage, including on the real
    // HTML `<button>`/`<a>` UI controls that are rendered as overlay children
    // of that same wrapper (ALL/MAPS/PHOTOS, zoom +/-, rotate, center, night
    // toggle, filter menu, photo grid, lightbox nav, Train IQ badge). Capturing
    // the pointer to the stage container redirects the subsequent pointerup
    // away from the button element, which is exactly the condition mobile
    // Safari/Chrome use to decide whether to fire the button's synthetic
    // "click" — so on touch devices the tap was silently swallowed by the map's
    // drag handling instead of activating the button (desktop mouse was mostly
    // fine, which is why this only showed up on mobile). The fix: detect when
    // the gesture actually started on a real interactive control and bail out
    // of all the camera pan/zoom/tap bookkeeping for that pointer entirely, so
    // the browser handles the tap on the button exactly like it would anywhere
    // else on the page.
    const isInteractiveTarget = (target: EventTarget | null) => {
        if (!(target instanceof Element)) return false;
        return !!target.closest("button, a, input, select, textarea");
    };

    const onPointerDown = (e: React.PointerEvent) => {
        if (isInteractiveTarget(e.target)) return;
        (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        refreshStageRect();
        beginInteraction();
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

        if (pointers.current.size === 1) {
            dragState.current = { px: e.clientX, py: e.clientY, tx: camRef.current.tx, ty: camRef.current.ty };
            pinchState.current = null;
            // Start tracking this as a potential tap/click.
            tapStartRef.current = { x: e.clientX, y: e.clientY };
            tapMovedRef.current = false;
        } else if (pointers.current.size === 2) {
            dragState.current = null;
            // A second finger landed — this is a pinch/rotate gesture, not a tap.
            tapStartRef.current = null;
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

        if (tapStartRef.current && !tapMovedRef.current) {
            const dist = Math.hypot(e.clientX - tapStartRef.current.x, e.clientY - tapStartRef.current.y);
            if (dist > TAP_MOVE_TOLERANCE_PX) tapMovedRef.current = true;
        }

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
        // If this pointer was never registered (because onPointerDown bailed
        // out early for a tap that landed on a real UI button/link/input — see
        // isInteractiveTarget above), there's nothing to end: don't run
        // settle()/idle-restore for a gesture the map was never tracking.
        if (!pointers.current.has(e.pointerId)) return;

        // Snapshot whether this release completes a genuine tap/click BEFORE
        // mutating the pointers map below.
        const wasSinglePointerTap = pointers.current.size === 1 && !!tapStartRef.current && !tapMovedRef.current;
        const tapX = e.clientX;
        const tapY = e.clientY;

        pointers.current.delete(e.pointerId);
        if (pointers.current.size === 0) {
            dragState.current = null;
            pinchState.current = null;
            settle();
            scheduleIdleRestore(0);

            // Desktop-safe tap/click handling: rather than relying solely on the
            // browser's synthetic "click" event (which can be suppressed by some
            // desktop browsers once pointer capture + a preventDefault()'d
            // pointermove are involved, even for a sub-pixel mouse jitter), hit
            // -test the release point ourselves and select the plot directly.
            if (wasSinglePointerTap) {
                const el = document.elementFromPoint(tapX, tapY) as HTMLElement | SVGElement | null;
                const plotEl = (el as Element | null)?.closest?.("[data-plot-id]") as Element | null;
                const plotId = plotEl?.getAttribute("data-plot-id");
                if (plotId) setSelected(plotId);
            }
            tapStartRef.current = null;
            tapMovedRef.current = false;
        } else if (pointers.current.size === 1) {
            pinchState.current = null;
            tapStartRef.current = null; // a multi-touch gesture happened — not a tap
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
                    </defs>

                    <g ref={camGroupRef} className="lm-camera">
                        <rect x={BASE_VB.x - 900} y={BASE_VB.y - 900} width={BASE_VB.w + 1800} height={BASE_VB.h + 1800} fill="#8a794e" />

                        {/* Master-plan image — the primary visual layer. Lives in the
                exact same SVG coordinate system (and the same camera-
                transformed <g>) as everything else below it, so it pans and
                zooms in perfect lockstep with the plot hitboxes. Never a
                CSS/HTML-positioned overlay. */}
                        <image
                            href={MASTER_PLAN_IMAGE_SRC}
                            x={IMAGE_BOUNDS.x}
                            y={IMAGE_BOUNDS.y}
                            width={IMAGE_BOUNDS.w}
                            height={IMAGE_BOUNDS.h}
                            preserveAspectRatio="none"
                            pointerEvents="none"
                        />

                        {/* Interactive plot layer — the actual click/hover/selection
                surface, transparent by default so the image shows through.
                A faint status tint stays on so available/reserved/sold is
                still readable at a glance without painting a solid block
                over the realistic image. pointerEvents is set explicitly
                (rather than relying on the SVG default) so nothing upstream
                can accidentally swallow clicks on these plots. Each plot
                also carries a data-plot-id attribute so the manual desktop
                tap/click hit-test (see endPointer) can identify it via
                document.elementFromPoint without depending on React's
                synthetic click event. */}
                        <g pointerEvents="auto">
                            {PLOTS.map((p) => {
                                const isSel = p.id === selected;
                                const st = statusMap[p.id];
                                const effective: Status = st || "available";
                                const shown: Status = filter === "all" ? "available" : effective;
                                const meta = STATUS_META[shown];
                                const dimmed = filter !== "all" && effective !== filter;
                                const fillOpacity = isSel ? 0.4 : 0.2;
                                return (
                                    <g key={p.id} className="lm-plot" data-plot-id={p.id}
                                        onClick={(e) => { e.stopPropagation(); setSelected(p.id); }}
                                        role="button" tabIndex={0}
                                        style={{ opacity: dimmed ? 0.25 : 1, transition: "opacity .25s ease" }}
                                        onKeyDown={(e: React.KeyboardEvent) => (e.key === "Enter" || e.key === " ") && setSelected(p.id)}>
                                        <polygon points={p.pts} data-plot-id={p.id} className="lm-plot-shape" pointerEvents="visiblePainted"
                                            fill={isSel ? meta.sel : meta.fill}
                                            fillOpacity={fillOpacity} />
                                    </g>
                                );
                            })}
                        </g>

                        {night && <rect x={BASE_VB.x - 900} y={BASE_VB.y - 900} width={BASE_VB.w + 1800} height={BASE_VB.h + 1800} fill="#0a1424" opacity="0.72" pointerEvents="none" />}

                        {STREET_LIGHT_POS.map(([x, y], i) => <StreetLight key={i} x={x} y={y} night={night} />)}
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

// Diagnostic error boundary. If LayoutMapInner throws during render (which
// would otherwise leave a fully-painted but completely unresponsive page —
// exactly the "nothing is clickable" symptom, since React would have
// unmounted its event handlers after the crash but the last-rendered DOM
// stays visible), this shows the actual error message instead of silence.
// If you're seeing "nothing clickable" and this box never appears, the
// crash isn't happening in this component at all — look outside it (a
// global overlay, a stale build, something in the surrounding page).
class LayoutMapErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { error: Error | null }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { error: null };
    }
    static getDerivedStateFromError(error: Error) {
        return { error };
    }
    componentDidCatch(error: Error, info: React.ErrorInfo) {
        // eslint-disable-next-line no-console
        console.error("LayoutMap crashed:", error, info.componentStack);
    }
    render() {
        if (this.state.error) {
            return (
                <div style={{
                    position: "fixed", inset: 0, background: "#1c2317", color: "#f3f6ee",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    fontFamily: "monospace", padding: 24, textAlign: "center", gap: 12,
                }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Map crashed</div>
                    <div style={{ maxWidth: 640, fontSize: 13, opacity: 0.85, whiteSpace: "pre-wrap" }}>
                        {this.state.error.message}
                    </div>
                    <button
                        onClick={() => this.setState({ error: null })}
                        style={{ marginTop: 8, padding: "8px 16px", borderRadius: 8, border: "1px solid #d4ab54", background: "transparent", color: "#f2dd9a", cursor: "pointer" }}
                    >
                        Retry
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function LayoutMap() {
    return (
        <LayoutMapErrorBoundary>
            <LayoutMapInner />
        </LayoutMapErrorBoundary>
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
/* The stage sets touch-action:none so panning/pinching the map never
   triggers the browser's own scroll/zoom gestures. The overlay buttons
   (action row, zoom/rotate/center, filter menu, photos, lightbox, Train IQ
   badge) live inside that same stage element, so without this override they
   silently inherited touch-action:none too — opting them out of the
   browser's normal fast-tap handling on mobile. Giving them their own
   touch-action restores normal, immediate tap behavior on touch devices. */
.lm-actionrow, .lm-ctrl, .lm-tiq-wrap, .lm-filtermenu, .lm-photos-overlay,
.lm-lightbox, .lm-filterbackdrop{ touch-action: manipulation; }
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
.lm-plot:focus-visible .lm-plot-shape{ filter:brightness(1.15); }
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
  .lm-panel{
    max-width:400px; left:auto; right:22px; bottom:22px;
    border-radius:20px;
    padding:18px 22px 22px;
    box-shadow:0 20px 60px rgba(0,0,0,.5);
    border:1px solid var(--line);
  }
  .lm-panel::before{ display:none; }
  .lm-photos-modal{ box-shadow:0 20px 60px rgba(0,0,0,.5); }
}
@media (prefers-reduced-motion:reduce){
  .lm-panel, .lm-plot-shape{ transition:none; }
  .lm-hint{ animation:none; }
}
`;