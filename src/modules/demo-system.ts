// Demo and Documentation System Module
import { VariableCollection } from '../core/types';

export class DemoSystemManager {
  private state: any;

  constructor(state: any) {
    this.state = state;
  }

  // Export demo components - this is the working implementation from the last working version
  async exportDemoComponents(collection: VariableCollection, semanticCollection: VariableCollection | null = null): Promise<void> {
    console.log("exportDemoComponents called with collection:", collection.name);
    try {
      // Load required fonts with error handling
      try {
        await Promise.all([
          this.loadFontWithFallback("Inter", "Regular"),
          this.loadFontWithFallback("Inter", "Medium")
        ]);
      } catch (error) {
        console.warn("Failed to load some fonts, continuing with available fonts:", error);
      }
      
      // Create main frame
      const frame = figma.createFrame();
      frame.name = "SCS Demo Components";
      frame.layoutMode = "HORIZONTAL";
      frame.primaryAxisSizingMode = "FIXED";
      frame.counterAxisSizingMode = "FIXED";
      frame.resize(1560, 520);
      frame.cornerRadius = 24;
      frame.itemSpacing = 0;
      frame.paddingLeft = 0;
      frame.paddingRight = 0;
      frame.paddingTop = 0;
      frame.paddingBottom = 0;
      frame.layoutAlign = "CENTER";
      frame.counterAxisAlignItems = "CENTER";
      
      // Position frame on canvas
      frame.x = 100;
      frame.y = 100;

      // Create three main columns
      const leftColumn = await this.createFixedWidthFrame(
        await this.createFeaturedCard(semanticCollection || collection), 
        "surface/sf-neutral-primary", 
        semanticCollection || collection
      );

      const middleColumn = await this.createFixedWidthFrame(
        await this.createProductList(semanticCollection || collection), 
        "surface/sf-neutral-secondary", 
        semanticCollection || collection
      );

      const rightColumn = await this.createFixedWidthFrame(
        await this.createNotifications(semanticCollection || collection), 
        "surface/sf-neutral-primary", 
        semanticCollection || collection
      );

      // Add columns to frame
      frame.appendChild(leftColumn);
      frame.appendChild(middleColumn);
      frame.appendChild(rightColumn);

      console.log("Demo components created successfully");
    } catch (error) {
      console.error('Error in exportDemoComponents:', error);
      this.state.addError(`Failed to create demo components: ${error.message}`);
      figma.notify('Error creating demo components');
      throw error;
    }
  }

  // Export documentation - this is the working implementation from the last working version
  async exportDocumentation(collection: VariableCollection, semanticCollection: VariableCollection | null = null): Promise<void> {
    console.log("exportDocumentation called with collection:", collection.name);
    try {
      // Load required fonts with error handling
      try {
        await Promise.all([
          this.loadFontWithFallback("Inter", "Regular"),
          this.loadFontWithFallback("Inter", "Medium")
        ]);
      } catch (error) {
        console.warn("Failed to load some fonts, continuing with available fonts:", error);
      }
      
      // Create main documentation frame
      const frame = figma.createFrame();
      frame.name = "SCS Documentation";
      frame.layoutMode = "VERTICAL";
      frame.primaryAxisSizingMode = "AUTO";
      frame.counterAxisSizingMode = "AUTO";
      frame.itemSpacing = 24;
      frame.paddingLeft = 40;
      frame.paddingRight = 40;
      frame.paddingTop = 40;
      frame.paddingBottom = 40;
      frame.cornerRadius = 12;
      
      // Position frame on canvas (below the demo frame)
      frame.x = 100;
      frame.y = 700;

      // Set background color
      await this.applyVariableWithFallback(frame, collection, "surface/sf-neutral-primary", 'backgrounds');

      // Create title
      const title = figma.createText();
      title.characters = "SCS Color System Documentation";
      title.fontSize = 32;
      title.fontWeight = 700;
      await this.applyVariableWithFallback(title, collection, "text-icon/ti-neutral-primary", 'text');
      frame.appendChild(title);

      // Create color palette section
      const colorSection = await this.createColorPaletteSection(collection);
      frame.appendChild(colorSection);

      // Create usage examples section
      const usageSection = await this.createUsageExamplesSection(collection);
      frame.appendChild(usageSection);

      console.log("Documentation created successfully");
    } catch (error) {
      console.error('Error in exportDocumentation:', error);
      this.state.addError(`Failed to create documentation: ${error.message}`);
      figma.notify('Error creating documentation');
      throw error;
    }
  }

