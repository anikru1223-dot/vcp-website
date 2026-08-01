import React, { useRef, useState, useMemo, useCallback, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
    OrbitControls,
    Environment,
    ContactShadows,
    Html,
    RoundedBox,
    Text,
    Grid,
} from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

/* ============================================================================
   BASAVA GANGURU — SY.NO.43/1  |  Interactive 3D Residential Layout
   Stack: Next.js + three.js + @react-three/fiber + drei + framer-motion
   Prices from ₹2,300 / sq.ft.  ·  Data digitized from approved BUDA plan
   Single-file component. Drop into a Next.js page (client component).
   ============================================================================ */

// ---- PRICING -----------------------------------------------------------------
const PRICE_PER_SQFT = 2300; // ₹ per sq.ft. — base
const SQM_TO_SQFT = 10.7639;
const INR = (n) =>
    "₹" + Math.round(n).toLocaleString("en-IN");

// ---- PALETTE (derived from plan: survey-drawing red boundary, karab-green park) ----
const C = {
    bg: "#0b1220",
    ground: "#141c2e",
    road: "#1c2740",
    roadLine: "#4a5878",
    available: "#3d8bff",
    availableTop: "#5aa2ff",
    hovered: "#ffd166",
    selected: "#22e0a1",
    ca: "#8b5cf6",
    park: "#2fbf71",
    stp: "#e06c3a",
    boundary: "#ff4d5e",
    text: "#e8eefc",
};

/* ------------------------------------------------------------------
   LAYOUT DATA
   Coordinates in metres, laid out on an X/Z plane (Y = up = height).
   Origin near top-left of the plan. Reconstructed to match the four
   dimension classes in the plan's Site Details table:
     9.00 x 12.00 -> 5 sites
     9.00 x 15.00 -> 7 sites
     9.00 x 16.05 -> 5 sites
     odd sites    -> 15 sites   (total 32)
------------------------------------------------------------------ */

// helper to make a site record
let _id = 0;
const site = (no, x, z, w, d, kind = "residential", label) => ({
    id: _id++,
    no,
    x, // center X (m)
    z, // center Z (m)
    w, // width along X (m)
    d, // depth along Z (m)
    kind,
    label,
    areaSqm: kind === "residential" ? +(w * d).toFixed(2) : +(w * d).toFixed(2),
});

const GAP = 0.35; // visual gap between plots (m)

// Block A — CA + sites 1..10 (top-left cluster)
const blockA = [
    // CA occupies the tall left strip
    site("CA", 5.0, 9.5, 9.0, 19.0, "ca", "C.A"),
    // Row 1: 1,2,3
    site(1, 14.0, 4.5, 9.0, 9.0),
    site(2, 23.4, 4.5, 9.0, 9.0),
    site(3, 32.8, 4.5, 9.0, 9.0),
    // Row 2: 4,5,6
    site(4, 14.0, 14.5, 9.0, 9.0),
    site(5, 23.4, 14.5, 9.0, 9.0),
    site(6, 32.8, 14.5, 9.0, 9.0),
];

// Block B — sites 7..10 (below 9m road)
const blockB = [
    site(7, 5.0, 33.0, 9.0, 12.0),
    site(8, 14.4, 33.0, 9.0, 12.0),
    site(9, 23.8, 33.0, 9.0, 12.0),
    site(10, 33.2, 33.0, 9.0, 12.0),
];

// Park + STP (bottom-left, karab retained as park)
const parkBlock = [
    site("PARK", 18.0, 52.0, 40.0, 22.0, "park", "PARK"),
    site("STP", 41.0, 47.0, 6.0, 6.5, "stp", "STP"),
];

// Middle columns — sites 11..25 (two columns) laid along Z
const col1X = 60; // left middle column center X
const col2X = 71; // right middle column center X
const startZ = 4.5;
const stepMid = 10.2;

