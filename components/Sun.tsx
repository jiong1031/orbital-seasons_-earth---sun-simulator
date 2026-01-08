import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Color, ShaderMaterial, AdditiveBlending, BackSide } from 'three';

// GLSL Noise and Gradient Logic
const sunVertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main() {
  vUv = uv;
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const sunFragmentShader = `
uniform float uTime;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

// Simplex 3D Noise 
// (Simplified for brevity, standard implementation)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  i = mod289(i);
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  // Animate noise with time
  float noiseVal = snoise(vPosition * 2.0 + vec3(uTime * 0.5));
  float noiseVal2 = snoise(vPosition * 4.0 - vec3(uTime * 0.8));
  
  float combined = (noiseVal + noiseVal2 * 0.5);
  
  // Color Mapping
  // Dark Red -> Orange -> Yellow -> White
  vec3 c1 = vec3(0.6, 0.0, 0.0); // Dark Red
  vec3 c2 = vec3(1.0, 0.5, 0.0); // Orange
  vec3 c3 = vec3(1.0, 1.0, 0.0); // Yellow
  vec3 c4 = vec3(1.0, 1.0, 0.8); // White-ish

  vec3 color = mix(c1, c2, smoothstep(-1.0, -0.2, combined));
  color = mix(color, c3, smoothstep(-0.2, 0.4, combined));
  color = mix(color, c4, smoothstep(0.4, 1.0, combined));

  gl_FragColor = vec4(color, 1.0);
}
`;

const glowVertexShader = `
varying vec3 vNormal;
void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const glowFragmentShader = `
varying vec3 vNormal;
void main() {
  float intensity = pow(0.6 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
  gl_FragColor = vec4(1.0, 0.8, 0.3, 1.0) * intensity * 2.0;
}
`;


export const Sun: React.FC = () => {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
  }), []);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
    if (meshRef.current) {
        meshRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group>
      {/* The visible burning sun mesh */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
          uniforms={uniforms}
        />
      </mesh>
      
      {/* The light source - Intense! */}
      <pointLight 
        intensity={3.5} 
        distance={200} 
        decay={0} 
        color="#fffaed"
        castShadow
      />
      
      {/* Outer Glow / Corona (Billboarded simple glow or Inverted Sphere) */}
      {/* Simple approach: Sprite or larger sphere with additive blending */}
      <mesh scale={[1.4, 1.4, 1.4]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial 
            color="#ffaa00" 
            transparent 
            opacity={0.15} 
            side={BackSide} 
            blending={AdditiveBlending} 
        />
      </mesh>
      
      <mesh scale={[1.8, 1.8, 1.8]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial 
            color="#ff4400" 
            transparent 
            opacity={0.1} 
            side={BackSide} 
            blending={AdditiveBlending} 
        />
      </mesh>
    </group>
  );
};
