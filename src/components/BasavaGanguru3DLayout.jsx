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
import {
    OrbitControls,
    Environment,
    ContactShadows,
    Html,
    RoundedBox,
    Text,
    Sky,
    Float,
} from "@react-three/drei";
import {
    EffectComposer,
    Bloom,
    SSAO,
    Vignette,
} from "@react-three/postprocessing";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";

/* ============================================================================
   BASAVA GANGURU — SY.NO.43/1  ·  Premium Interactive 3D Residential Layout
   Stack: Next.js + three.js + @react-three/fiber + drei + postprocessing +
          framer-motion. Supabase-ready booking hooks (see bookSite()).
   Route: src/app/layout-3d/page.tsx  ->  export <BasavaGanguru3DLayout/>
   Deps: three @react-three/fiber @react-three/drei @react-three/postprocessing
         framer-motion
   Addresses all 34 requested fixes.
   ============================================================================ */

/* ------------------------------ CONFIG -------------------------------------*/
const PRICE_PER_SQFT = 2300;
const SQM_TO_SQFT = 10.7639;

const INR = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
const LAKH = (n) => "₹" + (n / 100000).toFixed(2) + "L";

/* ------------------------------ PALETTE ------------------------------------*/
const C = {
    sky: "#bcd8f0",
    grass: "#5a8f4a",
    grassDark: "#4a7d3d",
    road: "#2b2f38",
    roadLine: "#e8e2d0",
    curb: "#b9bcc4",
    drain: "#54585f",
    boundary: "#c9302c",
    wall: "#e9e2d5",
    text: "#f2f6ff",
    available: "#3d8bff",
    booked: "#e04a5a",
    sold: "#8892a3",
    selected: "#22e0a1",
    hovered: "#ffcf4d",
    cornerBorder: "#ff8a3d",
    premiumBorder: "#a56bff",
    tree: "#3f7d3a",
    treeDark: "#2f6130",
    trunk: "#6b4a2f",
    building: "#e7ecf3",
    tank: "#c7cdd6",
};

/* ============================================================================
   LAYOUT DATA — 4 BUDA size classes (9x12, 9x15, 9x16.05, odd) = 32 sites
   ============================================================================ */
let _id = 0;
const facingFor = (z) => (z < 25 ? "North" : z < 45 ? "East" : "South");

const mk = (no, x, z, w, d, opts = {}) => {
    const kind = opts.kind || "residential";
    return {
        id: _id++,
        no,
        x,
        z,
        w,
        d,
        kind,
        label: opts.label,
        status: opts.status || "available",
        corner: !!opts.corner,
        premium: !!opts.premium,
        facing: opts.facing || facingFor(z),
        areaSqm: +(w * d).toFixed(2),
    };
};

const GAP = 0.4;

const blockA = [
    mk("CA", 5.0, 9.5, 9.0, 19.0, { kind: "ca", label: "CLUB HOUSE" }),
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
    mk("PARK", 18.0, 52.0, 40.0, 22.0, { kind: "park", label: "PARK" }),
    mk("STP", 42.5, 46.5, 6.0, 6.5, { kind: "stp", label: "STP" }),
];

const middleLeft = [11, 12, 13, 14, 15, 16, 17].map((no, i) =>
    mk(no, 60, 4.5 + i * 10.2, 9.0, 15.0, {
        corner: i === 0 || i === 6,
        premium: no === 14,
    })
);

const middleRightTop = [
    mk(25, 71, 4.5, 4.5, 9.0, {}),
    mk(24, 76, 4.5, 4.5, 9.0, { corner: true }),
];

const middleRight = [23, 22, 21, 20, 19, 18].map((no, i) =>
    mk(no, 73.5, 14.5 + i * 10.2, 9.0, 16.05, {
        corner: i === 5,
        premium: no === 21,
    })
);

