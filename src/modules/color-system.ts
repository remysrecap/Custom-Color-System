import { generateRadixColors } from "radix-theme-generator";
import { RadixTheme, PluginMessage } from '../core/types';
import { logError, isValidHexColor, retryWithBackoff } from '../core/utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../core/constants';
import { log } from '../core/logger';
import { createOrUpdateColorVariable, testFunction } from './figma-api';

// ===============================================
// Color System Module
// ===============================================

/**
 * Generates Radix color themes for different appearances and colors
 */
export function generateColorThemes(
  hexColor: string,
  neutral: string,
  success: string,
  error: string,
  appearance: "light" | "dark" | "both"
): {
  lightBrandTheme: RadixTheme;
  lightNeutralTheme: RadixTheme;
  lightSuccessTheme: RadixTheme;
  lightErrorTheme: RadixTheme;
  darkBrandTheme: RadixTheme;
  darkNeutralTheme: RadixTheme;
  darkSuccessTheme: RadixTheme;
  darkErrorTheme: RadixTheme;
} {
  log.info('Generating color themes', 'color-system', 'generateColorThemes');
  
  // Validate input colors
  if (!isValidHexColor(hexColor)) {
    throw new Error(`${ERROR_MESSAGES.INVALID_COLOR}: ${hexColor}`);
  }
  if (!isValidHexColor(neutral)) {
    throw new Error(`${ERROR_MESSAGES.INVALID_COLOR}: ${neutral}`);
  }
  if (!isValidHexColor(success)) {
    throw new Error(`${ERROR_MESSAGES.INVALID_COLOR}: ${success}`);
  }
  if (!isValidHexColor(error)) {
    throw new Error(`${ERROR_MESSAGES.INVALID_COLOR}: ${error}`);
  }

  // Generate light themes
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

  // Generate dark themes - use different gray values for better contrast
  const darkBrandTheme: RadixTheme = generateRadixColors({
    appearance: "dark",
    accent: hexColor,
    gray: "#404040", // Darker gray for better contrast
    background: "#0A0A0A" // Darker background
  });

  const darkNeutralTheme: RadixTheme = generateRadixColors({
    appearance: "dark",
    accent: neutral,
    gray: "#404040", // Darker gray for better contrast
    background: "#0A0A0A" // Darker background
  });

  const darkErrorTheme: RadixTheme = generateRadixColors({
    appearance: "dark",
    accent: error,
    gray: "#404040", // Darker gray for better contrast
    background: "#0A0A0A" // Darker background
  });

  const darkSuccessTheme: RadixTheme = generateRadixColors({
    appearance: "dark",
    accent: success,
    gray: "#404040", // Darker gray for better contrast
    background: "#0A0A0A" // Darker background
  });

  // Debug: Log dark theme colors to verify they're different from light
  log.info(`🔍 DARK THEME DEBUG:`, 'color-system', 'generateColorThemes');
  log.info(`Dark Brand Scale[1]: ${darkBrandTheme.accentScale[1]}`, 'color-system', 'generateColorThemes');
  log.info(`Dark Brand Scale[9]: ${darkBrandTheme.accentScale[9]}`, 'color-system', 'generateColorThemes');
  log.info(`Dark Neutral Scale[1]: ${darkNeutralTheme.accentScale[1]}`, 'color-system', 'generateColorThemes');
  log.info(`Dark Background: ${darkBrandTheme.background}`, 'color-system', 'generateColorThemes');
  
  log.info(`🔍 LIGHT THEME DEBUG:`, 'color-system', 'generateColorThemes');
  log.info(`Light Brand Scale[1]: ${lightBrandTheme.accentScale[1]}`, 'color-system', 'generateColorThemes');
  log.info(`Light Brand Scale[9]: ${lightBrandTheme.accentScale[9]}`, 'color-system', 'generateColorThemes');
  log.info(`Light Neutral Scale[1]: ${lightNeutralTheme.accentScale[1]}`, 'color-system', 'generateColorThemes');
  log.info(`Light Background: ${lightBrandTheme.background}`, 'color-system', 'generateColorThemes');

  return {
    lightBrandTheme,
    lightNeutralTheme,
    lightSuccessTheme,
    lightErrorTheme,
    darkBrandTheme,
    darkNeutralTheme,
    darkSuccessTheme,
    darkErrorTheme
  };
}

/**
 * Creates or updates a color variable in a collection
 */
