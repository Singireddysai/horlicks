"use client";

import { Float, Sparkles } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import type { Group } from "three";

function heartShape() {
  const shape = new THREE.Shape();
  const points: THREE.Vector2[] = [];
  for (let index = 0; index <= 72; index += 1) {
    const angle = (index / 72) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(angle), 3);
    const y = 13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle);
    points.push(new THREE.Vector2(x * 0.063, y * 0.063));
  }
  shape.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => shape.lineTo(point.x, point.y));
  shape.closePath();
  return shape;
}

function Rose() {
  const petals = useMemo(() => {
    const result: Array<{ position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number]; color: string }> = [];
    const layers = [
      { count: 5, radius: 0.16, y: 0.46, size: 0.33 },
      { count: 7, radius: 0.28, y: 0.4, size: 0.45 },
      { count: 9, radius: 0.4, y: 0.31, size: 0.55 },
    ];
    layers.forEach((layer, layerIndex) => {
      for (let index = 0; index < layer.count; index += 1) {
        const angle = (index / layer.count) * Math.PI * 2 + layerIndex * 0.4;
        result.push({
          position: [Math.cos(angle) * layer.radius, layer.y, Math.sin(angle) * layer.radius],
          rotation: [0.75 - layerIndex * 0.12, -angle, Math.sin(angle) * 0.25],
          scale: [layer.size, layer.size * 0.78, 0.13],
          color: layerIndex === 0 ? "#9e2947" : layerIndex === 1 ? "#c64262" : "#df6f83",
        });
      }
    });
    return result;
  }, []);

  return (
    <group position={[0, -0.42, 0.24]} rotation={[0.04, 0, -0.05]}>
      <mesh position={[0, -0.34, 0]}>
        <cylinderGeometry args={[0.035, 0.05, 1.45, 10]} />
        <meshStandardMaterial color="#52654b" roughness={0.8} />
      </mesh>
      <mesh position={[-0.2, -0.42, 0]} rotation={[0, 0.4, -0.55]} scale={[0.38, 0.17, 0.08]}>
        <sphereGeometry args={[1, 20, 12]} />
        <meshStandardMaterial color="#718069" roughness={0.85} />
      </mesh>
      <mesh position={[0.2, -0.12, 0]} rotation={[0, -0.4, 0.55]} scale={[0.34, 0.15, 0.07]}>
        <sphereGeometry args={[1, 20, 12]} />
        <meshStandardMaterial color="#63755b" roughness={0.85} />
      </mesh>
      {petals.map((petal, index) => (
        <mesh key={index} position={petal.position} rotation={petal.rotation} scale={petal.scale}>
          <sphereGeometry args={[1, 24, 16]} />
          <meshStandardMaterial color={petal.color} roughness={0.62} metalness={0.03} />
        </mesh>
      ))}
      <mesh position={[0, 0.47, 0]} scale={[0.18, 0.2, 0.17]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshStandardMaterial color="#7f1737" roughness={0.62} />
      </mesh>
    </group>
  );
}

function Keepsake({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const shape = useMemo(() => heartShape(), []);
  const extrude = useMemo(() => ({ depth: 0.22, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.055, bevelThickness: 0.045 }), []);

  useFrame((state, delta) => {
    if (!group.current || reducedMotion) return;
    const targetX = state.pointer.y * 0.18;
    const targetY = state.pointer.x * 0.28;
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetX, 4, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 4, delta);
  });

  return (
    <Float speed={reducedMotion ? 0 : 1.25} rotationIntensity={reducedMotion ? 0 : 0.12} floatIntensity={reducedMotion ? 0 : 0.22}>
      <group ref={group} scale={1.18}>
        <mesh position={[0, 0, -0.18]}>
          <extrudeGeometry args={[shape, extrude]} />
          <meshPhysicalMaterial color="#8f2945" metalness={0.62} roughness={0.25} clearcoat={0.8} clearcoatRoughness={0.2} />
        </mesh>
        <mesh position={[0, 0, 0.12]} scale={0.89}>
          <extrudeGeometry args={[shape, { ...extrude, depth: 0.08, bevelSize: 0.035, bevelThickness: 0.03 }]} />
          <meshPhysicalMaterial color="#f4d7d8" transparent opacity={0.24} roughness={0.08} metalness={0.05} transmission={0.45} thickness={0.35} />
        </mesh>
        <Rose />
      </group>
    </Float>
  );
}

