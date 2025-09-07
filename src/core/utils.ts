// Core utility functions for the Custom Color System plugin
import { RGBA } from './types';

// Color conversion utilities
export function hexToRgb(hex: string): RGBA | null {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  try {
    const alpha = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return {
      r: parseInt(hex.substring(0, 2), 16) / 255,
      g: parseInt(hex.substring(2, 4), 16) / 255,
      b: parseInt(hex.substring(4, 6), 16) / 255,
      a: alpha
    };
  } catch (error) {
    console.error('Error parsing hex:', hex);
    return null;
  }
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  
  // Simple fix: ensure we never have 3-character hex values like #FFF
  // Convert any 3-character hex to 6-character hex
  if (hex.length === 4) { // #FFF -> #FFFFFF
    const colorPart = hex.substring(1); // Remove #
    const expanded = colorPart.split('').map(char => char + char).join('');
    return `#${expanded}`;
  }
  
  return hex;
}

export function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  const colorHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  
  // If alpha is 1 (fully opaque), return just the color hex
  if (a === 1) {
    return colorHex;
  }
  
  // If alpha is not 1, add the alpha channel
  const alphaHex = Math.round(a * 255).toString(16).padStart(2, '0');
  const result = `${colorHex}${alphaHex}`;
  console.log(`[rgbaToHex] RGBA(${r}, ${g}, ${b}, ${a}) -> ${result} (alpha: ${a} -> ${alphaHex})`);
  return result;
}

export function normalizeHex(hex: string): string {
  // Remove # if present
  const cleanHex = hex.startsWith('#') ? hex.substring(1) : hex;
  
  // If it's 3 characters, expand it
  if (cleanHex.length === 3) {
    const expanded = cleanHex.split('').map(char => char + char).join('');
    return `#${expanded.toUpperCase()}`;
  }
  
  // If it's 6 characters, just add # and uppercase
  if (cleanHex.length === 6) {
    return `#${cleanHex.toUpperCase()}`;
  }
  
  // If it's 8 characters, convert alpha to percentage
  if (cleanHex.length === 8) {
    const colorPart = cleanHex.substring(0, 6);
    const alphaPart = cleanHex.substring(6, 8);
    const alphaValue = parseInt(alphaPart, 16);
    const alphaPercentage = Math.round((alphaValue / 255) * 100);
    return `#${colorPart.toUpperCase()} ${alphaPercentage}%`;
  }
  
  // For any other length, return as is with #
  return `#${cleanHex.toUpperCase()}`;
}

// Contrast calculation utilities
export function getContrastRatio(rgb1: { r: number, g: number, b: number }, rgb2: { r: number, g: number, b: number }): number {
  const luminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map(v => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const lum1 = luminance(rgb1.r * 255, rgb1.g * 255, rgb1.b * 255) + 0.05;
  const lum2 = luminance(rgb2.r * 255, rgb2.g * 255, rgb2.b * 255) + 0.05;
  return lum1 > lum2 ? lum1 / lum2 : lum2 / lum1;
}

export function meetsAAContrast(color1: string, color2: string): boolean {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return false;
  const contrastRatio = getContrastRatio(rgb1, rgb2);
  return contrastRatio >= 4.5;
}

// Color mixing utilities
export function mixColors(color1: { r: number, g: number, b: number, a: number }, color2: { r: number, g: number, b: number, a: number }, weight: number): { r: number, g: number, b: number, a: number } {
  const w = weight * 2 - 1;
  const a = color1.a - color2.a;

  const w1 = ((w * a === -1 ? w : (w + a) / (1 + w * a)) + 1) / 2;
  const w2 = 1 - w1;

  return {
    r: color1.r * w1 + color2.r * w2,
    g: color1.g * w1 + color2.g * w2,
    b: color1.b * w1 + color2.b * w2,
    a: color1.a * weight + color2.a * (1 - weight)
  };
}

// Version control utilities
export async function getNextVersionNumber(): Promise<string> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let hasExistingCollections = false;
  let maxVersion = "1.0";

  collections.forEach(collection => {
    if (collection.name.startsWith('SCS')) { // Fixed: was 'CCS', now 'SCS'
      hasExistingCollections = true;
      try {
        const versionMatch = collection.name.match(/\d+\.\d+$/);
        if (versionMatch) {
          const version = versionMatch[0];
          const [currentMajor, currentMinor] = version.split('.').map(Number);
          const [maxMajor, maxMinor] = maxVersion.split('.').map(Number);
          
          if (currentMajor > maxMajor || 
             (currentMajor === maxMajor && currentMinor >= maxMinor)) {
            maxVersion = version;
          }
        }
      } catch (error) {
        console.error('Error parsing version number:', error);
      }
    }
  });

  if (!hasExistingCollections) {
    return "1.0";
  }

  const [major, minor] = maxVersion.split('.').map(Number);
  if (minor >= 9) {
    return `${major + 1}.0`;
  }
  return `${major}.${minor + 1}`;
}

// Font utilities
export function getFontDisplayName(fontFamily: string): string {
  switch (fontFamily) {
    case "inter": return "Inter";
    case "gtStandard": return "GT Standard";
    case "sfPro": return "SF Pro";
    case "sfRounded": return "SF Pro Rounded";
    case "apercuPro": return "Apercu Pro";
    default: return "Inter";
  }
}

export function getFontFamilyName(fontFamily: string): string {
  switch (fontFamily) {
    case "inter": return "Inter";
    case "gtStandard": return "GT Standard";
    case "sfPro": return "SF Pro";
    case "sfRounded": return "SF Pro Rounded";
    case "apercuPro": return "Apercu Pro Var";
    default: return "Inter";
  }
}
