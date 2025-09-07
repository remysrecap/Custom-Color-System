// Integration tests
import { test, expect } from './test-runner';
import { PluginStateManager } from '../core/state';

test('State management works end-to-end', () => {
  const state = new PluginStateManager();
  
  // Update options
  state.updateOptions({ hexColor: '#FF0000' });
  
  // Add some errors
  state.addError('Test error 1');
  state.addError('Test error 2');
  
  // Verify state
  const currentState = state.getState();
  expect(currentState.options.hexColor).toBe('#FF0000');
  expect(currentState.runtime.errors.length).toBe(2);
  
  // Clear errors
  state.clearErrors();
  expect(currentState.runtime.errors.length).toBe(0);
});

test('Color system integration with state', () => {
  const state = new PluginStateManager();
  
  // Set up color options
  state.updateOptions({
    hexColor: '#3B82F6',
    neutral: '#6B7280',
    success: '#10B981',
    error: '#EF4444',
    appearance: 'light'
  });
  
  // Verify all options are set correctly
  const options = state.getOptions();
  expect(options.hexColor).toBe('#3B82F6');
  expect(options.neutral).toBe('#6B7280');
  expect(options.success).toBe('#10B981');
  expect(options.error).toBe('#EF4444');
  expect(options.appearance).toBe('light');
});

test('Error handling integration', () => {
  const state = new PluginStateManager();
  
  // Add errors and warnings
  state.addError('Critical error');
  state.addWarning('Minor warning');
  
  // Verify error handling
  expect(state.hasErrors()).toBe(true);
  expect(state.hasWarnings()).toBe(true);
  expect(state.getErrorCount()).toBe(1);
  expect(state.getWarningCount()).toBe(1);
  
  // Clear all messages
  state.clearAllMessages();
  expect(state.hasErrors()).toBe(false);
  expect(state.hasWarnings()).toBe(false);
});
