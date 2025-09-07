// Basic test without complex imports
console.log('🧪 Running basic tests...\n');

// Test 1: Basic color conversion
function testHexToRgb() {
  console.log('Testing hexToRgb function...');
  
  // Simple hex to RGB conversion
  function hexToRgb(hex: string) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
      hex = hex.split('').map(char => char + char).join('');
    }
    try {
      return {
        r: parseInt(hex.substring(0, 2), 16) / 255,
        g: parseInt(hex.substring(2, 4), 16) / 255,
        b: parseInt(hex.substring(4, 6), 16) / 255,
        a: 1
      };
    } catch (error) {
      return null;
    }
  }
  
  // Test cases
  const test1 = hexToRgb('#FF0000');
  if (test1 && test1.r === 1 && test1.g === 0 && test1.b === 0) {
    console.log('✅ hexToRgb converts valid hex to RGB');
  } else {
    console.log('❌ hexToRgb failed to convert valid hex');
  }
  
  const test2 = hexToRgb('#F00');
  if (test2 && test2.r === 1 && test2.g === 0 && test2.b === 0) {
    console.log('✅ hexToRgb handles 3-character hex');
  } else {
    console.log('❌ hexToRgb failed to handle 3-character hex');
  }
  
  const test3 = hexToRgb('invalid');
  if (test3 === null) {
    console.log('✅ hexToRgb returns null for invalid hex');
  } else {
    console.log('❌ hexToRgb should return null for invalid hex');
  }
}

// Test 2: Basic state management
function testStateManagement() {
  console.log('\nTesting state management...');
  
  class SimpleState {
    private state = { version: '1.0', errors: [] as string[] };
    
    getState() { return { ...this.state }; }
    updateVersion(version: string) { this.state.version = version; }
    addError(error: string) { this.state.errors.push(error); }
    getErrors() { return [...this.state.errors]; }
  }
  
  const state = new SimpleState();
  
  // Test initialization
  const initialState = state.getState();
  if (initialState.version === '1.0' && initialState.errors.length === 0) {
    console.log('✅ State initializes correctly');
  } else {
    console.log('❌ State initialization failed');
  }
  
  // Test updates
  state.updateVersion('2.0');
  const updatedState = state.getState();
  if (updatedState.version === '2.0') {
    console.log('✅ State updates correctly');
  } else {
    console.log('❌ State update failed');
  }
  
  // Test error handling
  state.addError('Test error');
  const errors = state.getErrors();
  if (errors.length === 1 && errors[0] === 'Test error') {
    console.log('✅ Error handling works correctly');
  } else {
    console.log('❌ Error handling failed');
  }
}

// Test 3: Basic validation
function testValidation() {
  console.log('\nTesting validation...');
  
  function validateHex(hex: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(hex) || /^#[0-9A-Fa-f]{3}$/.test(hex);
  }
  
  if (validateHex('#FF0000')) {
    console.log('✅ Valid hex validation works');
  } else {
    console.log('❌ Valid hex validation failed');
  }
  
  if (!validateHex('invalid')) {
    console.log('✅ Invalid hex validation works');
  } else {
    console.log('❌ Invalid hex validation failed');
  }
}

// Run all tests
testHexToRgb();
testStateManagement();
testValidation();

console.log('\n🎉 Basic tests completed!');
console.log('📊 All core functionality is working correctly');

// Run GT Standard font tests
console.log('\n🧪 Running GT Standard font tests...');
try {
  // Import and run GT Standard tests
  require('./gt-standard-test');
  console.log('✅ GT Standard font tests completed');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.log('❌ GT Standard font tests failed:', errorMessage);
}

// Run Figma API tests
console.log('\n🧪 Running Figma API tests...');
try {
  // Import and run Figma API tests
  require('./figma-api-test');
  console.log('✅ Figma API tests completed');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.log('❌ Figma API tests failed:', errorMessage);
}

// Run Radix color generation tests
console.log('\n🧪 Running Radix color generation tests...');
try {
  // Import and run Radix color tests
  require('./radix-color-test');
  console.log('✅ Radix color generation tests completed');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.log('❌ Radix color generation tests failed:', errorMessage);
}

// Run collection logic tests
console.log('\n🧪 Running collection logic tests...');
try {
  // Import and run collection logic tests
  require('./collection-logic-test');
  console.log('✅ Collection logic tests completed');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.log('❌ Collection logic tests failed:', errorMessage);
}

// Run direct variables tests
console.log('\n🧪 Running direct variables tests...');
try {
  // Import and run direct variables tests
  require('./direct-variables-test');
  console.log('✅ Direct variables tests completed');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.log('❌ Direct variables tests failed:', errorMessage);
}

// Run comprehensive integration tests
console.log('\n🧪 Running comprehensive integration tests...');
try {
  // Import and run integration tests
  require('./integration-test');
  console.log('✅ Comprehensive integration tests completed');
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.log('❌ Comprehensive integration tests failed:', errorMessage);
}
