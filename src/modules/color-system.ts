// Color system module for the Custom Color System plugin
import { RGBA, RadixTheme } from '../core/types';
import { hexToRgb, getContrastRatio, meetsAAContrast, mixColors, rgbToHex, rgbaToHex } from '../core/utils';

export class ColorSystemManager {
  private state: any;

  constructor(state: any) {
    this.state = state;
  }

  // Create or update color variable with RGBA value
  async createOrUpdateColorVariableWithValue(
    collection: VariableCollection, 
    modeId: string, 
    name: string, 
    value: RGBA
  ): Promise<Variable | null> {
    try {
      const existingVarId = await this.findExistingVariable(collection, name);
      
      if (existingVarId) {
        const variable = await figma.variables.getVariableByIdAsync(existingVarId);
        if (variable) {
          variable.setValueForMode(modeId, value);
          console.log(`Updated existing variable: ${name}`);
          return variable;
        }
      } else {
        console.log(`🔍 [ColorSystemManager] About to create variable: ${name}`);
        const variable = figma.variables.createVariable();
        console.log(`🔍 [ColorSystemManager] Variable created, setting name: ${name}`);
        variable.name = name;
        console.log(`🔍 [ColorSystemManager] Name set, setting value for mode: ${modeId}`);
        variable.setValueForMode(modeId, value);
        console.log(`🔍 [ColorSystemManager] Value set, adding to collection`);
        collection.addVariable(variable);
        console.log(`Created new variable: ${name}`);
        return variable;
      }
    } catch (error) {
      console.error(`Error creating/updating variable ${name}:`, error);
      this.state.addError(`Failed to create variable: ${name}`);
      return null;
    }
  }

  // Create or update color variable with hex value
  async createOrUpdateColorVariable(
    collection: VariableCollection, 
    modeId: string, 
    name: string, 
    colorHex: string
  ): Promise<Variable | null> {
    console.log(`🔍 [ColorSystemManager] Creating variable: ${name} with color: ${colorHex}`);
    const rgb = hexToRgb(colorHex);
    if (!rgb) {
      console.error(`Invalid hex color: ${colorHex}`);
      this.state.addError(`Invalid hex color: ${colorHex}`);
      return null;
    }
    console.log(`🔍 [ColorSystemManager] RGB value:`, rgb);
    return this.createOrUpdateColorVariableWithValue(collection, modeId, name, rgb);
  }

  // Create or update hardcoded variable
  async createOrUpdateHardcodedVar(
    collection: VariableCollection, 
    modeId: string, 
    name: string, 
    value: RGBA
  ): Promise<Variable | null> {
    return this.createOrUpdateColorVariableWithValue(collection, modeId, name, value);
  }

  // Create or update contrast color variable
  async createOrUpdateContrastColorVariable(
    collection: VariableCollection, 
    modeId: string, 
    name: string, 
    colorHex: string, 
    backgroundColor: string
  ): Promise<Variable | null> {
    const rgb = hexToRgb(colorHex);
    const bgRgb = hexToRgb(backgroundColor);
    
    if (!rgb || !bgRgb) {
      console.error(`Invalid colors: ${colorHex}, ${backgroundColor}`);
      this.state.addError(`Invalid colors for contrast: ${colorHex}, ${backgroundColor}`);
      return null;
    }

    const contrastRatio = getContrastRatio(rgb, bgRgb);
    const meetsAA = meetsAAContrast(colorHex, backgroundColor);
    
    console.log(`Contrast ratio for ${name}: ${contrastRatio.toFixed(2)} (AA: ${meetsAA})`);
    
    return this.createOrUpdateColorVariableWithValue(collection, modeId, name, rgb);
  }

