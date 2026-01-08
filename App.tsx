import React, { useEffect, Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Vector3 } from 'three';
import { useStore } from './store';
import { Sun } from './components/Sun';
import { Earth } from './components/Earth';
import { SpaceEnvironment } from './components/SpaceEnvironment';
import { UI } from './components/UI';
import { EARTH_ORBIT_RADIUS, SOLSTICE_JUNE } from './constants';

// Animation Loop Component
const SimulationLoop = () => {
  const { isPlaying, dayOfYear, setDayOfYear } = useStore();
  
  useFrame((state, delta) => {
    if (isPlaying) {
      // Advance day. Speed: 10 days per second approx
      let nextDay = dayOfYear + delta * 20;
      if (nextDay > 365) nextDay = 1;
      setDayOfYear(nextDay);
    }
  });
  return null;
};

// Camera Controller
const CameraController = () => {
  const { isEarthView, dayOfYear } = useStore();
  const { camera, controls } = useThree();
  const prevEarthPos = useRef(new Vector3());
  const isTransitioning = useRef(false);

  useFrame((state, delta) => {
    // Calculate current earth position
    const angle = ((dayOfYear - SOLSTICE_JUNE) / 365) * Math.PI * 2;
    const x = EARTH_ORBIT_RADIUS * Math.cos(angle);
    const z = EARTH_ORBIT_RADIUS * Math.sin(angle);
    const currentEarthPos = new Vector3(x, 0, z);

    if (isEarthView) {
      // 1. Update Target to look at Earth
      // We rely on OrbitControls to handle the viewing, but we move the target.
      // To keep the camera "riding" the orbit, we apply the delta of earth's movement to the camera too.
      
      const deltaPos = currentEarthPos.clone().sub(prevEarthPos.current);
      
      // Apply movement delta to camera and target so the relative view is static
      if (prevEarthPos.current.lengthSq() > 0) {
         camera.position.add(deltaPos);
         
         // @ts-ignore - OrbitControls type defs sometimes miss 'target' but it exists on ref
         if (controls) {
             // @ts-ignore
             controls.target.copy(currentEarthPos);
         }
      }
    } else {
        // System View
        // @ts-ignore
        if (controls) controls.target.set(0, 0, 0);
    }

    prevEarthPos.current.copy(currentEarthPos);
  });

  // Handle Mode Switching Effect
  useEffect(() => {
    if (isEarthView) {
        // Zoom in when entering earth view
        const angle = ((dayOfYear - SOLSTICE_JUNE) / 365) * Math.PI * 2;
        const x = EARTH_ORBIT_RADIUS * Math.cos(angle);
        const z = EARTH_ORBIT_RADIUS * Math.sin(angle);
        
        // Offset camera by some vector (e.g. 10 units away)
        const offset = new Vector3(0, 5, 10); 
        camera.position.set(x + offset.x, offset.y, z + offset.z);
    } else {
        // Reset to system view
        camera.position.set(0, 20, 45);
    }
  }, [isEarthView]);

  return null;
};

// Loading Screen
const Loader = () => (
  <Html center>
    <div className="flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <div className="text-white font-bold text-xl animate-pulse">
            Loading Universe...
        </div>
    </div>
  </Html>
);

const App: React.FC = () => {
  return (
    // Added touch-action: none and overscroll-behavior: none for iPad optimization
    <div className="w-full h-full relative bg-black touch-none overscroll-none select-none">
      
      <UI />

      <Canvas
        camera={{ position: [0, 20, 45], fov: 45 }}
        shadows
        dpr={[1, 2]} // Handle high DPI screens
        gl={{ antialias: true }}
      >
        <Suspense fallback={<Loader />}>
          {/* Environment */}
          <SpaceEnvironment />
          
          {/* Lighting */}
          <ambientLight intensity={0.05} /> {/* Deep space ambient is very dark */}
          
          {/* Objects */}
          <Sun />
          <Earth />
          
          {/* Controls & Helpers - Damping enabled for smooth touch feel */}
          <OrbitControls 
             makeDefault
             enablePan={false} 
             enableDamping={true}
             dampingFactor={0.05}
             minDistance={5} 
             maxDistance={200}
             maxPolarAngle={Math.PI / 1.5} 
             rotateSpeed={0.5}
             zoomSpeed={0.5}
          />
          <SimulationLoop />
          <CameraController />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default App;
