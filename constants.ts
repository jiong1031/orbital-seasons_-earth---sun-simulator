import { Vector3 } from 'three';

// Orbital Mechanics
export const EARTH_ORBIT_RADIUS = 20; // Scaled down for visual clarity
export const EARTH_AXIAL_TILT_DEG = 23.5;
export const EARTH_ROTATION_SPEED = 0.5;

// Textures (using reliable public URLs)
export const TEXTURES = {
  // NASA Blue Marble or similar high-quality public domain assets
  earthMap: 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg',
  earthSpec: 'https://unpkg.com/three-globe/example/img/earth-water.png',
  earthBump: 'https://unpkg.com/three-globe/example/img/earth-topology.png',
  clouds: 'https://unpkg.com/three-globe/example/img/earth-clouds.png', // Fallback/Alternative
  galaxy: 'https://unpkg.com/three-globe/example/img/night-sky.png'
};

// Dates
export const SOLSTICE_JUNE = 172; // ~June 21
export const SOLSTICE_DEC = 355; // ~Dec 21
export const EQUINOX_MARCH = 79; // ~March 20
export const EQUINOX_SEPT = 266; // ~Sept 23

// Helper to determine season (Northern Hemisphere)
export const getSeason = (day: number): string => {
  if (day >= EQUINOX_MARCH && day < SOLSTICE_JUNE) return "Spring (Northern)";
  if (day >= SOLSTICE_JUNE && day < EQUINOX_SEPT) return "Summer (Northern)";
  if (day >= EQUINOX_SEPT && day < SOLSTICE_DEC) return "Autumn (Northern)";
  return "Winter (Northern)";
};

export const getMonthDate = (dayOfYear: number): string => {
  const date = new Date(2023, 0); // Start at Jan 1 (Non-leap year)
  date.setDate(dayOfYear);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};
