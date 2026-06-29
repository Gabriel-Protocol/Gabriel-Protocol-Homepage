import React from 'react';

interface GabrielLogoProps {
  className?: string;
  size?: number;
}

export function GabrielLogo({ className = '', size = 48 }: GabrielLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 500"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Curved path for GABRIEL PROTOCOL text */}
        <path
          id="gabrielTextPath"
          d="M 110,210 A 155,155 0 0,1 390,210"
          fill="none"
        />
        {/* Clip path for the front ring to hide the back half */}
        <clipPath id="frontRingClip">
          <rect x="0" y="270" width="500" height="230" />
        </clipPath>
        {/* Clip path for the back ring to hide the front half */}
        <clipPath id="backRingClip">
          <rect x="0" y="0" width="500" height="270" />
        </clipPath>
      </defs>

      {/* 1. BACK RING LAYER (Behind the planet) */}
      <g clipPath="url(#backRingClip)">
        <g transform="rotate(-18 250 290)">
          {/* Outer ring shadow/border */}
          <ellipse cx="250" cy="290" rx="215" ry="58" fill="none" stroke="#005a5a" strokeWidth="8" />
          {/* Inner ring teal fill */}
          <ellipse cx="250" cy="290" rx="210" ry="54" fill="#008B8B" />
          {/* Ring white stripe */}
          <ellipse cx="250" cy="290" rx="190" ry="46" fill="none" stroke="white" strokeWidth="10" />
          {/* Ring inner cutout/border */}
          <ellipse cx="250" cy="290" rx="170" ry="38" fill="none" stroke="#005a5a" strokeWidth="6" />
        </g>
      </g>

      {/* 2. PLANET SPHERE */}
      {/* Outer border */}
      <circle cx="250" cy="290" r="124" fill="#005a5a" />
      {/* Main white sphere */}
      <circle cx="250" cy="290" r="120" fill="white" />

      {/* 3. PLANET DECORATIVE STRIPES */}
      {/* Teal band across the center-bottom */}
      <g>
        <path
          d="M 132,305 C 180,355 320,355 368,305 C 360,285 340,285 330,285 C 290,325 210,325 170,285 C 160,285 140,285 132,305 Z"
          fill="#008B8B"
        />
        <path
          d="M 134,310 C 180,360 320,360 366,310 C 350,335 320,345 250,345 C 180,345 150,335 134,310 Z"
          fill="#006C6C"
        />
      </g>

      {/* 4. FRONT RING LAYER (In front of the planet) */}
      <g clipPath="url(#frontRingClip)">
        <g transform="rotate(-18 250 290)">
          {/* Outer ring shadow/border */}
          <ellipse cx="250" cy="290" rx="215" ry="58" fill="none" stroke="#005a5a" strokeWidth="8" />
          {/* Inner ring teal fill */}
          <ellipse cx="250" cy="290" rx="210" ry="54" fill="#008B8B" />
          {/* Ring white stripe */}
          <ellipse cx="250" cy="290" rx="190" ry="46" fill="none" stroke="white" strokeWidth="10" />
          {/* Ring inner cutout/border */}
          <ellipse cx="250" cy="290" rx="170" ry="38" fill="none" stroke="#005a5a" strokeWidth="6" />
        </g>
      </g>

      {/* 5. GABRIEL PROTOCOL CURVED TEXT */}
      <text fill="#800020" fontSize="34" fontWeight="900" fontFamily="'Arial Black', 'Impact', sans-serif" letterSpacing="1">
        <textPath href="#gabrielTextPath" startOffset="50%" textAnchor="middle">
          GABRIEL PROTOCOL
        </textPath>
      </text>
    </svg>
  );
}
