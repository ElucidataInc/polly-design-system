# 📋 Semantic Layer Naming Convention Guide

> **Note:** This guide focuses ONLY on the semantic layer. Core tokens remain unchanged and follow their existing patterns.

## Overview

The semantic layer contains both **true semantic tokens** and **component tokens**. Each follows specific naming patterns while living in the same `tokens/semantic/` folder.

### 🚨 Critical Reference Rule
```
Core → Semantic (all files in semantic folder)
```
- **ALL tokens in semantic folder** can ONLY reference **Core** tokens
- **NO token in semantic folder** can reference another token in semantic folder (prevents circular dependencies)
- This applies to BOTH true semantic tokens (`color.json`) AND component tokens (`button.json`)

⚠️ **NEVER DO THIS in semantic tokens:**
```json
// semantic/color.json - WRONG!
{
  "text": {
    "error": "{semantic.color.feedback.error}"  // ❌ Semantic referencing semantic
  }
}
```

✅ **ALWAYS DO THIS in semantic tokens:**
```json
// semantic/color.json - CORRECT!
{
  "text": {
    "error": "{color.primary.red}",           // ✅ Reference core only
    "primary": "{color.primary.neutral}",     // ✅ Reference core only
    "secondary": "{color.neutral.purple}"     // ✅ Reference core only
  }
}
```

## Semantic Layer Structure

```
tokens/semantic/
├── color.json          # TRUE SEMANTIC (prefix: semantic.color)
├── layout.json         # TRUE SEMANTIC (prefix: semantic.layout)
│
├── button.json         # COMPONENT TOKEN (prefix: button)
├── card.json           # COMPONENT TOKEN (prefix: card)
├── datepicker.json     # COMPONENT TOKEN (prefix: datepicker)
└── [component].json    # More COMPONENT tokens
```

### The Key Distinction:
- **TRUE Semantic tokens** (`color.json`, `layout.json`): Can ONLY reference CORE tokens
- **COMPONENT tokens** (`button.json`, `card.json`): Should ONLY reference CORE tokens to prevent circular dependencies

## Naming Patterns in Semantic Layer

### 1. True Semantic Tokens (color.json, layout.json)

**Pattern:** `semantic-[category]-[intent]-[variant]-[state]`

#### Semantic Color Tokens (`semantic/color.json`)
```json
{
  "text": {
    "primary": "{color.primary.neutral}",
    "secondary": "{color.neutral.purple}",
    "disabled": "{color.neutral.blue}",
    "inverse": "{color.standard.white}",
    "error": "{color.primary.red}"
  },
  "background": {
    "base": "{color.standard.white}",
    "surface": "{color.surface.hover}",
    "overlay": "rgba(0, 0, 0, 0.5)",
    "disabled": "{color.surface.disabled}"
  },
  "action": {
    "primary": "{color.primary.purple}",        // Simple reference to core
    "primaryHover": "{color.secondary.purple}",  // Each is independent
    "primaryActive": "{color.brand.alt.purple}", // No nesting
    "primaryDisabled": "{color.surface.disabled}",
    "secondary": "{color.primary.neutral}",
    "secondaryHover": "{color.neutral.purple}",
    "danger": "{color.primary.red}",
    "dangerHover": "{color.secondary.red}"
  },
  "border": {
    "default": "{color.neutral.purple}",
    "subtle": "{color.surface.hover}",
    "strong": "{color.neutral.blue}",
    "focus": "{color.primary.purple}",
    "error": "{color.primary.red}"
  },
  "feedback": {
    "error": "{color.primary.red}",
    "success": "{color.primary.green}",
    "warning": "{color.primary.yellow}",
    "info": "{color.primary.blue}"
  }
}
```

**Generated CSS:**
```css
--semantic-color-text-primary: #111827;
--semantic-color-text-secondary: #6b7280;
--semantic-color-action-primary: #8E42EE;
--semantic-color-action-primaryHover: #7c3aed;
--semantic-color-action-primaryActive: #6d28d9;
--semantic-color-border-focus: #8E42EE;
--semantic-color-feedback-error: #ef4444;
```

