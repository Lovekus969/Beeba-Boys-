import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, useTexture } from '@react-three/drei';

// Example: Interactive 3D Globe with Franchise markers
// - Uses react-three-fiber + drei
// - Drop-in component for a React app
// - Replace `franchises` with your 8 franchise entries (lat, lon, name, logo)

// ---------------------------
// Helper: convert lat/lon to 3D position on unit sphere
// ---------------------------
function latLonToVector3(lat, lon, radius = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  const x = -radius * Math.sin(phi) * Math.cos(theta);
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);
  return [x, y, z];
}

// ---------------------------
// Marker component (logo plane that always faces camera)
// ---------------------------
function Marker({ lat, lon, name, logo, size = 0.06 }) {
  const ref = useRef();
  const { camera } = useThree();
  const pos = useMemo(() => latLonToVector3(lat, lon, 1.02), [lat, lon]);

  // billboarding: make marker face the camera
  useFrame(() => {
    if (ref.current) {
      ref.current.quaternion.copy(camera.quaternion);
    }
  });

  return (
    <group position={pos}>
      <mesh ref={ref}>
        <planeGeometry args={[size, size]} />
        <meshBasicMaterial transparent={true} opacity={1} map={logo} />
      </mesh>
      <Html position={[0, -size, 0]} center>
        <div className="text-xs text-white bg-black bg-opacity-60 rounded px-2 py-1">{name}</div>
      </Html>
    </group>
  );
}

// ---------------------------
// Globe mesh with subtle 'earth-moving' animation
// (a layered rotation + vertical sinusoidal wobble to feel dynamic)
// ---------------------------
function Globe({ texture, rotationSpeed = 0.02 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      // slow auto-rotate
      ref.current.rotation.y += rotationSpeed * 0.001;
      // subtle up/down 'earth-moving' effect
      ref.current.position.y = Math.sin(t * 0.6) * 0.003;
      // tiny tilt wobble to feel alive
      ref.current.rotation.x = Math.sin(t * 0.15) * 0.002;
    }
  });

  return (
    <mesh ref={ref} rotation={[0, 0, 0]}> 
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} roughness={1} metalness={0} />
    </mesh>
  );
}

// ---------------------------
// Main component (Canvas wrapper + UI)
// ---------------------------
export default function InteractiveGlobe() {
  // Sample franchise data: replace with real lat/lon and logo paths
  const franchises = [
    { name: 'Franchise A', lat: 43.7615, lon: -79.4111, logoUrl: '/logos/f1.png' },
    { name: 'Franchise B', lat: 51.0447, lon: -114.0719, logoUrl: '/logos/f2.png' },
    { name: 'Franchise C', lat: 40.7128, lon: -74.0060, logoUrl: '/logos/f3.png' },
    { name: 'Franchise D', lat: 34.0522, lon: -118.2437, logoUrl: '/logos/f4.png' },
    { name: 'Franchise E', lat: 48.8566, lon: 2.3522, logoUrl: '/logos/f5.png' },
    { name: 'Franchise F', lat: 35.6895, lon: 139.6917, logoUrl: '/logos/f6.png' },
    { name: 'Franchise G', lat: -33.8688, lon: 151.2093, logoUrl: '/logos/f7.png' },
    { name: 'Franchise H', lat: 19.0760, lon: 72.8777, logoUrl: '/logos/f8.png' },
  ];

  // Load earth texture + franchise logos
  const texture = useTexture('/textures/earthmap4k.jpg');
  const logos = useMemo(() => franchises.map(f => ({ ...f })), []);

  // UI state
  const [autoRotate, setAutoRotate] = useState(true);
  const rotationSpeed = autoRotate ? 0.6 : 0;

  return (
    <div className="w-full h-[600px] rounded-2xl shadow-2xl overflow-hidden">
      <Canvas camera={{ position: [0, 0, 2.6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight intensity={0.8} position={[5, 3, 5]} />

        <Globe texture={texture} rotationSpeed={rotationSpeed} />

        {/* Markers: sample logos are loaded as textures via useTexture - you can swap to HTML overlays or sprites */}
        {logos.map((f, i) => {
          // pre-load texture for each logo (drei's useTexture supports arrays, but here we create single loads)
          const logoTexture = useTexture(f.logoUrl);
          return (
            <Marker key={i} lat={f.lat} lon={f.lon} name={f.name} logo={logoTexture} />
          );
        })}

        <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} autoRotate={autoRotate} autoRotateSpeed={rotationSpeed} />
      </Canvas>

      {/* Simple overlay controls - Tailwind classes used; style as you like in your app */}
      <div className="absolute bottom-6 left-6 z-40 flex gap-2">
        <button className="px-3 py-1 rounded bg-white/90 text-sm" onClick={() => setAutoRotate(r => !r)}>
          {autoRotate ? 'Pause' : 'Play'}
        </button>
      </div>
    </div>
  );
}

/*
  Notes & next steps:
  - Replace /textures/earthmap4k.jpg and /logos/*.png with real assets (host in /public or CDN).
  - Coordinates should be real franchise lat/lon. Use a small JSON endpoint or embed array.
  - For performance on mobile: reduce sphere segments (use 32 instead of 64), compress textures, and use sprite-based markers.
  - If you want realistic country outlines or clickable popups, consider overlaying geojson with Mapbox or using deck.gl.
  - For a fancier 'earth-moving' tectonic effect, consider layering a normalMap or using a displacement shader. That requires custom GLSL.
  - To export as a standalone WebGL page, bundle with Vite/CRA and deploy to Netlify/Vercel.
*/
