// Main entry point for the Custom Color System plugin
import { PluginStateManager } from './core/state';
import { ColorSystemManager } from './modules/color-system';
import { FontSystemManager } from './modules/font-system';
import { DemoSystemManager } from './modules/demo-system';
import { PluginMessage } from './core/types';
import { getNextVersionNumber } from './core/utils';

// Initialize state manager
const stateManager = new PluginStateManager();

// Initialize module managers
const colorSystemManager = new ColorSystemManager(stateManager);
const fontSystemManager = new FontSystemManager(stateManager);
const demoSystemManager = new DemoSystemManager(stateManager);

// Main message handler
figma.ui.onmessage = async (msg: PluginMessage) => {
  console.log('Received message:', msg);
  
  try {
    if (msg.type === "generate-palette") {
      await handleGeneratePalette(msg);
    } else if (msg.type === "test-gt-standard") {
      await handleTestGTStandard();
    } else if (msg.type === "discover-gt-standard") {
      await handleDiscoverGTStandard();
    } else if (msg.type === "update-font-mode") {
      await handleUpdateFontMode(msg);
    } else if (msg.type === "bind-font-variables") {
      await handleBindFontVariables();
    }
  } catch (error) {
    console.error('Error handling message:', error);
    stateManager.addError(`Plugin error: ${error.message}`);
    figma.notify('An error occurred while processing your request');
  }
};