#### Semantic Layout Tokens (`semantic/layout.json`)
```json
{
  "spacing": {
    "component": {
      "padding": "{spacing.4}",
      "gap": "{spacing.3}",
      "margin": "{spacing.2}"
    },
    "section": {
      "padding": "{spacing.8}",
      "gap": "{spacing.6}"
    },
    "page": {
      "padding": "{spacing.12}",
      "maxWidth": "1280px"
    }
  },
  "radius": {
    "component": "{radius.md}",
    "card": "{radius.lg}",
    "button": "{radius.md}",
    "input": "{radius.sm}",
    "modal": "{radius.xl}"
  }
}
```

**Generated CSS:**
```css
--semantic-spacing-component-padding: 1rem;
--semantic-spacing-section-padding: 2rem;
--semantic-radius-component: 0.375rem;
--semantic-radius-card: 0.5rem;
```

### 2. Component Tokens (button.json, card.json, etc.)

**Pattern:** `[component]-[element]-[property]-[variant]-[state]`

> **Important:** 
> - Component tokens do NOT use the `semantic-` prefix even though they're in the semantic folder!
> - Component tokens MUST ONLY reference CORE tokens (to prevent circular dependencies)
> - Files like `button.json`, `card.json` are COMPONENT tokens, not semantic tokens
> - NO file in semantic folder can reference another file in semantic folder

#### Button Component (`semantic/button.json`)
```json
{
  "background": {
    "primary": "{color.primary.purple}",           // Reference CORE directly
    "primaryHover": "{color.secondary.purple}",    // NOT semantic tokens
    "primaryActive": "{color.brand.alt.purple}",
    "primaryDisabled": "{color.surface.disabled}",
    "secondary": "transparent",
    "secondaryHover": "{color.surface.hover}",
    "secondaryActive": "{color.surface.active}",
    "danger": "{color.primary.red}",
    "dangerHover": "{color.secondary.red}"
  },
  "text": {
    "primary": "{color.standard.white}",       // Reference CORE directly
    "secondary": "{color.primary.neutral}",     // NOT semantic.color.text.primary
    "disabled": "{color.neutral.purple}"
  },
  "border": {
    "secondary": {
      "default": "{color.neutral.purple}",    // Reference CORE directly
      "hover": "{color.neutral.blue}"         // NOT semantic tokens
    }
  },
  "padding": {
    "sm": "{spacing.2} {spacing.3}",
    "md": "{spacing.2} {spacing.4}",
    "lg": "{spacing.3} {spacing.6}"
  },
  "radius": {
    "default": "{radius.md}"  // Reference CORE directly, NOT semantic
  }
}
```

**Generated CSS:**
```css
--button-background-primary: #8E42EE;
--button-background-primaryHover: #7c3aed;
--button-background-primaryActive: #6d28d9;
--button-background-secondary: transparent;
--button-background-secondaryHover: #f9fafb;
--button-text-primary: #ffffff;
--button-text-secondary: #111827;
--button-padding-md: 0.5rem 1rem;
--button-radius-default: 0.375rem;
```

#### Card Component (`semantic/card.json`)
```json
{
  "background": {
    "default": "{color.standard.white}",       // Reference CORE only
    "hover": "{color.standard.white}",         // NOT semantic tokens
    "selected": "{color.surface.hover}"
  },
  "border": {
    "color": {
      "default": "{color.neutral.purple}",      // Reference CORE only
      "hover": "{color.neutral.blue}",         // NOT semantic.color.border.strong
      "selected": "{color.primary.purple}"     // NOT semantic.color.action.primary
    },
    "width": "1px",
    "radius": "{radius.lg}"                    // Reference CORE only
  },
  "shadow": {
    "default": "none",
    "hover": "{elevation.md}",
    "selected": "none"
  },
  "padding": {
    "default": "{spacing.4}",
    "compact": "{spacing.2}",
    "spacious": "{spacing.6}"
  }
}
```

**Generated CSS:**
```css
--card-background-default: #ffffff;
--card-border-color-default: #d1d5db;
--card-border-radius: 0.5rem;
--card-padding-default: 1rem;
```

