// ===============================================
// Part 1: Initial Setup and Type Definitions
// ===============================================

/// <reference types="@figma/plugin-typings" />
import { generateRadixColors } from "radix-theme-generator";

// Show UI and set initial size
figma.showUI(__html__);
figma.ui.resize(320, 420);

// Global map to store hex values for variables per mode
const variableHexValues = new Map<string, Map<string, string>>();

// Run capability check at plugin start
const testCollection = figma.variables.createVariableCollection("__test_collection");
let supportsMultipleModes = false;

try {
  testCollection.addMode("__test_mode");
  supportsMultipleModes = true;
  console.log("✓ Multi-mode support: Enabled");
} catch (error) {
  supportsMultipleModes = false;
  console.log("✗ Multi-mode support: Disabled");
} finally {
  testCollection.remove();
  console.log(`→ UI will ${supportsMultipleModes ? 'show' : 'hide'} Light & Dark option`);
}

// Send capability info to UI
figma.ui.postMessage({ 
  type: 'capability-check',
  supportsMultipleModes 
});

// Interface for Radix color theme output
interface RadixTheme {
  accentScale: string[];
  accentScaleAlpha: string[];
  accentContrast: string;
  background: string;
}

// Interface for plugin message
interface PluginMessage {
  type: string;
  hexColor: string;
  neutral: string;
  success: string;  
  error: string;
  appearance: "light" | "dark" | "both";
  includePrimitives: boolean;
  exportDemo: boolean;
  exportDocumentation: boolean;
  includeFontSystem: boolean;  // Add font system option
}

// ===============================================
// Font System Interfaces and Types
// ===============================================

// Font system configuration
interface FontSystemConfig {
  includeFontSystem: boolean;
  primaryFontFamily: string;
  secondaryFontFamily: string;
}

// Typography scale definition
interface TypographyScale {
  hero: TypographyStyle;
  header: TypographyStyle;
  section: TypographyStyle;
  subtitle: TypographyStyle;
  bodyBtn: TypographyStyle;
  bodyBtnSm: TypographyStyle;
  caption: TypographyStyle;
  badge: TypographyStyle;
}

// Individual typography style
interface TypographyStyle {
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  fontWeight: number;
  fontStyle: string;
}

// Font family definitions
const FONT_FAMILIES = {
  primary: "GT Standard"
} as const;

// Spacing token definitions
const SPACING_TOKENS = {
  // General spacing: 2-96 with increments of 2→4→8
  general: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 88, 96],
  
  // Kerning: Fewer, more practical values
  kerning: [-1.5, -1.25, -1, -0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75, 1, 1.25, 1.5],
  
  // Weight: 100-800 in 100 increments
  weight: [100, 200, 300, 400, 500, 600, 700, 800]
};

// Typography scale definitions using spacing tokens
const TYPOGRAPHY_SCALE: TypographyScale = {
  hero: {
    fontSize: 32, // General/32
    lineHeight: 36, // General/36
    letterSpacing: -1.5, // Kerning/[15]
    fontWeight: 700, // Weight/700
    fontStyle: "M Bd"
  },
  header: {
    fontSize: 20, // General/20
    lineHeight: 24, // General/24
    letterSpacing: -1, // Kerning/[1]
    fontWeight: 600, // Weight/600
    fontStyle: "M Smbd"
  },
  section: {
    fontSize: 18, // General/18
    lineHeight: 20, // General/20 (closest available)
    letterSpacing: -1.25, // Kerning/[125]
    fontWeight: 600, // Weight/600
    fontStyle: "M Smbd"
  },
  subtitle: {
    fontSize: 16, // General/16
    lineHeight: 20, // General/20
    letterSpacing: -1, // Kerning/[1]
    fontWeight: 600, // Weight/600
    fontStyle: "M Smbd"
  },
  bodyBtn: {
    fontSize: 14, // General/14
    lineHeight: 20, // General/20 (closest available)
    letterSpacing: -0.5, // Kerning/[5]
    fontWeight: 600, // Weight/600
    fontStyle: "M Smbd"
  },
  bodyBtnSm: {
    fontSize: 12, // General/12
    lineHeight: 18, // General/18
    letterSpacing: -0.5, // Kerning/[5]
    fontWeight: 600, // Weight/600
    fontStyle: "M Smbd"
  },
  caption: {
    fontSize: 10, // General/10 (closest available)
    lineHeight: 16, // General/16
    letterSpacing: -0.5, // Kerning/[5]
    fontWeight: 600, // Weight/600
    fontStyle: "M Smbd"
  },
  badge: {
    fontSize: 10, // General/10
    lineHeight: 12, // General/12 (closest available)
    letterSpacing: -0.25, // Kerning/[25]
    fontWeight: 600, // Weight/600
    fontStyle: "M Smbd"
  }
};

// Font system utility functions
async function createFontVariable(
  collection: VariableCollection,
  modeId: string,
  name: string,
  value: number
): Promise<Variable | null> {
  console.log(`Creating font variable: ${name} with value: ${value}`);
  const existingVariable = await findExistingVariable(collection, name);

  if (existingVariable) {
    const variable = await figma.variables.getVariableByIdAsync(existingVariable);
    if (variable) {
      await variable.setValueForMode(modeId, value);
      console.log(`Updated font variable ${name} with value: ${value}`);
    }
    return variable;
  }

  const variable = figma.variables.createVariable(name, collection, "FLOAT");
  await variable.setValueForMode(modeId, value);
  console.log(`Created font variable ${name} with value: ${value}`);
  return variable;
}

// Function to create string variables (for font families)
async function createStringVariable(
  collection: VariableCollection,
  modeId: string,
  name: string,
  value: string
): Promise<Variable | null> {
  console.log(`Creating string variable: ${name} with value: ${value}`);
  const existingVariable = await findExistingVariable(collection, name);

  if (existingVariable) {
    const variable = await figma.variables.getVariableByIdAsync(existingVariable);
    if (variable) {
      await variable.setValueForMode(modeId, value);
      console.log(`Updated string variable ${name} with value: ${value}`);
    }
    return variable;
  }

  const variable = figma.variables.createVariable(name, collection, "STRING");
  await variable.setValueForMode(modeId, value);
  console.log(`Created string variable ${name} with value: ${value}`);
  return variable;
}

// Function to create variable references
async function createFontVariableReference(
  collection: VariableCollection,
  modeId: string,
  name: string,
  referencedVariableId: string
): Promise<Variable | null> {
  console.log(`Creating variable reference: ${name} referencing: ${referencedVariableId}`);
  const existingVariable = await findExistingVariable(collection, name);

  if (existingVariable) {
    const variable = await figma.variables.getVariableByIdAsync(existingVariable);
    if (variable) {
      await variable.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: referencedVariableId });
      console.log(`Updated variable reference ${name}`);
    }
    return variable;
  }

  const variable = figma.variables.createVariable(name, collection, "FLOAT");
  await variable.setValueForMode(modeId, { type: "VARIABLE_ALIAS", id: referencedVariableId });
  console.log(`Created variable reference ${name}`);
  return variable;
}

// Function to create spacing collection
async function createSpacingCollection(versionNumber: string): Promise<VariableCollection> {
  console.log(`Creating spacing collection with version: ${versionNumber}`);
  const collection = figma.variables.createVariableCollection(`CCS Spacing ${versionNumber}`);
  
  // Use single mode (no light/dark)
  const mode = collection.modes[0];
  collection.renameMode(mode.modeId, "Default");
  
  // Create General spacing tokens
  for (const value of SPACING_TOKENS.general) {
    await createFontVariable(collection, mode.modeId, `General/${value}`, value);
  }
  
  // Create Kerning tokens
  for (const value of SPACING_TOKENS.kerning) {
    // Convert negative values and decimals to valid variable names using brackets
    const name = value < 0 ? `Kerning/[${Math.abs(value).toString().replace('.', '')}]` : 
                 `Kerning/${value.toString().replace('.', '')}`;
    await createFontVariable(collection, mode.modeId, name, value);
  }
  
  // Create Weight tokens
  for (const value of SPACING_TOKENS.weight) {
    await createFontVariable(collection, mode.modeId, `Weight/${value}`, value);
  }
  
  console.log(`Spacing collection created successfully`);
  return collection;
}

// Function to create Figma text styles that bind to typography variables
async function createTextStyles(versionNumber: string): Promise<void> {
  console.log(`Creating Figma text styles with variable bindings`);
  
  // Get the font system collection to bind variables
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const fontCollection = collections.find(c => c.name === `CCS Font System ${versionNumber}`);
  
  if (!fontCollection) {
    console.log("Font collection not found, cannot bind variables to text styles");
    return;
  }
  
  // Get all variables from the font collection
  const allVariables = await Promise.all(
    fontCollection.variableIds.map(id => figma.variables.getVariableByIdAsync(id))
  );
  
  // Find the font family variable
  const fontFamilyVar = allVariables.find(v => v && v.name === "Font Family/Primary");
  if (!fontFamilyVar) {
    console.log("Font family variable not found");
    return;
  }
  
  // Get the font family value from the variable
  const fontFamilyValue = fontFamilyVar.valuesByMode[fontCollection.modes[0].modeId];
  if (typeof fontFamilyValue !== 'string') {
    console.log("Font family variable does not contain a string value");
    return;
  }
  
  console.log(`Using font family from variable: ${fontFamilyValue}`);
  
  // Use the font family from the variable (no need to load it since we're binding the variable)
  const fontFamily = fontFamilyValue;
  
  // Create text styles with variable bindings
  for (const [scaleName, style] of Object.entries(TYPOGRAPHY_SCALE)) {
    const styleName = `Typography/${scaleName}`;
    
    // Determine font style based on weight
    let currentFontStyle = "Regular";
    if (style.fontWeight >= 700) {
      currentFontStyle = "Bold";
    } else if (style.fontWeight >= 600) {
      currentFontStyle = "Semi Bold";
    } else if (style.fontWeight >= 500) {
      currentFontStyle = "Medium";
    }
    
    // Find the typography variables for this scale
    const fontSizeVar = allVariables.find(v => v && v.name === `${styleName}/font-size`);
    const lineHeightVar = allVariables.find(v => v && v.name === `${styleName}/line-height`);
    const letterSpacingVar = allVariables.find(v => v && v.name === `${styleName}/letter-spacing`);
    const fontWeightVar = allVariables.find(v => v && v.name === `${styleName}/font-weight`);
    
    // Create the text style first
    const textStyle = figma.createTextStyle();
    textStyle.name = styleName;
    
    // Bind variables using setBoundVariable method - no direct property assignments
    if (fontFamilyVar) {
      textStyle.setBoundVariable("fontFamily", fontFamilyVar);
      console.log(`Bound fontFamily to variable: ${fontFamilyVar.name}`);
    }
    
    if (fontSizeVar) {
      textStyle.setBoundVariable("fontSize", fontSizeVar);
      console.log(`Bound fontSize to variable: ${fontSizeVar.name}`);
    }
    
    if (lineHeightVar) {
      textStyle.setBoundVariable("lineHeight", lineHeightVar);
      console.log(`Bound lineHeight to variable: ${lineHeightVar.name}`);
    }
    
    if (letterSpacingVar) {
      textStyle.setBoundVariable("letterSpacing", letterSpacingVar);
      console.log(`Bound letterSpacing to variable: ${letterSpacingVar.name}`);
    }
    
    if (fontWeightVar) {
      textStyle.setBoundVariable("fontWeight", fontWeightVar);
      console.log(`Bound fontWeight to variable: ${fontWeightVar.name}`);
    }
    
    console.log(`Text style ${styleName} bound to variables successfully`);
    
    console.log(`Created text style: ${styleName} with ${fontFamily} ${currentFontStyle}`);
  }
  
  console.log(`Text styles created successfully with variable bindings`);
}

// Helper function to find spacing variable by value
async function findSpacingVariableByValue(collectionName: string, groupName: string, value: number): Promise<string | null> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const spacingCollection = collections.find(c => c.name === collectionName);
  
  if (!spacingCollection) return null;
  
  const variables = await Promise.all(
    spacingCollection.variableIds.map(id => figma.variables.getVariableByIdAsync(id))
  );
  
  for (const variable of variables) {
    if (variable && variable.name.startsWith(`${groupName}/`)) {
      const modeValue = variable.valuesByMode[spacingCollection.modes[0].modeId];
      if (typeof modeValue === 'number' && Math.abs(modeValue - value) < 0.01) {
        return variable.id;
      }
    }
  }
  
  return null;
}