  // Create primitive variables
  async createPrimitiveVariables(
    collection: VariableCollection, 
    modeId: string,
    brandTheme: RadixTheme,
    neutralTheme: RadixTheme,
    successTheme: RadixTheme,
    errorTheme: RadixTheme
  ): Promise<void> {
    console.log(`🔍 [ColorSystemManager] Creating primitive variables for mode: ${modeId}`);
    console.log(`🔍 [ColorSystemManager] Brand theme:`, brandTheme);
    console.log(`🔍 [ColorSystemManager] Collection:`, collection);
    
    try {
      // Create or update brand color scales
      await Promise.all(brandTheme.accentScale.map((color, index) => 
        this.createOrUpdateColorVariable(collection, modeId, `Brand Scale/${index + 1}`, color)
      ));

      await Promise.all(brandTheme.accentScaleAlpha.map((color, index) => 
        this.createOrUpdateColorVariable(collection, modeId, `Brand Scale Alpha/${index + 1}`, color)
      ));

      await this.createOrUpdateColorVariable(collection, modeId, `Brand Contrast/1`, brandTheme.accentContrast);

      // Create or update neutral color scales
      await Promise.all(neutralTheme.accentScale.map((color, index) => 
        this.createOrUpdateColorVariable(collection, modeId, `Neutral Scale/${index + 1}`, color)
      ));

      await Promise.all(neutralTheme.accentScaleAlpha.map((color, index) => 
        this.createOrUpdateColorVariable(collection, modeId, `Neutral Scale Alpha/${index + 1}`, color)
      ));

      // Create or update success color scales
      await Promise.all(successTheme.accentScale.map((color, index) => 
        this.createOrUpdateColorVariable(collection, modeId, `Success Scale/${index + 1}`, color)
      ));

      await Promise.all(successTheme.accentScaleAlpha.map((color, index) => 
        this.createOrUpdateColorVariable(collection, modeId, `Success Scale Alpha/${index + 1}`, color)
      ));

      await this.createOrUpdateColorVariable(collection, modeId, `Success Contrast/1`, successTheme.accentContrast);

      // Create or update error color scales
      await Promise.all(errorTheme.accentScale.map((color, index) => 
        this.createOrUpdateColorVariable(collection, modeId, `Error Scale/${index + 1}`, color)
      ));

      await Promise.all(errorTheme.accentScaleAlpha.map((color, index) => 
        this.createOrUpdateColorVariable(collection, modeId, `Error Scale Alpha/${index + 1}`, color)
      ));

      await this.createOrUpdateColorVariable(collection, modeId, `Error Contrast/1`, errorTheme.accentContrast);

      console.log(`Successfully created primitive variables for mode: ${modeId}`);
    } catch (error) {
      console.error(`Error creating primitive variables:`, error);
      this.state.addError(`Failed to create primitive variables: ${error.message}`);
    }
  }

  // Create semantic variables
  async createSemanticVariables(
    semanticCollection: VariableCollection,
    primitiveCollection: VariableCollection,
    appearance: "light" | "dark" | "both"
  ): Promise<void> {
    console.log("Creating semantic variables for appearance:", appearance);
    
    try {
      const modeId = semanticCollection.modes[0].modeId;
      
      // Create semantic variables based on appearance
      if (appearance === "light" || appearance === "both") {
        await this.createLightSemanticVariables(semanticCollection, primitiveCollection, modeId);
      }
      
      if (appearance === "dark" || appearance === "both") {
        await this.createDarkSemanticVariables(semanticCollection, primitiveCollection, modeId);
      }
      
      console.log("Successfully created semantic variables");
    } catch (error) {
      console.error("Error creating semantic variables:", error);
      this.state.addError(`Failed to create semantic variables: ${error.message}`);
    }
  }

  // Create light semantic variables
  private async createLightSemanticVariables(
    semanticCollection: VariableCollection,
    primitiveCollection: VariableCollection,
    modeId: string
  ): Promise<void> {
    // Background variables
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Background/Primary", "#FFFFFF");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Background/Secondary", "#F8FAFC");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Background/Tertiary", "#F1F5F9");
    
    // Text variables
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Text/Primary", "#0F172A");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Text/Secondary", "#475569");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Text/Tertiary", "#94A3B8");
    
    // Border variables
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Border/Primary", "#E2E8F0");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Border/Secondary", "#CBD5E1");
    
    // Brand variables
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Brand/Primary", "#3B82F6");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Brand/Secondary", "#1D4ED8");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Brand/Tertiary", "#1E40AF");
  }

