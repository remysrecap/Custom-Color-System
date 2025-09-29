import { generateRadixColors } from "radix-theme-generator";
import { RadixTheme, PluginMessage } from '../core/types';
import { logError, isValidHexColor, retryWithBackoff } from '../core/utils';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../core/constants';
import { log } from '../core/logger';

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

  // Generate dark themes
  const darkBrandTheme: RadixTheme = generateRadixColors({
    appearance: "dark",
    accent: hexColor,
    gray: "#555555",
    background: "#1C1C1C"
  });

  const darkNeutralTheme: RadixTheme = generateRadixColors({
    appearance: "dark",
    accent: neutral,
    gray: "#555555",
    background: "#1C1C1C"
  });

  const darkErrorTheme: RadixTheme = generateRadixColors({
    appearance: "dark",
    accent: error,
    gray: "#555555",
    background: "#1C1C1C"
  });

  const darkSuccessTheme: RadixTheme = generateRadixColors({
    appearance: "dark",
    accent: success,
    gray: "#555555",
    background: "#1C1C1C"
  });

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
        log(`Updated color variable: ${name} (${modeId})`, 'info');
        return existingVariable;
      } else {
        // Create new variable
        const variable = figma.variables.createVariable(name, collection, "COLOR");
        variable.setValueForMode(modeId, value);
        log(`Created color variable: ${name} (${modeId})`, 'success');
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
        log(`Updated hardcoded variable: ${name} (${modeId})`, 'info');
        return existingVariable;
      } else {
        // Create new variable
        const variable = figma.variables.createVariable(name, collection, "COLOR");
        variable.setValueForMode(modeId, value);
        log(`Created hardcoded variable: ${name} (${modeId})`, 'success');
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
        log(`Updated contrast color variable: ${name} (${modeId}): ${colorHex}`, 'info');
        return existingVariable;
      } else {
        // Create new variable
        const variable = figma.variables.createVariable(name, collection, "COLOR");
        variable.setValueForMode(modeId, rgba);
        log(`Created contrast color variable: ${name} (${modeId}): ${colorHex}`, 'success');
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
export async function createPrimitiveVariables(
  collection: VariableCollection, 
  modeId: string,
  brandTheme: RadixTheme,
  neutralTheme: RadixTheme,
  successTheme: RadixTheme,
  errorTheme: RadixTheme
): Promise<void> {
  log.info(`Creating primitive variables for mode: ${modeId}`, 'color-system', 'createPrimitiveVariables');
  
  try {
    // Create brand color scales
    await Promise.all(brandTheme.accentScale.map((color, index) => 
      createOrUpdateColorVariable(collection, modeId, `Brand Scale/${index + 1}`, color)
    ));

    await Promise.all(brandTheme.accentScaleAlpha.map((color, index) => 
      createOrUpdateColorVariable(collection, modeId, `Brand Scale Alpha/${index + 1}`, color)
    ));

    await createOrUpdateColorVariable(collection, modeId, `Brand Contrast/1`, brandTheme.accentContrast);

    // Create neutral color scales
    await Promise.all(neutralTheme.accentScale.map((color, index) => 
      createOrUpdateColorVariable(collection, modeId, `Neutral Scale/${index + 1}`, color)
    ));

    await Promise.all(neutralTheme.accentScaleAlpha.map((color, index) => 
      createOrUpdateColorVariable(collection, modeId, `Neutral Scale Alpha/${index + 1}`, color)
    ));

    // Create success color scales
    await Promise.all(successTheme.accentScale.map((color, index) => 
      createOrUpdateColorVariable(collection, modeId, `Success Scale/${index + 1}`, color)
    ));

    await Promise.all(successTheme.accentScaleAlpha.map((color, index) => 
      createOrUpdateColorVariable(collection, modeId, `Success Scale Alpha/${index + 1}`, color)
    ));

    await createOrUpdateColorVariable(collection, modeId, `Success Contrast/1`, successTheme.accentContrast);

    // Create error color scales
    await Promise.all(errorTheme.accentScale.map((color, index) => 
      createOrUpdateColorVariable(collection, modeId, `Error Scale/${index + 1}`, color)
    ));

    await Promise.all(errorTheme.accentScaleAlpha.map((color, index) => 
      createOrUpdateColorVariable(collection, modeId, `Error Scale Alpha/${index + 1}`, color)
    ));

    await createOrUpdateColorVariable(collection, modeId, `Error Contrast/1`, errorTheme.accentContrast);

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

    // Create semantic variables for light mode
    await createSemanticVariablesForMode(semanticCollection, primitiveCollection, lightMode.modeId);

    // Create semantic variables for dark mode if needed
    if (appearance === "dark" || appearance === "both") {
      const darkModeId = appearance === "both" ? 
        semanticCollection.addMode("Dark") : lightMode.modeId;
      await createSemanticVariablesForMode(semanticCollection, primitiveCollection, darkModeId);
    }

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
  // This would contain the semantic variable creation logic
  // For now, it's a placeholder that would be filled with the actual implementation
  log(`Creating semantic variables for mode: ${modeId}`, 'info');
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
    // Create brand variables
    await createOrUpdateColorVariable(collection, modeId, "Brand", brandTheme.accentScale[8]);
    await createOrUpdateColorVariable(collection, modeId, "Brand Hover", brandTheme.accentScale[9]);
    await createOrUpdateColorVariable(collection, modeId, "Brand Active", brandTheme.accentScale[10]);
    await createOrUpdateColorVariable(collection, modeId, "Brand Contrast", brandTheme.accentContrast);

    // Create neutral variables
    await createOrUpdateColorVariable(collection, modeId, "Neutral", neutralTheme.accentScale[8]);
    await createOrUpdateColorVariable(collection, modeId, "Neutral Hover", neutralTheme.accentScale[9]);
    await createOrUpdateColorVariable(collection, modeId, "Neutral Active", neutralTheme.accentScale[10]);

    // Create success variables
    await createOrUpdateColorVariable(collection, modeId, "Success", successTheme.accentScale[8]);
    await createOrUpdateColorVariable(collection, modeId, "Success Hover", successTheme.accentScale[9]);
    await createOrUpdateColorVariable(collection, modeId, "Success Active", successTheme.accentScale[10]);
    await createOrUpdateColorVariable(collection, modeId, "Success Contrast", successTheme.accentContrast);

    // Create error variables
    await createOrUpdateColorVariable(collection, modeId, "Error", errorTheme.accentScale[8]);
    await createOrUpdateColorVariable(collection, modeId, "Error Hover", errorTheme.accentScale[9]);
    await createOrUpdateColorVariable(collection, modeId, "Error Active", errorTheme.accentScale[10]);
    await createOrUpdateColorVariable(collection, modeId, "Error Contrast", errorTheme.accentContrast);

    log.success('Direct variables created successfully', 'color-system', 'createDirectVariables');
  } catch (error) {
    logError('Failed to create direct variables', error as Error);
    throw error;
  }
}
