"use client";

import React, {
    useRef,
    useState,
    useMemo,
    useCallback,
    useEffect,
    Suspense,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html, Text } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

/* ============================================================================
   BASAVA GANGURU — SY.NO.43/1  ·  Plotex-style Interactive 3D Layout
   Stack: Next.js + three.js + @react-three/fiber + drei + framer-motion
   FLAT plots (map style) · procedural canvas textures (no external files) ·
   edge dimension labels (m + sqft) · roundabouts · zebra crossings ·
   hazard barriers · bottom toolbar + Enquire CTA · Supabase-ready booking.
   Route: src/app/layout-3d/page.tsx  ->  <BasavaGanguru3DLayout/>
   Deps: three @react-three/fiber @react-three/drei framer-motion
   ============================================================================ */

const PRICE_PER_SQFT = 2300;
const SQM_TO_SQFT = 10.7639;
const M_TO_FT = 3.28084;
const INR = (n) => "₹" + Math.round(n).toLocaleString("en-IN");

/* feet-inches like Plotex: 9.00m -> 29'6" */
const ftIn = (m) => {
    const totalIn = m * M_TO_FT * 12;
    const ft = Math.floor(totalIn / 12);
    const inch = Math.round(totalIn - ft * 12);
    return inch === 12 ? `${ft + 1}'0"` : `${ft}'${inch}"`;
};

const C = {
    available: "#4aa3ff",
    availableEdge: "#2d7fe0",
    booked: "#e8b23a",
    sold: "#8a94a6",
    selected: "#7fd4ff",
    hovered: "#ffd76a",
    ca: "#b9a6ff",
    park: "#4c9a3f",
};

/* ============================================================================
   DATA — flat plots, 4 BUDA classes, 32 sites
   ============================================================================ */
let _id = 0;
const facingFor = (z) => (z < 25 ? "North" : z < 45 ? "East" : "South");
const mk = (no, x, z, w, d, opts = {}) => ({
    id: _id++,
    no,
    x,
    z,
    w,
    d,
    kind: opts.kind || "residential",
    label: opts.label,
    status: opts.status || "available",
    corner: !!opts.corner,
    premium: !!opts.premium,
    facing: opts.facing || facingFor(z),
    areaSqm: +(w * d).toFixed(2),
});

const blockA = [
    mk("CA", 5.0, 9.5, 9.0, 19.0, { kind: "ca", label: "C.A" }),
    mk(1, 14.0, 4.5, 9.0, 9.0, { corner: true }),
    mk(2, 23.4, 4.5, 9.0, 9.0),
    mk(3, 32.8, 4.5, 9.0, 9.0, { corner: true, premium: true }),
    mk(4, 14.0, 14.5, 9.0, 9.0),
    mk(5, 23.4, 14.5, 9.0, 9.0),
    mk(6, 32.8, 14.5, 9.0, 9.0),
];
const blockB = [
    mk(7, 5.0, 33.0, 9.0, 12.0, { corner: true }),
    mk(8, 14.4, 33.0, 9.0, 12.0),
    mk(9, 23.8, 33.0, 9.0, 12.0),
    mk(10, 33.2, 33.0, 9.0, 12.0, { corner: true }),
];
const parkBlock = [
    mk("PARK", 18.0, 52.0, 40.0, 22.0, { kind: "park", label: "PARK / OPEN SPACE" }),
    mk("STP", 42.5, 46.5, 6.0, 6.5, { kind: "stp", label: "STP" }),
];
const middleLeft = [11, 12, 13, 14, 15, 16, 17].map((no, i) =>
    mk(no, 60, 4.5 + i * 10.2, 9.0, 15.0, { corner: i === 0 || i === 6, premium: no === 14 })
);
const middleRightTop = [
    mk(25, 71, 4.5, 4.5, 9.0, {}),
    mk(24, 76, 4.5, 4.5, 9.0, { corner: true }),
];
const middleRight = [23, 22, 21, 20, 19, 18].map((no, i) =>
    mk(no, 73.5, 14.5 + i * 10.2, 9.0, 16.05, { corner: i === 5, premium: no === 21 })
);
const rightCol = [26, 27, 28, 29, 30, 31, 32].map((no, i) =>
    mk(no, 92, 4.5 + i * 10.2, 9.0, 15.0, { corner: i === 0 || i === 6, premium: no === 32 })
);

const ALL = [...blockA, ...blockB, ...parkBlock, ...middleLeft, ...middleRightTop, ...middleRight, ...rightCol];
const RESIDENTIAL = ALL.filter((s) => s.kind === "residential");

const SEED_STATUS = { 2: "sold", 5: "booked", 9: "sold", 13: "booked", 20: "sold", 27: "booked", 30: "sold" };
RESIDENTIAL.forEach((s) => {
    if (SEED_STATUS[s.no]) s.status = SEED_STATUS[s.no];
});

