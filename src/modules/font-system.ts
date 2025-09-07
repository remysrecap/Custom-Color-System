// Font system module for the Custom Color System plugin
import { TypographyScale, FontMode } from '../core/types';
import { FONT_MODES, TYPOGRAPHY_SCALE, GT_STANDARD_TYPOGRAPHY_SCALE, SF_PRO_TYPOGRAPHY_SCALE, SF_ROUNDED_TYPOGRAPHY_SCALE, APERCU_PRO_TYPOGRAPHY_SCALE } from '../core/constants';

// GT Standard M style mapping - copied from working code
const GT_STANDARD_M_STYLES: Record<string, string[]> = {
  regular: ["M Standard Regular", "M Regular"],
  medium: ["M Standard Medium", "M Medium"],
  semibold: ["M Standard Semi Bold", "M Semi Bold", "M Semibold"],
  bold: ["M Standard Bold", "M Bold"],
  italic: ["M Standard Italic", "M Italic"]
};

export class FontSystemManager {
  private state: any;
  private currentFontMode: string = 'inter';

  constructor(state: any) {
    this.state = state;
  }

  // Set the current font mode
  setFontMode(fontMode: string): void {
    if (FONT_MODES[fontMode]) {
      this.currentFontMode = fontMode;
      console.log(`Font mode set to: ${fontMode}`);
    } else {
      console.warn(`Invalid font mode: ${fontMode}`);
      this.state.addWarning(`Invalid font mode: ${fontMode}`);
    }
  }

  // Get the current font mode
  getCurrentFontMode(): string {
    return this.currentFontMode;
  }

  // Get the current font family
  getCurrentFontFamily(): string {
    return this.currentFontMode;
  }

  // Get font display name
  getFontDisplayName(fontFamily: string): string {
    const mode = FONT_MODES[fontFamily];
    return mode ? mode.displayName : 'Inter';
  }

  // Get font family name
  getFontFamilyName(fontFamily: string): string {
    const mode = FONT_MODES[fontFamily];
    return mode ? mode.family : 'Inter';
  }

  // Get typography scale for font family
  getTypographyScale(fontFamily: string): TypographyScale {
    switch (fontFamily) {
      case 'gtStandard':
        return GT_STANDARD_TYPOGRAPHY_SCALE;
      case 'sfPro':
        return SF_PRO_TYPOGRAPHY_SCALE;
      case 'sfRounded':
        return SF_ROUNDED_TYPOGRAPHY_SCALE;
      case 'apercuPro':
        return APERCU_PRO_TYPOGRAPHY_SCALE;
      case 'inter':
      default:
        return TYPOGRAPHY_SCALE;
    }
  }

  // Create font system
  async createFontSystem(versionNumber: string): Promise<void> {
    console.log('Creating font system...');
    
    try {
      const currentFontFamily = this.getCurrentFontFamily();
      if (currentFontFamily === 'none') {
        console.log('No font system requested');
        return;
      }

      // Create font collection
      const fontCollection = await this.createFontCollection(versionNumber, currentFontFamily);
      if (!fontCollection) {
        this.state.addError('Failed to create font collection');
        return;
      }

      // Create font variables
      await this.createFontVariables(fontCollection, currentFontFamily);
      
      // Create typography variables
      await this.createTypographyVariables(fontCollection, currentFontFamily);
      
      console.log('Font system created successfully');
    } catch (error) {
      console.error('Error creating font system:', error);
      this.state.addError(`Failed to create font system: ${error.message}`);
    }
  }

  // Create font collection
  private async createFontCollection(versionNumber: string, fontFamily: string): Promise<VariableCollection | null> {
    try {
      const fontDisplayName = this.getFontDisplayName(fontFamily);
      const collectionName = `SCS Font ${fontDisplayName} ${versionNumber}`;
      
      const collection = figma.variables.createVariableCollection(collectionName);
      
      // Get the default mode and rename it to the selected font family
      const defaultMode = collection.modes[0];
      collection.renameMode(defaultMode.modeId, fontDisplayName);
      
      console.log(`Created font collection: ${collectionName}`);
      return collection;
    } catch (error) {
      console.error('Error creating font collection:', error);
      this.state.addError(`Failed to create font collection: ${error.message}`);
      return null;
    }
  }

  // Create font variables
  private async createFontVariables(collection: VariableCollection, fontFamily: string): Promise<void> {
    try {
      const modeId = collection.modes[0].modeId;
      const fontFamilyName = this.getFontFamilyName(fontFamily);
      
      // Create font family variable
      const fontFamilyVar = figma.variables.createVariable();
      fontFamilyVar.name = 'Font Family/Primary';
      fontFamilyVar.setValueForMode(modeId, fontFamilyName);
      collection.addVariable(fontFamilyVar);
      
      // Create font weight variables
      const weights = [400, 500, 600, 700];
      for (const weight of weights) {
        const weightVar = figma.variables.createVariable();
        weightVar.name = `Font Weight/${weight}`;
        weightVar.setValueForMode(modeId, weight);
        collection.addVariable(weightVar);
      }
      
      console.log('Created font variables');
    } catch (error) {
      console.error('Error creating font variables:', error);
      this.state.addError(`Failed to create font variables: ${error.message}`);
    }
  }