// Handle generate palette message
async function handleGeneratePalette(msg: PluginMessage): Promise<void> {
  const { 
    hexColor = "#3B82F6", 
    neutral = "#6B7280", 
    success = "#10B981", 
    error = "#EF4444", 
    appearance = "both", 
    includePrimitives = true, 
    exportDemo = false, 
    exportDocumentation: shouldExportDocumentation = false, 
    includeFontSystem = false, 
    fontMode,
    fontFamily 
  } = msg;

  console.log('Starting palette generation with options:', {
    hexColor, neutral, success, error, appearance, 
    includePrimitives, exportDemo, shouldExportDocumentation, 
    includeFontSystem, fontMode, fontFamily
  });

  // Validate inputs before proceeding
  const validation = validateInputs({ hexColor, neutral, success, error, appearance, fontFamily });
  if (!validation.isValid) {
    console.error('Input validation failed:', validation.errors);
    stateManager.addError(`Input validation failed: ${validation.errors.join(', ')}`);
    figma.notify('Invalid input parameters. Please check your settings.');
    return;
  }

  // Update state with options
  stateManager.updateOptions({
    hexColor,
    neutral,
    success,
    error,
    appearance,
    includePrimitives,
    exportDemo,
    exportDocumentation: shouldExportDocumentation,
    fontFamily: fontFamily || 'none'
  });

  // Set font mode if specified
  const selectedFont = fontFamily || fontMode;
  if (selectedFont && selectedFont !== "none") {
    fontSystemManager.setFontMode(selectedFont);
  }

  // Get version number
  const versionNumber = await getNextVersionNumber();
  stateManager.updateConfig({ versionNumber });

  // Check if we should close the plugin
  const isClosing = stateManager.getConfig().isClosing;
  if (isClosing) {
    figma.closePlugin();
    return;
  }

  try {
    // Generate color themes using Radix - using the proven working logic
    const { generateRadixColors } = await import('radix-theme-generator');
    
    // Generate light themes
    const lightBrandTheme = generateRadixColors({
      appearance: "light",
      accent: hexColor,
      gray: "#CCCCCC",
      background: "#FFFFFF"
    });

    const lightNeutralTheme = generateRadixColors({
      appearance: "light",
      accent: neutral,
      gray: "#CCCCCC",
      background: "#FFFFFF"
    });

    const lightSuccessTheme = generateRadixColors({
      appearance: "light",
      accent: success,
      gray: "#CCCCCC",
      background: "#FFFFFF"
    });

    const lightErrorTheme = generateRadixColors({
      appearance: "light",
      accent: error,
      gray: "#CCCCCC",
      background: "#FFFFFF"
    });

    // Generate dark themes
    const darkBrandTheme = generateRadixColors({
      appearance: "dark",
      accent: hexColor,
      gray: "#555555",
      background: "#1C1C1C"
    });

    const darkNeutralTheme = generateRadixColors({
      appearance: "dark",
      accent: neutral,
      gray: "#555555",
      background: "#1C1C1C"
    });

    const darkSuccessTheme = generateRadixColors({
      appearance: "dark",
      accent: success,
      gray: "#555555",
      background: "#1C1C1C"
    });

    const darkErrorTheme = generateRadixColors({
      appearance: "dark",
      accent: error,
      gray: "#555555",
      background: "#1C1C1C"
    });

    // For "both" appearance, we'll use light themes as default and handle dark mode in collections
    // The original code always generated both light and dark themes and used them appropriately
    const brandTheme = lightBrandTheme;
    const neutralTheme = lightNeutralTheme;
    const successTheme = lightSuccessTheme;
    const errorTheme = lightErrorTheme;

  console.log('Generated themes:', { brandTheme, neutralTheme, successTheme, errorTheme });
  console.log('🔍 includePrimitives value:', includePrimitives);
  console.log('🔍 includeFontSystem value:', includeFontSystem);
  console.log('🔍 fontFamily value:', fontFamily);

    // Create collections based on includePrimitives setting
    if (includePrimitives) {
      // Create primitive and semantic collections
      const collections = await createCollections(versionNumber, appearance);
      if (!collections) {
        stateManager.addError('Failed to create collections');
        return;
      }

      const { primitiveCollection, semanticCollection } = collections;

      // Create primitive variables
      console.log('🔍 Creating primitive variables...');
      if (appearance === "light" || appearance === "both") {
        console.log('🔍 Creating light mode primitive variables...');
        const lightMode = primitiveCollection.modes[0];
        primitiveCollection.renameMode(lightMode.modeId, "Light");
        console.log('🔍 Light mode ID:', lightMode.modeId);
        console.log('🔍 Light brand theme:', lightBrandTheme);
        await colorSystemManager.createPrimitiveVariables(
          primitiveCollection, 
          lightMode.modeId,
          lightBrandTheme,
          lightNeutralTheme,
          lightSuccessTheme,
          lightErrorTheme
        );
        console.log('🔍 Light mode primitive variables created');
      }

      if (appearance === "dark" || appearance === "both") {
        const darkModeId = appearance === "both" ? 
          primitiveCollection.addMode("Dark") : primitiveCollection.modes[0].modeId;
        await colorSystemManager.createPrimitiveVariables(
          primitiveCollection, 
          darkModeId,
          darkBrandTheme,
          darkNeutralTheme,
          darkSuccessTheme,
          darkErrorTheme
        );
      }

      // Create semantic variables
      console.log('🔍 Creating semantic variables...');
      await colorSystemManager.createSemanticVariables(
        semanticCollection, 
        primitiveCollection, 
        appearance
      );
      console.log('🔍 Semantic variables created');
    } else {
      // Create only SCS Color collection (the main one)
      console.log('🔍 Creating SCS Color collection...');
      const colorCollection = figma.variables.createVariableCollection(`SCS Color ${versionNumber}`);
      
      // Set up modes based on appearance
      if (appearance === "both") {
        const darkModeId = colorCollection.addMode("Dark");
        console.log('Created both light and dark modes for SCS Color');
      }
      
      // Store collection in state
      stateManager.setCollection('color', colorCollection);
      
      // Create direct variables (semantic variables that don't depend on primitives)
      console.log('🔍 Creating direct color variables...');
      if (appearance === "light" || appearance === "both") {
        const lightMode = colorCollection.modes[0];
        colorCollection.renameMode(lightMode.modeId, "Light");
        await colorSystemManager.createDirectVariables(
          colorCollection, 
          lightMode.modeId,
          lightBrandTheme,
          lightNeutralTheme,
          lightSuccessTheme,
          lightErrorTheme
        );
      }

      if (appearance === "dark" || appearance === "both") {
        const darkModeId = appearance === "both" ? 
          colorCollection.addMode("Dark") : colorCollection.modes[0].modeId;
        await colorSystemManager.createDirectVariables(
          colorCollection, 
          darkModeId,
          darkBrandTheme,
          darkNeutralTheme,
          darkSuccessTheme,
          darkErrorTheme
        );
      }
      console.log('🔍 Direct color variables created');
    }

    // Create font system if enabled
    const shouldIncludeFontSystem = includeFontSystem || (fontFamily && fontFamily !== "none");
    if (shouldIncludeFontSystem) {
      await createSpacingCollection(versionNumber);
      await fontSystemManager.createFontSystem(versionNumber);
      await fontSystemManager.createTextStyles(versionNumber);
      // Small delay to ensure text styles are fully created
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Export demo and documentation if requested
    if (exportDemo || shouldExportDocumentation) {
      const currentCollection = stateManager.getCollection('color') || stateManager.getCollection('semantic');
      const semanticCollection = stateManager.getCollection('semantic');
      
      if (exportDemo && currentCollection) {
        console.log("Creating demo components...");
        await demoSystemManager.exportDemoComponents(currentCollection, semanticCollection);
        console.log("Demo components created successfully");
      }
      
      if (shouldExportDocumentation && currentCollection) {
        console.log("Creating documentation...");
        await demoSystemManager.exportDocumentation(currentCollection, semanticCollection);
        console.log("Documentation created successfully");
      }
    }

    // Show success message
    if (!isClosing) {
      const currentFontFamily = fontSystemManager.getCurrentFontFamily();
      const fontSystemMessage = currentFontFamily !== "none" ? " with font system" : "";
      figma.notify(`Successfully created color system${fontSystemMessage} with version ${versionNumber}`);
      figma.ui.postMessage('complete');
    }

  } catch (error) {
    console.error('Error generating palette:', error);
    stateManager.addError(`Failed to generate palette: ${error.message}`);
    figma.notify('Failed to generate color system');
  }
}

// Create collections
async function createCollections(versionNumber: string, appearance: "light" | "dark" | "both"): Promise<{ primitiveCollection: VariableCollection, semanticCollection: VariableCollection } | null> {
  try {
    // Create primitive collection - using the working synchronous method
    const primitiveCollection = figma.variables.createVariableCollection(`SCS Primitive ${versionNumber}`);
    
    // Create semantic collection - using the working synchronous method
    const semanticCollection = figma.variables.createVariableCollection(`SCS Semantic ${versionNumber}`);
    
    // Set up modes based on appearance
    if (appearance === "both") {
      // Add dark mode to both collections
      const darkModeId = primitiveCollection.addMode("Dark");
      semanticCollection.addMode("Dark");
      
      // Update semantic collection to use the same mode ID
      const semanticDarkModeId = semanticCollection.modes.find(mode => mode.name === "Dark")?.modeId;
      if (semanticDarkModeId) {
        // Ensure both collections have the same mode structure
        console.log('Created both light and dark modes');
      }
    }
    
    // Store collections in state
    stateManager.setCollection('primitive', primitiveCollection);
    stateManager.setCollection('semantic', semanticCollection);
    
    console.log('Created collections successfully');
    return { primitiveCollection, semanticCollection };
  } catch (error) {
    console.error('Error creating collections:', error);
    stateManager.addError(`Failed to create collections: ${error.message}`);
    return null;
  }
}

// Create spacing collection
async function createSpacingCollection(versionNumber: string): Promise<VariableCollection | null> {
  try {
    const collection = figma.variables.createVariableCollection(`SCS Spacing ${versionNumber}`);
    
    // Create spacing variables
    const modeId = collection.modes[0].modeId;
    const spacingValues = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 88, 96];
    
    for (const value of spacingValues) {
      console.log(`🔍 Creating spacing variable: General/${value}`);
      const variable = figma.variables.createVariable();
      console.log(`🔍 Spacing variable created, setting name: General/${value}`);
      variable.name = `General/${value}`;
      console.log(`🔍 Spacing name set, setting value: ${value}`);
      variable.setValueForMode(modeId, value);
      console.log(`🔍 Spacing value set, adding to collection`);
      collection.addVariable(variable);
      console.log(`🔍 Spacing variable created: General/${value}`);
    }
    
    // Create kerning variables
    const kerningValues = [-0.5, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.5];
    for (const value of kerningValues) {
      const variable = figma.variables.createVariable();
      variable.name = `Kerning/${value}`;
      variable.setValueForMode(modeId, value);
      collection.addVariable(variable);
    }
    
    // Create weight variables
    const weightValues = [400, 500, 600, 700];
    for (const value of weightValues) {
      const variable = figma.variables.createVariable();
      variable.name = `Weight/${value}`;
      variable.setValueForMode(modeId, value);
      collection.addVariable(variable);
    }
    
    stateManager.setCollection('spacing', collection);
    console.log('Created spacing collection successfully');
    return collection;
  } catch (error) {
    console.error('Error creating spacing collection:', error);
    stateManager.addError(`Failed to create spacing collection: ${error.message}`);
    return null;
  }
}