const ROADS = [
    { x: 48, z: -6, w: 104, d: 12, name: "12M ROAD", vertical: false, hazard: true },
    { x: 45, z: 23.5, w: 96, d: 9, name: "9M ROAD", vertical: false },
    { x: 47, z: 34, w: 9, d: 70, name: "9M ROAD", vertical: true, hazard: true },
    { x: 82, z: 34, w: 9, d: 70, name: "9M ROAD", vertical: true },
    { x: 24, z: 42.5, w: 42, d: 3, name: "3M PATHWAY", vertical: false },
];
const ROUNDABOUTS = [
    [47, 23.5],
    [82, 23.5],
];
const ZEBRAS = [
    { x: 47, z: 17, vertical: false },
    { x: 82, z: 17, vertical: false },
];

const SURVEY_CONTEXT = [
    { name: "Sy.No.39", x: -18, z: -22 },
    { name: "Sy.No.42", x: 48, z: -26 },
    { name: "Sy.No.43/3", x: 118, z: 8 },
    { name: "Sy.No.44", x: -20, z: 30 },
    { name: "Sy.No.46", x: 55, z: 78 },
];

const WALL_PATH = [
    [-3, -8],
    [101, -6],
    [104, 40],
    [70, 64],
    [-4, 60],
    [-3, -8],
];

const BOUNDS = { minX: -6, maxX: 104, minZ: -14, maxZ: 66 };
const CENTER = { x: (BOUNDS.minX + BOUNDS.maxX) / 2, z: (BOUNDS.minZ + BOUNDS.maxZ) / 2 };

/* ============================================================================
   PROCEDURAL CANVAS TEXTURES (no external files)
   ============================================================================ */
function makeCanvasTexture(draw, size = 256, repeat = 1) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = size;
    const ctx = cv.getContext("2d");
    draw(ctx, size);
    const tex = new THREE.CanvasTexture(cv);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeat, repeat);
    tex.anisotropy = 4;
    return tex;
}

