import { FontMode, TypographyStyle } from './types';
import { FONT_MODES, ERROR_MESSAGES } from './constants';
import { log } from './logger';

// ===============================================
// Core Utility Functions
// ===============================================

/**
 * Logs an error with stack trace
 */
export function logError(message: string, error?: Error): void {
  log.error(message, 'utils', 'logError');
  if (error) {
    log.error('Stack trace:', 'utils', 'logError', { stack: error.stack });
  }
}

/**
 * Validates if a color hex value is valid
 */
export function isValidHexColor(hex: string): boolean {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexPattern.test(hex);
}

/**
 * Converts hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!isValidHexColor(hex)) {
    return null;
  }
  
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Converts RGB values to hex color
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Loads a font with fallback handling
 */
export async function loadFontWithFallback(fontFamily: string, style: string): Promise<FontName> {
  try {
    // Try to load the primary font
    const fontName: FontName = { family: fontFamily, style: style };
    await figma.loadFontAsync(fontName);
    return fontName;
  } catch (error) {
    logError(`Failed to load font ${fontFamily} ${style}`, error as Error);
    
    // Try fallback fonts
    const fallbackFonts = [
      { family: "Inter", style: "Regular" },
      { family: "Arial", style: "Regular" },
      { family: "Helvetica", style: "Regular" },
      { family: "sans-serif", style: "Regular" }
    ];
    
    for (const fallback of fallbackFonts) {
      try {
        await figma.loadFontAsync(fallback);
        log(`Using fallback font: ${fallback.family} ${fallback.style}`, 'warning');
        return fallback;
      } catch (fallbackError) {
        continue;
      }
    }
    
    throw new Error(`${ERROR_MESSAGES.FONT_LOAD_FAILED}: ${fontFamily} ${style}`);
  }
}

/**
 * Gets the current font mode
 */
export function getCurrentFontMode(): FontMode {
  return currentFontMode;
}

/**
 * Sets the current font mode
 */
export function setCurrentFontMode(mode: keyof typeof FONT_MODES): void {
  currentFontMode = FONT_MODES[mode];
  log(`Font mode switched to: ${currentFontMode.displayName}`, 'info');
}

/**
 * Creates a safe variable name by removing invalid characters
 */
export function sanitizeVariableName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remove invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_+/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase();
}

/**
 * Generates a unique variable name by appending a number if needed
 */
export function generateUniqueVariableName(baseName: string, existingNames: Set<string>): string {
  let name = sanitizeVariableName(baseName);
  let counter = 1;
  
  while (existingNames.has(name)) {
    name = `${sanitizeVariableName(baseName)}_${counter}`;
    counter++;
  }
  
  return name;
}

/**
 * Validates required parameters for a function
 */
export function validateRequiredParams(params: Record<string, any>, required: string[]): void {
  const missing = required.filter(param => params[param] === undefined || params[param] === null);
  if (missing.length > 0) {
    throw new Error(`${ERROR_MESSAGES.MISSING_REQUIRED_PARAM}: ${missing.join(', ')}`);
  }
}

/**
 * Creates a debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Creates a throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Retries a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      log(`Retry attempt ${attempt + 1} after ${delay}ms`, 'warning');
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Global state for current font mode
let currentFontMode: FontMode = FONT_MODES.inter;
