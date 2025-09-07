// Test utilities and helpers
export function createMockState() {
  return {
    config: {
      versionNumber: '1.0',
      supportsMultipleModes: true,
      isClosing: false
    },
    options: {
      hexColor: '#3B82F6',
      neutral: '#6B7280',
      success: '#10B981',
      error: '#EF4444',
      appearance: 'light' as const,
      includePrimitives: true,
      exportDemo: false,
      exportDocumentation: false,
      fontFamily: 'none'
    },
    runtime: {
      collections: {},
      errors: [],
      warnings: []
    }
  };
}

export function createMockRadixTheme() {
  return {
    accentScale: [
      '#FFFFFF', '#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1',
      '#94A3B8', '#64748B', '#475569', '#334155', '#1E293B',
      '#0F172A', '#020617'
    ],
    accentScaleAlpha: [
      'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.6)',
      'rgba(255,255,255,0.4)', 'rgba(255,255,255,0.2)',
      'rgba(255,255,255,0.1)', 'rgba(0,0,0,0.1)',
      'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.4)',
      'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)',
      'rgba(0,0,0,0.9)', 'rgba(0,0,0,1)'
    ],
    accentContrast: '#FFFFFF',
    background: '#FFFFFF'
  };
}

export function createMockVariableCollection() {
  return {
    id: 'test-collection-id',
    name: 'SCS Primitive 1.0',
    variableIds: [],
    modes: [
      { modeId: 'light-mode', name: 'Light' }
    ]
  };
}

export function createMockVariable() {
  return {
    id: 'test-variable-id',
    name: 'Brand Scale/1',
    setValueForMode: jest.fn()
  };
}

// Test data constants
export const TEST_COLORS = {
  brand: '#3B82F6',
  neutral: '#6B7280',
  success: '#10B981',
  error: '#EF4444'
};

export const TEST_HEX_VALUES = {
  valid: ['#FF0000', '#00FF00', '#0000FF', '#FFFFFF', '#000000'],
  invalid: ['invalid', '#GGGGGG', 'not-a-color', ''],
  threeChar: ['#F00', '#0F0', '#00F', '#FFF', '#000']
};
