// Debug test to see what generateRadixColors actually returns
console.log('🧪 Testing actual generateRadixColors output...\n');

async function testRadixOutput() {
  try {
    // Import the actual function
    const { generateRadixColors } = await import('radix-theme-generator');
    
    // Generate a test theme
    const testTheme = generateRadixColors({
      appearance: "light",
      accent: "#FF0000",
      gray: "#CCCCCC",
      background: "#FFFFFF"
    });
    
    console.log('🔍 Actual generateRadixColors output:');
    console.log('Type:', typeof testTheme);
    console.log('Keys:', Object.keys(testTheme));
    console.log('Full object:', JSON.stringify(testTheme, null, 2));
    
    // Check if it has the expected properties
    if (testTheme.accentScale) {
      console.log('✅ Has accentScale property');
      console.log('accentScale length:', testTheme.accentScale.length);
      console.log('accentScale[0]:', testTheme.accentScale[0]);
    } else {
      console.log('❌ Missing accentScale property');
    }
    
    if (testTheme.accentScaleAlpha) {
      console.log('✅ Has accentScaleAlpha property');
      console.log('accentScaleAlpha length:', testTheme.accentScaleAlpha.length);
    } else {
      console.log('❌ Missing accentScaleAlpha property');
    }
    
    if (testTheme.accentContrast) {
      console.log('✅ Has accentContrast property');
      console.log('accentContrast:', testTheme.accentContrast);
    } else {
      console.log('❌ Missing accentContrast property');
    }
    
    if (testTheme.background) {
      console.log('✅ Has background property');
      console.log('background:', testTheme.background);
    } else {
      console.log('❌ Missing background property');
    }
    
  } catch (error) {
    console.log('❌ Error testing generateRadixColors:', error);
  }
}

// Run the test
testRadixOutput();
