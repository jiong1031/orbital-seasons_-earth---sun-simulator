import React, { useMemo, useRef } from 'react';
import { Vector3, Color } from 'three';
import { Html } from '@react-three/drei';
import { useStore } from '../store';
import { EARTH_AXIAL_TILT_DEG, EARTH_ORBIT_RADIUS, SOLSTICE_JUNE } from '../constants';

interface SubsolarMarkerProps {
  // We need the orbit parameters to calculate vector to sun
}

export const SubsolarMarker: React.FC = () => {
  const dayOfYear = useStore((state) => state.dayOfYear);
  const isEarthView = useStore((state) => state.isEarthView);

  // 1. Calculate Earth Orbit Position (Same math as Earth.tsx)
  const angle = ((dayOfYear - SOLSTICE_JUNE) / 365) * Math.PI * 2;
  const x = EARTH_ORBIT_RADIUS * Math.cos(angle);
  const z = EARTH_ORBIT_RADIUS * Math.sin(angle);

  // 2. Vector from Earth Center to Sun (World Space)
  // Earth is at (x, 0, z), Sun is at (0, 0, 0)
  const sunVecWorld = new Vector3(-x, 0, -z).normalize();

  // 3. Transform to "Tilt Space"
  // The marker is inside the Earth's Tilt Group (which is rotated Z by 23.5 deg).
  // To find where the sun is relative to this tilted frame, we apply the inverse rotation.
  // Inverse of Rotation Z(theta) is Rotation Z(-theta).
  const tiltRad = (EARTH_AXIAL_TILT_DEG * Math.PI) / 180;
  
  // Create vector and apply inverse Z rotation manually
  // x' = x cos(-t) - y sin(-t)
  // y' = x sin(-t) + y cos(-t)
  // z' = z
  const sunVecTilt = new Vector3(
    sunVecWorld.x * Math.cos(-tiltRad) - sunVecWorld.y * Math.sin(-tiltRad),
    sunVecWorld.x * Math.sin(-tiltRad) + sunVecWorld.y * Math.cos(-tiltRad),
    sunVecWorld.z
  );

  // 4. Scale to surface radius (slightly above 2.0)
  const surfaceRadius = 2.02;
  const position = sunVecTilt.clone().normalize().multiplyScalar(surfaceRadius);

  // 5. Calculate Latitude for Display
  // Latitude is the angle between the vector and the equatorial plane (XZ plane in Tilt Space)
  // sin(lat) = y / R
  const latRad = Math.asin(sunVecTilt.y);
  const latDeg = (latRad * 180) / Math.PI;
  
  const isNorth = latDeg >= 0;
  const latLabel = `${Math.abs(latDeg).toFixed(1)}° ${isNorth ? 'N' : 'S'}`;
  
  // Color coding based on hemisphere season
  const markerColor = latDeg > 10 ? '#ff4444' : latDeg < -10 ? '#44aaff' : '#ffaa00';

  return (
    <group position={position}>
      {/* Visual Marker (Crosshair/Dot) */}
      <mesh lookAt={() => new Vector3(0,0,0)}>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshBasicMaterial color="white" toneMapped={false} />
      </mesh>
      <mesh lookAt={() => new Vector3(0,0,0)}>
        <circleGeometry args={[0.05, 32]} />
        <meshBasicMaterial color={markerColor} toneMapped={false} />
      </mesh>
      
      {/* Glowing Dot */}
      <pointLight distance={1} intensity={2} color={markerColor} />

      {/* Label - Only show if in Earth View or if specifically requested? 
          Let's show it always, but scale it down if far away? 
          Actually, Html component handles scaling nicely. 
      */}
      <Html 
        position={[0.2, 0.2, 0]} 
        center 
        style={{ pointerEvents: 'none' }}
        distanceFactor={10}
      >
        <div className={`px-2 py-1 rounded-md text-xs font-bold whitespace-nowrap backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2
          ${isNorth ? 'bg-red-500/20 text-red-200' : 'bg-blue-500/20 text-blue-200'}
        `}>
          <div className="w-2 h-2 rounded-full" style={{backgroundColor: markerColor}}></div>
          {latLabel}
        </div>
      </Html>

      {/* Connection Line to Surface (Visual Anchor) */}
       <mesh position={[0, 0, -0.1]} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.2]} />
          <meshBasicMaterial color="white" transparent opacity={0.5} />
       </mesh>
    </group>
  );
};
