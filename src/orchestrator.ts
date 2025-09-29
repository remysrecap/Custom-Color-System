import { log } from './core/logger';
import { logError } from './core/utils';
import { PluginMessage } from './core/types';
import { UIModule, createUIModule } from './modules/ui-module';
import { DocumentationModule, createDocumentationModule } from './modules/documentation-module';
import { DemoModule, createDemoModule } from './modules/demo-module';
import { SystemCreationModule, createSystemCreationModule } from './modules/system-creation-module';
import { generateColorThemes } from './modules/color-system';

// ===============================================
// Main Orchestrator - Coordinates all modules
// ===============================================

/**
 * Main Orchestrator class that coordinates all plugin modules
 */
export class PluginOrchestrator {
  private uiModule: UIModule;
  private documentationModule: DocumentationModule;
  private demoModule: DemoModule;
  private systemCreationModule: SystemCreationModule;
  private isInitialized = false;
  private isClosing = false;

  constructor() {
    this.uiModule = createUIModule();
    this.documentationModule = createDocumentationModule();
    this.demoModule = createDemoModule();
    this.systemCreationModule = createSystemCreationModule();
  }

  /**
   * Initializes the orchestrator and all modules
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      log.warn('Orchestrator already initialized', 'orchestrator', 'initialize');
      return;
    }

    try {
      log.info('Initializing plugin orchestrator', 'orchestrator', 'initialize');
      
      // Initialize all modules
      await this.initializeModules();
      
      // Setup message handling
      this.setupMessageHandling();
      
      this.isInitialized = true;
      log.success('Plugin orchestrator initialized successfully', 'orchestrator', 'initialize');
    } catch (error) {
      logError('Failed to initialize orchestrator', error as Error);
      throw error;
    }
  }

  /**
   * Initializes all modules
   */
  private async initializeModules(): Promise<void> {
    try {
      log.info('Initializing all modules', 'orchestrator', 'initializeModules');
      
      // UI module is already initialized in constructor
      // Documentation module is already initialized in constructor
      // Demo module is already initialized in constructor
      
      log.success('All modules initialized', 'orchestrator', 'initializeModules');
    } catch (error) {
      logError('Failed to initialize modules', error as Error);
      throw error;
    }
  }

  /**
   * Sets up message handling for the orchestrator
   */
  private setupMessageHandling(): void {
    try {
      log.info('Setting up message handling', 'orchestrator', 'setupMessageHandling');
      
      figma.ui.onmessage = async (msg: PluginMessage) => {
        try {
          await this.handleMessage(msg);
        } catch (error) {
          logError('Error handling message in orchestrator', error as Error);
          this.uiModule.showNotification('An error occurred while processing your request.', 'error');
          this.uiModule.sendMessage('complete');
        }
      };
      
      log.success('Message handling setup complete', 'orchestrator', 'setupMessageHandling');
    } catch (error) {
      logError('Failed to setup message handling', error as Error);
      throw error;
    }
  }

  /**
   * Handles incoming messages from the UI
   */
  private async handleMessage(msg: PluginMessage): Promise<void> {
    try {
      log.info(`Handling message: ${msg.type}`, 'orchestrator', 'handleMessage');
      
      switch (msg.type) {
        case 'generate-palette':
          await this.handleGeneratePalette(msg);
          break;
          
        case 'test-gt-standard':
          await this.handleTestGTStandard();
          break;
          
        case 'discover-gt-standard':
          await this.handleDiscoverGTStandard();
          break;
          
        case 'update-font-mode':
          await this.handleUpdateFontMode(msg);
          break;
          
        case 'bind-font-variables':
          await this.handleBindFontVariables();
          break;
          
        default:
          log.warn(`Unknown message type: ${msg.type}`, 'orchestrator', 'handleMessage');
      }
    } catch (error) {
      logError(`Failed to handle message: ${msg.type}`, error as Error);
      throw error;
    }
  }

