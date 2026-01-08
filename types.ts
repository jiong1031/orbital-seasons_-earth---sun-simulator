export interface SimulationState {
  dayOfYear: number;
  isPlaying: boolean;
  showLines: boolean;
  showHeatmap: boolean;
  isEarthView: boolean;
  simulationSpeed: number;
  setDayOfYear: (day: number) => void;
  setIsPlaying: (playing: boolean) => void;
  toggleLines: () => void;
  toggleHeatmap: () => void;
  toggleViewMode: () => void;
}

export enum Season {
  Spring = "Spring",
  Summer = "Summer",
  Autumn = "Autumn",
  Winter = "Winter"
}
