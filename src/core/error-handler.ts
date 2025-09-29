import { log, logError } from './utils';
import { ERROR_MESSAGES } from './constants';

// ===============================================
// Error Handling System
// ===============================================

export interface ErrorContext {
  operation: string;
  module: string;
  details?: any;
}

export class PluginError extends Error {
  public readonly code: string;
  public readonly context: ErrorContext;
  public readonly timestamp: Date;

  constructor(message: string, code: string, context: ErrorContext) {
    super(message);
    this.name = 'PluginError';
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
  }
}

/**
 * Error codes for different types of failures
 */
export const ERROR_CODES = {
  FONT_LOAD_FAILED: 'FONT_LOAD_FAILED',
  VARIABLE_CREATION_FAILED: 'VARIABLE_CREATION_FAILED',
  COLLECTION_CREATION_FAILED: 'COLLECTION_CREATION_FAILED',
  INVALID_COLOR: 'INVALID_COLOR',
  MISSING_REQUIRED_PARAM: 'MISSING_REQUIRED_PARAM',
  FIGMA_API_ERROR: 'FIGMA_API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

/**
 * Error handler class for centralized error management
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCount = 0;
  private maxErrors = 10;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handles an error with context and logging
   */
  public handleError(error: Error, context: ErrorContext): PluginError {
    this.errorCount++;
    
    const pluginError = new PluginError(
      error.message,
      this.getErrorCode(error),
      context
    );

    // Log the error
    logError(`Error in ${context.module}.${context.operation}`, pluginError);
    
    // Check if we've exceeded the error limit
    if (this.errorCount >= this.maxErrors) {
      log('Maximum error limit reached, stopping error handling', 'error');
    }

    return pluginError;
  }

  /**
   * Wraps an async function with error handling
   */
  public async wrapAsync<T>(
    fn: () => Promise<T>,
    context: ErrorContext
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      throw this.handleError(error as Error, context);
    }
  }

  /**
   * Wraps a sync function with error handling
   */
  public wrapSync<T>(
    fn: () => T,
    context: ErrorContext
  ): T {
    try {
      return fn();
    } catch (error) {
      throw this.handleError(error as Error, context);
    }
  }

  /**
   * Determines the error code based on the error type
   */
  private getErrorCode(error: Error): string {
    if (error.message.includes('font')) {
      return ERROR_CODES.FONT_LOAD_FAILED;
    }
    if (error.message.includes('variable')) {
      return ERROR_CODES.VARIABLE_CREATION_FAILED;
    }
    if (error.message.includes('collection')) {
      return ERROR_CODES.COLLECTION_CREATION_FAILED;
    }
    if (error.message.includes('color')) {
      return ERROR_CODES.INVALID_COLOR;
    }
    if (error.message.includes('required')) {
      return ERROR_CODES.MISSING_REQUIRED_PARAM;
    }
    if (error.message.includes('figma')) {
      return ERROR_CODES.FIGMA_API_ERROR;
    }
    return ERROR_CODES.UNKNOWN_ERROR;
  }

  /**
   * Resets the error count
   */
  public resetErrorCount(): void {
    this.errorCount = 0;
  }

  /**
   * Gets the current error count
   */
  public getErrorCount(): number {
    return this.errorCount;
  }
}

/**
 * Global error handler instance
 */
export const errorHandler = ErrorHandler.getInstance();

/**
 * Higher-order function for error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => R,
  context: ErrorContext
) {
  return (...args: T): R => {
    return errorHandler.wrapSync(() => fn(...args), context);
  };
}

/**
 * Higher-order function for async error handling
 */
export function withAsyncErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: ErrorContext
) {
  return async (...args: T): Promise<R> => {
    return await errorHandler.wrapAsync(() => fn(...args), context);
  };
}

/**
 * Validates required parameters
 */
export function validateParams(params: Record<string, any>, required: string[]): void {
  const missing = required.filter(param => 
    params[param] === undefined || params[param] === null
  );
  
  if (missing.length > 0) {
    throw new PluginError(
      `${ERROR_MESSAGES.MISSING_REQUIRED_PARAM}: ${missing.join(', ')}`,
      ERROR_CODES.MISSING_REQUIRED_PARAM,
      { operation: 'validateParams', module: 'error-handler' }
    );
  }
}

/**
 * Validates color values
 */
export function validateColor(color: string): void {
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  if (!hexPattern.test(color)) {
    throw new PluginError(
      `${ERROR_MESSAGES.INVALID_COLOR}: ${color}`,
      ERROR_CODES.INVALID_COLOR,
      { operation: 'validateColor', module: 'error-handler', details: { color } }
    );
  }
}

/**
 * Validates font family
 */
export function validateFontFamily(fontFamily: string): void {
  if (!fontFamily || typeof fontFamily !== 'string') {
    throw new PluginError(
      'Invalid font family',
      ERROR_CODES.VALIDATION_ERROR,
      { operation: 'validateFontFamily', module: 'error-handler', details: { fontFamily } }
    );
  }
}

/**
 * Creates a safe error message for user display
 */
export function createUserFriendlyMessage(error: PluginError): string {
  switch (error.code) {
    case ERROR_CODES.FONT_LOAD_FAILED:
      return 'Failed to load the selected font. Please try a different font or check if the font is available.';
    case ERROR_CODES.VARIABLE_CREATION_FAILED:
      return 'Failed to create color variables. Please try again.';
    case ERROR_CODES.COLLECTION_CREATION_FAILED:
      return 'Failed to create variable collection. Please try again.';
    case ERROR_CODES.INVALID_COLOR:
      return 'Invalid color value. Please enter a valid hex color code.';
    case ERROR_CODES.MISSING_REQUIRED_PARAM:
      return 'Missing required information. Please check your inputs.';
    case ERROR_CODES.FIGMA_API_ERROR:
      return 'Figma API error. Please try again.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