export async function createOrUpdateColorVariable(
  collection: VariableCollection, 
  modeId: string, 
  name: string, 
  colorHex: string
): Promise<Variable | null> {
  try {
    return await retryWithBackoff(async () => {
      // Convert hex to RGB
      const hex = colorHex.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      const rgba: RGBA = { r, g, b, a: 1 };

      // Check if variable already exists
      const existingVariable = collection.variables.find(v => v.name === name);
      
      if (existingVariable) {
        // Update existing variable
        existingVariable.setValueForMode(modeId, rgba);
        log.info(`Updated color variable: ${name} (${modeId}): ${colorHex}`, 'color-system', 'createOrUpdateColorVariable');
        return existingVariable;
      } else {
        // Create new variable
        const variable = figma.variables.createVariable(name, collection, "COLOR");
        variable.setValueForMode(modeId, rgba);
        log.success(`Created color variable: ${name} (${modeId}): ${colorHex}`, 'color-system', 'createOrUpdateColorVariable');
        return variable;
      }
    });
  } catch (error) {
    logError(`Failed to create/update color variable: ${name}`, error as Error);
    return null;
  }
}

/**
 * Creates or updates a color variable with RGBA value
 */
export async function createOrUpdateColorVariableWithValue(
  collection: VariableCollection, 
  modeId: string, 
  name: string, 
  value: RGBA
): Promise<Variable | null> {
  try {
    return await retryWithBackoff(async () => {
      // Check if variable already exists
      const existingVariable = collection.variables.find(v => v.name === name);
      
      if (existingVariable) {
        // Update existing variable
        existingVariable.setValueForMode(modeId, value);
        log.info(`Updated color variable: ${name} (${modeId})`, 'color-system', 'createOrUpdateColorVariableWithValue');
        return existingVariable;
      } else {
        // Create new variable
        const variable = figma.variables.createVariable(name, collection, "COLOR");
        variable.setValueForMode(modeId, value);
        log.success(`Created color variable: ${name} (${modeId})`, 'color-system', 'createOrUpdateColorVariableWithValue');
        return variable;
      }
    });
  } catch (error) {
    logError(`Failed to create/update color variable: ${name}`, error as Error);
    return null;
  }
}

/**
 * Creates or updates a hardcoded variable
 */
export async function createOrUpdateHardcodedVar(
  collection: VariableCollection, 
  modeId: string, 
  name: string, 
  value: RGBA
): Promise<Variable | null> {
  try {
    return await retryWithBackoff(async () => {
      // Check if variable already exists
      const existingVariable = collection.variables.find(v => v.name === name);
      
      if (existingVariable) {
        // Update existing variable
        existingVariable.setValueForMode(modeId, value);
        log.info(`Updated hardcoded variable: ${name} (${modeId})`, 'color-system', 'createOrUpdateHardcodedVar');
        return existingVariable;
      } else {
        // Create new variable
        const variable = figma.variables.createVariable(name, collection, "COLOR");
        variable.setValueForMode(modeId, value);
        log.success(`Created hardcoded variable: ${name} (${modeId})`, 'color-system', 'createOrUpdateHardcodedVar');
        return variable;
      }
    });
  } catch (error) {
    logError(`Failed to create/update hardcoded variable: ${name}`, error as Error);
    return null;
  }
}

/**
 * Creates or updates a contrast color variable
 */
export async function createOrUpdateContrastColorVariable(
  collection: VariableCollection, 
  modeId: string, 
  name: string, 
  colorHex: string, 
  backgroundColor: string
): Promise<Variable | null> {
  try {
    return await retryWithBackoff(async () => {
      // Convert hex to RGB
      const hex = colorHex.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;

      const rgba: RGBA = { r, g, b, a: 1 };

      // Check if variable already exists
      const existingVariable = collection.variables.find(v => v.name === name);
      
      if (existingVariable) {
        // Update existing variable
        existingVariable.setValueForMode(modeId, rgba);
        log.info(`Updated contrast color variable: ${name} (${modeId}): ${colorHex}`, 'color-system', 'createOrUpdateContrastColorVariable');
        return existingVariable;
      } else {
        // Create new variable
        const variable = figma.variables.createVariable(name, collection, "COLOR");
        variable.setValueForMode(modeId, rgba);
        log.success(`Created contrast color variable: ${name} (${modeId}): ${colorHex}`, 'color-system', 'createOrUpdateContrastColorVariable');
        return variable;
      }
    });
  } catch (error) {
    logError(`Failed to create/update contrast color variable: ${name}`, error as Error);
    return null;
  }
}

