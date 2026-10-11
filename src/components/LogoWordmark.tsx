'use client';

import React from 'react';

interface LogoWordmarkProps {
  size?: number;
  light?: boolean;
  className?: string;
  glow?: boolean;
  showTagline?: boolean;
}

/**
 * ENJIPULI brand wordmark — ഇഞ്ചിപ്പുളി & ക്യാമ്പസിന്റെ ഹോട്ട്സ്പോട്ട്
 *
 * Renders the authentic hand-lettered brush-script sticker assets with
 * bright lime fill, thick black contour, specular highlights, and droplet accents.
 */
export function LogoWordmark({
  size = 140,
  light = true,
  className = '',
  glow = false,
  showTagline = true,
}: LogoWordmarkProps) {
  const wordmarkWidth = size;
  const wordmarkHeight = Math.round(wordmarkWidth * (377 / 1024)); // ~51px at 140
  const taglineWidth = Math.round(size * 0.92);
  const taglineHeight = Math.round(taglineWidth * (341 / 1024)); // ~42px at 128

  return (
    <div
      className={`inline-flex flex-col items-center select-none ${className}`}
      style={{ lineHeight: 1 }}
      aria-label="ഇഞ്ചിപ്പുളി — ക്യാമ്പസിന്റെ ഹോട്ട്സ്പോട്ട്"
    >
      {/* Official sticker wordmark flanked by organic glossy drops */}
      <div className="relative inline-flex items-center justify-center">
        {/* Left droplet accents */}
        <span className="absolute -left-3.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 pointer-events-none">
          <svg viewBox="0 0 32 48" className="w-2.5 h-3.5 -rotate-20" fill="none">
            <path
              d="M16 2 C16 2 2 18 2 30 C2 39 8.2 46 16 46 C23.8 46 30 39 30 30 C30 18 16 2 16 2 Z"
              fill="#FFB800"
            />
            <path
              d="M8 24 C7 28 8 34 11 38"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.85"
            />
          </svg>
          <svg viewBox="0 0 32 48" className="w-2 h-3 rotate-15" fill="none">
            <path
              d="M16 2 C16 2 2 18 2 30 C2 39 8.2 46 16 46 C23.8 46 30 39 30 30 C30 18 16 2 16 2 Z"
              fill="#F21B55"
            />
          </svg>
        </span>

        {/* Wordmark sticker */}
        <img
          src="/branding/enjipuli-wordmark.png"
          alt="ഇഞ്ചിപ്പുളി"
          width={wordmarkWidth}
          height={wordmarkHeight}
          className={`w-auto object-contain transition-all duration-300 ${
            glow ? 'drop-shadow-[0_0_12px_rgba(212,255,61,0.35)]' : 'drop-shadow-sm'
          }`}
          style={{ height: wordmarkHeight, maxWidth: '100%' }}
          decoding="async"
        />

        {/* Right droplet accents */}
        <span className="absolute -right-3.5 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 pointer-events-none">
          <svg viewBox="0 0 32 48" className="w-2 h-3 rotate-25" fill="none">
            <path
              d="M16 2 C16 2 2 18 2 30 C2 39 8.2 46 16 46 C23.8 46 30 39 30 30 C30 18 16 2 16 2 Z"
              fill="#FFB800"
            />
          </svg>
          <svg viewBox="0 0 32 48" className="w-2 h-3 -rotate-15" fill="none">
            <path
              d="M16 2 C16 2 2 18 2 30 C2 39 8.2 46 16 46 C23.8 46 30 39 30 30 C30 18 16 2 16 2 Z"
              fill="#00A3FF"
            />
          </svg>
        </span>
      </div>

      {/* Official sticker tagline */}
      {showTagline && (
        <img
          src="/branding/enjipuli-tagline.png"
          alt="ക്യാമ്പസിന്റെ ഹോട്ട്സ്പോട്ട്"
          width={taglineWidth}
          height={taglineHeight}
          className={`w-auto object-contain mt-1 transition-all duration-300 ${
            glow ? 'drop-shadow-[0_0_8px_rgba(212,255,61,0.2)]' : 'drop-shadow-sm'
          }`}
          style={{ height: taglineHeight, maxWidth: '100%' }}
          decoding="async"
        />
      )}
    </div>
  );
}