const middleLeft = [11, 12, 13, 14, 15, 16, 17].map((no, i) =>
    site(no, col1X, startZ + i * stepMid, 9.0, 9.0)
);
const middleRightTop = [
    site(25, 71, 4.5, 4.5, 9.0),
    site(24, 76, 4.5, 4.5, 9.0),
];
const middleRight = [23, 22, 21, 20, 19, 18].map((no, i) =>
    site(no, col2X + 2.5, startZ + 10 + i * stepMid, 9.0, 9.0)
);

// Right column — sites 26..32
const rightX = 92;
const rightCol = [26, 27, 28, 29, 30, 31, 32].map((no, i) =>
    site(no, rightX, startZ + i * stepMid, 9.0, 15.0)
);

const ALL = [
    ...blockA,
    ...blockB,
    ...parkBlock,
    ...middleLeft,
    ...middleRightTop,
    ...middleRight,
    ...rightCol,
];

const RESIDENTIAL = ALL.filter((s) => s.kind === "residential");

// Roads (as flat strips): [centerX, centerZ, width(X), depth(Z), rot?]
const ROADS = [
    { x: 48, z: -6, w: 100, d: 12, label: "APPROVED LAYOUT 12m ROAD" }, // top
    { x: 45, z: 23.5, w: 92, d: 9, label: "9m ROAD" }, // horizontal mid-left
    { x: 47, z: 30, w: 8, d: 78, label: "9m ROAD", vertical: true }, // vertical center-left
    { x: 82, z: 30, w: 8, d: 78, label: "9m ROAD", vertical: true }, // vertical center-right
    { x: 24, z: 42.5, w: 40, d: 3, label: "3m Pathway" }, // pathway
];

// Layout bounds for camera framing
const BOUNDS = { minX: -6, maxX: 104, minZ: -14, maxZ: 66 };
const CENTER = {
    x: (BOUNDS.minX + BOUNDS.maxX) / 2,
    z: (BOUNDS.minZ + BOUNDS.maxZ) / 2,
};

/* ------------------------------------------------------------------
   3D PLOT
------------------------------------------------------------------ */
function Plot({ s, hovered, selected, onHover, onSelect }) {
    const ref = useRef();
    const isRes = s.kind === "residential";
    const isHover = hovered === s.id;
    const isSel = selected.has(s.id);

    const baseColor = useMemo(() => {
        if (s.kind === "ca") return C.ca;
        if (s.kind === "park") return C.park;
        if (s.kind === "stp") return C.stp;
        if (isSel) return C.selected;
        if (isHover) return C.hovered;
        return C.available;
    }, [s.kind, isSel, isHover]);

    const height = isRes ? (isSel ? 3.2 : isHover ? 2.4 : 1.2) : 0.35;

    useFrame((_, dt) => {
        if (!ref.current) return;
        const target = height;
        ref.current.scale.y = THREE.MathUtils.damp(
            ref.current.scale.y,
            target,
            8,
            dt
        );
    });

    const w = s.w - GAP;
    const d = s.d - GAP;

    return (
        <group position={[s.x, 0, s.z]}>
            <RoundedBox
                ref={ref}
                args={[w, 1, d]}
                radius={0.12}
                smoothness={3}
                position={[0, 0.5, 0]}
                scale={[1, height, 1]}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    if (isRes) onHover(s.id);
                }}
                onPointerOut={() => isRes && onHover(null)}
                onClick={(e) => {
                    e.stopPropagation();
                    if (isRes) onSelect(s.id);
                }}
            >
                <meshStandardMaterial
                    color={baseColor}
                    roughness={0.45}
                    metalness={0.15}
                    emissive={baseColor}
                    emissiveIntensity={isSel ? 0.35 : isHover ? 0.25 : 0.05}
                />
            </RoundedBox>

            {/* Site number / label floating */}
            <Text
                position={[0, height + 0.6, 0]}
                fontSize={isRes ? 2.1 : 2.6}
                color={C.text}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.06}
                outlineColor="#000"
                rotation={[-Math.PI / 2, 0, 0]}
            >
                {s.label ?? String(s.no)}
            </Text>

            {(isHover || isSel) && isRes && (
                <Html position={[0, height + 2, 0]} center distanceFactor={90}>
                    <div
                        style={{
                            background: "rgba(10,16,28,0.92)",
                            border: `1px solid ${isSel ? C.selected : C.hovered}`,
                            borderRadius: 10,
                            padding: "6px 10px",
                            color: C.text,
                            fontFamily: "ui-sans-serif, system-ui",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                            pointerEvents: "none",
                            boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
                        }}
                    >
                        <b>Site {s.no}</b> · {s.w}×{s.d}m
                        <br />
                        {Math.round(s.areaSqm * SQM_TO_SQFT)} sq.ft ·{" "}
                        {INR(s.areaSqm * SQM_TO_SQFT * PRICE_PER_SQFT)}
                    </div>
                </Html>
            )}
        </group>
    );
}

