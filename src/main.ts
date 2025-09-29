/// <reference types="@figma/plugin-typings" />

// ===============================================
// Main Entry Point - Refactored
// ===============================================

import { PluginMessage } from './core/types';
import { setupPluginUI, sendUIMessage, showNotification, closePlugin } from './modules/figma-api';
import { generateColorThemes, createPrimitiveVariables, createSemanticVariables, createDirectVariables } from './modules/color-system';
import { 
  testGTStandardFont, 
  discoverGTStandardFonts, 
  updateExistingTextNodes, 
  bindTextNodesToFontVariables,
  createFontSystem,
  createSpacingCollection,
  createTextStyles
} from './modules/font-system';
import { getNextVersionNumber } from './modules/figma-api';
import { logError } from './core/utils';
import { log } from './core/logger';

// ===============================================
// Plugin Initialization
// ===============================================

// Setup the plugin UI
setupPluginUI();

// Track plugin closing state
let isClosing = false;

// ===============================================
// Message Handler
// ===============================================

figma.ui.onmessage = async (msg: PluginMessage) => {
  try {
    // Handle different message types
    switch (msg.type) {
      case "test-gt-standard":
        await handleTestGTStandard();
        break;
        
      case "discover-gt-standard":
        await handleDiscoverGTStandard();
        break;
        
      case "update-font-mode":
        await handleUpdateFontMode(msg);
        break;
        
      case "bind-font-variables":
        await handleBindFontVariables();
        break;
        
      case "generate-palette":
        await handleGeneratePalette(msg);
        break;
        
      default:
        log.warn(`Unknown message type: ${msg.type}`, 'main', 'onmessage');
    }
  } catch (error) {
    logError('Error handling message', error as Error);
    if (!isClosing) {
      showNotification('An error occurred while processing your request.', 'error');
      sendUIMessage('complete');
    }
  }
};

// ===============================================
// Message Handlers
// ===============================================

/**
 * Handles GT Standard font testing
 */
async function handleTestGTStandard(): Promise<void> {
  try {
    const isAvailable = await testGTStandardFont();
    sendUIMessage({ type: "gt-standard-test-result", available: isAvailable });
  } catch (error) {
    logError('Failed to test GT Standard font', error as Error);
    sendUIMessage({ type: "gt-standard-test-result", available: false });
  }
}

/**
 * Handles GT Standard font discovery
 */
async function handleDiscoverGTStandard(): Promise<void> {
  try {
    await discoverGTStandardFonts();
  } catch (error) {
    logError('Failed to discover GT Standard fonts', error as Error);
  }
}

/**
 * Handles font mode updates
 */
async function handleUpdateFontMode(msg: PluginMessage): Promise<void> {
  try {
    const { fontMode } = msg;
    if (fontMode) {
      // Import the font mode setter from font-system module
      const { setCurrentFontMode } = await import('./modules/font-system');
      setCurrentFontMode(fontMode);
      await updateExistingTextNodes();
    }
  } catch (error) {
    logError('Failed to update font mode', error as Error);
  }
}

/**
 * Handles binding text nodes to font variables
 */
async function handleBindFontVariables(): Promise<void> {
  try {
    await bindTextNodesToFontVariables();
  } catch (error) {
    logError('Failed to bind text nodes to font variables', error as Error);
  }
}

/**
 * Handles palette generation
 */
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
    fontMode 
  } = msg;

  try {
    log.info('Starting palette generation', 'main', 'handleGeneratePalette');
    
    // Get version number
    const versionNumber = await getNextVersionNumber();
    log.info(`Using version number: ${versionNumber}`, 'main', 'handleGeneratePalette');
    
    // Set font mode if specified
    if (fontMode) {
      const { setCurrentFontMode } = await import('./modules/font-system');
      setCurrentFontMode(fontMode);
    }
    
    // Generate color themes
    const themes = generateColorThemes(hexColor, neutral, success, error, appearance);
    
    // Create collections and variables
    if (includePrimitives) {
      await createPrimitiveSystem(versionNumber, themes, appearance, includeFontSystem, exportDemo, shouldExportDocumentation);
    } else {
      await createDirectSystem(versionNumber, themes, appearance, includeFontSystem, exportDemo, shouldExportDocumentation);
    }
    
    // Show success notification
    if (!isClosing) {
      const fontSystemMessage = includeFontSystem ? " with font system" : "";
      showNotification(`Successfully created color system${fontSystemMessage} with version ${versionNumber}`, 'success');
      sendUIMessage('complete');
    }
    
  } catch (error) {
    logError('Failed to generate palette', error as Error);
    if (!isClosing) {
      showNotification('Error generating variables.', 'error');
      sendUIMessage('complete');
    }
  } finally {
    if (!isClosing) {
      isClosing = true;
      sendUIMessage('complete');
      setTimeout(() => {
        closePlugin();
      }, 100);
    }
  }
}

