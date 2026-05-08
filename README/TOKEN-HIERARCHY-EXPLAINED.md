# Design Token System - Complete Documentation

## Overview

This project implements a centralized design token system that generates CSS variables from JSON token definitions. The system supports advanced color manipulation, multiple color spaces, and automatic value calculation at build time.

## Architecture

```
project/polly-design-token/
├── tokens/
│   ├── core/                 # Primitive tokens (base values)
│   │   ├── color.json        # Brand and base colors
│   │   ├── spacing.json      # Spacing scale
│   │   ├── radius.json       # Border radius values
│   │   ├── font.json         # Typography settings
│   │   ├── elevation.json    # Shadow definitions
│   │   └── state.json        # State modifiers (hover, active, etc.)
│   └── semantic/             # Component-specific tokens
│       ├── button.json       # Button component tokens
│       ├── card.json         # Card component tokens
│       ├── color.json        # Semantic color mappings
│       └── layout.json       # Layout-related tokens
├── core-script/                      # Modular build utilities
│   ├── color-utils.js       # Color manipulation functions
│   ├── token-resolver.js    # Token reference resolution
│   ├── token-utils.js       # General utilities
│   └── file-generators.js   # Output file generation
├── build-tokens.js           # Main build script
└── dist/                     # Generated output
    ├── css-variables.min.css     # All CSS variables
    └── mixins.scss          # SCSS helper mixins

```

## Token Hierarchy

### 1. Core Tokens (Primitives)
Base-level design decisions that define the foundation of your design system.

```json
// tokens/core/color.json
{
  "primary": {
    "purple": "#8E42EE",
    "orange": "#F78E12"
  },
  "secondary": {
    "purple": "#936DC3"
  },
  "standard": {
    "white": "#ffffff",
    "black": "#000000"
  }
}

// tokens/core/state.json
{
  "hover": {
    "type": "darken",
    "amount": 0.15
  },
  "active": {
    "type": "darken",
    "amount": 0.25
  }
}
```

### 2. Semantic Tokens
Component-specific tokens that reference core tokens and can include calculations.

```json
// tokens/semantic/card.json
{
  "bg": {
    "default": "{color.standard.white}",
    "active": "{color.secondary.purple|mix:10:white}"
  },
  "background": {
    "default": "{color.standard.white}",
    "active": "{color.secondary.purple|mix:10:white}"
  },
  "border": {
    "default": "{color.secondary.purple|mix:30:white}",
    "width": "1px",
    "style": "solid"
  }
}
```

## Advanced Token Features

### Color Mixing with Multiple Color Spaces

The system supports various color spaces for more accurate and perceptually uniform color mixing:

#### Supported Color Spaces:
- **sRGB** (default): Standard RGB color space
- **sRGB-linear**: Linear RGB for more accurate blending
- **LAB**: Perceptually uniform color space
- **LCH**: Cylindrical LAB, better for hue interpolation
- **OKLAB/OKLCH**: Improved LAB/LCH variants
- **display-p3**: Wide gamut (approximated)

#### Syntax Examples:

```json
// Simple mixing (default sRGB)
"{color.secondary.purple|mix:30:white}"

// With color space specified
"{color.secondary.purple|mix:lab:30:white}"
"{color.secondary.purple|mix:lch:30:white}"
"{color.secondary.purple|mix:srgb-linear:30:white}"

// Function syntax for explicit control
"color-mix(in srgb, {color.primary.purple} 30%, {color.standard.white} 70%)"
"color-mix(in lab, {color.primary.purple} 30%, {color.standard.white} 70%)"
"color-mix(in lch, {color.primary.purple} 30%, {color.standard.white} 70%)"
```

### State Modifiers

Apply consistent state transformations to colors:

```json
// Reference a color with state modifier
"{color.primary.purple|state.hover}"    // Darkens by 15%
"{color.primary.purple|state.active}"   // Darkens by 25%
"{color.primary.purple|state.disabled}" // Lightens by 40%
```

### Color Manipulation Functions

```json
// Shading (darken)
"{color.primary.purple|shade:20}"

// Tinting (lighten)  
"{color.primary.purple|tint:20}"

// Saturation control
"{color.primary.purple|saturate:20}"
"{color.primary.purple|desaturate:20}"

// Alpha/Opacity
"{color.primary.purple|alpha:0.5}"
```

## Build System

### Running the Build

```bash
cd src/app/polly-design-token
node build-tokens.js
```

### Generated Output

The build system generates two essential files:

#### 1. `dist/css-variables.min.css`
Contains all computed CSS variables:

```css
:root {
  --color-primary-purple: #8E42EE;
  --color-secondary-purple: #936DC3;
  --card-bg-default: #ffffff;
  --card-bg-active: #f4f0f9;
  --card-background-default: #ffffff;
  --card-background-active: #f4f0f9;
  --card-border-default: #dfd3ed;
  --card-border-width: 1px;
  --card-border-style: solid;
  --card-transition-all: box-shadow 0.3s ease;
  --card-variant-material-border: 0;
  --card-state-active-background: #f4f0f9;
  /* ... and more */
}
```

#### 2. `dist/mixins.scss`
Optional SCSS helper functions:

