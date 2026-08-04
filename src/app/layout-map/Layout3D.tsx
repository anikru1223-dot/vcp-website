"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export type Plot3D = { id: string; pts: string; sqft: number };

type Props = {
    plots: Plot3D[];
    boundary: string;
    ca: string;
    karab: string;
    stp: string;
    roads: { top: string; leftV: Rect; rightV: Rect; midH: Rect; path: Rect };
    selected: string | null;
    onSelect: (id: string | null) => void;
};
type Rect = { x: number; y: number; w: number; h: number };

const parse = (pts: string): [number, number][] =>
    pts.trim().split(/\s+/).map((p) => {
        const [x, y] = p.split(",").map(Number);
        return [x, y];
    });

// World is centered near the layout middle so the camera orbits nicely.
const CX = 620, CZ = 600, SCALE = 0.1;

function shape(pts: [number, number][]) {
    const s = new THREE.Shape();
    pts.forEach(([x, y], i) => {
        const wx = (x - CX) * SCALE, wz = (y - CZ) * SCALE;
        if (i === 0) s.moveTo(wx, wz); else s.lineTo(wx, wz);
    });
    s.closePath();
    return s;
}

export default function Layout3D({ plots, boundary, ca, karab, stp, roads, selected, onSelect }: Props) {
    const mountRef = useRef<HTMLDivElement | null>(null);
    const selRef = useRef(selected);
    selRef.current = selected;
    const onSelRef = useRef(onSelect);
    onSelRef.current = onSelect;

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;
        const W = mount.clientWidth, H = mount.clientHeight;

        // ---- Scene ----
        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#8f7d4c");
        scene.fog = new THREE.Fog("#8f7d4c", 90, 220);

        const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 1000);
        camera.position.set(0, 62, 78);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.minDistance = 30;
        controls.maxDistance = 170;
        controls.maxPolarAngle = Math.PI / 2.15;
        controls.target.set(0, 0, 6);

        // ---- Lighting (sun + sky + fill) ----
        const hemi = new THREE.HemisphereLight("#fff4d6", "#5a5230", 0.9);
        scene.add(hemi);
        const sun = new THREE.DirectionalLight("#fff1c4", 1.5);
        sun.position.set(-40, 70, 30);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.camera.near = 1; sun.shadow.camera.far = 260;
        const sc = sun.shadow.camera as THREE.OrthographicCamera;
        sc.left = -90; sc.right = 90; sc.top = 90; sc.bottom = -90;
        sun.shadow.bias = -0.0003;
        scene.add(sun);
        const amb = new THREE.AmbientLight("#ffffff", 0.35);
        scene.add(amb);

        // ---- Ground plane ----
        const groundGeo = new THREE.PlaneGeometry(600, 600);
        const groundMat = new THREE.MeshStandardMaterial({ color: "#9c8a54", roughness: 1 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.05;
        ground.receiveShadow = true;
        scene.add(ground);

        // scatter low-poly trees on open land
        const treeMat = new THREE.MeshStandardMaterial({ color: "#3f6a26", roughness: 0.9 });
        const trunkMat = new THREE.MeshStandardMaterial({ color: "#5a3d24", roughness: 1 });
        const treeGeo = new THREE.IcosahedronGeometry(1.4, 0);
        const trunkGeo = new THREE.CylinderGeometry(0.22, 0.28, 1.2, 5);
        let seed = 7;
        const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
        for (let i = 0; i < 220; i++) {
            const x = (90 + rnd() * 1090 - CX) * SCALE;
            const z = (210 + rnd() * 980 - CZ) * SCALE;
            const px = 90 + rnd() * 1090, pz = 210 + rnd() * 980;
            if (px > 118 && px < 1000 && pz > 184 && pz < 960) continue; // keep off the built core
            const s = 0.7 + rnd() * 0.8;
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.set(x, 0.6 * s, z); trunk.scale.setScalar(s); trunk.castShadow = true;
            scene.add(trunk);
            const canopy = new THREE.Mesh(treeGeo, treeMat);
            canopy.position.set(x, 1.7 * s, z); canopy.scale.setScalar(s * (0.8 + rnd() * 0.5)); canopy.castShadow = true;
            scene.add(canopy);
        }

        // ---- Roads (dark slabs) ----
        const roadMat = new THREE.MeshStandardMaterial({ color: "#3a342a", roughness: 1 });
        const addRoadRect = (r: Rect, h = 0.12) => {
            const g = new THREE.BoxGeometry(r.w * SCALE, h, r.h * SCALE);
            const m = new THREE.Mesh(g, roadMat);
            m.position.set((r.x + r.w / 2 - CX) * SCALE, h / 2, (r.y + r.h / 2 - CZ) * SCALE);
            m.receiveShadow = true;
            scene.add(m);
        };
        addRoadRect(roads.leftV); addRoadRect(roads.rightV); addRoadRect(roads.midH);
        // top road + pathway as polygons
        const roadPoly = (pts: string, color: string, h = 0.12) => {
            const geo = new THREE.ExtrudeGeometry(shape(parse(pts)), { depth: h, bevelEnabled: false });
            geo.rotateX(-Math.PI / 2);
            const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 1 }));
            m.position.y = 0; m.receiveShadow = true;
            scene.add(m);
        };
        roadPoly(roads.top, "#3a342a", 0.14);
        addRoadRect(roads.path, 0.1);

        // ---- Amenities ----
        const extrudePoly = (pts: string, depth: number, color: string, y = 0) => {
            const geo = new THREE.ExtrudeGeometry(shape(parse(pts)), { depth, bevelEnabled: false });
            geo.rotateX(-Math.PI / 2);
            const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
            mesh.position.y = y; mesh.castShadow = true; mesh.receiveShadow = true;
            scene.add(mesh);
            return mesh;
        };
        extrudePoly(karab, 0.25, "#8fbe5a");
        extrudePoly(ca, 0.25, "#a9d475");
        extrudePoly(stp, 0.5, "#b9aecb");

        // lake
        const lakeGeo = new THREE.CircleGeometry(14 * SCALE * 10 * SCALE, 40);

        // ---- Plots (extruded blocks, interactive) ----
        const plotMeshes: THREE.Mesh[] = [];
        const baseColor = new THREE.Color("#457029");
        const selColor = new THREE.Color("#7fc255");
        plots.forEach((p) => {
            const geo = new THREE.ExtrudeGeometry(shape(parse(p.pts)), { depth: 2.4, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.15, bevelSegments: 1 });
            geo.rotateX(-Math.PI / 2);
            const mat = new THREE.MeshStandardMaterial({ color: baseColor.clone(), roughness: 0.7, metalness: 0.05 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.y = 0.14;
            mesh.castShadow = true; mesh.receiveShadow = true;
            mesh.userData.id = p.id;
            scene.add(mesh);
            plotMeshes.push(mesh);

            // gold top edge
            const edges = new THREE.EdgesGeometry(geo, 30);
            const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: "#d4ab54" }));
            line.position.copy(mesh.position);
            scene.add(line);

            // number label as sprite
            const cx = parse(p.pts).reduce((a, [x]) => a + x, 0) / parse(p.pts).length;
            const cz = parse(p.pts).reduce((a, [, y]) => a + y, 0) / parse(p.pts).length;
            const cv = document.createElement("canvas"); cv.width = 128; cv.height = 128;
            const ctx = cv.getContext("2d")!;
            ctx.fillStyle = "#ffffff"; ctx.font = "bold 74px Inter, sans-serif";
            ctx.textAlign = "center"; ctx.textBaseline = "middle";
            ctx.strokeStyle = "rgba(0,0,0,.4)"; ctx.lineWidth = 6; ctx.strokeText(p.id, 64, 68);
            ctx.fillText(p.id, 64, 68);
            const tex = new THREE.CanvasTexture(cv);
            const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
            spr.position.set((cx - CX) * SCALE, 3.4, (cz - CZ) * SCALE);
            spr.scale.setScalar(3);
            scene.add(spr);
        });

        // ---- Raycast selection ----
        const ray = new THREE.Raycaster();
        const ptr = new THREE.Vector2();
        let downX = 0, downY = 0;
        const onDown = (e: PointerEvent) => { downX = e.clientX; downY = e.clientY; };
        const onUp = (e: PointerEvent) => {
            if (Math.hypot(e.clientX - downX, e.clientY - downY) > 6) return; // was a drag
            const rect = renderer.domElement.getBoundingClientRect();
            ptr.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            ptr.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            ray.setFromCamera(ptr, camera);
            const hit = ray.intersectObjects(plotMeshes, false)[0];
            onSelRef.current(hit ? (hit.object.userData.id as string) : null);
        };
        renderer.domElement.addEventListener("pointerdown", onDown);
        renderer.domElement.addEventListener("pointerup", onUp);

        // ---- Animate ----
        let rafId = 0;
        const clock = new THREE.Clock();
        const animate = () => {
            rafId = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();
            plotMeshes.forEach((m) => {
                const isSel = m.userData.id === selRef.current;
                const targetY = isSel ? 0.14 + Math.sin(t * 3) * 0.15 + 1.2 : 0.14;
                m.position.y += (targetY - m.position.y) * 0.15;
                (m.material as THREE.MeshStandardMaterial).color.lerp(isSel ? selColor : baseColor, 0.15);
            });
            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // ---- Resize ----
        const onResize = () => {
            const w = mount.clientWidth, h = mount.clientHeight;
            camera.aspect = w / h; camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener("resize", onResize);

        // intro camera sweep
        let intro = 0;
        const introAnim = () => {
            intro += 0.016;
            if (intro < 1.4) {
                camera.position.x = Math.sin(intro * 0.9) * 20;
                requestAnimationFrame(introAnim);
            }
        };
        introAnim();

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener("resize", onResize);
            renderer.domElement.removeEventListener("pointerdown", onDown);
            renderer.domElement.removeEventListener("pointerup", onUp);
            controls.dispose();
            renderer.dispose();
            if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
            scene.traverse((o) => {
                const any = o as unknown as { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
                any.geometry?.dispose?.();
                const m = any.material;
                if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
                else m?.dispose?.();
            });
        };
    }, []);

    return <div ref={mountRef} style={{ position: "absolute", inset: 0, touchAction: "none" }} />;
}