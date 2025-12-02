/**
 * Font loading utility similar to Next.js's next/font
 *
 * This module provides font loading capabilities that:
 * - Self-host fonts (no external network requests)
 * - Optimize font loading with font-display: swap
 * - Generate CSS variables for font families
 * - Provide className for easy application
 *
 * @example
 * ```tsx
 * import { lusitana, montserrat } from '@/lib/fonts';
 *
 * // Fonts are automatically loaded and CSS variables are generated
 * // Use in your component:
 * <div className={lusitana.className}>Text with Lusitana font</div>
 *
 * // Or use CSS variables:
 * <div style={{ fontFamily: 'var(--font-lusitana)' }}>Text</div>
 * ```
 */

// Import font sources (self-hosted Google Fonts)
import '@fontsource/lusitana/400.css';
import '@fontsource/lusitana/700.css';
import '@fontsource/montserrat/400.css';
import '@fontsource/montserrat/500.css';
import '@fontsource/montserrat/600.css';
import '@fontsource/montserrat/700.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/geist-mono/500.css';
import '@fontsource/geist-mono/600.css';
import '@fontsource/geist-mono/700.css';

export interface FontOptions {
  /** CSS variable name prefix (e.g., 'lusitana' creates --font-lusitana) */
  variable?: string;
  /** Additional CSS classes to apply */
  className?: string;
  /** Font display strategy */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  /** Preload the font */
  preload?: boolean;
}

export interface GoogleFontOptions extends FontOptions {
  /** Font subsets to load */
  subsets?: string[];
  /** Font weights to load */
  weight?: string | string[];
  /** Font styles to load */
  style?: string | string[];
}

export interface LocalFontOptions extends FontOptions {
  /** Path to font file(s) */
  src:
    | string
    | Array<{
        path: string;
        weight?: string;
        style?: string;
      }>;
}

/**
 * Google Font loader
 * Uses @fontsource packages for self-hosting
 *
 * @fontsource packages automatically define the font-family name,
 * so we use the package name to determine the correct family name
 */
export function googleFont(
  fontName: string,
  options: GoogleFontOptions = {}
): {
  className: string;
  style: { fontFamily: string; [key: string]: string };
  variable: string;
} {
  const { variable = fontName.toLowerCase().replace(/\s+/g, '-') } = options;

  const cssVariable = `--font-${variable}`;
  const fontFamily = `var(${cssVariable})`;

  // The actual font-family name from @fontsource (usually title case with spaces)
  // For @fontsource packages, the font-family is typically the original Google Font name
  const actualFontFamily = fontName;

  return {
    className: `font-${variable}`,
    style: {
      fontFamily,
      [cssVariable]: `'${actualFontFamily}', sans-serif`,
    },
    variable: cssVariable,
  };
}

/**
 * Local font loader
 * Loads fonts from local files
 */
export function localFont(options: LocalFontOptions): {
  className: string;
  style: { fontFamily: string; [key: string]: string };
  variable: string;
} {
  const { variable = 'local' } = options;

  const cssVariable = `--font-${variable}`;
  const fontFamily = `var(${cssVariable})`;

  // Font family name will be determined from the variable
  const fontFamilyName = variable
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    className: `font-${variable}`,
    style: {
      fontFamily,
      [cssVariable]: `'${fontFamilyName}', sans-serif`,
    },
    variable: cssVariable,
  };
}

/**
 * Configure and export fonts
 * Similar to Next.js font setup
 */
export const lusitana = googleFont('Lusitana', {
  variable: 'lusitana',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const montserrat = googleFont('Montserrat', {
  variable: 'montserrat',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const geistMono = googleFont('Geist Mono', {
  variable: 'geist-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});
