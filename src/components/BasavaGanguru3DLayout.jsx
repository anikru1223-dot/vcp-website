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
import { OrbitControls, Html, Text, RoundedBox } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

/* ============================================================================
   BASAVA GANGURU — SY.NO.43/1  ·  Plotex-style Interactive 3D Layout (clone)
   Raised 3D plot blocks on a beveled tan terrain pad · dark inset roads ·
   procedural in-code textures · Plotex chrome (logo, compass, side buttons,
   bottom pill toolbar, green Enquire) · Supabase-ready booking.
   Route: src/app/layout-3d/page.tsx  ->  <BasavaGanguru3DLayout/>
   Deps: three @react-three/fiber @react-three/drei framer-motion
   ============================================================================ */

const PRICE_PER_SQFT = 2300;
const SQM_TO_SQFT = 10.7639;
const M_TO_FT = 3.28084;
const INR = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const ftIn = (m) => {
    const totalIn = m * M_TO_FT * 12;
    const ft = Math.floor(totalIn / 12);
    const inch = Math.round(totalIn - ft * 12);
    return inch === 12 ? `${ft + 1}'0"` : `${ft}'${inch}"`;
};

/* Plotex-ish palette */
const C = {
    available: "#3aa0ee",
    availableSide: "#7a5a34",
    booked: "#e6b23c",
    sold: "#8a94a6",
    selected: "#8fe0ff",
    hovered: "#ffd76a",
    ca: "#b1a2f0",
    park: "#4c9a3f",
    terrain: "#c9ad82",
    terrainSide: "#7d6547",
};

/* ============================================================================
   DATA — 4 BUDA classes, 32 sites
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
const middleRightTop = [mk(25, 71, 4.5, 4.5, 9.0, {}), mk(24, 76, 4.5, 4.5, 9.0, { corner: true })];
const middleRight = [23, 22, 21, 20, 19, 18].map((no, i) =>
    mk(no, 73.5, 14.5 + i * 10.2, 9.0, 16.05, { corner: i === 5, premium: no === 21 })
);
const rightCol = [26, 27, 28, 29, 30, 31, 32].map((no, i) =>
    mk(no, 92, 4.5 + i * 10.2, 9.0, 15.0, { corner: i === 0 || i === 6, premium: no === 32 })
);

const ALL = [...blockA, ...blockB, ...parkBlock, ...middleLeft, ...middleRightTop, ...middleRight, ...rightCol];
const RESIDENTIAL = ALL.filter((s) => s.kind === "residential");
const SEED = { 2: "sold", 5: "booked", 9: "sold", 13: "booked", 20: "sold", 27: "booked", 30: "sold" };
RESIDENTIAL.forEach((s) => SEED[s.no] && (s.status = SEED[s.no]));

const ROADS = [
    { x: 48, z: -6, w: 104, d: 12, name: "12M ROAD", vertical: false, hazard: true },
    { x: 45, z: 23.5, w: 96, d: 9, name: "9M ROAD", vertical: false },
    { x: 47, z: 34, w: 9, d: 70, name: "9M ROAD", vertical: true, hazard: true },
    { x: 82, z: 34, w: 9, d: 70, name: "9M ROAD", vertical: true },
    { x: 24, z: 42.5, w: 42, d: 3, name: "3M PATHWAY", vertical: false },
];
const ROUNDABOUTS = [[47, 23.5], [82, 23.5]];
const ZEBRAS = [{ x: 47, z: 17 }, { x: 82, z: 17 }];
const SURVEY = [
    { name: "Sy.No.39", x: -18, z: -22 },
    { name: "Sy.No.42", x: 48, z: -26 },
    { name: "Sy.No.43/3", x: 118, z: 8 },
    { name: "Sy.No.44", x: -20, z: 30 },
    { name: "Sy.No.46", x: 55, z: 78 },
];
const WALL_PATH = [[-3, -8], [101, -6], [104, 40], [70, 64], [-4, 60], [-3, -8]];
const BOUNDS = { minX: -6, maxX: 104, minZ: -14, maxZ: 66 };
const CENTER = { x: (BOUNDS.minX + BOUNDS.maxX) / 2, z: (BOUNDS.minZ + BOUNDS.maxZ) / 2 };

/* ============================================================================
   PROCEDURAL TEXTURES
   ============================================================================ */
