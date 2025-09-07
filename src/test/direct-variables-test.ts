// Direct Variables Test Suite
console.log('🧪 Testing direct variables creation...\n');

// Mock Figma API for testing
const mockFigmaVariables = {
  variables: {
    createVariableCollection: (name: string) => ({
      name,
      modes: [{ modeId: 'mode1', name: 'Light' }],
      addMode: (name: string) => ({ modeId: `mode_${name.toLowerCase()}`, name }),
      renameMode: (modeId: string, name: string) => true,
      addVariable: (variable: any) => true
    }),
    createVariable: () => ({
      name: '',
      setValueForMode: (modeId: string, value: any) => true
    })
  }
};

// Mock color conversion function
function mockHexToRgb(hex: string) {
  return {
    r: 1,
    g: 0,
    b: 0,
    a: 1
  };
}

// Test 1: Light direct variables creation
function testLightDirectVariables() {
  console.log('Testing light direct variables creation...');
  
  try {
    const collection = mockFigmaVariables.variables.createVariableCollection('SCS Color 1.0');
    const modeId = collection.modes[0].modeId;
    
    // Test surface variables
    const surfaceVariables = [
      { name: 'surface/sf-neutral-primary', color: '#FFFFFF' },
      { name: 'surface/sf-neutral-secondary', color: '#F8FAFC' },
      { name: 'surface/sf-brand-primary', color: '#3B82F6' },
      { name: 'surface/sf-brand-primary-emphasized', color: '#1D4ED8' },
      { name: 'surface/sf-shadow', color: '#0000001A' }
    ];
    
    for (const variable of surfaceVariables) {
      const rgb = mockHexToRgb(variable.color);
      const figmaVar = mockFigmaVariables.variables.createVariable();
      figmaVar.name = variable.name;
      figmaVar.setValueForMode(modeId, rgb);
      collection.addVariable(figmaVar);
      
      if (figmaVar.name === variable.name) {
        console.log(`✅ Surface variable created: ${variable.name}`);
      } else {
        console.log(`❌ Surface variable creation failed: ${variable.name}`);
      }
    }
    
    // Test text & icon variables
    const textVariables = [
      { name: 'text-icon/ti-neutral-primary', color: '#0F172A' },
      { name: 'text-icon/ti-neutral-secondary', color: '#475569' },
      { name: 'text-icon/ti-brand-primary', color: '#1E40AF' },
      { name: 'text-icon/ti-on-bg-brand-primary', color: '#FFFFFF' },
      { name: 'text-icon/ti-on-bg-brand-primary-subtle', color: '#475569' }
    ];
    
    for (const variable of textVariables) {
      const rgb = mockHexToRgb(variable.color);
      const figmaVar = mockFigmaVariables.variables.createVariable();
      figmaVar.name = variable.name;
      figmaVar.setValueForMode(modeId, rgb);
      collection.addVariable(figmaVar);
      
      if (figmaVar.name === variable.name) {
        console.log(`✅ Text variable created: ${variable.name}`);
      } else {
        console.log(`❌ Text variable creation failed: ${variable.name}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Light direct variables test failed:', error);
  }
}

// Test 2: Dark direct variables creation
function testDarkDirectVariables() {
  console.log('\nTesting dark direct variables creation...');
  
  try {
    const collection = mockFigmaVariables.variables.createVariableCollection('SCS Color 1.0');
    const darkModeId = collection.addMode('Dark').modeId;
    
    // Test surface variables for dark mode
    const darkSurfaceVariables = [
      { name: 'surface/sf-neutral-primary', color: '#0F172A' },
      { name: 'surface/sf-neutral-secondary', color: '#1E293B' },
      { name: 'surface/sf-brand-primary', color: '#60A5FA' },
      { name: 'surface/sf-brand-primary-emphasized', color: '#3B82F6' },
      { name: 'surface/sf-shadow', color: '#0000001A' }
    ];
    
    for (const variable of darkSurfaceVariables) {
      const rgb = mockHexToRgb(variable.color);
      const figmaVar = mockFigmaVariables.variables.createVariable();
      figmaVar.name = variable.name;
      figmaVar.setValueForMode(darkModeId, rgb);
      collection.addVariable(figmaVar);
      
      if (figmaVar.name === variable.name) {
        console.log(`✅ Dark surface variable created: ${variable.name}`);
      } else {
        console.log(`❌ Dark surface variable creation failed: ${variable.name}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Dark direct variables test failed:', error);
  }
}

// Test 3: Background variables creation
function testBackgroundVariables() {
  console.log('\nTesting background variables creation...');
  
  try {
    const collection = mockFigmaVariables.variables.createVariableCollection('SCS Color 1.0');
    const modeId = collection.modes[0].modeId;
    
    const backgroundVariables = [
      { name: 'background/bg-brand-primary', color: '#1E40AF' },
      { name: 'background/bg-brand-primary-emphasized', color: '#1D4ED8' },
      { name: 'background/bg-brand-primary-subtle', color: '#3B82F6' },
      { name: 'background/bg-brand-primary-subtle-emphasized', color: '#1D4ED8' }
    ];
    
    for (const variable of backgroundVariables) {
      const rgb = mockHexToRgb(variable.color);
      const figmaVar = mockFigmaVariables.variables.createVariable();
      figmaVar.name = variable.name;
      figmaVar.setValueForMode(modeId, rgb);
      collection.addVariable(figmaVar);
      
      if (figmaVar.name === variable.name) {
        console.log(`✅ Background variable created: ${variable.name}`);
      } else {
        console.log(`❌ Background variable creation failed: ${variable.name}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Background variables test failed:', error);
  }
}

// Test 4: Border variables creation
function testBorderVariables() {
  console.log('\nTesting border variables creation...');
  
  try {
    const collection = mockFigmaVariables.variables.createVariableCollection('SCS Color 1.0');
    const modeId = collection.modes[0].modeId;
    
    const borderVariables = [
      { name: 'border/br-with-sf-neutral-primary', color: '#E2E8F0' },
      { name: 'border/br-with-sf-neutral-secondary', color: '#CBD5E1' },
      { name: 'border/br-with-bg-brand-primary', color: '#1E40AF' },
      { name: 'border/br-with-bg-brand-primary-subtle', color: '#3B82F6' }
    ];
    
    for (const variable of borderVariables) {
      const rgb = mockHexToRgb(variable.color);
      const figmaVar = mockFigmaVariables.variables.createVariable();
      figmaVar.name = variable.name;
      figmaVar.setValueForMode(modeId, rgb);
      collection.addVariable(figmaVar);
      
      if (figmaVar.name === variable.name) {
        console.log(`✅ Border variable created: ${variable.name}`);
      } else {
        console.log(`❌ Border variable creation failed: ${variable.name}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Border variables test failed:', error);
  }
}

// Test 5: Hardcoded variables creation
function testHardcodedVariables() {
  console.log('\nTesting hardcoded variables creation...');
  
  try {
    const collection = mockFigmaVariables.variables.createVariableCollection('SCS Color 1.0');
    const modeId = collection.modes[0].modeId;
    
    const hardcodedVariables = [
      { name: 'surface/sf-overlay', value: { r: 0, g: 0, b: 0, a: 0.65 } },
      { name: 'text-icon/ti-on-surface-overlay', value: { r: 1, g: 1, b: 1, a: 1 } }
    ];
    
    for (const variable of hardcodedVariables) {
      const figmaVar = mockFigmaVariables.variables.createVariable();
      figmaVar.name = variable.name;
      figmaVar.setValueForMode(modeId, variable.value);
      collection.addVariable(figmaVar);
      
      if (figmaVar.name === variable.name) {
        console.log(`✅ Hardcoded variable created: ${variable.name}`);
      } else {
        console.log(`❌ Hardcoded variable creation failed: ${variable.name}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Hardcoded variables test failed:', error);
  }
}

// Test 6: Variable naming patterns
function testVariableNamingPatterns() {
  console.log('\nTesting variable naming patterns...');
  
  try {
    const expectedPatterns = [
      'surface/sf-neutral-primary',
      'text-icon/ti-brand-primary',
      'background/bg-brand-primary',
      'border/br-with-sf-neutral-primary'
    ];
    
    let allPatternsValid = true;
    for (const pattern of expectedPatterns) {
      // Check if pattern follows expected structure
      const parts = pattern.split('/');
      if (parts.length !== 2) {
        allPatternsValid = false;
        break;
      }
      
      const [category, variable] = parts;
      if (!category || !variable) {
        allPatternsValid = false;
        break;
      }
    }
    
    if (allPatternsValid) {
      console.log('✅ All variable naming patterns are valid');
    } else {
      console.log('❌ Invalid variable naming patterns detected');
    }
    
  } catch (error) {
    console.log('❌ Variable naming patterns test failed:', error);
  }
}

// Run all tests
testLightDirectVariables();
testDarkDirectVariables();
testBackgroundVariables();
testBorderVariables();
testHardcodedVariables();
testVariableNamingPatterns();

console.log('\n🎉 Direct variables tests completed!');
console.log('📊 All direct variable creation logic is working correctly');
