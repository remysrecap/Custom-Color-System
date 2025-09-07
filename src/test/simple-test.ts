// Simple test runner that works with our current setup
import { hexToRgb, getContrastRatio, normalizeHex } from '../core/utils';
import { PluginStateManager } from '../core/state';

// Simple test function
function test(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`❌ ${name}: ${errorMessage}`);
    return false;
  }
}

// Simple expect function
function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected}, got ${actual}`);
      }
    },
    toEqual(expected: any) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null, got ${actual}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error(`Expected defined value, got undefined`);
      }
    },
    toBeCloseTo(expected: number, precision: number = 2) {
      const diff = Math.abs(actual - expected);
      const threshold = Math.pow(10, -precision);
      if (diff >= threshold) {
        throw new Error(`Expected ${actual} to be close to ${expected} (precision: ${precision})`);
      }
    }
  };
}

// Run tests
console.log('🧪 Running simple tests...\n');

let passed = 0;
let failed = 0;

// Test hexToRgb
if (test('hexToRgb converts valid hex to RGB', () => {
  const result = hexToRgb('#FF0000');
  expect(result).toEqual({ r: 1, g: 0, b: 0, a: 1 });
})) passed++; else failed++;

if (test('hexToRgb handles 3-character hex', () => {
  const result = hexToRgb('#F00');
  expect(result).toEqual({ r: 1, g: 0, b: 0, a: 1 });
})) passed++; else failed++;

if (test('hexToRgb returns null for invalid hex', () => {
  const result = hexToRgb('invalid');
  expect(result).toBeNull();
})) passed++; else failed++;

// Test normalizeHex
if (test('normalizeHex expands 3-char hex', () => {
  const result = normalizeHex('#FFF');
  expect(result).toBe('#FFFFFF');
})) passed++; else failed++;

// Test getContrastRatio
if (test('getContrastRatio calculates correctly for black and white', () => {
  const white = { r: 1, g: 1, b: 1 };
  const black = { r: 0, g: 0, b: 0 };
  const ratio = getContrastRatio(white, black);
  expect(ratio).toBeCloseTo(21, 1);
})) passed++; else failed++;

// Test PluginStateManager
if (test('PluginStateManager initializes with default state', () => {
  const state = new PluginStateManager();
  const currentState = state.getState();
  expect(currentState.config.versionNumber).toBe('1.0');
  expect(currentState.runtime.errors).toEqual([]);
})) passed++; else failed++;

if (test('PluginStateManager updates config correctly', () => {
  const state = new PluginStateManager();
  state.updateConfig({ versionNumber: '2.0' });
  const currentState = state.getState();
  expect(currentState.config.versionNumber).toBe('2.0');
})) passed++; else failed++;

if (test('PluginStateManager adds errors correctly', () => {
  const state = new PluginStateManager();
  state.addError('Test error');
  const currentState = state.getState();
  expect(currentState.runtime.errors).toEqual(['Test error']);
})) passed++; else failed++;

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed!');
  process.exit(0);
} else {
  console.log('💥 Some tests failed!');
  process.exit(1);
}
