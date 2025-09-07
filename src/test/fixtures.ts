// Test fixtures and mock data
export const MOCK_RADIX_THEMES = {
  light: {
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
  },
  dark: {
    accentScale: [
      '#020617', '#0F172A', '#1E293B', '#334155', '#475569',
      '#64748B', '#94A3B8', '#CBD5E1', '#E2E8F0', '#F1F5F9',
      '#F8FAFC', '#FFFFFF'
    ],
    accentScaleAlpha: [
      'rgba(0,0,0,0.8)', 'rgba(0,0,0,0.6)',
      'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)',
      'rgba(0,0,0,0.1)', 'rgba(255,255,255,0.1)',
      'rgba(255,255,255,0.2)', 'rgba(255,255,255,0.4)',
      'rgba(255,255,255,0.6)', 'rgba(255,255,255,0.8)',
      'rgba(255,255,255,0.9)', 'rgba(255,255,255,1)'
    ],
    accentContrast: '#000000',
    background: '#1C1C1C'
  }
};

export const MOCK_TYPOGRAPHY_SCALE = {
  display56: {
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -0.5,
    fontWeight: 700,
    fontStyle: 'Bold'
  },
  display52: {
    fontSize: 52,
    lineHeight: 60,
    letterSpacing: -0.5,
    fontWeight: 700,
    fontStyle: 'Bold'
  },
  headline34: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.3,
    fontWeight: 600,
    fontStyle: 'Semi Bold'
  },
  headline26: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.2,
    fontWeight: 600,
    fontStyle: 'Semi Bold'
  },
  headline22: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.1,
    fontWeight: 600,
    fontStyle: 'Semi Bold'
  },
  body18: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
    fontWeight: 400,
    fontStyle: 'Regular'
  },
  body16: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: 400,
    fontStyle: 'Regular'
  },
  body14: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
    fontWeight: 400,
    fontStyle: 'Regular'
  },
  body12: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    fontWeight: 400,
    fontStyle: 'Regular'
  },
  label18: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0,
    fontWeight: 600,
    fontStyle: 'Semi Bold'
  },
  label16: {
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: 600,
    fontStyle: 'Semi Bold'
  },
  label14: {
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0,
    fontWeight: 600,
    fontStyle: 'Semi Bold'
  },
  overline14: {
    fontSize: 14,
    lineHeight: 16,
    letterSpacing: 0,
    fontWeight: 500,
    fontStyle: 'Medium'
  },
  overline12: {
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0,
    fontWeight: 500,
    fontStyle: 'Medium'
  },
  overline10: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0,
    fontWeight: 500,
    fontStyle: 'Medium'
  }
};

export const MOCK_SPACING_TOKENS = {
  general: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 88, 96],
  kerning: [-0.5, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.5]
};

export const MOCK_FONT_MODES = {
  inter: {
    family: 'Inter',
    displayName: 'Inter',
    fallback: 'Inter'
  },
  gtStandard: {
    family: 'GT Standard',
    displayName: 'GT Standard (M Standard)',
    fallback: 'Inter'
  },
  sfPro: {
    family: 'SF Pro',
    displayName: 'SF Pro',
    fallback: 'Inter'
  },
  sfRounded: {
    family: 'SF Pro Rounded',
    displayName: 'SF Pro Rounded',
    fallback: 'Inter'
  },
  apercuPro: {
    family: 'Apercu Pro Var',
    displayName: 'Apercu Pro Var',
    fallback: 'Inter'
  }
};
