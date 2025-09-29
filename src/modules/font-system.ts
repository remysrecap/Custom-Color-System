import { FontMode, TypographyStyle, TypographyScale } from '../core/types';
import { FONT_MODES, TYPOGRAPHY_SCALE } from '../core/constants';
import { logError, loadFontWithFallback, retryWithBackoff } from '../core/utils';
import { log } from '../core/logger';

// ===============================================
// Font System Module
// ===============================================

/**
 * Tests if GT Standard font is available
 */
export async function testGTStandardFont(): Promise<boolean> {
  try {
    await figma.loadFontAsync({ family: "GT Standard", style: "Regular" });
    log.success('GT Standard font is available', 'font-system', 'testGTStandardFont');
    return true;
  } catch (error) {
    log.warn('GT Standard font is not available', 'font-system', 'testGTStandardFont');
    return false;
  }
}

/**
 * Discovers available GT Standard fonts
 */
export async function discoverGTStandardFonts(): Promise<void> {
  log.info('Discovering GT Standard fonts...', 'font-system', 'discoverGTStandardFonts');
  
  const availableStyles: string[] = [];
  const commonStyles = ["Regular", "Medium", "Bold", "Light", "Thin"];
  
  for (const style of commonStyles) {
    try {
      await figma.loadFontAsync({ family: "GT Standard", style });
      availableStyles.push(style);
      log.success(`Found GT Standard ${style}`, 'font-system', 'discoverGTStandardFonts');
    } catch (error) {
      // Style not available, continue
    }
  }
  
  if (availableStyles.length > 0) {
    log.info(`Discovered ${availableStyles.length} GT Standard styles: ${availableStyles.join(', ')}`, 'font-system', 'discoverGTStandardFonts');
  } else {
    log.warn('No GT Standard styles found', 'font-system', 'discoverGTStandardFonts');
  }
}

/**
 * Gets the current font family
 */
export function getCurrentFontFamily(): string {
  return currentFontMode.family;
}

/**
 * Updates existing text nodes to use the current font mode
 */
export async function updateExistingTextNodes(): Promise<void> {
  log.info(`Updating existing text nodes to use ${currentFontMode.displayName}`, 'font-system', 'updateExistingTextNodes');
  
  // Get all text nodes on the current page
  const textNodes = figma.currentPage.findAll(node => node.type === "TEXT") as TextNode[];
  
  if (textNodes.length === 0) {
    log.info('No text nodes found on current page', 'font-system', 'updateExistingTextNodes');
    return;
  }
  
  log.info(`Found ${textNodes.length} text nodes to update`, 'font-system', 'updateExistingTextNodes');
  
  // Update each text node
  for (const textNode of textNodes) {
    try {
      // Get the current font name
      const currentFont = textNode.fontName;
      
      // Skip if fontName is a symbol (mixed fonts)
      if (typeof currentFont === 'symbol') {
        log.warn('Skipping text node with mixed fonts', 'font-system', 'updateExistingTextNodes');
        continue;
      }
      
      // Skip if already using the correct font family
      if (currentFont.family === currentFontMode.family) {
        continue;
      }
      
      // Determine the appropriate style based on current font weight
      let targetStyle = "Regular";
      if (currentFont.style.toLowerCase().includes("bold") || textNode.fontWeight === 700) {
        targetStyle = "Bold";
      } else if (currentFont.style.toLowerCase().includes("semi") || textNode.fontWeight === 600) {
        targetStyle = "Semi Bold";
      } else if (currentFont.style.toLowerCase().includes("medium") || textNode.fontWeight === 500) {
        targetStyle = "Medium";
      } else if (currentFont.style.toLowerCase().includes("italic")) {
        targetStyle = "Italic";
      }
      
      // Load the new font with fallback
      const newFont = await loadFontWithFallback(currentFontMode.family, targetStyle);
      
      // Update the text node
      textNode.fontName = newFont;
      
      // Enable vertical trim for precise text layout
      textNode.leadingTrim = 'CAP_HEIGHT';
      
      log.info(`Updated text node: ${currentFont.family} ${currentFont.style} → ${newFont.family} ${newFont.style}`, 'font-system', 'updateExistingTextNodes');
      
    } catch (error) {
      logError(`Failed to update text node`, error as Error);
    }
  }
  
  log.success(`Updated ${textNodes.length} text nodes to use ${currentFontMode.displayName}`, 'font-system', 'updateExistingTextNodes');
}

/**
 * Binds existing text nodes to font family variables
 */
