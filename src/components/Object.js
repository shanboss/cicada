"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { OrbitControls } from "@react-three/drei";

function Torus(props) {
  const ref = useRef();
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  useFrame((state, delta) => (ref.current.rotation.x += 0.01));
  return (
    <mesh
      {...props}
      ref={ref}
      scale={clicked ? 1.5 : 1}
      onClick={(event) => click(!clicked)}
      onPointerOver={(event) => (event.stopPropagation(), hover(true))}
      onPointerOut={(event) => hover(false)}
    >
      <torusGeometry args={[10, 1, 10, 100]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

export default function Object() {
  return (
    <Canvas camera={{ fov: 20, position: [0, 0, 80] }}>
      <ambientLight intensity={Math.PI / 2} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        decay={0}
        intensity={Math.PI}
      />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Torus position={[0, 0, 0]} rotation={[45, 45, 45]} />
      <Torus position={[0, 0, 0]} rotation={[90, 90, 90]} />

      <OrbitControls />
    </Canvas>
  );
}
