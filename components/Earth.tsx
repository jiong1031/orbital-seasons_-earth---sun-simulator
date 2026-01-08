import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, Line } from '@react-three/drei';
import { Group, Mesh, Vector3, DoubleSide, Color } from 'three';
import { useStore } from '../store';
import { 
  EARTH_ORBIT_RADIUS, 
  EARTH_AXIAL_TILT_DEG, 
  TEXTURES,
  SOLSTICE_JUNE
} from '../constants';
import { GeographicLines } from './GeographicLines';
import { HeatmapOverlay } from './HeatmapOverlay';
import { SubsolarMarker } from './SubsolarMarker';
import { SolarBeam } from './SolarBeam';

export const Earth: React.FC = () => {
  const orbitGroupRef = useRef<Group>(null);
  const earthMeshRef = useRef<Mesh>(null);
  
  // State
  const dayOfYear = useStore((state) => state.dayOfYear);
  const showLines = useStore((state) => state.showLines);
  const showHeatmap = useStore((state) => state.showHeatmap);

  // Load Textures
  const [map, spec, bump] = useTexture([
    TEXTURES.earthMap,
    TEXTURES.earthSpec,
    TEXTURES.earthBump
  ]);

  // Calculate Orbit Position
  const angle = ((dayOfYear - SOLSTICE_JUNE) / 365) * Math.PI * 2;
  const x = EARTH_ORBIT_RADIUS * Math.cos(angle);
  const z = EARTH_ORBIT_RADIUS * Math.sin(angle);

  useFrame((state, delta) => {
    // 1. Update Orbit Position
    if (orbitGroupRef.current) {
        orbitGroupRef.current.position.set(x, 0, z);
    }

    // 2. Earth Self Rotation
    if (earthMeshRef.current) {
      earthMeshRef.current.rotation.y += delta * 0.5;
    }
  });

  // Vector logic for the Ray (Sun is at 0,0,0)
  // Relative to Earth Group (which is at x,0,z), Sun is at (-x, 0, -z)
  const localSunPos = new Vector3(-x, 0, -z);

  return (
    <group ref={orbitGroupRef} position={[x, 0, z]}>
      
      {/* Volumetric Solar Beam */}
      <SolarBeam sunPosition={localSunPos} />

      {/* Tilt Container: Fixed 23.5 degrees tilt */}
      <group rotation={[0, 0, (EARTH_AXIAL_TILT_DEG * Math.PI) / 180]}>
        
        {/* The Rotating Earth Mesh */}
        <mesh ref={earthMeshRef} receiveShadow castShadow>
          <sphereGeometry args={[2, 64, 64]} />
          <meshPhongMaterial 
            map={map} 
            specularMap={spec} 
            bumpMap={bump}
            bumpScale={0.05}
            specular={new Color(0x333333)}
            shininess={5}
          />
          {/* Atmosphere Glow */}
          <mesh scale={[1.01, 1.01, 1.01]}>
             <sphereGeometry args={[2, 64, 64]} />
             <meshBasicMaterial 
               color="#44aaff" 
               transparent 
               opacity={0.1} 
               side={DoubleSide} 
               blending={2} 
             />
          </mesh>
        </mesh>

        {/* Static Overlays */}
        {showLines && <GeographicLines />}
        
        {/* Heatmap Overlay */}
        {showHeatmap && (
           <HeatmapOverlay sunPosition={localSunPos} />
        )}

        {/* Subsolar Point Marker */}
        <SubsolarMarker />

      </group>
      
      {/* Axis Line Visual */}
      <group rotation={[0, 0, (EARTH_AXIAL_TILT_DEG * Math.PI) / 180]}>
         <Line 
            points={[new Vector3(0, 3, 0), new Vector3(0, -3, 0)]}
            color="white"
            lineWidth={1}
            opacity={0.5}
            transparent
            dashed
            dashScale={10}
         />
      </group>

    </group>
  );
};
