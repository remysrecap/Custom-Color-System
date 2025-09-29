import { log } from '../core/logger';
import { logError } from '../core/utils';
import { createFrame, createTextNode, appendChild, setNodePosition, loadFont } from './figma-api';

// ===============================================
// Documentation Module - Handles documentation generation
// ===============================================

/**
 * Documentation Module class for generating plugin documentation
 */
export class DocumentationModule {
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initializes the documentation module
   */
  private initialize(): void {
    if (this.isInitialized) {
      log.warn('Documentation module already initialized', 'documentation-module', 'initialize');
      return;
    }

    try {
      log.info('Initializing documentation module', 'documentation-module', 'initialize');
      this.isInitialized = true;
      log.success('Documentation module initialized successfully', 'documentation-module', 'initialize');
    } catch (error) {
      logError('Failed to initialize documentation module', error as Error);
      throw error;
    }
  }

  /**
   * Creates comprehensive documentation for the color system
   */
  public async createDocumentation(
    primitiveCollection: VariableCollection | null,
    semanticCollection: VariableCollection | null
  ): Promise<void> {
    try {
      log.info('Creating documentation', 'documentation-module', 'createDocumentation');
      
      // Create main documentation frame
      const docFrame = createFrame('Color System Documentation', 800, 1000);
      setNodePosition(docFrame, 100, 100);
      
      // Add title
      await this.addTitle(docFrame, 'Color System Documentation');
      
      // Add primitive collection documentation if available
      if (primitiveCollection) {
        await this.addPrimitiveDocumentation(docFrame, primitiveCollection);
      }
      
      // Add semantic collection documentation if available
      if (semanticCollection) {
        await this.addSemanticDocumentation(docFrame, semanticCollection);
      }
      
      // Add usage instructions
      await this.addUsageInstructions(docFrame);
      
      log.success('Documentation created successfully', 'documentation-module', 'createDocumentation');
    } catch (error) {
      logError('Failed to create documentation', error as Error);
      throw error;
    }
  }

  /**
   * Adds title to documentation frame
   */
  private async addTitle(parent: FrameNode, title: string): Promise<void> {
    try {
      await loadFont({ family: 'Inter', style: 'Bold' });
      
      const titleNode = createTextNode(title, 24);
      titleNode.name = 'Documentation Title';
      
      appendChild(parent, titleNode);
      setNodePosition(titleNode, 20, 20);
      
      log.success(`Added title: ${title}`, 'documentation-module', 'addTitle');
    } catch (error) {
      logError(`Failed to add title: ${title}`, error as Error);
      throw error;
    }
  }

  /**
   * Adds primitive collection documentation
   */
  private async addPrimitiveDocumentation(parent: FrameNode, collection: VariableCollection): Promise<void> {
    try {
      log.info('Adding primitive collection documentation', 'documentation-module', 'addPrimitiveDocumentation');
      
      // Add section title
      await this.addSectionTitle(parent, 'Primitive Variables', 20, 60);
      
      // Add collection info
      await this.addCollectionInfo(parent, collection, 20, 90);
      
      // Add variable list
      await this.addVariableList(parent, collection, 20, 120);
      
      log.success('Primitive documentation added', 'documentation-module', 'addPrimitiveDocumentation');
    } catch (error) {
      logError('Failed to add primitive documentation', error as Error);
      throw error;
    }
  }

  /**
   * Adds semantic collection documentation
   */
  private async addSemanticDocumentation(parent: FrameNode, collection: VariableCollection): Promise<void> {
    try {
      log.info('Adding semantic collection documentation', 'documentation-module', 'addSemanticDocumentation');
      
      // Add section title
      await this.addSectionTitle(parent, 'Semantic Variables', 20, 300);
      
      // Add collection info
      await this.addCollectionInfo(parent, collection, 20, 330);
      
      // Add variable list
      await this.addVariableList(parent, collection, 20, 360);
      
      log.success('Semantic documentation added', 'documentation-module', 'addSemanticDocumentation');
    } catch (error) {
      logError('Failed to add semantic documentation', error as Error);
      throw error;
    }
  }

