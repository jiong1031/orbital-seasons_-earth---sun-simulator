import { create } from 'zustand';
import { SimulationState } from './types';

export const useStore = create<SimulationState>((set) => ({
  dayOfYear: 80, // Start near Spring Equinox
  isPlaying: false,
  showLines: false,
  showHeatmap: false,
  isEarthView: false,
  simulationSpeed: 0.5,
  setDayOfYear: (day) => set({ dayOfYear: day }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  toggleLines: () => set((state) => ({ showLines: !state.showLines })),
  toggleHeatmap: () => set((state) => ({ showHeatmap: !state.showHeatmap })),
  toggleViewMode: () => set((state) => ({ isEarthView: !state.isEarthView })),
}));
