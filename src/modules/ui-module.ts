import { log } from '../core/logger';
import { logError } from '../core/utils';
import { PluginMessage } from '../core/types';

// ===============================================
// UI Module - Handles all UI-related functionality
// ===============================================

/**
 * UI Module class for managing plugin interface
 */
export class UIModule {
  private isInitialized = false;
  private messageHandlers: Map<string, (message: PluginMessage) => Promise<void>> = new Map();

  constructor() {
    this.setupMessageHandlers();
  }

  /**
   * Initializes the UI module
   */
  public initialize(): void {
    if (this.isInitialized) {
      log.warn('UI module already initialized', 'ui-module', 'initialize');
      return;
    }

    try {
      log.info('Initializing UI module', 'ui-module', 'initialize');
      this.isInitialized = true;
      log.success('UI module initialized successfully', 'ui-module', 'initialize');
    } catch (error) {
      logError('Failed to initialize UI module', error as Error);
      throw error;
    }
  }

  /**
   * Sets up message handlers for different UI events
   */
  private setupMessageHandlers(): void {
    this.messageHandlers.set('generate-palette', this.handleGeneratePalette.bind(this));
    this.messageHandlers.set('test-gt-standard', this.handleTestGTStandard.bind(this));
    this.messageHandlers.set('discover-gt-standard', this.handleDiscoverGTStandard.bind(this));
    this.messageHandlers.set('update-font-mode', this.handleUpdateFontMode.bind(this));
    this.messageHandlers.set('bind-font-variables', this.handleBindFontVariables.bind(this));
  }

  /**
   * Handles incoming messages from the UI
   */
  public async handleMessage(message: PluginMessage): Promise<void> {
    try {
      log.info(`Handling UI message: ${message.type}`, 'ui-module', 'handleMessage');
      
      const handler = this.messageHandlers.get(message.type);
      if (handler) {
        await handler(message);
      } else {
        log.warn(`Unknown message type: ${message.type}`, 'ui-module', 'handleMessage');
      }
    } catch (error) {
      logError(`Failed to handle UI message: ${message.type}`, error as Error);
      throw error;
    }
  }

  /**
   * Handles palette generation request
   */
  private async handleGeneratePalette(message: PluginMessage): Promise<void> {
    try {
      log.info('Handling generate palette request', 'ui-module', 'handleGeneratePalette');
      
      // Get the orchestrator from global scope
      const orchestrator = (globalThis as any).pluginOrchestrator;
      if (orchestrator) {
        await orchestrator.handleGeneratePalette(message);
      } else {
        throw new Error('Orchestrator not found');
      }
    } catch (error) {
      logError('Failed to handle generate palette', error as Error);
      throw error;
    }
  }

  /**
   * Handles GT Standard font testing
   */
  private async handleTestGTStandard(): Promise<void> {
    try {
      log.info('Handling GT Standard test request', 'ui-module', 'handleTestGTStandard');
      
      // Get the orchestrator from global scope
      const orchestrator = (globalThis as any).pluginOrchestrator;
      if (orchestrator) {
        await orchestrator.handleTestGTStandard();
      } else {
        throw new Error('Orchestrator not found');
      }
    } catch (error) {
      logError('Failed to handle GT Standard test', error as Error);
      throw error;
    }
  }

  /**
   * Handles GT Standard font discovery
   */
  private async handleDiscoverGTStandard(): Promise<void> {
    try {
      log.info('Handling GT Standard discovery request', 'ui-module', 'handleDiscoverGTStandard');
      
      // Get the orchestrator from global scope
      const orchestrator = (globalThis as any).pluginOrchestrator;
      if (orchestrator) {
        await orchestrator.handleDiscoverGTStandard();
      } else {
        throw new Error('Orchestrator not found');
      }
    } catch (error) {
      logError('Failed to handle GT Standard discovery', error as Error);
      throw error;
    }
  }

