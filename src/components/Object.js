import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import * as THREE from "three";

// Component handling the GLTF model and its pointer interactions.
function CicadaModel(isHovered, ...props) {
  const modelRef = useRef();
  const { scene } = useGLTF("/models/cicadaModel.glb");

  useFrame(({ mouse }) => {
    if (modelRef.current) {
      if (isHovered) {
        const targetY = mouse.x * Math.PI;
        const targetX = THREE.MathUtils.clamp(
          mouse.y * Math.PI,
          -Math.PI / 6,
          Math.PI / 6
        );
        modelRef.current.rotation.y = THREE.MathUtils.lerp(
          modelRef.current.rotation.y,
          targetY,
          0.1
        );
        modelRef.current.rotation.x = THREE.MathUtils.lerp(
          modelRef.current.rotation.x,
          targetX,
          0.1
        );
      } else {
        modelRef.current.rotation.y = THREE.MathUtils.lerp(
          modelRef.current.rotation.y,
          0,
          0.1
        );
        modelRef.current.rotation.x = THREE.MathUtils.lerp(
          modelRef.current.rotation.x,
          0,
          0.1
        );
      }
    }
  });

  return (
    <group ref={modelRef}>
      <primitive object={scene} {...props} scale={8} />
    </group>
  );
}

export default function Object() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="w-full h-full"
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
    >
      <Canvas camera={{ fov: 20, position: [0, 0, 80] }}>
        <ambientLight intensity={Math.PI / 2} />
        {/* Spotlight is now a child of Canvas */}
        <pointLight
          intensity={10}
          decay={0}
          position={[0, 200, 10]}
          color="red"
        />
        <pointLight
          position={[0, -10, -10]}
          decay={0}
          intensity={Math.PI}
          color="purple"
        />
        <pointLight
          position={[10, 0, 0]}
          decay={0}
          intensity={Math.PI}
          color="blue"
        />
        <CicadaModel isHovered={isHovered} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}