  // Create typography variables
  private async createTypographyVariables(collection: VariableCollection, fontFamily: string): Promise<void> {
    try {
      const modeId = collection.modes[0].modeId;
      const typographyScale = this.getTypographyScale(fontFamily);
      
      // Create typography variables for each style
      for (const [styleName, style] of Object.entries(typographyScale)) {
        const fontSizeVar = figma.variables.createVariable();
        fontSizeVar.name = `Typography/${styleName}/Font Size`;
        fontSizeVar.setValueForMode(modeId, style.fontSize);
        collection.addVariable(fontSizeVar);
        
        const lineHeightVar = figma.variables.createVariable();
        lineHeightVar.name = `Typography/${styleName}/Line Height`;
        lineHeightVar.setValueForMode(modeId, style.lineHeight);
        collection.addVariable(lineHeightVar);
        
        const letterSpacingVar = figma.variables.createVariable();
        letterSpacingVar.name = `Typography/${styleName}/Letter Spacing`;
        letterSpacingVar.setValueForMode(modeId, style.letterSpacing);
        collection.addVariable(letterSpacingVar);
        
        const fontWeightVar = figma.variables.createVariable();
        fontWeightVar.name = `Typography/${styleName}/Font Weight`;
        fontWeightVar.setValueForMode(modeId, style.fontWeight);
        collection.addVariable(fontWeightVar);
      }
      
      console.log('Created typography variables');
    } catch (error) {
      console.error('Error creating typography variables:', error);
      this.state.addError(`Failed to create typography variables: ${error.message}`);
    }
  }

  // Create text styles
  async createTextStyles(versionNumber: string): Promise<void> {
    console.log('Creating text styles...');
    
    try {
      const currentFontFamily = this.getCurrentFontFamily();
      if (currentFontFamily === 'none') {
        console.log('No text styles requested');
        return;
      }

      const typographyScale = this.getTypographyScale(currentFontFamily);
      const fontFamilyName = this.getFontFamilyName(currentFontFamily);
      
      // Create text styles for each typography style
      for (const [styleName, style] of Object.entries(typographyScale)) {
        await this.createTextStyle(styleName, style, fontFamilyName);
      }
      
      console.log('Text styles created successfully');
    } catch (error) {
      console.error('Error creating text styles:', error);
      this.state.addError(`Failed to create text styles: ${error.message}`);
    }
  }

  // Create individual text style
  private async createTextStyle(styleName: string, style: any, fontFamily: string): Promise<void> {
    try {
      // Check if text style already exists
      const existingStyle = figma.getStyleByName(`Text/${styleName}`);
      if (existingStyle) {
        console.log(`Text style ${styleName} already exists, skipping`);
        return;
      }

      // Create new text style
      const textStyle = figma.createTextStyle();
      textStyle.name = `Text/${styleName}`;
      textStyle.fontSize = style.fontSize;
      textStyle.lineHeight = { value: style.lineHeight, unit: 'PIXELS' };
      textStyle.letterSpacing = { value: style.letterSpacing, unit: 'PIXELS' };
      textStyle.fontWeight = style.fontWeight;
      
      // Set font family with proper GT Standard handling
      const fontName = await this.loadFontWithFallback(fontFamily, style.fontStyle);
      textStyle.fontName = fontName;
      
      console.log(`Created text style: ${styleName} with ${fontName.family} ${fontName.style}`);
    } catch (error) {
      console.error(`Error creating text style ${styleName}:`, error);
      this.state.addWarning(`Failed to create text style: ${styleName}`);
    }
  }