  /**
   * Handles palette generation
   */
  private async handleGeneratePalette(msg: PluginMessage): Promise<void> {
    try {
      log.info('Handling generate palette request', 'orchestrator', 'handleGeneratePalette');
      
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

      // Get version number
      const { getNextVersionNumber } = await import('./modules/figma-api');
      const versionNumber = await getNextVersionNumber();
      log.info(`Using version number: ${versionNumber}`, 'orchestrator', 'handleGeneratePalette');
      
      // Set font mode if specified
      if (fontMode) {
        const { setCurrentFontMode } = await import('./modules/font-system');
        setCurrentFontMode(fontMode);
      }
      
      // Generate color themes
      const themes = createColorThemes(hexColor, neutral, success, error, appearance);
      
      // Create collections and variables based on includePrimitives setting
      if (includePrimitives) {
        await this.systemCreationModule.createPrimitiveSystem(versionNumber, themes, appearance, includeFontSystem, exportDemo, shouldExportDocumentation);
      } else {
        await this.systemCreationModule.createSemanticOnlySystem(versionNumber, themes, appearance, includeFontSystem, exportDemo, shouldExportDocumentation);
      }
      
      // Show success notification
      if (!this.isClosing) {
        const fontSystemMessage = includeFontSystem ? " with font system" : "";
        this.uiModule.showNotification(`Successfully created color system${fontSystemMessage} with version ${versionNumber}`, 'success');
        this.uiModule.sendMessage('complete');
      }
      
    } catch (error) {
      logError('Failed to generate palette', error as Error);
      if (!this.isClosing) {
        this.uiModule.showNotification('Error generating variables.', 'error');
        this.uiModule.sendMessage('complete');
      }
    } finally {
      if (!this.isClosing) {
        this.isClosing = true;
        this.uiModule.sendMessage('complete');
        setTimeout(() => {
          this.uiModule.closePlugin();
        }, 100);
      }
    }
  }

  /**
   * Handles GT Standard font testing
   */
  private async handleTestGTStandard(): Promise<void> {
    try {
      log.info('Handling GT Standard test request', 'orchestrator', 'handleTestGTStandard');
      
      const { testGTStandardFont } = await import('./modules/font-system');
      const isAvailable = await testGTStandardFont();
      this.uiModule.sendMessage({ type: "gt-standard-test-result", available: isAvailable });
    } catch (error) {
      logError('Failed to test GT Standard font', error as Error);
      this.uiModule.sendMessage({ type: "gt-standard-test-result", available: false });
    }
  }

  /**
   * Handles GT Standard font discovery
   */
  private async handleDiscoverGTStandard(): Promise<void> {
    try {
      log.info('Handling GT Standard discovery request', 'orchestrator', 'handleDiscoverGTStandard');
      
      const { discoverGTStandardFont } = await import('./modules/font-system');
      await discoverGTStandardFont();
    } catch (error) {
      logError('Failed to discover GT Standard font', error as Error);
    }
  }

  /**
   * Handles font mode updates
   */
  private async handleUpdateFontMode(msg: PluginMessage): Promise<void> {
    try {
      log.info('Handling font mode update request', 'orchestrator', 'handleUpdateFontMode');
      
      const { setCurrentFontMode } = await import('./modules/font-system');
      if (msg.fontMode) {
        setCurrentFontMode(msg.fontMode);
      }
    } catch (error) {
      logError('Failed to update font mode', error as Error);
    }
  }

  /**
   * Handles font variable binding
   */
  private async handleBindFontVariables(): Promise<void> {
    try {
      log.info('Handling font variable binding request', 'orchestrator', 'handleBindFontVariables');
      
      const { bindFontVariables } = await import('./modules/font-system');
      await bindFontVariables();
    } catch (error) {
      logError('Failed to bind font variables', error as Error);
    }
  }

  /**
   * Gets the current orchestrator state
   */
  public getState(): { isInitialized: boolean; isClosing: boolean; moduleStates: any } {
    return {
      isInitialized: this.isInitialized,
      isClosing: this.isClosing,
      moduleStates: {
        ui: this.uiModule.getUIState(),
        documentation: { isInitialized: this.documentationModule['isInitialized'] },
        demo: { isInitialized: this.demoModule['isInitialized'] }
      }
    };
  }

  /**
   * Shuts down the orchestrator
   */
  public async shutdown(): Promise<void> {
    try {
      log.info('Shutting down orchestrator', 'orchestrator', 'shutdown');
      
      this.isClosing = true;
      
      // Cleanup any resources
      log.success('Orchestrator shutdown complete', 'orchestrator', 'shutdown');
    } catch (error) {
      logError('Failed to shutdown orchestrator', error as Error);
    }
  }
}

// ===============================================
// Orchestrator Factory
// ===============================================

/**
 * Creates and initializes a plugin orchestrator
 */
export async function createPluginOrchestrator(): Promise<PluginOrchestrator> {
  const orchestrator = new PluginOrchestrator();
  await orchestrator.initialize();
  return orchestrator;
}

// ===============================================
// Main Plugin Entry Point
// ===============================================

/**
 * Main plugin entry point - replaces the old monolithic approach
 */
export async function initializePlugin(): Promise<void> {
  try {
    log.info('Initializing plugin with orchestrator', 'orchestrator', 'initializePlugin');
    
    // Create and initialize the orchestrator
    const orchestrator = await createPluginOrchestrator();
    
    // Store orchestrator globally for access
    (globalThis as any).pluginOrchestrator = orchestrator;
    
    log.success('Plugin initialized successfully with orchestrator', 'orchestrator', 'initializePlugin');
  } catch (error) {
    logError('Failed to initialize plugin', error as Error);
    throw error;
  }
}
