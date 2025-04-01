import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function Cube() {
  const meshRef = useRef();

  // Create BoxGeometry with 100 segments along the Y axis for detailed twisting.
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1, 1, 100, 1), []);
  // Clone original geometry to preserve the original positions and normals.
  const originalGeometry = useMemo(() => geometry.clone(), [geometry]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime / 0.7; // Scaled time value.
    const pos = geometry.attributes.position;
    const ori = originalGeometry.attributes.position;
    const npos = geometry.attributes.normal;
    const nori = originalGeometry.attributes.normal;

    // Loop through each vertex and update the positions and normals based on twist.
    for (let i = 0; i < pos.count; i++) {
      // Use original x and z; y remains unchanged.
      const x = ori.getX(i);
      const y = pos.getY(i);
      const z = ori.getZ(i);

      // Calculate twist angle based on y-coordinate and time.
      const alpha = 1.7 * Math.sin(t) * y;
      const cos = Math.cos(alpha);
      const sin = Math.sin(alpha);

      // Twist the x and z coordinates.
      pos.setXYZ(i, x * cos - z * sin, y, x * sin + z * cos);

      // Twist normals in a similar fashion.
      const nx = nori.getX(i);
      const ny = npos.getY(i);
      const nz = nori.getZ(i);
      npos.setXYZ(i, nx * cos - nz * sin, ny, nx * sin + nz * cos);
    }

    // Flag attributes for update.
    pos.needsUpdate = true;
    npos.needsUpdate = true;

    // Optionally animate the entire mesh rotation.
    // if (meshRef.current) {
    //   meshRef.current.rotation.x = Math.sin(t);
    // }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        color="#049ef4"
        shininess={100}
        roughness={0}
        metalness={0}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight intensity={0.5} position={[1, 1, 1]} />
      <Cube />
      <OrbitControls enableDamping />
    </>
  );
}

export default function TwistCube() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 30 }}>
      {/* Set scene background */}
      <color attach="background" args={["gainsboro"]} />
      <Scene />
    </Canvas>
  );
}
