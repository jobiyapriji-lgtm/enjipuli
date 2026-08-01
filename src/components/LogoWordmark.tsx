'use client';

import React from 'react';

interface LogoWordmarkProps {
  size?: number;
  light?: boolean;
  className?: string;
  glow?: boolean;
}

/**
 * ENJIPULI brand wordmark — ഇഞ്ചിപ്പുളി
 *
 * Renders the Malayalam name in a hand-lettered style matching the truck's
 * brush-script lettering: electric lime fill, dark indigo outline, ambient glow.
 *
 * Below it: the tagline ക്യാമ്പസിന്റെ ഹോട്ട്സ്പോട്ട് in Baloo Chettan 2
 * webfont with a subtle lime glow for visual cohesion.
 *
 * Props:
 *   size     — controls width in px (height proportional)
 *   light    — unused now (always on dark bg), kept for API compat
 *   glow     — true → apply ambient pulsing glow animation
 *   className — pass-through
 */
export function LogoWordmark({ size = 140, light = true, className = '', glow = false }: LogoWordmarkProps) {
  const height = Math.round(size * 0.45);
  const taglineSize = Math.max(10, Math.round(size * 0.1));

  return (
    <span
      className={`${className} ${glow ? 'animate-glow-pulse' : ''}`}
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}
      aria-label="ഇഞ്ചിപ്പുളി — ക്യാമ്പസിന്റെ ഹോട്ട്സ്പോട്ട്"
    >
      {/* Hand-lettered wordmark SVG */}
      <svg
        width={size}
        height={height}
        viewBox="0 0 400 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="ഇഞ്ചിപ്പുളി"
      >
        <defs>
          {/* Glow filter matching the truck's neon lime outline treatment */}
          <filter id="wordmark-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0.83 0 0 0 0  1 0 0 0 0  0.24 0 0 0 0  0 0 0 0.6 0"
              result="glow"
            />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Outline stroke for depth */}
          <filter id="wordmark-outline" x="-5%" y="-5%" width="110%" height="110%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="2" result="expanded" />
            <feFlood floodColor="#150F2E" result="color" />
            <feComposite in="color" in2="expanded" operator="in" result="outline" />
            <feMerge>
              <feMergeNode in="outline" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#wordmark-outline)">
          <g filter="url(#wordmark-glow)">
            {/* ഇഞ്ചിപ്പുളി — recreated as flowing brush-script paths */}
            {/* Main lettering block — using text with a custom font-face fallback */}
            <text
              x="200"
              y="105"
              textAnchor="middle"
              fontFamily="'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif"
              fontWeight="800"
              fontSize="82"
              fill="#D4FF3D"
              stroke="#150F2E"
              strokeWidth="3"
              paintOrder="stroke fill"
              style={{ letterSpacing: '-0.02em' }}
            >
              ഇഞ്ചിപ്പുളി
            </text>
          </g>
        </g>
      </svg>

      {/* Tagline — webfont, legible at all sizes */}
      <span
        lang="ml"
        style={{
          fontSize: taglineSize,
          fontFamily: "'Baloo Chettan 2', 'Noto Sans Malayalam', sans-serif",
          fontWeight: 600,
          color: '#D4FF3D',
          marginTop: Math.round(size * 0.02),
          textShadow: '0 0 12px rgba(212,255,61,0.3)',
          letterSpacing: '0.02em',
          opacity: 0.9,
        }}
      >
        ക്യാമ്പസിന്റെ ഹോട്ട്സ്പോട്ട്
      </span>
    </span>
  );
}
