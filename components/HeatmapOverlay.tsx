import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ShaderMaterial, Color, Vector3, Mesh } from 'three';

const vertexShader = `
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec3 vNormal;
varying vec3 vWorldPosition;
uniform vec3 sunPosition;

// Heat gradient colors
// Cold (Blue) -> Temperate (Green/Yellow) -> Hot (Red)
vec3 getHeatColor(float intensity) {
    if (intensity < 0.2) return mix(vec3(0.0, 0.0, 0.5), vec3(0.0, 0.5, 1.0), intensity * 5.0);
    if (intensity < 0.5) return mix(vec3(0.0, 0.5, 1.0), vec3(0.0, 1.0, 0.0), (intensity - 0.2) * 3.33);
    if (intensity < 0.8) return mix(vec3(0.0, 1.0, 0.0), vec3(1.0, 1.0, 0.0), (intensity - 0.5) * 3.33);
    return mix(vec3(1.0, 1.0, 0.0), vec3(1.0, 0.0, 0.0), (intensity - 0.8) * 5.0);
}

void main() {
  // Simple directional light simulation logic in model space is tricky because Earth rotates.
  // We need world space calculation.
  
  // Calculate direction to sun
  vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
  vec3 sunDir = normalize(sunPosition - vWorldPosition);
  
  // Basic Lambert
  float dotProd = dot(vNormal, sunDir);
  
  // Day/Night mask
  float dayMask = smoothstep(-0.2, 0.2, dotProd);
  
  // Heat intensity based on direct angle (cosine law)
  // Clamp to 0-1 for heat
  float heatIntensity = max(0.0, dotProd);
  
  vec3 heatColor = getHeatColor(heatIntensity);
  
  // Alpha: Only show heatmap on the lit side, fade out on dark side
  float alpha = 0.7 * dayMask;
  
  gl_FragColor = vec4(heatColor, alpha);
}
`;

interface HeatmapProps {
  sunPosition: Vector3;
}

export const HeatmapOverlay: React.FC<HeatmapProps> = ({ sunPosition }) => {
  const materialRef = useRef<ShaderMaterial>(null);

  useFrame(() => {
    if (materialRef.current) {
        // We can update uniforms here if sun moves, but sun is static (0,0,0) usually.
        // However, earth moves, so "sunPosition" relative to mesh is complex.
        // Wait, the shader uses vWorldPosition. So if we pass world sun pos (0,0,0), it works.
        materialRef.current.uniforms.sunPosition.value.copy(sunPosition);
    }
  });

  return (
    <mesh scale={[1.02, 1.02, 1.02]}>
      <sphereGeometry args={[2, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        uniforms={{
          sunPosition: { value: new Vector3(0, 0, 0) }
        }}
      />
    </mesh>
  );
};