#### Datepicker Component (`semantic/datepicker.json`)
```json
{
  "panel": {
    "background": "{color.standard.white}",     // Reference CORE only
    "border": "{color.neutral.purple}",        // NOT semantic tokens
    "radius": "{radius.xl}",                   // Reference CORE only
    "shadow": "{elevation.lg}"
  },
  "day": {
    "background": {
      "default": "transparent",
      "hover": "{color.surface.hover}",        // Reference CORE only
      "selected": "{color.primary.purple}",     // NOT semantic.color.action.primary
      "today": "{color.surface.active}",
      "disabled": "{color.surface.disabled}"    // Reference CORE only
    },
    "text": {
      "default": "{color.primary.neutral}",     // Reference CORE only
      "selected": "{color.standard.white}",    // NOT semantic.color.text.inverse
      "disabled": "{color.neutral.purple}",    // Reference CORE only
      "weekend": "{color.neutral.blue}"        // Reference CORE only
    }
  },
  "header": {
    "background": "{color.surface.hover}",      // Reference CORE only
    "text": "{color.primary.neutral}",         // Reference CORE only
    "padding": "{spacing.3}"
  }
}
```

**Generated CSS:**
```css
--datepicker-panel-background: #ffffff;
--datepicker-day-background-selected: #8E42EE;
--datepicker-day-text-selected: #ffffff;
--datepicker-header-padding: 0.75rem;
```

## Naming Rules for Semantic Layer

### ✅ DO's for True Semantic Tokens

1. **Use intent-based names**
   ```json
   "text": {
     "primary": "{color.gray.900}"  // NOT "text-black"
   }
   ```

2. **Group by purpose**
   ```json
   "action": {
     "primary": "...",
     "secondary": "..."
   }
   ```

3. **Reference core tokens**
   ```json
   "border": {
     "default": "{color.gray.300}"  // Reference core
   }
   ```

### ✅ DO's for Component Tokens

1. **Use component name as prefix**
   ```css
   --button-background-primary
   --card-border-radius
   --datepicker-day-background
   ```

2. **Reference ONLY core tokens**
   ```json
   "background": {
     "primary": "{color.purple.500}"  // ONLY core references allowed
   }
   ```

3. **Keep property names consistent**
   ```json
   // All components use same property names
   "background", "text", "border", "padding", "radius"
   ```

### ❌ DON'Ts for Semantic Layer

1. **Don't use color names in semantic tokens**
   ```json
   // Wrong
   "purple-primary": "{color.purple.500}"
   
   // Correct
   "action": {
     "primary": "{color.purple.500}"
   }
   ```

2. **Don't add semantic prefix to component tokens**
   ```css
   /* Wrong */
   --semantic-button-background-primary
   
   /* Correct */
   --button-background-primary
   ```

3. **[NOT FOR NOW] Don't hardcode values in semantic layer** 
   ```json
   // Wrong
   "padding": "1rem"
   
   // Correct
   "padding": "{spacing.4}"
   ```

4. **[NOT FOR NOW] Don't include CSS properties**
   ```json
   // Wrong
   "display": "flex",
   "position": "relative"
   
   // These should be in component styles, not tokens
   ```

## State Naming Patterns

### Standard States
- `default` - Normal state (can be implicit)
- `hover` - Mouse hover
- `active` - Being pressed/clicked
- `focus` - Keyboard focus
- `disabled` - Non-interactive

### Selection States
- `selected` - Item is selected
- `checked` - Checkbox/radio checked

### Validation States
- `error` - Invalid state
- `success` - Valid state
- `warning` - Warning state

### Examples
```json
{
  "background": {
    "primary": "{color.primary.purple}",        // Flat structure, core reference
    "primaryHover": "{color.secondary.purple}", // No nesting
    "primaryActive": "{color.brand.alt.purple}",// Direct core reference
    "primaryDisabled": "{color.surface.disabled}" // Each state separate
  }
}
```

## Reference Patterns

### ⚠️ CRITICAL RULE: Reference Hierarchy
```
Core → Semantic → Component
```

**IMPORTANT:** 
- ✅ ALL tokens in semantic folder can ONLY reference **Core** tokens
- ❌ NO token in semantic folder can reference another token in semantic folder
- ✅ This applies to BOTH semantic tokens AND component tokens