// Font system creation function
async function createFontSystem(versionNumber: string): Promise<void> {
  console.log(`Creating font system with version: ${versionNumber}`);
  
  // Create font system collection with single mode
  const fontCollection = figma.variables.createVariableCollection(`CCS Font System ${versionNumber}`);
  const mode = fontCollection.modes[0];
  fontCollection.renameMode(mode.modeId, "Default");
  
  // Create font family variables as strings
  await createStringVariable(fontCollection, mode.modeId, "Font Family/Primary", "GT Standard");
  
  // Create typography scale variables that reference spacing tokens
  for (const [scaleName, style] of Object.entries(TYPOGRAPHY_SCALE)) {
    const baseName = `Typography/${scaleName}`;
    
    // Font size - reference General spacing token
    const fontSizeVarId = await findSpacingVariableByValue(`CCS Spacing ${versionNumber}`, "General", style.fontSize);
    if (fontSizeVarId) {
      await createFontVariableReference(fontCollection, mode.modeId, `${baseName}/font-size`, fontSizeVarId);
    } else {
      await createFontVariable(fontCollection, mode.modeId, `${baseName}/font-size`, style.fontSize);
    }
    
    // Line height - reference General spacing token
    const lineHeightVarId = await findSpacingVariableByValue(`CCS Spacing ${versionNumber}`, "General", style.lineHeight);
    if (lineHeightVarId) {
      await createFontVariableReference(fontCollection, mode.modeId, `${baseName}/line-height`, lineHeightVarId);
    } else {
      await createFontVariable(fontCollection, mode.modeId, `${baseName}/line-height`, style.lineHeight);
    }
    
    // Letter spacing - reference Kerning token
    const letterSpacingVarId = await findSpacingVariableByValue(`CCS Spacing ${versionNumber}`, "Kerning", style.letterSpacing);
    if (letterSpacingVarId) {
      await createFontVariableReference(fontCollection, mode.modeId, `${baseName}/letter-spacing`, letterSpacingVarId);
    } else {
      await createFontVariable(fontCollection, mode.modeId, `${baseName}/letter-spacing`, style.letterSpacing);
    }
    
    // Font weight - reference Weight token
    const fontWeightVarId = await findSpacingVariableByValue(`CCS Spacing ${versionNumber}`, "Weight", style.fontWeight);
    if (fontWeightVarId) {
      await createFontVariableReference(fontCollection, mode.modeId, `${baseName}/font-weight`, fontWeightVarId);
    } else {
      await createFontVariable(fontCollection, mode.modeId, `${baseName}/font-weight`, style.fontWeight);
    }
  }
  
  console.log(`Font system variables created successfully`);
}