/* ------------------------------------------------------------------
   ROADS + GROUND
------------------------------------------------------------------ */
function Road({ r }) {
    return (
        <group position={[r.x, 0.02, r.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[r.w, r.d]} />
                <meshStandardMaterial color={C.road} roughness={0.9} />
            </mesh>
            {/* dashed center line */}
            <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[r.vertical ? 0.25 : r.w * 0.94, r.vertical ? r.d * 0.94 : 0.25]} />
                <meshStandardMaterial color={C.roadLine} />
            </mesh>
        </group>
    );
}

function Ground() {
    return (
        <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CENTER.x, -0.05, CENTER.z]} receiveShadow>
                <planeGeometry args={[260, 220]} />
                <meshStandardMaterial color={C.ground} roughness={1} />
            </mesh>
            <Grid
                position={[CENTER.x, 0, CENTER.z]}
                args={[260, 220]}
                cellSize={5}
                cellColor="#22304d"
                sectionSize={25}
                sectionColor="#2c3c5e"
                fadeDistance={200}
                infiniteGrid={false}
            />
        </>
    );
}

/* Red boundary outline traced roughly around the site */
function Boundary() {
    const pts = useMemo(
        () =>
            [
                [-3, -8],
                [101, -6],
                [104, 40],
                [70, 64],
                [-4, 60],
                [-3, -8],
            ].map(([x, z]) => new THREE.Vector3(x, 0.2, z)),
        []
    );
    const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(pts), [pts]);
    return (
        <line geometry={geo}>
            <lineBasicMaterial color={C.boundary} linewidth={2} />
        </line>
    );
}

/* Auto-rotate ambient camera drift when idle */
function Rig({ enabled }) {
    const { camera } = useThree();
    useFrame((state) => {
        if (!enabled) return;
        const t = state.clock.elapsedTime * 0.05;
        camera.position.x = CENTER.x + Math.sin(t) * 130;
        camera.position.z = CENTER.z + Math.cos(t) * 130;
        camera.lookAt(CENTER.x, 0, CENTER.z);
    });
    return null;
}

/* ------------------------------------------------------------------
   SCENE
------------------------------------------------------------------ */
function Scene({ hovered, selected, onHover, onSelect, autoRotate }) {
    return (
        <>
            <color attach="background" args={[C.bg]} />
            <fog attach="fog" args={[C.bg, 120, 320]} />

            <ambientLight intensity={0.5} />
            <directionalLight
                position={[60, 90, 30]}
                intensity={1.4}
                castShadow
                shadow-mapSize={[2048, 2048]}
            />
            <directionalLight position={[-40, 50, -30]} intensity={0.4} color="#6ea8ff" />

            <Suspense fallback={null}>
                <Environment preset="city" />
            </Suspense>

            <Ground />
            <Boundary />
            {ROADS.map((r, i) => (
                <Road key={i} r={r} />
            ))}

            {ALL.map((s) => (
                <Plot
                    key={s.id}
                    s={s}
                    hovered={hovered}
                    selected={selected}
                    onHover={onHover}
                    onSelect={onSelect}
                />
            ))}

            <ContactShadows
                position={[CENTER.x, 0.01, CENTER.z]}
                opacity={0.5}
                scale={220}
                blur={2.4}
                far={40}
            />

            <Rig enabled={autoRotate} />
            <OrbitControls
                enablePan
                enableDamping
                dampingFactor={0.08}
                minDistance={30}
                maxDistance={260}
                maxPolarAngle={Math.PI / 2.05}
                target={[CENTER.x, 0, CENTER.z]}
            />
        </>
    );
}

