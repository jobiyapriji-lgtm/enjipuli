/**
 * ENJIPULI — Logo Wordmark Component
 *
 * This is a SLOT for the hand-lettered SVG wordmark arriving from
 * the Google Stitch design process.
 *
 * HOW TO INTEGRATE THE STITCH SVG:
 *   1. Drop the SVG file into /public/logo-wordmark.svg
 *   2. Replace the <FallbackText> block below with:
 *        <Image src="/logo-wordmark.svg" alt="ഇഞ്ചിപ്പുളി" width={160} height={40} priority />
 *   3. Remove the STITCH_TODO comment.
 *
 * Props:
 *   size    — controls width in px, height scales proportionally
 *   light   — true → use light variant (for dark backgrounds)
 *   className — pass-through for Stitch overrides
 */
import React from 'react';

interface LogoWordmarkProps {
  size?: number;
  light?: boolean;
  className?: string;
}

export function LogoWordmark({ size = 140, light = true, className = '' }: LogoWordmarkProps) {
  // STITCH_TODO: Replace this fallback text with:
  // import Image from 'next/image';
  // <Image src="/logo-wordmark.svg" alt="ഇഞ്ചിപ്പുളി" width={size} height={Math.round(size * 0.3)} priority />

  return (
    <span
      className={className}
      style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}
      aria-label="Enjipuli — Campus food truck"
    >
      {/* Fallback: Malayalam text until SVG wordmark arrives */}
      <span
        lang="ml"
        style={{
          fontSize: Math.round(size * 0.22),
          fontFamily: "'Noto Sans Malayalam', 'Baloo Chettan 2', sans-serif",
          fontWeight: 800,
          color: light ? 'var(--color-text-primary)' : 'var(--color-text-inverse)',
          letterSpacing: '-0.01em',
        }}
      >
        ഇഞ്ചിപ്പുളി
      </span>
      <span
        lang="ml"
        style={{
          fontSize: Math.round(size * 0.1),
          fontFamily: "'Noto Sans Malayalam', 'Baloo Chettan 2', sans-serif",
          fontWeight: 600,
          color: 'var(--color-accent)',
          marginTop: 2,
        }}
      >
        ക്യാമ്പ്സ്ന്റെ ഹോട്ട്സ്പോട്ട്
      </span>
    </span>
  );
}
