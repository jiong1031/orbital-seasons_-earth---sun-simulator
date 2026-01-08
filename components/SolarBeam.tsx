import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DoubleSide, AdditiveBlending, Mesh, Vector3, Group } from 'three';

interface SolarBeamProps {
  sunPosition: Vector3; // Position of Sun relative to Earth
}

export const SolarBeam: React.FC<SolarBeamProps> = ({ sunPosition }) => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      // 1. Distance Calculation
      const dist = sunPosition.length();
      
      // 2. Midpoint Calculation
      const midpoint = sunPosition.clone().multiplyScalar(0.5);
      
      // 3. Update Transform
      // Position at midpoint
      groupRef.current.position.copy(midpoint);
      
      // Look at Earth (Origin in parent space)
      groupRef.current.lookAt(0, 0, 0);
      
      // Pulse Effect for energy flow
      const time = state.clock.getElapsedTime();
      const pulse = 1 + Math.sin(time * 4) * 0.05;
      
      // Scale Z to match distance. Scale X/Y for pulse effect.
      // Geometry is height=1, so scale.z = distance sets exact length.
      groupRef.current.scale.set(pulse, pulse, dist);
    }
  });

  return (
    <group ref={groupRef}>
      {/* 
         CRITICAL GEOMETRY SETUP:
         We rotate the cylinder meshes 90 degrees on X axis.
         Standard Cylinder is aligned on Y.
         Rotation X=90 aligns it on Z.
         +Y (Top) becomes +Z.
         -Y (Bottom) becomes -Z.
         
         Since we LookAt(0,0,0) [Earth], the +Z axis points to Earth.
         Therefore, Cylinder Top points to Earth.
         
         args: [radiusTop, radiusBottom, height, ...]
         radiusTop: Earth End (0.4)
         radiusBottom: Sun End (3.5)
         height: 1 (Scaled by parent Z)
      */}
      
      {/* Outer Glow Beam */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
         <cylinderGeometry args={[0.4, 3.5, 1, 32, 1, true]} />
         <meshBasicMaterial 
            color="#ffaa00" 
            transparent 
            opacity={0.15} 
            side={DoubleSide} 
            blending={AdditiveBlending} 
            depthWrite={false}
         />
      </mesh>
      
      {/* Inner Core Beam (Brighter, Thinner) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
         <cylinderGeometry args={[0.1, 1.5, 1, 32, 1, true]} />
         <meshBasicMaterial 
            color="#ffffff" 
            transparent 
            opacity={0.3} 
            side={DoubleSide} 
            blending={AdditiveBlending} 
            depthWrite={false}
         />
      </mesh>
    </group>
  );
};