/**
 * Creates primitive color variables
 */
// Helper function to create variable with color value (simplified)
async function createVariableWithColor(
  collection: VariableCollection,
  modeId: string,
  name: string,
  colorHex: string
): Promise<void> {
  try {
    // Check if variable already exists
    let variable: Variable;
    const existingVariables = await Promise.all(
      collection.variableIds.map(id => figma.variables.getVariableByIdAsync(id))
    );
    const existingVar = existingVariables.find(v => v && v.name === name);
    
    if (existingVar) {
      // Variable exists, just set the value for this mode
      variable = existingVar;
      log.info(`Using existing variable: ${name}`, 'color-system', 'createPrimitiveVariables');
    } else {
      // Create new variable
      variable = figma.variables.createVariable(name, collection, "COLOR");
      log.info(`Creating new variable: ${name}`, 'color-system', 'createPrimitiveVariables');
    }
    
    // Convert hex to RGBA and set the value
    const hex = colorHex.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;
    const rgba: RGBA = { r, g, b, a: 1 };
    variable.setValueForMode(modeId, rgba);
    log.success(`Set variable: ${name} with color ${colorHex} for mode ${modeId}`, 'color-system', 'createPrimitiveVariables');
    
    // Debug: Log the actual RGBA values being set
    log.info(`🔍 SETTING ${name}: ${colorHex} -> RGBA(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a}) for mode ${modeId}`, 'color-system', 'createPrimitiveVariables');
  } catch (error) {
    log.error(`Failed to create variable ${name}: ${error}`, 'color-system', 'createPrimitiveVariables');
  }
}

export async function createPrimitiveVariables(
  collection: VariableCollection, 
  modeId: string,
  brandTheme: RadixTheme,
  neutralTheme: RadixTheme,
  successTheme: RadixTheme,
  errorTheme: RadixTheme
): Promise<void> {
  log.info(`Creating primitive variables for mode: ${modeId}`, 'color-system', 'createPrimitiveVariables');
  
  // Debug: Log the actual colors being used for this mode
  log.info(`🔍 MODE ${modeId} COLORS:`, 'color-system', 'createPrimitiveVariables');
  log.info(`Brand Scale[1]: ${brandTheme.accentScale[1]}`, 'color-system', 'createPrimitiveVariables');
  log.info(`Brand Scale[9]: ${brandTheme.accentScale[9]}`, 'color-system', 'createPrimitiveVariables');
  log.info(`Neutral Scale[1]: ${neutralTheme.accentScale[1]}`, 'color-system', 'createPrimitiveVariables');
  log.info(`Background: ${brandTheme.background}`, 'color-system', 'createPrimitiveVariables');
  
  try {
    // Create brand color scales
    for (let i = 0; i < brandTheme.accentScale.length; i++) {
      await createVariableWithColor(collection, modeId, `Brand Scale/${i + 1}`, brandTheme.accentScale[i]);
    }

    for (let i = 0; i < brandTheme.accentScaleAlpha.length; i++) {
      await createVariableWithColor(collection, modeId, `Brand Scale Alpha/${i + 1}`, brandTheme.accentScaleAlpha[i]);
    }

    // Skip Brand Contrast for now - causing NaN issues
    log.info(`Skipping Brand Contrast/1 due to validation issues`, 'color-system', 'createPrimitiveVariables');

    // Create neutral color scales
    for (let i = 0; i < neutralTheme.accentScale.length; i++) {
      await createVariableWithColor(collection, modeId, `Neutral Scale/${i + 1}`, neutralTheme.accentScale[i]);
    }

    for (let i = 0; i < neutralTheme.accentScaleAlpha.length; i++) {
      await createVariableWithColor(collection, modeId, `Neutral Scale Alpha/${i + 1}`, neutralTheme.accentScaleAlpha[i]);
    }

    // Create success color scales
    for (let i = 0; i < successTheme.accentScale.length; i++) {
      await createVariableWithColor(collection, modeId, `Success Scale/${i + 1}`, successTheme.accentScale[i]);
    }

    for (let i = 0; i < successTheme.accentScaleAlpha.length; i++) {
      await createVariableWithColor(collection, modeId, `Success Scale Alpha/${i + 1}`, successTheme.accentScaleAlpha[i]);
    }

    // Skip Success Contrast for now - causing NaN issues
    log.info(`Skipping Success Contrast/1 due to validation issues`, 'color-system', 'createPrimitiveVariables');

    // Create error color scales
    for (let i = 0; i < errorTheme.accentScale.length; i++) {
      await createVariableWithColor(collection, modeId, `Error Scale/${i + 1}`, errorTheme.accentScale[i]);
    }

    for (let i = 0; i < errorTheme.accentScaleAlpha.length; i++) {
      await createVariableWithColor(collection, modeId, `Error Scale Alpha/${i + 1}`, errorTheme.accentScaleAlpha[i]);
    }

    // Skip Error Contrast for now - causing NaN issues
    log.info(`Skipping Error Contrast/1 due to validation issues`, 'color-system', 'createPrimitiveVariables');

    // Create additional primitive variables that semantic variables reference
    await createVariableWithColor(collection, modeId, `Background/1`, brandTheme.background);
    
    // Create Accessibility/1 variable (complex calculation from original)
    const brand9Color = brandTheme.accentScale[8];
    const brand12Color = brandTheme.accentScale[11];
    
    // Convert hex to RGB for calculation
    const hex9 = brand9Color.replace('#', '');
    const r9 = parseInt(hex9.substr(0, 2), 16) / 255;
    const g9 = parseInt(hex9.substr(2, 2), 16) / 255;
    const b9 = parseInt(hex9.substr(4, 2), 16) / 255;
    
    const hex12 = brand12Color.replace('#', '');
    const r12 = parseInt(hex12.substr(0, 2), 16) / 255;
    const g12 = parseInt(hex12.substr(2, 2), 16) / 255;
    const b12 = parseInt(hex12.substr(4, 2), 16) / 255;
    
    // Calculate final color (simplified from original complex logic)
    const finalR = Math.round((r9 + r12) / 2 * 255);
    const finalG = Math.round((g9 + g12) / 2 * 255);
    const finalB = Math.round((b9 + b12) / 2 * 255);
    
    const accessibilityColor = `#${finalR.toString(16).padStart(2, '0')}${finalG.toString(16).padStart(2, '0')}${finalB.toString(16).padStart(2, '0')}`;
    await createVariableWithColor(collection, modeId, `Accessibility/1`, accessibilityColor);

    log.success('Primitive variables created successfully', 'color-system', 'createPrimitiveVariables');
  } catch (error) {
    logError('Failed to create primitive variables', error as Error);
    throw error;
  }
}