// ===============================================
// System Creation Functions
// ===============================================

/**
 * Creates a primitive system with collections
 */
async function createPrimitiveSystem(
  versionNumber: string,
  themes: any,
  appearance: "light" | "dark" | "both",
  includeFontSystem: boolean,
  exportDemo: boolean,
  exportDocumentation: boolean
): Promise<void> {
  try {
    // Import required modules
    const { createVariableCollection } = await import('./modules/figma-api');
    
    // Create collections
    const primitiveCollection = await createVariableCollection(`SCS Primitive ${versionNumber}`);
    const semanticCollection = await createVariableCollection(`SCS Semantic ${versionNumber}`);
    
    // Create primitive variables for each mode
    if (appearance === "light" || appearance === "both") {
      const lightMode = primitiveCollection.modes[0];
      primitiveCollection.renameMode(lightMode.modeId, "Light");
      await createPrimitiveVariables(primitiveCollection, lightMode.modeId, 
        themes.lightBrandTheme, themes.lightNeutralTheme, themes.lightSuccessTheme, themes.lightErrorTheme);
    }
    
    if (appearance === "dark" || appearance === "both") {
      const darkModeId = appearance === "both" ? 
        primitiveCollection.addMode("Dark") : primitiveCollection.modes[0].modeId;
      await createPrimitiveVariables(primitiveCollection, darkModeId, 
        themes.darkBrandTheme, themes.darkNeutralTheme, themes.darkSuccessTheme, themes.darkErrorTheme);
    }
    
    // Create semantic variables
    await createSemanticVariables(semanticCollection, primitiveCollection, appearance);
    
    // Create font system if enabled
    if (includeFontSystem) {
      await createSpacingCollection(versionNumber);
      await createFontSystem(versionNumber);
      await createTextStyles(versionNumber);
      // Small delay to ensure text styles are fully created
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Create demo components if enabled
    if (exportDemo) {
      log('Creating demo components...', 'info');
      // Import demo creation functions
      const { exportDemoComponents } = await import('./modules/demo-system');
      await exportDemoComponents(primitiveCollection, semanticCollection);
      log('Demo components created successfully', 'success');
    }
    
    // Create documentation if enabled
    if (exportDocumentation) {
      log('Creating documentation...', 'info');
      // Import documentation creation functions
      const { exportDocumentation } = await import('./modules/documentation-system');
      await exportDocumentation(primitiveCollection, semanticCollection);
      log('Documentation created successfully', 'success');
    }
    
  } catch (error) {
    logError('Failed to create primitive system', error as Error);
    throw error;
  }
}

/**
 * Creates a direct system without collections
 */
async function createDirectSystem(
  versionNumber: string,
  themes: any,
  appearance: "light" | "dark" | "both",
  includeFontSystem: boolean,
  exportDemo: boolean,
  exportDocumentation: boolean
): Promise<void> {
  try {
    // Import required modules
    const { createVariableCollection } = await import('./modules/figma-api');
    
    // Create collection
    const collection = await createVariableCollection(`SCS Color ${versionNumber}`);
    
    // Create direct variables for each mode
    if (appearance === "light" || appearance === "both") {
      const lightMode = collection.modes[0];
      collection.renameMode(lightMode.modeId, "Light");
      await createDirectVariables(collection, lightMode.modeId, 
        themes.lightBrandTheme, themes.lightNeutralTheme, themes.lightSuccessTheme, themes.lightErrorTheme);
    }
    
    if (appearance === "dark" || appearance === "both") {
      const darkModeId = appearance === "both" ? 
        collection.addMode("Dark") : collection.modes[0].modeId;
      await createDirectVariables(collection, darkModeId, 
        themes.darkBrandTheme, themes.darkNeutralTheme, themes.darkSuccessTheme, themes.darkErrorTheme);
    }
    
    // Create font system if enabled
    if (includeFontSystem) {
      await createSpacingCollection(versionNumber);
      await createFontSystem(versionNumber);
      await createTextStyles(versionNumber);
      // Small delay to ensure text styles are fully created
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Create demo components if enabled
    if (exportDemo) {
      log('Creating demo components...', 'info');
      // Import demo creation functions
      const { exportDemoComponents } = await import('./modules/demo-system');
      await exportDemoComponents(collection);
      log('Demo components created successfully', 'success');
    }
    
    // Create documentation if enabled
    if (exportDocumentation) {
      log('Creating documentation...', 'info');
      // Import documentation creation functions
      const { exportDocumentation } = await import('./modules/documentation-system');
      await exportDocumentation(collection);
      log('Documentation created successfully', 'success');
    }
    
  } catch (error) {
    logError('Failed to create direct system', error as Error);
    throw error;
  }
}