  /**
   * Handles font mode updates
   */
  private async handleUpdateFontMode(message: PluginMessage): Promise<void> {
    try {
      log.info('Handling font mode update request', 'ui-module', 'handleUpdateFontMode');
      
      // Get the orchestrator from global scope
      const orchestrator = (globalThis as any).pluginOrchestrator;
      if (orchestrator) {
        await orchestrator.handleUpdateFontMode(message);
      } else {
        throw new Error('Orchestrator not found');
      }
    } catch (error) {
      logError('Failed to handle font mode update', error as Error);
      throw error;
    }
  }

  /**
   * Handles font variable binding
   */
  private async handleBindFontVariables(): Promise<void> {
    try {
      log.info('Handling font variable binding request', 'ui-module', 'handleBindFontVariables');
      
      // Get the orchestrator from global scope
      const orchestrator = (globalThis as any).pluginOrchestrator;
      if (orchestrator) {
        await orchestrator.handleBindFontVariables();
      } else {
        throw new Error('Orchestrator not found');
      }
    } catch (error) {
      logError('Failed to handle font variable binding', error as Error);
      throw error;
    }
  }

  /**
   * Sends a message to the UI
   */
  public sendMessage(message: any): void {
    try {
      figma.ui.postMessage(message);
      log.info(`Sent UI message: ${message.type}`, 'ui-module', 'sendMessage');
    } catch (error) {
      logError('Failed to send UI message', error as Error);
    }
  }

  /**
   * Shows a notification to the user
   */
  public showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    try {
      figma.notify(message);
      log.info(`Notification: ${message}`, 'ui-module', 'showNotification');
    } catch (error) {
      logError('Failed to show notification', error as Error);
    }
  }

  /**
   * Resizes the UI
   */
  public resizeUI(width: number, height: number): void {
    try {
      figma.ui.resize(width, height);
      log.info(`Resized UI to ${width}x${height}`, 'ui-module', 'resizeUI');
    } catch (error) {
      logError('Failed to resize UI', error as Error);
    }
  }

  /**
   * Closes the plugin
   */
  public closePlugin(): void {
    try {
      log.info('Closing plugin from UI module', 'ui-module', 'closePlugin');
      figma.closePlugin();
    } catch (error) {
      logError('Failed to close plugin', error as Error);
    }
  }

  /**
   * Gets the current UI state
   */
  public getUIState(): { isInitialized: boolean; handlerCount: number } {
    return {
      isInitialized: this.isInitialized,
      handlerCount: this.messageHandlers.size
    };
  }
}

// ===============================================
// UI Module Factory
// ===============================================

/**
 * Creates and initializes a UI module instance
 */
export function createUIModule(): UIModule {
  const uiModule = new UIModule();
  uiModule.initialize();
  return uiModule;
}

// ===============================================
// UI Utility Functions
// ===============================================

/**
 * Sets up the plugin UI with error handling
 */
export function setupPluginUI(): void {
  try {
    log.info('Setting up plugin UI', 'ui-module', 'setupPluginUI');
    
    figma.showUI(__html__);
    figma.ui.resize(400, 600);
    
    log.success('Plugin UI setup complete', 'ui-module', 'setupPluginUI');
  } catch (error) {
    logError('Failed to setup plugin UI', error as Error);
    throw error;
  }
}

/**
 * Sends a completion message to the UI
 */
export function sendCompletionMessage(): void {
  try {
    figma.ui.postMessage('complete');
    log.info('Sent completion message to UI', 'ui-module', 'sendCompletionMessage');
  } catch (error) {
    logError('Failed to send completion message', error as Error);
  }
}

/**
 * Sends an error message to the UI
 */
export function sendErrorMessage(error: string): void {
  try {
    figma.ui.postMessage({ type: 'error', message: error });
    log.error(`Sent error message to UI: ${error}`, 'ui-module', 'sendErrorMessage');
  } catch (err) {
    logError('Failed to send error message', err as Error);
  }
}
