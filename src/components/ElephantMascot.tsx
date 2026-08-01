'use client';

import React from 'react';

interface ElephantMascotProps {
  size?: number;
  className?: string;
}

/**
 * Elephant mascot SVG — matches the truck's sunset-vermilion elephant
 * with ornate ear decoration (gold/green/magenta ceremonial patterning).
 *
 * Used: login, empty states, loading, order confirmation.
 */
export function ElephantMascot({ size = 200, className = '' }: ElephantMascotProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Enjipuli elephant mascot"
    >
      {/* Background circle — indigo */}
      <circle cx="120" cy="120" r="115" fill="#241B5E" opacity="0.3" />

      {/* Foliage behind elephant */}
      <path d="M40 180 Q60 120 80 160 Q90 100 110 150 Q120 90 140 140 Q160 80 170 130 Q180 100 200 180 Z"
            fill="#2FBFA0" opacity="0.15" />
      <path d="M30 190 Q70 140 100 170 Q120 110 150 160 Q170 120 190 180 Q200 150 210 190 Z"
            fill="#D4FF3D" opacity="0.08" />

      {/* Elephant body — vermilion with warm gradients */}
      <defs>
        <radialGradient id="elephant-body" cx="0.4" cy="0.3" r="0.7">
          <stop offset="0%" stopColor="#F47A4E" />
          <stop offset="50%" stopColor="#F0562E" />
          <stop offset="100%" stopColor="#C44422" />
        </radialGradient>
        <radialGradient id="elephant-ear" cx="0.3" cy="0.3" r="0.8">
          <stop offset="0%" stopColor="#F47A4E" />
          <stop offset="100%" stopColor="#D04828" />
        </radialGradient>
      </defs>

      {/* Ear — large ornate shape */}
      <ellipse cx="85" cy="95" rx="55" ry="60" fill="url(#elephant-ear)" stroke="#150F2E" strokeWidth="1.5" />

      {/* Ear decoration — gold border arc */}
      <path d="M45 65 Q60 40 90 38 Q115 38 130 55"
            stroke="#F4B400" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M50 75 Q65 52 88 50 Q110 50 125 65"
            stroke="#2FBFA0" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Ear decoration — dots and shapes */}
      <circle cx="75" cy="60" r="5" fill="#F4B400" opacity="0.9" />
      <circle cx="95" cy="55" r="4" fill="#D4FF3D" opacity="0.8" />
      <circle cx="65" cy="72" r="3.5" fill="#B33DB0" opacity="0.8" />
      <circle cx="85" cy="75" r="6" fill="#F4B400" opacity="0.7" />
      <circle cx="105" cy="70" r="3" fill="#2FBFA0" opacity="0.8" />

      {/* Paisley motif on ear */}
      <path d="M70 85 Q75 78 85 82 Q90 88 82 92 Q74 93 70 85Z"
            fill="#D4FF3D" opacity="0.5" />
      <path d="M95 85 Q100 80 108 84 Q110 90 104 94 Q96 94 95 85Z"
            fill="#B33DB0" opacity="0.4" />

      {/* Head — main shape */}
      <path d="M95 50 Q130 35 155 55 Q175 75 172 110 Q170 135 155 155
               Q145 168 130 175 L120 178 Q105 175 95 165
               Q80 150 75 130 Q70 110 75 90 Q78 65 95 50Z"
            fill="url(#elephant-body)" stroke="#150F2E" strokeWidth="1.5" />

      {/* Eye */}
      <ellipse cx="138" cy="92" rx="8" ry="9" fill="#150F2E" />
      <ellipse cx="140" cy="90" rx="3" ry="3.5" fill="#FFF7E8" opacity="0.9" />
      {/* Eye highlight */}
      <circle cx="142" cy="88" r="1.5" fill="white" />

      {/* Eyebrow ridge */}
      <path d="M125 78 Q138 72 150 78" stroke="#C44422" strokeWidth="2" fill="none" />

      {/* Forehead decoration — ceremonial dot */}
      <circle cx="130" cy="72" r="4" fill="#F4B400" stroke="#150F2E" strokeWidth="0.8" />
      <circle cx="130" cy="72" r="2" fill="#D4FF3D" />

      {/* Trunk */}
      <path d="M130 175 Q125 185 120 195 Q118 200 122 205
               Q128 208 132 204 Q136 198 138 190 Q140 182 135 175Z"
            fill="url(#elephant-body)" stroke="#150F2E" strokeWidth="1.2" />

      {/* Trunk tip — lighter */}
      <ellipse cx="127" cy="206" rx="6" ry="4" fill="#F5A68E" stroke="#150F2E" strokeWidth="0.8" />

      {/* Tusk */}
      <path d="M140 168 Q145 180 142 192 Q140 196 138 192"
            stroke="#FFF7E8" strokeWidth="3.5" fill="none" strokeLinecap="round" />

      {/* Decorative lotus below */}
      <g opacity="0.6">
        <path d="M100 220 Q110 208 120 220 Q130 208 140 220" stroke="#B33DB0" strokeWidth="1.5" fill="none" />
        <path d="M105 224 Q115 214 120 224 Q125 214 135 224" stroke="#D4FF3D" strokeWidth="1" fill="none" />
      </g>
    </svg>
  );
}
