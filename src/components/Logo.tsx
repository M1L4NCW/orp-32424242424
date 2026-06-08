import React from "react";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function Logo({ className = "", showText = true, size = "md" }: LogoProps) {
  const pixelSizes = {
    sm: "h-10 w-10",
    md: "h-16 w-16",
    lg: "h-36 w-36"
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* SVG circular orange sunset crest with control tower, hangar, and propeller airplane */}
      <div className={`relative ${pixelSizes[size]} shrink-0`}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-lg"
        >
          {/* Subtle Outer Air Ring */}
          <path
            d="M 25,120 A 85,85 0 1,1 180,120"
            stroke="#1e293b"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="opacity-40"
          />

          {/* Dynamic flight path tail sweep */}
          <path
            d="M 20,95 C 20,40 85,15 145,20 C 185,24 165,55 125,70 C 80,85 30,125 10,105"
            fill="#94a3b8"
            className="opacity-20"
          />

          {/* Circular Sun (Modern Titanium Gray) */}
          <circle cx="100" cy="98" r="62" fill="#334155" />

          {/* Runway leading to the sunset horizon */}
          <path
            d="M 100,105 L 158,155 L 42,155 Z"
            fill="#0f172a"
          />
          {/* Runway white center dash lines */}
          <path
            d="M 100,108 L 100,116 M 100,122 L 100,132 M 100,139 L 100,152"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="1 1"
          />

          {/* Hangar Silhouette (left/mid aligned) */}
          <path
            d="M 45,135 H 142 L 140,110 L 98,98 L 47,112 Z"
            fill="#020617"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          {/* Hangar windows & lines */}
          <rect x="53" y="118" width="8" height="6" rx="1" fill="#cbd5e1" className="opacity-80" />
          <rect x="65" y="117" width="8" height="6" rx="1" fill="#cbd5e1" className="opacity-80" />
          <rect x="77" y="116" width="8" height="6" rx="1" fill="#cbd5e1" className="opacity-80" />
          <rect x="89" y="115" width="8" height="6" rx="1" fill="#cbd5e1" className="opacity-80" />
          {/* Door of the hangar */}
          <path d="M 104,115 H 132 V 135 H 104 Z" fill="#0f172a" />
          <path d="M 108,124 L 118,120 L 128,124" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

          {/* Control Tower Silhouette */}
          <path
            d="M 62,130 V 98 H 58 L 56,92 H 72 L 70,98 H 66 V 130 Z"
            fill="#090d16"
          />
          {/* Control tower top beacon antenna */}
          <line x1="64" y1="92" x2="64" y2="82" stroke="#090d16" strokeWidth="2" />
          {/* Control tower cabin glass highlights */}
          <rect x="58.5" y="93.5" width="11" height="3" rx="0.5" fill="#fcfcfc" className="opacity-90" />

          {/* Dynamic Flight Arch Overlay (Blue/Slate) */}
          <path
            d="M 10,125 C 2,90 22,40 55,25 C 95,5 145,21 175,50"
            stroke="#0f172a"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Airplane Propeller Flying (White and Slate) */}
          <g transform="translate(142, 54) rotate(-14)">
            {/* Plane Wings */}
            <path
              d="M -50,-4 L 38,-1 L 34,4 L -44,3 Z"
              fill="#f8fafc"
              stroke="#0f172a"
              strokeWidth="2.5"
            />
            {/* Cabin fuselage details */}
            <path
              d="M -24,-10 C -12,-9 10,-4 32,1 C 36,2 38,6 26,8 C 12,9 -15,7 -28,1 C -32,-3 -32,-8 -24,-10 Z"
              fill="#0f172a"
            />
            {/* Tail Wing */}
            <path d="M -25,-6 L -33,-16 L -28,-18 L -18,-8 Z" fill="#0f172a" />
            <path d="M -28,-1 L -36,6 L -31,8 L -23,1 Z" fill="#f8fafc" />
            {/* Landing gear wheel */}
            <circle cx="2" cy="11" r="3" fill="#0f172a" />
            <line x1="2" y1="5" x2="2" y2="10" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="18" cy="10" r="3" fill="#0f172a" />
            <line x1="18" y1="4" x2="18" y2="9" stroke="#0f172a" strokeWidth="2.5" />
            {/* Propeller nose cone and spinning blur */}
            <ellipse cx="33" cy="2" rx="2" ry="7" fill="#cbd5e1" />
            <circle cx="33" cy="2" r="1.5" fill="#f8fafc" />
            <ellipse cx="33" cy="2" rx="1" ry="16" fill="#f8fafc" className="opacity-45" stroke="#0f172a" strokeWidth="0.5" />
          </g>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-display font-black text-[13px] sm:text-lg tracking-wider block leading-none text-slate-300">
              LUCHTVAART CENTRUM
            </span>
          </div>
          <span className="font-display font-extrabold text-[15px] sm:text-xl tracking-widest text-white block uppercase leading-none mt-0.5">
            ORANJESTAD
          </span>
          <span className="font-sans font-medium text-[8px] sm:text-[9px] tracking-widest text-slate-400 block uppercase mt-1">
            VLIEGSCHOOL • DEALERSHIP • TRAININGEN
          </span>
        </div>
      )}
    </div>
  );
}
