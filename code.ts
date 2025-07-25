// ===============================================
// Part 1: Initial Setup and Type Definitions
// ===============================================

/// <reference types="@figma/plugin-typings" />
import { generateRadixColors } from "radix-theme-generator";

// Show UI and set initial size
figma.showUI(__html__);
figma.ui.resize(320, 420);

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
  exportDemo: boolean;  // Add this line
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

// Utility function to create or update a color variable with a specific value
async function createOrUpdateColorVariableWithValue(collection: VariableCollection, modeId: string, name: string, value: RGBA): Promise<Variable | null> {
  console.log(`Attempting to create or update color variable: ${name} with value: ${JSON.stringify(value)}`);
  const existingVariable = await findExistingVariable(collection, name);

  if (existingVariable) {
    const variable = await figma.variables.getVariableByIdAsync(existingVariable);
    if (variable) {
      await variable.setValueForMode(modeId, value);
      console.log(`Updated variable ${name} with value: ${JSON.stringify(value)}`);
    }
    return variable;
  }

  const variable = figma.variables.createVariable(name, collection, "COLOR");
  await variable.setValueForMode(modeId, value);
  console.log(`Created variable ${name} with value: ${JSON.stringify(value)}`);
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
    }
    return variable;
  }

  const variable = figma.variables.createVariable(name, collection, "COLOR");
  await variable.setValueForMode(modeId, rgb);
  console.log(`Created variable ${name} with value: ${JSON.stringify(rgb)}`);
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
    }
    return variable;
  }

  const variable = figma.variables.createVariable(name, collection, "COLOR");
  await variable.setValueForMode(modeId, value);
  console.log(`Created variable ${name} with value: ${JSON.stringify(value)}`);
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
          const mixedHex = `#${Math.round(mixedColor.r * 255).toString(16).padStart(2, '0')}${
              Math.round(mixedColor.g * 255).toString(16).padStart(2, '0')}${
              Math.round(mixedColor.b * 255).toString(16).padStart(2, '0')}`;
          
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
    }
    return variable;
  }

  const variable = figma.variables.createVariable(name, collection, "COLOR");
  await variable.setValueForMode(modeId, rgb);
  console.log(`Created variable ${name} with value: ${JSON.stringify(rgb)}`);
  return variable;
}

// ===============================================
// Part 2: Main Message Handler and Color Generation
// ===============================================

// Track plugin closing state
let isClosing = false;

