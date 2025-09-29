import { log } from '../core/logger';
import { logError } from '../core/utils';
import { createVariableCollection } from './figma-api';
import { createPrimitiveVariables, createSemanticVariables, createDirectVariables } from './color-system';

// ===============================================
// System Creation Module - Handles system creation
// ===============================================

/**
 * System Creation Module class for creating color systems
 */
export class SystemCreationModule {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initializes the system creation module
   */
  private initialize(): void {
    if (this.isInitialized) {
      log.warn('System creation module already initialized', 'system-creation-module', 'initialize');
      return;
    }

    try {
      log.info('Initializing system creation module', 'system-creation-module', 'initialize');
      this.isInitialized = true;
      log.success('System creation module initialized successfully', 'system-creation-module', 'initialize');
    } catch (error) {
      logError('Failed to initialize system creation module', error as Error);
      throw error;
    }
  }

  /**
   * Creates a primitive system with collections
   */
  public async createPrimitiveSystem(
    versionNumber: string,
    themes: any,
    appearance: "light" | "dark" | "both",
    includeFontSystem: boolean,
    exportDemo: boolean,
    exportDocumentation: boolean
  ): Promise<void> {
    try {
      log.info('Creating primitive system', 'system-creation-module', 'createPrimitiveSystem');
      
      // Create collections
      const primitiveCollection = await createVariableCollection(`SCS Primitive ${versionNumber}`);
      const semanticCollection = await createVariableCollection(`SCS Semantic ${versionNumber}`);
      
      // Create primitive variables for each mode
      log.info(`Creating primitive variables for appearance: ${appearance}`, 'system-creation-module', 'createPrimitiveSystem');
      
      if (appearance === "light" || appearance === "both") {
        log.info('Creating light mode primitive variables', 'system-creation-module', 'createPrimitiveSystem');
        const lightMode = primitiveCollection.modes[0];
        primitiveCollection.renameMode(lightMode.modeId, "Light");
        await createPrimitiveVariables(primitiveCollection, lightMode.modeId, 
          themes.lightBrandTheme, themes.lightNeutralTheme, themes.lightSuccessTheme, themes.lightErrorTheme);
        log.success('Light mode primitive variables created', 'system-creation-module', 'createPrimitiveSystem');
      }
      
      if (appearance === "dark" || appearance === "both") {
        log.info('Creating dark mode primitive variables', 'system-creation-module', 'createPrimitiveSystem');
        const darkModeId = appearance === "both" ? 
          primitiveCollection.addMode("Dark") : primitiveCollection.modes[0].modeId;
        await createPrimitiveVariables(primitiveCollection, darkModeId, 
          themes.darkBrandTheme, themes.darkNeutralTheme, themes.darkSuccessTheme, themes.darkErrorTheme);
        log.success('Dark mode primitive variables created', 'system-creation-module', 'createPrimitiveSystem');
      }
      
      // Wait for primitive variables to be fully committed
      log.info('Waiting for primitive variables to be fully committed...', 'system-creation-module', 'createPrimitiveSystem');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify primitive variables exist
      log.info('Verifying primitive variables are available...', 'system-creation-module', 'createPrimitiveSystem');
      try {
        const primitiveVariables = await Promise.all(
          primitiveCollection.variableIds.map(id => figma.variables.getVariableByIdAsync(id))
        );
        log.info(`Found ${primitiveVariables.length} primitive variables`, 'system-creation-module', 'createPrimitiveSystem');
      } catch (error) {
        log.error(`Failed to verify primitive variables: ${error}`, 'system-creation-module', 'createPrimitiveSystem');
      }
      
      // Create semantic variables
      log.info('Creating semantic variables...', 'system-creation-module', 'createPrimitiveSystem');
      await createSemanticVariables(semanticCollection, primitiveCollection, appearance);
      log.success('Semantic variables created successfully', 'system-creation-module', 'createPrimitiveSystem');
      
      // Wait for semantic variables to be fully committed
      log.info('Waiting for semantic variables to be fully committed...', 'system-creation-module', 'createPrimitiveSystem');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Create font system if enabled
      if (includeFontSystem) {
        await this.createFontSystem(versionNumber);
      }
      
      // Create demo components if enabled
      if (exportDemo) {
        await this.createDemoComponents(primitiveCollection, semanticCollection);
      }
      
      // Create documentation if enabled
      if (exportDocumentation) {
        await this.createDocumentation(primitiveCollection, semanticCollection);
      }
      
      log.success('Primitive system created successfully', 'system-creation-module', 'createPrimitiveSystem');
    } catch (error) {
      logError('Failed to create primitive system', error as Error);
      throw error;
    }
  }

