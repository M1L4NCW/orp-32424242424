import React, { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, Move, Navigation, RefreshCw, Radio, MapPin } from "lucide-react";

interface AircraftBlip {
  id: string;
  name: string;
  type: "jet" | "heli" | "prop";
  status: "Landelijke nadering" | "Geparkeerd in Hangar" | "Taxiet naar baan" | "Rondvlucht boven LSIA";
  speedKmh: number;
  altitudeFt: number;
  color: string;
  // Starting paths layout coordinates
  x: number;
  y: number;
  angle: number;
}

export default function LSIAFuturisticMap() {
  const [scale, setScale] = useState<number>(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [radarAngle, setRadarAngle] = useState(0);
  const [activeBlip, setActiveBlip] = useState<string | null>("BLIP-01");
  const [showGrid, setShowGrid] = useState(true);
  const [showRadar, setShowRadar] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // List of active luxury aircraft blips traveling over LSIA map
  const [blips, setBlips] = useState<AircraftBlip[]>([
    {
      id: "BLIP-01",
      name: "Luxury Luxor Jet (PH-LCO)",
      type: "jet",
      status: "Rondvlucht boven LSIA",
      speedKmh: 450,
      altitudeFt: 4200,
      color: "#ea580c",
      x: 350,
      y: 180,
      angle: 120,
    },
    {
      id: "BLIP-02",
      name: "Buzzard Chopper (H-LCO2)",
      type: "heli",
      status: "Taxiet naar baan",
      speedKmh: 60,
      altitudeFt: 15,
      color: "#38bdf8",
      x: 180,
      y: 280,
      angle: 45,
    },
    {
      id: "BLIP-03",
      name: "Cessna Caravan (PH-ORJ)",
      type: "prop",
      status: "Landelijke nadering",
      speedKmh: 195,
      altitudeFt: 1100,
      color: "#e2e8f0",
      x: 480,
      y: 350,
      angle: 290,
    },
  ]);

  // Hangar hover zones coordinates & mock database descriptors
  const hotspots = [
    {
      id: "hotspot-tower",
      title: "LSIA Verkeerstoren",
      subtitle: "Frequentie 118.90 MHz",
      details: "Hoofdbeheercentrum. Coördineert alle starts en strandbezoeken op Los Santos International Airport.",
      x: 220,
      y: 190,
    },
    {
      id: "hotspot-helipads",
      title: "Helikopterplatform S-1",
      subtitle: "Quick Launch Heliports",
      details: "Plaats van de direct inzetbare helikopters voor medische evacuaties of vliegstagemeesterschap.",
      x: 280,
      y: 330,
    },
    {
      id: "hotspot-runway-9",
      title: "Baan 09R-27L Touchdown",
      subtitle: "Hoofdbetonbaan",
      details: "Onze langste landingsbaan voor zware verkeersvliegtuigen uit Europa.",
      x: 420,
      y: 260,
    },
  ];

  const [selectedHotspot, setSelectedHotspot] = useState<typeof hotspots[0] | null>(hotspots[0]);

  // Radar sweeping animation frame
  useEffect(() => {
    let animFrame: number;
    const updateRadar = () => {
      setRadarAngle((prev) => (prev + 0.8) % 360);
      animFrame = requestAnimationFrame(updateRadar);
    };
    animFrame = requestAnimationFrame(updateRadar);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Update blips position slightly over time for dynamic real feel
  useEffect(() => {
    const timer = setInterval(() => {
      setBlips((prevBlips) =>
        prevBlips.map((blip) => {
          // Circular floating animation for flying jets, hovering helicopter shakes
          let nextX = blip.x;
          let nextY = blip.y;
          let angle = blip.angle;

          if (blip.type === "jet") {
            angle = (blip.angle + 0.3) % 360;
            const rad = (angle * Math.PI) / 180;
            nextX = 350 + Math.cos(rad) * 90;
            nextY = 200 + Math.sin(rad) * 50;
          } else if (blip.type === "heli") {
            // hover vibration shake
            nextX = blip.x + (Math.random() * 0.4 - 0.2);
            nextY = blip.y + (Math.random() * 0.4 - 0.2);
          } else if (blip.type === "prop") {
            // Glide landing glide slope
            nextX = blip.x - 0.4;
            nextY = blip.y - 0.2;
            if (nextX < 100) {
              nextX = 520; // reset to right edge
              nextY = 370;
            }
          }

          return { ...blip, x: nextX, y: nextY, angle };
        })
      );
    }, 45);
    return () => clearInterval(timer);
  }, []);

  // Drag handlers for the map ("waar je kan bewegen")
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetMap = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setSelectedHotspot(hotspots[0]);
  };

  const getSelBlip = () => blips.find((b) => b.id === activeBlip) || blips[0];

  return (
    <div className="bg-slate-950/95 border border-slate-800 rounded-3xl p-5 shadow-2.5xl space-y-4 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center border-b border-slate-900 pb-3">
          <div className="flex items-center space-x-2">
            <Radio className="h-4 w-4 text-[#ea580c] animate-pulse" />
            <span className="font-display font-bold text-xs text-slate-200 tracking-wider font-mono">
              LSIA TACTICAL FLIGHTSPACE • LOS SANTOS
            </span>
          </div>

          <span className="flex items-center gap-1.5 bg-[#ea580c]/10 text-[#ea580c] px-2 py-0.5 rounded-full text-[9px] font-mono border border-[#ea580c]/20 uppercase">
            Map beweegbaar ⚡
          </span>
        </div>

        {/* Map Header Instructions */}
        <p className="text-[10px] text-slate-400 mt-1.5 font-sans leading-relaxed">
          Sleep de kaart om te bewegen. Klik op hotspots en radar-blips voor tactische gegevens van het legendarische GTA vliegveld LSIA.
        </p>
      </div>

      {/* Main Map Canvas Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative h-[320px] bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden cursor-grab ${
          isDragging ? "cursor-grabbing" : ""
        }`}
      >
        {/* Futuristic Map Grid Canvas */}
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
          className="absolute inset-0 w-full h-full select-none"
        >
          {/* Tactical Background Grid Lines */}
          {showGrid && (
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#111827_1px,transparent_1px),linear-gradient(to_bottom,#111827_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />
          )}

          {/* Svg Flight Tracks & Runway Overlay lines for LSIA */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
            {/* LSIA Runway 09R / 27L (Main South Horizontal Runway) */}
            <line
              x1="50"
              y1="280"
              x2="550"
              y2="280"
              stroke="#1e293b"
              strokeWidth="20"
              strokeLinecap="square"
            />
            {/* Dashed center runway indicators */}
            <line
              x1="60"
              y1="280"
              x2="540"
              y2="280"
              stroke="#fb923c"
              strokeWidth="2"
              strokeDasharray="14 10"
              className="opacity-90"
            />
            <text x="50" y="284" fill="#fb923c" fontSize="8" fontFamily="monospace" className="font-bold">09R</text>
            <text x="525" y="284" fill="#fb923c" fontSize="8" fontFamily="monospace" className="font-bold">27L</text>

            {/* Runway 09L / 27R (Main North Horizontal Runway) */}
            <line
              x1="100"
              y1="220"
              x2="500"
              y2="220"
              stroke="#0f172a"
              strokeWidth="14"
              strokeLinecap="square"
            />
            <line
              x1="110"
              y1="220"
              x2="490"
              y2="220"
              stroke="#64748b"
              strokeWidth="1.5"
              strokeDasharray="10 8"
              className="opacity-70"
            />
            <text x="100" y="223" fill="#94a3b8" fontSize="7" fontFamily="monospace">09L</text>
            <text x="480" y="223" fill="#94a3b8" fontSize="7" fontFamily="monospace">27R</text>

            {/* Diagonal Runway 03 / 21 */}
            <line
              x1="50"
              y1="340"
              x2="350"
              y2="70"
              stroke="#090d16"
              strokeWidth="16"
              strokeLinecap="round"
            />
            <line
              x1="60"
              y1="331"
              x2="340"
              y2="79"
              stroke="#ea580c"
              strokeWidth="1"
              strokeDasharray="6 6"
              className="opacity-40"
            />
            <text x="45" y="347" fill="#ea580c" fontSize="7" fontFamily="monospace">03</text>
            <text x="355" y="68" fill="#ea580c" fontSize="7" fontFamily="monospace">21</text>

            {/* Terminal Apron Loops & Airport Roads (Drawn in Luxury Neon Lines) */}
            <path
              d="M 120,120 C 130,50 320,50 340,120 L 320,150 H 140 Z"
              fill="none"
              stroke="#1e293b"
              strokeWidth="2"
              className="opacity-40"
            />
            <path
              d="M 160,120 A 40,40 0 0,1 300,120"
              fill="none"
              stroke="#334155"
              strokeWidth="2.5"
              strokeDasharray="3 3"
            />

            {/* Radar Tower Sweeper Overlay */}
            {showRadar && (
              <g transform="translate(220, 190)">
                {/* Visual radar circular sweep rings */}
                <circle r="40" fill="none" stroke="#ea580c" strokeWidth="0.5" className="opacity-15" />
                <circle r="90" fill="none" stroke="#ea580c" strokeWidth="0.5" className="opacity-10" />
                <circle r="140" fill="none" stroke="#ea580c" strokeWidth="0.5" className="opacity-5" />
                <circle r="200" fill="none" stroke="#ea580c" strokeWidth="0.5" className="opacity-5" />
                {/* Glowing beacon rotating pointer line */}
                <line
                  x1="0"
                  y1="0"
                  x2={Math.cos((radarAngle * Math.PI) / 180) * 210}
                  y2={Math.sin((radarAngle * Math.PI) / 180) * 210}
                  stroke="rgba(234, 88, 12, 0.45)"
                  strokeWidth="1.5"
                />
                {/* Radar beam soft gradient wedge */}
                <path
                  d={`M 0,0 
                     L ${Math.cos((radarAngle * Math.PI) / 180) * 210} ${Math.sin((radarAngle * Math.PI) / 180) * 210} 
                     A 210,210 0 0,0 ${Math.cos(((radarAngle - 25) * Math.PI) / 180) * 210} ${Math.sin(((radarAngle - 25) * Math.PI) / 180) * 210} 
                     Z`}
                  fill="rgba(234, 88, 12, 0.05)"
                />
                <circle r="4" fill="#ea580c" />
              </g>
            )}

            {/* Map Accents Symbols (Heliports circles) */}
            <g transform="translate(280, 330)">
              <circle r="12" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
              <text y="4" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace" className="font-bold">H</text>
            </g>
            <g transform="translate(305, 330)">
              <circle r="12" fill="none" stroke="#38bdf8" strokeWidth="1" className="opacity-60" />
              <text y="4" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace" className="font-bold opacity-60">H2</text>
            </g>
          </svg>

          {/* Interactive Hotspot Buttons Overlay */}
          {hotspots.map((spot) => {
            const isSelected = selectedHotspot?.id === spot.id;
            return (
              <button
                key={spot.id}
                onClick={() => setSelectedHotspot(spot)}
                style={{ left: spot.x, top: spot.y }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center p-1 group"
              >
                <span className="relative flex h-5 w-5">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isSelected ? "bg-[#ea580c]" : "bg-slate-400 opacity-30"
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-5 w-5 border border-slate-900 justify-center items-center ${
                    isSelected ? "bg-[#ea580c] text-slate-950 font-bold" : "bg-slate-800 text-slate-300 hover:bg-[#ea580c] hover:text-slate-950 transition-colors"
                  }`}>
                    {spot.id === "hotspot-tower" ? "🗼" : "•"}
                  </span>
                </span>
                
                {/* Pop label */}
                <span className="absolute top-6 scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap bg-slate-950 text-[9px] font-mono text-[#ea580c] border border-[#ea580c]/30 py-0.5 px-2 rounded-md shadow shadow-black">
                  {spot.title}
                </span>
              </button>
            );
          })}

          {/* Dynamic Aircraft Blips Overlay */}
          {blips.map((blip) => {
            const isActive = activeBlip === blip.id;
            return (
              <button
                key={blip.id}
                onClick={() => {
                  setActiveBlip(blip.id);
                  // Auto fill telemetry matching details
                }}
                style={{ left: blip.x, top: blip.y }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-40 p-1.5 transition-all focus:outline-none"
              >
                {/* Pulse halo of the vector jet blip */}
                <span
                  style={{ backgroundColor: blip.color }}
                  className={`absolute inset-0 rounded-full opacity-20 ${isActive ? "animate-ping" : "scale-75"}`}
                />

                {/* Rotating vector icon pointing along flight path */}
                <div
                  style={{ transform: `rotate(${blip.angle}deg)`, color: blip.color }}
                  className="transition-transform duration-100"
                >
                  <Navigation className={`h-4.5 w-4.5 transform rotate-185 drop-shadow-md ${
                    isActive ? "scale-125" : "hover:scale-110"
                  }`} />
                </div>

                {/* Blip alphanumeric tag */}
                <span className="absolute left-6 -top-2 bg-slate-950/95 text-[8px] font-mono border border-slate-800 rounded py-0.5 px-1 whitespace-nowrap" style={{ color: blip.color }}>
                  {blip.id.substring(5)}: {blip.altitudeFt}ft
                </span>
              </button>
            );
          })}
        </div>

        {/* Floating Mini Compass Controls (Bottom-Right / Top-Right of Canvas) */}
        <div className="absolute right-3 bottom-3 flex flex-col space-y-2 z-50">
          <button
            onClick={() => setScale((prev) => Math.min(prev + 0.25, 2.5))}
            className="p-1.5 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-lg hover:text-[#ea580c] active:scale-95 transition-all shadow-md"
            title="Inzoomen"
          >
            <ZoomIn className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={() => setScale((prev) => Math.max(prev - 0.25, 0.5))}
            className="p-1.5 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-lg hover:text-[#ea580c] active:scale-95 transition-all shadow-md"
            title="Uitzoomen"
          >
            <ZoomOut className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={resetMap}
            className="p-1.5 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-lg hover:text-[#ea580c] active:scale-95 transition-all shadow-md"
            title="Herstel Kaart"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Floating View Map Toggles */}
        <div className="absolute left-3 bottom-3 flex items-center gap-1.5 z-50">
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`text-[8px] font-mono px-2 py-1 rounded-md border transition-all ${
              showGrid 
                ? "bg-[#ea580c]/10 border-[#ea580c]/30 text-[#ea580c]" 
                : "bg-slate-900/80 border-slate-800 text-slate-500"
            }`}
          >
            GRID
          </button>
          <button
            onClick={() => setShowRadar(!showRadar)}
            className={`text-[8px] font-mono px-2 py-1 rounded-md border transition-all ${
              showRadar 
                ? "bg-[#ea580c]/10 border-[#ea580c]/30 text-[#ea580c]" 
                : "bg-slate-900/80 border-slate-800 text-slate-500"
            }`}
          >
            RADAR
          </button>
        </div>

        {/* Coordinates readout static top left */}
        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur border border-slate-900 px-2 py-1 rounded text-[8px] font-mono text-slate-400 select-none z-40">
          <span>LAT: 34°02'38"N • LON: 118°24'04"W</span>
        </div>
      </div>

      {/* Selected Entity details panel */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-3.5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Selected Air traffic Blip telemetry */}
        <div className="space-y-2 border-r border-slate-900 pr-0 md:pr-4">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-widest">Geselecteerde Vliegtuigstroom</span>
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500"></span>
          </div>
          
          <div className="flex gap-2.5 items-center">
            <div className="h-8 w-8 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-center text-orange-500">
              <Navigation className="h-4 w-4 transform rotate-45" />
            </div>
            <div>
              <span className="block font-sans text-xs font-bold text-slate-200">
                {getSelBlip().name}
              </span>
              <span className="text-[9px] font-mono text-slate-500 block uppercase">
                {getSelBlip().status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-slate-400">
            <div>
              <span className="text-slate-600 font-bold block text-[8px]">SNELHEID</span>
              <span className="text-slate-200">{getSelBlip().speedKmh} km/h</span>
            </div>
            <div>
              <span className="text-slate-600 font-bold block text-[8px]">HOOGTE</span>
              <span className="text-slate-200">{getSelBlip().altitudeFt} FT</span>
            </div>
          </div>
        </div>

        {/* Selected Map Hotspot details */}
        <div className="space-y-1.5">
          {selectedHotspot ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono text-[#ea580c] uppercase font-bold tracking-widest">Locatie Gegevens</span>
                <span className="text-[8px] font-mono text-slate-500">{selectedHotspot.subtitle}</span>
              </div>
              <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 font-sans">
                <MapPin className="h-3 w-3 text-orange-500" />
                {selectedHotspot.title}
              </h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-light font-sans">
                {selectedHotspot.details}
              </p>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-[10px] text-slate-500 font-mono">
              Klik op een map hotspot (•) voor details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