  // Utility function to create a fixed width frame
  private async createFixedWidthFrame(content: FrameNode, backgroundColor: string, collection: VariableCollection): Promise<FrameNode> {
    const wrapper = figma.createFrame();
    wrapper.layoutMode = "VERTICAL";
    wrapper.primaryAxisSizingMode = "FIXED";
    wrapper.counterAxisSizingMode = "FIXED";
    wrapper.resize(520, 520);
    wrapper.paddingLeft = 80;
    wrapper.paddingRight = 80;
    wrapper.paddingTop = 80;
    wrapper.paddingBottom = 80;
    wrapper.layoutAlign = "STRETCH";
    wrapper.primaryAxisAlignItems = "CENTER";
    wrapper.counterAxisAlignItems = "CENTER";

    // Set background color with error handling
    await this.applyVariableWithFallback(wrapper, collection, backgroundColor, 'backgrounds');

    // Ensure content hugs its contents
    content.layoutMode = "VERTICAL";
    content.primaryAxisSizingMode = "AUTO";
    content.counterAxisSizingMode = "AUTO";
    content.layoutAlign = "CENTER";
    content.counterAxisAlignItems = "CENTER";

    wrapper.appendChild(content);
    return wrapper;
  }

  // Create featured card component
  private async createFeaturedCard(collection: VariableCollection): Promise<FrameNode> {
    const card = figma.createFrame();
    card.name = "Featured Product";
    card.layoutMode = "VERTICAL";
    card.primaryAxisSizingMode = "AUTO";
    card.counterAxisSizingMode = "AUTO";
    card.itemSpacing = 16;
    card.paddingLeft = 16;
    card.paddingRight = 16;
    card.paddingTop = 16;
    card.paddingBottom = 16;
    card.cornerRadius = 8;
    card.strokeWeight = 0.5;
    card.layoutAlign = "STRETCH";

    // Set background and border colors
    await this.applyVariableWithFallback(card, collection, "surface/sf-brand-primary", 'backgrounds');
    await this.applyVariableWithFallback(card, collection, "border/br-with-sf-neutral-primary", 'backgrounds');

    // Preview area
    const preview = figma.createFrame();
    preview.name = "Preview";
    preview.resize(336, 180);
    preview.cornerRadius = 4;
    preview.layoutAlign = "STRETCH";
    await this.applyVariableWithFallback(preview, collection, "surface/sf-brand-primary-emphasized", 'backgrounds');

    // Content container
    const content = figma.createFrame();
    content.name = "Content";
    content.layoutMode = "VERTICAL";
    content.layoutAlign = "STRETCH";
    content.itemSpacing = 12;
    content.fills = [];

    // Title
    const title = figma.createText();
    title.name = "Title";
    title.characters = "Product Title";
    title.layoutAlign = "STRETCH";
    title.textAutoResize = "HEIGHT";
    title.fontSize = 18;
    title.fontWeight = 600;
    await this.applyVariableWithFallback(title, collection, "text-icon/ti-on-bg-brand-primary", 'text');

    // Description
    const description = figma.createText();
    description.name = "Description";
    description.characters = "Product description goes here";
    description.layoutAlign = "STRETCH";
    description.textAutoResize = "HEIGHT";
    description.fontSize = 14;
    await this.applyVariableWithFallback(description, collection, "text-icon/ti-on-bg-brand-primary-subtle", 'text');

    // Button
    const button = await this.createButton(collection, "Learn More", "background/bg-brand-primary", "text-icon/ti-on-bg-brand-primary");

    // Assemble card
    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(button);
    card.appendChild(preview);
    card.appendChild(content);

    return card;
  }