export function LegacyRoseScene({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <Canvas
      aria-label="An interactive three-dimensional rose keepsake"
      camera={{ position: [0, 0, 5.4], fov: 36 }}
      dpr={[1, 1.5]}
      frameloop={reducedMotion ? "demand" : "always"}
      fallback={<div className="keepsake-fallback" aria-hidden="true"><span>♡</span></div>}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={1.4} color="#fff4ef" />
      <directionalLight position={[3, 4, 5]} intensity={3.2} color="#fff0e4" />
      <pointLight position={[-3, -1, 3]} intensity={18} color="#c94062" distance={8} />
      <pointLight position={[2, -2, 2]} intensity={9} color="#d1aa6f" distance={7} />
      <Keepsake reducedMotion={reducedMotion} />
      <Sparkles count={22} scale={[4, 4, 2]} size={2} speed={reducedMotion ? 0 : 0.25} opacity={0.45} color="#d8af76" />
    </Canvas>
  );
}

const candlePositions: Array<{ position: [number, number, number]; color: string }> = [
  { position: [-0.34, 0.75, 0.02], color: "#f2d58d" },
  { position: [0, 0.82, -0.04], color: "#b9d3c0" },
  { position: [0.34, 0.75, 0.02], color: "#ef9fb2" },
];

const sprinkleData: Array<{ position: [number, number, number]; rotation: number; color: string }> = [
  { position: [-0.67, -0.15, 0.69], rotation: -0.7, color: "#f6dc91" },
  { position: [-0.55, -0.75, 0.77], rotation: 0.45, color: "#7da18b" },
  { position: [-0.42, 0.02, 0.82], rotation: 0.8, color: "#fff1da" },
  { position: [-0.24, -0.86, 0.89], rotation: -0.25, color: "#df6f89" },
  { position: [0.24, -0.83, 0.89], rotation: 0.4, color: "#f6dc91" },
  { position: [0.47, -0.06, 0.81], rotation: -0.65, color: "#7da18b" },
  { position: [0.62, -0.68, 0.73], rotation: 0.72, color: "#fff1da" },
  { position: [0.73, -0.28, 0.63], rotation: -0.12, color: "#df6f89" },
];

function Flame({ reducedMotion }: { reducedMotion: boolean }) {
  const flame = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!flame.current || reducedMotion) return;
    const time = state.clock.elapsedTime;
    flame.current.scale.y = 0.16 * (1 + Math.sin(time * 12) * 0.08);
    flame.current.rotation.z = Math.sin(time * 8) * 0.09;
  });

  return (
    <group position={[0, 0.49, 0]}>
      <pointLight color="#ffb45f" intensity={1.7} distance={1.7} />
      <mesh ref={flame} scale={[0.075, 0.16, 0.075]}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial color="#ffd782" emissive="#ff7d3b" emissiveIntensity={2.3} roughness={0.28} />
      </mesh>
    </group>
  );
}

function Candle({ position, color, wished, reducedMotion }: { position: [number, number, number]; color: string; wished: boolean; reducedMotion: boolean }) {
  return (
    <group position={position}>
      <mesh>
        <cylinderGeometry args={[0.055, 0.055, 0.64, 20]} />
        <meshStandardMaterial color={color} roughness={0.62} />
      </mesh>
      {[-0.18, 0, 0.18].map((height) => (
        <mesh key={height} position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.056, 0.011, 8, 20]} />
          <meshStandardMaterial color="#fff6e9" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 0.34, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.08, 8]} />
        <meshStandardMaterial color="#4c3034" />
      </mesh>
      {!wished && <Flame reducedMotion={reducedMotion} />}
    </group>
  );
}