figma.ui.onmessage = async (msg: PluginMessage) => {
  if (msg.type === "generate-palette") {
    const { hexColor, neutral, success, error, appearance, includePrimitives, exportDemo } = msg;
    try {
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

        // Create demo components if enabled
        if (exportDemo) {
          await exportDemoComponents(primitiveCollection, semanticCollection);
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

        // Create demo components if enabled
        if (exportDemo) {
          await exportDemoComponents(collection);
        }
      }

      if (!isClosing) {
        figma.notify(`Successfully created color system with version ${versionNumber}`);
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

  // Update surface-secondary to use neutral scale/2
  await createOrUpdateColorVariable(collection, modeId, "surface/surface-secondary", neutralTheme.accentScale[2]);

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
        
        const mixedHex = `#${Math.round(mixedColor.r * 255).toString(16).padStart(2, '0')}${
          Math.round(mixedColor.g * 255).toString(16).padStart(2, '0')}${
          Math.round(mixedColor.b * 255).toString(16).padStart(2, '0')}`;
        
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
    await variable.setValueForMode(modeId, value);
    console.log(`Hardcoded variable ${name} created`);
    return variable;
  }

  // Surface variables
  await Promise.all([
    createSemanticVar("surface/surface-base-default", "Background/1"), // Updated from surface-default
    createSemanticVar("surface/surface-base-secondary", "Neutral Scale/2"), // Updated from surface-secondary
    createSemanticVar("surface/surface-primary", "Brand Scale/2"), // Updated from surface-tertiary
    createSemanticVar("surface/surface-secondary", "Brand Scale/3"), // Updated from surface-focus
    createSemanticVar("surface/surface-shadow", "Neutral Scale Alpha/4"),
    createHardcodedVar("surface/surface-overlay", { r: 0, g: 0, b: 0, a: 0.65 })
  ]);

  // Get accessibility variable ID with fallback to brand9
  const accessibilityVarId = await findExistingVariable(primitiveCollection, "Accessibility/1");
  const brand9VarId = await findExistingVariable(primitiveCollection, "Brand Scale/9");
  const linkVarId = accessibilityVarId || brand9VarId;

  // Text variables with enhanced fallback
  await Promise.all([
    createSemanticVar("text/text-default", "Neutral Scale/12"),
    createSemanticVar("text/text-secondary", "Neutral Scale/11"),
    createSemanticVar("text/text-link", linkVarId ? "Accessibility/1" : "Brand Scale/9"),
    createSemanticVar("text/text-on-bg-primary", "Brand Contrast/1"),
    createSemanticVar("text/text-on-bg-primary-subtle", "Brand Scale/11"),
    createSemanticVar("text/text-on-bg-error", "Error Contrast/1"),
    createSemanticVar("text/text-on-bg-error-subtle", "Error Scale/11"),
    createSemanticVar("text/text-on-bg-success", "Success Contrast/1"),
    createSemanticVar("text/text-on-bg-success-subtle", "Success Scale/11"),
    createHardcodedVar("text/text-on-surface-overlay", { r: 1, g: 1, b: 1, a: 1 })
  ]);

  // Icon variables with enhanced fallback
  await Promise.all([
    createSemanticVar("icon/icon-default", "Neutral Scale/12"),
    createSemanticVar("icon/icon-secondary", "Neutral Scale/11"),
    createSemanticVar("icon/icon-link", linkVarId ? "Accessibility/1" : "Brand Scale/9"),
    createSemanticVar("icon/icon-on-bg-primary", "Brand Contrast/1"),
    createSemanticVar("icon/icon-on-bg-primary-subtle", "Brand Scale/11"),
    createSemanticVar("icon/icon-on-bg-error", "Error Contrast/1"),
    createSemanticVar("icon/icon-on-bg-error-subtle", "Error Scale/11"),
    createSemanticVar("icon/icon-on-bg-success", "Success Contrast/1"),
    createSemanticVar("icon/icon-on-bg-success-subtle", "Success Scale/11"),
    createHardcodedVar("icon/icon-on-surface-overlay", { r: 1, g: 1, b: 1, a: 1 })
  ]);

  // Background variables
  await Promise.all([
    createSemanticVar("background/bg-primary", "Brand Scale/9"),
    createSemanticVar("background/bg-primary-focus", "Brand Scale/10"),
    createSemanticVar("background/bg-primary-subtle", "Brand Scale/3"),
    createSemanticVar("background/bg-primary-subtle-focus", "Brand Scale/4"),
    createSemanticVar("background/bg-primary-overlay", "Brand Scale Alpha/6"),
    createSemanticVar("background/bg-error", "Error Scale/9"),
    createSemanticVar("background/bg-error-focus", "Error Scale/10"),
    createSemanticVar("background/bg-error-subtle", "Error Scale/3"),
    createSemanticVar("background/bg-error-subtle-focus", "Error Scale/4"),
    createSemanticVar("background/bg-success", "Success Scale/9"),
    createSemanticVar("background/bg-success-focus", "Success Scale/10"),
    createSemanticVar("background/bg-success-subtle", "Success Scale/3"),
    createSemanticVar("background/bg-success-subtle-focus", "Success Scale/4")
  ]);

  // Border variables
  await Promise.all([
    createSemanticVar("border/border-with-any-surface", "Neutral Scale/7"), // Updated from border-with-surface
    createSemanticVar("border/border-with-any-surface-focus", "Neutral Scale/8"), // Updated from border-with-surface-focus
    createSemanticVar("border/border-with-bg-primary", "Brand Scale/11"), // Updated from border-with-primary
    createSemanticVar("border/border-with-bg-primary-subtle", "Brand Scale/8"), // Updated from border-with-primary-subtle
    createSemanticVar("border/border-with-bg-success", "Success Scale/11"), // Updated from border-with-success
    createSemanticVar("border/border-with-bg-success-subtle", "Success Scale/8"), // Updated from border-with-success-subtle
    createSemanticVar("border/border-with-bg-error", "Error Scale/11"), // Updated from border-with-error
    createSemanticVar("border/border-with-bg-error-subtle", "Error Scale/8") // Updated from border-with-error-subtle
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
    createOrUpdateColorVariable(collection, modeId, "surface/surface-base-default", brandTheme.background), // Updated from surface-default
    createOrUpdateColorVariable(collection, modeId, "surface/surface-base-secondary", neutralTheme.accentScale[1]), // Updated from surface-secondary
    createOrUpdateColorVariable(collection, modeId, "surface/surface-primary", brandTheme.accentScale[1]), // Updated from surface-tertiary
    createOrUpdateColorVariable(collection, modeId, "surface/surface-secondary", brandTheme.accentScale[2]), // Updated from surface-focus
    createOrUpdateColorVariable(collection, modeId, "surface/surface-shadow", neutralTheme.accentScaleAlpha[3]),
    createOrUpdateHardcodedVar(collection, modeId, "surface/surface-overlay", { r: 0, g: 0, b: 0, a: 0.65 })
  ]);

  // Text variables
  await Promise.all([
    createOrUpdateColorVariable(collection, modeId, "text/text-default", neutralTheme.accentScale[11]),
    createOrUpdateColorVariable(collection, modeId, "text/text-secondary", neutralTheme.accentScale[10]),
    createOrUpdateContrastColorVariable(collection, modeId, "text/text-link", brandTheme.accentScale[8], brandTheme.background),
    createOrUpdateColorVariable(collection, modeId, "text/text-on-bg-primary", brandTheme.accentContrast),
    createOrUpdateColorVariable(collection, modeId, "text/text-on-bg-primary-subtle", brandTheme.accentScale[10]),
    createOrUpdateColorVariable(collection, modeId, "text/text-on-bg-error", errorTheme.accentContrast),
    createOrUpdateColorVariable(collection, modeId, "text/text-on-bg-error-subtle", errorTheme.accentScale[10]),
    createOrUpdateColorVariable(collection, modeId, "text/text-on-bg-success", successTheme.accentContrast),
    createOrUpdateColorVariable(collection, modeId, "text/text-on-bg-success-subtle", successTheme.accentScale[10]),
    createOrUpdateHardcodedVar(collection, modeId, "text/text-on-surface-overlay", { r: 1, g: 1, b: 1, a: 1 })
  ]);

  // Icon variables
  await Promise.all([
    createOrUpdateColorVariable(collection, modeId, "icon/icon-default", neutralTheme.accentScale[11]),
    createOrUpdateColorVariable(collection, modeId, "icon/icon-secondary", neutralTheme.accentScale[10]),
    createOrUpdateContrastColorVariable(collection, modeId, "icon/icon-link", brandTheme.accentScale[8], brandTheme.background),
    createOrUpdateColorVariable(collection, modeId, "icon/icon-on-bg-primary", brandTheme.accentContrast),
    createOrUpdateColorVariable(collection, modeId, "icon/icon-on-bg-primary-subtle", brandTheme.accentScale[10]),
    createOrUpdateColorVariable(collection, modeId, "icon/icon-on-bg-error", errorTheme.accentContrast),
    createOrUpdateColorVariable(collection, modeId, "icon/icon-on-bg-error-subtle", errorTheme.accentScale[10]),
    createOrUpdateColorVariable(collection, modeId, "icon/icon-on-bg-success", successTheme.accentContrast),
    createOrUpdateColorVariable(collection, modeId, "icon/icon-on-bg-success-subtle", successTheme.accentScale[10]),
    createOrUpdateHardcodedVar(collection, modeId, "icon/icon-on-surface-overlay", { r: 1, g: 1, b: 1, a: 1 })
  ]);

  // Background variables
  await Promise.all([
    createOrUpdateColorVariable(collection, modeId, "background/bg-primary", brandTheme.accentScale[8]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-primary-focus", brandTheme.accentScale[9]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-primary-subtle", brandTheme.accentScale[2]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-primary-subtle-focus", brandTheme.accentScale[3]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-primary-overlay", brandTheme.accentScaleAlpha[5]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-error", errorTheme.accentScale[8]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-error-focus", errorTheme.accentScale[9]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-error-subtle", errorTheme.accentScale[2]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-error-subtle-focus", errorTheme.accentScale[3]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-success", successTheme.accentScale[8]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-success-focus", successTheme.accentScale[9]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-success-subtle", successTheme.accentScale[2]),
    createOrUpdateColorVariable(collection, modeId, "background/bg-success-subtle-focus", successTheme.accentScale[3])
  ]);

  // Border variables
  await Promise.all([
    createOrUpdateColorVariable(collection, modeId, "border/border-with-any-surface", neutralTheme.accentScale[6]), // Updated from border-with-surface
    createOrUpdateColorVariable(collection, modeId, "border/border-with-any-surface-focus", neutralTheme.accentScale[7]), // Updated from border-with-surface-focus
    createOrUpdateColorVariable(collection, modeId, "border/border-with-bg-primary", brandTheme.accentScale[10]), // Updated from border-with-primary
    createOrUpdateColorVariable(collection, modeId, "border/border-with-bg-primary-subtle", brandTheme.accentScale[7]), // Updated from border-with-primary-subtle
    createOrUpdateColorVariable(collection, modeId, "border/border-with-bg-success", successTheme.accentScale[10]), // Updated from border-with-success
    createOrUpdateColorVariable(collection, modeId, "border/border-with-bg-success-subtle", successTheme.accentScale[7]), // Updated from border-with-success-subtle
    createOrUpdateColorVariable(collection, modeId, "border/border-with-bg-error", errorTheme.accentScale[10]), // Updated from border-with-error
    createOrUpdateColorVariable(collection, modeId, "border/border-with-bg-error-subtle", errorTheme.accentScale[7]) // Updated from border-with-error-subtle
  ]);
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
  textVar: keyof typeof FALLBACK_COLORS.text;
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
    'bg-primary': { r: 0.1, g: 0.6, b: 1 },
    'bg-error': { r: 0.9, g: 0.3, b: 0.3 },
    'bg-success': { r: 0.3, g: 0.8, b: 0.4 },
    'bg-primary-subtle': { r: 0.9, g: 0.95, b: 1 },
    'bg-error-subtle': { r: 1, g: 0.95, b: 0.95 },
    'bg-success-subtle': { r: 0.95, g: 1, b: 0.95 },
    'surface-default': { r: 1, g: 1, b: 1 },
    'surface-secondary': { r: 0.98, g: 0.98, b: 0.98 },
    'surface-tertiary': { r: 0.95, g: 0.95, b: 0.95 }
  },
  text: {
    'text-default': { r: 0, g: 0, b: 0 },
    'text-secondary': { r: 0.4, g: 0.4, b: 0.4 },
    'text-on-bg-primary': { r: 1, g: 1, b: 1 },
    'text-on-bg-error': { r: 1, g: 1, b: 1 },
    'text-on-bg-success': { r: 1, g: 1, b: 1 },
    'text-on-bg-primary-subtle': { r: 0.1, g: 0.6, b: 1 },
    'text-on-bg-error-subtle': { r: 0.8, g: 0.2, b: 0.2 },
    'text-on-bg-success-subtle': { r: 0.2, g: 0.8, b: 0.2 }
  }
};

const BUTTON_STYLES: Record<ButtonVariant, ButtonStyle> = {
  primary: {
    bg: 'background/bg-primary',
    text: 'text/text-on-bg-primary'
  },
  secondary: {
    bg: 'background/bg-primary-subtle',
    text: 'text/text-on-bg-primary-subtle'
  },
  destructive: {
    bg: 'background/bg-error',
    text: 'text/text-on-bg-error'
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
    frame.itemSpacing = 0; // Remove spacing between items
    frame.paddingLeft = 0; // Remove left padding
    frame.paddingRight = 0; // Remove right padding
    frame.paddingTop = 0; // Remove top padding
    frame.paddingBottom = 0; // Remove bottom padding
    frame.layoutAlign = "CENTER"; // Center the frame
    frame.counterAxisAlignItems = "CENTER"; // Center children

    // Create three main columns
    const leftColumn = await createFixedWidthFrame(await createFeaturedCard(semanticCollection || collection), "surface/surface-base-default", semanticCollection || collection);
    const middleColumn = await createFixedWidthFrame(await createProductList(semanticCollection || collection), "surface/surface-base-secondary", semanticCollection || collection);
    const rightColumn = await createFixedWidthFrame(await createNotifications(semanticCollection || collection), "surface/surface-base-default", semanticCollection || collection);

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
    "surface/surface-base-default", // Set background color to surface/surface-base-default
    'backgrounds'
  );

  // Set stroke color with error handling
  await applyVariableWithFallback(
    button,
    collection,
    "border/border-with-any-surface", // Set stroke color to border/border-with-surface
    'backgrounds'
  );

  const buttonText = figma.createText();
  buttonText.characters = text;
  buttonText.fontSize = 14;
  buttonText.fontName = { family: "Inter", style: "Medium" };
  buttonText.layoutAlign = "CENTER";
  buttonText.textAlignHorizontal = "CENTER";

  // Set text color to "text/text-link"
  await applyVariableWithFallback(
    buttonText,
    collection,
    "text/text-link",
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
    "border/border-with-any-surface",
    'backgrounds'
  );

  // Set surface color with error handling
  await applyVariableWithFallback(
    card,
    collection,
    "surface/surface-primary",
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
    "surface/surface-secondary",
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
    "text/text-default",
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
    "text/text-secondary",
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
    "surface/surface-base-default",
    'backgrounds'
  );

  // Set border/stroke color with error handling
  await applyVariableWithFallback(
    list,
    collection,
    "border/border-with-any-surface",
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
        "border/border-with-any-surface",
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
    "surface/surface-base-secondary",
    'backgrounds'
  );

  // Set stroke color with error handling
  thumbnail.strokeWeight = 0.5;
  await applyVariableWithFallback(
    thumbnail,
    collection,
    "border/border-with-any-surface",
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
    "text/text-default",
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
    "text/text-secondary",
    'text'
  );

  content.appendChild(itemTitle);
  content.appendChild(description);

  autoLayoutFrame.appendChild(thumbnail);
  autoLayoutFrame.appendChild(content);

  const style = BUTTON_STYLES[buttonVariant];
  const button = await createButton(collection, "Button", style.bg, "text/text-link"); // Use "text/text-link" for mini buttons
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
      textVar: "text-on-bg-error-subtle" 
    },
    { 
      message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer euismod sodales nam tomer lima consequat.", 
      bgVar: "bg-success-subtle", 
      textVar: "text-on-bg-success-subtle" 
    },
    { 
      message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer euismod sodales nam tomer lima consequat.", 
      bgVar: "bg-primary-subtle", 
      textVar: "text-on-bg-primary-subtle" 
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
  textVarName: keyof typeof FALLBACK_COLORS.text,
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
    bgVarName === "bg-error-subtle" ? "border/border-with-bg-error-subtle" :
    bgVarName === "bg-success-subtle" ? "border/border-with-bg-success-subtle" :
    "border/border-with-bg-primary-subtle",
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
                id: (await findVariable(collection, "icon/icon-on-bg-error-subtle"))?.id || ""
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
            id: (await findVariable(collection, "icon/icon-on-bg-success-subtle"))?.id || ""
          }
        }
      }];
    }

    notification.appendChild(newSvgNode);
  }

  // Add the new SVG to the third notification
  if (bgVarName === "bg-primary-subtle") {
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
            id: (await findVariable(collection, "icon/icon-on-bg-primary-subtle"))?.id || ""
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
    `text/${textVarName}`,
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

interface PluginMessage {
  type: string;
  hexColor: string;
  neutral: string;  
  success: string;  
  error: string;
  appearance: "light" | "dark" | "both";
  includePrimitives: boolean;
  exportDemo: boolean;  // Add this line
}

// Main message handler modification
figma.ui.onmessage = async (msg: PluginMessage) => {
  if (msg.type === "generate-palette") {
    const { hexColor, neutral, success, error, appearance, includePrimitives, exportDemo } = msg;
    try {
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

        // Create demo components if enabled
        if (exportDemo) {
          await exportDemoComponents(primitiveCollection, semanticCollection);
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

        // Create demo components if enabled
        if (exportDemo) {
          await exportDemoComponents(collection);
        }
      }

      if (!isClosing) {
        figma.notify(`Successfully created color system with version ${versionNumber}`);
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
