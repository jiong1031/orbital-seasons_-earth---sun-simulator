import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Sparkles } from '@react-three/drei';
import { BackSide, Vector3, Group } from 'three';
import { TEXTURES } from '../constants';

// Meteor Component
const ShootingStar: React.FC = () => {
  const groupRef = useRef<Group>(null);
  const [active, setActive] = useState(false);
  
  // Config
  const startPos = useRef(new Vector3());
  const endPos = useRef(new Vector3());
  const speed = useRef(0);
  const progress = useRef(0);
  const delay = useRef(Math.random() * 5 + 2); // Initial delay

  const resetMeteor = () => {
    // Pick random spot on a large sphere
    const r = 80;
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    
    startPos.current.setFromSphericalCoords(r, theta, phi);
    
    // End position: Move along a tangent or random direction nearby
    // Simple way: pick another point 40-60 units away
    const offsetPhi = phi + (Math.random() - 0.5) * 1.5;
    const offsetTheta = theta + (Math.random() - 0.5) * 1.5;
    endPos.current.setFromSphericalCoords(r, offsetTheta, offsetPhi);
    
    speed.current = Math.random() * 0.5 + 0.3;
    progress.current = 0;
    delay.current = Math.random() * 10 + 5; // Wait 5-15 seconds before showing again
    setActive(false);
  };

  // Initialize on mount
  useEffect(() => {
    resetMeteor();
  }, []);

  useFrame((state, delta) => {
    if (!active) {
      delay.current -= delta;
      if (delay.current <= 0) {
        setActive(true);
      }
      return;
    }

    progress.current += delta * speed.current;
    if (progress.current >= 1) {
      resetMeteor();
    } else {
      if (groupRef.current) {
        groupRef.current.position.lerpVectors(startPos.current, endPos.current, progress.current);
        
        // Face camera for visibility? or just trail?
        // Simple scaling to fade in/out
        const fade = Math.sin(progress.current * Math.PI); // 0 -> 1 -> 0
        groupRef.current.scale.setScalar(fade);
        groupRef.current.lookAt(endPos.current);
      }
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        {/* Long thin trail */}
        <cylinderGeometry args={[0.05, 0.4, 8, 4]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </mesh>
    </group>
  );
};

export const SpaceEnvironment: React.FC = () => {
  const galaxyMap = useTexture(TEXTURES.galaxy);

  return (
    <group>
      {/* 1. Deep Space Background - Large Sphere */}
      <mesh scale={[400, 400, 400]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial 
            map={galaxyMap} 
            side={BackSide} 
            color="#888888" // Tone it down slightly so sun pops
        />
      </mesh>

      {/* 2. Twinkling Stars Layer - Closer and Brighter */}
      <Sparkles 
        count={3000} 
        scale={350} 
        size={4} 
        speed={0.4} 
        opacity={0.8} 
        color="#ffffff"
      />
      
      {/* 3. Subtle colored stars for variety */}
      <Sparkles 
        count={1000} 
        scale={300} 
        size={6} 
        speed={0.2} 
        opacity={0.5} 
        color="#aabbff"
      />

      {/* 4. Meteors */}
      <ShootingStar />
      <ShootingStar />
    </group>
  );
};