function ConfettiBurst({ reducedMotion }: { reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  const pieces = useMemo(() => Array.from({ length: 30 }, (_, index) => {
    const angle = (index / 30) * Math.PI * 2;
    const spread = 0.8 + ((index * 17) % 9) * 0.08;
    return {
      direction: new THREE.Vector3(Math.cos(angle) * spread, 1.3 + (index % 5) * 0.17, Math.sin(angle) * spread * 0.52),
      color: ["#f4b1bf", "#f6d68b", "#b6cdbb", "#fff4e8"][index % 4],
      rotation: index * 0.7,
    };
  }), []);

  useFrame((state) => {
    if (!group.current || reducedMotion) return;
    if (start.current === null) start.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - start.current;
    group.current.children.forEach((child, index) => {
      const piece = pieces[index];
      child.position.set(
        piece.direction.x * elapsed,
        0.5 + piece.direction.y * elapsed - 1.25 * elapsed * elapsed,
        piece.direction.z * elapsed,
      );
      child.rotation.set(elapsed * 5 + piece.rotation, elapsed * 7, piece.rotation);
      child.scale.setScalar(Math.max(0, 1 - Math.max(0, elapsed - 1.45) * 1.4));
    });
  });

  return (
    <group ref={group}>
      {pieces.map((piece, index) => (
        <mesh key={index} scale={reducedMotion ? 0 : 1}>
          <boxGeometry args={[0.055, 0.15, 0.025]} />
          <meshStandardMaterial color={piece.color} roughness={0.65} />
        </mesh>
      ))}
    </group>
  );
}

function FloatingHeart({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const shape = useMemo(() => heartShape(), []);
  const extrude = useMemo(() => ({ depth: 0.08, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.025, bevelThickness: 0.025 }), []);
  return (
    <Float speed={1.4} rotationIntensity={0.55} floatIntensity={0.5}>
      <mesh position={position} scale={0.16 * scale} rotation={[0.05, -0.25, 0.05]}>
        <extrudeGeometry args={[shape, extrude]} />
        <meshPhysicalMaterial color={color} roughness={0.38} clearcoat={0.35} />
      </mesh>
    </Float>
  );
}

function WishCake({ wished, onWish, reducedMotion }: { wished: boolean; onWish: () => void; reducedMotion: boolean }) {
  const group = useRef<Group>(null);
  const wishAge = useRef(10);
  const topperShape = useMemo(() => heartShape(), []);
  const topperExtrude = useMemo(() => ({ depth: 0.12, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.04, bevelThickness: 0.035 }), []);

  useEffect(() => {
    wishAge.current = 0;
  }, [wished]);

  useEffect(() => () => {
    document.body.style.cursor = "";
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (!reducedMotion) {
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, state.pointer.y * 0.13 - 0.04, 4, delta);
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, state.pointer.x * 0.28 + Math.sin(state.clock.elapsedTime * 0.45) * 0.035, 4, delta);
      group.current.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.045;
    }
    wishAge.current += delta;
    const pulse = wished && wishAge.current < 1.5 ? Math.sin(wishAge.current * 10) * Math.exp(-wishAge.current * 3.5) * 0.07 : 0;
    group.current.scale.setScalar(1.08 + pulse);
  });

  return (
    <group
      ref={group}
      scale={1.08}
      onClick={(event) => {
        event.stopPropagation();
        onWish();
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "";
      }}
    >
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[1.2, 1.28, 0.1, 64]} />
        <meshPhysicalMaterial color="#f7e8dd" roughness={0.28} clearcoat={0.45} />
      </mesh>
      <mesh position={[0, -1.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.13, 0.07, 14, 64]} />
        <meshStandardMaterial color="#d9a5ad" roughness={0.55} />
      </mesh>

      <mesh position={[0, -0.38, 0]}>
        <cylinderGeometry args={[0.91, 0.96, 1.34, 64]} />
        <meshPhysicalMaterial color="#f3a6b5" roughness={0.56} clearcoat={0.16} />
      </mesh>
      <mesh position={[0, -0.39, 0]}>
        <cylinderGeometry args={[0.965, 0.965, 0.18, 64]} />
        <meshStandardMaterial color="#fff0df" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.94, 0.94, 0.2, 64]} />
        <meshPhysicalMaterial color="#ffe5e0" roughness={0.48} clearcoat={0.22} />
      </mesh>

      {Array.from({ length: 14 }, (_, index) => {
        const angle = (index / 14) * Math.PI * 2;
        const height = 0.12 + (index % 4) * 0.045;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.86, 0.2 - height / 2, Math.sin(angle) * 0.86]} scale={[0.16, height, 0.16]}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshStandardMaterial color="#ffe5e0" roughness={0.5} />
          </mesh>
        );
      })}

      {Array.from({ length: 12 }, (_, index) => {
        const angle = (index / 12) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * 0.75, 0.47, Math.sin(angle) * 0.75]} scale={[0.18, 0.1, 0.18]}>
            <sphereGeometry args={[1, 18, 12]} />
            <meshPhysicalMaterial color="#fff5e9" roughness={0.48} clearcoat={0.15} />
          </mesh>
        );
      })}

      {sprinkleData.map((sprinkle, index) => (
        <mesh key={index} position={sprinkle.position} rotation={[0, 0, sprinkle.rotation]}>
          <boxGeometry args={[0.045, 0.14, 0.025]} />
          <meshStandardMaterial color={sprinkle.color} roughness={0.6} />
        </mesh>
      ))}

      <group position={[0, 0, 0.92]}>
        <mesh position={[-0.24, -0.27, 0]} scale={[0.09, 0.115, 0.055]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color="#4b2832" roughness={0.46} />
        </mesh>
        <mesh position={[0.24, -0.27, 0]} scale={[0.09, 0.115, 0.055]}>
          <sphereGeometry args={[1, 20, 14]} />
          <meshStandardMaterial color="#4b2832" roughness={0.46} />
        </mesh>
        <mesh position={[-0.28, -0.22, 0.05]} scale={0.023}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.2, -0.22, 0.05]} scale={0.023}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0, -0.5, 0]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.22, 0.035, 10, 28, Math.PI]} />
          <meshStandardMaterial color="#4b2832" roughness={0.48} />
        </mesh>
        <mesh position={[-0.43, -0.47, 0]} scale={[0.12, 0.055, 0.025]}>
          <sphereGeometry args={[1, 16, 10]} />
          <meshBasicMaterial color="#e97991" transparent opacity={0.65} />
        </mesh>
        <mesh position={[0.43, -0.47, 0]} scale={[0.12, 0.055, 0.025]}>
          <sphereGeometry args={[1, 16, 10]} />
          <meshBasicMaterial color="#e97991" transparent opacity={0.65} />
        </mesh>
      </group>

      <group position={[0, 0.06, -0.3]}>
        <mesh position={[0, 0.88, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 1.12, 12]} />
          <meshStandardMaterial color="#c09b64" roughness={0.65} />
        </mesh>
        <mesh position={[0, 1.47, 0]} scale={0.28}>
          <extrudeGeometry args={[topperShape, topperExtrude]} />
          <meshPhysicalMaterial color="#bd3f5d" roughness={0.3} clearcoat={0.58} clearcoatRoughness={0.2} />
        </mesh>
      </group>

      {candlePositions.map((candle) => <Candle key={candle.position[0]} {...candle} wished={wished} reducedMotion={reducedMotion} />)}
      {wished && <ConfettiBurst reducedMotion={reducedMotion} />}
    </group>
  );
}