  /**
   * Creates a semantic-only system with flattened hex values
   */
  public async createSemanticOnlySystem(
    versionNumber: string,
    themes: any,
    appearance: "light" | "dark" | "both",
    includeFontSystem: boolean,
    exportDemo: boolean,
    exportDocumentation: boolean
  ): Promise<void> {
    try {
      log.info('Creating semantic-only system', 'system-creation-module', 'createSemanticOnlySystem');
      
      // Create only semantic collection
      const semanticCollection = await createVariableCollection(`SCS Semantic ${versionNumber}`);
      
      // Create semantic variables with direct hex values for both light and dark modes
      const lightMode = semanticCollection.modes[0];
      semanticCollection.renameMode(lightMode.modeId, "Light");
      
      // Create light mode semantic variables with flattened hex values
      await this.createFlattenedSemanticVariables(semanticCollection, lightMode.modeId, 
        themes.lightBrandTheme, themes.lightNeutralTheme, themes.lightSuccessTheme, themes.lightErrorTheme);
      
      // Create dark mode if needed
      if (appearance === "dark" || appearance === "both") {
        const darkModeId = appearance === "both" ? 
          semanticCollection.addMode("Dark") : lightMode.modeId;
        
        // Create dark mode semantic variables with flattened hex values
        await this.createFlattenedSemanticVariables(semanticCollection, darkModeId, 
          themes.darkBrandTheme, themes.darkNeutralTheme, themes.darkSuccessTheme, themes.darkErrorTheme);
      }
      
      log.success('Semantic-only system created successfully', 'system-creation-module', 'createSemanticOnlySystem');
      
      // Create font system if enabled
      if (includeFontSystem) {
        await this.createFontSystem(versionNumber);
      }
      
      // Create demo components if enabled
      if (exportDemo) {
        await this.createDemoComponents(null, semanticCollection);
      }
      
      // Create documentation if enabled
      if (exportDocumentation) {
        await this.createDocumentation(null, semanticCollection);
      }
      
    } catch (error) {
      logError('Failed to create semantic-only system', error as Error);
      throw error;
    }
  }

  /**
   * Creates flattened semantic variables with direct hex values
   */
  private async createFlattenedSemanticVariables(
    collection: VariableCollection,
    modeId: string,
    brandTheme: any,
    neutralTheme: any,
    successTheme: any,
    errorTheme: any
  ): Promise<void> {
    try {
      log.info('Creating flattened semantic variables', 'system-creation-module', 'createFlattenedSemanticVariables');
      
      // Helper function to create variable with direct hex value
      const createVariableWithHex = async (name: string, colorHex: string): Promise<void> => {
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
            log.info(`Using existing flattened variable: ${name}`, 'system-creation-module', 'createFlattenedSemanticVariables');
          } else {
            // Create new variable
            variable = figma.variables.createVariable(name, collection, "COLOR");
            log.info(`Creating new flattened variable: ${name}`, 'system-creation-module', 'createFlattenedSemanticVariables');
          }
          
          // Convert hex to RGBA (handle transparency)
          const hex = colorHex.replace('#', '');
          let r, g, b, a = 1;
          
          if (hex.length === 8) {
            // Has alpha channel (e.g., #000000A6)
            r = parseInt(hex.substr(0, 2), 16) / 255;
            g = parseInt(hex.substr(2, 2), 16) / 255;
            b = parseInt(hex.substr(4, 2), 16) / 255;
            a = parseInt(hex.substr(6, 2), 16) / 255;
          } else {
            // No alpha channel (e.g., #000000)
            r = parseInt(hex.substr(0, 2), 16) / 255;
            g = parseInt(hex.substr(2, 2), 16) / 255;
            b = parseInt(hex.substr(4, 2), 16) / 255;
            a = 1;
          }
          
          const rgba: RGBA = { r, g, b, a };
          
          variable.setValueForMode(modeId, rgba);
          log.success(`Created flattened variable: ${name} with color ${colorHex} for mode ${modeId}`, 'system-creation-module', 'createFlattenedSemanticVariables');
        } catch (error) {
          log.error(`Failed to create variable ${name}: ${error}`, 'system-creation-module', 'createFlattenedSemanticVariables');
        }
      };

      // Create surface variables
      await Promise.all([
        createVariableWithHex("surface/sf-neutral-primary", brandTheme.background),
        createVariableWithHex("surface/sf-neutral-secondary", neutralTheme.accentScale[1]),
        createVariableWithHex("surface/sf-brand-primary", brandTheme.accentScale[1]),
        createVariableWithHex("surface/sf-brand-primary-emphasized", brandTheme.accentScale[2]),
        createVariableWithHex("surface/sf-shadow", neutralTheme.accentScaleAlpha[3]),
        createVariableWithHex("surface/sf-overlay", "#000000A6") // Hardcoded overlay with transparency
      ]);