const rightCol = [26, 27, 28, 29, 30, 31, 32].map((no, i) =>
    mk(no, 92, 4.5 + i * 10.2, 9.0, 15.0, {
        corner: i === 0 || i === 6,
        premium: no === 32,
    })
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

/* seed statuses so all colors show — replace via Supabase */
const SEED_STATUS = { 2: "sold", 5: "booked", 9: "sold", 13: "booked", 20: "sold", 27: "booked", 30: "sold" };
RESIDENTIAL.forEach((s) => {
    if (SEED_STATUS[s.no]) s.status = SEED_STATUS[s.no];
});

const ROADS = [
    { x: 48, z: -6, w: 104, d: 12, name: "12M ROAD", vertical: false },
    { x: 45, z: 23.5, w: 96, d: 9, name: "9M ROAD", vertical: false },
    { x: 47, z: 34, w: 9, d: 70, name: "9M ROAD", vertical: true },
    { x: 82, z: 34, w: 9, d: 70, name: "9M ROAD", vertical: true },
    { x: 24, z: 42.5, w: 42, d: 3, name: "3M PATHWAY", vertical: false },
];

const SURVEY_CONTEXT = [
    { name: "Sy.No.39", x: -18, z: -22 },
    { name: "Sy.No.42", x: 48, z: -26 },
    { name: "Sy.No.43/3", x: 118, z: 8 },
    { name: "Sy.No.44", x: -20, z: 30 },
    { name: "Sy.No.46", x: 55, z: 78 },
];

const BOUNDS = { minX: -6, maxX: 104, minZ: -14, maxZ: 66 };
const CENTER = { x: (BOUNDS.minX + BOUNDS.maxX) / 2, z: (BOUNDS.minZ + BOUNDS.maxZ) / 2 };

const WALL_PATH = [
    [-3, -8],
    [101, -6],
    [104, 40],
    [70, 64],
    [-4, 60],
    [-3, -8],
];

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

function statusColor(s, isHover, isSel) {
    if (s.kind === "ca") return "#c9b8ff";
    if (s.kind === "park") return C.grassDark;
    if (s.kind === "stp") return "#d5dae2";
    if (isSel) return C.selected;
    if (isHover) return C.hovered;
    if (s.status === "sold") return C.sold;
    if (s.status === "booked") return C.booked;
    return C.available;
}

/* ============================================================================
   PLOT
   ============================================================================ */
function Plot({ s, hovered, selectedId, onHover, onSelect, mobile }) {
    const ref = useRef();
    const isRes = s.kind === "residential";
    const clickable = isRes && s.status !== "sold";
    const isHover = hovered === s.id;
    const isSel = selectedId === s.id;
    const color = statusColor(s, isHover, isSel);
    const targetH = !isRes ? 0.3 : isSel ? 3.4 : isHover ? 2.6 : 1.1;

    useFrame((_, dt) => {
        if (ref.current)
            ref.current.scale.y = THREE.MathUtils.damp(ref.current.scale.y, targetH, 9, dt);
    });

    const w = s.w - GAP;
    const d = s.d - GAP;
    const sqft = Math.round(s.areaSqm * SQM_TO_SQFT);
    const price = sqft * PRICE_PER_SQFT;
    const border = s.corner ? C.cornerBorder : s.premium ? C.premiumBorder : null;

    return (
        <group position={[s.x, 0, s.z]}>
            <RoundedBox
                ref={ref}
                args={[w, 1, d]}
                radius={0.14}
                smoothness={3}
                position={[0, 0.5, 0]}
                scale={[1, targetH, 1]}
                castShadow
                receiveShadow
                onPointerOver={(e) => {
                    e.stopPropagation();
                    if (clickable) onHover(s.id);
                }}
                onPointerOut={() => clickable && onHover(null)}
                onClick={(e) => {
                    e.stopPropagation();
                    if (clickable) onSelect(s.id);
                }}
            >
                <meshStandardMaterial
                    color={color}
                    roughness={0.5}
                    metalness={0.1}
                    emissive={color}
                    emissiveIntensity={isSel ? 0.4 : isHover ? 0.28 : 0.06}
                />
            </RoundedBox>

            {border && isRes && (
                <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[Math.min(w, d) / 2, Math.min(w, d) / 2 + 0.45, 4]} />
                    <meshBasicMaterial color={border} side={THREE.DoubleSide} />
                </mesh>
            )}

            {isRes && (
                <group position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <Text fontSize={2.6} color="#0d1424" anchorX="center" anchorY="middle" position={[0, 1.6, 0]}>
                        {s.no}
                    </Text>
                    <Text fontSize={1.15} color="#243049" anchorX="center" anchorY="middle" position={[0, -0.5, 0]}>
                        {sqft} sq.ft
                    </Text>
                    <Text fontSize={1.35} color="#0d3b2a" anchorX="center" anchorY="middle" position={[0, -2.2, 0]}>
                        {LAKH(price)}
                    </Text>
                </group>
            )}

            {!isRes && (
                <Text
                    position={[0, s.kind === "park" ? 0.4 : 5, 0]}
                    rotation={[-Math.PI / 2, 0, 0]}
                    fontSize={s.kind === "park" ? 4 : 2.4}
                    color="#0d1424"
                    anchorX="center"
                    anchorY="middle"
                >
                    {s.label}
                </Text>
            )}

            {isHover && isRes && !mobile && (
                <Html position={[0, targetH + 1.6, 0]} center distanceFactor={70}>
                    <div style={popup}>
                        <b>Site {s.no}</b> · {s.w}×{s.d}m · {s.facing}
                        <br />
                        {sqft} sq.ft · {INR(price)}
                    </div>
                </Html>
            )}
        </group>
    );
}
const popup = {
    background: "rgba(9,14,26,0.94)",
    border: `1px solid ${C.hovered}`,
    borderRadius: 10,
    padding: "6px 10px",
    color: C.text,
    font: "12px ui-sans-serif,system-ui",
    whiteSpace: "nowrap",
    pointerEvents: "none",
    boxShadow: "0 10px 30px rgba(0,0,0,.6)",
};

/* ============================================================================
   ROADS
   ============================================================================ */