### From Semantic to Core (ONLY ALLOWED PATTERN)
```json
{
  "text": {
    "primary": "{color.primary.neutral}"  // ✅ Direct core reference
  },
  "action": {
    "primary": "{color.primary.purple}",     // ✅ Core reference
    "primaryHover": "{color.secondary.purple}" // ✅ Separate token, not nested
  }
}
```

**WRONG - Semantic referencing Semantic:**
```json
{
  "text": {
    "error": "{semantic.color.feedback.error}"  // ❌ NEVER DO THIS!
  }
}
```

**CORRECT - Both reference core:**
```json
{
  "text": {
    "error": "{color.primary.red}"  // ✅ Reference core directly
  },
  "feedback": {
    "error": "{color.primary.red}"  // ✅ Reference same core value
  }
}
```

### Component Tokens - ONLY Core References
```json
{
  "background": {
    "primary": "{color.primary.purple}",        // ✅ Core reference ONLY
    "primaryHover": "{color.secondary.purple}", // ✅ Core reference ONLY
    "today": "{color.surface.active}"          // ✅ Core reference ONLY
  }
}
```

**Remember:** Component tokens in semantic folder CANNOT reference semantic tokens!

## Build Configuration

```javascript
// Semantic tokens configuration in build-tokens.js
const tokenSources = [
  // True semantic tokens
  { file: 'tokens/semantic/color.json', prefix: 'semantic.color' },
  { file: 'tokens/semantic/layout.json', prefix: 'semantic.layout' },
  
  // Component tokens (no semantic prefix!)
  { file: 'tokens/semantic/button.json', prefix: 'button' },
  { file: 'tokens/semantic/card.json', prefix: 'card' },
  { file: 'tokens/semantic/tabs.json', prefix: 'tabs' },
  { file: 'tokens/semantic/accordion.json', prefix: 'accordion' },
  { file: 'tokens/semantic/select.json', prefix: 'select' },
  { file: 'tokens/semantic/datepicker.json', prefix: 'datepicker' },
  // ... more components
];
```

## Complete Example: Adding a New Component

### Step 1: Create Component Token File
`tokens/semantic/badge.json`
```json
{
  "background": {
    "default": "{color.surface.hover}",     // Reference CORE only
    "primary": "{color.primary.purple}",    // NOT semantic tokens
    "success": "{color.primary.green}",     // Direct core reference
    "error": "{color.primary.red}"          // Direct core reference
  },
  "text": {
    "default": "{color.primary.neutral}",   // Reference CORE only
    "inverse": "{color.standard.white}"    // NOT semantic.color.text.inverse
  },
  "padding": {
    "default": "{spacing.1} {spacing.2}",
    "compact": "0 {spacing.1}"
  },
  "radius": {
    "default": "{radius.full}"
  }
}
```

### Step 2: Add to Build Config
```javascript
{ file: 'tokens/semantic/badge.json', prefix: 'badge' }
```

### Step 3: Generated CSS
```css
--badge-background-default: #f9fafb;
--badge-background-primary: #8E42EE;
--badge-text-inverse: #ffffff;
--badge-padding-default: 0.25rem 0.5rem;
--badge-radius-default: 9999px;
```

Note: All values are resolved directly from core tokens, no semantic token references in the output!

## Semantic Token Categories Checklist

### True Semantic (`semantic/color.json`)
- [ ] Text colors (primary, secondary, disabled, inverse)
- [ ] Background colors (base, surface, overlay)
- [ ] Action colors (primary, secondary, danger)
- [ ] Border colors (default, subtle, strong, focus)
- [ ] Feedback colors (error, success, warning, info)

### True Semantic (`semantic/layout.json`)
- [ ] Component spacing (padding, gap, margin)
- [ ] Section spacing (padding, gap)
- [ ] Page spacing (padding, maxWidth)
- [ ] Border radius (component, card, button, input, modal)

### Component Tokens (each in `semantic/[component].json`)
- [ ] Background variations
- [ ] Text/foreground colors
- [ ] Border properties
- [ ] Padding/spacing
- [ ] Border radius
- [ ] Shadows (if applicable)

---

*Semantic Layer Naming Guide v1.0*  
*Focus: Semantic layer only, core tokens unchanged*