// Handle test GT Standard message
async function handleTestGTStandard(): Promise<void> {
  console.log('Testing GT Standard font...');
  // GT Standard test logic would go here
}

// Handle discover GT Standard message
async function handleDiscoverGTStandard(): Promise<void> {
  console.log('Discovering GT Standard font...');
  // GT Standard discovery logic would go here
}

// Handle update font mode message
async function handleUpdateFontMode(msg: PluginMessage): Promise<void> {
  if (msg.fontMode) {
    fontSystemManager.setFontMode(msg.fontMode);
    console.log(`Font mode updated to: ${msg.fontMode}`);
  }
}

// Handle bind font variables message
async function handleBindFontVariables(): Promise<void> {
  console.log('Binding font variables...');
  // Font variable binding logic would go here
}

// Input validation function
function validateInputs(inputs: {
  hexColor: string;
  neutral: string;
  success: string;
  error: string;
  appearance: string;
  fontFamily?: string;
}): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate hex colors
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  if (!hexPattern.test(inputs.hexColor)) {
    errors.push(`Invalid hex color: ${inputs.hexColor}`);
  }
  if (!hexPattern.test(inputs.neutral)) {
    errors.push(`Invalid neutral color: ${inputs.neutral}`);
  }
  if (!hexPattern.test(inputs.success)) {
    errors.push(`Invalid success color: ${inputs.success}`);
  }
  if (!hexPattern.test(inputs.error)) {
    errors.push(`Invalid error color: ${inputs.error}`);
  }

  // Validate appearance
  if (!['light', 'dark', 'both'].includes(inputs.appearance)) {
    errors.push(`Invalid appearance: ${inputs.appearance}`);
  }

  // Validate font family
  if (inputs.fontFamily && inputs.fontFamily !== 'none') {
    const validFontFamilies = ['inter', 'gtStandard', 'sfPro', 'sfRounded', 'apercuPro'];
    if (!validFontFamilies.includes(inputs.fontFamily)) {
      errors.push(`Invalid font family: ${inputs.fontFamily}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Show UI
figma.showUI(__html__, { width: 400, height: 600 });
