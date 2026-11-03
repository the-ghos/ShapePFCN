import React, { useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Air } from "../fx/Air";
import { Background } from "../fx/Background";
import { C, labelFont } from "../theme";

const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// logo geometry (1080 artboard) re-centered, y flipped, 1 unit = 100px
const toV = (pts: [number, number][]) => pts.map(([x, y]) => new THREE.Vector2((x - 548) / 100, -(y - 430) / 100));
const LEFT = toV([[358, 255], [475, 255], [562, 505], [508, 605]]);
const RIGHT = toV([[638, 255], [738, 255], [558, 592], [530, 540]]);

const gradientGeometry = (pts: THREE.Vector2[], depth: number, stops: [THREE.Color, THREE.Color, THREE.Color], dir: [number, number]) => {
  const shape = new THREE.Shape(pts);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.05,
    bevelSegments: 6,
    steps: 1,
  });
  geo.translate(0, 0, -depth / 2);
  const pos = geo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < pos.count; i++) {
    const v = pos.getX(i) * dir[0] + pos.getY(i) * dir[1];
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const t = (pos.getX(i) * dir[0] + pos.getY(i) * dir[1] - min) / (max - min);
    if (t < 0.5) c.copy(stops[0]).lerp(stops[1], t * 2);
    else c.copy(stops[1]).lerp(stops[2], (t - 0.5) * 2);
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.computeVertexNormals();
  return geo;
};

const Bar: React.FC<{ y: number; x1: number; x2: number; color: string; p: number; z: number }> = ({ y, x1, x2, color, p, z }) => {
  const len = ((x2 - x1) / 100) * p;
  if (p <= 0.001) return null;
  const cx = (x2 - 548) / 100 - len / 2 - (1 - p) * 1.5;
  return (
    <mesh position={[cx, -(y - 430) / 100, z]} rotation={[0, 0, Math.PI / 2]}>
      <capsuleGeometry args={[0.09, Math.max(0.01, len - 0.18), 8, 16]} />
      <meshPhysicalMaterial color={color} roughness={0.25} metalness={0.2} clearcoat={1} emissive={color} emissiveIntensity={0.25} />
    </mesh>
  );
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const leftGeo = useMemo(
    () => gradientGeometry(LEFT, 0.55, [new THREE.Color(C.orangeLight), new THREE.Color(C.orange), new THREE.Color(C.red)], [0.45, -1]),
    [],
  );
  const rightGeo = useMemo(
    () => gradientGeometry(RIGHT, 0.55, [new THREE.Color(C.blue), new THREE.Color(C.violet), new THREE.Color(C.violetDeep)], [-0.45, -1]),
    [],
  );
  const spin = interpolate(f, [0, 95], [-Math.PI * 1.15, 0], { ...cl, easing: Easing.bezier(0.3, 0, 0.1, 1) });
  const tilt = interpolate(f, [0, 95], [0.5, 0], { ...cl, easing: Easing.bezier(0.3, 0, 0.1, 1) });
  const floatY = Math.sin(f / 18) * 0.06;
  const explode = interpolate(f, [0, 70], [1, 0], { ...cl, easing: Easing.out(Easing.cubic) });
  const bars = [0, 1, 2].map((i) => interpolate(f, [70 + i * 5, 88 + i * 5], [0, 1], { ...cl, easing: Easing.out(Easing.cubic) }));
  const zoom = interpolate(f, [0, 140], [0.62, 0.8], { ...cl, easing: Easing.out(Easing.quad) });
  const la = f / 25;

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight position={[-4 + Math.cos(la) * 1.5, 2.5, 4]} intensity={60} color={C.orange} />
      <pointLight position={[4 + Math.sin(la) * 1.5, -1.5, 4]} intensity={60} color={C.blue} />
      <directionalLight position={[0, 4, 6]} intensity={1.6} color="#ffffff" />
      <spotLight position={[0, 0, -5]} intensity={80} color={C.violet} angle={0.9} />
      <group rotation={[tilt, spin, 0]} position={[0.15, 0.3 + floatY, 0]} scale={zoom}>
        <mesh geometry={leftGeo} position={[-explode * 3, explode * 3, explode * 2]} rotation={[0, 0, explode * 0.6]}>
          <meshPhysicalMaterial vertexColors roughness={0.22} metalness={0.35} clearcoat={1} clearcoatRoughness={0.08} emissive="#3a1206" emissiveIntensity={0.4} />
        </mesh>
        <mesh geometry={rightGeo} position={[explode * 3, explode * 3, -explode * 2]} rotation={[0, 0, -explode * 0.6]}>
          <meshPhysicalMaterial vertexColors roughness={0.18} metalness={0.3} clearcoat={1} clearcoatRoughness={0.05} transparent opacity={0.92} emissive="#100a3a" emissiveIntensity={0.5} />
        </mesh>
        <Bar y={339} x1={328} x2={402} color={C.speed1} p={bars[0]} z={0} />
        <Bar y={386} x1={299} x2={407} color={C.speed2} p={bars[1]} z={0} />
        <Bar y={433} x1={341} x2={424} color={C.speed3} p={bars[2]} z={0} />
      </group>
    </>
  );
};

export const Logo3D: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const label = interpolate(f, [80, 100, 125, 140], [0, 1, 1, 1], cl);
  return (
    <AbsoluteFill>
      <Background warm={1.1} cool={1.1} />
      <Air count={60} speed={1.5} seed="3d" streaks={20} />
      {/* floor glow */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center" }}>
        <div
          style={{
            width: 1100,
            height: 220,
            marginBottom: 80,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(255,90,31,0.35), rgba(123,92,255,0.18) 45%, transparent 70%)",
            filter: "blur(30px)",
          }}
        />
      </AbsoluteFill>
      <ThreeCanvas width={width} height={height} camera={{ fov: 32, position: [0, 0, 9] }} gl={{ antialias: true }}>
        <Scene />
      </ThreeCanvas>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 110 }}>
        <div
          style={{
            fontFamily: labelFont,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: interpolate(label, [0, 1], [40, 16]),
            color: C.white,
            opacity: label * 0.85,
          }}
        >
          DESIGNED TO MOVE
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