function Road({ r }) {
    const [len, wid] = r.vertical ? [r.d, r.w] : [r.w, r.d];
    const dashCount = Math.floor(len / 6);
    return (
        <group position={[r.x, 0, r.z]} rotation={[0, r.vertical ? Math.PI / 2 : 0, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]} receiveShadow>
                <planeGeometry args={[len, wid]} />
                <meshStandardMaterial color={C.road} roughness={0.95} metalness={0.05} />
            </mesh>
            {[1, -1].map((s) => (
                <mesh key={s} position={[0, 0.12, (s * wid) / 2]} castShadow>
                    <boxGeometry args={[len, 0.24, 0.4]} />
                    <meshStandardMaterial color={C.curb} roughness={0.8} />
                </mesh>
            ))}
            {[1, -1].map((s) => (
                <mesh key={"d" + s} position={[0, 0.05, (s * wid) / 2 - s * 0.7]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[len, 0.35]} />
                    <meshStandardMaterial color={C.drain} roughness={1} />
                </mesh>
            ))}
            {Array.from({ length: dashCount }).map((_, i) => (
                <mesh key={i} position={[-len / 2 + 3 + i * 6, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[2.6, 0.22]} />
                    <meshStandardMaterial color={C.roadLine} emissive={C.roadLine} emissiveIntensity={0.08} />
                </mesh>
            ))}
            {Array.from({ length: Math.max(2, Math.floor(len / 16)) }).map((_, i) => {
                const px = -len / 2 + 8 + i * 16;
                return <StreetLight key={i} x={px} z={wid / 2 + 0.6} />;
            })}
            <Html position={[0, 4.5, 0]} center distanceFactor={95}>
                <div style={roadTag}>{r.name}</div>
            </Html>
        </group>
    );
}
const roadTag = {
    background: "rgba(9,14,26,.8)",
    color: "#cfe0ff",
    font: "700 11px ui-sans-serif,system-ui",
    letterSpacing: 1.5,
    padding: "3px 9px",
    borderRadius: 20,
    border: "1px solid #2a3a5c",
    whiteSpace: "nowrap",
    pointerEvents: "none",
};

function StreetLight({ x, z }) {
    return (
        <group position={[x, 0, z]}>
            <mesh position={[0, 2.2, 0]} castShadow>
                <cylinderGeometry args={[0.12, 0.16, 4.4, 8]} />
                <meshStandardMaterial color="#3b4048" metalness={0.6} roughness={0.4} />
            </mesh>
            <mesh position={[0.5, 4.3, 0]}>
                <boxGeometry args={[1.1, 0.18, 0.3]} />
                <meshStandardMaterial color="#3b4048" metalness={0.6} />
            </mesh>
            <mesh position={[0.95, 4.2, 0]}>
                <sphereGeometry args={[0.22, 10, 10]} />
                <meshStandardMaterial color="#fff4c2" emissive="#ffdf7a" emissiveIntensity={1.4} />
            </mesh>
            <pointLight position={[0.95, 4, 0]} intensity={5} distance={12} color="#ffe9b0" />
        </group>
    );
}

/* ============================================================================
   PROPS: TREE / PERSON / CAR
   ============================================================================ */
function Tree({ x, z, s = 1 }) {
    return (
        <group position={[x, 0, z]} scale={s}>
            <mesh position={[0, 1, 0]} castShadow>
                <cylinderGeometry args={[0.18, 0.28, 2, 6]} />
                <meshStandardMaterial color={C.trunk} roughness={1} />
            </mesh>
            <mesh position={[0, 2.6, 0]} castShadow>
                <icosahedronGeometry args={[1.3, 0]} />
                <meshStandardMaterial color={C.tree} roughness={0.9} flatShading />
            </mesh>
            <mesh position={[0.5, 3.4, 0.2]} castShadow>
                <icosahedronGeometry args={[0.9, 0]} />
                <meshStandardMaterial color={C.treeDark} roughness={0.9} flatShading />
            </mesh>
        </group>
    );
}

const TREE_SPOTS = [
    [4, 44], [8, 62], [30, 62], [33, 44], [2, 53], [34, 53],
    [45, 8], [45, 40], [45, 55], [80, 8], [80, 40], [80, 55],
    [12, 26], [30, 26], [60, 26], [92, 26],
    [-2, 0], [-2, 20], [-2, 45], [100, 0], [100, 20], [100, 45],
    [40, -12], [56, -12],
];

function Person({ x, z, color = "#e8556f", walk = false, phase = 0 }) {
    const ref = useRef();
    useFrame((st) => {
        if (walk && ref.current) {
            ref.current.position.x = x + Math.sin(st.clock.elapsedTime * 0.4 + phase) * 3;
        }
    });
    return (
        <group ref={ref} position={[x, 0, z]}>
            <mesh position={[0, 0.7, 0]} castShadow>
                <capsuleGeometry args={[0.18, 0.5, 4, 8]} />
                <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            <mesh position={[0, 1.35, 0]} castShadow>
                <sphereGeometry args={[0.2, 10, 10]} />
                <meshStandardMaterial color="#f1c9a5" />
            </mesh>
        </group>
    );
}

function Car({ x, z, rot = 0, color = "#3f6fd8" }) {
    return (
        <group position={[x, 0, z]} rotation={[0, rot, 0]}>
            <mesh position={[0, 0.5, 0]} castShadow>
                <boxGeometry args={[3.6, 0.7, 1.6]} />
                <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0.1, 1, 0]} castShadow>
                <boxGeometry args={[1.8, 0.6, 1.4]} />
                <meshStandardMaterial color={color} metalness={0.5} roughness={0.35} />
            </mesh>
            {[[-1.1, 0.7], [1.1, 0.7], [-1.1, -0.7], [1.1, -0.7]].map(([dx, dz], i) => (
                <mesh key={i} position={[dx, 0.3, dz]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.3, 0.3, 0.25, 12]} />
                    <meshStandardMaterial color="#15181d" />
                </mesh>
            ))}
        </group>
    );
}

/* ============================================================================
   PARK
   ============================================================================ */