  // Create product list component
  private async createProductList(collection: VariableCollection): Promise<FrameNode> {
    const list = figma.createFrame();
    list.name = "Product List";
    list.layoutMode = "VERTICAL";
    list.primaryAxisSizingMode = "AUTO";
    list.counterAxisSizingMode = "AUTO";
    list.itemSpacing = 12;
    list.layoutAlign = "STRETCH";

    // Create list items
    for (let i = 1; i <= 3; i++) {
      const item = await this.createProductListItem(collection, `Product ${i}`);
      list.appendChild(item);
    }

    return list;
  }

  // Create product list item
  private async createProductListItem(collection: VariableCollection, title: string): Promise<FrameNode> {
    const item = figma.createFrame();
    item.name = "Product Item";
    item.layoutMode = "HORIZONTAL";
    item.primaryAxisSizingMode = "AUTO";
    item.counterAxisSizingMode = "AUTO";
    item.itemSpacing = 12;
    item.paddingLeft = 12;
    item.paddingRight = 12;
    item.paddingTop = 8;
    item.paddingBottom = 8;
    item.cornerRadius = 6;
    item.layoutAlign = "STRETCH";

    // Set background color
    await this.applyVariableWithFallback(item, collection, "surface/sf-neutral-primary", 'backgrounds');

    // Product icon
    const icon = figma.createEllipse();
    icon.name = "Product Icon";
    icon.resize(32, 32);
    await this.applyVariableWithFallback(icon, collection, "background/bg-brand-primary", 'backgrounds');

    // Product info
    const info = figma.createFrame();
    info.name = "Product Info";
    info.layoutMode = "VERTICAL";
    info.primaryAxisSizingMode = "AUTO";
    info.counterAxisSizingMode = "AUTO";
    info.itemSpacing = 4;
    info.layoutAlign = "STRETCH";

    const productTitle = figma.createText();
    productTitle.name = "Product Title";
    productTitle.characters = title;
    productTitle.fontSize = 14;
    productTitle.fontWeight = 500;
    await this.applyVariableWithFallback(productTitle, collection, "text-icon/ti-neutral-primary", 'text');

    const productDesc = figma.createText();
    productDesc.name = "Product Description";
    productDesc.characters = "Product description";
    productDesc.fontSize = 12;
    await this.applyVariableWithFallback(productDesc, collection, "text-icon/ti-neutral-secondary", 'text');

    info.appendChild(productTitle);
    info.appendChild(productDesc);
    item.appendChild(icon);
    item.appendChild(info);

    return item;
  }

  // Create notifications component
  private async createNotifications(collection: VariableCollection): Promise<FrameNode> {
    const notifications = figma.createFrame();
    notifications.name = "Notifications";
    notifications.layoutMode = "VERTICAL";
    notifications.primaryAxisSizingMode = "AUTO";
    notifications.counterAxisSizingMode = "AUTO";
    notifications.itemSpacing = 12;
    notifications.layoutAlign = "STRETCH";

    // Create notification items
    const successNotification = await this.createNotification(collection, "Success", "Operation completed successfully", "success");
    const errorNotification = await this.createNotification(collection, "Error", "Something went wrong", "error");
    const infoNotification = await this.createNotification(collection, "Info", "Here's some information", "info");

    notifications.appendChild(successNotification);
    notifications.appendChild(errorNotification);
    notifications.appendChild(infoNotification);

    return notifications;
  }

  // Create notification component
  private async createNotification(collection: VariableCollection, title: string, message: string, type: "success" | "error" | "info"): Promise<FrameNode> {
    const notification = figma.createFrame();
    notification.name = `${type} Notification`;
    notification.layoutMode = "VERTICAL";
    notification.primaryAxisSizingMode = "AUTO";
    notification.counterAxisSizingMode = "AUTO";
    notification.itemSpacing = 8;
    notification.paddingLeft = 12;
    notification.paddingRight = 12;
    notification.paddingTop = 12;
    notification.paddingBottom = 12;
    notification.cornerRadius = 6;
    notification.layoutAlign = "STRETCH";

    // Set background color based on type
    const bgColor = type === "success" ? "background/bg-success" : 
                   type === "error" ? "background/bg-error" : 
                   "background/bg-brand-primary";
    await this.applyVariableWithFallback(notification, collection, bgColor, 'backgrounds');

    // Title
    const titleText = figma.createText();
    titleText.name = "Notification Title";
    titleText.characters = title;
    titleText.fontSize = 14;
    titleText.fontWeight = 600;
    await this.applyVariableWithFallback(titleText, collection, "text-icon/ti-on-bg-brand-primary", 'text');

    // Message
    const messageText = figma.createText();
    messageText.name = "Notification Message";
    messageText.characters = message;
    messageText.fontSize = 12;
    await this.applyVariableWithFallback(messageText, collection, "text-icon/ti-on-bg-brand-primary-subtle", 'text');

    notification.appendChild(titleText);
    notification.appendChild(messageText);

    return notification;
  }