      // Create text & icon variables
      await Promise.all([
        createVariableWithHex("text-icon/ti-neutral-primary", neutralTheme.accentScale[11]),
        createVariableWithHex("text-icon/ti-neutral-secondary", neutralTheme.accentScale[10]),
        createVariableWithHex("text-icon/ti-brand-primary", brandTheme.accentScale[8]),
        createVariableWithHex("text-icon/ti-on-bg-brand-primary-subtle", brandTheme.accentScale[10]),
        createVariableWithHex("text-icon/ti-on-bg-error-subtle", errorTheme.accentScale[10]),
        createVariableWithHex("text-icon/ti-on-bg-success-subtle", successTheme.accentScale[10]),
        createVariableWithHex("text-icon/ti-on-surface-overlay", "#FFFFFF") // Hardcoded white
      ]);

      // Create background variables
      await Promise.all([
        createVariableWithHex("background/bg-brand-primary", brandTheme.accentScale[8]),
        createVariableWithHex("background/bg-brand-primary-emphasized", brandTheme.accentScale[9]),
        createVariableWithHex("background/bg-brand-primary-subtle", brandTheme.accentScale[2]),
        createVariableWithHex("background/bg-brand-primary-subtle-emphasized", brandTheme.accentScale[3]),
        createVariableWithHex("background/bg-brand-primary-overlay", brandTheme.accentScaleAlpha[5]),
        createVariableWithHex("background/bg-error", errorTheme.accentScale[8]),
        createVariableWithHex("background/bg-error-emphasized", errorTheme.accentScale[9]),
        createVariableWithHex("background/bg-error-subtle", errorTheme.accentScale[2]),
        createVariableWithHex("background/bg-error-subtle-emphasized", errorTheme.accentScale[3]),
        createVariableWithHex("background/bg-success", successTheme.accentScale[8]),
        createVariableWithHex("background/bg-success-emphasized", successTheme.accentScale[9]),
        createVariableWithHex("background/bg-success-subtle", successTheme.accentScale[2]),
        createVariableWithHex("background/bg-success-subtle-emphasized", successTheme.accentScale[3])
      ]);

      // Create border variables
      await Promise.all([
        createVariableWithHex("border/br-with-sf-neutral-primary", neutralTheme.accentScale[5]),
        createVariableWithHex("border/br-with-sf-neutral-secondary", neutralTheme.accentScale[6]),
        createVariableWithHex("border/br-with-bg-brand-primary", brandTheme.accentScale[9]),
        createVariableWithHex("border/br-with-bg-brand-primary-subtle", brandTheme.accentScale[6]),
        createVariableWithHex("border/br-with-bg-success", successTheme.accentScale[9]),
        createVariableWithHex("border/br-with-bg-success-subtle", successTheme.accentScale[6]),
        createVariableWithHex("border/br-with-bg-error", errorTheme.accentScale[9]),
        createVariableWithHex("border/br-with-bg-error-subtle", errorTheme.accentScale[6])
      ]);

      log.success('Flattened semantic variables created successfully', 'system-creation-module', 'createFlattenedSemanticVariables');
    } catch (error) {
      logError('Failed to create flattened semantic variables', error as Error);
      throw error;
    }
  }

  /**
   * Creates font system
   */
  private async createFontSystem(versionNumber: string): Promise<void> {
    try {
      log.info('Creating font system', 'system-creation-module', 'createFontSystem');
      
      const { createSpacingCollection, createFontSystem, createTextStyles } = await import('./font-system');
      
      await createSpacingCollection(versionNumber);
      await createFontSystem(versionNumber);
      await createTextStyles(versionNumber);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      log.success('Font system created successfully', 'system-creation-module', 'createFontSystem');
    } catch (error) {
      logError('Failed to create font system', error as Error);
      throw error;
    }
  }

  /**
   * Creates demo components
   */
  private async createDemoComponents(
    primitiveCollection: VariableCollection | null,
    semanticCollection: VariableCollection | null
  ): Promise<void> {
    try {
      log.info('Creating demo components', 'system-creation-module', 'createDemoComponents');
      
      const { exportDemoComponents } = await import('./demo-module');
      await exportDemoComponents(primitiveCollection, semanticCollection);
      
      log.success('Demo components created successfully', 'system-creation-module', 'createDemoComponents');
    } catch (error) {
      logError('Failed to create demo components', error as Error);
      throw error;
    }
  }

  /**
   * Creates documentation
   */
  private async createDocumentation(
    primitiveCollection: VariableCollection | null,
    semanticCollection: VariableCollection | null
  ): Promise<void> {
    try {
      log.info('Creating documentation', 'system-creation-module', 'createDocumentation');
      
      const { createDocumentation } = await import('./documentation-module');
      await createDocumentation(primitiveCollection, semanticCollection);
      
      log.success('Documentation created successfully', 'system-creation-module', 'createDocumentation');
    } catch (error) {
      logError('Failed to create documentation', error as Error);
      throw error;
    }
  }
}

// ===============================================
// System Creation Module Factory
// ===============================================

/**
 * Creates and initializes a system creation module instance
 */
export function createSystemCreationModule(): SystemCreationModule {
  return new SystemCreationModule();
}