function useTextures() {
    return useMemo(() => {
        const asphalt = makeCanvasTexture((ctx, s) => {
            ctx.fillStyle = "#26292f";
            ctx.fillRect(0, 0, s, s);
            for (let i = 0; i < 2600; i++) {
                const g = 20 + Math.random() * 40;
                ctx.fillStyle = `rgba(${g},${g},${g + 4},${Math.random() * 0.5})`;
                ctx.fillRect(Math.random() * s, Math.random() * s, 1.4, 1.4);
            }
        }, 256, 6);

        const soil = makeCanvasTexture((ctx, s) => {
            ctx.fillStyle = "#b79b74";
            ctx.fillRect(0, 0, s, s);
            for (let i = 0; i < 3000; i++) {
                const r = Math.random();
                ctx.fillStyle = r > 0.5 ? "rgba(150,124,90,.5)" : "rgba(200,180,150,.5)";
                ctx.fillRect(Math.random() * s, Math.random() * s, 2, 2);
            }
        }, 256, 14);

        const grass = makeCanvasTexture((ctx, s) => {
            ctx.fillStyle = "#4c9a3f";
            ctx.fillRect(0, 0, s, s);
            for (let i = 0; i < 4000; i++) {
                const g = 100 + Math.random() * 80;
                ctx.strokeStyle = `rgba(${40},${g},${40},.5)`;
                ctx.beginPath();
                const x = Math.random() * s;
                const y = Math.random() * s;
                ctx.moveTo(x, y);
                ctx.lineTo(x + (Math.random() - 0.5) * 3, y - 2 - Math.random() * 3);
                ctx.stroke();
            }
        }, 256, 10);

        const stone = makeCanvasTexture((ctx, s) => {
            ctx.fillStyle = "#7d766b";
            ctx.fillRect(0, 0, s, s);
            for (let i = 0; i < 60; i++) {
                const x = Math.random() * s;
                const y = Math.random() * s;
                const r = 8 + Math.random() * 16;
                ctx.fillStyle = `hsl(${30 + Math.random() * 20}, ${8 + Math.random() * 12}%, ${40 + Math.random() * 25}%)`;
                ctx.beginPath();
                ctx.ellipse(x, y, r, r * (0.6 + Math.random() * 0.4), Math.random() * 3, 0, 7);
                ctx.fill();
                ctx.strokeStyle = "rgba(40,36,30,.6)";
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }, 256, 3);

        return { asphalt, soil, grass, stone };
    }, []);
}

/* ============================================================================
   FLAT PLOT (map-style, no extrusion)  — matches Plotex
   ============================================================================ */
function Plot({ s, hovered, selectedId, onHover, onSelect, showDims }) {
    const isRes = s.kind === "residential";
    const clickable = isRes && s.status !== "sold";
    const isHover = hovered === s.id;
    const isSel = selectedId === s.id;

    const fill = useMemo(() => {
        if (s.kind === "ca") return C.ca;
        if (s.kind === "park") return C.park;
        if (s.kind === "stp") return "#c9ced6";
        if (isSel) return C.selected;
        if (isHover) return C.hovered;
        if (s.status === "sold") return C.sold;
        if (s.status === "booked") return C.booked;
        return C.available;
    }, [s.kind, s.status, isHover, isSel]);

    const w = s.w - 0.5;
    const d = s.d - 0.5;
    const sqft = Math.round(s.areaSqm * SQM_TO_SQFT);
    const y = isSel ? 0.22 : isHover ? 0.16 : 0.08;

    return (
        <group position={[s.x, 0, s.z]}>
            {/* plot slab (thin, flat) */}
            <mesh
                position={[0, y, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    if (clickable) onHover(s.id);
                }}
                onPointerOut={() => clickable && onHover(null)}
                onClick={(e) => {
                    e.stopPropagation();
                    if (clickable) onSelect(s.id);
                }}
                receiveShadow
            >
                <planeGeometry args={[w, d]} />
                <meshStandardMaterial color={fill} roughness={0.75} metalness={0.02} />
            </mesh>

            {/* selected white outline glow (Plotex look) */}
            {(isSel || isHover) && isRes && (
                <lineSegments position={[0, y + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <edgesGeometry args={[new THREE.PlaneGeometry(w + 0.4, d + 0.4)]} />
                    <lineBasicMaterial color={isSel ? "#ffffff" : "#fff6d0"} />
                </lineSegments>
            )}

            {/* plot number */}
            <Text
                position={[0, y + 0.03, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={isRes ? 2.4 : s.kind === "park" ? 3.4 : 2}
                color={isRes ? "#0b2038" : "#12331f"}
                anchorX="center"
                anchorY="middle"
            >
                {isRes ? String(s.no) : s.label}
            </Text>

            {/* edge dimension labels (m + sqft) — Plotex-style pills */}
            {showDims && isRes && (
                <>
                    <Html position={[0, y + 0.04, -d / 2]} center distanceFactor={95}>
                        <div style={dimPill}>{s.w.toFixed(2)}m · {ftIn(s.w)}</div>
                    </Html>
                    <Html position={[-w / 2, y + 0.04, 0]} center distanceFactor={95}>
                        <div style={dimPill}>{s.d.toFixed(2)}m · {ftIn(s.d)}</div>
                    </Html>
                    <Html position={[0, y + 0.04, d / 2 - 0.2]} center distanceFactor={110}>
                        <div style={sqftTag}>{sqft} sqft</div>
                    </Html>
                </>
            )}
        </group>
    );
}
const dimPill = {
    background: "#1d2733",
    color: "#eaf2ff",
    font: "600 11px ui-sans-serif,system-ui",
    padding: "2px 8px",
    borderRadius: 20,
    whiteSpace: "nowrap",
    pointerEvents: "none",
    boxShadow: "0 2px 6px rgba(0,0,0,.4)",
};
const sqftTag = {
    color: "#0b2038",
    font: "700 10px ui-sans-serif,system-ui",
    whiteSpace: "nowrap",
    pointerEvents: "none",
};

/* ============================================================================
   ROADS with hazard barriers + street lights
   ============================================================================ */
function Road({ r, tex }) {
    const [len, wid] = r.vertical ? [r.d, r.w] : [r.w, r.d];
    const dashCount = Math.floor(len / 6);
    return (
        <group position={[r.x, 0, r.z]} rotation={[0, r.vertical ? Math.PI / 2 : 0, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
                <planeGeometry args={[len, wid]} />
                <meshStandardMaterial map={tex.asphalt} roughness={0.85} metalness={0.05} />
            </mesh>
            {/* white kerb lines both edges */}
            {[1, -1].map((sgn) => (
                <mesh key={sgn} position={[0, 0.04, (sgn * wid) / 2 - sgn * 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[len, 0.18]} />
                    <meshStandardMaterial color="#e9e4d6" />
                </mesh>
            ))}
            {/* dashed center */}
            {Array.from({ length: dashCount }).map((_, i) => (
                <mesh key={i} position={[-len / 2 + 3 + i * 6, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[2.6, 0.2]} />
                    <meshStandardMaterial color="#f2ede0" />
                </mesh>
            ))}
            {/* hazard barrier strip down the middle (yellow/black) */}
            {r.hazard &&
                Array.from({ length: Math.floor(len / 2) }).map((_, i) => (
                    <mesh key={"h" + i} position={[-len / 2 + 1 + i * 2, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[1, 0.5]} />
                        <meshStandardMaterial color={i % 2 ? "#111" : "#f4c020"} />
                    </mesh>
                ))}
            {/* street lights */}
            {Array.from({ length: Math.max(2, Math.floor(len / 16)) }).map((_, i) => (
                <StreetLight key={i} x={-len / 2 + 8 + i * 16} z={wid / 2 + 0.6} />
            ))}
            <Html position={[0, 2.5, 0]} center distanceFactor={95}>
                <div style={roadTag}>{r.name}</div>
            </Html>
        </group>
    );
}
const roadTag = {
    background: "rgba(20,28,40,.82)",
    color: "#cfe0ff",
    font: "700 10px ui-sans-serif,system-ui",
    letterSpacing: 1.5,
    padding: "2px 8px",
    borderRadius: 20,
    whiteSpace: "nowrap",
    pointerEvents: "none",
};

function StreetLight({ x, z }) {
    return (
        <group position={[x, 0, z]}>
            <mesh position={[0, 1.6, 0]} castShadow>
                <cylinderGeometry args={[0.08, 0.1, 3.2, 6]} />
                <meshStandardMaterial color="#3b4048" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0.5, 3.2, 0]}>
                <sphereGeometry args={[0.16, 8, 8]} />
                <meshStandardMaterial color="#fff4c2" emissive="#ffdf7a" emissiveIntensity={1.2} />
            </mesh>
        </group>
    );
}

function Roundabout({ x, z }) {
    return (
        <group position={[x, 0.05, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2.2, 32]} />
                <meshStandardMaterial color="#4c9a3f" roughness={1} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
                <ringGeometry args={[2.2, 2.6, 32]} />
                <meshStandardMaterial color="#e9e4d6" side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0, 0.6, 0]} castShadow>
                <coneGeometry args={[0.6, 1.2, 8]} />
                <meshStandardMaterial color="#2f6130" flatShading />
            </mesh>
        </group>
    );
}

function Zebra({ x, z, vertical }) {
    return (
        <group position={[x, 0.05, z]} rotation={[0, vertical ? Math.PI / 2 : 0, 0]}>
            {Array.from({ length: 7 }).map((_, i) => (
                <mesh key={i} position={[-3 + i, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.5, 4]} />
                    <meshStandardMaterial color="#f2ede0" />
                </mesh>
            ))}
        </group>
    );
}

/* ============================================================================
   PARK / STP / GATE (kept lighter than before, map-appropriate)
   ============================================================================ */
function Park({ tex }) {
    const p = parkBlock[0];
    return (
        <group position={[p.x, 0, p.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]} receiveShadow>
                <planeGeometry args={[p.w - 0.5, p.d - 0.5]} />
                <meshStandardMaterial map={tex.grass} roughness={1} />
            </mesh>
            {/* walking track */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
                <ringGeometry args={[9.5, 10.6, 40]} />
                <meshStandardMaterial color="#c8a06a" roughness={1} side={THREE.DoubleSide} />
            </mesh>
            {/* trees dotted */}
            {[[-14, -7], [12, 7], [-10, 6], [14, -6], [0, 8], [6, -8]].map(([dx, dz], i) => (
                <group key={i} position={[dx, 0, dz]}>
                    <mesh position={[0, 0.8, 0]} castShadow>
                        <cylinderGeometry args={[0.14, 0.2, 1.6, 6]} />
                        <meshStandardMaterial color="#6b4a2f" />
                    </mesh>
                    <mesh position={[0, 2, 0]} castShadow>
                        <icosahedronGeometry args={[1.1, 0]} />
                        <meshStandardMaterial color="#3f7d3a" flatShading />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

function STP() {
    const s = parkBlock[1];
    return (
        <group position={[s.x, 0, s.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
                <planeGeometry args={[6, 6.5]} />
                <meshStandardMaterial color="#9aa0aa" roughness={1} />
            </mesh>
            {[[-1.3, 0], [1.3, 0]].map(([dx], i) => (
                <mesh key={i} position={[dx, 1, 0]} castShadow>
                    <cylinderGeometry args={[0.9, 0.9, 2, 16]} />
                    <meshStandardMaterial color="#c7cdd6" metalness={0.4} roughness={0.5} />
                </mesh>
            ))}
        </group>
    );
}

function BoundaryWall({ tex }) {
    const segs = [];
    for (let i = 0; i < WALL_PATH.length - 1; i++) {
        const [x1, z1] = WALL_PATH[i];
        const [x2, z2] = WALL_PATH[i + 1];
        segs.push({
            mx: (x1 + x2) / 2,
            mz: (z1 + z2) / 2,
            len: Math.hypot(x2 - x1, z2 - z1),
            ang: Math.atan2(z2 - z1, x2 - x1),
            gate: i === 0,
        });
    }
    return (
        <group>
            {segs.map((sg, i) => {
                if (sg.gate) {
                    const gateW = 14;
                    const segLen = sg.len / 2 - gateW / 2;
                    return (
                        <group key={i} position={[sg.mx, 0, sg.mz]} rotation={[0, -sg.ang, 0]}>
                            {[-1, 1].map((sn) => (
                                <mesh key={sn} position={[sn * (gateW / 2 + segLen / 2), 0.75, 0]} castShadow>
                                    <boxGeometry args={[segLen, 1.5, 0.5]} />
                                    <meshStandardMaterial map={tex.stone} roughness={1} />
                                </mesh>
                            ))}
                            {[-1, 1].map((sn) => (
                                <mesh key={"p" + sn} position={[sn * (gateW / 2), 1.2, 0]} castShadow>
                                    <boxGeometry args={[0.8, 2.4, 0.8]} />
                                    <meshStandardMaterial color="#dfd7c8" />
                                </mesh>
                            ))}
                            <mesh position={[0, 2.8, 0]} castShadow>
                                <boxGeometry args={[gateW + 1.4, 1, 0.5]} />
                                <meshStandardMaterial color="#1b2a4a" />
                            </mesh>
                            <Html position={[0, 2.8, 0.35]} center distanceFactor={55}>
                                <div style={nameBoard}>BASAVA GANGURU · ENTRY</div>
                            </Html>
                        </group>
                    );
                }
                return (
                    <mesh key={i} position={[sg.mx, 0.75, sg.mz]} rotation={[0, -sg.ang, 0]} castShadow receiveShadow>
                        <boxGeometry args={[sg.len, 1.5, 0.5]} />
                        <meshStandardMaterial map={tex.stone} roughness={1} />
                    </mesh>
                );
            })}
        </group>
    );
}
const nameBoard = {
    color: "#ffd98a",
    font: "800 11px ui-serif,Georgia,serif",
    letterSpacing: 1.5,
    whiteSpace: "nowrap",
    pointerEvents: "none",
    textShadow: "0 2px 8px #000",
};

/* ============================================================================
   GROUND (soil) + CONTEXT
   ============================================================================ */
function Ground({ tex }) {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CENTER.x, -0.02, CENTER.z]} receiveShadow>
            <planeGeometry args={[460, 400]} />
            <meshStandardMaterial map={tex.soil} roughness={1} />
        </mesh>
    );
}
function SurveyContext() {
    return (
        <>
            {SURVEY_CONTEXT.map((sv, i) => (
                <Html key={i} position={[sv.x, 0.3, sv.z]} center distanceFactor={130}>
                    <div style={surveyTag}>{sv.name}</div>
                </Html>
            ))}
        </>
    );
}
const surveyTag = {
    color: "#5a4a30",
    font: "600 11px ui-sans-serif,system-ui",
    background: "rgba(255,250,235,.6)",
    padding: "2px 8px",
    borderRadius: 10,
    border: "1px dashed #b09668",
    whiteSpace: "nowrap",
    pointerEvents: "none",
};

/* ============================================================================
   CAMERA — intro + focus
   ============================================================================ */
function CameraRig({ intro, focusTarget, controlsRef }) {
    const { camera } = useThree();
    const t0 = useRef(null);
    useFrame((st) => {
        if (intro.current) {
            if (t0.current === null) t0.current = st.clock.elapsedTime;
            const t = Math.min((st.clock.elapsedTime - t0.current) / 2.2, 1);
            const e = 1 - Math.pow(1 - t, 3);
            const a = new THREE.Vector3(CENTER.x, 200, CENTER.z + 220);
            const b = new THREE.Vector3(CENTER.x - 10, 92, CENTER.z + 88);
            camera.position.lerpVectors(a, b, e);
            camera.lookAt(CENTER.x, 0, CENTER.z);
            if (controlsRef.current) controlsRef.current.target.set(CENTER.x, 0, CENTER.z);
            if (t >= 1) intro.current = false;
        }
        if (focusTarget.current && controlsRef.current) {
            const tg = controlsRef.current.target;
            tg.lerp(focusTarget.current, 0.09);
            if (tg.distanceTo(focusTarget.current) < 0.4) focusTarget.current = null;
            controlsRef.current.update();
        }
    });
    return null;
}

/* ============================================================================
   SCENE
   ============================================================================ */
function Scene({ hovered, selectedId, onHover, onSelect, focusTarget, showDims, mobile }) {
    const intro = useRef(true);
    const controlsRef = useRef();
    const tex = useTextures();

    useEffect(() => {
        Scene._focus = (v) => (focusTarget.current = v);
    }, [focusTarget]);

    return (
        <>
            <color attach="background" args={["#cfe4f5"]} />
            <fog attach="fog" args={["#cfe4f5", 180, 420]} />
            <ambientLight intensity={0.75} />
            <directionalLight
                position={[70, 90, 40]}
                intensity={1.6}
                color="#fff3da"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-140}
                shadow-camera-right={140}
                shadow-camera-top={140}
                shadow-camera-bottom={-140}
            />
            <directionalLight position={[-40, 40, -30]} intensity={0.3} color="#bcd8f0" />

            <Ground tex={tex} />
            <SurveyContext />
            <BoundaryWall tex={tex} />

            {ROADS.map((r, i) => (
                <Road key={i} r={r} tex={tex} />
            ))}
            {ROUNDABOUTS.map(([x, z], i) => (
                <Roundabout key={i} x={x} z={z} />
            ))}
            {ZEBRAS.map((z, i) => (
                <Zebra key={i} {...z} />
            ))}

            <Park tex={tex} />
            <STP />

            {ALL.map((s) => (
                <Plot
                    key={s.id}
                    s={s}
                    hovered={hovered}
                    selectedId={selectedId}
                    onHover={onHover}
                    onSelect={onSelect}
                    showDims={showDims}
                />
            ))}

            <CameraRig intro={intro} focusTarget={focusTarget} controlsRef={controlsRef} />
            <OrbitControls
                ref={controlsRef}
                enablePan
                enableDamping
                dampingFactor={0.08}
                minDistance={mobile ? 45 : 30}
                maxDistance={320}
                maxPolarAngle={Math.PI / 2.1}
                target={[CENTER.x, 0, CENTER.z]}
            />
        </>
    );
}

/* ============================================================================
   SUPABASE-READY BOOKING
   ============================================================================ */
async function bookSite(site, action) {
    // TODO: import { supabase } from "@/lib/supabaseClient"
    // await supabase.from("bookings").insert({
    //   site_no: site.no, sqft: Math.round(site.areaSqm*SQM_TO_SQFT),
    //   action, layout: "basava-ganguru-43-1", created_at: new Date().toISOString(),
    // });
    console.log("[booking]", action, "· site", site.no);
    if (typeof window !== "undefined")
        window.dispatchEvent(new CustomEvent("bg-toast", { detail: { action, no: site.no } }));
    return { ok: true };
}

/* ============================================================================
   HOOKS
   ============================================================================ */
function useIsMobile() {
    const [m, setM] = useState(false);
    useEffect(() => {
        const on = () => setM(window.innerWidth < 820);
        on();
        window.addEventListener("resize", on);
        return () => window.removeEventListener("resize", on);
    }, []);
    return m;
}

/* ============================================================================
   SELECTED CARD  (Plotex-style: badge + big number + dims + sqft + CTAs)
   ============================================================================ */
function SelectedCard({ s, onLocate, onClose }) {
    const sqft = Math.round(s.areaSqm * SQM_TO_SQFT);
    const price = sqft * PRICE_PER_SQFT;
    const badge =
        s.status === "sold" ? ["SOLD", C.sold] : s.status === "booked" ? ["BOOKED", C.booked] : ["AVAILABLE", "#39c46e"];
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ background: badge[1], color: "#04140d", font: "800 11px ui-sans-serif", letterSpacing: 1, padding: "3px 12px", borderRadius: 6 }}>
                    {badge[0]}
                </div>
                {onClose && <button onClick={onClose} style={xBtn}>✕</button>}
            </div>
            <div style={{ font: "800 46px ui-sans-serif,system-ui", color: "#fff", lineHeight: 1, marginTop: 8 }}>{s.no}</div>
            <div style={{ font: "600 14px ui-sans-serif", color: "#cbd6ea", marginTop: 6 }}>
                {ftIn(s.w)} × {ftIn(s.d)} &nbsp;·&nbsp; {s.w}×{s.d}m
            </div>
            <div style={{ font: "700 16px ui-sans-serif", color: "#7fd4ff", marginTop: 2 }}>{sqft} sqft</div>

            <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                <Tag>{s.facing} Facing</Tag>
                {s.corner && <Tag c="#ff8a3d">Corner</Tag>}
                {s.premium && <Tag c="#a56bff">Premium</Tag>}
            </div>

            <div style={priceBox}>
                <div style={{ font: "600 11px ui-sans-serif", color: "#9fb0d0", letterSpacing: 1 }}>PRICE @ {INR(PRICE_PER_SQFT)}/sqft</div>
                <div style={{ font: "800 26px ui-sans-serif,system-ui", color: "#fff" }}>{INR(price)}</div>
                <div style={{ font: "11px ui-sans-serif", color: "#8ea3c6" }}>excl. registration & taxes</div>
            </div>

            {s.status !== "sold" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                    <ActionBtn primary onClick={() => bookSite(s, "book")}>Book Site</ActionBtn>
                    <ActionBtn onClick={() => bookSite(s, "interested")}>Enquire #{s.no}</ActionBtn>
                    <ActionBtn onClick={() => bookSite(s, "brochure")}>Brochure</ActionBtn>
                    <ActionBtn onClick={onLocate}>Locate</ActionBtn>
                </div>
            )}
        </div>
    );
}
const xBtn = { background: "none", border: "none", color: "#8ea3c6", fontSize: 16, cursor: "pointer" };
function Tag({ children, c = "#3a4a6a" }) {
    return (
        <span style={{ font: "600 11px ui-sans-serif", color: "#dfe8fb", background: c + "33", border: `1px solid ${c}`, borderRadius: 20, padding: "3px 9px" }}>
            {children}
        </span>
    );
}
const priceBox = {
    marginTop: 12,
    padding: "12px 14px",
    background: "linear-gradient(135deg, rgba(74,163,255,.2), rgba(127,212,255,.15))",
    border: "1px solid rgba(127,212,255,.4)",
    borderRadius: 14,
};
function ActionBtn({ children, onClick, primary }) {
    return (
        <button
            onClick={onClick}
            style={{
                font: "700 13px ui-sans-serif,system-ui",
                color: primary ? "#04140d" : "#dfe8fb",
                background: primary ? "#39c46e" : "rgba(255,255,255,.06)",
                border: `1px solid ${primary ? "#39c46e" : "#2a3a5c"}`,
                borderRadius: 12,
                padding: "11px 8px",
                cursor: "pointer",
            }}
        >
            {children}
        </button>
    );
}

/* ============================================================================
   TOAST
   ============================================================================ */
function Toast() {
    const [msg, setMsg] = useState(null);
    useEffect(() => {
        const on = (e) => {
            const { action, no } = e.detail;
            const map = { book: "Booking request sent", interested: "Enquiry sent", brochure: "Brochure requested" };
            setMsg(`${map[action] || "Done"} · Site ${no}`);
            setTimeout(() => setMsg(null), 2500);
        };
        window.addEventListener("bg-toast", on);
        return () => window.removeEventListener("bg-toast", on);
    }, []);
    return (
        <AnimatePresence>
            {msg && (
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} style={toastStyle}>
                    {msg}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
const toastStyle = {
    position: "absolute",
    bottom: 92,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#39c46e",
    color: "#04140d",
    font: "700 13px ui-sans-serif,system-ui",
    padding: "10px 18px",
    borderRadius: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,.4)",
    zIndex: 40,
};

/* ============================================================================
   BOTTOM TOOLBAR (Plotex-style)
   ============================================================================ */
function Toolbar({ query, setQuery, onSearch, showDims, setShowDims, onShare, onReset }) {
    return (
        <div style={toolbarWrap}>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,.95)", borderRadius: 30, padding: "6px 6px 6px 16px", boxShadow: "0 8px 30px rgba(0,0,0,.18)" }}>
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSearch()}
                    placeholder="Search plot number…"
                    style={{ border: "none", outline: "none", font: "500 14px ui-sans-serif", width: 150, background: "transparent" }}
                />
                <IconBtn label="Search" onClick={onSearch}>🔍</IconBtn>
                <IconBtn label="Toggle dimensions" active={showDims} onClick={() => setShowDims((v) => !v)}>📐</IconBtn>
                <IconBtn label="Locate / reset" onClick={onReset}>🎯</IconBtn>
                <IconBtn label="Share" onClick={onShare}>🔗</IconBtn>
            </div>
        </div>
    );
}
function IconBtn({ children, onClick, label, active }) {
    return (
        <button
            title={label}
            onClick={onClick}
            style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                border: "none",
                marginLeft: 4,
                cursor: "pointer",
                background: active ? "#4aa3ff" : "#eef2f7",
                fontSize: 15,
            }}
        >
            {children}
        </button>
    );
}
const toolbarWrap = {
    position: "absolute",
    bottom: 22,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 30,
};

/* ============================================================================
   COMPASS
   ============================================================================ */
function Compass({ onReset }) {
    return (
        <button onClick={onReset} title="Reset to North" style={{ position: "absolute", top: 90, right: 20, background: "none", border: "none", cursor: "pointer", zIndex: 20 }}>
            <svg width="52" height="52" viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="23" fill="rgba(255,255,255,.92)" stroke="#d0d6de" />
                <polygon points="26,6 31,26 26,22 21,26" fill="#e04a5a" />
                <polygon points="26,46 31,26 26,30 21,26" fill="#8892a3" />
                <text x="26" y="16" fontSize="9" fill="#222" textAnchor="middle" fontWeight="700">N</text>
            </svg>
        </button>
    );
}

/* ============================================================================
   ROOT
   ============================================================================ */
export default function BasavaGanguru3DLayout() {
    const mobile = useIsMobile();
    const [hovered, setHovered] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const [showDims, setShowDims] = useState(!mobile);
    const [query, setQuery] = useState("");
    const focusTarget = useRef(null);

    const selected = useMemo(() => RESIDENTIAL.find((s) => s.id === selectedId) || null, [selectedId]);
    const onSelect = useCallback((id) => setSelectedId((prev) => (prev === id ? null : id)), []);

    const focusOn = useCallback((x, z) => {
        focusTarget.current = new THREE.Vector3(x, 0, z);
        if (Scene._focus) Scene._focus(focusTarget.current);
    }, []);

    const locate = useCallback(() => selected && focusOn(selected.x, selected.z), [selected, focusOn]);
    const resetView = useCallback(() => focusOn(CENTER.x, CENTER.z), [focusOn]);

    const onSearch = useCallback(() => {
        const n = parseInt(query, 10);
        const hit = RESIDENTIAL.find((s) => s.no === n);
        if (hit) {
            setSelectedId(hit.id);
            focusOn(hit.x, hit.z);
        }
    }, [query, focusOn]);

    const onShare = useCallback(() => {
        if (typeof navigator !== "undefined" && navigator.share)
            navigator.share({ title: "Basava Ganguru Layout", url: window.location.href }).catch(() => { });
        else if (typeof navigator !== "undefined")
            navigator.clipboard?.writeText(window.location.href);
    }, []);

    const stats = useMemo(() => ({
        total: RESIDENTIAL.length,
        avail: RESIDENTIAL.filter((s) => s.status === "available").length,
    }), []);

    return (
        <div style={{ position: "relative", width: "100%", height: "100vh", background: "#cfe4f5", overflow: "hidden", fontFamily: "ui-sans-serif,system-ui", touchAction: "none" }}>
            <Canvas shadows dpr={[1, mobile ? 1.5 : 2]} camera={{ position: [CENTER.x, 200, CENTER.z + 220], fov: 42 }} onPointerMissed={() => setHovered(null)}>
                <Suspense fallback={null}>
                    <Scene
                        hovered={hovered}
                        selectedId={selectedId}
                        onHover={setHovered}
                        onSelect={onSelect}
                        focusTarget={focusTarget}
                        showDims={showDims}
                        mobile={mobile}
                    />
                </Suspense>
            </Canvas>

            {/* Header */}
            <motion.div initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
                style={{ position: "absolute", top: 16, left: 18, display: "flex", alignItems: "center", gap: 10, pointerEvents: "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#4aa3ff,#39c46e)", display: "grid", placeItems: "center", color: "#fff", font: "800 16px ui-sans-serif" }}>B</div>
                <div>
                    <div style={{ font: "800 18px ui-sans-serif,system-ui", color: "#0b2038" }}>Basava Ganguru</div>
                    <div style={{ font: "600 11px ui-sans-serif", color: "#4a6285" }}>SY.NO.43/1 · BUDA Approved · {stats.avail}/{stats.total} available</div>
                </div>
            </motion.div>

            <Compass onReset={resetView} />
            <Toast />

            <Toolbar
                query={query}
                setQuery={setQuery}
                onSearch={onSearch}
                showDims={showDims}
                setShowDims={setShowDims}
                onShare={onShare}
                onReset={resetView}
            />

            {/* Enquire CTA (updates with selection) */}
            <button
                onClick={() => selected ? bookSite(selected, "interested") : bookSite({ no: "layout", areaSqm: 0 }, "interested")}
                style={enquireCTA}
            >
                💬 {selected ? `Enquire #${selected.no}` : "Enquire Now"}
            </button>

            {/* Desktop sidebar */}
            {!mobile && (
                <AnimatePresence>
                    {selected && (
                        <motion.div key="sb" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 26 }} style={sidebar}>
                            <SelectedCard s={selected} onLocate={locate} onClose={() => setSelectedId(null)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Mobile bottom sheet */}
            {mobile && (
                <AnimatePresence>
                    {selected && (
                        <motion.div key="sh" initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: "spring", stiffness: 260, damping: 30 }} style={sheet}>
                            <div style={{ width: 40, height: 4, background: "#3a4a6a", borderRadius: 4, margin: "0 auto 12px" }} />
                            <SelectedCard s={selected} onLocate={locate} onClose={() => setSelectedId(null)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}

const glass = {
    background: "rgba(15,22,36,.82)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(90,120,180,.35)",
    boxShadow: "0 24px 70px rgba(0,0,0,.5)",
    color: "#f2f6ff",
};
const sidebar = { ...glass, position: "absolute", top: 90, right: 20, width: 320, borderRadius: 20, padding: 20, zIndex: 25 };
const sheet = { ...glass, position: "absolute", left: 0, right: 0, bottom: 0, borderRadius: "22px 22px 0 0", padding: "16px 18px 26px", zIndex: 30 };
const enquireCTA = {
    position: "absolute",
    bottom: 22,
    right: 20,
    background: "#39c46e",
    color: "#fff",
    font: "700 14px ui-sans-serif,system-ui",
    border: "none",
    borderRadius: 30,
    padding: "12px 22px",
    cursor: "pointer",
    boxShadow: "0 8px 26px rgba(57,196,110,.5)",
    zIndex: 30,
};