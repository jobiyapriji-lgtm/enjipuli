'use client';

import React from 'react';

interface MuralBackgroundProps {
  className?: string;
  opacity?: number;
}

/**
 * Full-screen decorative background matching the truck's psychedelic mural:
 * - Swirling foliage bursts in tropical colors
 * - Lotus/paisley patterns filling negative space
 * - Palm trees and houseboat silhouettes
 *
 * Rendered as absolute-positioned SVG at low opacity behind branding screens.
 */
export function MuralBackground({ className = '', opacity = 0.12 }: MuralBackgroundProps) {
  return (
    <div
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 1200"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity }}
      >
        {/* Large psychedelic swirl — top-right */}
        <path
          d="M700 50 Q750 100 720 200 Q680 300 730 350 Q800 400 780 500 Q750 600 800 650"
          stroke="#B33DB0" strokeWidth="40" fill="none" opacity="0.6"
          strokeLinecap="round"
        />
        <path
          d="M650 30 Q700 80 670 180 Q630 280 680 340 Q750 390 730 490"
          stroke="#D4FF3D" strokeWidth="20" fill="none" opacity="0.4"
          strokeLinecap="round"
        />

        {/* Foliage burst — top-left */}
        <g transform="translate(80, 100)">
          <path d="M0 80 Q20 20 60 60 Q30 0 80 30 Q50 -10 100 20" stroke="#2FBFA0" strokeWidth="8" fill="none" opacity="0.7" />
          <path d="M10 90 Q30 30 70 70 Q40 10 90 40" stroke="#D4FF3D" strokeWidth="5" fill="none" opacity="0.5" />
          <ellipse cx="50" cy="50" rx="15" ry="20" fill="#F0562E" opacity="0.4" />
        </g>

        {/* Palm tree — left side */}
        <g transform="translate(50, 350)" opacity="0.5">
          <line x1="30" y1="200" x2="35" y2="40" stroke="#2FBFA0" strokeWidth="6" />
          <path d="M35 40 Q20 10 -10 20" stroke="#D4FF3D" strokeWidth="4" fill="none" />
          <path d="M35 40 Q50 5 80 15" stroke="#2FBFA0" strokeWidth="4" fill="none" />
          <path d="M35 40 Q30 0 10 -5" stroke="#D4FF3D" strokeWidth="3" fill="none" />
          <path d="M35 40 Q55 10 70 0" stroke="#2FBFA0" strokeWidth="3" fill="none" />
        </g>

        {/* Lotus cluster — bottom-left */}
        <g transform="translate(100, 900)" opacity="0.5">
          <path d="M0 40 Q20 0 40 40" stroke="#B33DB0" strokeWidth="3" fill="none" />
          <path d="M-10 40 Q20 -10 50 40" stroke="#F0562E" strokeWidth="2" fill="none" />
          <path d="M5 45 Q20 10 35 45" stroke="#F4B400" strokeWidth="2" fill="none" />
          <circle cx="20" cy="35" r="4" fill="#D4FF3D" opacity="0.6" />
        </g>

        {/* Houseboat with umbrella — bottom-right */}
        <g transform="translate(550, 950)" opacity="0.4">
          {/* Water line */}
          <path d="M0 80 Q30 70 60 80 Q90 90 120 80 Q150 70 180 80" stroke="#2FBFA0" strokeWidth="2" fill="none" />
          {/* Boat hull */}
          <path d="M30 75 Q90 60 150 75" stroke="#F4B400" strokeWidth="3" fill="none" />
          {/* Cabin */}
          <rect x="60" y="50" width="60" height="25" rx="3" stroke="#F4B400" strokeWidth="2" fill="none" />
          {/* Umbrella */}
          <line x1="90" y1="50" x2="90" y2="25" stroke="#F0562E" strokeWidth="2" />
          <path d="M70 28 Q90 15 110 28" stroke="#F0562E" strokeWidth="3" fill="none" />
        </g>

        {/* Large paisley — center-right */}
        <g transform="translate(600, 600) rotate(-20)" opacity="0.4">
          <path d="M0 60 Q10 0 50 10 Q80 20 70 60 Q60 90 30 80 Q0 70 0 60Z"
                stroke="#F4B400" strokeWidth="3" fill="none" />
          <path d="M15 55 Q20 25 45 30 Q60 35 55 55 Q50 70 30 65 Q15 60 15 55Z"
                stroke="#D4FF3D" strokeWidth="2" fill="none" />
          <circle cx="35" cy="45" r="5" fill="#B33DB0" opacity="0.5" />
        </g>

        {/* Floating feather shapes */}
        <g transform="translate(200, 500)" opacity="0.3">
          <path d="M0 0 Q15 -20 30 0 Q15 20 0 0Z" fill="#D4FF3D" />
          <line x1="15" y1="-15" x2="15" y2="15" stroke="#150F2E" strokeWidth="1" />
        </g>
        <g transform="translate(500, 300) rotate(30)" opacity="0.25">
          <path d="M0 0 Q12 -18 24 0 Q12 18 0 0Z" fill="#F0562E" />
          <line x1="12" y1="-14" x2="12" y2="14" stroke="#150F2E" strokeWidth="1" />
        </g>

        {/* Scattered geometric diamonds — from the truck's lower border */}
        <g transform="translate(650, 1050)" opacity="0.3">
          <rect x="0" y="0" width="12" height="12" transform="rotate(45 6 6)" fill="#F4B400" />
          <rect x="25" y="5" width="10" height="10" transform="rotate(45 30 10)" fill="#F0562E" />
          <rect x="50" y="0" width="12" height="12" transform="rotate(45 56 6)" fill="#B33DB0" />
          <rect x="75" y="5" width="10" height="10" transform="rotate(45 80 10)" fill="#2FBFA0" />
        </g>

        {/* Large foliage sweep — right side */}
        <path
          d="M800 200 Q720 250 740 350 Q760 400 700 420 Q660 440 680 500 Q700 560 650 580"
          stroke="#F0562E" strokeWidth="30" fill="none" opacity="0.3"
          strokeLinecap="round"
        />

        {/* Additional swirl — bottom */}
        <path
          d="M100 1100 Q200 1050 300 1100 Q400 1150 500 1100 Q600 1050 700 1100"
          stroke="#3B2C8C" strokeWidth="50" fill="none" opacity="0.5"
        />

        {/* Palm tree 2 — right */}
        <g transform="translate(700, 700)" opacity="0.35">
          <line x1="20" y1="120" x2="25" y2="30" stroke="#2FBFA0" strokeWidth="5" />
          <path d="M25 30 Q10 5 -15 12" stroke="#D4FF3D" strokeWidth="3.5" fill="none" />
          <path d="M25 30 Q40 0 65 8" stroke="#2FBFA0" strokeWidth="3.5" fill="none" />
        </g>
      </svg>
    </div>
  );
}
