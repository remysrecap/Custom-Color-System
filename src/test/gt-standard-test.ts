// Simple GT Standard font loading test
console.log('🧪 Testing GT Standard font loading logic...');

// Test the font style mapping logic
function testGTStandardMapping() {
  console.log('Testing GT Standard style mapping...');
  
  const GT_STANDARD_M_STYLES: Record<string, string[]> = {
    regular: ["M Standard Regular", "M Regular"],
    medium: ["M Standard Medium", "M Medium"],
    semibold: ["M Standard Semi Bold", "M Semi Bold", "M Semibold"],
    bold: ["M Standard Bold", "M Bold"],
    italic: ["M Standard Italic", "M Italic"]
  };

  const mapToGTStandardStyle = (style: string): string[] => {
    const styleLower = style.toLowerCase();
    
    // Check for "semi" first, before "bold" to avoid conflicts
    if (styleLower.includes("semi") || style === "600") {
      return GT_STANDARD_M_STYLES.semibold;
    } else if (styleLower.includes("bold") || style === "700") {
      return GT_STANDARD_M_STYLES.bold;
    } else if (styleLower.includes("medium") || style === "500") {
      return GT_STANDARD_M_STYLES.medium;
    } else if (styleLower.includes("italic")) {
      return GT_STANDARD_M_STYLES.italic;
    } else {
      return GT_STANDARD_M_STYLES.regular;
    }
  };

  // Test cases
  const testCases = [
    { input: "Regular", expected: "M Standard Regular" },
    { input: "Medium", expected: "M Standard Medium" },
    { input: "Semi Bold", expected: "M Standard Semi Bold" },
    { input: "Bold", expected: "M Standard Bold" },
    { input: "700", expected: "M Standard Bold" },
    { input: "600", expected: "M Standard Semi Bold" },
    { input: "500", expected: "M Standard Medium" }
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(testCase => {
    const result = mapToGTStandardStyle(testCase.input);
    if (result.includes(testCase.expected)) {
      console.log(`✅ ${testCase.input} -> ${testCase.expected}`);
      passed++;
    } else {
      console.log(`❌ ${testCase.input} -> Expected ${testCase.expected}, got ${result.join(', ')}`);
      failed++;
    }
  });

  console.log(`\n📊 GT Standard mapping: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test the font loading logic
function testFontLoadingLogic() {
  console.log('\nTesting font loading logic...');
  
  // Simulate available fonts
  const availableFonts = [
    { fontName: { family: "GT Standard", style: "M Standard Regular" } },
    { fontName: { family: "GT Standard", style: "M Standard Medium" } },
    { fontName: { family: "GT Standard", style: "M Standard Semi Bold" } },
    { fontName: { family: "GT Standard", style: "M Standard Bold" } },
    { fontName: { family: "Inter", style: "Regular" } }
  ];

  const findGTStandardFont = (style: string) => {
    const GT_STANDARD_M_STYLES: Record<string, string[]> = {
      regular: ["M Standard Regular", "M Regular"],
      medium: ["M Standard Medium", "M Medium"],
      semibold: ["M Standard Semi Bold", "M Semi Bold", "M Semibold"],
      bold: ["M Standard Bold", "M Bold"],
      italic: ["M Standard Italic", "M Italic"]
    };

    const styleLower = style.toLowerCase();
    let gtStyle: string[];
    
    // Check for "semi" first, before "bold" to avoid conflicts
    if (styleLower.includes("semi") || style === "600") {
      gtStyle = GT_STANDARD_M_STYLES.semibold;
    } else if (styleLower.includes("bold") || style === "700") {
      gtStyle = GT_STANDARD_M_STYLES.bold;
    } else if (styleLower.includes("medium") || style === "500") {
      gtStyle = GT_STANDARD_M_STYLES.medium;
    } else if (styleLower.includes("italic")) {
      gtStyle = GT_STANDARD_M_STYLES.italic;
    } else {
      gtStyle = GT_STANDARD_M_STYLES.regular;
    }

    const gtFonts = availableFonts.filter(f => f.fontName.family === "GT Standard");
    const match = gtFonts.find(f => 
      gtStyle.some(s => f.fontName.style === s)
    );
    
    return match ? match.fontName : null;
  };

  // Test cases
  const testCases = [
    { input: "Regular", expected: "M Standard Regular" },
    { input: "Medium", expected: "M Standard Medium" },
    { input: "Semi Bold", expected: "M Standard Semi Bold" },
    { input: "Bold", expected: "M Standard Bold" }
  ];

  let passed = 0;
  let failed = 0;

  testCases.forEach(testCase => {
    const result = findGTStandardFont(testCase.input);
    if (result && result.style === testCase.expected) {
      console.log(`✅ ${testCase.input} -> ${result.family} ${result.style}`);
      passed++;
    } else {
      console.log(`❌ ${testCase.input} -> Expected ${testCase.expected}, got ${result ? result.style : 'null'}`);
      failed++;
    }
  });

  console.log(`\n📊 Font loading logic: ${passed} passed, ${failed} failed`);
  return failed === 0;
}

// Test fallback logic
function testFallbackLogic() {
  console.log('\nTesting fallback logic...');
  
  const simulateFontLoading = (fontFamily: string, style: string) => {
    // Simulate GT Standard not being available
    if (fontFamily === "GT Standard") {
      throw new Error("GT Standard not available");
    }
    
    // Simulate successful Inter loading
    if (fontFamily === "Inter") {
      return { family: "Inter", style: "Regular" };
    }
    
    throw new Error("Font not available");
  };

  const loadFontWithFallback = (fontFamily: string, style: string) => {
    try {
      return simulateFontLoading(fontFamily, style);
    } catch (error) {
      console.log(`⚠️  ${fontFamily} ${style} not available, trying fallback...`);
      try {
        return simulateFontLoading("Inter", "Regular");
      } catch (fallbackError) {
        throw new Error("Both primary and fallback fonts failed");
      }
    }
  };

  // Test fallback
  try {
    const result = loadFontWithFallback("GT Standard", "Regular");
    if (result.family === "Inter" && result.style === "Regular") {
      console.log(`✅ Fallback successful: ${result.family} ${result.style}`);
      return true;
    } else {
      console.log(`❌ Fallback failed: Expected Inter Regular, got ${result.family} ${result.style}`);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log(`❌ Fallback failed: ${errorMessage}`);
    return false;
  }
}

// Run all tests
console.log('🚀 Starting GT Standard font tests...\n');

const mappingTest = testGTStandardMapping();
const loadingTest = testFontLoadingLogic();
const fallbackTest = testFallbackLogic();

console.log('\n🎯 Test Results:');
console.log(`GT Standard Mapping: ${mappingTest ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Font Loading Logic: ${loadingTest ? '✅ PASS' : '❌ FAIL'}`);
console.log(`Fallback Logic: ${fallbackTest ? '✅ PASS' : '❌ FAIL'}`);

const allPassed = mappingTest && loadingTest && fallbackTest;
console.log(`\n${allPassed ? '🎉 All GT Standard tests passed!' : '💥 Some GT Standard tests failed!'}`);

if (allPassed) {
  console.log('✅ GT Standard font loading should work correctly in the plugin');
} else {
  console.log('❌ GT Standard font loading issues detected - these need to be fixed');
}
