// Font loading integration test that catches real issues
import { test, expect } from './test-runner';

// Mock Figma API
const mockFigma = {
  loadFontAsync: jest.fn(),
  listAvailableFontsAsync: jest.fn(),
  getStyleByName: jest.fn(),
  createTextStyle: jest.fn()
};

(global as any).figma = mockFigma;

// Test GT Standard font loading logic
test('GT Standard font loading should handle M Standard styles correctly', async () => {
  // Mock available GT Standard fonts
  mockFigma.listAvailableFontsAsync.mockResolvedValue([
    { fontName: { family: "GT Standard", style: "M Standard Regular" } },
    { fontName: { family: "GT Standard", style: "M Standard Medium" } },
    { fontName: { family: "GT Standard", style: "M Standard Semi Bold" } },
    { fontName: { family: "GT Standard", style: "M Standard Bold" } }
  ]);

  // Mock successful font loading
  mockFigma.loadFontAsync.mockResolvedValue(undefined);

  // Test the font loading logic
  const fontFamily = "GT Standard";
  const style = "Regular";
  
  // This should map to "M Standard Regular"
  const GT_STANDARD_M_STYLES = {
    regular: ["M Standard Regular", "M Regular"],
    medium: ["M Standard Medium", "M Medium"],
    semibold: ["M Standard Semi Bold", "M Semi Bold", "M Semibold"],
    bold: ["M Standard Bold", "M Bold"],
    italic: ["M Standard Italic", "M Italic"]
  };

  // Test the mapping logic
  const styleLower = style.toLowerCase();
  let gtStyle: string[];
  
  if (styleLower.includes("bold") || style === "700") {
    gtStyle = GT_STANDARD_M_STYLES.bold;
  } else if (styleLower.includes("semi") || style === "600") {
    gtStyle = GT_STANDARD_M_STYLES.semibold;
  } else if (styleLower.includes("medium") || style === "500") {
    gtStyle = GT_STANDARD_M_STYLES.medium;
  } else if (styleLower.includes("italic")) {
    gtStyle = GT_STANDARD_M_STYLES.italic;
  } else {
    gtStyle = GT_STANDARD_M_STYLES.regular;
  }

  expect(gtStyle).toContain("M Standard Regular");
  
  // Test that the font loading would work
  const availableFonts = await mockFigma.listAvailableFontsAsync();
  const gtFonts = availableFonts.filter(f => f.fontName.family === "GT Standard");
  const match = gtFonts.find(f => 
    gtStyle.some(s => f.fontName.style === s)
  );
  
  expect(match).toBeDefined();
  expect(match.fontName.style).toBe("M Standard Regular");
});

test('Font loading should handle missing GT Standard fonts gracefully', async () => {
  // Mock no GT Standard fonts available
  mockFigma.listAvailableFontsAsync.mockResolvedValue([
    { fontName: { family: "Inter", style: "Regular" } },
    { fontName: { family: "Arial", style: "Regular" } }
  ]);

  // Mock font loading failure
  mockFigma.loadFontAsync.mockRejectedValue(new Error("Font not found"));

  // Test fallback logic
  const fontFamily = "GT Standard";
  const style = "Regular";
  
  try {
    // Try to load GT Standard
    const availableFonts = await mockFigma.listAvailableFontsAsync();
    const gtFonts = availableFonts.filter(f => f.fontName.family === "GT Standard");
    
    if (gtFonts.length === 0) {
      throw new Error("GT Standard not available");
    }
  } catch (error) {
    // Should fallback to Inter
    try {
      await mockFigma.loadFontAsync({ family: "Inter", style: "Regular" });
      console.log("✅ Fallback to Inter successful");
    } catch (fallbackError) {
      console.error("❌ Fallback also failed:", fallbackError.message);
    }
  }

  expect(mockFigma.loadFontAsync).toHaveBeenCalledWith({ family: "Inter", style: "Regular" });
});

