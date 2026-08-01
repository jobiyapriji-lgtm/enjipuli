'use client';

import React from 'react';

interface FloralDividerProps {
  width?: number;
  color?: string;
  className?: string;
}

/**
 * Small paisley/lotus line-art accent from the truck's ear decoration patterns.
 * Used as section dividers and card edge accents.
 */
export function FloralDivider({ width = 120, color = '#D4FF3D', className = '' }: FloralDividerProps) {
  const h = Math.round(width * 0.2);
  return (
    <svg
      width={width}
      height={h}
      viewBox="0 0 120 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      {/* Center lotus */}
      <path d="M60 18 Q54 8 48 18" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M60 18 Q66 8 72 18" stroke={color} strokeWidth="1.5" fill="none" opacity="0.7" />
      <path d="M60 18 Q60 5 60 18" stroke={color} strokeWidth="1" fill="none" opacity="0.5" />
      <circle cx="60" cy="15" r="2" fill={color} opacity="0.6" />

      {/* Left flourish */}
      <path d="M45 14 Q35 10 20 14" stroke={color} strokeWidth="1.2" fill="none" opacity="0.4" />
      <path d="M20 14 Q10 12 5 14" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
      <circle cx="5" cy="14" r="1.5" fill={color} opacity="0.3" />

      {/* Right flourish */}
      <path d="M75 14 Q85 10 100 14" stroke={color} strokeWidth="1.2" fill="none" opacity="0.4" />
      <path d="M100 14 Q110 12 115 14" stroke={color} strokeWidth="1" fill="none" opacity="0.3" />
      <circle cx="115" cy="14" r="1.5" fill={color} opacity="0.3" />
    </svg>
  );
}