```scss
@function color-mix($color1, $percent1, $color2, $percent2) { ... }
@function shade($color, $percent) { ... }
@function tint($color, $percent) { ... }
@mixin border-radius($radius) { ... }
@mixin shadow($shadow) { ... }
```

## Usage in Components

### Import CSS Variables

```scss
// In your main styles.scss or component SCSS
@import 'dist/css-variables.min.css';

// Optional: Import mixins if needed
@import 'dist/mixins.scss';
```

### Use in SCSS/CSS

```scss
.p-card {
  background: var(--card-bg-default);
  border: var(--card-border-width) var(--card-border-style) var(--card-border-default);
  border-radius: var(--card-radius-default);
  transition: var(--card-transition-all);
  
  &:hover {
    background: var(--card-bg-hover);
    box-shadow: var(--card-shadow-hover);
  }
  
  &.active {
    background-color: var(--card-state-active-background);
    border-color: var(--card-state-active-border);
  }
  
  &.material {
    border: var(--card-variant-material-border);
  }
}
```

### PrimeNG Integration

The token system integrates seamlessly with PrimeNG v18 components:

```typescript
// projects/polly-qubit/src/lib/design-system/presets/polly-qubit-theme/components/panel/card/index.ts
export const root = {
  background: 'var(--card-bg-default)',
  borderRadius: 'var(--card-radius-default)',
  color: 'var(--color-primary-neutral)',
  shadow: 'var(--card-shadow-default)'
};

export const css = `
body {
  p-card {
    .p-card {
      transition: var(--card-transition-all);
      border: var(--card-border-width) var(--card-border-style) var(--card-border-default);
      background: var(--card-bg-default);
    }
  }
}
`;
```

## Color Space Comparison

Different color spaces produce subtly different results when mixing colors:

| Method | Mix Result (10% purple, 90% white) | Use Case |
|--------|-------------------------------------|----------|
| sRGB | `#f4f0f9` | Standard web colors, fastest |
| LAB | `#f5f0f9` | Perceptually uniform mixing |
| LCH | `#f2f0fa` | Better hue preservation |
| sRGB-linear | `#f3eff8` | Physically accurate light mixing |

## Key Features

### ✅ Pre-computed Values
All color calculations happen at build time, so the final CSS only contains static hex/rgba values for optimal runtime performance.

### ✅ Multiple Naming Conventions
The system generates both shortened and full property names for compatibility:
- `--card-bg-active` and `--card-background-active`
- `--card-border-default` and `--card-border-color`

### ✅ Component Variants
Support for different component states and variants:
- States: default, hover, active, focus, disabled
- Variants: material, flat, outlined
- Sizes: small, medium, large

### ✅ Type Safety (Optional)
The build can generate TypeScript definitions for type-safe token access:

```typescript
import { designTokens } from '@design-tokens/dist/design-tokens';
const primaryColor = designTokens.color.primary.purple;
```

## Migration from Old SCSS System

### Before (SCSS with mixins):
```scss
.p-card {
  @include add-color(background-color, $white);
  @include add-transition($box-shadow-transition);
  @include border-radius($card-radius-large);
  border: 1px solid color-mix(in srgb, $secondary-purple 30%, $white 70%);
}
```

### After (CSS Variables):
```scss
.p-card {
  background-color: var(--card-bg-default);
  transition: var(--card-transition-all);
  border-radius: var(--card-radius-default);
  border: var(--card-border-width) var(--card-border-style) var(--card-border-default);
}
```

## Best Practices

1. **Use Semantic Tokens**: Prefer semantic tokens over direct color values
   ```scss
   // Good
   background: var(--card-bg-default);
   
   // Avoid
   background: var(--color-standard-white);
   ```

2. **Leverage Color Spaces**: Use LAB/LCH for perceptually uniform gradients
   ```json
   "gradient-start": "{color.primary.purple|mix:lab:20:white}"
   ```

3. **Consistent Naming**: Follow the established naming pattern
   ```
   --[component]-[property]-[state]
   --card-border-default
   --button-bg-hover
   ```

4. **Document Token Usage**: Comment complex token calculations
   ```json
   // Creates a subtle purple tint for active states
   "active": "{color.secondary.purple|mix:10:white}"
   ```

## Troubleshooting

### Variable Not Found
If you get "variable not defined" errors:
1. Check that the token name in JSON matches your CSS usage
2. Rebuild tokens: `node build-tokens.js`
3. Ensure CSS variables are imported in your styles

### Color Mixing Issues
- The pipe syntax auto-calculates the second percentage: `|mix:30:white` = 30% color, 70% white
- Don't specify both percentages in pipe syntax: ❌ `|mix:30:white:70`
- Use function syntax for explicit control: ✅ `color-mix(in srgb, {color} 30%, {white} 70%)`

### Performance Considerations
- All calculations happen at build time
- The final CSS contains only static values
- No runtime color calculations needed
- Optimal for production performance

## Future Enhancements

Potential improvements for the token system:
- [ ] Dark mode support with theme switching
- [ ] Responsive tokens for different breakpoints
- [ ] Animation timing tokens
- [ ] Grid and layout system tokens
- [ ] Icon size tokens
- [ ] Z-index scale management

---

*Last Updated: February 2024*
*Token System Version: 2.0*