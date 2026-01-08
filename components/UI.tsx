import React from 'react';
import { useStore } from '../store';
import { 
    SOLSTICE_JUNE, SOLSTICE_DEC, EQUINOX_MARCH, EQUINOX_SEPT, 
    getSeason, getMonthDate 
} from '../constants';
import { Play, Pause, Globe, ThermometerSun, Eye, ScanEye } from 'lucide-react';
import clsx from 'clsx';

export const UI: React.FC = () => {
  const { 
    dayOfYear, setDayOfYear, 
    isPlaying, setIsPlaying,
    showLines, toggleLines,
    showHeatmap, toggleHeatmap,
    isEarthView, toggleViewMode
  } = useStore();

  const season = getSeason(dayOfYear);
  const dateStr = getMonthDate(dayOfYear);

  // Markers for the slider
  const markers = [
    { day: EQUINOX_MARCH, label: 'Spring Eq.' },
    { day: SOLSTICE_JUNE, label: 'Summer Sol.' },
    { day: EQUINOX_SEPT, label: 'Fall Eq.' },
    { day: SOLSTICE_DEC, label: 'Winter Sol.' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* Top Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div>
           <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
             Orbital Seasons
           </h1>
           <p className="text-gray-400 text-sm mt-1 max-w-md">
             Explore how Earth's tilt and orbit create seasons. Drag to rotate view. Scroll to zoom.
           </p>
        </div>
        
        {/* Info Card */}
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10 text-right min-w-[200px]">
           <div className="text-4xl font-bold text-white mb-1">{dateStr}</div>
           <div className={clsx(
               "text-xl font-semibold uppercase tracking-wider",
               season.includes("Summer") ? "text-yellow-400" :
               season.includes("Winter") ? "text-blue-400" :
               "text-green-400"
           )}>
             {season}
           </div>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="pointer-events-auto flex flex-col gap-4 max-w-4xl mx-auto w-full">
        
        {/* Toggles */}
        <div className="flex justify-center gap-4 flex-wrap">
             <button 
                onClick={toggleViewMode}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all border shadow-lg",
                  isEarthView ? "bg-purple-600 border-purple-400 text-white" : "bg-black/50 border-white/20 text-gray-300 hover:bg-white/10"
                )}
             >
               {isEarthView ? <ScanEye size={18} /> : <Eye size={18} />} 
               {isEarthView ? "System View" : "Earth View"}
             </button>
             <div className="w-px h-8 bg-white/20 mx-2 self-center"></div>
             <button 
                onClick={toggleLines}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all border",
                  showLines ? "bg-blue-600 border-blue-400 text-white" : "bg-black/50 border-white/20 text-gray-300 hover:bg-white/10"
                )}
             >
               <Globe size={18} /> Geo Lines
             </button>
             <button 
                onClick={toggleHeatmap}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all border",
                  showHeatmap ? "bg-red-600 border-red-400 text-white" : "bg-black/50 border-white/20 text-gray-300 hover:bg-white/10"
                )}
             >
               <ThermometerSun size={18} /> Temperature
             </button>
        </div>

        {/* Timeline Control */}
        <div className="bg-black/70 backdrop-blur-xl rounded-2xl p-6 border border-white/10 relative">
           
           {/* Play Button */}
           <button 
             onClick={() => setIsPlaying(!isPlaying)}
             className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
           >
             {isPlaying ? <Pause fill="black" /> : <Play fill="black" className="ml-1" />}
           </button>

           <div className="ml-16 mr-2 relative">
             <input 
               type="range" 
               min="1" 
               max="365" 
               value={dayOfYear}
               onChange={(e) => setDayOfYear(Number(e.target.value))}
               className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
             />
             
             {/* Markers */}
             <div className="relative h-6 mt-2 text-xs text-gray-400 font-medium">
               {markers.map((m) => {
                 const pct = ((m.day - 1) / 364) * 100;
                 return (
                   <div 
                     key={m.label} 
                     className="absolute top-0 -translate-x-1/2 flex flex-col items-center group cursor-pointer hover:text-white"
                     style={{ left: `${pct}%` }}
                     onClick={() => setDayOfYear(m.day)}
                   >
                     <div className="w-0.5 h-2 bg-gray-500 mb-1 group-hover:bg-white transition-colors"></div>
                     {m.label}
                   </div>
                 )
               })}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