function Park() {
    const p = parkBlock[0];
    return (
        <group position={[p.x, 0, p.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
                <planeGeometry args={[p.w - GAP, p.d - GAP]} />
                <meshStandardMaterial color={C.grassDark} roughness={1} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
                <ringGeometry args={[10, 11.4, 40]} />
                <meshStandardMaterial color="#c8a06a" roughness={1} side={THREE.DoubleSide} />
            </mesh>
            <group>
                <mesh position={[0, 0.3, 0]} castShadow>
                    <cylinderGeometry args={[2.4, 2.6, 0.6, 24]} />
                    <meshStandardMaterial color="#c7ccd6" roughness={0.7} />
                </mesh>
                <mesh position={[0, 0.45, 0]}>
                    <cylinderGeometry args={[2.1, 2.1, 0.2, 24]} />
                    <meshStandardMaterial color="#5fb6e8" roughness={0.2} metalness={0.3} transparent opacity={0.85} />
                </mesh>
                <Float speed={3} floatIntensity={0.6}>
                    <mesh position={[0, 1.4, 0]}>
                        <coneGeometry args={[0.5, 1.4, 12]} />
                        <meshStandardMaterial color="#9fdcff" transparent opacity={0.6} />
                    </mesh>
                </Float>
            </group>
            <group position={[-12, 0, -6]}>
                {[[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4]].map(([dx, dz], i) => (
                    <mesh key={i} position={[dx, 1, dz]} castShadow>
                        <cylinderGeometry args={[0.14, 0.14, 2, 8]} />
                        <meshStandardMaterial color="#8a5a34" />
                    </mesh>
                ))}
                <mesh position={[0, 2.4, 0]} castShadow>
                    <coneGeometry args={[2.6, 1.4, 4]} />
                    <meshStandardMaterial color="#a5462f" flatShading />
                </mesh>
            </group>
            {[[8, 6], [-8, 8], [10, -6]].map(([dx, dz], i) => (
                <mesh key={i} position={[dx, 0.4, dz]} castShadow>
                    <boxGeometry args={[2, 0.2, 0.6]} />
                    <meshStandardMaterial color="#7a4a2a" />
                </mesh>
            ))}
            <group position={[12, 0, 6]}>
                <mesh position={[0, 1, 0]} rotation={[0, 0, -0.5]} castShadow>
                    <boxGeometry args={[3, 0.15, 0.9]} />
                    <meshStandardMaterial color="#e0563a" />
                </mesh>
                <mesh position={[-1.4, 0.9, 0]}>
                    <boxGeometry args={[0.15, 1.8, 0.9]} />
                    <meshStandardMaterial color="#f0b429" />
                </mesh>
            </group>
            <Person x={4} z={4} color="#e8556f" walk phase={0} />
            <Person x={-6} z={-2} color="#4a7de8" walk phase={2} />
            <Person x={9} z={-4} color="#2fbf71" />
        </group>
    );
}

/* ============================================================================
   CLUBHOUSE
   ============================================================================ */
function ClubHouse() {
    const c = blockA[0];
    return (
        <group position={[c.x, 0, c.z]}>
            <mesh position={[0, 3, 0]} castShadow receiveShadow>
                <boxGeometry args={[7, 6, 14]} />
                <meshStandardMaterial color={C.building} roughness={0.6} />
            </mesh>
            <mesh position={[3.55, 3, 0]}>
                <boxGeometry args={[0.15, 4.5, 11]} />
                <meshStandardMaterial color="#8fc6e0" metalness={0.8} roughness={0.1} transparent opacity={0.7} />
            </mesh>
            <mesh position={[0, 6.2, 0]} castShadow>
                <boxGeometry args={[7.6, 0.4, 14.6]} />
                <meshStandardMaterial color="#cfd6df" />
            </mesh>
            {[0, 1, 2].map((i) => (
                <mesh key={i} position={[3.7 + i * 0.4, 0.15 + i * 0.15, 0]} castShadow>
                    <boxGeometry args={[0.5, 0.3, 4]} />
                    <meshStandardMaterial color="#d8dce2" />
                </mesh>
            ))}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -6.5]}>
                <planeGeometry args={[7, 1.6]} />
                <meshStandardMaterial color={C.grass} />
            </mesh>
            <Tree x={-2.5} z={-6.5} s={0.7} />
            <Tree x={2.5} z={-6.5} s={0.7} />
            <Car x={5.5} z={5} rot={Math.PI / 2} color="#c0392b" />
            <Car x={5.5} z={2} rot={Math.PI / 2} color="#2c3e50" />
        </group>
    );
}

/* ============================================================================
   STP
   ============================================================================ */