/* ------------------------------------------------------------------
   UI OVERLAY  (framer-motion)
------------------------------------------------------------------ */
const font = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto";

function Legend() {
    const items = [
        ["Available", C.available],
        ["Selected", C.selected],
        ["Hover", C.hovered],
        ["C.A", C.ca],
        ["Park", C.park],
        ["STP", C.stp],
    ];
    return (
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {items.map(([label, col]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span
                        style={{
                            width: 12,
                            height: 12,
                            borderRadius: 3,
                            background: col,
                            display: "inline-block",
                        }}
                    />
                    <span style={{ fontSize: 12, color: "#b7c4de" }}>{label}</span>
                </div>
            ))}
        </div>
    );
}

export default function BasavaGanguru3DLayout() {
    const [hovered, setHovered] = useState(null);
    const [selected, setSelected] = useState(new Set());
    const [autoRotate, setAutoRotate] = useState(false);
    const [ratePerSqft, setRate] = useState(PRICE_PER_SQFT);

    const onSelect = useCallback((id) => {
        setSelected((prev) => {
            const n = new Set(prev);
            n.has(id) ? n.delete(id) : n.add(id);
            return n;
        });
    }, []);

    const chosen = useMemo(
        () => RESIDENTIAL.filter((s) => selected.has(s.id)),
        [selected]
    );

    const totals = useMemo(() => {
        const sqm = chosen.reduce((a, s) => a + s.areaSqm, 0);
        const sqft = sqm * SQM_TO_SQFT;
        return { sqm, sqft, price: sqft * ratePerSqft, count: chosen.length };
    }, [chosen, ratePerSqft]);

    return (
        <div style={{ position: "relative", width: "100%", height: "100vh", background: C.bg, fontFamily: font }}>
            <Canvas
                shadows
                camera={{ position: [CENTER.x, 120, CENTER.z + 130], fov: 42 }}
                dpr={[1, 2]}
                onPointerMissed={() => setHovered(null)}
            >
                <Scene
                    hovered={hovered}
                    selected={selected}
                    onHover={setHovered}
                    onSelect={onSelect}
                    autoRotate={autoRotate}
                />
            </Canvas>

            {/* Header */}
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
                style={{
                    position: "absolute",
                    top: 20,
                    left: 24,
                    color: C.text,
                    pointerEvents: "none",
                }}
            >
                <div style={{ fontSize: 12, letterSpacing: 3, color: C.boundary, fontWeight: 700 }}>
                    SY.NO.43/1 · BASAVA GANGURU · SHIVAMOGGA
                </div>
                <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: -0.5, marginTop: 2 }}>
                    Residential Layout — 3D
                </div>
                <div style={{ fontSize: 13, color: "#9fb0d0", marginTop: 4 }}>
                    32 sites · CA · Park · STP · From {INR(PRICE_PER_SQFT)}/sq.ft
                </div>
            </motion.div>

            {/* Controls top-right */}
            <div
                style={{
                    position: "absolute",
                    top: 20,
                    right: 24,
                    display: "flex",
                    gap: 10,
                }}
            >
                <button
                    onClick={() => setAutoRotate((v) => !v)}
                    style={btnStyle(autoRotate)}
                >
                    {autoRotate ? "Stop orbit" : "Auto orbit"}
                </button>
                <button
                    onClick={() => setSelected(new Set())}
                    style={btnStyle(false)}
                >
                    Clear
                </button>
            </div>

            {/* Bottom-left legend */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                    position: "absolute",
                    bottom: 24,
                    left: 24,
                    background: "rgba(10,16,28,0.75)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid #22304d",
                    borderRadius: 14,
                    padding: "12px 16px",
                }}
            >
                <div style={{ fontSize: 11, color: "#7e8db0", marginBottom: 8, letterSpacing: 1 }}>
                    Click plots to build your quote · drag to orbit
                </div>
                <Legend />
            </motion.div>

            {/* Right panel — measurements & price calculator */}
            <motion.div
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                style={{
                    position: "absolute",
                    top: 110,
                    right: 24,
                    width: 320,
                    background: "rgba(10,16,28,0.82)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid #22304d",
                    borderRadius: 18,
                    padding: 18,
                    color: C.text,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                }}
            >
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#9fb0d0" }}>
                    MEASUREMENTS & PRICE
                </div>

                {/* rate slider */}
                <div style={{ marginTop: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#9fb0d0" }}>
                        <span>Rate / sq.ft</span>
                        <span style={{ color: C.selected, fontWeight: 700 }}>{INR(ratePerSqft)}</span>
                    </div>
                    <input
                        type="range"
                        min={2300}
                        max={4000}
                        step={50}
                        value={ratePerSqft}
                        onChange={(e) => setRate(+e.target.value)}
                        style={{ width: "100%", accentColor: C.available, marginTop: 6 }}
                    />
                </div>

                <div style={{ height: 1, background: "#22304d", margin: "14px 0" }} />

                {totals.count === 0 ? (
                    <div style={{ fontSize: 13, color: "#7e8db0", lineHeight: 1.5 }}>
                        No plots selected yet. Click any blue plot in the 3D view to add it to
                        your quote.
                    </div>
                ) : (
                    <>
                        <div style={{ maxHeight: 180, overflowY: "auto", marginBottom: 12 }}>
                            <AnimatePresence>
                                {chosen.map((s) => (
                                    <motion.div
                                        key={s.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "7px 10px",
                                            background: "rgba(34,224,161,0.08)",
                                            border: "1px solid rgba(34,224,161,0.25)",
                                            borderRadius: 10,
                                            marginBottom: 6,
                                            fontSize: 12,
                                        }}
                                    >
                                        <div>
                                            <b>Site {s.no}</b>
                                            <span style={{ color: "#8ea3c6" }}> · {s.w}×{s.d}m</span>
                                            <div style={{ color: "#8ea3c6", fontSize: 11 }}>
                                                {Math.round(s.areaSqm * SQM_TO_SQFT)} sq.ft
                                            </div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ color: C.selected, fontWeight: 700 }}>
                                                {INR(s.areaSqm * SQM_TO_SQFT * ratePerSqft)}
                                            </div>
                                            <button
                                                onClick={() => onSelect(s.id)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#ff6b7d",
                                                    fontSize: 11,
                                                    cursor: "pointer",
                                                    padding: 0,
                                                }}
                                            >
                                                remove
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <Row label="Plots" value={totals.count} />
                        <Row label="Total area" value={`${totals.sqm.toFixed(1)} m² · ${Math.round(totals.sqft).toLocaleString("en-IN")} sq.ft`} />
                        <div
                            style={{
                                marginTop: 12,
                                padding: "12px 14px",
                                background: "linear-gradient(135deg, rgba(61,139,255,0.18), rgba(34,224,161,0.18))",
                                border: "1px solid rgba(34,224,161,0.4)",
                                borderRadius: 12,
                            }}
                        >
                            <div style={{ fontSize: 11, color: "#9fb0d0", letterSpacing: 1 }}>
                                ESTIMATED TOTAL
                            </div>
                            <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginTop: 2 }}>
                                {INR(totals.price)}
                            </div>
                            <div style={{ fontSize: 11, color: "#8ea3c6", marginTop: 2 }}>
                                at {INR(ratePerSqft)}/sq.ft · indicative, excl. registration & taxes
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                padding: "4px 0",
                color: "#c3cfe6",
            }}
        >
            <span style={{ color: "#8ea3c6" }}>{label}</span>
            <span style={{ fontWeight: 600 }}>{value}</span>
        </div>
    );
}

function btnStyle(active) {
    return {
        background: active ? C.available : "rgba(10,16,28,0.8)",
        color: active ? "#fff" : "#c3cfe6",
        border: `1px solid ${active ? C.available : "#22304d"}`,
        borderRadius: 10,
        padding: "8px 14px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
        backdropFilter: "blur(8px)",
    };
}