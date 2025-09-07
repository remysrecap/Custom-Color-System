// Core type definitions for the Custom Color System plugin

// Figma API types
export interface RGBA {
  r: number;
  g: number;
  b: number;
  a: number;
}

// Radix color theme output
export interface RadixTheme {
  accentScale: string[];
  accentScaleAlpha: string[];
  accentContrast: string;
  background: string;
}

// Plugin message interface
export interface PluginMessage {
  type: "generate-palette" | "test-gt-standard" | "discover-gt-standard" | "update-font-mode" | "bind-font-variables";
  hexColor?: string;
  neutral?: string;
  success?: string;
  error?: string;
  appearance?: "light" | "dark" | "both";
  includePrimitives?: boolean;
  exportDemo?: boolean;
  exportDocumentation?: boolean;
  includeFontSystem?: boolean;
  fontMode?: "inter" | "gtStandard" | "sfPro" | "sfRounded" | "apercuPro";
  fontFamily?: "none" | "inter" | "gtStandard" | "sfPro" | "sfRounded" | "apercuPro";
}

// Font system configuration
export interface FontSystemConfig {
  includeFontSystem: boolean;
  primaryFontFamily: string;
  secondaryFontFamily: string;
}

// Typography scale definition
export interface TypographyScale {
  // Display fonts - Large titles with heavy weight
  display56: TypographyStyle;
  display52: TypographyStyle;
  
  // Headline fonts - Section titles with medium-heavy weight
  headline34: TypographyStyle;
  headline26: TypographyStyle;
  headline22: TypographyStyle;
  
  // Body fonts - Regular text with normal weight
  body18: TypographyStyle;
  body16: TypographyStyle;
  body14: TypographyStyle;
  body12: TypographyStyle;
  
  // Label fonts - Same sizes as body but heavier weight for buttons/interactions
  label18: TypographyStyle;
  label16: TypographyStyle;
  label14: TypographyStyle;
  
  // Overline fonts - All caps for badges and overlines
  overline14: TypographyStyle;
  overline12: TypographyStyle;
  overline10: TypographyStyle;
}

// Individual typography style
export interface TypographyStyle {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: number;
  fontStyle: string;
}

// Font mode definition
export interface FontMode {
  family: string;
  displayName: string;
  fallback: string;
}

// Plugin state interface
export interface PluginState {
  // Core configuration
  config: {
    versionNumber: string;
    supportsMultipleModes: boolean;
    isClosing: boolean;
  };
  
  // Generation options
  options: {
    hexColor: string;
    neutral: string;
    success: string;
    error: string;
    appearance: "light" | "dark" | "both";
    includePrimitives: boolean;
    exportDemo: boolean;
    exportDocumentation: boolean;
    fontFamily: string;
  };
  
  // Runtime state
  runtime: {
    collections: {
      primitive?: any; // VariableCollection
      semantic?: any; // VariableCollection
      spacing?: any; // VariableCollection
      font?: any; // VariableCollection
    };
    errors: string[];
    warnings: string[];
  };
}

// Documentation item interface
export interface DocumentationItem {
  name: string;
  variablePath: string;
  primitiveSource: string;
  category: string;
}
