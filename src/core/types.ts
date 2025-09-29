/// <reference types="@figma/plugin-typings" />

// ===============================================
// Core Type Definitions
// ===============================================

// Interface for Radix color theme output
export interface RadixTheme {
  accentScale: string[];
  accentScaleAlpha: string[];
  accentContrast: string;
  background: string;
}

// Interface for plugin message
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
}

// Font system configuration
export interface FontSystemConfig {
  includeFontSystem: boolean;
  primaryFontFamily: string;
  secondaryFontFamily: string;
}

// Individual typography style
export interface TypographyStyle {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: number;
  fontStyle: string;
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

// Font mode configuration
export interface FontMode {
  family: string;
  displayName: string;
  fallback: string;
}

// Fallback colors interface
export interface FallbackColors {
  [key: string]: string;
}

// Button variant type
export type ButtonVariant = "primary" | "secondary" | "destructive";

// Button style interface
export interface ButtonStyle {
  [key: string]: any;
}

// Notification configuration
export type NotificationConfig = {
  type: "success" | "error" | "info";
  message: string;
  duration?: number;
};

// Supported node types for demo components
export type SupportedNode = (FrameNode | TextNode | RectangleNode | EllipseNode | PolygonNode | LineNode | VectorNode) & {
  fills?: readonly Paint[];
  strokeWeight?: number;
  strokeAlign?: "INSIDE" | "OUTSIDE" | "CENTER";
  stroke?: readonly Paint[];
};

// Documentation item interface
export interface DocumentationItem {
  name: string;
  description: string;
  usage: string;
  example?: string;
}
