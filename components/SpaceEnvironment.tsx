import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Sparkles } from '@react-three/drei';
import { BackSide, Vector3, Group } from 'three';
import { TEXTURES } from '../constants';

// Meteor Component
interface MeteorProps {
  color?: string;
  speedMultiplier?: number;
}

const ShootingStar: React.FC<MeteorProps> = ({ color = "white", speedMultiplier = 1 }) => {
  const groupRef = useRef<Group>(null);
  const [active, setActive] = useState(false);
  
  // Config
  const startPos = useRef(new Vector3());
  const endPos = useRef(new Vector3());
  const speed = useRef(0);
  const progress = useRef(0);
  const delay = useRef(Math.random() * 2);

  const resetMeteor = () => {
    // Pick random spot on a large sphere
    const r = 80;
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.random() * Math.PI;
    
    startPos.current.setFromSphericalCoords(r, theta, phi);
    
    // End position: Move along a tangent or random direction nearby
    const offsetPhi = phi + (Math.random() - 0.5) * 1.5;
    const offsetTheta = theta + (Math.random() - 0.5) * 1.5;
    endPos.current.setFromSphericalCoords(r, offsetTheta, offsetPhi);
    
    speed.current = (Math.random() * 0.5 + 0.8) * speedMultiplier; // Faster speed
    progress.current = 0;
    
    // VERY ACTIVE: Spawn every 0.5 to 2.5 seconds roughly
    delay.current = Math.random() * 2 + 0.5; 
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
        groupRef.current.lookAt(endPos.current);
        
        // Trail effect scaling
        const fade = Math.sin(progress.current * Math.PI); 
        groupRef.current.scale.setScalar(fade);
      }
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.6, 12, 4]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
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
            color="#666666" 
        />
      </mesh>

      {/* 2. Dense Star Field - High Count and Speed */}
      <Sparkles 
        count={6000} 
        scale={380} 
        size={3} 
        speed={1.5} 
        opacity={0.9} 
        color="#ffffff"
      />
      
      {/* 3. Colorful Background Stars */}
      <Sparkles 
        count={2500} 
        scale={350} 
        size={5} 
        speed={1.0} 
        opacity={0.7} 
        color="#aabbff"
      />
      
      {/* 4. Multiple Meteors for Hyper-Active background */}
      <ShootingStar color="#aaddff" speedMultiplier={1.2} />
      <ShootingStar color="#ffddaa" speedMultiplier={0.9} />
      <ShootingStar color="#ffffff" speedMultiplier={1.5} />
      <ShootingStar color="#ccffcc" speedMultiplier={1.1} />
    </group>
  );
};
