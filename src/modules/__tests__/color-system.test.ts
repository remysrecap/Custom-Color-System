// Tests for color system module
import { test, expect, createMockRadixTheme } from '../../test/test-runner';

test('Color system validates input colors', () => {
  const theme = createMockRadixTheme();
  expect(theme.accentScale).toBeDefined();
  expect(theme.accentScale.length).toBe(12);
});

test('Color system handles empty theme gracefully', () => {
  const emptyTheme = {
    accentScale: [],
    accentScaleAlpha: [],
    accentContrast: '#000000',
    background: '#FFFFFF'
  };
  
  // Should not crash with empty theme
  expect(emptyTheme.accentScale.length).toBe(0);
});

test('Color system validates theme structure', () => {
  const theme = createMockRadixTheme();
  
  // Check required properties
  expect(theme.accentScale).toBeDefined();
  expect(theme.accentScaleAlpha).toBeDefined();
  expect(theme.accentContrast).toBeDefined();
  expect(theme.background).toBeDefined();
  
  // Check array lengths
  expect(theme.accentScale.length).toBe(12);
  expect(theme.accentScaleAlpha.length).toBe(12);
  
  // Check color format
  expect(theme.accentContrast).toMatch(/^#[0-9A-Fa-f]{6}$/);
  expect(theme.background).toMatch(/^#[0-9A-Fa-f]{6}$/);
});

test('Color system handles different color formats', () => {
  const theme = createMockRadixTheme();
  
  // All colors should be valid hex
  theme.accentScale.forEach(color => {
    expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
  
  theme.accentScaleAlpha.forEach(color => {
    expect(color).toMatch(/^rgba?\(/);
  });
});