export async function bindTextNodesToFontVariables(): Promise<void> {
  log.info('Binding text nodes to font family variables...', 'font-system', 'bindTextNodesToFontVariables');
  
  try {
    // Get the font collection
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    const fontCollection = collections.find(c => c.name.startsWith("SCS Font"));
    
    if (!fontCollection) {
      log.warn('No SCS Font collection found', 'font-system', 'bindTextNodesToFontVariables');
      return;
    }
    
    // Get the font family variable
    const allVariables = await Promise.all(
      fontCollection.variableIds.map(id => figma.variables.getVariableByIdAsync(id))
    );
    
    const fontFamilyVar = allVariables.find(v => v && v.name === "Font Family");
    if (!fontFamilyVar) {
      log.warn('Font Family variable not found', 'font-system', 'bindTextNodesToFontVariables');
      return;
    }
    
    // Get all text nodes on the current page
    const textNodes = figma.currentPage.findAll(node => node.type === "TEXT") as TextNode[];
    
    if (textNodes.length === 0) {
      log.info('No text nodes found on current page', 'font-system', 'bindTextNodesToFontVariables');
      return;
    }
    
    log(`Found ${textNodes.length} text nodes to bind to variables`, 'info');
    
    // Bind each text node to the font family variable
    for (const textNode of textNodes) {
      try {
        // Bind the fontFamily property to the variable
        textNode.setBoundVariable("fontFamily", fontFamilyVar);
        log('Bound text node to Font Family variable', 'success');
      } catch (error) {
        logError('Failed to bind text node to variable', error as Error);
      }
    }
    
    log(`Bound ${textNodes.length} text nodes to font family variables`, 'success');
  } catch (error) {
    logError('Failed to bind text nodes to font variables', error as Error);
  }
}

/**
 * Creates a font variable
 */
export async function createFontVariable(
  collection: VariableCollection,
  modeId: string,
  name: string,
  fontFamily: string
): Promise<Variable | null> {
  try {
    return await retryWithBackoff(async () => {
      // Check if variable already exists
      const existingVariable = collection.variables.find(v => v.name === name);
      
      if (existingVariable) {
        // Update existing variable
        existingVariable.setValueForMode(modeId, fontFamily);
        log(`Updated font variable: ${name} (${modeId}): ${fontFamily}`, 'info');
        return existingVariable;
      } else {
        // Create new variable
        const variable = figma.variables.createVariable(name, collection, "STRING");
        variable.setValueForMode(modeId, fontFamily);
        log(`Created font variable: ${name} (${modeId}): ${fontFamily}`, 'success');
        return variable;
      }
    });
  } catch (error) {
    logError(`Failed to create/update font variable: ${name}`, error as Error);
    return null;
  }
}

/**
 * Creates a font variable reference
 */
export async function createFontVariableReference(
  collection: VariableCollection,
  modeId: string,
  name: string,
  referencedVariable: Variable
): Promise<Variable | null> {
  try {
    return await retryWithBackoff(async () => {
      // Check if variable already exists
      const existingVariable = collection.variables.find(v => v.name === name);
      
      if (existingVariable) {
        // Update existing variable
        existingVariable.setValueForMode(modeId, referencedVariable);
        log(`Updated font variable reference: ${name} (${modeId})`, 'info');
        return existingVariable;
      } else {
        // Create new variable
        const variable = figma.variables.createVariable(name, collection, "STRING");
        variable.setValueForMode(modeId, referencedVariable);
        log(`Created font variable reference: ${name} (${modeId})`, 'success');
        return variable;
      }
    });
  } catch (error) {
    logError(`Failed to create/update font variable reference: ${name}`, error as Error);
    return null;
  }
}

/**
 * Creates a spacing collection
 */
export async function createSpacingCollection(versionNumber: string): Promise<VariableCollection> {
  log(`Creating spacing collection for version ${versionNumber}`, 'info');
  
  try {
    const collection = figma.variables.createVariableCollection(`SCS Spacing ${versionNumber}`);
    
    // Create spacing variables
    const spacingValues = [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128, 160, 192, 224, 256];
    
    for (const value of spacingValues) {
      await createSpacingVariable(collection, collection.modes[0].modeId, `Spacing ${value}`, value);
    }
    
    log('Spacing collection created successfully', 'success');
    return collection;
  } catch (error) {
    logError('Failed to create spacing collection', error as Error);
    throw error;
  }
}

/**
 * Creates a spacing variable
 */