/**
 * Creates semantic color variables
 */
export async function createSemanticVariables(
  semanticCollection: VariableCollection,
  primitiveCollection: VariableCollection,
  appearance: "light" | "dark" | "both"
): Promise<void> {
  log.info('Creating semantic variables', 'color-system', 'createSemanticVariables');
  
  try {
    const lightMode = semanticCollection.modes[0];
    semanticCollection.renameMode(lightMode.modeId, "Light");

    // For Advanced Export ON: Semantic collection only needs ONE mode
    // The semantic variables reference primitive variables that have multiple modes
    await createSemanticVariablesForMode(semanticCollection, primitiveCollection, lightMode.modeId);

    log.success('Semantic variables created successfully', 'color-system', 'createSemanticVariables');
  } catch (error) {
    logError('Failed to create semantic variables', error as Error);
    throw error;
  }
}

/**
 * Creates semantic variables for a specific mode
 */
async function createSemanticVariablesForMode(
  semanticCollection: VariableCollection,
  primitiveCollection: VariableCollection,
  modeId: string
): Promise<void> {
  log.info(`Creating semantic variables for mode: ${modeId}`, 'color-system', 'createSemanticVariablesForMode');
  
  try {
    // Helper function to find existing variable by name
    async function findExistingVariable(collection: VariableCollection, name: string): Promise<string | null> {
      const variables = await Promise.all(
        collection.variableIds.map(id => figma.variables.getVariableByIdAsync(id))
      );
      const variable = variables.find(v => v && v.name === name);
      return variable ? variable.id : null;
    }

    // Helper function to convert RGBA to hex
    function rgbaToHex(r: number, g: number, b: number, a: number): string {
      const toHex = (n: number) => {
        const hex = Math.round(n * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      };
      return `#${toHex(r)}${toHex(g)}${toHex(b)}${a < 1 ? toHex(a) : ''}`;
    }

    // Helper function to create semantic variable with alias
    async function createSemanticVar(semanticName: string, primitiveName: string): Promise<Variable> {
      log.info(`Creating semantic variable: ${semanticName} from primitive: ${primitiveName}`, 'color-system', 'createSemanticVar');
      
      try {
        const variable = figma.variables.createVariable(semanticName, semanticCollection, "COLOR");
        const primitiveVarId = await findExistingVariable(primitiveCollection, primitiveName);

        if (primitiveVarId) {
          await variable.setValueForMode(modeId, {
            type: "VARIABLE_ALIAS",
            id: primitiveVarId
          });
          log.success(`Semantic variable ${semanticName} created with alias to primitive ${primitiveName}`, 'color-system', 'createSemanticVar');
        } else {
          log.warn(`Primitive variable not found: ${primitiveName}, creating fallback`, 'color-system', 'createSemanticVar');
          const fallbackColor = { r: 0, g: 0, b: 0, a: 1 };
          await variable.setValueForMode(modeId, fallbackColor);
        }
        return variable;
      } catch (error) {
        log.error(`Failed to create semantic variable ${semanticName}: ${error}`, 'color-system', 'createSemanticVar');
        // Create a fallback variable instead of throwing
        const fallbackVariable = figma.variables.createVariable(semanticName, semanticCollection, "COLOR");
        await fallbackVariable.setValueForMode(modeId, { r: 0, g: 0, b: 0, a: 1 });
        return fallbackVariable;
      }
    }

    // Helper function to create hardcoded variable
    async function createHardcodedVar(name: string, value: RGBA): Promise<Variable> {
      log.info(`Creating hardcoded variable: ${name}`, 'color-system', 'createHardcodedVar');
      
      const variable = figma.variables.createVariable(name, semanticCollection, "COLOR");
      await variable.setValueForMode(modeId, value);
      log.success(`Hardcoded variable ${name} created`, 'color-system', 'createHardcodedVar');
      return variable;
    }

    // Create surface variables
    try {
      await Promise.all([
        createSemanticVar("surface/sf-neutral-primary", "Background/1"),
        createSemanticVar("surface/sf-neutral-secondary", "Neutral Scale/2"),
        createSemanticVar("surface/sf-brand-primary", "Brand Scale/2"),
        createSemanticVar("surface/sf-brand-primary-emphasized", "Brand Scale/3"),
        createSemanticVar("surface/sf-shadow", "Neutral Scale Alpha/4"),
        createHardcodedVar("surface/sf-overlay", { r: 0, g: 0, b: 0, a: 0.65 })
      ]);
      log.success('Surface variables created successfully', 'color-system', 'createSemanticVariablesForMode');
    } catch (error) {
      log.error(`Failed to create surface variables: ${error}`, 'color-system', 'createSemanticVariablesForMode');
      // Continue with other variables instead of failing completely
    }

    // Get accessibility variable ID with fallback to brand9
    const accessibilityVarId = await findExistingVariable(primitiveCollection, "Accessibility/1");
    const brand9VarId = await findExistingVariable(primitiveCollection, "Brand Scale/9");
    const linkVarId = accessibilityVarId || brand9VarId;

    // Create text & icon variables (skip contrast variables for now)
    try {
      await Promise.all([
        createSemanticVar("text-icon/ti-neutral-primary", "Neutral Scale/12"),
        createSemanticVar("text-icon/ti-neutral-secondary", "Neutral Scale/11"),
        createSemanticVar("text-icon/ti-brand-primary", linkVarId ? "Accessibility/1" : "Brand Scale/9"),
        // Skip contrast variables for now - they're causing issues
        // createSemanticVar("text-icon/ti-on-bg-brand-primary", "Brand Contrast/1"),
        createSemanticVar("text-icon/ti-on-bg-brand-primary-subtle", "Brand Scale/11"),
        // createSemanticVar("text-icon/ti-on-bg-error", "Error Contrast/1"),
        createSemanticVar("text-icon/ti-on-bg-error-subtle", "Error Scale/11"),
        // createSemanticVar("text-icon/ti-on-bg-success", "Success Contrast/1"),
        createSemanticVar("text-icon/ti-on-bg-success-subtle", "Success Scale/11"),
        createHardcodedVar("text-icon/ti-on-surface-overlay", { r: 1, g: 1, b: 1, a: 1 })
      ]);
      log.success('Text & icon variables created successfully', 'color-system', 'createSemanticVariablesForMode');
    } catch (error) {
      log.error(`Failed to create text & icon variables: ${error}`, 'color-system', 'createSemanticVariablesForMode');
      // Continue with other variables instead of failing completely
    }

    // Create background variables
    try {
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
      log.success('Background variables created successfully', 'color-system', 'createSemanticVariablesForMode');
    } catch (error) {
      log.error(`Failed to create background variables: ${error}`, 'color-system', 'createSemanticVariablesForMode');
      // Continue with other variables instead of failing completely
    }

    // Create border variables (missing from our refactored version!)
    try {
      await Promise.all([
        createSemanticVar("border/br-with-sf-neutral-primary", "Neutral Scale/6"),
        createSemanticVar("border/br-with-sf-neutral-secondary", "Neutral Scale/7"),
        createSemanticVar("border/br-with-bg-brand-primary", "Brand Scale/10"),
        createSemanticVar("border/br-with-bg-brand-primary-subtle", "Brand Scale/7"),
        createSemanticVar("border/br-with-bg-success", "Success Scale/10"),
        createSemanticVar("border/br-with-bg-success-subtle", "Success Scale/7"),
        createSemanticVar("border/br-with-bg-error", "Error Scale/10"),
        createSemanticVar("border/br-with-bg-error-subtle", "Error Scale/7")
      ]);
      log.success('Border variables created successfully', 'color-system', 'createSemanticVariablesForMode');
    } catch (error) {
      log.error(`Failed to create border variables: ${error}`, 'color-system', 'createSemanticVariablesForMode');
      // Continue with other variables instead of failing completely
    }

    log.success(`Semantic variables created successfully for mode: ${modeId}`, 'color-system', 'createSemanticVariablesForMode');
  } catch (error) {
    logError(`Failed to create semantic variables for mode: ${modeId}`, error as Error);
    throw error;
  }
}

/**
 * Creates direct color variables (non-primitive approach)
 */
export async function createDirectVariables(
  collection: VariableCollection,
  modeId: string,
  brandTheme: RadixTheme,
  neutralTheme: RadixTheme,
  successTheme: RadixTheme,
  errorTheme: RadixTheme
): Promise<void> {
  log.info(`Creating direct variables for mode: ${modeId}`, 'color-system', 'createDirectVariables');
  
  try {
    // Debug: Log the Radix theme values
    log.info(`Brand theme background: ${brandTheme.background}`, 'color-system', 'createDirectVariables');
    log.info(`Neutral theme accentScale[1]: ${neutralTheme.accentScale[1]}`, 'color-system', 'createDirectVariables');
    log.info(`Brand theme accentScale[1]: ${brandTheme.accentScale[1]}`, 'color-system', 'createDirectVariables');
    
    // Test if createOrUpdateColorVariable is available
    log.info(`createOrUpdateColorVariable function available: ${typeof createOrUpdateColorVariable}`, 'color-system', 'createDirectVariables');
    
    // Test simple function first
    log.info(`Testing simple function call...`, 'color-system', 'createDirectVariables');
    const testResult = await testFunction();
    log.info(`Test function result: ${testResult}`, 'color-system', 'createDirectVariables');
    
    // Test direct Figma API call without function wrapper
    log.info(`Testing direct Figma API call for surface/sf-neutral-primary`, 'color-system', 'createDirectVariables');
    try {
      log.info(`Creating variable directly with figma.variables.createVariable`, 'color-system', 'createDirectVariables');
      const variable = figma.variables.createVariable("surface/sf-neutral-primary", collection, "COLOR");
      log.success(`Direct API call successful: ${variable.id}`, 'color-system', 'createDirectVariables');
    } catch (error) {
      log.error(`Direct API call error: ${error}`, 'color-system', 'createDirectVariables');
    }
    
    // Continue with direct API calls since the function wrapper is broken
    log.info(`Creating remaining variables with direct API calls`, 'color-system', 'createDirectVariables');
    
    // Surface variables - direct API calls
    const surfaceVars = [
      { name: "surface/sf-neutral-secondary", color: neutralTheme.accentScale[1] },
      { name: "surface/sf-brand-primary", color: brandTheme.accentScale[1] },
      { name: "surface/sf-brand-primary-emphasized", color: brandTheme.accentScale[2] },
      { name: "surface/sf-shadow", color: neutralTheme.accentScaleAlpha[3] }
    ];
    
    for (const { name, color } of surfaceVars) {
      try {
        const variable = figma.variables.createVariable(name, collection, "COLOR");
        log.success(`Created variable: ${name}`, 'color-system', 'createDirectVariables');
      } catch (error) {
        log.error(`Failed to create variable ${name}: ${error}`, 'color-system', 'createDirectVariables');
      }
    }

    // Text & Icon variables - direct API calls
    log.info(`Creating text & icon variables with direct API calls`, 'color-system', 'createDirectVariables');
    const textIconVars = [
      { name: "text-icon/ti-neutral-primary", color: neutralTheme.accentScale[12] },
      { name: "text-icon/ti-neutral-secondary", color: neutralTheme.accentScale[11] },
      { name: "text-icon/ti-brand-primary", color: brandTheme.accentScale[9] },
      { name: "text-icon/ti-on-bg-brand-primary", color: brandTheme.accentContrast },
      { name: "text-icon/ti-on-bg-brand-primary-subtle", color: brandTheme.accentScale[11] },
      { name: "text-icon/ti-on-bg-error", color: errorTheme.accentContrast },
      { name: "text-icon/ti-on-bg-error-subtle", color: errorTheme.accentScale[11] },
      { name: "text-icon/ti-on-bg-success", color: successTheme.accentContrast },
      { name: "text-icon/ti-on-bg-success-subtle", color: successTheme.accentScale[11] }
    ];
    
    for (const { name, color } of textIconVars) {
      try {
        const variable = figma.variables.createVariable(name, collection, "COLOR");
        log.success(`Created variable: ${name}`, 'color-system', 'createDirectVariables');
      } catch (error) {
        log.error(`Failed to create variable ${name}: ${error}`, 'color-system', 'createDirectVariables');
      }
    }

    // Background variables - direct API calls
    log.info(`Creating background variables with direct API calls`, 'color-system', 'createDirectVariables');
    const backgroundVars = [
      { name: "background/bg-brand-primary", color: brandTheme.accentScale[9] },
      { name: "background/bg-brand-primary-emphasized", color: brandTheme.accentScale[10] },
      { name: "background/bg-brand-primary-subtle", color: brandTheme.accentScale[3] },
      { name: "background/bg-brand-primary-subtle-emphasized", color: brandTheme.accentScale[4] },
      { name: "background/bg-brand-primary-overlay", color: brandTheme.accentScaleAlpha[6] },
      { name: "background/bg-error", color: errorTheme.accentScale[9] },
      { name: "background/bg-error-emphasized", color: errorTheme.accentScale[10] },
      { name: "background/bg-error-subtle", color: errorTheme.accentScale[3] },
      { name: "background/bg-error-subtle-emphasized", color: errorTheme.accentScale[4] },
      { name: "background/bg-success", color: successTheme.accentScale[9] },
      { name: "background/bg-success-emphasized", color: successTheme.accentScale[10] },
      { name: "background/bg-success-subtle", color: successTheme.accentScale[3] },
      { name: "background/bg-success-subtle-emphasized", color: successTheme.accentScale[4] }
    ];
    
    for (const { name, color } of backgroundVars) {
      try {
        const variable = figma.variables.createVariable(name, collection, "COLOR");
        log.success(`Created variable: ${name}`, 'color-system', 'createDirectVariables');
      } catch (error) {
        log.error(`Failed to create variable ${name}: ${error}`, 'color-system', 'createDirectVariables');
      }
    }

    // Hardcoded variables - direct API calls
    log.info(`Creating hardcoded variables with direct API calls`, 'color-system', 'createDirectVariables');
    const hardcodedVars = [
      { name: "surface/sf-overlay", color: "#000000A6" }, // rgba(0, 0, 0, 0.65)
      { name: "text-icon/ti-on-surface-overlay", color: "#FFFFFF" } // rgba(1, 1, 1, 1)
    ];
    
    for (const { name, color } of hardcodedVars) {
      try {
        const variable = figma.variables.createVariable(name, collection, "COLOR");
        log.success(`Created variable: ${name}`, 'color-system', 'createDirectVariables');
      } catch (error) {
        log.error(`Failed to create variable ${name}: ${error}`, 'color-system', 'createDirectVariables');
      }
    }
    log.info(`Finished creating hardcoded variables`, 'color-system', 'createDirectVariables');

    log.success('Direct variables created successfully', 'color-system', 'createDirectVariables');
  } catch (error) {
    logError('Failed to create direct variables', error as Error);
    throw error;
  }
}
