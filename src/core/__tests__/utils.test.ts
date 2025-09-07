// Tests for core utility functions
import { hexToRgb, getContrastRatio, normalizeHex, rgbToHex, rgbaToHex, meetsAAContrast, mixColors } from '../utils';
import { test, expect } from '../../test/test-runner';

// Color conversion tests
test('hexToRgb converts valid hex to RGB', () => {
  const result = hexToRgb('#FF0000');
  expect(result).toEqual({ r: 1, g: 0, b: 0, a: 1 });
});

test('hexToRgb handles 3-character hex', () => {
  const result = hexToRgb('#F00');
  expect(result).toEqual({ r: 1, g: 0, b: 0, a: 1 });
});

test('hexToRgb handles hex without #', () => {
  const result = hexToRgb('FF0000');
  expect(result).toEqual({ r: 1, g: 0, b: 0, a: 1 });
});

test('hexToRgb returns null for invalid hex', () => {
  const result = hexToRgb('invalid');
  expect(result).toBeNull();
});

test('hexToRgb handles alpha channel', () => {
  const result = hexToRgb('#FF000080');
  expect(result).toEqual({ r: 1, g: 0, b: 0, a: 0.5 });
});

// RGB to hex tests
test('rgbToHex converts RGB to hex', () => {
  const result = rgbToHex(1, 0, 0);
  expect(result).toBe('#FF0000');
});

test('rgbToHex handles 3-character hex expansion', () => {
  const result = rgbToHex(1, 1, 1);
  expect(result).toBe('#FFFFFF');
});

// RGBA to hex tests
test('rgbaToHex converts RGBA to hex without alpha', () => {
  const result = rgbaToHex(1, 0, 0, 1);
  expect(result).toBe('#FF0000');
});

test('rgbaToHex converts RGBA to hex with alpha', () => {
  const result = rgbaToHex(1, 0, 0, 0.5);
  expect(result).toBe('#FF000080');
});

// Normalize hex tests
test('normalizeHex expands 3-char hex', () => {
  const result = normalizeHex('#FFF');
  expect(result).toBe('#FFFFFF');
});

test('normalizeHex handles 6-char hex', () => {
  const result = normalizeHex('#FF0000');
  expect(result).toBe('#FF0000');
});

test('normalizeHex handles hex without #', () => {
  const result = normalizeHex('FF0000');
  expect(result).toBe('#FF0000');
});

test('normalizeHex handles 8-char hex with alpha', () => {
  const result = normalizeHex('#FF000080');
  expect(result).toBe('#FF0000 50%');
});

// Contrast ratio tests
test('getContrastRatio calculates correctly for black and white', () => {
  const white = { r: 1, g: 1, b: 1 };
  const black = { r: 0, g: 0, b: 0 };
  const ratio = getContrastRatio(white, black);
  expect(ratio).toBeCloseTo(21, 1);
});

test('getContrastRatio calculates correctly for same colors', () => {
  const color = { r: 0.5, g: 0.5, b: 0.5 };
  const ratio = getContrastRatio(color, color);
  expect(ratio).toBeCloseTo(1, 2);
});

// AA contrast tests
test('meetsAAContrast returns true for high contrast', () => {
  const result = meetsAAContrast('#000000', '#FFFFFF');
  expect(result).toBe(true);
});

test('meetsAAContrast returns false for low contrast', () => {
  const result = meetsAAContrast('#CCCCCC', '#DDDDDD');
  expect(result).toBe(false);
});

test('meetsAAContrast returns false for invalid colors', () => {
  const result = meetsAAContrast('invalid', '#FFFFFF');
  expect(result).toBe(false);
});

// Color mixing tests
test('mixColors mixes two colors correctly', () => {
  const color1 = { r: 1, g: 0, b: 0, a: 1 };
  const color2 = { r: 0, g: 0, b: 1, a: 1 };
  const result = mixColors(color1, color2, 0.5);
  expect(result.r).toBeCloseTo(0.5, 2);
  expect(result.b).toBeCloseTo(0.5, 2);
});

test('mixColors handles alpha channel', () => {
  const color1 = { r: 1, g: 0, b: 0, a: 1 };
  const color2 = { r: 0, g: 0, b: 1, a: 0.5 };
  const result = mixColors(color1, color2, 0.5);
  expect(result.a).toBeCloseTo(0.75, 2);
});