function STP() {
    const s = parkBlock[1];
    return (
        <group position={[s.x, 0, s.z]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
                <planeGeometry args={[6, 6.5]} />
                <meshStandardMaterial color="#9aa0aa" roughness={1} />
            </mesh>
            {[[-1.4, 0], [1.4, 0]].map(([dx], i) => (
                <mesh key={i} position={[dx, 1.4, 0]} castShadow>
                    <cylinderGeometry args={[1, 1, 2.8, 20]} />
                    <meshStandardMaterial color={C.tank} metalness={0.5} roughness={0.4} />
                </mesh>
            ))}
            <mesh position={[0, 1.4, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.2, 0.2, 2.8, 10]} />
                <meshStandardMaterial color="#5b6470" metalness={0.6} />
            </mesh>
            <group position={[0, 0, 2.6]}>
                <mesh position={[0, 1, 0]}>
                    <cylinderGeometry args={[0.06, 0.06, 2, 6]} />
                    <meshStandardMaterial color="#444" />
                </mesh>
                <mesh position={[0, 1.7, 0]}>
                    <boxGeometry args={[1.4, 0.7, 0.06]} />
                    <meshStandardMaterial color="#f1c40f" />
                </mesh>
            </group>
        </group>
    );
}

/* ============================================================================
   COMPOUND WALL + GATE + NAME BOARD
   ============================================================================ */
function Compound() {
    const segments = [];
    for (let i = 0; i < WALL_PATH.length - 1; i++) {
        const [x1, z1] = WALL_PATH[i];
        const [x2, z2] = WALL_PATH[i + 1];
        const mx = (x1 + x2) / 2;
        const mz = (z1 + z2) / 2;
        const len = Math.hypot(x2 - x1, z2 - z1);
        const ang = Math.atan2(z2 - z1, x2 - x1);
        segments.push({ mx, mz, len, ang, gate: i === 0 });
    }
    return (
        <group>
            {segments.map((sg, i) =>
                sg.gate ? (
                    <GateSegment key={i} {...sg} />
                ) : (
                    <group key={i} position={[sg.mx, 0.9, sg.mz]} rotation={[0, -sg.ang, 0]}>
                        <mesh castShadow receiveShadow>
                            <boxGeometry args={[sg.len, 1.8, 0.4]} />
                            <meshStandardMaterial color={C.wall} roughness={0.9} />
                        </mesh>
                        <mesh position={[0, 1, 0]}>
                            <boxGeometry args={[sg.len, 0.2, 0.5]} />
                            <meshStandardMaterial color="#c9302c" />
                        </mesh>
                    </group>
                )
            )}
        </group>
    );
}

function GateSegment({ mx, mz, len, ang }) {
    const half = len / 2;
    const gateW = 14;
    const segLen = half - gateW / 2;
    return (
        <group position={[mx, 0, mz]} rotation={[0, -ang, 0]}>
            {[-1, 1].map((s) => (
                <group key={s} position={[s * (gateW / 2 + segLen / 2), 0.9, 0]}>
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[segLen, 1.8, 0.4]} />
                        <meshStandardMaterial color={C.wall} roughness={0.9} />
                    </mesh>
                    <mesh position={[0, 1, 0]}>
                        <boxGeometry args={[segLen, 0.2, 0.5]} />
                        <meshStandardMaterial color="#c9302c" />
                    </mesh>
                </group>
            ))}
            {[-1, 1].map((s) => (
                <mesh key={s} position={[s * (gateW / 2), 1.4, 0]} castShadow>
                    <boxGeometry args={[0.9, 2.8, 0.9]} />
                    <meshStandardMaterial color="#dfd7c8" />
                </mesh>
            ))}
            <mesh position={[0, 3.2, 0]} castShadow>
                <boxGeometry args={[gateW + 1.6, 1.2, 0.6]} />
                <meshStandardMaterial color="#1b2a4a" />
            </mesh>
            <Html position={[0, 3.2, 0.4]} center distanceFactor={60}>
                <div style={nameBoard}>BASAVA GANGURU</div>
            </Html>
            <group position={[gateW / 2 + 2.5, 0, 3]}>
                <mesh position={[0, 1, 0]} castShadow>
                    <boxGeometry args={[2.4, 2, 2.4]} />
                    <meshStandardMaterial color="#e0d8c8" />
                </mesh>
                <mesh position={[0, 2.2, 0]}>
                    <coneGeometry args={[1.9, 0.7, 4]} />
                    <meshStandardMaterial color="#a5462f" flatShading />
                </mesh>
            </group>
            <Car x={-6} z={5} rot={0} color="#27ae60" />
        </group>
    );
}
const nameBoard = {
    color: "#ffd98a",
    font: "800 13px ui-serif,Georgia,serif",
    letterSpacing: 2,
    whiteSpace: "nowrap",
    pointerEvents: "none",
    textShadow: "0 2px 8px #000",
};

/* ============================================================================
   GROUND + CONTEXT + BOUNDARY
   ============================================================================ */
function Ground() {
    return (
        <>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CENTER.x, -0.06, CENTER.z]} receiveShadow>
                <planeGeometry args={[420, 360]} />
                <meshStandardMaterial color={C.grass} roughness={1} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[CENTER.x, -0.02, CENTER.z]} receiveShadow>
                <planeGeometry args={[130, 100]} />
                <meshStandardMaterial color="#6f7a55" roughness={1} />
            </mesh>
        </>
    );
}

function SurveyContext() {
    return (
        <>
            {SURVEY_CONTEXT.map((sv, i) => (
                <group key={i} position={[sv.x, 0, sv.z]}>
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                        <planeGeometry args={[16, 10]} />
                        <meshStandardMaterial color="#6a7f55" roughness={1} />
                    </mesh>
                    <Html position={[0, 0.5, 0]} center distanceFactor={120}>
                        <div style={surveyTag}>{sv.name}</div>
                    </Html>
                </group>
            ))}
        </>
    );
}
const surveyTag = {
    color: "#dbe6c8",
    font: "600 11px ui-sans-serif,system-ui",
    background: "rgba(30,45,20,.5)",
    padding: "2px 8px",
    borderRadius: 10,
    border: "1px dashed #8aa06a",
    whiteSpace: "nowrap",
    pointerEvents: "none",
};

function BoundaryLine() {
    const geo = useMemo(() => {
        const pts = WALL_PATH.map(([x, z]) => new THREE.Vector3(x, 0.25, z));
        return new THREE.BufferGeometry().setFromPoints(pts);
    }, []);
    return (
        <line geometry={geo}>
            <lineBasicMaterial color={C.boundary} />
        </line>
    );
}

/* ============================================================================
   CAMERA RIG — intro fly-in + locate
   ============================================================================ */
function CameraRig({ intro, focusTarget, controlsRef }) {
    const { camera } = useThree();
    const t0 = useRef(null);
    useFrame((st) => {
        if (intro.current) {
            if (t0.current === null) t0.current = st.clock.elapsedTime;
            const t = Math.min((st.clock.elapsedTime - t0.current) / 2.5, 1);
            const e = 1 - Math.pow(1 - t, 3);
            const startPos = new THREE.Vector3(CENTER.x, 220, CENTER.z + 240);
            const endPos = new THREE.Vector3(CENTER.x - 30, 78, CENTER.z + 96);
            camera.position.lerpVectors(startPos, endPos, e);
            camera.lookAt(CENTER.x, 0, CENTER.z);
            if (controlsRef.current) controlsRef.current.target.set(CENTER.x, 0, CENTER.z);
            if (t >= 1) intro.current = false;
        }
        if (focusTarget.current && controlsRef.current) {
            const tg = controlsRef.current.target;
            tg.lerp(focusTarget.current, 0.08);
            if (tg.distanceTo(focusTarget.current) < 0.4) focusTarget.current = null;
            controlsRef.current.update();
        }
    });
    return null;
}

/* ============================================================================
   SCENE
   ============================================================================ */