  /**
   * Adds usage instructions
   */
  private async addUsageInstructions(parent: FrameNode): Promise<void> {
    try {
      log.info('Adding usage instructions', 'documentation-module', 'addUsageInstructions');
      
      // Add section title
      await this.addSectionTitle(parent, 'Usage Instructions', 20, 600);
      
      // Add instructions text
      const instructions = [
        '1. Use primitive variables for direct color values',
        '2. Use semantic variables for UI component colors',
        '3. Switch between Light and Dark modes as needed',
        '4. Reference variables in your designs for consistency'
      ];
      
      let yOffset = 630;
      for (const instruction of instructions) {
        await this.addInstructionText(parent, instruction, 20, yOffset);
        yOffset += 25;
      }
      
      log.success('Usage instructions added', 'documentation-module', 'addUsageInstructions');
    } catch (error) {
      logError('Failed to add usage instructions', error as Error);
      throw error;
    }
  }

  /**
   * Adds a section title
   */
  private async addSectionTitle(parent: FrameNode, title: string, x: number, y: number): Promise<void> {
    try {
      await loadFont({ family: 'Inter', style: 'SemiBold' });
      
      const titleNode = createTextNode(title, 18);
      titleNode.name = `Section: ${title}`;
      
      appendChild(parent, titleNode);
      setNodePosition(titleNode, x, y);
      
      log.success(`Added section title: ${title}`, 'documentation-module', 'addSectionTitle');
    } catch (error) {
      logError(`Failed to add section title: ${title}`, error as Error);
      throw error;
    }
  }

  /**
   * Adds collection information
   */
  private async addCollectionInfo(parent: FrameNode, collection: VariableCollection, x: number, y: number): Promise<void> {
    try {
      await loadFont({ family: 'Inter', style: 'Regular' });
      
      const infoText = `Collection: ${collection.name}\nVariables: ${collection.variableIds.length}\nModes: ${collection.modes.length}`;
      const infoNode = createTextNode(infoText, 14);
      infoNode.name = `Collection Info: ${collection.name}`;
      
      appendChild(parent, infoNode);
      setNodePosition(infoNode, x, y);
      
      log.success(`Added collection info for: ${collection.name}`, 'documentation-module', 'addCollectionInfo');
    } catch (error) {
      logError(`Failed to add collection info for: ${collection.name}`, error as Error);
      throw error;
    }
  }

  /**
   * Adds variable list
   */
  private async addVariableList(parent: FrameNode, collection: VariableCollection, x: number, y: number): Promise<void> {
    try {
      await loadFont({ family: 'Inter', style: 'Regular' });
      
      // Get variables from collection
      const variables = await Promise.all(
        collection.variableIds.map(id => figma.variables.getVariableByIdAsync(id))
      );
      
      const variableNames = variables
        .filter(v => v !== null)
        .map(v => v!.name)
        .slice(0, 10); // Limit to first 10 variables
      
      const listText = variableNames.join('\n');
      const listNode = createTextNode(listText, 12);
      listNode.name = `Variable List: ${collection.name}`;
      
      appendChild(parent, listNode);
      setNodePosition(listNode, x, y);
      
      log.success(`Added variable list for: ${collection.name}`, 'documentation-module', 'addVariableList');
    } catch (error) {
      logError(`Failed to add variable list for: ${collection.name}`, error as Error);
      throw error;
    }
  }

  /**
   * Adds instruction text
   */
  private async addInstructionText(parent: FrameNode, text: string, x: number, y: number): Promise<void> {
    try {
      await loadFont({ family: 'Inter', style: 'Regular' });
      
      const textNode = createTextNode(text, 14);
      textNode.name = `Instruction: ${text}`;
      
      appendChild(parent, textNode);
      setNodePosition(textNode, x, y);
      
      log.success(`Added instruction: ${text}`, 'documentation-module', 'addInstructionText');
    } catch (error) {
      logError(`Failed to add instruction: ${text}`, error as Error);
      throw error;
    }
  }
}

// ===============================================
// Documentation Module Factory
// ===============================================

/**
 * Creates and initializes a documentation module instance
 */
export function createDocumentationModule(): DocumentationModule {
  return new DocumentationModule();
}

// ===============================================
// Documentation Utility Functions
// ===============================================

/**
 * Creates documentation for a color system
 */
export async function createDocumentation(
  primitiveCollection: VariableCollection | null,
  semanticCollection: VariableCollection | null
): Promise<void> {
  try {
    const docModule = createDocumentationModule();
    await docModule.createDocumentation(primitiveCollection, semanticCollection);
  } catch (error) {
    logError('Failed to create documentation', error as Error);
    throw error;
  }
}
