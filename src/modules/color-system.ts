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
    await Promise.all([
      createSemanticVar("surface/sf-neutral-primary", "Background/1"),
      createSemanticVar("surface/sf-neutral-secondary", "Neutral Scale/2"),
      createSemanticVar("surface/sf-brand-primary", "Brand Scale/2"),
      createSemanticVar("surface/sf-brand-primary-emphasized", "Brand Scale/3"),
      createSemanticVar("surface/sf-shadow", "Neutral Scale Alpha/4"),
      createHardcodedVar("surface/sf-overlay", { r: 0, g: 0, b: 0, a: 0.65 })
    ]);

    // Get accessibility variable ID with fallback to brand9
    const accessibilityVarId = await findExistingVariable(primitiveCollection, "Accessibility/1");
    const brand9VarId = await findExistingVariable(primitiveCollection, "Brand Scale/9");
    const linkVarId = accessibilityVarId || brand9VarId;

    // Create text & icon variables
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

    // Create background variables
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
    
    // Continue with the rest
    await Promise.all([
      createOrUpdateColorVariable(collection, modeId, "surface/sf-neutral-secondary", neutralTheme.accentScale[1]),
      createOrUpdateColorVariable(collection, modeId, "surface/sf-brand-primary", brandTheme.accentScale[1]),
      createOrUpdateColorVariable(collection, modeId, "surface/sf-brand-primary-emphasized", brandTheme.accentScale[2]),
      createOrUpdateColorVariable(collection, modeId, "surface/sf-shadow", neutralTheme.accentScaleAlpha[3])
    ]);

    // Text & Icon variables
    await Promise.all([
      createOrUpdateColorVariable(collection, modeId, "text-icon/ti-neutral-primary", neutralTheme.accentScale[12]),
      createOrUpdateColorVariable(collection, modeId, "text-icon/ti-neutral-secondary", neutralTheme.accentScale[11]),
      createOrUpdateColorVariable(collection, modeId, "text-icon/ti-brand-primary", brandTheme.accentScale[9]),
      createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-brand-primary", brandTheme.accentContrast),
      createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-brand-primary-subtle", brandTheme.accentScale[11]),
      createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-error", errorTheme.accentContrast),
      createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-error-subtle", errorTheme.accentScale[11]),
      createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-success", successTheme.accentContrast),
      createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-success-subtle", successTheme.accentScale[11])
    ]);

    // Background variables
    await Promise.all([
      createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary", brandTheme.accentScale[9]),
      createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-emphasized", brandTheme.accentScale[10]),
      createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-subtle", brandTheme.accentScale[3]),
      createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-subtle-emphasized", brandTheme.accentScale[4]),
      createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-overlay", brandTheme.accentScaleAlpha[6]),
      createOrUpdateColorVariable(collection, modeId, "background/bg-error", errorTheme.accentScale[9]),
      createOrUpdateColorVariable(collection, modeId, "background/bg-error-emphasized", errorTheme.accentScale[10]),
      createOrUpdateColorVariable(collection, modeId, "background/bg-error-subtle", errorTheme.accentScale[3]),
      createOrUpdateColorVariable(collection, modeId, "background/bg-error-subtle-emphasized", errorTheme.accentScale[4]),
      createOrUpdateColorVariable(collection, modeId, "background/bg-success", successTheme.accentScale[9]),
      createOrUpdateColorVariable(collection, modeId, "background/bg-success-emphasized", successTheme.accentScale[10]),
      createOrUpdateColorVariable(collection, modeId, "background/bg-success-subtle", successTheme.accentScale[3]),
      createOrUpdateColorVariable(collection, modeId, "background/bg-success-subtle-emphasized", successTheme.accentScale[4])
    ]);

    // Hardcoded variables
    log.info(`Creating hardcoded variables for mode: ${modeId}`, 'color-system', 'createDirectVariables');
    await Promise.all([
      createOrUpdateHardcodedVar(collection, modeId, "surface/sf-overlay", { r: 0, g: 0, b: 0, a: 0.65 }),
      createOrUpdateHardcodedVar(collection, modeId, "text-icon/ti-on-surface-overlay", { r: 1, g: 1, b: 1, a: 1 })
    ]);
    log.info(`Finished creating hardcoded variables`, 'color-system', 'createDirectVariables');

    log.success('Direct variables created successfully', 'color-system', 'createDirectVariables');
  } catch (error) {
    logError('Failed to create direct variables', error as Error);
    throw error;
  }
}