function Scene({ hovered, selectedId, onHover, onSelect, focusTarget, mobile }) {
    const intro = useRef(true);
    const controlsRef = useRef();

    useEffect(() => {
        Scene._focus = (v) => (focusTarget.current = v);
    }, [focusTarget]);

    return (
        <>
            <Sky sunPosition={[60, 40, 30]} turbidity={6} rayleigh={1.2} />
            <fog attach="fog" args={[C.sky, 160, 420]} />

            <ambientLight intensity={0.55} />
            <directionalLight
                position={[70, 60, 40]}
                intensity={2.1}
                color="#fff2d6"
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-left={-140}
                shadow-camera-right={140}
                shadow-camera-top={140}
                shadow-camera-bottom={-140}
            />
            <directionalLight position={[-50, 40, -30]} intensity={0.4} color="#9ec5ff" />

            <Suspense fallback={null}>
                <Environment preset="park" />
            </Suspense>

            <Ground />
            <SurveyContext />
            <BoundaryLine />
            <Compound />

            {ROADS.map((r, i) => (
                <Road key={i} r={r} />
            ))}

            <ClubHouse />
            <STP />
            <Park />

            {TREE_SPOTS.map(([x, z], i) => (
                <Tree key={i} x={x} z={z} s={0.85 + (i % 3) * 0.15} />
            ))}

            <Car x={45} z={20} rot={0} color="#2980b9" />
            <Car x={82} z={30} rot={0} color="#e67e22" />
            <Car x={47} z={50} rot={Math.PI / 2} color="#34495e" />

            <Person x={45} z={26} color="#e8556f" walk phase={1} />
            <Person x={82} z={24} color="#4a7de8" walk phase={3} />

            {ALL.map((s) => (
                <Plot
                    key={s.id}
                    s={s}
                    hovered={hovered}
                    selectedId={selectedId}
                    onHover={onHover}
                    onSelect={onSelect}
                    mobile={mobile}
                />
            ))}

            <ContactShadows
                position={[CENTER.x, 0.02, CENTER.z]}
                opacity={0.55}
                scale={260}
                blur={2.6}
                far={50}
            />

            <EffectComposer disableNormalPass multisampling={mobile ? 0 : 4}>
                <SSAO radius={0.15} intensity={18} luminanceInfluence={0.5} />
                <Bloom intensity={0.5} luminanceThreshold={0.85} mipmapBlur />
                <Vignette eskil={false} offset={0.15} darkness={0.55} />
            </EffectComposer>

            <CameraRig intro={intro} focusTarget={focusTarget} controlsRef={controlsRef} />
            <OrbitControls
                ref={controlsRef}
                enablePan
                enableDamping
                dampingFactor={0.08}
                minDistance={mobile ? 40 : 30}
                maxDistance={300}
                maxPolarAngle={Math.PI / 2.15}
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
    // const { error } = await supabase.from("bookings").insert({
    //   site_no: site.no,
    //   sqft: Math.round(site.areaSqm * SQM_TO_SQFT),
    //   action,
    //   layout: "basava-ganguru-43-1",
    //   created_at: new Date().toISOString(),
    // });
    // return { ok: !error, error };
    console.log("[booking]", action, "· site", site.no);
    if (typeof window !== "undefined") {
        // simple feedback until Supabase is wired
        window.dispatchEvent(new CustomEvent("bg-toast", { detail: { action, no: site.no } }));
    }
    return { ok: true };
}

/* ============================================================================
   COMPASS
   ============================================================================ */
function Compass({ onReset }) {
    return (
        <button onClick={onReset} title="Reset view to North" style={compassStyle}>
            <svg width="46" height="46" viewBox="0 0 46 46">
                <circle cx="23" cy="23" r="21" fill="rgba(9,14,26,.85)" stroke="#2a3a5c" />
                <polygon points="23,5 27,23 23,20 19,23" fill="#e04a5a" />
                <polygon points="23,41 27,23 23,26 19,23" fill="#8892a3" />
                <text x="23" y="14" fontSize="8" fill="#fff" textAnchor="middle" fontWeight="700">N</text>
            </svg>
        </button>
    );
}
const compassStyle = {
    position: "absolute",
    bottom: 24,
    right: 24,
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    zIndex: 20,
};

/* ============================================================================
   MINIMAP
   ============================================================================ */
function MiniMap({ selectedId, onPick }) {
    const scale = 1.15;
    const ox = 8;
    const oz = 20;
    return (
        <div style={miniWrap}>
            <div style={{ font: "700 10px ui-sans-serif", color: "#8ea3c6", letterSpacing: 1, marginBottom: 4 }}>
                SITE MAP
            </div>
            <svg width="150" height="150" viewBox="0 0 150 150">
                <rect width="150" height="150" rx="8" fill="rgba(9,14,26,.7)" />
                {RESIDENTIAL.map((s) => {
                    const c =
                        s.id === selectedId
                            ? C.selected
                            : s.status === "sold"
                                ? C.sold
                                : s.status === "booked"
                                    ? C.booked
                                    : C.available;
                    return (
                        <rect
                            key={s.id}
                            x={(s.x + ox) * scale}
                            y={(s.z + oz) * scale}
                            width={s.w * scale * 0.9}
                            height={s.d * scale * 0.9}
                            fill={c}
                            opacity={0.9}
                            rx="1.5"
                            onClick={() => onPick(s.id)}
                            style={{ cursor: "pointer" }}
                        />
                    );
                })}
            </svg>
        </div>
    );
}
const miniWrap = {
    position: "absolute",
    top: 20,
    right: 20,
    background: "rgba(9,14,26,.55)",
    backdropFilter: "blur(10px)",
    border: "1px solid #22304d",
    borderRadius: 14,
    padding: 10,
    zIndex: 15,
};

/* ============================================================================
   LEGEND
   ============================================================================ */
function Legend() {
    const chips = [
        ["Available", C.available],
        ["Booked", C.booked],
        ["Sold", C.sold],
        ["Selected", C.selected],
        ["Hover", C.hovered],
        ["Club House", "#c9b8ff"],
        ["Park", C.grassDark],
    ];
    return (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {chips.map(([l, c]) => (
                <div key={l} style={chip}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: c, display: "inline-block" }} />
                    {l}
                </div>
            ))}
        </div>
    );
}
const chip = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(9,14,26,.6)",
    border: "1px solid #22304d",
    borderRadius: 20,
    padding: "5px 10px",
    font: "600 11px ui-sans-serif,system-ui",
    color: "#cdd8ec",
};

