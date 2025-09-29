import { log } from '../core/logger';
import { logError } from '../core/utils';
import { 
  createFrame, 
  createTextNode, 
  createRectangle, 
  createEllipse, 
  appendChild, 
  setNodePosition, 
  setNodeSize, 
  loadFont 
} from './figma-api';

// ===============================================
// Demo Module - Handles demo component generation
// ===============================================

/**
 * Demo Module class for generating demo components
 */
export class DemoModule {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initializes the demo module
   */
  private initialize(): void {
    if (this.isInitialized) {
      log.warn('Demo module already initialized', 'demo-module', 'initialize');
      return;
    }

    try {
      log.info('Initializing demo module', 'demo-module', 'initialize');
      this.isInitialized = true;
      log.success('Demo module initialized successfully', 'demo-module', 'initialize');
    } catch (error) {
      logError('Failed to initialize demo module', error as Error);
      throw error;
    }
  }

  /**
   * Creates demo components for the color system
   */
  public async createDemoComponents(
    primitiveCollection: VariableCollection | null,
    semanticCollection: VariableCollection | null
  ): Promise<void> {
    try {
      log.info('Creating demo components', 'demo-module', 'createDemoComponents');
      
      // Create main demo frame
      const demoFrame = createFrame('Color System Demo', 1200, 800);
      setNodePosition(demoFrame, 200, 200);
      
      // Add title
      await this.addTitle(demoFrame, 'Color System Demo');
      
      // Create color palette demo
      await this.createColorPaletteDemo(demoFrame, primitiveCollection);
      
      // Create UI component demos
      await this.createUIComponentDemos(demoFrame, semanticCollection);
      
      // Create typography demo
      await this.createTypographyDemo(demoFrame);
      
      log.success('Demo components created successfully', 'demo-module', 'createDemoComponents');
    } catch (error) {
      logError('Failed to create demo components', error as Error);
      throw error;
    }
  }

  /**
   * Adds title to demo frame
   */
  private async addTitle(parent: FrameNode, title: string): Promise<void> {
    try {
      await loadFont({ family: 'Inter', style: 'Bold' });
      
      const titleNode = createTextNode(title, 28);
      titleNode.name = 'Demo Title';
      
      appendChild(parent, titleNode);
      setNodePosition(titleNode, 20, 20);
      
      log.success(`Added title: ${title}`, 'demo-module', 'addTitle');
    } catch (error) {
      logError(`Failed to add title: ${title}`, error as Error);
      throw error;
    }
  }

  /**
   * Creates color palette demo
   */
  private async createColorPaletteDemo(parent: FrameNode, primitiveCollection: VariableCollection | null): Promise<void> {
    try {
      log.info('Creating color palette demo', 'demo-module', 'createColorPaletteDemo');
      
      if (!primitiveCollection) {
        log.warn('No primitive collection available for color palette demo', 'demo-module', 'createColorPaletteDemo');
        return;
      }
      
      // Create color palette frame
      const paletteFrame = createFrame('Color Palette', 400, 300);
      setNodePosition(paletteFrame, 20, 60);
      appendChild(parent, paletteFrame);
      
      // Add palette title
      await this.addSectionTitle(paletteFrame, 'Brand Colors', 10, 10);
      
      // Create color swatches
      await this.createColorSwatches(paletteFrame, primitiveCollection);
      
      log.success('Color palette demo created', 'demo-module', 'createColorPaletteDemo');
    } catch (error) {
      logError('Failed to create color palette demo', error as Error);
      throw error;
    }
  }

  /**
   * Creates UI component demos
   */
  private async createUIComponentDemos(parent: FrameNode, semanticCollection: VariableCollection | null): Promise<void> {
    try {
      log.info('Creating UI component demos', 'demo-module', 'createUIComponentDemos');
      
      if (!semanticCollection) {
        log.warn('No semantic collection available for UI component demos', 'demo-module', 'createUIComponentDemos');
        return;
      }
      
      // Create UI components frame
      const componentsFrame = createFrame('UI Components', 500, 400);
      setNodePosition(componentsFrame, 450, 60);
      appendChild(parent, componentsFrame);
      
      // Add components title
      await this.addSectionTitle(componentsFrame, 'UI Components', 10, 10);
      
      // Create button demo
      await this.createButtonDemo(componentsFrame, semanticCollection);
      
      // Create card demo
      await this.createCardDemo(componentsFrame, semanticCollection);
      
      log.success('UI component demos created', 'demo-module', 'createUIComponentDemos');
    } catch (error) {
      logError('Failed to create UI component demos', error as Error);
      throw error;
    }
  }

  /**
   * Creates typography demo
   */
  private async createTypographyDemo(parent: FrameNode): Promise<void> {
    try {
      log.info('Creating typography demo', 'demo-module', 'createTypographyDemo');
      
      // Create typography frame
      const typographyFrame = createFrame('Typography', 300, 200);
      setNodePosition(typographyFrame, 980, 60);
      appendChild(parent, typographyFrame);
      
      // Add typography title
      await this.addSectionTitle(typographyFrame, 'Typography', 10, 10);
      
      // Create typography examples
      await this.createTypographyExamples(typographyFrame);
      
      log.success('Typography demo created', 'demo-module', 'createTypographyDemo');
    } catch (error) {
      logError('Failed to create typography demo', error as Error);
      throw error;
    }
  }

  /**
   * Adds a section title
   */
  private async addSectionTitle(parent: FrameNode, title: string, x: number, y: number): Promise<void> {
    try {
      await loadFont({ family: 'Inter', style: 'SemiBold' });
      
      const titleNode = createTextNode(title, 16);
      titleNode.name = `Section: ${title}`;
      
      appendChild(parent, titleNode);
      setNodePosition(titleNode, x, y);
      
      log.success(`Added section title: ${title}`, 'demo-module', 'addSectionTitle');
    } catch (error) {
      logError(`Failed to add section title: ${title}`, error as Error);
      throw error;
    }
  }