  // Create button component
  private async createButton(collection: VariableCollection, text: string, bgVarName: string, textVarName: string): Promise<FrameNode> {
    const button = figma.createFrame();
    button.name = `${text} Button`;
    button.layoutMode = "HORIZONTAL";
    button.primaryAxisSizingMode = "AUTO";
    button.counterAxisSizingMode = "AUTO";
    button.primaryAxisAlignItems = "CENTER";
    button.counterAxisAlignItems = "CENTER";
    button.paddingLeft = 16;
    button.paddingRight = 16;
    button.paddingTop = 8;
    button.paddingBottom = 8;
    button.cornerRadius = 6;
    button.strokeWeight = 0.5;

    // Set background and border colors
    await this.applyVariableWithFallback(button, collection, bgVarName, 'backgrounds');
    await this.applyVariableWithFallback(button, collection, "border/br-with-sf-neutral-primary", 'backgrounds');

    const buttonText = figma.createText();
    buttonText.characters = text;
    buttonText.layoutAlign = "CENTER";
    buttonText.textAlignHorizontal = "CENTER";
    buttonText.fontSize = 14;
    buttonText.fontWeight = 500;
    await this.applyVariableWithFallback(buttonText, collection, textVarName, 'text');

    button.appendChild(buttonText);
    return button;
  }

  // Create color palette section for documentation
  private async createColorPaletteSection(collection: VariableCollection): Promise<FrameNode> {
    const section = figma.createFrame();
    section.name = "Color Palette Section";
    section.layoutMode = "VERTICAL";
    section.primaryAxisSizingMode = "AUTO";
    section.counterAxisSizingMode = "AUTO";
    section.itemSpacing = 16;
    section.layoutAlign = "STRETCH";

    // Section title
    const title = figma.createText();
    title.characters = "Color Palette";
    title.fontSize = 24;
    title.fontWeight = 600;
    await this.applyVariableWithFallback(title, collection, "text-icon/ti-neutral-primary", 'text');
    section.appendChild(title);

    // Color swatches
    const swatches = figma.createFrame();
    swatches.name = "Color Swatches";
    swatches.layoutMode = "HORIZONTAL";
    swatches.primaryAxisSizingMode = "AUTO";
    swatches.counterAxisSizingMode = "AUTO";
    swatches.itemSpacing = 12;

    const colors = [
      { name: "Brand Primary", variable: "surface/sf-brand-primary" },
      { name: "Brand Secondary", variable: "surface/sf-brand-primary-emphasized" },
      { name: "Neutral Primary", variable: "surface/sf-neutral-primary" },
      { name: "Neutral Secondary", variable: "surface/sf-neutral-secondary" }
    ];

    for (const color of colors) {
      const swatch = await this.createColorSwatch(collection, color.name, color.variable);
      swatches.appendChild(swatch);
    }

    section.appendChild(swatches);
    return section;
  }