  // Load font with proper fallback handling - uses the proven working logic
  private async loadFontWithFallback(fontFamily: string, style: string): Promise<{ family: string; style: string }> {
    try {
      // If using GT Standard, use the M style mapping
      if (fontFamily === "GT Standard") {
        // Map numeric/descriptive styles to GT Standard M styles
        let gtStyle: keyof typeof GT_STANDARD_M_STYLES = "regular";
        
        // Check for "semi" first, before "bold" to avoid conflicts
        if (style.toLowerCase().includes("semi") || style === "600") {
          gtStyle = "semibold";
        } else if (style.toLowerCase().includes("bold") || style === "700") {
          gtStyle = "bold";
        } else if (style.toLowerCase().includes("medium") || style === "500") {
          gtStyle = "medium";
        } else if (style.toLowerCase().includes("italic")) {
          gtStyle = "italic";
        }
        
        const gtFontName = await this.pickGTStandardMStyle(gtStyle);
        if (gtFontName) {
          console.log(`✅ Successfully loaded GT Standard M style: ${gtFontName.family} ${gtFontName.style}`);
          return gtFontName;
        } else {
          throw new Error("GT Standard M style not found");
        }
      } else if (fontFamily === "SF Pro" || fontFamily === "SF Pro Rounded" || fontFamily === "Apercu Pro Var") {
        // For SF Pro, SF Pro Rounded, and Apercu Pro, try to load with the exact style
        // If that fails, try common variations
        const styleVariations = [
          style,
          style.replace("Semi Bold", "Semibold"),
          style.replace("Semibold", "Semi Bold"),
          style.replace("Regular", "Normal"),
          style.replace("Normal", "Regular")
        ];
        
        for (const variation of styleVariations) {
          try {
            await figma.loadFontAsync({ family: fontFamily, style: variation });
            console.log(`✅ Successfully loaded font: ${fontFamily} ${variation}`);
            return { family: fontFamily, style: variation };
          } catch (variationError) {
            continue;
          }
        }
        
        // If all variations fail, throw the original error
        throw new Error(`No suitable style found for ${fontFamily}`);
      } else {
        // For other fonts (like Inter), use the style as-is
        await figma.loadFontAsync({ family: fontFamily, style: style });
        console.log(`✅ Successfully loaded font: ${fontFamily} ${style}`);
        return { family: fontFamily, style: style };
      }
    } catch (error) {
      console.warn(`Failed to load font ${fontFamily} ${style}, using fallback: ${error.message}`);
      // Use fallback font
      const fallbackFont = FONT_MODES[this.currentFontMode]?.fallback || 'Inter';
      try {
        await figma.loadFontAsync({ family: fallbackFont, style: 'Regular' });
        console.log(`✅ Using fallback font: ${fallbackFont} Regular`);
        return { family: fallbackFont, style: 'Regular' };
      } catch (fallbackError) {
        console.error(`Fallback font also failed: ${fallbackError.message}`);
        throw new Error(`Both primary and fallback fonts failed to load`);
      }
    }
  }

  // Pick GT Standard M style based on weight preference - copied from working code
  private async pickGTStandardMStyle(wanted: keyof typeof GT_STANDARD_M_STYLES = "regular"): Promise<{ family: string; style: string } | null> {
    try {
      const fonts = await figma.listAvailableFontsAsync();
      const mCuts = fonts
        .filter(f => f.fontName.family === "GT Standard")
        .filter(f => /^M\b/i.test(f.fontName.style)); // only "M …" (skip Narrow/Wide)

      const wantedPatterns = GT_STANDARD_M_STYLES[wanted].map(s => new RegExp(`^${s}$`, "i"));
      const match = mCuts.find(f => wantedPatterns.some(rx => rx.test(f.fontName.style)));

      if (!match) {
        const available = mCuts.map(f => f.fontName.style).join(", ");
        console.warn(`Couldn't find GT Standard M cut for "${wanted}". Available: ${available}`);
        return null;
      }

      await figma.loadFontAsync(match.fontName);
      return match.fontName;
    } catch (error) {
      console.error(`Error loading GT Standard M style "${wanted}":`, error);
      return null;
    }
  }

  // Map style to GT Standard M styles
  private mapToGTStandardStyle(style: string): string[] {
    const GT_STANDARD_M_STYLES: Record<string, string[]> = {
      regular: ["M Standard Regular", "M Regular"],
      medium: ["M Standard Medium", "M Medium"],
      semibold: ["M Standard Semi Bold", "M Semi Bold", "M Semibold"],
      bold: ["M Standard Bold", "M Bold"],
      italic: ["M Standard Italic", "M Italic"]
    };

    const styleLower = style.toLowerCase();
    
    // Check for "semi" first, before "bold" to avoid conflicts
    if (styleLower.includes("semi") || style === "600") {
      return GT_STANDARD_M_STYLES.semibold;
    } else if (styleLower.includes("bold") || style === "700") {
      return GT_STANDARD_M_STYLES.bold;
    } else if (styleLower.includes("medium") || style === "500") {
      return GT_STANDARD_M_STYLES.medium;
    } else if (styleLower.includes("italic")) {
      return GT_STANDARD_M_STYLES.italic;
    } else {
      return GT_STANDARD_M_STYLES.regular;
    }
  }

  // Validate font system
  validateFontSystem(fontFamily: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (fontFamily !== 'none' && !FONT_MODES[fontFamily]) {
      errors.push(`Invalid font family: ${fontFamily}`);
    }
    
    if (fontFamily !== 'none') {
      const typographyScale = this.getTypographyScale(fontFamily);
      if (!typographyScale) {
        errors.push(`No typography scale found for font family: ${fontFamily}`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