function tex(draw, size = 256, repeat = 1) {
    const cv = document.createElement("canvas");
    cv.width = cv.height = size;
    draw(cv.getContext("2d"), size);
    const t = new THREE.CanvasTexture(cv);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.anisotropy = 4;
    return t;
}
function useTextures() {
    return useMemo(() => {
        const asphalt = tex((c, s) => {
            c.fillStyle = "#23262c";
            c.fillRect(0, 0, s, s);
            for (let i = 0; i < 2600; i++) {
                const g = 20 + Math.random() * 40;
                c.fillStyle = `rgba(${g},${g},${g + 4},${Math.random() * 0.5})`;
                c.fillRect(Math.random() * s, Math.random() * s, 1.4, 1.4);
            }
        }, 256, 6);
        const soil = tex((c, s) => {
            c.fillStyle = "#c9ad82";
            c.fillRect(0, 0, s, s);
            for (let i = 0; i < 3200; i++) {
                c.fillStyle = Math.random() > 0.5 ? "rgba(160,134,96,.45)" : "rgba(214,196,166,.45)";
                c.fillRect(Math.random() * s, Math.random() * s, 2, 2);
            }
        }, 256, 16);
        const grass = tex((c, s) => {
            c.fillStyle = "#4c9a3f";
            c.fillRect(0, 0, s, s);
            for (let i = 0; i < 4000; i++) {
                const g = 100 + Math.random() * 80;
                c.strokeStyle = `rgba(40,${g},40,.5)`;
                c.beginPath();
                const x = Math.random() * s, y = Math.random() * s;
                c.moveTo(x, y);
                c.lineTo(x + (Math.random() - 0.5) * 3, y - 2 - Math.random() * 3);
                c.stroke();
            }
        }, 256, 10);
        const stone = tex((c, s) => {
            c.fillStyle = "#7d766b";
            c.fillRect(0, 0, s, s);
            for (let i = 0; i < 60; i++) {
                const x = Math.random() * s, y = Math.random() * s, r = 8 + Math.random() * 16;
                c.fillStyle = `hsl(${30 + Math.random() * 20},${8 + Math.random() * 12}%,${40 + Math.random() * 25}%)`;
                c.beginPath();
                c.ellipse(x, y, r, r * (0.6 + Math.random() * 0.4), Math.random() * 3, 0, 7);
                c.fill();
                c.strokeStyle = "rgba(40,36,30,.6)";
                c.lineWidth = 1.5;
                c.stroke();
            }
        }, 256, 3);
        return { asphalt, soil, grass, stone };
    }, []);
}

/* ============================================================================
   RAISED PLOT BLOCK  (top slab + visible earth sides) — the Plotex "land" look
   ============================================================================ */
const PLOT_H = 1.6; // block height above terrain

