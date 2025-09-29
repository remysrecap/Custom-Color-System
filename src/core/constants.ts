import { FontMode } from './types';

// ===============================================
// Core Constants
// ===============================================

// Font mode configurations
export const FONT_MODES = {
  inter: {
    family: "Inter",
    displayName: "Inter",
    fallback: "Inter"
  },
  gtStandard: {
    family: "GT Standard",
    displayName: "GT Standard (M Standard)",
    fallback: "Inter"
  },
  sfPro: {
    family: "SF Pro",
    displayName: "SF Pro",
    fallback: "Inter"
  },
  sfRounded: {
    family: "SF Pro Rounded",
    displayName: "SF Pro Rounded",
    fallback: "Inter"
  },
  apercuPro: {
    family: "Apercu Pro Var",
    displayName: "Apercu Pro Var",
    fallback: "Inter"
  }
} as const;

// Typography scale constants
export const TYPOGRAPHY_SCALE = {
  display56: {
    fontSize: 56,
    lineHeight: 64,
    letterSpacing: -0.02,
    fontWeight: 700,
    fontStyle: "normal"
  },
  display52: {
    fontSize: 52,
    lineHeight: 60,
    letterSpacing: -0.02,
    fontWeight: 700,
    fontStyle: "normal"
  },
  headline34: {
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.01,
    fontWeight: 600,
    fontStyle: "normal"
  },
  headline26: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.01,
    fontWeight: 600,
    fontStyle: "normal"
  },
  headline22: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: 600,
    fontStyle: "normal"
  },
  body18: {
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: 400,
    fontStyle: "normal"
  },
  body16: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    fontWeight: 400,
    fontStyle: "normal"
  },
  body14: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: 400,
    fontStyle: "normal"
  },
  body12: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    fontWeight: 400,
    fontStyle: "normal"
  },
  label18: {
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: 500,
    fontStyle: "normal"
  },
  label16: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    fontWeight: 500,
    fontStyle: "normal"
  },
  label14: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: 500,
    fontStyle: "normal"
  },
  overline14: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.05,
    fontWeight: 500,
    fontStyle: "normal"
  },
  overline12: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.05,
    fontWeight: 500,
    fontStyle: "normal"
  },
  overline10: {
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.05,
    fontWeight: 500,
    fontStyle: "normal"
  }
} as const;

// Plugin configuration constants
export const PLUGIN_CONFIG = {
  UI_WIDTH: 320,
  UI_HEIGHT: 420,
  TEST_COLLECTION_NAME: "__test_collection",
  TEST_MODE_NAME: "__test_mode"
} as const;

// Color system constants
export const COLOR_SYSTEM = {
  PRIMITIVE_SCALES: [
    "gray", "mauve", "slate", "sage", "olive", "sand", "tomato", "red", 
    "ruby", "crimson", "pink", "plum", "purple", "violet", "iris", "indigo", 
    "blue", "cyan", "teal", "jade", "green", "grass", "brown", "orange", 
    "amber", "yellow", "lime", "mint", "sky"
  ],
  SEMANTIC_COLORS: [
    "background", "foreground", "card", "cardForeground", "popover", 
    "popoverForeground", "primary", "primaryForeground", "secondary", 
    "secondaryForeground", "muted", "mutedForeground", "accent", 
    "accentForeground", "destructive", "destructiveForeground", "border", 
    "input", "ring", "chart1", "chart2", "chart3", "chart4", "chart5"
  ]
} as const;

// Error messages
export const ERROR_MESSAGES = {
  FONT_LOAD_FAILED: "Failed to load font",
  VARIABLE_CREATION_FAILED: "Failed to create variable",
  COLLECTION_CREATION_FAILED: "Failed to create variable collection",
  INVALID_COLOR: "Invalid color value",
  MISSING_REQUIRED_PARAM: "Missing required parameter",
  FIGMA_API_ERROR: "Figma API error"
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  PALETTE_GENERATED: "Color palette generated successfully",
  FONT_SYSTEM_CREATED: "Font system created successfully",
  VARIABLES_CREATED: "Variables created successfully",
  DEMO_COMPONENTS_CREATED: "Demo components created successfully"
} as const;