/* ============================================================================
   ANIMATED COUNTER
   ============================================================================ */
function Counter({ value, prefix = "", fmt = (n) => Math.round(n).toLocaleString("en-IN") }) {
    const [v, setV] = useState(0);
    useEffect(() => {
        let raf;
        const start = performance.now();
        const dur = 800;
        const tick = (now) => {
            const t = Math.min((now - start) / dur, 1);
            const e = 1 - Math.pow(1 - t, 3);
            setV(value * e);
            if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [value]);
    return (
        <>
            {prefix}
            {fmt(v)}
        </>
    );
}

/* ============================================================================
   SELECTED CARD
   ============================================================================ */
function SelectedCard({ s, onLocate, onClose }) {
    const sqft = Math.round(s.areaSqm * SQM_TO_SQFT);
    const price = sqft * PRICE_PER_SQFT;
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ font: "800 22px ui-sans-serif,system-ui", color: "#fff" }}>SITE {s.no}</div>
                {onClose && (
                    <button onClick={onClose} style={xBtn}>
                        ✕
                    </button>
                )}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                <Tag>{s.facing} Facing</Tag>
                <Tag>
                    {s.w} × {s.d} m
                </Tag>
                {s.corner && <Tag c={C.cornerBorder}>Corner</Tag>}
                {s.premium && <Tag c={C.premiumBorder}>Premium</Tag>}
                <Tag c={s.status === "available" ? C.available : s.status === "booked" ? C.booked : C.sold}>
                    {s.status[0].toUpperCase() + s.status.slice(1)}
                </Tag>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                <Stat
                    label="Built area"
                    value={
                        <>
                            <Counter value={sqft} /> <span style={{ fontSize: 12 }}>sq.ft</span>
                        </>
                    }
                />
                <Stat
                    label="Plot"
                    value={
                        <>
                            {s.areaSqm.toFixed(0)} <span style={{ fontSize: 12 }}>sqm</span>
                        </>
                    }
                />
            </div>

            <div style={priceBox}>
                <div style={{ font: "600 11px ui-sans-serif", color: "#9fb0d0", letterSpacing: 1 }}>PRICE</div>
                <div style={{ font: "800 28px ui-sans-serif,system-ui", color: "#fff" }}>
                    <Counter value={price} prefix="₹" />
                </div>
                <div style={{ font: "11px ui-sans-serif", color: "#8ea3c6" }}>
                    at {INR(PRICE_PER_SQFT)}/sq.ft · excl. registration & taxes
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                <ActionBtn primary onClick={() => bookSite(s, "book")}>
                    Book Site
                </ActionBtn>
                <ActionBtn onClick={() => bookSite(s, "interested")}>I'm Interested</ActionBtn>
                <ActionBtn onClick={() => bookSite(s, "brochure")}>Download Brochure</ActionBtn>
                <ActionBtn onClick={onLocate}>Locate on Map</ActionBtn>
            </div>
        </div>
    );
}
const xBtn = { background: "none", border: "none", color: "#8ea3c6", fontSize: 16, cursor: "pointer" };
function Tag({ children, c = "#3a4a6a" }) {
    return (
        <span
            style={{
                font: "600 11px ui-sans-serif",
                color: "#dfe8fb",
                background: c + "33",
                border: `1px solid ${c}`,
                borderRadius: 20,
                padding: "3px 9px",
            }}
        >
            {children}
        </span>
    );
}
function Stat({ label, value }) {
    return (
        <div style={{ flex: 1, background: "rgba(255,255,255,.04)", border: "1px solid #22304d", borderRadius: 12, padding: "10px 12px" }}>
            <div style={{ font: "600 10px ui-sans-serif", color: "#8ea3c6", letterSpacing: 1 }}>{label}</div>
            <div style={{ font: "800 18px ui-sans-serif,system-ui", color: "#fff", marginTop: 2 }}>{value}</div>
        </div>
    );
}
const priceBox = {
    marginTop: 12,
    padding: "12px 14px",
    background: "linear-gradient(135deg, rgba(61,139,255,.18), rgba(34,224,161,.18))",
    border: "1px solid rgba(34,224,161,.4)",
    borderRadius: 14,
};
function ActionBtn({ children, onClick, primary }) {
    return (
        <button
            onClick={onClick}
            style={{
                font: "700 13px ui-sans-serif,system-ui",
                color: primary ? "#04140d" : "#dfe8fb",
                background: primary ? C.selected : "rgba(255,255,255,.05)",
                border: `1px solid ${primary ? C.selected : "#2a3a5c"}`,
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
   TOAST (temporary feedback until Supabase wired)
   ============================================================================ */
function Toast() {
    const [msg, setMsg] = useState(null);
    useEffect(() => {
        const on = (e) => {
            const { action, no } = e.detail;
            const map = { book: "Booking request sent", interested: "Interest registered", brochure: "Brochure requested" };
            setMsg(`${map[action] || "Done"} · Site ${no}`);
            const t = setTimeout(() => setMsg(null), 2600);
            return () => clearTimeout(t);
        };
        window.addEventListener("bg-toast", on);
        return () => window.removeEventListener("bg-toast", on);
    }, []);
    return (
        <AnimatePresence>
            {msg && (
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 30, opacity: 0 }}
                    style={toastStyle}
                >
                    {msg}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
const toastStyle = {
    position: "absolute",
    bottom: 90,
    left: "50%",
    transform: "translateX(-50%)",
    background: C.selected,
    color: "#04140d",
    font: "700 13px ui-sans-serif,system-ui",
    padding: "10px 18px",
    borderRadius: 20,
    boxShadow: "0 10px 30px rgba(0,0,0,.4)",
    zIndex: 40,
};

/* ============================================================================
   ROOT
   ============================================================================ */
export default function BasavaGanguru3DLayout() {
    const mobile = useIsMobile();
    const [hovered, setHovered] = useState(null);
    const [selectedId, setSelectedId] = useState(null);
    const focusTarget = useRef(null);

    const selected = useMemo(() => RESIDENTIAL.find((s) => s.id === selectedId) || null, [selectedId]);
    const onSelect = useCallback((id) => setSelectedId((prev) => (prev === id ? null : id)), []);

    const locate = useCallback(() => {
        if (!selected) return;
        focusTarget.current = new THREE.Vector3(selected.x, 0, selected.z);
        if (Scene._focus) Scene._focus(focusTarget.current);
    }, [selected]);

    const resetNorth = useCallback(() => {
        focusTarget.current = new THREE.Vector3(CENTER.x, 0, CENTER.z);
        if (Scene._focus) Scene._focus(focusTarget.current);
    }, []);

    const stats = useMemo(() => {
        const avail = RESIDENTIAL.filter((s) => s.status === "available").length;
        return { total: RESIDENTIAL.length, avail };
    }, []);

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100vh",
                background: C.sky,
                overflow: "hidden",
                fontFamily: "ui-sans-serif,system-ui",
                touchAction: "none",
            }}
        >
            <Canvas
                shadows
                dpr={[1, mobile ? 1.5 : 2]}
                camera={{ position: [CENTER.x, 220, CENTER.z + 240], fov: 42 }}
                onPointerMissed={() => setHovered(null)}
            >
                <Scene
                    hovered={hovered}
                    selectedId={selectedId}
                    onHover={setHovered}
                    onSelect={onSelect}
                    focusTarget={focusTarget}
                    mobile={mobile}
                />
            </Canvas>

            {/* Project info */}
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                style={{ position: "absolute", top: 20, left: 20, color: "#0b1a33", pointerEvents: "none", maxWidth: "60%" }}
            >
                <div style={{ font: "700 11px ui-sans-serif", letterSpacing: 3, color: C.boundary }}>
                    SY.NO.43/1 · SHIVAMOGGA · BUDA APPROVED
                </div>
                <div
                    style={{
                        font: "800 30px ui-sans-serif,system-ui",
                        letterSpacing: -0.5,
                        color: "#0b1a33",
                        marginTop: 2,
                        textShadow: "0 1px 10px rgba(255,255,255,.6)",
                    }}
                >
                    Basava Ganguru
                </div>
                <div style={{ font: "600 13px ui-sans-serif", color: "#22406b", marginTop: 3 }}>
                    32 Premium Sites · DC Converted · From {INR(PRICE_PER_SQFT)}/sq.ft
                </div>
                <div style={{ font: "700 12px ui-sans-serif", color: "#0a7d52", marginTop: 4 }}>
                    {stats.avail} of {stats.total} available
                </div>
            </motion.div>

            <MiniMap selectedId={selectedId} onPick={onSelect} />
            <Compass onReset={resetNorth} />
            <Toast />

            {!mobile && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ position: "absolute", bottom: 24, left: 20, maxWidth: 440 }}
                >
                    <Legend />
                </motion.div>
            )}

            {/* Desktop sidebar */}
            {!mobile && (
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            key="sidebar"
                            initial={{ x: 60, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 60, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 220, damping: 26 }}
                            style={sidebar}
                        >
                            <SelectedCard s={selected} onLocate={locate} onClose={() => setSelectedId(null)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Mobile bottom sheet */}
            {mobile && (
                <AnimatePresence>
                    {selected && (
                        <motion.div
                            key="sheet"
                            initial={{ y: 400 }}
                            animate={{ y: 0 }}
                            exit={{ y: 400 }}
                            transition={{ type: "spring", stiffness: 260, damping: 30 }}
                            style={sheet}
                        >
                            <div style={{ width: 40, height: 4, background: "#3a4a6a", borderRadius: 4, margin: "0 auto 12px" }} />
                            <SelectedCard s={selected} onLocate={locate} onClose={() => setSelectedId(null)} />
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {!selected && (
                <div style={hint}>
                    {mobile ? "Tap a plot to view details" : "Click a plot to view details · drag to orbit · scroll to zoom"}
                </div>
            )}
        </div>
    );
}

/* ---- panel styles ---- */
const glass = {
    background: "rgba(9,14,26,.72)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    border: "1px solid rgba(90,120,180,.35)",
    boxShadow: "0 24px 70px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.08)",
    color: "#f2f6ff",
};
const sidebar = {
    ...glass,
    position: "absolute",
    top: 90,
    right: 20,
    width: 340,
    borderRadius: 22,
    padding: 20,
    zIndex: 25,
};
const sheet = {
    ...glass,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: "22px 22px 0 0",
    padding: "16px 18px 26px",
    zIndex: 30,
};
const hint = {
    position: "absolute",
    bottom: 78,
    left: "50%",
    transform: "translateX(-50%)",
    font: "600 12px ui-sans-serif,system-ui",
    color: "#0b1a33",
    background: "rgba(255,255,255,.55)",
    backdropFilter: "blur(6px)",
    padding: "8px 16px",
    borderRadius: 20,
    pointerEvents: "none",
};