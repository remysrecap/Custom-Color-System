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
      
      // Create semantic variables with direct hex values (no modes)
      const lightMode = semanticCollection.modes[0];
      semanticCollection.renameMode(lightMode.modeId, "Mode");
      
      // Use light theme colors for semantic variables (flattened)
      await createDirectVariables(semanticCollection, lightMode.modeId, 
        themes.lightBrandTheme, themes.lightNeutralTheme, themes.lightSuccessTheme, themes.lightErrorTheme);
      
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
