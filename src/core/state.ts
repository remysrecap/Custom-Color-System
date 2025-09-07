// Centralized state management for the Custom Color System plugin
import { PluginState } from './types';

export class PluginStateManager {
  private state: PluginState;

  constructor() {
    this.state = {
      config: {
        versionNumber: '1.0',
        supportsMultipleModes: false,
        isClosing: false
      },
      options: {
        hexColor: '#3B82F6',
        neutral: '#6B7280',
        success: '#10B981',
        error: '#EF4444',
        appearance: 'both',
        includePrimitives: true,
        exportDemo: false,
        exportDocumentation: false,
        fontFamily: 'none'
      },
      runtime: {
        collections: {},
        errors: [],
        warnings: []
      }
    };
  }

  // Getters
  getState(): Readonly<PluginState> {
    return JSON.parse(JSON.stringify(this.state)); // Deep clone for immutability
  }

  getConfig() {
    return { ...this.state.config };
  }

  getOptions() {
    return { ...this.state.options };
  }

  getRuntime() {
    return { ...this.state.runtime };
  }

  // Setters
  updateConfig(updates: Partial<PluginState['config']>): void {
    this.state.config = { ...this.state.config, ...updates };
  }

  updateOptions(updates: Partial<PluginState['options']>): void {
    this.state.options = { ...this.state.options, ...updates };
  }

  updateRuntime(updates: Partial<PluginState['runtime']>): void {
    this.state.runtime = { ...this.state.runtime, ...updates };
  }

  // Collection management
  setCollection(type: keyof PluginState['runtime']['collections'], collection: any): void {
    this.state.runtime.collections[type] = collection;
  }

  getCollection(type: keyof PluginState['runtime']['collections']) {
    return this.state.runtime.collections[type];
  }

  // Error and warning management
  addError(error: string): void {
    this.state.runtime.errors.push(error);
    console.error(`[State] Error added: ${error}`);
  }

  addWarning(warning: string): void {
    this.state.runtime.warnings.push(warning);
    console.warn(`[State] Warning added: ${warning}`);
  }

  clearErrors(): void {
    this.state.runtime.errors = [];
  }

  clearWarnings(): void {
    this.state.runtime.warnings = [];
  }

  clearAllMessages(): void {
    this.clearErrors();
    this.clearWarnings();
  }

  // Utility methods
  hasErrors(): boolean {
    return this.state.runtime.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.state.runtime.warnings.length > 0;
  }

  getErrorCount(): number {
    return this.state.runtime.errors.length;
  }

  getWarningCount(): number {
    return this.state.runtime.warnings.length;
  }

  // State validation
  validateState(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate config
    if (!this.state.config.versionNumber) {
      errors.push('Version number is required');
    }

    // Validate options
    if (!this.state.options.hexColor) {
      errors.push('Hex color is required');
    }

    if (!this.state.options.appearance) {
      errors.push('Appearance mode is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Reset state
  reset(): void {
    this.state = {
      config: {
        versionNumber: '1.0',
        supportsMultipleModes: false,
        isClosing: false
      },
      options: {
        hexColor: '#3B82F6',
        neutral: '#6B7280',
        success: '#10B981',
        error: '#EF4444',
        appearance: 'both',
        includePrimitives: true,
        exportDemo: false,
        exportDocumentation: false,
        fontFamily: 'none'
      },
      runtime: {
        collections: {},
        errors: [],
        warnings: []
      }
    };
  }

  // Debug methods
  logState(): void {
    console.log('[State] Current state:', this.state);
  }

  logErrors(): void {
    if (this.hasErrors()) {
      console.log('[State] Errors:', this.state.runtime.errors);
    }
  }

  logWarnings(): void {
    if (this.hasWarnings()) {
      console.log('[State] Warnings:', this.state.runtime.warnings);
    }
  }
}
