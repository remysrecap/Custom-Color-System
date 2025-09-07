// Constants and configuration for the Custom Color System plugin
import { TypographyScale, FontMode } from './types';

// Font mode definitions
export const FONT_MODES: Record<string, FontMode> = {
  inter: {
    family: "Inter",
    displayName: "Inter",
    fallback: "Inter"
  },
  gtStandard: {
    family: "GT Standard",
    displayName: "GT Standard (M Standard)",
    fallback: "Inter"
  },
  sfPro: {
    family: "SF Pro",
    displayName: "SF Pro",
    fallback: "Inter"
  },
  sfRounded: {
    family: "SF Pro Rounded",
    displayName: "SF Pro Rounded",
    fallback: "Inter"
  },
  apercuPro: {
    family: "Apercu Pro Var",
    displayName: "Apercu Pro Var",
    fallback: "Inter"
  }
} as const;

// Spacing token definitions
export const SPACING_TOKENS = {
  // General spacing: 2-96 with increments of 2→4→8
  general: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 44, 48, 56, 64, 72, 80, 88, 96],
  
  // Kerning values for typography
  kerning: [-0.5, -0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3, 0.5]
} as const;

// Default typography scale (Inter)
export const TYPOGRAPHY_SCALE: TypographyScale = {
  // Display fonts - Large titles with heavy weight
  display56: {
    fontSize: 56, // General/56
    lineHeight: 64, // General/64
    letterSpacing: -0.5, // Kerning/-0.5
    fontWeight: 700, // Weight/700
    fontStyle: "Bold"
  },
  display52: {
    fontSize: 52, // General/52
    lineHeight: 60, // General/60
    letterSpacing: -0.5, // Kerning/-0.5
    fontWeight: 700, // Weight/700
    fontStyle: "Bold"
  },
  
  // Headline fonts - Section titles with medium-heavy weight
  headline34: {
    fontSize: 34, // General/34
    lineHeight: 40, // General/40
    letterSpacing: -0.3, // Kerning/-0.3
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  headline26: {
    fontSize: 26, // General/26
    lineHeight: 32, // General/32
    letterSpacing: -0.2, // Kerning/-0.2
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  headline22: {
    fontSize: 22, // General/22
    lineHeight: 28, // General/28
    letterSpacing: -0.1, // Kerning/-0.1
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  
  // Body fonts - Regular text with normal weight
  body18: {
    fontSize: 18, // General/18
    lineHeight: 24, // General/24
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body16: {
    fontSize: 16, // General/16
    lineHeight: 20, // General/20
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body14: {
    fontSize: 14, // General/14
    lineHeight: 18, // General/18
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body12: {
    fontSize: 12, // General/12
    lineHeight: 16, // General/16
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  
  // Label fonts - Same sizes as body but heavier weight for buttons/interactions
  label18: {
    fontSize: 18, // General/18
    lineHeight: 24, // General/24
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  label16: {
    fontSize: 16, // General/16
    lineHeight: 20, // General/20
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  label14: {
    fontSize: 14, // General/14
    lineHeight: 18, // General/18
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  
  // Overline fonts - Editorial emphasis (loosened a bit, all caps)
  overline14: {
    fontSize: 14, // General/14
    lineHeight: 16, // General/16 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500 - Medium for emphasis
    fontStyle: "Medium"
  },
  overline12: {
    fontSize: 12, // General/12
    lineHeight: 14, // General/14 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500
    fontStyle: "Medium"
  },
  overline10: {
    fontSize: 10, // General/10
    lineHeight: 12, // General/12 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500
    fontStyle: "Medium"
  }
};

// GT Standard typography scale
export const GT_STANDARD_TYPOGRAPHY_SCALE: TypographyScale = {
  // Display fonts - Large titles with heavy weight
  display56: {
    fontSize: 56, // General/56
    lineHeight: 64, // General/64
    letterSpacing: -0.5, // Kerning/-0.5
    fontWeight: 700, // Weight/700
    fontStyle: "Bold"
  },
  display52: {
    fontSize: 52, // General/52
    lineHeight: 60, // General/60
    letterSpacing: -0.5, // Kerning/-0.5
    fontWeight: 700, // Weight/700
    fontStyle: "Bold"
  },
  
  // Headline fonts - Section titles with medium-heavy weight
  headline34: {
    fontSize: 34, // General/34
    lineHeight: 40, // General/40
    letterSpacing: -0.3, // Kerning/-0.3
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  headline26: {
    fontSize: 26, // General/26
    lineHeight: 32, // General/32
    letterSpacing: -0.2, // Kerning/-0.2
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  headline22: {
    fontSize: 22, // General/22
    lineHeight: 28, // General/28
    letterSpacing: -0.1, // Kerning/-0.1
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  
  // Body fonts - Regular text with normal weight
  body18: {
    fontSize: 18, // General/18
    lineHeight: 24, // General/24
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body16: {
    fontSize: 16, // General/16
    lineHeight: 20, // General/20
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body14: {
    fontSize: 14, // General/14
    lineHeight: 18, // General/18
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body12: {
    fontSize: 12, // General/12
    lineHeight: 16, // General/16
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  
  // Label fonts - Same sizes as body but heavier weight for buttons/interactions
  label18: {
    fontSize: 18, // General/18
    lineHeight: 24, // General/24
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  label16: {
    fontSize: 16, // General/16
    lineHeight: 20, // General/20
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  label14: {
    fontSize: 14, // General/14
    lineHeight: 18, // General/18
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  
  // Overline fonts - Editorial emphasis (loosened a bit, all caps)
  overline14: {
    fontSize: 14, // General/14
    lineHeight: 16, // General/16 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500 - Medium for emphasis
    fontStyle: "Medium"
  },
  overline12: {
    fontSize: 12, // General/12
    lineHeight: 14, // General/14 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500
    fontStyle: "Medium"
  },
  overline10: {
    fontSize: 10, // General/10
    lineHeight: 12, // General/12 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500
    fontStyle: "Medium"
  }
};

// SF Pro typography scale
export const SF_PRO_TYPOGRAPHY_SCALE: TypographyScale = {
  // Display fonts - Large titles with heavy weight
  display56: {
    fontSize: 56, // General/56
    lineHeight: 64, // General/64
    letterSpacing: -0.5, // Kerning/-0.5
    fontWeight: 700, // Weight/700
    fontStyle: "Bold"
  },
  display52: {
    fontSize: 52, // General/52
    lineHeight: 60, // General/60
    letterSpacing: -0.5, // Kerning/-0.5
    fontWeight: 700, // Weight/700
    fontStyle: "Bold"
  },
  
  // Headline fonts - Section titles with medium-heavy weight
  headline34: {
    fontSize: 34, // General/34
    lineHeight: 40, // General/40
    letterSpacing: -0.3, // Kerning/-0.3
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  headline26: {
    fontSize: 26, // General/26
    lineHeight: 32, // General/32
    letterSpacing: -0.2, // Kerning/-0.2
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  headline22: {
    fontSize: 22, // General/22
    lineHeight: 28, // General/28
    letterSpacing: -0.1, // Kerning/-0.1
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  
  // Body fonts - Regular text with normal weight
  body18: {
    fontSize: 18, // General/18
    lineHeight: 24, // General/24
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body16: {
    fontSize: 16, // General/16
    lineHeight: 20, // General/20
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body14: {
    fontSize: 14, // General/14
    lineHeight: 18, // General/18
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body12: {
    fontSize: 12, // General/12
    lineHeight: 16, // General/16
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  
  // Label fonts - Same sizes as body but heavier weight for buttons/interactions
  label18: {
    fontSize: 18, // General/18
    lineHeight: 24, // General/24
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  label16: {
    fontSize: 16, // General/16
    lineHeight: 20, // General/20
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  label14: {
    fontSize: 14, // General/14
    lineHeight: 18, // General/18
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  
  // Overline fonts - Editorial emphasis (loosened a bit, all caps)
  overline14: {
    fontSize: 14, // General/14
    lineHeight: 16, // General/16 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500 - Medium for emphasis
    fontStyle: "Medium"
  },
  overline12: {
    fontSize: 12, // General/12
    lineHeight: 14, // General/14 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500
    fontStyle: "Medium"
  },
  overline10: {
    fontSize: 10, // General/10
    lineHeight: 12, // General/12 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500
    fontStyle: "Medium"
  }
};

// SF Pro Rounded typography scale
export const SF_ROUNDED_TYPOGRAPHY_SCALE: TypographyScale = {
  // Display fonts - Large titles with heavy weight
  display56: {
    fontSize: 56, // General/56
    lineHeight: 64, // General/64
    letterSpacing: -0.5, // Kerning/-0.5
    fontWeight: 700, // Weight/700
    fontStyle: "Bold"
  },
  display52: {
    fontSize: 52, // General/52
    lineHeight: 60, // General/60
    letterSpacing: -0.5, // Kerning/-0.5
    fontWeight: 700, // Weight/700
    fontStyle: "Bold"
  },
  
  // Headline fonts - Section titles with medium-heavy weight
  headline34: {
    fontSize: 34, // General/34
    lineHeight: 40, // General/40
    letterSpacing: -0.3, // Kerning/-0.3
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  headline26: {
    fontSize: 26, // General/26
    lineHeight: 32, // General/32
    letterSpacing: -0.2, // Kerning/-0.2
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  headline22: {
    fontSize: 22, // General/22
    lineHeight: 28, // General/28
    letterSpacing: -0.1, // Kerning/-0.1
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  
  // Body fonts - Regular text with normal weight
  body18: {
    fontSize: 18, // General/18
    lineHeight: 24, // General/24
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body16: {
    fontSize: 16, // General/16
    lineHeight: 20, // General/20
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body14: {
    fontSize: 14, // General/14
    lineHeight: 18, // General/18
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body12: {
    fontSize: 12, // General/12
    lineHeight: 16, // General/16
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  
  // Label fonts - Same sizes as body but heavier weight for buttons/interactions
  label18: {
    fontSize: 18, // General/18
    lineHeight: 24, // General/24
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  label16: {
    fontSize: 16, // General/16
    lineHeight: 20, // General/20
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  label14: {
    fontSize: 14, // General/14
    lineHeight: 18, // General/18
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  
  // Overline fonts - Editorial emphasis (loosened a bit, all caps)
  overline14: {
    fontSize: 14, // General/14
    lineHeight: 16, // General/16 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500 - Medium for emphasis
    fontStyle: "Medium"
  },
  overline12: {
    fontSize: 12, // General/12
    lineHeight: 14, // General/14 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500
    fontStyle: "Medium"
  },
  overline10: {
    fontSize: 10, // General/10
    lineHeight: 12, // General/12 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500
    fontStyle: "Medium"
  }
};

// Apercu Pro typography scale
export const APERCU_PRO_TYPOGRAPHY_SCALE: TypographyScale = {
  // Display fonts - Large titles with heavy weight
  display56: {
    fontSize: 56, // General/56
    lineHeight: 64, // General/64
    letterSpacing: -0.5, // Kerning/-0.5
    fontWeight: 700, // Weight/700
    fontStyle: "Bold"
  },
  display52: {
    fontSize: 52, // General/52
    lineHeight: 60, // General/60
    letterSpacing: -0.5, // Kerning/-0.5
    fontWeight: 700, // Weight/700
    fontStyle: "Bold"
  },
  
  // Headline fonts - Section titles with medium-heavy weight
  headline34: {
    fontSize: 34, // General/34
    lineHeight: 40, // General/40
    letterSpacing: -0.3, // Kerning/-0.3
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  headline26: {
    fontSize: 26, // General/26
    lineHeight: 32, // General/32
    letterSpacing: -0.2, // Kerning/-0.2
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  headline22: {
    fontSize: 22, // General/22
    lineHeight: 28, // General/28
    letterSpacing: -0.1, // Kerning/-0.1
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  
  // Body fonts - Regular text with normal weight
  body18: {
    fontSize: 18, // General/18
    lineHeight: 24, // General/24
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body16: {
    fontSize: 16, // General/16
    lineHeight: 20, // General/20
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body14: {
    fontSize: 14, // General/14
    lineHeight: 18, // General/18
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  body12: {
    fontSize: 12, // General/12
    lineHeight: 16, // General/16
    letterSpacing: 0, // Kerning/0
    fontWeight: 400, // Weight/400
    fontStyle: "Regular"
  },
  
  // Label fonts - Same sizes as body but heavier weight for buttons/interactions
  label18: {
    fontSize: 18, // General/18
    lineHeight: 24, // General/24
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  label16: {
    fontSize: 16, // General/16
    lineHeight: 20, // General/20
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  label14: {
    fontSize: 14, // General/14
    lineHeight: 18, // General/18
    letterSpacing: 0, // Kerning/0
    fontWeight: 600, // Weight/600
    fontStyle: "Semi Bold"
  },
  
  // Overline fonts - Editorial emphasis (loosened a bit, all caps)
  overline14: {
    fontSize: 14, // General/14
    lineHeight: 16, // General/16 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500 - Medium for emphasis
    fontStyle: "Medium"
  },
  overline12: {
    fontSize: 12, // General/12
    lineHeight: 14, // General/14 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500
    fontStyle: "Medium"
  },
  overline10: {
    fontSize: 10, // General/10
    lineHeight: 12, // General/12 - Tighter for editorial feel
    letterSpacing: 0, // Kerning/0 - Loosened a bit for Apercu
    fontWeight: 500, // Weight/500
    fontStyle: "Medium"
  }
};