  // Create dark semantic variables
  private async createDarkSemanticVariables(
    semanticCollection: VariableCollection,
    primitiveCollection: VariableCollection,
    modeId: string
  ): Promise<void> {
    // Background variables
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Background/Primary", "#0F172A");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Background/Secondary", "#1E293B");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Background/Tertiary", "#334155");
    
    // Text variables
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Text/Primary", "#F8FAFC");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Text/Secondary", "#CBD5E1");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Text/Tertiary", "#94A3B8");
    
    // Border variables
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Border/Primary", "#475569");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Border/Secondary", "#64748B");
    
    // Brand variables
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Brand/Primary", "#60A5FA");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Brand/Secondary", "#3B82F6");
    await this.createOrUpdateColorVariable(semanticCollection, modeId, "Brand/Tertiary", "#2563EB");
  }

  // Find existing variable by name
  private async findExistingVariable(collection: VariableCollection, name: string): Promise<string | null> {
    for (const id of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(id);
      if (variable?.name === name) {
        return id;
      }
    }
    return null;
  }

  // Validate color themes
  validateThemes(themes: RadixTheme[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    themes.forEach((theme, index) => {
      if (!theme.accentScale || theme.accentScale.length !== 12) {
        errors.push(`Theme ${index}: accentScale must have 12 colors`);
      }
      
      if (!theme.accentScaleAlpha || theme.accentScaleAlpha.length !== 12) {
        errors.push(`Theme ${index}: accentScaleAlpha must have 12 colors`);
      }
      
      if (!theme.accentContrast) {
        errors.push(`Theme ${index}: accentContrast is required`);
      }
      
      if (!theme.background) {
        errors.push(`Theme ${index}: background is required`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Create direct variables (semantic variables that don't depend on primitives)
  async createDirectVariables(
    collection: VariableCollection,
    modeId: string,
    brandTheme: any,
    neutralTheme: any,
    successTheme: any,
    errorTheme: any
  ): Promise<void> {
    console.log(`Creating or updating direct variables for mode: ${modeId}`);

    // Surface variables
    await Promise.all([
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-neutral-primary", brandTheme.background),
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-neutral-secondary", neutralTheme.accentScale[1]),
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-brand-primary", brandTheme.accentScale[1]),
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-brand-primary-emphasized", brandTheme.accentScale[2]),
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-shadow", neutralTheme.accentScaleAlpha[3])
    ]);

    // Text & Icon variables
    await Promise.all([
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-neutral-primary", neutralTheme.accentScale[11]),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-neutral-secondary", neutralTheme.accentScale[10]),
      this.createOrUpdateContrastColorVariable(collection, modeId, "text-icon/ti-brand-primary", brandTheme.accentScale[8], brandTheme.background),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-brand-primary", brandTheme.accentContrast),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-brand-primary-subtle", brandTheme.accentScale[10]),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-error", errorTheme.accentContrast),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-error-subtle", errorTheme.accentScale[10]),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-success", successTheme.accentContrast),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-success-subtle", successTheme.accentScale[10])
    ]);

    // Background variables
    await Promise.all([
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary", brandTheme.accentScale[8]),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-emphasized", brandTheme.accentScale[9]),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-subtle", brandTheme.accentScale[2]),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-subtle-emphasized", brandTheme.accentScale[3]),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-overlay", brandTheme.accentScaleAlpha[5]),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-error", errorTheme.accentScale[8]),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-error-emphasized", errorTheme.accentScale[9]),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-error-subtle", errorTheme.accentScale[2]),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-error-subtle-emphasized", errorTheme.accentScale[3]),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-success", successTheme.accentScale[8]),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-success-emphasized", successTheme.accentScale[9]),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-success-subtle", successTheme.accentScale[2]),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-success-subtle-emphasized", successTheme.accentScale[3])
    ]);

    // Border variables
    await Promise.all([
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-sf-neutral-primary", neutralTheme.accentScale[6]),
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-sf-neutral-secondary", neutralTheme.accentScale[7]),
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-brand-primary", brandTheme.accentScale[10]),
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-brand-primary-subtle", brandTheme.accentScale[7]),
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-success", successTheme.accentScale[10]),
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-success-subtle", successTheme.accentScale[7]),
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-error", errorTheme.accentScale[10]),
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-error-subtle", errorTheme.accentScale[7])
    ]);

    // Create hardcoded variables when not using primitives
    console.log(`[createDirectVariables] Creating hardcoded variables for mode: ${modeId}`);
    await Promise.all([
      this.createOrUpdateHardcodedVar(collection, modeId, "surface/sf-overlay", { r: 0, g: 0, b: 0, a: 0.65 }),
      this.createOrUpdateHardcodedVar(collection, modeId, "text-icon/ti-on-surface-overlay", { r: 1, g: 1, b: 1, a: 1 })
    ]);
    console.log(`[createDirectVariables] Finished creating hardcoded variables`);
  }

  // Create light direct variables
  private async createLightDirectVariables(
    collection: VariableCollection,
    modeId: string
  ): Promise<void> {
    console.log(`Creating light direct variables for mode: ${modeId}`);
    
    // Surface variables
    await Promise.all([
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-neutral-primary", "#FFFFFF"),
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-neutral-secondary", "#F8FAFC"),
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-brand-primary", "#3B82F6"),
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-brand-primary-emphasized", "#1D4ED8"),
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-shadow", "#0000001A")
    ]);

    // Text & Icon variables
    await Promise.all([
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-neutral-primary", "#0F172A"),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-neutral-secondary", "#475569"),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-brand-primary", "#1E40AF"),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-brand-primary", "#FFFFFF"),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-brand-primary-subtle", "#475569")
    ]);

    // Background variables
    await Promise.all([
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary", "#1E40AF"),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-emphasized", "#1D4ED8"),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-subtle", "#3B82F6"),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-subtle-emphasized", "#1D4ED8")
    ]);

    // Border variables
    await Promise.all([
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-sf-neutral-primary", "#E2E8F0"),
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-sf-neutral-secondary", "#CBD5E1"),
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-brand-primary", "#1E40AF"),
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-brand-primary-subtle", "#3B82F6")
    ]);

    // Hardcoded variables
    await Promise.all([
      this.createOrUpdateHardcodedVar(collection, modeId, "surface/sf-overlay", { r: 0, g: 0, b: 0, a: 0.65 }),
      this.createOrUpdateHardcodedVar(collection, modeId, "text-icon/ti-on-surface-overlay", { r: 1, g: 1, b: 1, a: 1 })
    ]);
  }

  // Create dark direct variables
  private async createDarkDirectVariables(
    collection: VariableCollection,
    modeId: string
  ): Promise<void> {
    console.log(`Creating dark direct variables for mode: ${modeId}`);
    
    // Surface variables
    await Promise.all([
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-neutral-primary", "#0F172A"),
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-neutral-secondary", "#1E293B"),
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-brand-primary", "#60A5FA"),
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-brand-primary-emphasized", "#3B82F6"),
      this.createOrUpdateColorVariable(collection, modeId, "surface/sf-shadow", "#0000001A")
    ]);

    // Text & Icon variables
    await Promise.all([
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-neutral-primary", "#F8FAFC"),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-neutral-secondary", "#CBD5E1"),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-brand-primary", "#60A5FA"),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-brand-primary", "#FFFFFF"),
      this.createOrUpdateColorVariable(collection, modeId, "text-icon/ti-on-bg-brand-primary-subtle", "#CBD5E1")
    ]);

    // Background variables
    await Promise.all([
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary", "#60A5FA"),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-emphasized", "#3B82F6"),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-subtle", "#1E40AF"),
      this.createOrUpdateColorVariable(collection, modeId, "background/bg-brand-primary-subtle-emphasized", "#3B82F6")
    ]);

    // Border variables
    await Promise.all([
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-sf-neutral-primary", "#475569"),
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-sf-neutral-secondary", "#64748B"),
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-brand-primary", "#60A5FA"),
      this.createOrUpdateColorVariable(collection, modeId, "border/br-with-bg-brand-primary-subtle", "#1E40AF")
    ]);

    // Hardcoded variables
    await Promise.all([
      this.createOrUpdateHardcodedVar(collection, modeId, "surface/sf-overlay", { r: 0, g: 0, b: 0, a: 0.65 }),
      this.createOrUpdateHardcodedVar(collection, modeId, "text-icon/ti-on-surface-overlay", { r: 1, g: 1, b: 1, a: 1 })
    ]);
  }

}