  /**
   * Creates color swatches
   */
  private async createColorSwatches(parent: FrameNode, collection: VariableCollection): Promise<void> {
    try {
      log.info('Creating color swatches', 'demo-module', 'createColorSwatches');
      
      // Get brand scale variables
      const variables = await Promise.all(
        collection.variableIds.map(id => figma.variables.getVariableByIdAsync(id))
      );
      
      const brandVariables = variables
        .filter(v => v !== null && v.name.startsWith('Brand Scale/'))
        .slice(0, 6); // Show first 6 brand colors
      
      let xOffset = 10;
      const yOffset = 40;
      const swatchSize = 40;
      
      for (const variable of brandVariables) {
        if (variable) {
          // Create color swatch
          const swatch = createRectangle(`Swatch: ${variable.name}`, swatchSize, swatchSize);
          appendChild(parent, swatch);
          setNodePosition(swatch, xOffset, yOffset);
          
          // Try to apply the variable color (this might not work in all cases)
          try {
            // This is a simplified approach - in reality, you'd need to get the actual color value
            swatch.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.4, b: 0.8 } }];
          } catch (error) {
            log.warn(`Could not apply color to swatch: ${variable.name}`, 'demo-module', 'createColorSwatches');
          }
          
          xOffset += swatchSize + 10;
        }
      }
      
      log.success('Color swatches created', 'demo-module', 'createColorSwatches');
    } catch (error) {
      logError('Failed to create color swatches', error as Error);
      throw error;
    }
  }

  /**
   * Creates button demo
   */
  private async createButtonDemo(parent: FrameNode, collection: VariableCollection): Promise<void> {
    try {
      log.info('Creating button demo', 'demo-module', 'createButtonDemo');
      
      // Create primary button
      const primaryButton = createRectangle('Primary Button', 120, 40);
      setNodePosition(primaryButton, 10, 40);
      appendChild(parent, primaryButton);
      
      // Add button text
      await loadFont({ family: 'Inter', style: 'Medium' });
      const buttonText = createTextNode('Primary', 14);
      setNodePosition(buttonText, 10, 40);
      appendChild(primaryButton, buttonText);
      
      // Create secondary button
      const secondaryButton = createRectangle('Secondary Button', 120, 40);
      setNodePosition(secondaryButton, 150, 40);
      appendChild(parent, secondaryButton);
      
      // Add button text
      const secondaryText = createTextNode('Secondary', 14);
      setNodePosition(secondaryText, 150, 40);
      appendChild(secondaryButton, secondaryText);
      
      log.success('Button demo created', 'demo-module', 'createButtonDemo');
    } catch (error) {
      logError('Failed to create button demo', error as Error);
      throw error;
    }
  }

  /**
   * Creates card demo
   */
  private async createCardDemo(parent: FrameNode, collection: VariableCollection): Promise<void> {
    try {
      log.info('Creating card demo', 'demo-module', 'createCardDemo');
      
      // Create card frame
      const card = createFrame('Card Demo', 200, 120);
      setNodePosition(card, 10, 100);
      appendChild(parent, card);
      
      // Add card title
      await loadFont({ family: 'Inter', style: 'SemiBold' });
      const cardTitle = createTextNode('Card Title', 16);
      setNodePosition(cardTitle, 10, 10);
      appendChild(card, cardTitle);
      
      // Add card content
      await loadFont({ family: 'Inter', style: 'Regular' });
      const cardContent = createTextNode('This is a card component using semantic variables.', 12);
      setNodePosition(cardContent, 10, 35);
      appendChild(card, cardContent);
      
      log.success('Card demo created', 'demo-module', 'createCardDemo');
    } catch (error) {
      logError('Failed to create card demo', error as Error);
      throw error;
    }
  }

  /**
   * Creates typography examples
   */
  private async createTypographyExamples(parent: FrameNode): Promise<void> {
    try {
      log.info('Creating typography examples', 'demo-module', 'createTypographyExamples');
      
      const typographyExamples = [
        { text: 'Heading 1', size: 24, style: 'Bold' },
        { text: 'Heading 2', size: 20, style: 'SemiBold' },
        { text: 'Body Text', size: 16, style: 'Regular' },
        { text: 'Caption', size: 12, style: 'Regular' }
      ];
      
      let yOffset = 40;
      
      for (const example of typographyExamples) {
        await loadFont({ family: 'Inter', style: example.style as any });
        
        const textNode = createTextNode(example.text, example.size);
        setNodePosition(textNode, 10, yOffset);
        appendChild(parent, textNode);
        
        yOffset += example.size + 10;
      }
      
      log.success('Typography examples created', 'demo-module', 'createTypographyExamples');
    } catch (error) {
      logError('Failed to create typography examples', error as Error);
      throw error;
    }
  }
}

// ===============================================
// Demo Module Factory
// ===============================================

/**
 * Creates and initializes a demo module instance
 */
export function createDemoModule(): DemoModule {
  return new DemoModule();
}

// ===============================================
// Demo Utility Functions
// ===============================================

/**
 * Creates demo components for a color system
 */
export async function exportDemoComponents(
  primitiveCollection: VariableCollection | null,
  semanticCollection: VariableCollection | null
): Promise<void> {
  try {
    const demoModule = createDemoModule();
    await demoModule.createDemoComponents(primitiveCollection, semanticCollection);
  } catch (error) {
    logError('Failed to create demo components', error as Error);
    throw error;
  }
}
