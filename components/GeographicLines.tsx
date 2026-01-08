import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import { Vector3, Euler } from 'three';

const RADIUS = 2.01; // Slightly above earth surface
const SEGMENTS = 64;

interface GeoRingProps {
  latitude: number; // Degrees
  color: string;
  dashed?: boolean;
}

const GeoRing: React.FC<GeoRingProps> = ({ latitude, color, dashed }) => {
  const points = useMemo(() => {
    const pts = [];
    const latRad = (latitude * Math.PI) / 180;
    const r = RADIUS * Math.cos(latRad);
    const y = RADIUS * Math.sin(latRad);

    for (let i = 0; i <= SEGMENTS; i++) {
      const theta = (i / SEGMENTS) * Math.PI * 2;
      pts.push(new Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
    }
    return pts;
  }, [latitude]);

  return (
    <Line 
      points={points} 
      color={color} 
      lineWidth={dashed ? 1 : 2} 
      dashed={dashed}
      dashScale={dashed ? 20 : 0}
      dashSize={0.5}
      gapSize={0.2}
    />
  );
};

export const GeographicLines: React.FC = () => {
  return (
    <group rotation={[0, 0, 0]}>
      {/* Equator */}
      <GeoRing latitude={0} color="#ff4444" />
      
      {/* Tropic of Cancer */}
      <GeoRing latitude={23.5} color="#ffd700" dashed />
      
      {/* Tropic of Capricorn */}
      <GeoRing latitude={-23.5} color="#ffd700" dashed />
      
      {/* Arctic Circle */}
      <GeoRing latitude={66.5} color="#44aaff" dashed />
      
      {/* Antarctic Circle */}
      <GeoRing latitude={-66.5} color="#44aaff" dashed />
    </group>
  );
};