function Plot({ s, hovered, selectedId, onHover, onSelect, showDims }) {
    const isRes = s.kind === "residential";
    const clickable = isRes && s.status !== "sold";
    const isHover = hovered === s.id;
    const isSel = selectedId === s.id;
    const grpRef = useRef();

    const top = useMemo(() => {
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
    const lift = isSel ? 0.9 : isHover ? 0.45 : 0;

    useFrame((_, dt) => {
        if (grpRef.current)
            grpRef.current.position.y = THREE.MathUtils.damp(grpRef.current.position.y, lift, 10, dt);
    });

    return (
        <group ref={grpRef} position={[s.x, 0, s.z]}>
            {/* earth block (sides) */}
            <mesh position={[0, PLOT_H / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[w, PLOT_H, d]} />
                <meshStandardMaterial color={C.availableSide} roughness={1} />
            </mesh>
            {/* colored top slab */}
            <mesh
                position={[0, PLOT_H + 0.02, 0]}
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
                <meshStandardMaterial color={top} roughness={0.7} metalness={0.02} />
            </mesh>

            {/* white outline on select/hover */}
            {(isSel || isHover) && isRes && (
                <lineSegments position={[0, PLOT_H + 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <edgesGeometry args={[new THREE.PlaneGeometry(w, d)]} />
                    <lineBasicMaterial color={isSel ? "#ffffff" : "#fff6d0"} linewidth={2} />
                </lineSegments>
            )}

            {/* number */}
            <Text
                position={[0, PLOT_H + 0.05, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={isRes ? 2.3 : s.kind === "park" ? 3.2 : 1.9}
                color={isRes ? "#08243f" : "#12331f"}
                anchorX="center"
                anchorY="middle"
            >
                {isRes ? String(s.no) : s.label}
            </Text>

            {/* dimension pills */}
            {showDims && isRes && (
                <>
                    <Html position={[0, PLOT_H + 0.1, -d / 2]} center distanceFactor={95}>
                        <div style={dimPill}>{s.w.toFixed(2)}m · {ftIn(s.w)}</div>
                    </Html>
                    <Html position={[-w / 2, PLOT_H + 0.1, 0]} center distanceFactor={95}>
                        <div style={dimPill}>{s.d.toFixed(2)}m</div>
                    </Html>
                    <Html position={[0, PLOT_H + 0.1, d / 2 - 0.2]} center distanceFactor={110}>
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
const sqftTag = { color: "#08243f", font: "700 10px ui-sans-serif,system-ui", whiteSpace: "nowrap", pointerEvents: "none" };

/* ============================================================================
   TERRAIN PAD (beveled tan base under everything)
   ============================================================================ */
function TerrainPad({ tx }) {
    // extruded polygon roughly following the site boundary, with thickness
    const shape = useMemo(() => {
        const sh = new THREE.Shape();
        const pad = 6;
        const pts = [
            [-3 - pad, -8 - pad],
            [101 + pad, -6 - pad],
            [104 + pad, 40],
            [70, 64 + pad],
            [-4 - pad, 60 + pad],
        ];
        sh.moveTo(pts[0][0], pts[0][1]);
        pts.slice(1).forEach(([x, z]) => sh.lineTo(x, z));
        sh.closePath();
        return sh;
    }, []);
    const geo = useMemo(() => {
        const g = new THREE.ExtrudeGeometry(shape, { depth: 3, bevelEnabled: true, bevelThickness: 1.2, bevelSize: 1.2, bevelSegments: 2 });
        g.rotateX(-Math.PI / 2);
        return g;
    }, [shape]);
    return (
        <mesh geometry={geo} position={[0, -3, 0]} receiveShadow castShadow>
            <meshStandardMaterial map={tx.soil} roughness={1} />
        </mesh>
    );
}

/* ============================================================================
   ROADS — dark inset channels
   ============================================================================ */
function Road({ r, tx }) {
    const [len, wid] = r.vertical ? [r.d, r.w] : [r.w, r.d];
    const dash = Math.floor(len / 6);
    return (
        <group position={[r.x, 0, r.z]} rotation={[0, r.vertical ? Math.PI / 2 : 0, 0]}>
            {/* inset channel (slightly below plot tops) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]} receiveShadow>
                <planeGeometry args={[len, wid]} />
                <meshStandardMaterial map={tx.asphalt} roughness={0.85} metalness={0.05} />
            </mesh>
            {[1, -1].map((sn) => (
                <mesh key={sn} position={[0, 0.07, (sn * wid) / 2 - sn * 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[len, 0.16]} />
                    <meshStandardMaterial color="#e9e4d6" />
                </mesh>
            ))}
            {Array.from({ length: dash }).map((_, i) => (
                <mesh key={i} position={[-len / 2 + 3 + i * 6, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[2.6, 0.18]} />
                    <meshStandardMaterial color="#f2c200" />
                </mesh>
            ))}
            {r.hazard &&
                Array.from({ length: Math.floor(len / 2) }).map((_, i) => (
                    <mesh key={"h" + i} position={[-len / 2 + 1 + i * 2, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <planeGeometry args={[1, 0.4]} />
                        <meshStandardMaterial color={i % 2 ? "#111" : "#f4c020"} />
                    </mesh>
                ))}
            {Array.from({ length: Math.max(2, Math.floor(len / 16)) }).map((_, i) => (
                <StreetLight key={i} x={-len / 2 + 8 + i * 16} z={wid / 2 + 0.5} />
            ))}
            <Html position={[0, 2.4, 0]} center distanceFactor={95}>
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
            <mesh position={[0, 1.4, 0]} castShadow>
                <cylinderGeometry args={[0.07, 0.09, 2.8, 6]} />
                <meshStandardMaterial color="#3b4048" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0.4, 2.8, 0]}>
                <sphereGeometry args={[0.14, 8, 8]} />
                <meshStandardMaterial color="#fff4c2" emissive="#ffdf7a" emissiveIntensity={1.2} />
            </mesh>
        </group>
    );
}
function Roundabout({ x, z }) {
    return (
        <group position={[x, 0.06, z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[2, 32]} />
                <meshStandardMaterial color="#4c9a3f" roughness={1} />
            </mesh>
            <mesh position={[0, 0.5, 0]} castShadow>
                <coneGeometry args={[0.5, 1, 8]} />
                <meshStandardMaterial color="#2f6130" flatShading />
            </mesh>
        </group>
    );
}
function Zebra({ x, z }) {
    return (
        <group position={[x, 0.07, z]}>
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
   PARK / STP / WALL / CONTEXT
   ============================================================================ */
function Park({ tx }) {
    const p = parkBlock[0];
    return (
        <group position={[p.x, 0, p.z]}>
            <mesh position={[0, PLOT_H / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[p.w - 0.5, PLOT_H, p.d - 0.5]} />
                <meshStandardMaterial color={C.availableSide} roughness={1} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLOT_H + 0.02, 0]} receiveShadow>
                <planeGeometry args={[p.w - 0.5, p.d - 0.5]} />
                <meshStandardMaterial map={tx.grass} roughness={1} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, PLOT_H + 0.04, 0]}>
                <ringGeometry args={[9.5, 10.6, 40]} />
                <meshStandardMaterial color="#c8a06a" roughness={1} side={THREE.DoubleSide} />
            </mesh>
            {[[-14, -7], [12, 7], [-10, 6], [14, -6], [0, 8], [6, -8]].map(([dx, dz], i) => (
                <group key={i} position={[dx, PLOT_H, dz]}>
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
            <mesh position={[0, PLOT_H / 2, 0]} castShadow>
                <boxGeometry args={[6, PLOT_H, 6.5]} />
                <meshStandardMaterial color="#9aa0aa" roughness={1} />
            </mesh>
            {[[-1.3, 0], [1.3, 0]].map(([dx], i) => (
                <mesh key={i} position={[dx, PLOT_H + 1, 0]} castShadow>
                    <cylinderGeometry args={[0.9, 0.9, 2, 16]} />
                    <meshStandardMaterial color="#c7cdd6" metalness={0.4} roughness={0.5} />
                </mesh>
            ))}
        </group>
    );
}
function BoundaryWall({ tx }) {
    const segs = [];
    for (let i = 0; i < WALL_PATH.length - 1; i++) {
        const [x1, z1] = WALL_PATH[i];
        const [x2, z2] = WALL_PATH[i + 1];
        segs.push({ mx: (x1 + x2) / 2, mz: (z1 + z2) / 2, len: Math.hypot(x2 - x1, z2 - z1), ang: Math.atan2(z2 - z1, x2 - x1), gate: i === 0 });
    }
    return (
        <group>
            {segs.map((sg, i) => {
                if (sg.gate) {
                    const gateW = 14, segLen = sg.len / 2 - gateW / 2;
                    return (
                        <group key={i} position={[sg.mx, 0, sg.mz]} rotation={[0, -sg.ang, 0]}>
                            {[-1, 1].map((sn) => (
                                <mesh key={sn} position={[sn * (gateW / 2 + segLen / 2), 0.75, 0]} castShadow>
                                    <boxGeometry args={[segLen, 1.5, 0.5]} />
                                    <meshStandardMaterial map={tx.stone} roughness={1} />
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
                                <div style={nameBoard}>ENTRY · BASAVA GANGURU</div>
                            </Html>
                        </group>
                    );
                }
                return (
                    <mesh key={i} position={[sg.mx, 0.75, sg.mz]} rotation={[0, -sg.ang, 0]} castShadow receiveShadow>
                        <boxGeometry args={[sg.len, 1.5, 0.5]} />
                        <meshStandardMaterial map={tx.stone} roughness={1} />
                    </mesh>
                );
            })}
        </group>
    );
}
const nameBoard = { color: "#ffd98a", font: "800 11px ui-serif,Georgia,serif", letterSpacing: 1.5, whiteSpace: "nowrap", pointerEvents: "none", textShadow: "0 2px 8px #000" };

function SurveyContext() {
    return (
        <>
            {SURVEY.map((sv, i) => (
                <Html key={i} position={[sv.x, 0.4, sv.z]} center distanceFactor={130}>
                    <div style={surveyTag}>{sv.name}</div>
                </Html>
            ))}
        </>
    );
}
const surveyTag = { color: "#5a4a30", font: "600 11px ui-sans-serif,system-ui", background: "rgba(255,250,235,.6)", padding: "2px 8px", borderRadius: 10, border: "1px dashed #b09668", whiteSpace: "nowrap", pointerEvents: "none" };

/* ============================================================================
   CAMERA
   ============================================================================ */
function CameraRig({ intro, focusTarget, controlsRef }) {
    const { camera } = useThree();
    const t0 = useRef(null);
    useFrame((st) => {
        if (intro.current) {
            if (t0.current === null) t0.current = st.clock.elapsedTime;
            const t = Math.min((st.clock.elapsedTime - t0.current) / 2.2, 1);
            const e = 1 - Math.pow(1 - t, 3);
            const a = new THREE.Vector3(CENTER.x, 210, CENTER.z + 230);
            const b = new THREE.Vector3(CENTER.x - 8, 96, CENTER.z + 92);
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
    const tx = useTextures();
    useEffect(() => {
        Scene._focus = (v) => (focusTarget.current = v);
    }, [focusTarget]);

    return (
        <>
            <color attach="background" args={["#cfe4f5"]} />
            <fog attach="fog" args={["#cfe4f5", 200, 460]} />
            <ambientLight intensity={0.8} />
            <directionalLight
                position={[70, 100, 40]}
                intensity={1.5}
                color="#fff3da"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-150}
                shadow-camera-right={150}
                shadow-camera-top={150}
                shadow-camera-bottom={-150}
            />
            <directionalLight position={[-40, 40, -30]} intensity={0.3} color="#bcd8f0" />

            <TerrainPad tx={tx} />
            <SurveyContext />
            <BoundaryWall tx={tx} />

            {ROADS.map((r, i) => (
                <Road key={i} r={r} tx={tx} />
            ))}
            {ROUNDABOUTS.map(([x, z], i) => (
                <Roundabout key={i} x={x} z={z} />
            ))}
            {ZEBRAS.map((z, i) => (
                <Zebra key={i} {...z} />
            ))}

            <Park tx={tx} />
            <STP />

            {ALL.map((s) => (
                <Plot key={s.id} s={s} hovered={hovered} selectedId={selectedId} onHover={onHover} onSelect={onSelect} showDims={showDims} />
            ))}

            <CameraRig intro={intro} focusTarget={focusTarget} controlsRef={controlsRef} />
            <OrbitControls
                ref={controlsRef}
                enablePan
                enableDamping
                dampingFactor={0.08}
                minDistance={mobile ? 45 : 30}
                maxDistance={340}
                maxPolarAngle={Math.PI / 2.1}
                target={[CENTER.x, 0, CENTER.z]}
            />
        </>
    );
}

/* ============================================================================
   BOOKING
   ============================================================================ */
async function bookSite(site, action) {
    // TODO: supabase.from("bookings").insert({ site_no: site.no, sqft: Math.round(site.areaSqm*SQM_TO_SQFT), action, layout:"basava-ganguru-43-1", created_at:new Date().toISOString() });
    console.log("[booking]", action, "· site", site.no);
    if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("bg-toast", { detail: { action, no: site.no } }));
    return { ok: true };
}

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
   SELECTED CARD
   ============================================================================ */
function SelectedCard({ s, onLocate, onClose }) {
    const sqft = Math.round(s.areaSqm * SQM_TO_SQFT);
    const price = sqft * PRICE_PER_SQFT;
    const badge = s.status === "sold" ? ["SOLD", C.sold] : s.status === "booked" ? ["BOOKED", C.booked] : ["AVAILABLE", "#39c46e"];
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ background: badge[1], color: "#04140d", font: "800 11px ui-sans-serif", letterSpacing: 1, padding: "3px 12px", borderRadius: 6 }}>{badge[0]}</div>
                {onClose && <button onClick={onClose} style={xBtn}>✕</button>}
            </div>
            <div style={{ font: "800 46px ui-sans-serif,system-ui", color: "#fff", lineHeight: 1, marginTop: 8 }}>{s.no}</div>
            <div style={{ font: "600 14px ui-sans-serif", color: "#cbd6ea", marginTop: 6 }}>{ftIn(s.w)} × {ftIn(s.d)} · {s.w}×{s.d}m</div>
            <div style={{ font: "700 16px ui-sans-serif", color: "#8fe0ff", marginTop: 2 }}>{sqft} sqft</div>
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
    return <span style={{ font: "600 11px ui-sans-serif", color: "#dfe8fb", background: c + "33", border: `1px solid ${c}`, borderRadius: 20, padding: "3px 9px" }}>{children}</span>;
}
const priceBox = { marginTop: 12, padding: "12px 14px", background: "linear-gradient(135deg,rgba(58,160,238,.2),rgba(143,224,255,.15))", border: "1px solid rgba(143,224,255,.4)", borderRadius: 14 };
function ActionBtn({ children, onClick, primary }) {
    return (
        <button onClick={onClick} style={{ font: "700 13px ui-sans-serif,system-ui", color: primary ? "#04140d" : "#dfe8fb", background: primary ? "#39c46e" : "rgba(255,255,255,.06)", border: `1px solid ${primary ? "#39c46e" : "#2a3a5c"}`, borderRadius: 12, padding: "11px 8px", cursor: "pointer" }}>
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
            {msg && <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} style={toastStyle}>{msg}</motion.div>}
        </AnimatePresence>
    );
}
const toastStyle = { position: "absolute", bottom: 92, left: "50%", transform: "translateX(-50%)", background: "#39c46e", color: "#04140d", font: "700 13px ui-sans-serif,system-ui", padding: "10px 18px", borderRadius: 20, boxShadow: "0 10px 30px rgba(0,0,0,.4)", zIndex: 40 };

/* ============================================================================
   CHROME: logo, compass, side buttons, bottom toolbar
   ============================================================================ */
function Logo({ stats }) {
    return (
        <div style={{ position: "absolute", top: 14, left: 16, display: "flex", alignItems: "center", gap: 10, pointerEvents: "none" }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,#3aa0ee,#39c46e)", display: "grid", placeItems: "center", color: "#fff", font: "800 16px ui-sans-serif" }}>B</div>
            <div>
                <div style={{ font: "800 17px ui-sans-serif,system-ui", color: "#0b2038" }}>Basava Ganguru</div>
                <div style={{ font: "600 11px ui-sans-serif", color: "#4a6285" }}>SY.NO.43/1 · BUDA · {stats.avail}/{stats.total} available</div>
            </div>
        </div>
    );
}
function Compass({ onReset }) {
    return (
        <button onClick={onReset} title="Reset to North" style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", zIndex: 20 }}>
            <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r="25" fill="rgba(255,255,255,.94)" stroke="#d0d6de" />
                <polygon points="28,6 34,28 28,23 22,28" fill="#e04a5a" />
                <polygon points="28,50 34,28 28,33 22,28" fill="#8892a3" />
                <text x="28" y="17" fontSize="9" fill="#222" textAnchor="middle" fontWeight="700">N</text>
            </svg>
        </button>
    );
}
function SideButtons({ showDims, setShowDims, onReset }) {
    return (
        <div style={{ position: "absolute", right: 20, top: "48%", display: "flex", flexDirection: "column", gap: 10, zIndex: 20 }}>
            <SideBtn label="Layers / dimensions" active={showDims} onClick={() => setShowDims((v) => !v)} bg="#39c46e">▦</SideBtn>
            <SideBtn label="Recenter" onClick={onReset} bg="#fff" fg="#2a3a5c">◎</SideBtn>
        </div>
    );
}
function SideBtn({ children, onClick, label, bg, fg = "#fff", active }) {
    return (
        <button title={label} onClick={onClick} style={{ width: 46, height: 46, borderRadius: 12, border: "none", cursor: "pointer", background: active ? "#2f9d57" : bg, color: fg, fontSize: 20, boxShadow: "0 6px 20px rgba(0,0,0,.18)" }}>
            {children}
        </button>
    );
}
function Toolbar({ query, setQuery, onSearch, onShare, onReset, onInfo }) {
    return (
        <div style={{ position: "absolute", bottom: 22, left: "50%", transform: "translateX(-50%)", zIndex: 30 }}>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,.96)", borderRadius: 30, padding: "6px 6px 6px 16px", boxShadow: "0 8px 30px rgba(0,0,0,.18)" }}>
                <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSearch()} placeholder="Search plot number…" style={{ border: "none", outline: "none", font: "500 14px ui-sans-serif", width: 150, background: "transparent" }} />
                <TBtn onClick={onSearch}>🔍</TBtn>
                <TBtn onClick={onReset}>🎯</TBtn>
                <TBtn onClick={onShare}>🔗</TBtn>
                <TBtn onClick={onInfo}>ℹ️</TBtn>
            </div>
        </div>
    );
}
function TBtn({ children, onClick }) {
    return <button onClick={onClick} style={{ width: 38, height: 38, borderRadius: "50%", border: "none", marginLeft: 4, cursor: "pointer", background: "#eef2f7", fontSize: 15 }}>{children}</button>;
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
    const [infoOpen, setInfoOpen] = useState(false);
    const focusTarget = useRef(null);

    const selected = useMemo(() => RESIDENTIAL.find((s) => s.id === selectedId) || null, [selectedId]);
    const onSelect = useCallback((id) => setSelectedId((p) => (p === id ? null : id)), []);
    const focusOn = useCallback((x, z) => {
        focusTarget.current = new THREE.Vector3(x, 0, z);
        if (Scene._focus) Scene._focus(focusTarget.current);
    }, []);
    const locate = useCallback(() => selected && focusOn(selected.x, selected.z), [selected, focusOn]);
    const resetView = useCallback(() => focusOn(CENTER.x, CENTER.z), [focusOn]);
    const onSearch = useCallback(() => {
        const hit = RESIDENTIAL.find((s) => s.no === parseInt(query, 10));
        if (hit) {
            setSelectedId(hit.id);
            focusOn(hit.x, hit.z);
        }
    }, [query, focusOn]);
    const onShare = useCallback(() => {
        if (typeof navigator !== "undefined" && navigator.share) navigator.share({ title: "Basava Ganguru", url: window.location.href }).catch(() => { });
        else if (typeof navigator !== "undefined") navigator.clipboard?.writeText(window.location.href);
    }, []);

    const stats = useMemo(() => ({ total: RESIDENTIAL.length, avail: RESIDENTIAL.filter((s) => s.status === "available").length }), []);

    return (
        <div style={{ position: "relative", width: "100%", height: "100vh", background: "#cfe4f5", overflow: "hidden", fontFamily: "ui-sans-serif,system-ui", touchAction: "none" }}>
            <Canvas shadows dpr={[1, mobile ? 1.5 : 2]} camera={{ position: [CENTER.x, 210, CENTER.z + 230], fov: 42 }} onPointerMissed={() => setHovered(null)}>
                <Suspense fallback={null}>
                    <Scene hovered={hovered} selectedId={selectedId} onHover={setHovered} onSelect={onSelect} focusTarget={focusTarget} showDims={showDims} mobile={mobile} />
                </Suspense>
            </Canvas>

            <Logo stats={stats} />
            <Compass onReset={resetView} />
            <SideButtons showDims={showDims} setShowDims={setShowDims} onReset={resetView} />
            <Toast />
            <Toolbar query={query} setQuery={setQuery} onSearch={onSearch} onShare={onShare} onReset={resetView} onInfo={() => setInfoOpen((v) => !v)} />

            <button onClick={() => (selected ? bookSite(selected, "interested") : setInfoOpen(true))} style={enquireCTA}>
                💬 {selected ? `Enquire #${selected.no}` : "Enquire Now"}
            </button>

            {/* info popover */}
            <AnimatePresence>
                {infoOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={infoBox}>
                        <div style={{ font: "800 14px ui-sans-serif", color: "#0b2038", marginBottom: 6 }}>Basava Ganguru · SY.NO.43/1</div>
                        <div style={{ font: "500 12px ui-sans-serif", color: "#3a4a63", lineHeight: 1.6 }}>
                            32 premium residential sites · BUDA approved · DC converted · Shivamogga.<br />
                            Sizes: 9×12, 9×15, 9×16.05 m + odd. From {INR(PRICE_PER_SQFT)}/sqft.<br />
                            Click any blue plot to view details & enquire.
                        </div>
                        <button onClick={() => setInfoOpen(false)} style={{ marginTop: 10, ...ActionBtnStyle(true) }}>Got it</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {!mobile && (
                <AnimatePresence>
                    {selected && (
                        <motion.div key="sb" initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 26 }} style={sidebar}>
                            <SelectedCard s={selected} onLocate={locate} onClose={() => setSelectedId(null)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
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

function ActionBtnStyle(primary) {
    return { font: "700 13px ui-sans-serif,system-ui", color: primary ? "#04140d" : "#dfe8fb", background: primary ? "#39c46e" : "rgba(255,255,255,.06)", border: `1px solid ${primary ? "#39c46e" : "#2a3a5c"}`, borderRadius: 12, padding: "9px 16px", cursor: "pointer", width: "100%" };
}
const glass = { background: "rgba(15,22,36,.85)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", border: "1px solid rgba(90,120,180,.35)", boxShadow: "0 24px 70px rgba(0,0,0,.5)", color: "#f2f6ff" };
const sidebar = { ...glass, position: "absolute", top: 84, right: 78, width: 320, borderRadius: 20, padding: 20, zIndex: 25 };
const sheet = { ...glass, position: "absolute", left: 0, right: 0, bottom: 0, borderRadius: "22px 22px 0 0", padding: "16px 18px 26px", zIndex: 30 };
const infoBox = { position: "absolute", bottom: 78, left: "50%", transform: "translateX(-50%)", width: 320, background: "rgba(255,255,255,.97)", borderRadius: 16, padding: 16, boxShadow: "0 20px 60px rgba(0,0,0,.25)", zIndex: 35 };
const enquireCTA = { position: "absolute", bottom: 22, right: 20, background: "#39c46e", color: "#fff", font: "700 14px ui-sans-serif,system-ui", border: "none", borderRadius: 30, padding: "12px 22px", cursor: "pointer", boxShadow: "0 8px 26px rgba(57,196,110,.5)", zIndex: 30 };