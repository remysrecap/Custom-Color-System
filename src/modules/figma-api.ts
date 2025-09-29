import { logError, retryWithBackoff } from '../core/utils';
import { log } from '../core/logger';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, PLUGIN_CONFIG } from '../core/constants';

// ===============================================
// Helper Functions
// ===============================================

/**
 * Converts hex color to RGBA
 */
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
    log.error(`Error parsing hex: ${hex}`, 'figma-api', 'hexToRgb');
    return null;
  }
}

/**
 * Finds existing variable by name
 */
async function findExistingVariable(collection: VariableCollection, name: string): Promise<string | null> {
  try {
    const variables = await figma.variables.getLocalVariablesAsync();
    const existingVar = variables.find(v => v.name === name && v.variableCollectionId === collection.id);
    return existingVar ? existingVar.id : null;
  } catch (error) {
    log.error(`Failed to find existing variable: ${name}`, 'figma-api', 'findExistingVariable');
    return null;
  }
}

// ===============================================
// Figma API Module
// ===============================================

/**
 * Checks if the current Figma version supports multiple modes
 */
export function checkMultipleModesSupport(): boolean {
  log.info('Checking multiple modes support', 'figma-api', 'checkMultipleModesSupport');
  
  try {
    const testCollection = figma.variables.createVariableCollection(PLUGIN_CONFIG.TEST_COLLECTION_NAME);
    let supportsMultipleModes = false;

    try {
      testCollection.addMode(PLUGIN_CONFIG.TEST_MODE_NAME);
      supportsMultipleModes = true;
      log.success('Multi-mode support: Enabled', 'figma-api', 'checkMultipleModesSupport');
    } catch (error) {
      supportsMultipleModes = false;
      log.warn('Multi-mode support: Disabled', 'figma-api', 'checkMultipleModesSupport');
    } finally {
      testCollection.remove();
      log.info(`UI will ${supportsMultipleModes ? 'show' : 'hide'} Light & Dark option`, 'figma-api', 'checkMultipleModesSupport');
    }

    return supportsMultipleModes;
  } catch (error) {
    logError('Failed to check multiple modes support', error as Error);
    return false;
  }
}

/**
 * Gets the next version number for collections
 */