export default function WishCakeScene({ reducedMotion = false, wished = false, onWish = () => undefined }: { reducedMotion?: boolean; wished?: boolean; onWish?: () => void }) {
  return (
    <Canvas
      aria-label="An interactive three-dimensional birthday cake with candles"
      camera={{ position: [0, 0.1, 6.4], fov: 34 }}
      dpr={[1, 1.6]}
      frameloop={reducedMotion ? "demand" : "always"}
      fallback={<div className="keepsake-fallback" aria-hidden="true"><span>{"\u2661"}</span></div>}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={1.8} color="#fff7f0" />
      <directionalLight position={[3, 5, 5]} intensity={3.8} color="#fff0df" />
      <pointLight position={[-3, 0, 3]} intensity={15} color="#d84e72" distance={8} />
      <pointLight position={[3, -1, 2]} intensity={10} color="#b9ceb8" distance={7} />
      <WishCake wished={wished} onWish={onWish} reducedMotion={reducedMotion} />
      <FloatingHeart position={[-1.72, 0.92, -0.25]} color="#f0a4b4" scale={1.05} />
      <FloatingHeart position={[1.72, 0.35, -0.15]} color="#f4d891" scale={0.78} />
      <FloatingHeart position={[-1.45, -1.15, 0.1]} color="#afc6b2" scale={0.7} />
      <Sparkles count={32} scale={[4.4, 4, 2]} size={2.2} speed={reducedMotion ? 0 : 0.35} opacity={0.55} color="#f1cf99" />
    </Canvas>
  );
}