// Utility function to convert hex colors to RGB format for Figma
function hexToRgb(hex: string): RGBA | null {
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

// Version control system for collection naming
async function getNextVersionNumber(): Promise<string> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  let hasExistingCollections = false;
  let maxVersion = "1.0";

  collections.forEach(collection => {
    if (collection.name.startsWith('CCS')) {
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

// Utility function to calculate contrast ratio
function getContrastRatio(rgb1: { r: number, g: number, b: number }, rgb2: { r: number, g: number, b: number }): number {
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

// Utility function to check if a color meets AA contrast standards
function meetsAAContrast(color1: string, color2: string): boolean {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return false;
  const contrastRatio = getContrastRatio(rgb1, rgb2);
  return contrastRatio >= 4.5;
}

// Utility function to mix two colors
function mixColors(color1: { r: number, g: number, b: number, a: number }, color2: { r: number, g: number, b: number, a: number }, weight: number): { r: number, g: number, b: number, a: number } {
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

// Utility function to find existing variable by name
async function findExistingVariable(collection: VariableCollection, name: string): Promise<string | null> {
  for (const id of collection.variableIds) {
    const var_ = await figma.variables.getVariableByIdAsync(id);
    if (var_?.name === name) {
      return id;
    }
  }
  return null;
}

// Utility function to convert RGB to hex
function rgbToHex(r: number, g: number, b: number): string {
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

// Utility function to convert RGBA to hex (including alpha)
function rgbaToHex(r: number, g: number, b: number, a: number): string {
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

// Utility function to ensure any hex value is always 6 characters and handle alpha
function normalizeHex(hex: string): string {
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





// Utility function to get hex value from a color variable
async function getHexValueFromVariable(collection: VariableCollection, variablePath: string): Promise<string> {
  try {
    // First, check if we have a stored hex value for this variable
    if (variableHexValues.has(variablePath)) {
      const modeMap = variableHexValues.get(variablePath)!;
      // For now, return the first available hex value (we'll update this to show all modes)
      const firstHex = modeMap.values().next().value;
      if (firstHex) {
        return firstHex;
      }
    }
    
    // If not found, try to find the variable and resolve its value
    const variable = await findVariable(collection, variablePath);
    if (variable) {
      // Try to get the actual resolved value from the variable
      try {
        const resolvedValue = variable.valuesByMode;
        const modeIds = Object.keys(resolvedValue);
        if (modeIds.length > 0) {
          const firstModeId = modeIds[0];
          const value = resolvedValue[firstModeId];
          
          if (value && typeof value === 'object' && 'type' in value) {
            if (value.type === 'VARIABLE_ALIAS') {
              // This is a semantic variable that references a primitive
              // Try to find the referenced primitive and get its hex value
              const referencedVar = await figma.variables.getVariableByIdAsync(value.id);
              if (referencedVar) {
                // Check if we have the hex value for the referenced primitive
                if (variableHexValues.has(referencedVar.name)) {
                  const modeMap = variableHexValues.get(referencedVar.name)!;
                  const firstHex = modeMap.values().next().value;
                  if (firstHex) {
                    return firstHex;
                  }
                }
              }
            } else if (value.type === 'SOLID') {
              // This is a direct color value
              const color = (value as any).color;
              const alpha = (value as any).opacity !== undefined ? (value as any).opacity : 1;
              return rgbaToHex(color.r, color.g, color.b, alpha);
            }
          }
        }
      } catch (resolveError) {
        console.error(`Error resolving variable value for ${variablePath}:`, resolveError);
      }
    }
  } catch (error) {
    console.error(`Error getting hex value for ${variablePath}:`, error);
  }
  return "#000000"; // Fallback
}





// Utility function to create or update a color variable with a specific value
async function createOrUpdateColorVariableWithValue(collection: VariableCollection, modeId: string, name: string, value: RGBA): Promise<Variable | null> {
  console.log(`Attempting to create or update color variable: ${name} with value: ${JSON.stringify(value)}`);
  const existingVariable = await findExistingVariable(collection, name);

  if (existingVariable) {
    const variable = await figma.variables.getVariableByIdAsync(existingVariable);
    if (variable) {
      await variable.setValueForMode(modeId, value);
      console.log(`Updated variable ${name} with value: ${JSON.stringify(value)}`);
      // Convert RGBA to hex and store for later retrieval
      const hexValue = rgbaToHex(value.r, value.g, value.b, value.a);
      if (!variableHexValues.has(name)) {
        variableHexValues.set(name, new Map());
      }
      // Store the original hex value (including alpha if present)
      const finalHex = hexValue.toUpperCase();
      variableHexValues.get(name)!.set(modeId, finalHex);
      console.log(`[createOrUpdateColorVariableWithValue] Stored original hex for ${name} (${modeId}): ${hexValue}`);
    }
    return variable;
  }

  const variable = figma.variables.createVariable(name, collection, "COLOR");
  await variable.setValueForMode(modeId, value);
  console.log(`Created variable ${name} with value: ${JSON.stringify(value)}`);
  // Convert RGBA to hex and store for later retrieval
  const hexValue = rgbaToHex(value.r, value.g, value.b, value.a);
  if (!variableHexValues.has(name)) {
    variableHexValues.set(name, new Map());
  }
  // Store the original hex value (including alpha if present)
  const finalHex = hexValue.toUpperCase();
  variableHexValues.get(name)!.set(modeId, finalHex);
  console.log(`[createOrUpdateColorVariableWithValue] Stored original hex for ${name} (${modeId}): ${hexValue}`);
  return variable;
}

// Utility function to create or update a color variable
async function createOrUpdateColorVariable(collection: VariableCollection, modeId: string, name: string, colorHex: string): Promise<Variable | null> {
  console.log(`Attempting to create or update color variable: ${name} with color: ${colorHex}`);
  const existingVariable = await findExistingVariable(collection, name);

  const rgb = hexToRgb(colorHex);
  if (!rgb) {
    console.error(`Failed to convert hex to RGB for color: ${colorHex}`);
    return null;
  }

  if (existingVariable) {
    const variable = await figma.variables.getVariableByIdAsync(existingVariable);
    if (variable) {
      await variable.setValueForMode(modeId, rgb);
      console.log(`Updated variable ${name} with value: ${JSON.stringify(rgb)}`);
      // Store the normalized hex value for later retrieval
      if (!variableHexValues.has(name)) {
        variableHexValues.set(name, new Map());
      }
      // Store the original hex value (including alpha if present)
      const finalHex = colorHex.toUpperCase();
      variableHexValues.get(name)!.set(modeId, finalHex);
      console.log(`[createOrUpdateColorVariable] Stored original hex for ${name} (${modeId}): ${colorHex}`);
    }
    return variable;
  }

  const variable = figma.variables.createVariable(name, collection, "COLOR");
  await variable.setValueForMode(modeId, rgb);
  console.log(`Created variable ${name} with value: ${JSON.stringify(rgb)}`);
  // Store the normalized hex value for later retrieval
  if (!variableHexValues.has(name)) {
    variableHexValues.set(name, new Map());
  }
  // Store the original hex value (including alpha if present)
  variableHexValues.get(name)!.set(modeId, colorHex.toUpperCase());
  return variable;
}

// Utility function to create or update a hardcoded color variable
async function createOrUpdateHardcodedVar(collection: VariableCollection, modeId: string, name: string, value: RGBA): Promise<Variable | null> {
  console.log(`Attempting to create or update hardcoded variable: ${name} with value: ${JSON.stringify(value)}`);
  const existingVariable = await findExistingVariable(collection, name);

  if (existingVariable) {
    const variable = await figma.variables.getVariableByIdAsync(existingVariable);
    if (variable) {
      await variable.setValueForMode(modeId, value);
      console.log(`Updated variable ${name} with value: ${JSON.stringify(value)}`);
      // Convert RGBA to hex and store for later retrieval
      const hexValue = rgbaToHex(value.r, value.g, value.b, value.a);
      if (!variableHexValues.has(name)) {
        variableHexValues.set(name, new Map());
      }
      // Store the original hex value (including alpha if present)
      const finalHex = hexValue.toUpperCase();
      variableHexValues.get(name)!.set(modeId, finalHex);
      console.log(`[createOrUpdateHardcodedVar] Stored original hex for ${name} (${modeId}): ${hexValue}`);
    }
    return variable;
  }

  const variable = figma.variables.createVariable(name, collection, "COLOR");
  console.log(`[createOrUpdateHardcodedVar] Setting value for ${name}:`, JSON.stringify(value));
  console.log(`[createOrUpdateHardcodedVar] Value type:`, typeof value, 'r:', typeof value.r, 'g:', typeof value.g, 'b:', typeof value.b, 'a:', typeof value.a);
  await variable.setValueForMode(modeId, value);
  console.log(`Created variable ${name} with value: ${JSON.stringify(value)}`);
  console.log(`[createOrUpdateHardcodedVar] Variable created with ID: ${variable.id}`);
  // Convert RGBA to hex and store for later retrieval
  const hexValue = rgbaToHex(value.r, value.g, value.b, value.a);
      if (!variableHexValues.has(name)) {
        variableHexValues.set(name, new Map());
      }
      variableHexValues.get(name)!.set(modeId, hexValue);
  return variable;
}

// Utility function to create or update a color variable for contrast purposes
async function createOrUpdateContrastColorVariable(collection: VariableCollection, modeId: string, name: string, colorHex: string, backgroundColor: string): Promise<Variable | null> {
  console.log(`Attempting to create or update contrast color variable: ${name} with color: ${colorHex}`);
  let rgb = hexToRgb(colorHex);
  if (!rgb) {
    console.error(`Failed to convert hex to RGB for color: ${colorHex}`);
    return null;
  }

// In createOrUpdateContrastColorVariable:

if (!meetsAAContrast(colorHex, backgroundColor)) {
  const accent9 = hexToRgb(colorHex);
  const accent12 = hexToRgb("#000000"); // Use black as a fallback for mixing
  if (accent9 && accent12) {
      let mixRatio = 0.9;  // Start at 90%
      const isDarkMode = backgroundColor.toLowerCase() === '#1c1c1c';
      let attempts = 0;
      const maxAttempts = 25;
      
      while (attempts < maxAttempts) {
          if (isDarkMode) {
              mixRatio -= 0.1;  // For dark mode, we decrease the mix ratio
          } else {
              mixRatio -= 0.1;  // For light mode, we also decrease
          }
          
          const mixedColor = mixColors(accent9, accent12, mixRatio);
          const mixedHex = normalizeHex(`#${Math.round(mixedColor.r * 255).toString(16).padStart(2, '0')}${
              Math.round(mixedColor.g * 255).toString(16).padStart(2, '0')}${
              Math.round(mixedColor.b * 255).toString(16).padStart(2, '0')}`);
          
          if (meetsAAContrast(mixedHex, backgroundColor)) {
              rgb = mixedColor;
              break;
          }
          
          attempts++;
      }
  }
}

  const existingVariable = await findExistingVariable(collection, name);
  if (existingVariable) {
    const variable = await figma.variables.getVariableByIdAsync(existingVariable);
    if (variable) {
      await variable.setValueForMode(modeId, rgb);
      console.log(`Updated variable ${name} with value: ${JSON.stringify(rgb)}`);
      // Convert the final RGBA value to hex and store for later retrieval
      const finalHex = rgbaToHex(rgb.r, rgb.g, rgb.b, rgb.a);
      if (!variableHexValues.has(name)) {
        variableHexValues.set(name, new Map());
      }
      // Store the original hex value (including alpha if present)
      const finalNormalizedHex = finalHex.toUpperCase();
      variableHexValues.get(name)!.set(modeId, finalNormalizedHex);
      console.log(`[createOrUpdateContrastColorVariable] Stored original hex for ${name} (${modeId}): ${finalHex}`);
    }
    return variable;
  }

  const variable = figma.variables.createVariable(name, collection, "COLOR");
  await variable.setValueForMode(modeId, rgb);
  console.log(`Created variable ${name} with value: ${JSON.stringify(rgb)}`);
  // Convert the final RGBA value to hex and store for later retrieval
  const finalHex = rgbaToHex(rgb.r, rgb.g, rgb.b, rgb.a);
  if (!variableHexValues.has(name)) {
    variableHexValues.set(name, new Map());
  }
  // Store the original hex value (including alpha if present)
  const finalNormalizedHex = finalHex.toUpperCase();
  variableHexValues.get(name)!.set(modeId, finalNormalizedHex);
  console.log(`[createOrUpdateContrastColorVariable] Stored original hex for ${name} (${modeId}): ${finalHex}`);
  return variable;
}

// ===============================================
// Part 2: Main Message Handler and Color Generation
// ===============================================

// Track plugin closing state
let isClosing = false;

figma.ui.onmessage = async (msg: PluginMessage) => {
  if (msg.type === "generate-palette") {
    const { hexColor, neutral, success, error, appearance, includePrimitives, exportDemo, exportDocumentation: shouldExportDocumentation, includeFontSystem } = msg;
    try {
      // Clear the hex values map at the start of each run to ensure fresh values
      variableHexValues.clear();
      console.log("Cleared hex values map for fresh start");
      
      console.log("Generating palette with message:", msg);
      const versionNumber = await getNextVersionNumber();
      console.log("Next version number:", versionNumber);
      
      const lightBrandTheme: RadixTheme = generateRadixColors({
        appearance: "light",
        accent: hexColor,
        gray: "#CCCCCC",
        background: "#FFFFFF"
      });

      const lightNeutralTheme: RadixTheme = generateRadixColors({
        appearance: "light",
        accent: neutral,
        gray: "#CCCCCC",
        background: "#FFFFFF"
      });

      const lightErrorTheme: RadixTheme = generateRadixColors({
        appearance: "light",
        accent: error,
        gray: "#CCCCCC",
        background: "#FFFFFF"
      });

      const lightSuccessTheme: RadixTheme = generateRadixColors({
        appearance: "light",
        accent: success,
        gray: "#CCCCCC",
        background: "#FFFFFF"
      });
      
      // Log the actual values from Radix theme to debug hex value issues
      console.log("🔍 Radix Theme Debug - Light Success:");
      console.log("  accentContrast:", lightSuccessTheme.accentContrast);
      console.log("  accentScale[8]:", lightSuccessTheme.accentScale[8]);
      console.log("  accentScale[9]:", lightSuccessTheme.accentScale[9]);
      console.log("  accentScale[10]:", lightSuccessTheme.accentScale[10]);
      console.log("  accentScale[11]:", lightSuccessTheme.accentScale[11]);

      const darkBrandTheme: RadixTheme = generateRadixColors({
        appearance: "dark",
        accent: hexColor,
        gray: "#555555",
        background: "#1C1C1C" // Updated from #161616
      });

      const darkNeutralTheme: RadixTheme = generateRadixColors({
        appearance: "dark",
        accent: neutral,
        gray: "#555555",
        background: "#1C1C1C" // Updated from #161616
      });

      const darkErrorTheme: RadixTheme = generateRadixColors({
        appearance: "dark",
        accent: error,
        gray: "#555555",
        background: "#1C1C1C" // Updated from #161616
      });

      const darkSuccessTheme: RadixTheme = generateRadixColors({
        appearance: "dark",
        accent: success,
        gray: "#555555",
        background: "#1C1C1C" // Updated from #161616
      });
      
      // Log the actual values from Radix theme to debug hex value issues
      console.log("🔍 Radix Theme Debug - Dark Success:");
      console.log("  accentContrast:", darkSuccessTheme.accentContrast);
      console.log("  accentScale[8]:", darkSuccessTheme.accentScale[8]);
      console.log("  accentScale[9]:", darkSuccessTheme.accentScale[9]);
      console.log("  accentScale[10]:", darkSuccessTheme.accentScale[10]);
      console.log("  accentScale[11]:", darkSuccessTheme.accentScale[11]);

      let primitiveCollection: VariableCollection | null = null;
      let collection: VariableCollection | null = null;
      let semanticCollection: VariableCollection | null = null;

      if (includePrimitives) {
        primitiveCollection = figma.variables.createVariableCollection(`CCS Primitives ${versionNumber}`);
        semanticCollection = figma.variables.createVariableCollection(`CCS Semantics ${versionNumber}`);

        if (appearance === "light" || appearance === "both") {
          const lightMode = primitiveCollection.modes[0];
          primitiveCollection.renameMode(lightMode.modeId, "Light");
          await createPrimitiveVariables(primitiveCollection, lightMode.modeId, lightBrandTheme, 
            lightNeutralTheme, lightSuccessTheme, lightErrorTheme);
        }

        if (appearance === "dark" || appearance === "both") {
          const darkModeId = appearance === "both" ? 
            primitiveCollection.addMode("Dark") : primitiveCollection.modes[0].modeId;
          await createPrimitiveVariables(primitiveCollection, darkModeId, darkBrandTheme, 
            darkNeutralTheme, darkSuccessTheme, darkErrorTheme);
        }

        await createSemanticVariables(semanticCollection, primitiveCollection, appearance);

        // Create font system if enabled
        if (includeFontSystem) {
          await createSpacingCollection(versionNumber);
          await createFontSystem(versionNumber);
          // Create text styles after all variables are set up
          await createTextStyles(versionNumber);
        }

        // Create demo components if enabled
        if (exportDemo) {
          await exportDemoComponents(primitiveCollection, semanticCollection);
        }

        // Create documentation if enabled
        if (shouldExportDocumentation) {
          await exportDocumentation(primitiveCollection, semanticCollection);
        }
      } else {
        collection = figma.variables.createVariableCollection(`CCS ${versionNumber}`);
        
        if (appearance === "light" || appearance === "both") {
          const lightMode = collection.modes[0];
          collection.renameMode(lightMode.modeId, "Light");
          await createDirectVariables(collection, lightMode.modeId, lightBrandTheme, 
            lightNeutralTheme, lightSuccessTheme, lightErrorTheme);
        }

        if (appearance === "dark" || appearance === "both") {
          const darkModeId = appearance === "both" ? 
            collection.addMode("Dark") : collection.modes[0].modeId;
          await createDirectVariables(collection, darkModeId, darkBrandTheme, 
            darkNeutralTheme, darkSuccessTheme, darkErrorTheme);
        }

        // Create font system if enabled
        if (includeFontSystem) {
          await createSpacingCollection(versionNumber);
          await createFontSystem(versionNumber);
          // Create text styles after all variables are set up
          await createTextStyles(versionNumber);
        }

        // Create demo components if enabled
        if (exportDemo) {
          await exportDemoComponents(collection);
        }

        // Create documentation if enabled
        if (shouldExportDocumentation) {
          await exportDocumentation(collection);
        }
      }

      if (!isClosing) {
        const fontSystemMessage = includeFontSystem ? " with font system" : "";
        figma.notify(`Successfully created color system${fontSystemMessage} with version ${versionNumber}`);
        figma.ui.postMessage('complete');
      }
    } catch (err) {
      if (!isClosing) {
        figma.notify("Error generating variables.");
        console.error("Error generating variables:", err);
        figma.ui.postMessage('complete');
      }
    } finally {
      if (!isClosing) {
        isClosing = true;
        figma.ui.postMessage('complete');
        setTimeout(() => {
          figma.closePlugin();
        }, 100);
      }
    }
  }
};

// ===============================================
// Part 3: Primitive Variable Creation
// ===============================================

async function createPrimitiveVariables(
  collection: VariableCollection, 
  modeId: string,
  brandTheme: RadixTheme,
  neutralTheme: RadixTheme,
  successTheme: RadixTheme,
  errorTheme: RadixTheme
) {
  console.log(`Creating or updating primitive variables for mode: ${modeId}`);
  
  // Create or update brand color scales
  await Promise.all(brandTheme.accentScale.map((color, index) => 
    createOrUpdateColorVariable(collection, modeId, `Brand Scale/${index + 1}`, color)
  ));

  await Promise.all(brandTheme.accentScaleAlpha.map((color, index) => 
    createOrUpdateColorVariable(collection, modeId, `Brand Scale Alpha/${index + 1}`, color)
  ));

  await createOrUpdateColorVariable(collection, modeId, `Brand Contrast/1`, brandTheme.accentContrast);

  // Create or update neutral color scales
  await Promise.all(neutralTheme.accentScale.map((color, index) => 
    createOrUpdateColorVariable(collection, modeId, `Neutral Scale/${index + 1}`, color)
  ));

  await Promise.all(neutralTheme.accentScaleAlpha.map((color, index) => 
    createOrUpdateColorVariable(collection, modeId, `Neutral Scale Alpha/${index + 1}`, color)
  ));


  // Create or update success color scales
  await Promise.all(successTheme.accentScale.map((color, index) => 
    createOrUpdateColorVariable(collection, modeId, `Success Scale/${index + 1}`, color)
  ));

  await Promise.all(successTheme.accentScaleAlpha.map((color, index) => 
    createOrUpdateColorVariable(collection, modeId, `Success Scale Alpha/${index + 1}`, color)
  ));

  await createOrUpdateColorVariable(collection, modeId, `Success Contrast/1`, successTheme.accentContrast);

  // Create or update error color scales
  await Promise.all(errorTheme.accentScale.map((color, index) => 
    createOrUpdateColorVariable(collection, modeId, `Error Scale/${index + 1}`, color)
  ));

  await Promise.all(errorTheme.accentScaleAlpha.map((color, index) => 
    createOrUpdateColorVariable(collection, modeId, `Error Scale Alpha/${index + 1}`, color)
  ));

  await createOrUpdateColorVariable(collection, modeId, `Error Contrast/1`, errorTheme.accentContrast);

  // Create or update background variable
  const backgroundColor = brandTheme.background;
  console.log(`Setting Background/1 for mode: ${modeId} to ${backgroundColor}`);
  const backgroundVariable = await createOrUpdateColorVariable(collection, modeId, `Background/1`, backgroundColor);
  if (backgroundVariable) {
    console.log(`Background/1 variable set successfully for mode: ${modeId} with color: ${backgroundColor}`);
  } else {
    console.error(`Failed to set Background/1 variable for mode: ${modeId}`);
  }

  // Always create Accessibility/1 variable
  const brand9Color = brandTheme.accentScale[8];
  const accent9 = hexToRgb(brand9Color);
  const accent12 = hexToRgb(brandTheme.accentScale[11]);
  
  if (accent9 && accent12) {
    let finalColor: RGBA = accent9; // Initialize with accent9
    
    if (meetsAAContrast(brand9Color, backgroundColor)) {
      console.log(`Brand/9 color meets contrast requirements. Using as is.`);
    } else {
      console.log(`Brand/9 color doesn't meet contrast requirements. Attempting to adjust...`);
      const isDarkMode = backgroundColor.toLowerCase() === '#1c1c1c';
      
      // Start with mostly original color and gradually mix in more of the contrast color
      let mixRatio = isDarkMode ? 0.9 : 0.2; // Start with less mixing for light mode
      const step = isDarkMode ? -0.1 : 0.1;  // Direction of adjustment
      let attempts = 0;
      const maxAttempts = 10;
      let foundSuitableContrast = false;
      
      while (attempts < maxAttempts) {
        // In light mode, mixRatio represents how much of accent12 (black) to use
        // In dark mode, mixRatio represents how much of accent9 (original color) to use
        const mixedColor = isDarkMode ?
          mixColors(accent9, accent12, mixRatio) :    // Dark mode: mix ratio of original
          mixColors(accent9, accent12, 1 - mixRatio); // Light mode: inverse mix ratio for contrast color
        
        const mixedHex = normalizeHex(`#${Math.round(mixedColor.r * 255).toString(16).padStart(2, '0')}${
          Math.round(mixedColor.g * 255).toString(16).padStart(2, '0')}${
          Math.round(mixedColor.b * 255).toString(16).padStart(2, '0')}`);
        
        if (meetsAAContrast(mixedHex, backgroundColor)) {
          finalColor = mixedColor;
          foundSuitableContrast = true;
          console.log(`Found suitable contrast at mix ratio: ${mixRatio}`);
          break;
        }
        
        mixRatio += step;
        attempts++;
      }
      
      // If we couldn't find a good mix, use a safe fallback
      if (!foundSuitableContrast) {
        console.log(`Could not find suitable mix. Using fallback color.`);
        finalColor = isDarkMode ? 
          { r: 1, g: 1, b: 1, a: 1 } : // White for dark mode
          { r: 0, g: 0, b: 0, a: 1 };  // Black for light mode
      }
    }
    
    try {
      await createOrUpdateColorVariableWithValue(collection, modeId, "Accessibility/1", finalColor);
      console.log(`Successfully created/updated Accessibility/1 variable`);
    } catch (error) {
      console.error(`Error creating Accessibility/1 variable:`, error);
      // Create a safe fallback if the variable creation fails
      const fallbackColor = { r: 0, g: 0, b: 0, a: 1 };
      await createOrUpdateColorVariableWithValue(collection, modeId, "Accessibility/1", fallbackColor);
    }
  } else {
    console.error(`Could not process brand colors for accessibility variable`);
  }
}

// ===============================================
// Part 4: Semantic Variable Creation
// ===============================================

async function createSemanticVariables(
  semanticCollection: VariableCollection,
  primitiveCollection: VariableCollection,
  appearance: "light" | "dark" | "both"
) {
  console.log("Creating semantic variables for appearance:", appearance);
  
  const modeId = semanticCollection.modes[0].modeId;
  semanticCollection.renameMode(modeId, "Mode");

  async function createSemanticVar(semanticName: string, primitiveName: string) {
    console.log(`Creating semantic variable: ${semanticName} from primitive: ${primitiveName}`);
    const variable = figma.variables.createVariable(semanticName, semanticCollection, "COLOR");
    
    const primitiveVarId = await findExistingVariable(primitiveCollection, primitiveName);

    if (primitiveVarId) {
      await variable.setValueForMode(modeId, {
        type: "VARIABLE_ALIAS",
        id: primitiveVarId
      });
      console.log(`Semantic variable ${semanticName} created with alias to primitive ${primitiveName}`);
    } else {
      console.error(`Primitive variable not found: ${primitiveName}`);
      // If the primitive variable is not found, we'll create a hardcoded fallback
      const fallbackColor = { r: 0, g: 0, b: 0, a: 1 };
      await variable.setValueForMode(modeId, fallbackColor);
      console.log(`Created fallback for ${semanticName} due to missing primitive`);
    }
    return variable;
  }

  async function createHardcodedVar(name: string, value: RGBA) {
    console.log(`Creating hardcoded variable: ${name}`);
      const variable = figma.variables.createVariable(name, semanticCollection, "COLOR");
  console.log(`[createHardcodedVar] Setting value for ${name}:`, JSON.stringify(value));
  console.log(`[createHardcodedVar] Value type:`, typeof value, 'r:', typeof value.r, 'g:', typeof value.g, 'b:', typeof value.b, 'a:', typeof value.a);
  await variable.setValueForMode(modeId, value);
  console.log(`Hardcoded variable ${name} created`);
  
  // Verify the value was set correctly
  console.log(`[createHardcodedVar] Variable created with ID: ${variable.id}`);
    // Convert RGBA to hex and store for later retrieval
    const hexValue = rgbaToHex(value.r, value.g, value.b, value.a);
    if (!variableHexValues.has(name)) {
      variableHexValues.set(name, new Map());
    }
    // Store the original hex value (including alpha if present)
    const finalHex = hexValue.toUpperCase();
    variableHexValues.get(name)!.set(modeId, finalHex);
    console.log(`[createHardcodedVar] Stored original hex for ${name} (${modeId}): ${hexValue}`);
    return variable;
  }

  // Surface variables
  await Promise.all([
    createSemanticVar("surface/sf-neutral-primary", "Background/1"), // Updated from surface-default
    createSemanticVar("surface/sf-neutral-secondary", "Neutral Scale/2"), // Updated from surface-base-secondary
    createSemanticVar("surface/sf-brand-primary", "Brand Scale/2"), // Updated from surface-brand-default
    createSemanticVar("surface/sf-brand-primary-emphasized", "Brand Scale/3"), // Updated from surface-brand-secondary
    createSemanticVar("surface/sf-shadow", "Neutral Scale Alpha/4"),
    createHardcodedVar("surface/sf-overlay", { r: 0, g: 0, b: 0, a: 0.65 })
  ]);

  // Get accessibility variable ID with fallback to brand9
  const accessibilityVarId = await findExistingVariable(primitiveCollection, "Accessibility/1");
  const brand9VarId = await findExistingVariable(primitiveCollection, "Brand Scale/9");
  const linkVarId = accessibilityVarId || brand9VarId;

  // Text & Icon variables with enhanced fallback
  await Promise.all([
    createSemanticVar("text-icon/ti-neutral-primary", "Neutral Scale/12"),
    createSemanticVar("text-icon/ti-neutral-secondary", "Neutral Scale/11"),
    createSemanticVar("text-icon/ti-brand-primary", linkVarId ? "Accessibility/1" : "Brand Scale/9"),
    createSemanticVar("text-icon/ti-on-bg-brand-primary", "Brand Contrast/1"),
    createSemanticVar("text-icon/ti-on-bg-brand-primary-subtle", "Brand Scale/11"),
    createSemanticVar("text-icon/ti-on-bg-error", "Error Contrast/1"),
    createSemanticVar("text-icon/ti-on-bg-error-subtle", "Error Scale/11"),
    createSemanticVar("text-icon/ti-on-bg-success", "Success Contrast/1"),
    createSemanticVar("text-icon/ti-on-bg-success-subtle", "Success Scale/11"),
    createHardcodedVar("text-icon/ti-on-surface-overlay", { r: 1, g: 1, b: 1, a: 1 })
  ]);

  // Background variables
  await Promise.all([
    createSemanticVar("background/bg-brand-primary", "Brand Scale/9"),
    createSemanticVar("background/bg-brand-primary-emphasized", "Brand Scale/10"),
    createSemanticVar("background/bg-brand-primary-subtle", "Brand Scale/3"),
    createSemanticVar("background/bg-brand-primary-subtle-emphasized", "Brand Scale/4"),
    createSemanticVar("background/bg-brand-primary-overlay", "Brand Scale Alpha/6"),
    createSemanticVar("background/bg-error", "Error Scale/9"),
    createSemanticVar("background/bg-error-emphasized", "Error Scale/10"),
    createSemanticVar("background/bg-error-subtle", "Error Scale/3"),
    createSemanticVar("background/bg-error-subtle-emphasized", "Error Scale/4"),
    createSemanticVar("background/bg-success", "Success Scale/9"),
    createSemanticVar("background/bg-success-emphasized", "Success Scale/10"),
    createSemanticVar("background/bg-success-subtle", "Success Scale/3"),
    createSemanticVar("background/bg-success-subtle-emphasized", "Success Scale/4")
  ]);

  // Border variables
  await Promise.all([
    createSemanticVar("border/br-with-sf-neutral-primary", "Neutral Scale/7"), // Updated from border-with-any-surface
    createSemanticVar("border/br-with-sf-neutral-secondary", "Neutral Scale/8"), // Updated from border-with-any-surface-emphasized
    createSemanticVar("border/br-with-bg-brand-primary", "Brand Scale/11"), // Updated from border-with-bg-primary
    createSemanticVar("border/br-with-bg-brand-primary-subtle", "Brand Scale/8"), // Updated from border-with-bg-primary-subtle
    createSemanticVar("border/br-with-bg-success", "Success Scale/11"), // Updated from border-with-success
    createSemanticVar("border/br-with-bg-success-subtle", "Success Scale/8"), // Updated from border-with-success-subtle
    createSemanticVar("border/br-with-bg-error", "Error Scale/11"), // Updated from border-with-error
    createSemanticVar("border/br-with-bg-error-subtle", "Error Scale/8") // Updated from border-with-error-subtle
  ]);
}

// ===============================================
// Part 5: Direct Variables Creation
// ===============================================

async function createDirectVariables(
  collection: VariableCollection,
  modeId: string,
  brandTheme: RadixTheme,
  neutralTheme: RadixTheme,
  successTheme: RadixTheme,
  errorTheme: RadixTheme
) {
  console.log(`Creating or updating direct variables for mode: ${modeId}`);

  // Surface variables
  await Promise.all([
    createOrUpdateColorVariable(collection, modeId, "surface/sf-neutral-primary", brandTheme.background), // Updated from surface-default
    createOrUpdateColorVariable(collection, modeId, "surface/sf-neutral-secondary", neutralTheme.accentScale[1]), // Updated from surface-base-secondary
    createOrUpdateColorVariable(collection, modeId, "surface/sf-brand-primary", brandTheme.accentScale[1]), // Updated from surface-brand-default
    createOrUpdateColorVariable(collection, modeId, "surface/sf-brand-primary-emphasized", brandTheme.accentScale[2]), // Updated from surface-brand-secondary
    createOrUpdateColorVariable(collection, modeId, "surface/sf-shadow", neutralTheme.accentScaleAlpha[3])
  ]);

  // Text & Icon variables
  await Promise.all([
    createOrUpdateColorVariable(collection, modeId, "text-icon/ti-neutral-primary", neutralTheme.accentScale[11]),
    createOrUpdateColorVariable(collection, modeId, "text-icon/ti-neutral-secondary", neutralTheme.accentScale[10]),
    createOrUpdateContrastColorVariable(collection, modeId, "text-icon/ti-brand-primary", brandTheme.accentScale[8], brandTheme.background),
    createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-brand-primary", brandTheme.accentContrast),
    createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-brand-primary-subtle", brandTheme.accentScale[10]),
    createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-error", errorTheme.accentContrast),
    createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-error-subtle", errorTheme.accentScale[10]),
    createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-success", successTheme.accentContrast),
    createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-success-subtle", successTheme.accentScale[10])
  ]);

  // Background variables
  await Promise.all([
    createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary", brandTheme.accentScale[8]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-emphasized", brandTheme.accentScale[9]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-subtle", brandTheme.accentScale[2]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-subtle-emphasized", brandTheme.accentScale[3]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-overlay", brandTheme.accentScaleAlpha[5]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-error", errorTheme.accentScale[8]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-error-emphasized", errorTheme.accentScale[9]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-error-subtle", errorTheme.accentScale[2]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-error-subtle-emphasized", errorTheme.accentScale[3]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-success", successTheme.accentScale[8]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-success-emphasized", successTheme.accentScale[9]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-success-subtle", successTheme.accentScale[2]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-success-subtle-emphasized", successTheme.accentScale[3])
  ]);

  // Border variables
  await Promise.all([
    createOrUpdateColorVariable(collection, modeId, "border/br-with-sf-neutral-primary", neutralTheme.accentScale[6]), // Updated from border-with-any-surface
    createOrUpdateColorVariable(collection, modeId, "border/br-with-sf-neutral-secondary", neutralTheme.accentScale[7]), // Updated from border-with-any-surface-focus
    createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-brand-primary", brandTheme.accentScale[10]), // Updated from border-with-bg-primary
    createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-brand-primary-subtle", brandTheme.accentScale[7]), // Updated from border-with-bg-primary-subtle
    createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-success", successTheme.accentScale[10]), // Updated from border-with-success
    createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-success-subtle", successTheme.accentScale[7]), // Updated from border-with-success-subtle
    createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-error", errorTheme.accentScale[10]), // Updated from border-with-error
    createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-error-subtle", errorTheme.accentScale[7]) // Updated from border-with-error-subtle
  ]);

        // Create hardcoded variables when not using primitives
      console.log(`[createDirectVariables] Creating hardcoded variables for mode: ${modeId}`);
      await Promise.all([
        createOrUpdateHardcodedVar(collection, modeId, "surface/sf-overlay", { r: 0, g: 0, b: 0, a: 0.65 }),
        createOrUpdateHardcodedVar(collection, modeId, "text-icon/ti-on-surface-overlay", { r: 1, g: 1, b: 1, a: 1 })
      ]);
      console.log(`[createDirectVariables] Finished creating hardcoded variables`);
}

// ===============================================
// Part 6.1: Demo Components - Core Setup
// ===============================================

// Types
interface FallbackColors {
  [key: string]: { r: number; g: number; b: number };
}

type ButtonVariant = "primary" | "secondary" | "destructive";

interface ButtonStyle {
  bg: string;  // Changed from keyof typeof to string for full paths
  text: string;
}

type NotificationConfig = {
  message: string;
  bgVar: keyof typeof FALLBACK_COLORS.backgrounds;
  textVar: string;
};

type SupportedNode = (FrameNode | TextNode | RectangleNode | EllipseNode | PolygonNode | LineNode | VectorNode) & {
  setFillStyleIdAsync: (style: string) => Promise<void>;
};

// Constants
const FALLBACK_COLORS: {
  backgrounds: FallbackColors;
  text: FallbackColors;
} = {
  backgrounds: {
    'bg-brand-primary': { r: 0.1, g: 0.6, b: 1 },
    'bg-error': { r: 0.9, g: 0.3, b: 0.3 },
    'bg-success': { r: 0.3, g: 0.8, b: 0.4 },
    'bg-brand-primary-subtle': { r: 0.9, g: 0.95, b: 1 },
    'bg-error-subtle': { r: 1, g: 0.95, b: 0.95 },
    'bg-success-subtle': { r: 0.95, g: 1, b: 0.95 },
    'sf-neutral-primary': { r: 1, g: 1, b: 1 },
    'sf-neutral-secondary': { r: 0.98, g: 0.98, b: 0.98 },
    'sf-brand-primary': { r: 0.95, g: 0.95, b: 0.95 },
    'sf-brand-primary-emphasized': { r: 0.9, g: 0.9, b: 0.9 },
    'sf-shadow': { r: 0, g: 0, b: 0 },
    'sf-overlay': { r: 0, g: 0, b: 0 }
  },
  text: {
    'ti-neutral-primary': { r: 0, g: 0, b: 0 },
    'ti-neutral-secondary': { r: 0.4, g: 0.4, b: 0.4 },
    'ti-brand-primary': { r: 0.1, g: 0.6, b: 1 },
    'ti-on-bg-brand-primary': { r: 1, g: 1, b: 1 },
    'ti-on-bg-error': { r: 1, g: 1, b: 1 },
    'ti-on-bg-success': { r: 1, g: 1, b: 1 },
    'ti-on-bg-brand-primary-subtle': { r: 0.1, g: 0.6, b: 1 },
    'ti-on-bg-error-subtle': { r: 0.8, g: 0.2, b: 0.2 },
    'ti-on-bg-success-subtle': { r: 0.2, g: 0.8, b: 0.2 },
    'ti-on-surface-overlay': { r: 1, g: 1, b: 1 }
  }
};

const BUTTON_STYLES: Record<ButtonVariant, ButtonStyle> = {
  primary: {
    bg: 'background/bg-brand-primary',
    text: 'text-icon/ti-on-bg-brand-primary'
  },
  secondary: {
    bg: 'background/bg-brand-primary-subtle',
    text: 'text-icon/ti-on-bg-brand-primary-subtle'
  },
  destructive: {
    bg: 'background/bg-error',
    text: 'text-icon/ti-on-bg-error'
  }
} as const;

// Utility Functions
async function findVariable(collection: VariableCollection, name: string): Promise<Variable | null> {
  console.log(`Looking for variable: ${name}`);
  console.log('Available variable IDs:', collection.variableIds);
  
  for (const id of collection.variableIds) {
    const variable = await figma.variables.getVariableByIdAsync(id);
    console.log(`Checking variable:`, variable);
    if (variable?.name === name) {
      console.log('Found matching variable:', variable);
      return variable;
    }
  }
  console.log('No matching variable found');
  return null;
}

async function applyVariableWithFallback(
  node: SupportedNode,
  collection: VariableCollection,
  variablePath: string,
  fallbackType: keyof typeof FALLBACK_COLORS
): Promise<void> {
  console.log(`Attempting to apply variable: ${variablePath}`);
  
  const variable = await findVariable(collection, variablePath);
  console.log('Found variable:', variable);
  
  if (variable) {
    try {
      // Check if this is a border variable
      if (variablePath.startsWith('border/')) {
        console.log('Applying as stroke');
        // Apply as stroke
        node.strokes = [{
          type: 'SOLID',
          color: { r: 0, g: 0, b: 0 },
          boundVariables: {
            "color": {
              type: "VARIABLE_ALIAS",
              id: variable.id
            }
          }
        }];
      } else {
        console.log('Applying as fill');
        // Apply as fill
        node.fills = [{
          type: 'SOLID',
          color: { r: 0, g: 0, b: 0 },
          boundVariables: {
            "color": {
              type: "VARIABLE_ALIAS",
              id: variable.id
            }
          }
        }];
      }
      console.log('Successfully bound variable');
    } catch (error) {
      console.error(`Error binding variable ${variablePath}:`, error);
      const pathParts = variablePath.split('/');
      const variableName = pathParts[pathParts.length - 1];
      const fallbackColor = FALLBACK_COLORS[fallbackType][variableName] || 
        (fallbackType === 'text' ? { r: 0, g: 0, b: 0 } : { r: 0.98, g: 0.98, b: 0.98 });
      
      if (variablePath.startsWith('border/')) {
        node.strokes = [{
          type: 'SOLID',
          color: fallbackColor
        }];
      } else {
        node.fills = [{
          type: 'SOLID',
          color: fallbackColor
        }];
      }
    }
  } else {
    console.log('No variable found, using fallback');
    const pathParts = variablePath.split('/');
    const variableName = pathParts[pathParts.length - 1];
    const fallbackColor = FALLBACK_COLORS[fallbackType][variableName] || 
      (fallbackType === 'text' ? { r: 0, g: 0, b: 0 } : { r: 0.98, g: 0.98, b: 0.98 });
    
    if (variablePath.startsWith('border/')) {
      node.strokes = [{
        type: 'SOLID',
        color: fallbackColor
      }];
    } else {
      node.fills = [{
        type: 'SOLID',
        color: fallbackColor
      }];
    }
  }
}


// Main Entry Point
async function exportDemoComponents(collection: VariableCollection, semanticCollection: VariableCollection | null = null) {
  try {
    // Load required fonts
    await Promise.all([
      figma.loadFontAsync({ family: "Inter", style: "Regular" }),
      figma.loadFontAsync({ family: "Inter", style: "Medium" })
    ]);
    
    // Create main frame
    const frame = figma.createFrame();
    frame.name = "CCS Demo Components";
    frame.layoutMode = "HORIZONTAL";
    frame.primaryAxisSizingMode = "FIXED"; // Set to FIXED
    frame.counterAxisSizingMode = "FIXED"; // Set to FIXED
    frame.resize(1560, 520); // Set width and height to 520
    frame.cornerRadius = 24;
    frame.itemSpacing = 0; // Remove spacing between items
    frame.paddingLeft = 0; // Remove left padding
    frame.paddingRight = 0; // Remove right padding
    frame.paddingTop = 0; // Remove top padding
    frame.paddingBottom = 0; // Remove bottom padding
    frame.layoutAlign = "CENTER"; // Center the frame
    frame.counterAxisAlignItems = "CENTER"; // Center children
    
    // Position frame on canvas (above the documentation frame)
    frame.x = 100;
    frame.y = 100;

    // Create three main columns
      const leftColumn = await createFixedWidthFrame(await createFeaturedCard(semanticCollection || collection), "surface/sf-neutral-primary", semanticCollection || collection);
  const middleColumn = await createFixedWidthFrame(await createProductList(semanticCollection || collection), "surface/sf-neutral-secondary", semanticCollection || collection);
  const rightColumn = await createFixedWidthFrame(await createNotifications(semanticCollection || collection), "surface/sf-neutral-primary", semanticCollection || collection);

    // Add columns to frame
    frame.appendChild(leftColumn);
    frame.appendChild(middleColumn);
    frame.appendChild(rightColumn);

    return frame;
  } catch (error) {
    console.error('Error in exportDemoComponents:', error);
    figma.notify('Error creating demo components');
    throw error;
  }
}

// Utility function to create a fixed width frame
async function createFixedWidthFrame(content: FrameNode, backgroundColor: string, collection: VariableCollection): Promise<FrameNode> {
  const wrapper = figma.createFrame();
  wrapper.layoutMode = "VERTICAL";
  wrapper.primaryAxisSizingMode = "FIXED";
  wrapper.counterAxisSizingMode = "FIXED";
  wrapper.resize(520, 520); // Set width and height to 520
  wrapper.paddingLeft = 80; // Add left padding
  wrapper.paddingRight = 80; // Add right padding
  wrapper.paddingTop = 80; // Add top padding
  wrapper.paddingBottom = 80; // Add bottom padding
  wrapper.layoutAlign = "STRETCH"; // Stretch to fill parent
  wrapper.primaryAxisAlignItems = "CENTER"; // Center the first child
  wrapper.counterAxisAlignItems = "CENTER"; // Center the first child horizontally

  // Set background color with error handling
  await applyVariableWithFallback(wrapper, collection, backgroundColor, 'backgrounds');

  // Ensure content hugs its contents
  content.layoutMode = "VERTICAL";
  content.primaryAxisSizingMode = "AUTO";
  content.counterAxisSizingMode = "AUTO";
  content.layoutAlign = "CENTER";
  content.counterAxisAlignItems = "CENTER";

  wrapper.appendChild(content);
  return wrapper;
}

// ===============================================
// Part 6.2: Demo Components - Basic Components
// ===============================================

// Button Component
async function createButton(
  collection: VariableCollection,
  text: string,
  _bgVarName: string,
  _textVarName: string
): Promise<FrameNode> {
  const button = figma.createFrame();
  button.name = `${text} Button`;
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisSizingMode = "AUTO"; // Hug contents horizontally
  button.counterAxisSizingMode = "AUTO"; // Hug contents vertically
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";
  button.paddingLeft = 10; // Adjust horizontal padding to 10
  button.paddingRight = 10; // Adjust horizontal padding to 10
  button.paddingTop = 8;
  button.paddingBottom = 8;
  button.cornerRadius = 6;
  button.strokeWeight = 0.5; // Add stroke weight

  // Set background color with error handling
  await applyVariableWithFallback(
    button,
    collection,
    "surface/sf-neutral-primary", // Set background color to surface/sf-primary
    'backgrounds'
  );

  // Set stroke color with error handling
  await applyVariableWithFallback(
    button,
    collection,
    "border/br-with-sf-neutral-primary", // Set stroke color to border/br-with-sf
    'backgrounds'
  );

  const buttonText = figma.createText();
  buttonText.characters = text;
  buttonText.fontSize = 14;
  buttonText.fontName = { family: "Inter", style: "Medium" };
  buttonText.layoutAlign = "CENTER";
  buttonText.textAlignHorizontal = "CENTER";

  // Set text color to "text-icon/ti-brand-primary"
  await applyVariableWithFallback(
    buttonText,
    collection,
    "text-icon/ti-brand-primary",
    'text'
  );

  button.appendChild(buttonText);
  return button;
}

// Featured Card Component
async function createFeaturedCard(collection: VariableCollection): Promise<FrameNode> {
  const card = figma.createFrame();
  card.name = "Featured Product";
  card.layoutMode = "VERTICAL";
  card.primaryAxisSizingMode = "AUTO"; // Ensure it hugs contents vertically
  card.counterAxisSizingMode = "AUTO"; // Change to AUTO
  card.itemSpacing = 16;
  card.paddingLeft = 16;
  card.paddingRight = 16;
  card.paddingTop = 16;
  card.paddingBottom = 16;
  card.cornerRadius = 8;
  card.strokeWeight = 0.5;
  card.layoutAlign = "STRETCH"; // Add this line
  await applyVariableWithFallback(
    card,
    collection,
    "border/br-with-sf-neutral-primary",
    'backgrounds'
  );

  // Set surface color with error handling
  await applyVariableWithFallback(
    card,
    collection,
    "surface/sf-brand-primary",
    'backgrounds'
  );

  // Preview area
  const preview = figma.createFrame();
  preview.name = "Preview";
  preview.resize(336, 180);
  preview.cornerRadius = 4;
  preview.layoutAlign = "STRETCH";

  // Set fill color with error handling
  await applyVariableWithFallback(
    preview,
    collection,
    "surface/sf-brand-primary-emphasized",
    'backgrounds'
  );

  // Content container
  const content = figma.createFrame();
  content.name = "Content";
  content.layoutMode = "VERTICAL";
  content.layoutAlign = "STRETCH";
  content.itemSpacing = 8;
  content.fills = [];

  const title = figma.createText();
  title.name = "Title";
  title.characters = "Product Title";
  title.fontSize = 18;
  title.fontName = { family: "Inter", style: "Medium" };
  title.layoutAlign = "STRETCH"; // Fill horizontally
  title.textAutoResize = "NONE"; // Disable auto-resizing
  title.lineHeight = { value: 22, unit: "PIXELS" }; // Set line height
  title.textTruncation = 'ENDING'; // Enable truncation
  title.resizeWithoutConstraints(336, 22); // Set fixed dimensions

  // Set text color with error handling
  await applyVariableWithFallback(
    title,
    collection,
    "text-icon/ti-neutral-primary",
    'text'
  );

  const description = figma.createText();
  description.name = "Description";
  description.characters = "Lorem ipsum dolor sit amet, elit lacus consectetur adipiscing. Integer euismod sodales nam tomer lima consequat.";
  description.fontSize = 14;
  description.fontName = { family: "Inter", style: "Regular" };
  description.layoutAlign = "STRETCH"; // Fill horizontally
  description.textAutoResize = "NONE"; // Disable auto-resize
  description.lineHeight = { value: 20, unit: "PIXELS" }; // Set line height
  description.textTruncation = 'ENDING'; // Enable truncation with ellipsis
  description.resizeWithoutConstraints(336, 40); // Set fixed height

  // Set secondary text color with error handling
  await applyVariableWithFallback(
    description,
    collection,
    "text-icon/ti-neutral-secondary",
    'text'
  );

  content.appendChild(title);
  content.appendChild(description);

  const button = figma.createFrame();
  button.name = "Primary Button";
  button.layoutMode = "HORIZONTAL";
  button.primaryAxisSizingMode = "FIXED";
  button.counterAxisSizingMode = "FIXED";
  button.primaryAxisAlignItems = "CENTER";
  button.counterAxisAlignItems = "CENTER";
  button.paddingLeft = 16;
  button.paddingRight = 16;
  button.paddingTop = 8;
  button.paddingBottom = 8;
  button.cornerRadius = 6;
  button.resize(336, 40);

  // Set background color with error handling
  await applyVariableWithFallback(
    button,
    collection,
    BUTTON_STYLES.primary.bg,
    'backgrounds'
  );

  const buttonText = figma.createText();
  buttonText.characters = "Primary";
  buttonText.fontSize = 14;
  buttonText.fontName = { family: "Inter", style: "Medium" };
  buttonText.layoutAlign = "CENTER";
  buttonText.textAlignHorizontal = "CENTER";

  // Set text color with error handling
  await applyVariableWithFallback(
    buttonText,
    collection,
    BUTTON_STYLES.primary.text,
    'text'
  );

  button.appendChild(buttonText);
  button.layoutAlign = "STRETCH";

  card.appendChild(preview);
  card.appendChild(content);
  card.appendChild(button);

  return card;
}

// ===============================================
// Part 6.3: Demo Components - Complex Components
// ===============================================

// Product List Components
async function createProductList(collection: VariableCollection): Promise<FrameNode> {
  const list = figma.createFrame();
  list.name = "Product List";
  list.layoutMode = "VERTICAL";
  list.primaryAxisSizingMode = "AUTO"; // Change to AUTO
  list.counterAxisSizingMode = "AUTO";
  list.itemSpacing = 8;
  list.cornerRadius = 8; // Round the corners to 8
  list.strokeWeight = 0.5; // Set border/stroke weight to 0.5
  list.layoutAlign = "STRETCH"; // Add this line
  list.paddingLeft = 16; // Add left padding
  list.paddingRight = 16; // Add right padding
  list.paddingTop = 4; 
  list.paddingBottom = 4;
  list.resize(520, list.height); // Set width to 520

  // Set background color with error handling
  await applyVariableWithFallback(
    list,
    collection,
    "surface/sf-neutral-primary",
    'backgrounds'
  );

  // Set border/stroke color with error handling
  await applyVariableWithFallback(
    list,
    collection,
    "border/br-with-sf-neutral-primary",
    'backgrounds'
  );

  // Create list items with different button variants
  const items: Array<{ title: string, buttonVariant: ButtonVariant }> = [
    { title: "Product Title", buttonVariant: "primary" },
    { title: "Product Title", buttonVariant: "secondary" },
    { title: "Product Title", buttonVariant: "destructive" }
  ];

  for (let i = 0; i < items.length; i++) {
    const listItem = await createProductListItem(collection, items[i].title, items[i].buttonVariant);
    list.appendChild(listItem);

    // Add horizontal line between items
    if (i < items.length - 1) {
      const line = figma.createLine();
      line.resize(488, 0); // Adjust width to fit within padding
      line.strokeWeight = 0.5;
      line.dashPattern = [2, 2]; // Set dashed pattern
      line.layoutAlign = "STRETCH"; // Ensure it stretches horizontally
      await applyVariableWithFallback(
        line,
        collection,
        "border/br-with-sf-neutral-primary",
        'backgrounds'
      );
      list.appendChild(line);
    }
  }

  return list;
}

async function createProductListItem(
  collection: VariableCollection, 
  title: string,
  buttonVariant: ButtonVariant
): Promise<FrameNode> {
  const item = figma.createFrame();
  item.name = "Product Item";
  item.layoutMode = "HORIZONTAL";
  item.primaryAxisSizingMode = "FIXED";
  item.counterAxisSizingMode = "FIXED";
  item.primaryAxisAlignItems = "CENTER"; // Vertically center contents
  item.counterAxisAlignItems = "CENTER"; // Horizontally center contents
  item.paddingTop = 16;
  item.paddingBottom = 16;
  item.itemSpacing = 16;
  item.cornerRadius = 0; // Remove corner radius
  item.resize(488, 88); // Adjust width to fit within padding
  item.strokeWeight = 0;
  item.layoutAlign = "STRETCH"; // Add this line
  item.fills = []; // Remove background color

  // Auto-layout frame to contain Thumbnail and Content
  const autoLayoutFrame = figma.createFrame();
  autoLayoutFrame.name = "Left Content"; // Rename to "Left Content"
  autoLayoutFrame.layoutMode = "HORIZONTAL";
  autoLayoutFrame.primaryAxisSizingMode = "AUTO";
  autoLayoutFrame.counterAxisSizingMode = "AUTO";
  autoLayoutFrame.layoutAlign = "STRETCH"; // Fill horizontally
  autoLayoutFrame.layoutGrow = 1; // Allow it to grow and fill the available space
  autoLayoutFrame.itemSpacing = 12;
  autoLayoutFrame.fills = [];
  autoLayoutFrame.counterAxisAlignItems = "CENTER"; // Vertically center contents

  // Content container
  const content = figma.createFrame();
  content.name = "Content";
  content.layoutMode = "VERTICAL";
  content.layoutAlign = "STRETCH"; // Fill horizontally
  content.layoutGrow = 1; // Allow it to grow and fill the available space
  content.primaryAxisSizingMode = "AUTO"; // Hug contents vertically
  content.counterAxisSizingMode = "AUTO"; // Hug contents horizontally
  content.itemSpacing = 2;
  content.fills = [];

  // Thumbnail
  const thumbnail = figma.createFrame();
  thumbnail.name = "Thumbnail";
  thumbnail.resize(56, 56);
  thumbnail.cornerRadius = 4;

  // Set fill color with error handling
  await applyVariableWithFallback(
    thumbnail,
    collection,
    "surface/sf-neutral-secondary",
    'backgrounds'
  );

  // Set stroke color with error handling
  thumbnail.strokeWeight = 0.5;
  await applyVariableWithFallback(
    thumbnail,
    collection,
    "border/br-with-sf-neutral-primary",
    'backgrounds'
  );

  const itemTitle = figma.createText();
  itemTitle.characters = title;
  itemTitle.fontSize = 14;
  itemTitle.fontName = { family: "Inter", style: "Medium" };
  itemTitle.layoutAlign = "STRETCH"; // Fill horizontally
  itemTitle.textAutoResize = "NONE"; // Disable auto-resizing
  itemTitle.lineHeight = { value: 16, unit: "PIXELS" }; // Set line height
  itemTitle.textTruncation = 'ENDING'; // Enable truncation
  
  // Set fixed dimensions (if not in an auto-layout frame)
  itemTitle.resizeWithoutConstraints(180, 16);

  // Set text color with error handling
  await applyVariableWithFallback(
    itemTitle,
    collection,
    "text-icon/ti-neutral-primary",
    'text'
  );

  const description = figma.createText();
  description.characters = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer euismod sodales nam tomer lima consequat.";
  description.fontSize = 12;
  description.fontName = { family: "Inter", style: "Regular" };
  description.layoutAlign = "STRETCH"; // Fill horizontally
  description.textAutoResize = "NONE"; // Disable auto-resize
  description.lineHeight = { value: 16, unit: "PIXELS" }; // Set line height
  description.textTruncation = 'ENDING'; // Enable truncation with ellipsis
  description.resizeWithoutConstraints(180, 31); // Set fixed height to 30 pixels

  // Set secondary text color with error handling
  await applyVariableWithFallback(
    description,
    collection,
    "text-icon/ti-neutral-secondary",
    'text'
  );

  content.appendChild(itemTitle);
  content.appendChild(description);

  autoLayoutFrame.appendChild(thumbnail);
  autoLayoutFrame.appendChild(content);

  const style = BUTTON_STYLES[buttonVariant];
          const button = await createButton(collection, "Button", style.bg, "text-icon/ti-brand-primary"); // Use "text-icon/ti-brand-primary" for mini buttons
  button.primaryAxisSizingMode = "AUTO"; // Hug contents horizontally
  button.counterAxisSizingMode = "AUTO"; // Hug contents vertically

  item.appendChild(autoLayoutFrame);
  item.appendChild(button);

  return item; 
}

// ===============================================
// Part 6.4: Demo Components - Complete Integration
// ===============================================

// Notification Components
async function createNotifications(collection: VariableCollection): Promise<FrameNode> {
  const notificationsFrame = figma.createFrame();
  notificationsFrame.name = "Notifications";
  notificationsFrame.layoutMode = "VERTICAL";
  notificationsFrame.primaryAxisSizingMode = "AUTO"; // Change to AUTO
  notificationsFrame.counterAxisSizingMode = "AUTO";
  notificationsFrame.itemSpacing = 16;
  notificationsFrame.fills = [];
  notificationsFrame.layoutAlign = "STRETCH"; // Add this line
  notificationsFrame.resize(520, notificationsFrame.height); // Set width to 520

  // Create three different notifications
  const notifications: NotificationConfig[] = [
    { 
      message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer euismod sodales nam tomer lima consequat.", 
      bgVar: "bg-error-subtle", 
      textVar: "text-icon/ti-on-bg-error-subtle" 
    },
    { 
      message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer euismod sodales nam tomer lima consequat.", 
      bgVar: "bg-success-subtle", 
      textVar: "text-icon/ti-on-bg-success-subtle" 
    },
    { 
      message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer euismod sodales nam tomer lima consequat.", 
              bgVar: "bg-brand-primary-subtle",
        textVar: "text-icon/ti-on-bg-brand-primary-subtle" 
    }
  ];

  for (let i = 0; i < notifications.length; i++) {
    const notif = await createNotification(
      collection,
      notifications[i].message,
      notifications[i].bgVar,
      notifications[i].textVar,
      i === 0 // Only include icon for the first notification
    );
    notificationsFrame.appendChild(notif);
  }

  return notificationsFrame;
}

async function createNotification(
  collection: VariableCollection,
  message: string,
  bgVarName: keyof typeof FALLBACK_COLORS.backgrounds,
  textVarName: string,
  includeIcon: boolean = false
): Promise<FrameNode> {
  const notification = figma.createFrame();
  notification.name = "Notification";
  notification.layoutMode = "HORIZONTAL"; // Change to HORIZONTAL
  notification.primaryAxisSizingMode = "AUTO"; // Change to AUTO
  notification.counterAxisSizingMode = "AUTO";
  notification.counterAxisAlignItems = "CENTER"; // Vertically center contents
  notification.paddingLeft = 16;
  notification.paddingRight = 16;
  notification.paddingTop = 16;
  notification.paddingBottom = 16;
  notification.cornerRadius = 8;
  notification.layoutAlign = "STRETCH"; // Add this line
  notification.resize(520, notification.height); // Set width to 520
  notification.itemSpacing = 16;

  // Set background color with error handling
  await applyVariableWithFallback(
    notification,
    collection,
    `background/${bgVarName}`,
    'backgrounds'
  );

  // Set border/stroke
  notification.strokeWeight = 0.5;
  await applyVariableWithFallback(
    notification,
    collection,
    bgVarName === "bg-error-subtle" ? "border/br-with-bg-error-subtle" :
    bgVarName === "bg-success-subtle" ? "border/br-with-bg-success-subtle" :
            "border/br-with-bg-brand-primary-subtle",
    'backgrounds'
  );

  if (includeIcon) {
    // Create SVG node
    const svgNode = figma.createNodeFromSvg(`
      <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_45_7263)">
          <path d="M18.1133 1.34998H8.8869C8.75389 1.34987 8.62217 1.37597 8.49926 1.42679C8.37635 1.4776 8.26465 1.55214 8.17055 1.64613L1.64625 8.17043C1.55226 8.26453 1.47773 8.37623 1.42691 8.49914C1.37609 8.62205 1.34999 8.75377 1.3501 8.88677V18.1132C1.34999 18.2462 1.37609 18.3779 1.42691 18.5008C1.47773 18.6237 1.55226 18.7354 1.64625 18.8295L8.17055 25.3538C8.26465 25.4478 8.37635 25.5224 8.49926 25.5732C8.62217 25.624 8.75389 25.6501 8.8869 25.65H18.1133C18.2463 25.6501 18.378 25.624 18.5009 25.5732C18.6239 25.5224 18.7355 25.4478 18.8296 25.3538L25.3539 18.8295C25.4479 18.7354 25.5225 18.6237 25.5733 18.5008C25.6241 18.3779 25.6502 18.2462 25.6501 18.1132V8.88677C25.6502 8.75377 25.6241 8.62205 25.5733 8.49914C25.5225 8.37623 25.4479 8.26453 25.3539 8.17043L18.8296 1.64613C18.7355 1.55214 18.6239 1.4776 18.5009 1.42679C18.378 1.37597 18.2463 1.34987 18.1133 1.34998Z" stroke="#333333" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13.75 14.5125V7.42505" stroke="#333333" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M13.75 19.8032C14.3023 19.8032 14.75 19.3555 14.75 18.8032C14.75 18.2509 14.3023 17.8032 13.75 17.8032C13.1977 17.8032 12.75 18.2509 12.75 18.8032C12.75 19.3555 13.1977 19.8032 13.75 19.8032Z" fill="#333333"/>
        </g>
        <defs>
          <clipPath id="clip0_45_7263">
            <rect width="27" height="27" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    `);

    // Apply stroke color to the 3 vector layers inside the specified group
    const clipPathGroup = svgNode.findOne(node => node.type === "GROUP" && node.name === "Clip path group") as GroupNode;
    if (clipPathGroup) {
      const group = clipPathGroup.findOne(node => node.type === "GROUP" && node.name === "Group") as GroupNode;
      if (group) {
        const vectors = group.findAll(node => node.type === "VECTOR" && node.name === "Vector") as VectorNode[];
        for (const vector of vectors) {
          vector.strokes = [{
            type: 'SOLID',
            color: { r: 0, g: 0, b: 0 },
            boundVariables: {
              "color": {
                type: "VARIABLE_ALIAS",
                id: (await findVariable(collection, "text-icon/ti-on-bg-error-subtle"))?.id || ""
              }
            }
          }];
        }
      }
    }

    notification.appendChild(svgNode);
  }

  // Add the new SVG to the second notification
  if (bgVarName === "bg-success-subtle") {
    const newSvgNode = figma.createNodeFromSvg(`
      <svg width="28" height="27" viewBox="0 0 28 27" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g clip-path="url(#clip0_45_7393)">
          <path d="M5.22525 22.2747C4.12752 21.177 4.85537 18.8705 4.29696 17.5199C3.71707 16.125 1.59082 14.9915 1.59082 13.5C1.59082 12.0086 3.71707 10.875 4.29696 9.4802C4.85537 8.13071 4.12752 5.8231 5.22525 4.72537C6.32298 3.62765 8.63059 4.35549 9.98008 3.79708C11.3809 3.21719 12.5084 1.09094 13.9999 1.09094C15.4914 1.09094 16.6249 3.21719 18.0197 3.79708C19.3704 4.35549 21.6768 3.62765 22.7746 4.72537C23.8723 5.8231 23.1445 8.12952 23.7029 9.4802C24.2828 10.881 26.409 12.0086 26.409 13.5C26.409 14.9915 24.2828 16.125 23.7029 17.5199C23.1445 18.8705 23.8723 21.177 22.7746 22.2747C21.6768 23.3724 19.3704 22.6446 18.0197 23.203C16.6249 23.7829 15.4914 25.9091 13.9999 25.9091C12.5084 25.9091 11.3749 23.7829 9.98008 23.203C8.63059 22.6446 6.32298 23.3724 5.22525 22.2747Z" stroke="#333333" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9.22705 14.4545L12.0907 17.3182L18.7725 10.6364" stroke="#333333" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <defs>
          <clipPath id="clip0_45_7393">
            <rect width="28" height="27" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    `);

    // Apply stroke color to the paths inside the SVG
    const paths = newSvgNode.findAll(node => node.type === "VECTOR" && node.strokeWeight === 1.25) as VectorNode[];
    for (const path of paths) {
      path.strokes = [{
        type: 'SOLID',
        color: { r: 0, g: 0, b: 0 },
        boundVariables: {
          "color": {
            type: "VARIABLE_ALIAS",
                          id: (await findVariable(collection, "text-icon/ti-on-bg-success-subtle"))?.id || ""
          }
        }
      }];
    }

    notification.appendChild(newSvgNode);
  }

  // Add the new SVG to the third notification
      if (bgVarName === "bg-brand-primary-subtle") {
    const newSvgNode = figma.createNodeFromSvg(`
      <svg width="26" height="22" viewBox="0 0 26 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13 5.125C13 4.19674 13.3687 3.3065 14.0251 2.65013C14.6815 1.99375 15.5717 1.625 16.5 1.625H24.375V17.375H16.5C15.5717 17.375 14.6815 17.7437 14.0251 18.4001C13.3687 19.0565 13 19.9467 13 20.875" stroke="#333333" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M1.625 17.375H9.5C10.4283 17.375 11.3185 17.7437 11.9749 18.4001C12.6313 19.0565 13 19.9467 13 20.875V5.125C13 4.19674 12.6313 3.3065 11.9749 2.65013C11.3185 1.99375 10.4283 1.625 9.5 1.625H1.625V17.375Z" stroke="#333333" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `);

    // Apply stroke color to the paths inside the SVG
    const paths = newSvgNode.findAll(node => node.type === "VECTOR" && node.strokeWeight === 1.25) as VectorNode[];
    for (const path of paths) {
      path.strokes = [{
        type: 'SOLID',
        color: { r: 0, g: 0, b: 0 },
        boundVariables: {
          "color": {
            type: "VARIABLE_ALIAS",
                          id: (await findVariable(collection, "text-icon/ti-on-bg-brand-primary-subtle"))?.id || ""
          }
        }
      }];
    }

    notification.appendChild(newSvgNode);
  }

  const textWrapper = figma.createFrame();
  textWrapper.layoutMode = "VERTICAL";
  textWrapper.layoutAlign = "STRETCH"; // Stretch horizontally
  textWrapper.layoutGrow = 1; // Allow it to grow and fill the available
  textWrapper.primaryAxisSizingMode = "AUTO"; // Hug contents vertically
  textWrapper.counterAxisSizingMode = "AUTO"; // Hug contents horizontally
  textWrapper.fills = [];

  const text = figma.createText();
  text.characters = message;
  text.fontSize = 14;
  text.fontName = { family: "Inter", style: "Regular" };
  text.layoutAlign = "STRETCH"; // Stretch horizontally
  text.textAutoResize = "NONE"; // Hug contents vertically
  text.lineHeight = { value: 20, unit: "PIXELS" }; // Set line height
  text.textTruncation = 'ENDING'; // Enable truncation with ellipsis
  text.resizeWithoutConstraints (289, 40); // Set fixed height

  // Set text color with error handling
  await applyVariableWithFallback(
    text,
    collection,
    textVarName,
    'text'
  );

  textWrapper.appendChild(text);
  notification.appendChild(textWrapper);
  return notification;
}
// ===============================================
// Part 6.4: Demo Components - Complete Integration
// ===============================================

// Import this at the top of the file
// This goes near the other interfaces in the core setup section
interface RadixTheme {
  accentScale: string[];
  accentScaleAlpha: string[];
  accentContrast: string;
  background: string;
}



// ===============================================
// Part 7: Documentation Export
// ===============================================

// Types for documentation
interface DocumentationItem {
  name: string;
  variablePath: string;
  primitiveSource: string;
  category: 'surface' | 'text' | 'icon' | 'background' | 'border';
}

// Documentation data structure
const DOCUMENTATION_ITEMS: DocumentationItem[] = [
  // Surface items
  { name: "Sf-neutral-primary", variablePath: "surface/sf-neutral-primary", primitiveSource: "Background/1", category: 'surface' },
  { name: "Sf-neutral-secondary", variablePath: "surface/sf-neutral-secondary", primitiveSource: "Neutral Scale/2", category: 'surface' },
  { name: "Sf-brand-primary", variablePath: "surface/sf-brand-primary", primitiveSource: "Brand Scale/2", category: 'surface' },
  { name: "Sf-brand-primary-emphasized", variablePath: "surface/sf-brand-primary-emphasized", primitiveSource: "Brand Scale/3", category: 'surface' },
  { name: "Sf-shadow", variablePath: "surface/sf-shadow", primitiveSource: "Neutral Scale Alpha/4", category: 'surface' },
  { name: "Sf-overlay", variablePath: "surface/sf-overlay", primitiveSource: "#000000 65%", category: 'surface' },
  
  // Text & Icon items
  { name: "Ti-neutral-primary", variablePath: "text-icon/ti-neutral-primary", primitiveSource: "Neutral Scale/12", category: 'text' },
  { name: "Ti-neutral-secondary", variablePath: "text-icon/ti-neutral-secondary", primitiveSource: "Neutral Scale/11", category: 'text' },
  { name: "Ti-brand-primary", variablePath: "text-icon/ti-brand-primary", primitiveSource: "Accessibility/1", category: 'text' },
  { name: "Ti-on-bg-brand-primary", variablePath: "text-icon/ti-on-bg-brand-primary", primitiveSource: "Brand Contrast/1", category: 'text' },
  { name: "Ti-on-bg-brand-primary-subtle", variablePath: "text-icon/ti-on-bg-brand-primary-subtle", primitiveSource: "Brand Scale/11", category: 'text' },
  { name: "Ti-on-bg-error", variablePath: "text-icon/ti-on-bg-error", primitiveSource: "Error Contrast/1", category: 'text' },
  { name: "Ti-on-bg-error-subtle", variablePath: "text-icon/ti-on-bg-error-subtle", primitiveSource: "Error Scale/11", category: 'text' },
  { name: "Ti-on-bg-success", variablePath: "text-icon/ti-on-bg-success", primitiveSource: "Success Contrast/1", category: 'text' },
  { name: "Ti-on-bg-success-subtle", variablePath: "text-icon/ti-on-bg-success-subtle", primitiveSource: "Success Scale/11", category: 'text' },
  { name: "Ti-on-surface-overlay", variablePath: "text-icon/ti-on-surface-overlay", primitiveSource: "#FFFFFF", category: 'text' },
  
  // Background items
  { name: "Bg-brand-primary", variablePath: "background/bg-brand-primary", primitiveSource: "Brand Scale/9", category: 'background' },
  { name: "Bg-brand-primary-emphasized", variablePath: "background/bg-brand-primary-emphasized", primitiveSource: "Brand Scale/10", category: 'background' },
  { name: "Bg-brand-primary-subtle", variablePath: "background/bg-brand-primary-subtle", primitiveSource: "Brand Scale/3", category: 'background' },
  { name: "Bg-brand-primary-subtle-emphasized", variablePath: "background/bg-brand-primary-subtle-emphasized", primitiveSource: "Brand Scale/4", category: 'background' },
  { name: "Bg-brand-primary-overlay", variablePath: "background/bg-brand-primary-overlay", primitiveSource: "Brand Scale Alpha/6", category: 'background' },
  { name: "Bg-error", variablePath: "background/bg-error", primitiveSource: "Error Scale/9", category: 'background' },
  { name: "Bg-error-emphasized", variablePath: "background/bg-error-emphasized", primitiveSource: "Error Scale/10", category: 'background' },
  { name: "Bg-error-subtle", variablePath: "background/bg-error-subtle", primitiveSource: "Error Scale/3", category: 'background' },
  { name: "Bg-error-subtle-emphasized", variablePath: "background/bg-error-subtle-emphasized", primitiveSource: "Error Scale/4", category: 'background' },
  { name: "Bg-success", variablePath: "background/bg-success", primitiveSource: "Success Scale/9", category: 'background' },
  { name: "Bg-success-emphasized", variablePath: "background/bg-success-emphasized", primitiveSource: "Success Scale/10", category: 'background' },
  { name: "Bg-success-subtle", variablePath: "background/bg-success-subtle", primitiveSource: "Success Scale/3", category: 'background' },
  { name: "Bg-success-subtle-emphasized", variablePath: "background/bg-success-subtle-emphasized", primitiveSource: "Success Scale/4", category: 'background' },
  
  // Border items
  { name: "Br-with-sf-neutral-primary", variablePath: "border/br-with-sf-neutral-primary", primitiveSource: "Neutral Scale/7", category: 'border' },
  { name: "Br-with-sf-neutral-secondary", variablePath: "border/br-with-sf-neutral-secondary", primitiveSource: "Neutral Scale/8", category: 'border' },
  { name: "Br-with-bg-brand-primary", variablePath: "border/br-with-bg-brand-primary", primitiveSource: "Brand Scale/11", category: 'border' },
  { name: "Br-with-bg-brand-primary-subtle", variablePath: "border/br-with-bg-brand-primary-subtle", primitiveSource: "Brand Scale/8", category: 'border' },
  { name: "Br-with-bg-success", variablePath: "border/br-with-bg-success", primitiveSource: "Success Scale/11", category: 'border' },
  { name: "Br-with-bg-success-subtle", variablePath: "border/br-with-bg-success-subtle", primitiveSource: "Success Scale/8", category: 'border' },
  { name: "Br-with-bg-error", variablePath: "border/br-with-bg-error", primitiveSource: "Error Scale/11", category: 'border' },
  { name: "Br-with-bg-error-subtle", variablePath: "border/br-with-bg-error-subtle", primitiveSource: "Error Scale/8", category: 'border' }
];

// Main documentation export function
async function exportDocumentation(collection: VariableCollection, semanticCollection: VariableCollection | null = null) {
  try {
    // Load required fonts
    await Promise.all([
      figma.loadFontAsync({ family: "Inter", style: "Regular" }),
      figma.loadFontAsync({ family: "Inter", style: "Medium" }),
      figma.loadFontAsync({ family: "Inter", style: "Bold" })
    ]);
    
    // Create main frame
    const frame = figma.createFrame();
    frame.name = "CCS Documentation";
    frame.layoutMode = "VERTICAL";
    frame.primaryAxisSizingMode = "AUTO";
    frame.counterAxisSizingMode = "FIXED";
    frame.paddingLeft = 0;
    frame.paddingRight = 0;
    frame.paddingTop = 0;
    frame.paddingBottom = 80;
    frame.itemSpacing = 0;
    frame.cornerRadius = 24;
    frame.resize(1093, frame.height);
    
    // Position frame on canvas
    frame.x = 100;
    frame.y = 800;
    
    // Apply surface color variable to frame background
    await applyVariableWithFallback(frame, semanticCollection || collection, "surface/sf-neutral-primary", 'backgrounds');

    // Create title container
const titleContainer = figma.createFrame();
titleContainer.name = "Title Container";
titleContainer.layoutMode = "VERTICAL";
titleContainer.primaryAxisSizingMode = "AUTO";
titleContainer.counterAxisSizingMode = "AUTO";
titleContainer.paddingLeft = 120;
titleContainer.paddingRight = 120;
titleContainer.paddingTop = 104;
titleContainer.paddingBottom = 56;
titleContainer.itemSpacing = 0;
titleContainer.layoutAlign = "STRETCH";
    // Apply surface-neutral-secondary background
await applyVariableWithFallback(titleContainer, semanticCollection || collection, "surface/sf-neutral-secondary", 'backgrounds');
frame.appendChild(titleContainer);

    // Add title
    const title = figma.createText();
    title.characters = "Color";
    title.fontSize = 32;
    title.fontName = { family: "Inter", style: "Bold" };
    title.textAutoResize = "HEIGHT";
    // Apply text color variable
    await applyVariableWithFallback(title, semanticCollection || collection, "text-icon/ti-neutral-primary", 'text');
    titleContainer.appendChild(title);

    // Group items by category
    const categories = ['surface', 'text', 'icon', 'background', 'border'];
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const categoryItems = DOCUMENTATION_ITEMS.filter(item => item.category === category);
      if (categoryItems.length > 0) {
        const isFirstSection = i === 0;
        const categorySection = await createCategorySection(category, categoryItems, semanticCollection || collection, isFirstSection);
        frame.appendChild(categorySection);
        
        // Add separator line between sections (except after the last section)
        if (i < categories.length - 1) {
          const sectionSeparator = figma.createLine();
          sectionSeparator.name = `Section Separator ${category}`;
          sectionSeparator.strokeWeight = 0.33;
          sectionSeparator.layoutAlign = "STRETCH";
          sectionSeparator.resize(1093, 0); // Full width of the frame
          // Apply border color variable for the separator line
          await applyVariableWithFallback(sectionSeparator, semanticCollection || collection, "border/br-with-sf-neutral-primary", 'backgrounds');
          frame.appendChild(sectionSeparator);
        }
      }
    }

    return frame;
  } catch (error) {
    console.error('Error in exportDocumentation:', error);
    figma.notify('Error creating documentation');
    throw error;
  }
}

// Create category section
async function createCategorySection(category: string, items: DocumentationItem[], collection: VariableCollection, isFirstSection: boolean = false): Promise<FrameNode> {
  const section = figma.createFrame();
  section.name = `${category.charAt(0).toUpperCase() + category.slice(1)} Section`;
  section.layoutMode = "VERTICAL";
  section.primaryAxisSizingMode = "AUTO";
  section.counterAxisSizingMode = "FIXED";
  section.paddingLeft = 120;
  section.paddingRight = 120;
  section.paddingTop = isFirstSection ? 40 : 40;
  section.paddingBottom = 40;
  section.itemSpacing = 0;
  section.fills = [];
  section.layoutAlign = "STRETCH";
  
  // No top borders for any sections

  // Add category heading
  const headingContainer = figma.createFrame();
  headingContainer.name = "Heading Container";
  headingContainer.layoutMode = "VERTICAL";
  headingContainer.primaryAxisSizingMode = "AUTO";
  headingContainer.counterAxisSizingMode = "AUTO";
  headingContainer.paddingBottom = 16;
  headingContainer.fills = [];
  headingContainer.layoutAlign = "STRETCH";
  
  const heading = figma.createText();
  heading.characters = category.charAt(0).toUpperCase() + category.slice(1);
  heading.fontSize = 18;
  heading.fontName = { family: "Inter", style: "Bold" };
  heading.textAutoResize = "HEIGHT";
  heading.layoutAlign = "STRETCH";
  // Apply text color variable
  await applyVariableWithFallback(heading, collection, "text-icon/ti-neutral-secondary", 'text');
  
  headingContainer.appendChild(heading);
  section.appendChild(headingContainer);

  // Create content wrapper (no padding, full width)
  const contentWrapper = figma.createFrame();
  contentWrapper.name = "Content Wrapper";
  contentWrapper.layoutMode = "VERTICAL";
  contentWrapper.primaryAxisSizingMode = "AUTO";
  contentWrapper.counterAxisSizingMode = "FIXED";
  contentWrapper.itemSpacing = 0;
  contentWrapper.fills = [];
  contentWrapper.layoutAlign = "STRETCH";
  contentWrapper.resize(853, contentWrapper.height); // 1093 - 240 (padding)
  section.appendChild(contentWrapper);

  // Add column headers (hidden)
  // const headerRow = await createHeaderRow(category, collection);
  // contentWrapper.appendChild(headerRow);

  // Add line above the first row with values (hidden)
  // const topSeparator = figma.createLine();
  // topSeparator.strokeWeight = 0.5;
  // topSeparator.layoutAlign = "STRETCH";
          // await applyVariableWithFallback(topSeparator, collection, "border/br-with-sf-neutral-primary-primary", 'backgrounds');
  // contentWrapper.appendChild(topSeparator);

  // Add items
  for (let i = 0; i < items.length; i++) {
    const isLastItem = i === items.length - 1;
    const itemRow = await createItemRow(items[i], collection, isLastItem);
    contentWrapper.appendChild(itemRow);
    
    // Add separator line (except for last item)
    if (i < items.length - 1) {
      const separator = figma.createLine();
      separator.strokeWeight = 0.5;
      separator.layoutAlign = "STRETCH";
              await applyVariableWithFallback(separator, collection, "border/br-with-sf-neutral-primary", 'backgrounds');
      contentWrapper.appendChild(separator);
    }
  }

  return section;
}

// Create header row
async function createHeaderRow(category: string, collection: VariableCollection): Promise<FrameNode> {
  const headerRow = figma.createFrame();
  headerRow.name = "Header Row";
  headerRow.layoutMode = "HORIZONTAL";
  headerRow.primaryAxisSizingMode = "FIXED";
  headerRow.counterAxisSizingMode = "AUTO";
  headerRow.paddingTop = 32;
  headerRow.paddingBottom = 12;
  headerRow.itemSpacing = 16;
  headerRow.fills = [];
  headerRow.layoutAlign = "STRETCH";

  // Style Name header
  const styleNameHeader = figma.createText();
  styleNameHeader.characters = "Style Name";
  styleNameHeader.fontSize = 12;
  styleNameHeader.fontName = { family: "Inter", style: "Medium" };
  styleNameHeader.textAutoResize = "HEIGHT";
  styleNameHeader.resize(375, styleNameHeader.height);
  // Apply text color variable
  await applyVariableWithFallback(styleNameHeader, collection, "text-icon/ti-neutral-secondary", 'text');
  headerRow.appendChild(styleNameHeader);

  // Primitive header
  const primitiveHeader = figma.createText();
  primitiveHeader.characters = "Primitive - Radix";
  primitiveHeader.fontSize = 12;
  primitiveHeader.fontName = { family: "Inter", style: "Medium" };
  primitiveHeader.textAutoResize = "HEIGHT";
  primitiveHeader.resize(225, primitiveHeader.height);
  // Apply text color variable
  await applyVariableWithFallback(primitiveHeader, collection, "text-icon/ti-neutral-secondary", 'text');
  headerRow.appendChild(primitiveHeader);

  // Hex Value header
  const hexValueHeader = figma.createText();
  hexValueHeader.characters = "Hex Value";
  hexValueHeader.fontSize = 12;
  hexValueHeader.fontName = { family: "Inter", style: "Medium" };
  hexValueHeader.textAutoResize = "HEIGHT";
  hexValueHeader.resize(225, hexValueHeader.height);
  // Apply text color variable
  await applyVariableWithFallback(hexValueHeader, collection, "text-icon/ti-neutral-secondary", 'text');
  headerRow.appendChild(hexValueHeader);

  return headerRow;
}

// Create item row
async function createItemRow(item: DocumentationItem, collection: VariableCollection, isLastItem: boolean = false): Promise<FrameNode> {
  const row = figma.createFrame();
  row.name = `${item.name} Row`;
  row.layoutMode = "HORIZONTAL";
  row.primaryAxisSizingMode = "FIXED";
  row.counterAxisSizingMode = "AUTO";
  row.primaryAxisAlignItems = "MIN"; // left aligned
  row.counterAxisAlignItems = "CENTER"; // middle aligned vertically (equivalent to "Align left" in screenshot)
  row.paddingTop = 20;
  row.paddingBottom = 20;
  row.itemSpacing = 14;
  row.fills = [];
  row.layoutAlign = "STRETCH";

  // Color swatch
  const swatch = figma.createFrame();
  swatch.name = `${item.name} Swatch`;
  swatch.resize(24, 24);
  swatch.cornerRadius = 4;
  
  // Handle border swatches differently
  if (item.category === 'border') {
    swatch.strokeWeight = 2;
    // Apply border color variable
    await applyVariableWithFallback(swatch, collection, item.variablePath, 'backgrounds');
    // Apply appropriate fill based on the border style
    if (item.name.includes('brand')) {
      if (item.name.includes('subtle')) {
        await applyVariableWithFallback(swatch, collection, "background/bg-brand-primary-subtle", 'backgrounds');
      } else {
        await applyVariableWithFallback(swatch, collection, "background/bg-brand-primary", 'backgrounds');
      }
    } else if (item.name.includes('success')) {
      if (item.name.includes('subtle')) {
        await applyVariableWithFallback(swatch, collection, "background/bg-success-subtle", 'backgrounds');
      } else {
        await applyVariableWithFallback(swatch, collection, "background/bg-success", 'backgrounds');
      }
    } else if (item.name.includes('error')) {
      if (item.name.includes('subtle')) {
        await applyVariableWithFallback(swatch, collection, "background/bg-error-subtle", 'backgrounds');
      } else {
        await applyVariableWithFallback(swatch, collection, "background/bg-error", 'backgrounds');
      }
    } else {
      await applyVariableWithFallback(swatch, collection, "surface/sf-neutral-primary", 'backgrounds');
    }
  } else {
    swatch.strokeWeight = 0.5;
    // Apply border color variable
    await applyVariableWithFallback(swatch, collection, "border/br-with-sf-neutral-primary", 'backgrounds');
    // Apply variable color to swatch
    await applyVariableWithFallback(swatch, collection, item.variablePath, 'backgrounds');
  }
  
  // Style name
  const styleName = figma.createText();
  styleName.characters = item.name.toLowerCase();
  styleName.fontSize = 14;
  styleName.fontName = { family: "Inter", style: "Regular" };
  styleName.textAutoResize = "WIDTH_AND_HEIGHT";
  // Apply text color variable
  await applyVariableWithFallback(styleName, collection, "text-icon/ti-neutral-primary", 'text');
  
  // Create auto-layout frame for swatch and style name
  const styleContainer = figma.createFrame();
  styleContainer.name = `${item.name} Style Container`;
  styleContainer.layoutMode = "HORIZONTAL";
  styleContainer.primaryAxisSizingMode = "FIXED";
  styleContainer.counterAxisSizingMode = "AUTO";
  styleContainer.primaryAxisAlignItems = "MIN"; // left aligned
  styleContainer.counterAxisAlignItems = "CENTER"; // middle aligned vertically (not "MIN")
  styleContainer.itemSpacing = 16;
  styleContainer.fills = [];
  // Set width to fixed 375px
  styleContainer.resize(375, styleContainer.height);
  
  styleContainer.appendChild(swatch);
  styleContainer.appendChild(styleName);
  
  row.appendChild(styleContainer);

  // Primitive source badge
  const primitiveBadge = figma.createFrame();
  primitiveBadge.name = `${item.name} Primitive Badge`;
  primitiveBadge.layoutMode = "HORIZONTAL";
  primitiveBadge.primaryAxisSizingMode = "AUTO";
  primitiveBadge.counterAxisSizingMode = "AUTO";
  primitiveBadge.paddingLeft = 8;
  primitiveBadge.paddingRight = 8;
  primitiveBadge.paddingTop = 4;
  primitiveBadge.paddingBottom = 4;
  primitiveBadge.cornerRadius = 6;
  // Apply background color variable
  await applyVariableWithFallback(primitiveBadge, collection, "surface/sf-neutral-secondary", 'backgrounds');

  const primitiveText = figma.createText();
  primitiveText.characters = item.primitiveSource.toLowerCase();
  primitiveText.fontSize = 12;
  primitiveText.fontName = { family: "Inter", style: "Regular" };
  primitiveText.textAutoResize = "HEIGHT";
  // Apply text color variable
  await applyVariableWithFallback(primitiveText, collection, "text-icon/ti-neutral-secondary", 'text');
  primitiveBadge.appendChild(primitiveText);

  // Create parent frame for primitive badge
  const primitiveContainer = figma.createFrame();
  primitiveContainer.name = `${item.name} Primitive Container`;
  primitiveContainer.layoutMode = "HORIZONTAL";
  primitiveContainer.primaryAxisSizingMode = "AUTO";
  primitiveContainer.counterAxisSizingMode = "AUTO";
  primitiveContainer.fills = [];
  // Set width to 225px
  primitiveContainer.resize(225, primitiveContainer.height);
  
  primitiveContainer.appendChild(primitiveBadge);
  row.appendChild(primitiveContainer);

  // Hex Value container - now shows multiple hex values for each mode
  const hexValueContainer = figma.createFrame();
  hexValueContainer.name = `${item.name} Hex Value Container`;
  hexValueContainer.layoutMode = "HORIZONTAL";
  hexValueContainer.primaryAxisSizingMode = "AUTO";
  hexValueContainer.counterAxisSizingMode = "AUTO";
  hexValueContainer.itemSpacing = 8; // 8px gap between hex values
  hexValueContainer.fills = [];
  // Set width to 225px
  hexValueContainer.resize(225, hexValueContainer.height);
  
  // Get all available hex values for this variable
  if (variableHexValues.has(item.variablePath)) {
    const modeMap = variableHexValues.get(item.variablePath)!;
    const modeIds = Array.from(modeMap.keys());
    
    // Sort mode IDs to match the order of variable modes
    const sortedModeIds = modeIds.sort((a, b) => {
      // Put "Light" first, then "Dark" if both exist
      if (a === "Light") return -1;
      if (b === "Light") return 1;
      if (a === "Dark") return -1;
      if (b === "Dark") return 1;
      return a.localeCompare(b);
    });
    
    // Create a hex value badge for each mode
    for (const modeId of sortedModeIds) {
      const hexValue = modeMap.get(modeId)!;
      
      const hexValueBadge = figma.createFrame();
      hexValueBadge.name = `${item.name} Hex Badge ${modeId}`;
      hexValueBadge.layoutMode = "HORIZONTAL";
      hexValueBadge.primaryAxisSizingMode = "AUTO";
      hexValueBadge.counterAxisSizingMode = "AUTO";
      hexValueBadge.paddingLeft = 8;
      hexValueBadge.paddingRight = 8;
      hexValueBadge.paddingTop = 4;
      hexValueBadge.paddingBottom = 4;
      hexValueBadge.cornerRadius = 6;
      // Apply background color variable
      await applyVariableWithFallback(hexValueBadge, collection, "surface/sf-neutral-secondary", 'backgrounds');

      const hexValueText = figma.createText();
      // Use the normalizeHex function to ensure 6 characters
      const normalizedHex = normalizeHex(hexValue);
      hexValueText.characters = normalizedHex;
      hexValueText.fontSize = 12;
      hexValueText.fontName = { family: "Inter", style: "Regular" };
      hexValueText.textAutoResize = "HEIGHT";
      hexValueText.textAlignHorizontal = "CENTER";
      // Apply text color variable
      await applyVariableWithFallback(hexValueText, collection, "text-icon/ti-neutral-secondary", 'text');
      hexValueBadge.appendChild(hexValueText);
      
      hexValueContainer.appendChild(hexValueBadge);
    }
  } else {
    // Fallback: create a single hex value badge with placeholder
    const hexValueBadge = figma.createFrame();
    hexValueBadge.name = `${item.name} Hex Badge Fallback`;
    hexValueBadge.layoutMode = "HORIZONTAL";
    hexValueBadge.primaryAxisSizingMode = "AUTO";
    hexValueBadge.counterAxisSizingMode = "AUTO";
    hexValueBadge.paddingLeft = 8;
    hexValueBadge.paddingRight = 8;
    hexValueBadge.paddingTop = 4;
    hexValueBadge.paddingBottom = 4;
    hexValueBadge.cornerRadius = 6;
          // Apply background color variable
      await applyVariableWithFallback(hexValueBadge, collection, "surface/sf-neutral-secondary", 'backgrounds');

    const hexValueText = figma.createText();
    // Try to get hex value using the old method as fallback
    const hexValue = await getHexValueFromVariable(collection, item.variablePath);
    // Use the normalizeHex function to ensure 6 characters
    const normalizedHex = normalizeHex(hexValue);
    hexValueText.characters = normalizedHex;
    hexValueText.fontSize = 12;
    hexValueText.fontName = { family: "Inter", style: "Regular" };
    hexValueText.textAutoResize = "HEIGHT";
          // Apply text color variable
      await applyVariableWithFallback(hexValueText, collection, "text-icon/ti-neutral-secondary", 'text');
    hexValueBadge.appendChild(hexValueText);
    
    hexValueContainer.appendChild(hexValueBadge);
  }
  
  row.appendChild(hexValueContainer);

  return row;
}