export async function getNextVersionNumber(): Promise<string> {
  log.info('Getting next version number', 'figma-api', 'getNextVersionNumber');
  
  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const scsCollections = collections.filter(c => c.name.startsWith("SCS"));
    
    if (scsCollections.length === 0) {
      return "1";
    }
    
    // Extract version numbers from collection names
    const versionNumbers = scsCollections
      .map(c => {
        const match = c.name.match(/SCS.*?(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(v => !isNaN(v));
    
    const maxVersion = Math.max(...versionNumbers, 0);
    const nextVersion = (maxVersion + 1).toString();
    
    log.info(`Next version number: ${nextVersion}`, 'figma-api', 'getNextVersionNumber');
    return nextVersion;
  } catch (error) {
    logError('Failed to get next version number', error as Error);
    return "1";
  }
}

/**
 * Creates a variable collection with error handling
 */
export async function createVariableCollection(name: string): Promise<VariableCollection> {
  try {
    return await retryWithBackoff(async () => {
      const collection = figma.variables.createVariableCollection(name);
      log.success(`Created variable collection: ${name}`, 'figma-api', 'createVariableCollection');
      return collection;
    });
  } catch (error) {
    logError(`Failed to create variable collection: ${name}`, error as Error);
    throw new Error(`${ERROR_MESSAGES.COLLECTION_CREATION_FAILED}: ${name}`);
  }
}

/**
 * Creates a variable with error handling
 */
export async function createVariable(
  name: string,
  collection: VariableCollection,
  variableType: VariableResolvedDataType
): Promise<Variable> {
  try {
    return await retryWithBackoff(async () => {
      const variable = figma.variables.createVariable(name, collection, variableType);
      log.success(`Created variable: ${name}`, 'figma-api', 'createVariable');
      return variable;
    });
  } catch (error) {
    logError(`Failed to create variable: ${name}`, error as Error);
    throw new Error(`${ERROR_MESSAGES.VARIABLE_CREATION_FAILED}: ${name}`);
  }
}

/**
 * Sets up the plugin UI
 */
export function setupPluginUI(): void {
  log.info('Setting up plugin UI', 'figma-api', 'setupPluginUI');
  
  try {
    figma.showUI(__html__);
    figma.ui.resize(PLUGIN_CONFIG.UI_WIDTH, PLUGIN_CONFIG.UI_HEIGHT);
    
    // Send capability info to UI
    const supportsMultipleModes = checkMultipleModesSupport();
    figma.ui.postMessage({ 
      type: 'capability-check',
      supportsMultipleModes 
    });
    
    log.success('Plugin UI setup complete', 'figma-api', 'setupPluginUI');
  } catch (error) {
    logError('Failed to setup plugin UI', error as Error);
  }
}

/**
 * Sends a message to the UI
 */
export function sendUIMessage(message: any): void {
  try {
    figma.ui.postMessage(message);
    log.info(`Sent UI message: ${message.type}`, 'figma-api', 'sendUIMessage');
  } catch (error) {
    logError('Failed to send UI message', error as Error);
  }
}

/**
 * Shows a notification to the user
 */
export function showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
  try {
    figma.notify(message);
    log.info(`Notification: ${message}`, 'figma-api', 'showNotification');
  } catch (error) {
    logError('Failed to show notification', error as Error);
  }
}

/**
 * Closes the plugin
 */
export function closePlugin(): void {
  try {
    log.info('Closing plugin', 'figma-api', 'closePlugin');
    figma.closePlugin();
  } catch (error) {
    logError('Failed to close plugin', error as Error);
  }
}

/**
 * Gets all text nodes on the current page
 */
export function getAllTextNodes(): TextNode[] {
  try {
    const textNodes = figma.currentPage.findAll(node => node.type === "TEXT") as TextNode[];
    log.info(`Found ${textNodes.length} text nodes`, 'figma-api', 'getAllTextNodes');
    return textNodes;
  } catch (error) {
    logError('Failed to get text nodes', error as Error);
    return [];
  }
}

/**
 * Gets all variable collections
 */
export async function getAllVariableCollections(): Promise<VariableCollection[]> {
  try {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    log.info(`Found ${collections.length} variable collections`, 'figma-api', 'getAllVariableCollections');
    return collections;
  } catch (error) {
    logError('Failed to get variable collections', error as Error);
    return [];
  }
}

/**
 * Gets a variable by ID
 */
export async function getVariableById(id: string): Promise<Variable | null> {
  try {
    const variable = await figma.variables.getVariableByIdAsync(id);
    return variable;
  } catch (error) {
    logError(`Failed to get variable by ID: ${id}`, error as Error);
    return null;
  }
}

/**
 * Gets all variables from a collection
 */
export async function getVariablesFromCollection(collection: VariableCollection): Promise<Variable[]> {
  try {
    const variables = await Promise.all(
      collection.variableIds.map(id => figma.variables.getVariableByIdAsync(id))
    );
    
    return variables.filter(v => v !== null) as Variable[];
  } catch (error) {
    logError('Failed to get variables from collection', error as Error);
    return [];
  }
}

/**
 * Creates a frame with error handling
 */
export function createFrame(name: string, width: number, height: number): FrameNode {
  try {
    const frame = figma.createFrame();
    frame.name = name;
    frame.resize(width, height);
    log.success(`Created frame: ${name}`, 'figma-api', 'createFrame');
    return frame;
  } catch (error) {
    logError(`Failed to create frame: ${name}`, error as Error);
    throw error;
  }
}

/**
 * Creates a text node with error handling
 */
export function createTextNode(text: string, fontSize: number = 16): TextNode {
  try {
    const textNode = figma.createText();
    textNode.characters = text;
    textNode.fontSize = fontSize;
    log.success(`Created text node: ${text}`, 'figma-api', 'createTextNode');
    return textNode;
  } catch (error) {
    logError(`Failed to create text node: ${text}`, error as Error);
    throw error;
  }
}

/**
 * Creates a rectangle with error handling
 */
export function createRectangle(name: string, width: number, height: number): RectangleNode {
  try {
    const rectangle = figma.createRectangle();
    rectangle.name = name;
    rectangle.resize(width, height);
    log.success(`Created rectangle: ${name}`, 'figma-api', 'createRectangle');
    return rectangle;
  } catch (error) {
    logError(`Failed to create rectangle: ${name}`, error as Error);
    throw error;
  }
}

/**
 * Creates an ellipse with error handling
 */
export function createEllipse(name: string, width: number, height: number): EllipseNode {
  try {
    const ellipse = figma.createEllipse();
    ellipse.name = name;
    ellipse.resize(width, height);
    log.success(`Created ellipse: ${name}`, 'figma-api', 'createEllipse');
    return ellipse;
  } catch (error) {
    logError(`Failed to create ellipse: ${name}`, error as Error);
    throw error;
  }
}

/**
 * Appends a child node to a parent with error handling
 */
export function appendChild(parent: BaseNode, child: BaseNode): void {
  try {
    parent.appendChild(child);
    log.info(`Appended child: ${child.name} to ${parent.name}`, 'figma-api', 'appendChild');
  } catch (error) {
    logError(`Failed to append child: ${child.name} to ${parent.name}`, error as Error);
  }
}

/**
 * Sets the position of a node with error handling
 */
export function setNodePosition(node: BaseNode, x: number, y: number): void {
  try {
    node.x = x;
    node.y = y;
    log.info(`Set position of ${node.name} to (${x}, ${y})`, 'figma-api', 'setNodePosition');
  } catch (error) {
    logError(`Failed to set position of ${node.name}`, error as Error);
  }
}

/**
 * Sets the size of a node with error handling
 */
export function setNodeSize(node: BaseNode, width: number, height: number): void {
  try {
    if ('resize' in node) {
      (node as any).resize(width, height);
      log.info(`Set size of ${node.name} to ${width}x${height}`, 'figma-api', 'setNodeSize');
    }
  } catch (error) {
    logError(`Failed to set size of ${node.name}`, error as Error);
  }
}

/**
 * Loads a font with error handling
 */
export async function loadFont(fontName: FontName): Promise<void> {
  try {
    await figma.loadFontAsync(fontName);
    log.success(`Loaded font: ${fontName.family} ${fontName.style}`, 'figma-api', 'loadFont');
  } catch (error) {
    logError(`Failed to load font: ${fontName.family} ${fontName.style}`, error as Error);
    throw error;
  }
}

/**
 * Creates a text style with error handling
 */
export function createTextStyle(name: string, properties: Partial<TextStyle>): TextStyle {
  try {
    const textStyle = figma.createTextStyle();
    textStyle.name = name;
    
    // Apply properties
    Object.assign(textStyle, properties);
    
    log.success(`Created text style: ${name}`, 'figma-api', 'createTextStyle');
    return textStyle;
  } catch (error) {
    logError(`Failed to create text style: ${name}`, error as Error);
    throw error;
  }
}

/**
 * Creates a paint style with error handling
 */
export function createPaintStyle(name: string, paint: Paint): PaintStyle {
  try {
    const paintStyle = figma.createPaintStyle();
    paintStyle.name = name;
    paintStyle.paints = [paint];
    
    log.success(`Created paint style: ${name}`, 'figma-api', 'createPaintStyle');
    return paintStyle;
  } catch (error) {
    logError(`Failed to create paint style: ${name}`, error as Error);
    throw error;
  }
}

/**
 * Creates an effect style with error handling
 */
export function createEffectStyle(name: string, effects: Effect[]): EffectStyle {
  try {
    const effectStyle = figma.createEffectStyle();
    effectStyle.name = name;
    effectStyle.effects = effects;
    
    log.success(`Created effect style: ${name}`, 'figma-api', 'createEffectStyle');
    return effectStyle;
  } catch (error) {
    logError(`Failed to create effect style: ${name}`, error as Error);
    throw error;
  }
}

/**
 * Creates a grid style with error handling
 */
export function createGridStyle(name: string, grid: GridLayout): GridStyle {
  try {
    const gridStyle = figma.createGridStyle();
    gridStyle.name = name;
    gridStyle.layoutGrids = [grid];
    
    log.success(`Created grid style: ${name}`, 'figma-api', 'createGridStyle');
    return gridStyle;
  } catch (error) {
    logError(`Failed to create grid style: ${name}`, error as Error);
    throw error;
  }
}

/**
 * Creates or updates a color variable with hex value
 */
export async function createOrUpdateColorVariable(collection: VariableCollection, modeId: string, name: string, colorHex: string): Promise<Variable | null> {
  log.info(`Attempting to create or update color variable: ${name} with color: ${colorHex}`, 'figma-api', 'createOrUpdateColorVariable');
  
  try {
    log.info(`Step 1: Finding existing variable for ${name}`, 'figma-api', 'createOrUpdateColorVariable');
    const existingVariable = await findExistingVariable(collection, name);
    log.info(`Step 2: Converting hex to RGB: ${colorHex}`, 'figma-api', 'createOrUpdateColorVariable');
    const rgb = hexToRgb(colorHex);
    
    if (!rgb) {
      log.error(`Failed to convert hex to RGB for color: ${colorHex}`, 'figma-api', 'createOrUpdateColorVariable');
      return null;
    }
    
    log.info(`Step 3: RGB conversion successful: ${JSON.stringify(rgb)}`, 'figma-api', 'createOrUpdateColorVariable');

    if (existingVariable) {
      log.info(`Step 4: Updating existing variable ${name}`, 'figma-api', 'createOrUpdateColorVariable');
      const variable = await figma.variables.getVariableByIdAsync(existingVariable);
      if (variable) {
        await variable.setValueForMode(modeId, rgb);
        log.success(`Updated variable ${name} with value: ${JSON.stringify(rgb)}`, 'figma-api', 'createOrUpdateColorVariable');
        return variable;
      }
    }

    log.info(`Step 5: Creating new variable ${name}`, 'figma-api', 'createOrUpdateColorVariable');
    const variable = figma.variables.createVariable(name, collection, "COLOR");
    await variable.setValueForMode(modeId, rgb);
    log.success(`Created variable ${name} with value: ${JSON.stringify(rgb)}`, 'figma-api', 'createOrUpdateColorVariable');
    return variable;
  } catch (error) {
    log.error(`CRITICAL ERROR in createOrUpdateColorVariable for ${name}:`, 'figma-api', 'createOrUpdateColorVariable');
    log.error(`Error type: ${typeof error}`, 'figma-api', 'createOrUpdateColorVariable');
    log.error(`Error message: ${error}`, 'figma-api', 'createOrUpdateColorVariable');
    log.error(`Error stack: ${error instanceof Error ? error.stack : 'No stack trace'}`, 'figma-api', 'createOrUpdateColorVariable');
    logError(`Failed to create/update color variable: ${name}`, error as Error);
    return null;
  }
}