async function createSpacingVariable(
  collection: VariableCollection,
  modeId: string,
  name: string,
  value: number
): Promise<Variable | null> {
  try {
    return await retryWithBackoff(async () => {
      // Check if variable already exists
      const existingVariable = collection.variables.find(v => v.name === name);
      
      if (existingVariable) {
        // Update existing variable
        existingVariable.setValueForMode(modeId, value);
        log(`Updated spacing variable: ${name} (${modeId}): ${value}`, 'info');
        return existingVariable;
      } else {
        // Create new variable
        const variable = figma.variables.createVariable(name, collection, "FLOAT");
        variable.setValueForMode(modeId, value);
        log(`Created spacing variable: ${name} (${modeId}): ${value}`, 'success');
        return variable;
      }
    });
  } catch (error) {
    logError(`Failed to create/update spacing variable: ${name}`, error as Error);
    return null;
  }
}

/**
 * Creates text styles
 */
export async function createTextStyles(versionNumber: string): Promise<void> {
  log(`Creating text styles for version ${versionNumber}`, 'info');
  
  try {
    // Create text styles for each typography scale item
    for (const [styleName, style] of Object.entries(TYPOGRAPHY_SCALE)) {
      await createTextStyle(styleName, style);
    }
    
    log('Text styles created successfully', 'success');
  } catch (error) {
    logError('Failed to create text styles', error as Error);
    throw error;
  }
}

/**
 * Creates a single text style
 */
async function createTextStyle(name: string, style: TypographyStyle): Promise<void> {
  try {
    // Load the font
    const font = await loadFontWithFallback(currentFontMode.family, "Regular");
    
    // Create the text style
    const textStyle = figma.createTextStyle();
    textStyle.name = name;
    textStyle.fontSize = style.fontSize;
    textStyle.lineHeight = { value: style.lineHeight, unit: "PIXELS" };
    textStyle.letterSpacing = { value: style.letterSpacing, unit: "PIXELS" };
    textStyle.fontName = font;
    
    log(`Created text style: ${name}`, 'success');
  } catch (error) {
    logError(`Failed to create text style: ${name}`, error as Error);
  }
}

/**
 * Creates the font system
 */
export async function createFontSystem(versionNumber: string): Promise<void> {
  log(`Creating font system for version ${versionNumber}`, 'info');
  
  try {
    const collection = figma.variables.createVariableCollection(`SCS Font ${versionNumber}`);
    
    // Create font family variable
    await createFontVariable(collection, collection.modes[0].modeId, "Font Family", currentFontMode.family);
    
    // Create font weight variables
    const fontWeights = [400, 500, 600, 700];
    for (const weight of fontWeights) {
      await createFontVariable(collection, collection.modes[0].modeId, `Font Weight ${weight}`, weight.toString());
    }
    
    log('Font system created successfully', 'success');
  } catch (error) {
    logError('Failed to create font system', error as Error);
    throw error;
  }
}

/**
 * Applies a text style to a text node
 */
export async function applyTextStyle(textNode: TextNode, styleName: string): Promise<void> {
  try {
    const style = TYPOGRAPHY_SCALE[styleName as keyof TypographyScale];
    if (!style) {
      log(`Text style not found: ${styleName}`, 'warning');
      return;
    }
    
    // Load the font
    const font = await loadFontWithFallback(currentFontMode.family, "Regular");
    
    // Apply the style
    textNode.fontName = font;
    textNode.fontSize = style.fontSize;
    textNode.lineHeight = { value: style.lineHeight, unit: "PIXELS" };
    textNode.letterSpacing = { value: style.letterSpacing, unit: "PIXELS" };
    textNode.fontWeight = style.fontWeight;
    
    log(`Applied text style: ${styleName}`, 'success');
  } catch (error) {
    logError(`Failed to apply text style: ${styleName}`, error as Error);
  }
}

/**
 * Applies a fallback text style to a text node
 */
export async function applyFallbackTextStyle(textNode: TextNode, styleName: string): Promise<void> {
  try {
    const style = TYPOGRAPHY_SCALE[styleName as keyof TypographyScale];
    if (!style) {
      log(`Text style not found: ${styleName}`, 'warning');
      return;
    }
    
    // Try to load the primary font, fallback to Inter if it fails
    let font: FontName;
    try {
      font = await loadFontWithFallback(currentFontMode.family, "Regular");
    } catch (error) {
      font = await loadFontWithFallback("Inter", "Regular");
    }
    
    // Apply the style
    textNode.fontName = font;
    textNode.fontSize = style.fontSize;
    textNode.lineHeight = { value: style.lineHeight, unit: "PIXELS" };
    textNode.letterSpacing = { value: style.letterSpacing, unit: "PIXELS" };
    textNode.fontWeight = style.fontWeight;
    
    log(`Applied fallback text style: ${styleName}`, 'success');
  } catch (error) {
    logError(`Failed to apply fallback text style: ${styleName}`, error as Error);
  }
}

// Global state for current font mode
let currentFontMode: FontMode = FONT_MODES.inter;