  // Create color swatch
  private async createColorSwatch(collection: VariableCollection, name: string, variable: string): Promise<FrameNode> {
    const swatch = figma.createFrame();
    swatch.name = `${name} Swatch`;
    swatch.layoutMode = "VERTICAL";
    swatch.primaryAxisSizingMode = "AUTO";
    swatch.counterAxisSizingMode = "AUTO";
    swatch.itemSpacing = 8;
    swatch.paddingLeft = 12;
    swatch.paddingRight = 12;
    swatch.paddingTop = 12;
    swatch.paddingBottom = 12;
    swatch.cornerRadius = 8;
    swatch.layoutAlign = "CENTER";

    // Color circle
    const circle = figma.createEllipse();
    circle.name = "Color Circle";
    circle.resize(48, 48);
    await this.applyVariableWithFallback(circle, collection, variable, 'backgrounds');

    // Color name
    const nameText = figma.createText();
    nameText.characters = name;
    nameText.fontSize = 12;
    nameText.fontWeight = 500;
    await this.applyVariableWithFallback(nameText, collection, "text-icon/ti-neutral-primary", 'text');

    swatch.appendChild(circle);
    swatch.appendChild(nameText);
    return swatch;
  }

  // Create usage examples section for documentation
  private async createUsageExamplesSection(collection: VariableCollection): Promise<FrameNode> {
    const section = figma.createFrame();
    section.name = "Usage Examples Section";
    section.layoutMode = "VERTICAL";
    section.primaryAxisSizingMode = "AUTO";
    section.counterAxisSizingMode = "AUTO";
    section.itemSpacing = 16;
    section.layoutAlign = "STRETCH";

    // Section title
    const title = figma.createText();
    title.characters = "Usage Examples";
    title.fontSize = 24;
    title.fontWeight = 600;
    await this.applyVariableWithFallback(title, collection, "text-icon/ti-neutral-primary", 'text');
    section.appendChild(title);

    // Example buttons
    const buttons = figma.createFrame();
    buttons.name = "Example Buttons";
    buttons.layoutMode = "HORIZONTAL";
    buttons.primaryAxisSizingMode = "AUTO";
    buttons.counterAxisSizingMode = "AUTO";
    buttons.itemSpacing = 12;

    const primaryButton = await this.createButton(collection, "Primary", "background/bg-brand-primary", "text-icon/ti-on-bg-brand-primary");
    const secondaryButton = await this.createButton(collection, "Secondary", "surface/sf-neutral-primary", "text-icon/ti-brand-primary");

    buttons.appendChild(primaryButton);
    buttons.appendChild(secondaryButton);
    section.appendChild(buttons);

    return section;
  }

  // Apply variable with fallback
  private async applyVariableWithFallback(node: any, collection: VariableCollection, variableName: string, fallbackType: string): Promise<void> {
    try {
      // Try to find and apply the variable
      const variables = await figma.variables.getLocalVariablesAsync();
      const variable = variables.find(v => v.name === variableName);
      
      if (variable) {
        if (node.fills) {
          node.fills = [{
            type: 'VARIABLE',
            variable: variable
          }];
        }
      } else {
        // Fallback to a default color
        const fallbackColor = this.getFallbackColor(fallbackType);
        if (node.fills) {
          node.fills = [{
            type: 'SOLID',
            color: fallbackColor
          }];
        }
      }
    } catch (error) {
      console.warn(`Failed to apply variable ${variableName}, using fallback:`, error);
      const fallbackColor = this.getFallbackColor(fallbackType);
      if (node.fills) {
        node.fills = [{
          type: 'SOLID',
          color: fallbackColor
        }];
      }
    }
  }

  // Get fallback color
  private getFallbackColor(type: string): { r: number; g: number; b: number } {
    const fallbackColors: { [key: string]: { r: number; g: number; b: number } } = {
      backgrounds: { r: 0.95, g: 0.95, b: 0.95 },
      text: { r: 0.1, g: 0.1, b: 0.1 },
      borders: { r: 0.8, g: 0.8, b: 0.8 }
    };
    return fallbackColors[type] || { r: 0.5, g: 0.5, b: 0.5 };
  }

  // Load font with fallback
  private async loadFontWithFallback(fontFamily: string, style: string): Promise<void> {
    try {
      await figma.loadFontAsync({ family: fontFamily, style: style });
    } catch (error) {
      console.warn(`Failed to load font ${fontFamily} ${style}, trying fallback:`, error);
      try {
        await figma.loadFontAsync({ family: "Inter", style: "Regular" });
      } catch (fallbackError) {
        console.error(`Failed to load fallback font:`, fallbackError);
        throw fallbackError;
      }
    }
  }
}
