// Tests for state management
import { PluginStateManager } from '../state';
import { test, expect } from '../../test/test-runner';

test('PluginStateManager initializes with default state', () => {
  const state = new PluginStateManager();
  const currentState = state.getState();
  
  expect(currentState.config.versionNumber).toBe('1.0');
  expect(currentState.runtime.errors).toEqual([]);
  expect(currentState.options.hexColor).toBe('#3B82F6');
});

test('PluginStateManager updates config correctly', () => {
  const state = new PluginStateManager();
  state.updateConfig({ versionNumber: '2.0' });
  
  const currentState = state.getState();
  expect(currentState.config.versionNumber).toBe('2.0');
  expect(currentState.config.supportsMultipleModes).toBe(false); // Should remain unchanged
});

test('PluginStateManager updates options correctly', () => {
  const state = new PluginStateManager();
  state.updateOptions({ hexColor: '#FF0000', appearance: 'light' });
  
  const currentState = state.getState();
  expect(currentState.options.hexColor).toBe('#FF0000');
  expect(currentState.options.appearance).toBe('light');
  expect(currentState.options.neutral).toBe('#6B7280'); // Should remain unchanged
});

test('PluginStateManager adds errors correctly', () => {
  const state = new PluginStateManager();
  state.addError('Test error 1');
  state.addError('Test error 2');
  
  const currentState = state.getState();
  expect(currentState.runtime.errors).toEqual(['Test error 1', 'Test error 2']);
  expect(state.hasErrors()).toBe(true);
  expect(state.getErrorCount()).toBe(2);
});

test('PluginStateManager adds warnings correctly', () => {
  const state = new PluginStateManager();
  state.addWarning('Test warning 1');
  state.addWarning('Test warning 2');
  
  const currentState = state.getState();
  expect(currentState.runtime.warnings).toEqual(['Test warning 1', 'Test warning 2']);
  expect(state.hasWarnings()).toBe(true);
  expect(state.getWarningCount()).toBe(2);
});

test('PluginStateManager clears errors and warnings', () => {
  const state = new PluginStateManager();
  state.addError('Test error');
  state.addWarning('Test warning');
  
  expect(state.hasErrors()).toBe(true);
  expect(state.hasWarnings()).toBe(true);
  
  state.clearErrors();
  expect(state.hasErrors()).toBe(false);
  expect(state.hasWarnings()).toBe(true);
  
  state.clearWarnings();
  expect(state.hasWarnings()).toBe(false);
  
  state.clearAllMessages();
  expect(state.hasErrors()).toBe(false);
  expect(state.hasWarnings()).toBe(false);
});

test('PluginStateManager manages collections correctly', () => {
  const state = new PluginStateManager();
  const mockCollection = { id: 'test-collection', name: 'Test Collection' };
  
  state.setCollection('primitive', mockCollection);
  const retrieved = state.getCollection('primitive');
  
  expect(retrieved).toEqual(mockCollection);
});

test('PluginStateManager validates state correctly', () => {
  const state = new PluginStateManager();
  
  // Valid state
  const validation = state.validateState();
  expect(validation.isValid).toBe(true);
  expect(validation.errors).toEqual([]);
  
  // Invalid state
  state.updateConfig({ versionNumber: '' });
  state.updateOptions({ hexColor: '' });
  
  const invalidValidation = state.validateState();
  expect(invalidValidation.isValid).toBe(false);
  expect(invalidValidation.errors.length).toBeGreaterThan(0);
});

test('PluginStateManager resets state correctly', () => {
  const state = new PluginStateManager();
  
  // Modify state
  state.updateConfig({ versionNumber: '2.0' });
  state.updateOptions({ hexColor: '#FF0000' });
  state.addError('Test error');
  state.addWarning('Test warning');
  
  // Reset
  state.reset();
  
  const currentState = state.getState();
  expect(currentState.config.versionNumber).toBe('1.0');
  expect(currentState.options.hexColor).toBe('#3B82F6');
  expect(currentState.runtime.errors).toEqual([]);
  expect(currentState.runtime.warnings).toEqual([]);
});

test('PluginStateManager returns immutable state', () => {
  const state = new PluginStateManager();
  const currentState = state.getState();
  
  // Try to modify the returned state
  currentState.config.versionNumber = '2.0';
  
  // Original state should be unchanged
  const newState = state.getState();
  expect(newState.config.versionNumber).toBe('1.0');
});
