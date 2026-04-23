import React, { memo } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { motion } from 'motion/react';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface ThreatEvent {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  severity: "critical" | "high" | "medium" | "low";
  name: string;
}

const mockThreats: ThreatEvent[] = [
  { id: '1', coordinates: [-122.4194, 37.7749], severity: 'critical', name: 'San Francisco (DDoS)' },
  { id: '2', coordinates: [139.6917, 35.6895], severity: 'high', name: 'Tokyo (Malware C2)' },
  { id: '3', coordinates: [37.6173, 55.7558], severity: 'critical', name: 'Moscow (Brute Force)' },
  { id: '4', coordinates: [31.2357, 30.0444], severity: 'high', name: 'Cairo (Credential Stuffing)' },
  { id: '5', coordinates: [-0.1276, 51.5072], severity: 'medium', name: 'London (Port Scan)' },
  { id: '6', coordinates: [116.4074, 39.9042], severity: 'critical', name: 'Beijing (APT Activity)' },
];

const severityColors = {
  critical: '#FF3B57', // Red
  high: '#F59E0B',    // Amber
  medium: '#3B82F6',   // Blue
  low: '#10B981',      // Green
};

const ThreatMap = ({ threats = mockThreats }: { threats?: ThreatEvent[] }) => {
  return (
    <div className="w-full h-full min-h-[400px] bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-black/50 backdrop-blur-md p-3 rounded-lg border border-white/5 shadow-xl">
        <h3 className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan animate-pulse"></span>
          Live Threat Map
        </h3>
        <div className="flex flex-col gap-1 mt-1 text-[10px] text-neutral-400">
           {Object.keys(severityColors).map(key => (
              <div key={key} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: severityColors[key as keyof typeof severityColors] }}></div>
                 <span className="capitalize">{key}</span>
              </div>
           ))}
        </div>
      </div>
      
      <div data-component="map-container" className="w-full h-full">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 140 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#111111"
                  stroke="#333333"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { fill: '#222222', outline: 'none' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>
          {threats.map((threat) => (
            <Marker key={threat.id} coordinates={threat.coordinates}>
              <motion.circle
                r={4}
                fill={severityColors[threat.severity]}
                stroke="#000"
                strokeWidth={1.5}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: Math.random() * 2 // Randomize pulse start
                }}
              />
              {/* Optional: Add ping ring */}
               <motion.circle
                r={10}
                fill="none"
                stroke={severityColors[threat.severity]}
                strokeWidth={1}
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 2.5, opacity: 0 }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: Math.random() * 2
                }}
              />
            </Marker>
          ))}
        </ComposableMap>
      </div>
    </div>
  );
};

export default memo(ThreatMap);