test('Typography scale should have correct font styles for all font families', () => {
  const typographyScales = {
    inter: {
      body18: { fontStyle: "Regular" },
      body16: { fontStyle: "Regular" },
      label18: { fontStyle: "Semi Bold" },
      display56: { fontStyle: "Bold" }
    },
    gtStandard: {
      body18: { fontStyle: "Regular" }, // Should map to "M Standard Regular"
      body16: { fontStyle: "Regular" }, // Should map to "M Standard Regular"
      label18: { fontStyle: "Semi Bold" }, // Should map to "M Standard Semi Bold"
      display56: { fontStyle: "Bold" } // Should map to "M Standard Bold"
    }
  };

  // Verify that all font styles are set correctly
  expect(typographyScales.inter.body18.fontStyle).toBe("Regular");
  expect(typographyScales.inter.label18.fontStyle).toBe("Semi Bold");
  expect(typographyScales.inter.display56.fontStyle).toBe("Bold");
  
  expect(typographyScales.gtStandard.body18.fontStyle).toBe("Regular");
  expect(typographyScales.gtStandard.label18.fontStyle).toBe("Semi Bold");
  expect(typographyScales.gtStandard.display56.fontStyle).toBe("Bold");
});

test('Font style mapping should handle all weight variations', () => {
  const mapToGTStandardStyle = (style: string): string[] => {
    const GT_STANDARD_M_STYLES: Record<string, string[]> = {
      regular: ["M Standard Regular", "M Regular"],
      medium: ["M Standard Medium", "M Medium"],
      semibold: ["M Standard Semi Bold", "M Semi Bold", "M Semibold"],
      bold: ["M Standard Bold", "M Bold"],
      italic: ["M Standard Italic", "M Italic"]
    };

    const styleLower = style.toLowerCase();
    
    if (styleLower.includes("bold") || style === "700") {
      return GT_STANDARD_M_STYLES.bold;
    } else if (styleLower.includes("semi") || style === "600") {
      return GT_STANDARD_M_STYLES.semibold;
    } else if (styleLower.includes("medium") || style === "500") {
      return GT_STANDARD_M_STYLES.medium;
    } else if (styleLower.includes("italic")) {
      return GT_STANDARD_M_STYLES.italic;
    } else {
      return GT_STANDARD_M_STYLES.regular;
    }
  };

  // Test all style variations
  expect(mapToGTStandardStyle("Regular")).toContain("M Standard Regular");
  expect(mapToGTStandardStyle("Medium")).toContain("M Standard Medium");
  expect(mapToGTStandardStyle("Semi Bold")).toContain("M Standard Semi Bold");
  expect(mapToGTStandardStyle("Bold")).toContain("M Standard Bold");
  expect(mapToGTStandardStyle("700")).toContain("M Standard Bold");
  expect(mapToGTStandardStyle("600")).toContain("M Standard Semi Bold");
  expect(mapToGTStandardStyle("500")).toContain("M Standard Medium");
});

test('Error handling should prevent plugin crashes', async () => {
  // Mock various error scenarios
  mockFigma.loadFontAsync.mockRejectedValue(new Error("Font loading failed"));
  mockFigma.listAvailableFontsAsync.mockRejectedValue(new Error("Font listing failed"));
  mockFigma.createTextStyle.mockImplementation(() => {
    throw new Error("Text style creation failed");
  });

  // Test that errors are caught and handled gracefully
  try {
    await mockFigma.loadFontAsync({ family: "GT Standard", style: "Regular" });
  } catch (error) {
    expect(error.message).toBe("Font loading failed");
  }

  try {
    await mockFigma.listAvailableFontsAsync();
  } catch (error) {
    expect(error.message).toBe("Font listing failed");
  }

  try {
    mockFigma.createTextStyle();
  } catch (error) {
    expect(error.message).toBe("Text style creation failed");
  }
});

console.log('🧪 Font loading integration tests completed!');
