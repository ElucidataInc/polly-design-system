# Polly Design Tokens

A centralized design token system for Polly applications. This package provides a comprehensive set of design tokens that can be used across multiple projects to maintain consistent theming.

## Installation

```bash
npm install @polly/design-tokens
```

## Usage

### CSS Variables

Import the CSS variables into your application:

```css
@import '@polly/design-tokens/css';
```

Or in your JavaScript/TypeScript:

```javascript
import '@polly/design-tokens/css';
```

### SCSS Mixins

Import SCSS mixins for enhanced styling:

```scss
@import '@polly/design-tokens/scss';
```

### JavaScript/TypeScript

#### Basic Usage

```javascript
import { tokens, getToken, getCSSVariable } from '@polly/design-tokens';

// Get a specific token value
const primaryColor = getToken('color.primary.500');

// Get a CSS variable reference
const primaryColorVar = getCSSVariable('color.primary.500');
// Returns: "var(--color-primary-500)"

// Access all tokens
console.log(tokens);
```

#### Categorized Access

```javascript
import { coreTokens, semanticTokens, componentTokens } from '@polly/design-tokens';

// Access core design tokens (colors, spacing, typography, etc.)
console.log(coreTokens);

// Access semantic tokens
console.log(semanticTokens);

// Access component-specific tokens
console.log(componentTokens);
```

#### Creating Custom Themes

```javascript
import { createTheme } from '@polly/design-tokens';

// Create a custom theme with overrides
const darkTheme = createTheme({
  'color.background.primary': '#1a1a1a',
  'color.text.primary': '#ffffff'
});
```

### Angular Integration

```typescript
// In your Angular component
import { Component } from '@angular/core';
import { tokens, getCSSVariable } from '@polly/design-tokens';

@Component({
  selector: 'app-example',
  template: `
    <div [style.background-color]="primaryColor">
      Content with themed background
    </div>
  `,
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent {
  primaryColor = getCSSVariable('color.primary.500');
}
```

```scss
// In your SCSS file
@import '@polly/design-tokens/scss';

.my-component {
  background-color: var(--color-primary-500);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
}
```

### React Integration

```jsx
import React from 'react';
import { getCSSVariable } from '@polly/design-tokens';
import '@polly/design-tokens/css';

function MyComponent() {
  return (
    <div style={{
      backgroundColor: getCSSVariable('color.primary.500'),
      padding: getCSSVariable('spacing.md'),
      borderRadius: getCSSVariable('radius.md')
    }}>
      Themed component
    </div>
  );
}
```

### Available Token Categories

#### Core Tokens
- **Colors**: Primary, secondary, neutral color palettes
- **Spacing**: Consistent spacing scale
- **Typography**: Font families, sizes, weights
- **Border Radius**: Consistent border radius values
- **Elevation**: Box shadow patterns

#### Semantic Tokens
- **Layout**: Layout-specific tokens
- **Color**: Semantic color meanings (success, warning, error, info)

#### Component Tokens
- **Button**: Button-specific styling tokens
- **Card**: Card component tokens
- **Form Elements**: Input, select, textarea tokens
- **Navigation**: Tab, accordion tokens
- **Feedback**: Toast, badge, tooltip tokens
- **Data Display**: Table, progress indicators
- **And many more...**

## Token Structure

Tokens follow a hierarchical naming convention:

```
category.subcategory.variant.state
```

Examples:
- `color.primary.500` - Primary color, medium shade
- `spacing.md` - Medium spacing value
- `button.background.primary.default` - Button background color in default state
- `font.size.lg` - Large font size

## Building and Development

### Build the Package

```bash
npm run build
```

This will:
1. Generate CSS variables and SCSS mixins
2. Build the JavaScript/TypeScript distribution files
3. Create a consolidated tokens.json file

### Publishing

```bash
npm run prepare  # Runs build automatically
npm publish
```

## File Structure

```
├── dist/                  # Built distribution files
│   ├── index.js          # CommonJS entry point
│   ├── index.esm.js      # ES Module entry point
│   ├── index.d.ts        # TypeScript declarations
│   ├── css-variables.css # CSS custom properties
│   ├── mixins.scss       # SCSS mixins
│   └── tokens.json       # All tokens as JSON
├── tokens/               # Source token definitions
│   ├── core/            # Core design tokens
│   └── semantic/        # Semantic and component tokens
├── src/                 # Source files
└── scripts/             # Build scripts
```

## Contributing

1. Add or modify token definitions in the `tokens/` directory
2. Run `npm run build` to regenerate the distribution files
3. Test the changes in your application
4. Submit a pull request with your changes

## License

MIT