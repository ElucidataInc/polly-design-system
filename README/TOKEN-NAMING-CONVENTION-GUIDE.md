# 📐 Design Token Naming Convention Guide

## Table of Contents
- [Overview](#overview)
- [Core Principles](#core-principles)
- [Naming Structure](#naming-structure)
- [Layer Definitions](#layer-definitions)
- [Token Categories](#token-categories)
- [Naming Rules & Best Practices](#naming-rules--best-practices)
- [State Modifiers](#state-modifiers)
- [Component Examples](#component-examples)
- [Migration Guide](#migration-guide)
- [Quick Reference](#quick-reference)
- [Common Pitfalls](#common-pitfalls)

## Overview

This guide defines the standardized naming convention for our design token system using a **simplified 2-layer architecture** where component tokens live within the semantic layer. This approach is optimal for projects without multi-brand complexity or extensive component libraries. These conventions ensure consistency, scalability, and maintainability across all web platforms (Angular, React, Next.js).

### 🔒 Core Tokens are IMMUTABLE
> **⚠️ CRITICAL**: Our core token names are FINAL and CANNOT be changed. They follow a unique naming pattern (e.g., `--color-primary-purple`, `--font-size-body-large`) rather than typical scale conventions. All semantic and component tokens must reference these exact token names.

### Why Naming Conventions Matter
- **Developer Experience**: Predictable names improve productivity
- **Debugging**: Clear names in browser DevTools
- **Scalability**: Systematic approach for growth
- **Consistency**: Unified language across teams
- **Automation**: Enables tooling and validation

## Core Principles

### 1. Predictability
Developers should be able to guess token names intuitively.

### 2. Hierarchy
Names should reflect the token's position in the system hierarchy.

### 3. Semantics
Names describe purpose and intent, not visual appearance.

### 4. Consistency
Same patterns applied across all token types.

### 5. Platform Agnostic
Names work across all web frameworks without modification.

## Naming Structure

### Base Pattern
NOTE: ALL THE TOKEN NAME SHOULD BE IN SMALLER CASE  
```
[layer]-[category]-[element]-[property]-[variant]-[state]
```

### CSS Variable Format
```css
/* Core tokens (prefix optional) */
--color-purple-500  OR  --core-color-purple-500

/* Semantic tokens (true semantic) */
--semantic-color-text-primary

/* Component tokens (in semantic folder, no semantic prefix) */
--button-background-primary-hover
--card-border-radius
```

### Rules
- **Lowercase only**: No uppercase letters
- **Hyphen delimited**: Use hyphens between segments
- **Left to right specificity**: Generic → Specific
- **Maximum 6 segments**: Keep names manageable
- **No abbreviations**: Use full, clear words

### Examples (With Your Actual Tokens)
```css
--color-primary-purple                     /* Core layer (IMMUTABLE), primary purple */
--semantic-color-text-primary              /* Semantic layer, text use, primary variant */
--button-background-primary-hover          /* Component tokens (in semantic folder), no semantic prefix */
```

## Layer Definitions (2-Layer Architecture)

> **Why This Approach?** Component tokens are kept in the semantic folder but use their component name as prefix (not `semantic-`). This provides the right balance of organization without over-engineering.

### 1. Core Layer (Primitives) - IMMUTABLE
🔒 **These token names are FINAL and CANNOT be changed.**

**Prefix:** No prefix (e.g., `color-`, `spacing-`, `font-`)  
**Folder:** `tokens/core/`  
**Purpose:** Store raw, context-free values  
**References:** None (these are the source values)

> **⚠️ IMPORTANT**: All semantic and component tokens must reference these exact token names. The naming pattern is unique and does not follow typical scale conventions (no color-500, color-600, etc.)

#### Pattern (Your Actual Structure)
```css
--[category]-[variant]-[name]  /* Your actual pattern */

Examples:
--color-primary-purple
--color-neutral-blue
--spacing-4
--font-size-body-large
```

#### Examples (Your Actual Core Tokens)
```css
/* Colors - IMMUTABLE */
--color-primary-purple    /* #8E42EE */
--color-primary-neutral   /* #808080 */
--color-secondary-purple  /* #936DC3 */
--color-neutral-purple    /* #968AA6 */
--color-standard-white    /* #ffffff */
--color-surface-hover     /* #f8f5ff */

/* Spacing - IMMUTABLE */
--spacing-0     /* 0 */
--spacing-1     /* 0.25rem */
--spacing-2     /* 0.5rem */
--spacing-4     /* 1rem */
--spacing-8     /* 2rem */

/* Typography - IMMUTABLE */
--font-family-inter        /* 'Inter', sans-serif */
--font-size-body-large     /* 1rem */
--font-size-label-large    /* 0.875rem */
--font-weight-normal       /* 400 */
--font-weight-bold         /* 700 */

/* Border Radius - IMMUTABLE */
--radius-none   /* 0 */
--radius-sm     /* 0.25rem */
--radius-md     /* 0.375rem */
--radius-lg     /* 0.5rem */
--radius-full   /* 9999px */

/* Elevation - IMMUTABLE */
--elevation-none   /* none */
--elevation-sm     /* 0 1px 2px 0 rgba(0, 0, 0, 0.05) */
--elevation-md     /* 0 4px 6px -1px rgba(0, 0, 0, 0.1) */
--elevation-lg     /* 0 10px 15px -3px rgba(0, 0, 0, 0.1) */
```

### 2. Semantic Layer (Aliases)
Intent-based tokens that reference core tokens and define purpose.

**Prefix:** `semantic-`  
**Purpose:** Abstract design decisions from raw values  
**References:** Core tokens only

#### Pattern
```css
--semantic-[category]-[intent]-[variant]-[state]
```

#### Examples
```css
/* Text Colors */
--semantic-color-text-primary      /* Main text color */
--semantic-color-text-secondary    /* Supporting text */
--semantic-color-text-disabled     /* Disabled state text */
--semantic-color-text-inverse      /* Text on dark backgrounds */
--semantic-color-text-error        /* Error messages */

/* Background Colors */
--semantic-color-background-base       /* Main background */
--semantic-color-background-surface    /* Card/Panel backgrounds */
--semantic-color-background-overlay    /* Modal overlays */
--semantic-color-background-disabled   /* Disabled backgrounds */

/* Action Colors */
--semantic-color-action-primary          /* Primary CTAs */
--semantic-color-action-primary-hover    /* Primary CTA hover */
--semantic-color-action-secondary        /* Secondary actions */
--semantic-color-action-danger           /* Destructive actions */

/* Feedback Colors */
--semantic-color-feedback-error      /* Error states */
--semantic-color-feedback-success    /* Success states */
--semantic-color-feedback-warning    /* Warning states */
--semantic-color-feedback-info       /* Informational states */

/* Border Colors */
--semantic-color-border-default      /* Standard borders */
--semantic-color-border-subtle       /* Light borders */
--semantic-color-border-strong       /* Emphasized borders */
--semantic-color-border-error        /* Error state borders */

/* Layout Spacing */
--semantic-spacing-component-padding    /* Standard component padding */
--semantic-spacing-component-gap        /* Space between elements */
--semantic-spacing-section-margin       /* Section spacing */
--semantic-spacing-page-padding         /* Page-level padding */
```

### 3. Component Tokens (Within Semantic Layer)
Component-specific tokens that live in the semantic folder but maintain their own naming convention.

**No semantic prefix** (component name serves as prefix)  
**Folder:** `tokens/semantic/[component].json`  
**Purpose:** Define component-specific design decisions  
**References:** Core tokens and semantic tokens  

> **Note:** Although stored in `tokens/semantic/`, component tokens don't use the `semantic-` prefix. They use their component name directly (e.g., `button-`, `card-`, `datepicker-`)

#### Pattern
```css
--[component]-[element]-[property]-[variant]-[state]
```

#### Examples
```css
/* Button Component */
--button-background-primary
--button-background-primary-hover
--button-background-primary-active
--button-background-primary-disabled
--button-background-secondary
--button-text-primary
--button-text-secondary
--button-border-secondary
--button-padding-sm
--button-padding-md
--button-padding-lg
--button-radius-default

/* Card Component */
--card-background-default
--card-background-hover
--card-border-color
--card-border-width
--card-border-radius
--card-shadow-default
--card-shadow-hover
--card-padding-default
--card-padding-compact

/* Input Component */
--input-background-default
--input-background-disabled
--input-border-default
--input-border-focus
--input-border-error
--input-text-default
--input-text-placeholder
--input-padding-default
--input-radius-default
```

## Token Categories

### Color Tokens
Represent all color values in the system.

#### Core Layer Structure
```json
{
  "color": {
    "[family]": {
      "[scale]": "[hex-value]"
    }
  }
}
```

#### Semantic Layer Structure
```json
{
  "color": {
    "[intent]": {
      "[variant]": "{reference}"
    }
  }
}
```

### Spacing Tokens
Define consistent spacing throughout the system.

#### Scale System
- Use T-shirt sizes (xs, sm, md, lg, xl) for semantic tokens
- Use numeric scale (0, 1, 2, 4, 8, 16) for core tokens
- Based on 4px/0.25rem base unit

```css
--spacing-0: 0;
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-4: 1rem;     /* 16px */
--spacing-8: 2rem;     /* 32px */
```

### Typography Tokens (Your Actual Tokens)
Typography-related values with unique naming patterns.

```css
/* Font Families - IMMUTABLE */
--font-family-inter      /* 'Inter', sans-serif */
--font-family-grotesk    /* 'Space Grotesk', sans-serif */
--font-family-jetbrains  /* 'JetBrains Mono', monospace */
--font-family-base       /* 'Inter', sans-serif */

/* Font Sizes - Semantic Categories */
--font-size-display-large   /* 3.375rem */
--font-size-headline-large  /* 2rem */
--font-size-title-large     /* 1.375rem */
--font-size-body-large      /* 1rem */
--font-size-label-large     /* 0.875rem */

/* Font Weights - IMMUTABLE */
--font-weight-normal      /* 400 */
--font-weight-extrathick  /* 450 */
--font-weight-medium      /* 500 */
--font-weight-semibold    /* 600 */
--font-weight-bold        /* 700 */

/* Line Heights (as font-height) */
--font-height-body-large    /* 1.75rem */
--font-height-label-large   /* 1.25rem */
```

### Border Radius Tokens (Your Actual Tokens)
Corner radius values for rounded elements.

```css
/* IMMUTABLE Core Radius Tokens */
--radius-none   /* 0 */
--radius-sm     /* 0.25rem - 4px */
--radius-md     /* 0.375rem - 6px */
--radius-lg     /* 0.5rem - 8px */
--radius-xl     /* 0.75rem - 12px */
--radius-2xl    /* 1rem - 16px */
--radius-full   /* 9999px - Fully rounded */
```

### Elevation Tokens (Your Actual Tokens)
Shadow values for depth and hierarchy.

```css
/* IMMUTABLE Core Elevation Tokens */
--elevation-none  /* none */
--elevation-sm    /* 0 1px 2px 0 rgba(0, 0, 0, 0.05) */
--elevation-md    /* 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) */
--elevation-lg    /* 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) */
--elevation-xl    /* 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) */
```

## Naming Rules & Best Practices

### ✅ DO's

#### 1. Use Semantic Names Over Visual Descriptions
```css
/* Good */
--semantic-color-action-primary
--semantic-color-text-secondary

/* Avoid */
--semantic-color-purple
--semantic-color-light-gray
```

#### 2. Place States at the End
```css
/* Good */
--button-background-primary-hover
--input-border-error

/* Avoid */
--button-hover-background-primary
--input-error-border
```

#### 3. Use Consistent State Names
```css
/* Standard states */
default, hover, active, focus, disabled

/* Selection states */
selected, checked, indeterminate

/* Validation states */
error, success, warning, info

/* Interaction states */
pressed, dragging, loading
```

#### 4. Keep Names Concise but Clear
```css
/* Good */
--card-border-radius
--button-padding-sm

/* Avoid */
--card-container-border-radius-value
--button-small-padding-horizontal
```

#### 5. Use Scale Values Consistently
```css
/* Size scales */
xs, sm, md, lg, xl, 2xl, 3xl

/* Numeric scales */
50, 100, 200, 300, 400, 500, 600, 700, 800, 900

/* Spacing scales */
0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24
```

### ❌ DON'Ts

#### 1. Don't Use Color Names in Semantic Tokens
```css
/* Wrong */
--semantic-color-purple-primary
--semantic-color-gray-text

/* Correct */
--semantic-color-action-primary
--semantic-color-text-primary
```

#### 2. Don't Mix Naming Conventions
```css
/* Wrong */
--button_primary-Background
--Card-Border_default
--input--text__color

/* Correct */
--button-background-primary
--card-border-default
--input-text-color
```

#### 3. Don't Tokenize CSS Properties
```css
/* Wrong - These should NOT be tokens */
--accordion-display-flex
--card-position-relative
--button-cursor-pointer

/* These are implementation details, not design tokens */
```

#### 4. Don't Use Abbreviations
```css
/* Wrong */
--btn-bg-pri
--crd-bdr-rad
--inp-txt-clr

/* Correct */
--button-background-primary
--card-border-radius
--input-text-color
```

#### 5. Don't Create Overly Nested Names
```css
/* Wrong */
--component-card-container-content-header-title-text-color

/* Correct */
--card-title-color
```

## State Modifiers

### Standard Interaction States
Applied to interactive elements like buttons, inputs, and links.

```css
--[token]-default     /* Normal state (often implied) */
--[token]-hover       /* Mouse hover */
--[token]-active      /* Being clicked/pressed */
--[token]-focus       /* Keyboard focus */
--[token]-disabled    /* Non-interactive state */
```

### Selection States
For elements that can be selected or checked.

```css
--[token]-selected     /* Item is selected */
--[token]-checked      /* Checkbox/radio checked */
--[token]-indeterminate /* Partial selection */
```

### Validation States
For form inputs and feedback messages.

```css
--[token]-error       /* Error/invalid state */
--[token]-success     /* Success/valid state */
--[token]-warning     /* Warning state */
--[token]-info        /* Informational state */
```

### Loading States
For async operations.

```css
--[token]-loading     /* Loading/processing */
--[token]-skeleton    /* Skeleton screen state */
```

### Example State Application
```css
/* Button states */
--button-background-primary          /* Default implied */
--button-background-primary-hover
--button-background-primary-active
--button-background-primary-focus
--button-background-primary-disabled

/* Input validation states */
--input-border-default
--input-border-error
--input-border-success
--input-border-focus
```

## Component Examples

### Button Component
```css
/* Background */
--button-background-primary
--button-background-primary-hover
--button-background-secondary
--button-background-danger

/* Text */
--button-text-primary
--button-text-secondary
--button-text-disabled

/* Border */
--button-border-secondary
--button-border-focus

/* Layout */
--button-padding-sm
--button-padding-md
--button-padding-lg
--button-radius-default
--button-min-width-default
```

### Card Component
```css
/* Background */
--card-background-default
--card-background-hover
--card-background-selected

/* Border */
--card-border-color
--card-border-width
--card-border-radius
--card-border-style

/* Shadow */
--card-shadow-default
--card-shadow-hover
--card-shadow-active

/* Spacing */
--card-padding-default
--card-padding-compact
--card-gap-default
```

### Form Input Component
```css
/* Background */
--input-background-default
--input-background-disabled
--input-background-readonly

/* Border */
--input-border-default
--input-border-hover
--input-border-focus
--input-border-error
--input-border-success

/* Text */
--input-text-default
--input-text-placeholder
--input-text-disabled
--input-text-error

/* Layout */
--input-padding-default
--input-radius-default
--input-height-sm
--input-height-md
--input-height-lg
```

### Datepicker Component
```css
/* Panel */
--datepicker-panel-background
--datepicker-panel-border
--datepicker-panel-radius
--datepicker-panel-shadow

/* Calendar Days */
--datepicker-day-background-default
--datepicker-day-background-hover
--datepicker-day-background-selected
--datepicker-day-background-today
--datepicker-day-background-disabled

/* Text */
--datepicker-day-text-default
--datepicker-day-text-selected
--datepicker-day-text-disabled
--datepicker-day-text-weekend

/* Navigation */
--datepicker-nav-background
--datepicker-nav-background-hover
--datepicker-nav-icon-color
```

## Migration Guide

### From Current to Recommended

#### Phase 1: Add Layer Prefixes
Identify which layer each token belongs to and add appropriate prefix.

**Your tokens are already correct - no migration needed:**
```css
/* Your IMMUTABLE tokens */
--color-primary-purple   /* ✓ Correct as-is */
--spacing-4              /* ✓ Correct as-is */
--font-size-body-large   /* ✓ Correct as-is */
```

**Note:** Your core tokens don't need prefixes and follow a unique naming pattern that should NOT be changed.

#### Phase 2: Standardize Property Names
Use full, descriptive property names consistently.

**Current:**
```css
--button-bg-primary
--card-bg-hover
--input-ph-color
```

**Recommended:**
```css
--button-background-primary
--card-background-hover
--input-placeholder-color
```

#### Phase 3: Reorganize State Modifiers
Move states to the end of token names.

**Current:**
```css
--button-hover-background
--input-focus-border
--card-active-shadow
```

**Recommended:**
```css
--button-background-hover
--input-border-focus
--card-shadow-active
```

#### Phase 4: Remove Non-Token Properties
Eliminate CSS properties that shouldn't be tokens.

**Remove these entirely:**
```css
--accordion-display
--card-position
--button-cursor
--input-box-sizing
```

These are implementation details, not design decisions.

### Migration Mapping Table

| Current Pattern | New Pattern | Example |
|-----------------|-------------|---------|
| Your tokens are already correct | No change needed | `--color-primary-purple` ✓ Already correct |
| `--semantic-color-[use]` | `--semantic-color-[use]` | No change needed |
| `--[component]-[prop]-[state]` | `--[component]-[property]-[state]` | `--button-bg-hover` → `--button-background-hover` |
| `--[component]-[state]-[prop]` | `--[component]-[property]-[state]` | `--button-hover-bg` → `--button-background-hover` |
| `--[abbr]-[prop]` | `--[full-name]-[property]` | `--btn-bg` → `--button-background` |

### Validation Checklist

Before migration:
- [ ] Audit all existing tokens
- [ ] Identify layer for each token
- [ ] Map abbreviations to full names
- [ ] List CSS properties to remove

During migration:
- [ ] Update token source files (JSON)
- [ ] Regenerate CSS variables
- [ ] Update component references
- [ ] Test in browser

After migration:
- [ ] Verify all components render correctly
- [ ] Update documentation
- [ ] Communicate changes to team
- [ ] Set up linting rules

## Quick Reference

### Token Formula (2-Layer System)

```css
/* Core Layer - Your IMMUTABLE tokens */
--[category]-[variant]-[name]        /* Your pattern */
--color-primary-purple
--spacing-4
--font-size-body-large

/* Semantic Layer - True Semantics */
--semantic-[category]-[intent]-[variant]-[state]
--semantic-color-text-primary
--semantic-color-action-primary-hover
--semantic-spacing-component-padding

/* Component Tokens (in semantic folder, no semantic prefix) */
--[component]-[element]-[property]-[variant]-[state]
--button-background-primary-hover
--card-border-radius
--datepicker-day-background-selected
```

### Folder Structure
```
tokens/
├── core/           # Raw values
│   ├── color.json
│   ├── spacing.json
│   └── radius.json
└── semantic/       # Semantic + Components
    ├── color.json  # True semantic colors
    ├── layout.json # True semantic layout
    ├── button.json # Component (no semantic prefix)
    ├── card.json   # Component (no semantic prefix)
    └── datepicker.json # Component (no semantic prefix)
```

### Common Token Patterns

```css
/* Colors */
--[layer]-color-[purpose]-[variant]-[state]

/* Spacing */
--[layer]-spacing-[scale]

/* Typography */
--[layer]-font-[property]-[scale]

/* Borders */
--[layer]-border-[property]-[variant]

/* Shadows */
--[layer]-shadow-[intensity]
```

### State Suffix Order
When multiple states apply, use this order:
1. Variant (primary, secondary)
2. Size (sm, md, lg)
3. Interaction state (hover, active, focus)

Example: `--button-background-primary-lg-hover`

## Common Pitfalls

### Pitfall 1: Mixing Layers
**Problem:** Referencing core tokens directly in components
```json
// Wrong - This token doesn't exist in your system
{
  "button": {
    "background": "{core.color.purple.500}"  // No such token!
  }
}
```

**Solution:** Reference semantic tokens instead
```json
// Correct - But remember your rule: semantic folder can't reference semantic
{
  "button": {
    "background": "{color.primary.purple}"  // Direct core reference
  }
}
```

### Pitfall 2: Hardcoding Values
**Problem:** Using raw values instead of token references
```json
// Wrong
{
  "card": {
    "padding": "1rem"
  }
}
```

**Solution:** Reference existing tokens
```json
// Correct - Using your actual token
{
  "card": {
    "padding": "{spacing.4}"  // Your actual spacing token
  }
}
```

### Pitfall 3: Inconsistent Naming
**Problem:** Using different patterns for similar tokens
```css
/* Wrong - Inconsistent */
--button-bg-primary
--card-background-default
--input-backgroundColor-normal
```

**Solution:** Use consistent property names
```css
/* Correct - Consistent */
--button-background-primary
--card-background-default
--input-background-default
```

### Pitfall 4: Over-Tokenizing
**Problem:** Creating tokens for everything
```css
/* Wrong - Too granular */
--button-text-transform-uppercase
--card-display-flex
--input-outline-none
```

**Solution:** Only tokenize design decisions, not CSS mechanics
```css
/* Correct - Design decisions only */
--button-text-color
--card-padding
--input-border-width
```

### Pitfall 5: Unclear Semantic Names
**Problem:** Semantic names that don't convey purpose
```css
/* Wrong - Vague */
--semantic-color-special
--semantic-spacing-misc
```

**Solution:** Use clear, purposeful names
```css
/* Correct - Clear purpose */
--semantic-color-action-primary
--semantic-spacing-component-padding
```

## Appendix: Complete Token List Template

### Core Tokens Checklist
```
□ Colors (50-900 scale for each family)
  □ Gray
  □ Primary brand color
  □ Supporting colors
□ Spacing (0-24 scale)
□ Typography
  □ Font families
  □ Font sizes (xs-3xl)
  □ Font weights (normal, medium, semibold, bold)
  □ Line heights (tight, normal, relaxed)
□ Border radius (none, sm, md, lg, xl, 2xl, full)
□ Shadows/Elevation (none, sm, md, lg, xl)
□ Transitions (fast, base, slow)
□ Z-index (dropdown, modal, popover, tooltip)
```

### Semantic Tokens Checklist
```
□ Colors
  □ Text (primary, secondary, disabled, inverse)
  □ Background (base, surface, overlay)
  □ Border (default, subtle, strong)
  □ Action (primary, secondary, danger)
  □ Feedback (error, success, warning, info)
□ Spacing
  □ Component (padding, gap, margin)
  □ Layout (section, page, container)
□ Typography
  □ Heading (h1-h6 equivalents)
  □ Body (default, small, large)
  □ Label (default, required, optional)
```

### Component Tokens Checklist
```
□ Button
□ Card
□ Input/TextField
□ Select/Dropdown
□ Checkbox/Radio
□ Modal/Dialog
□ Tabs
□ Accordion
□ Table
□ Navigation
□ Badge/Tag
□ Toast/Alert
□ Tooltip/Popover
□ Progress/Loading
□ Avatar
```

---

## 🔒 Core Token Reference (Quick Lookup)

### Your Immutable Core Tokens
These are the ONLY core tokens available. Reference them exactly as shown:

```json
// Color tokens
"{color.primary.purple}"      // #8E42EE
"{color.primary.neutral}"     // #808080
"{color.secondary.purple}"    // #936DC3
"{color.neutral.purple}"      // #968AA6
"{color.standard.white}"      // #ffffff
"{color.surface.hover}"       // #f8f5ff

// Spacing tokens
"{spacing.0}" through "{spacing.16}"

// Font tokens
"{font.size.body.large}"      // 1rem
"{font.size.label.large}"     // 0.875rem
"{font.weight.normal}"        // 400

// Radius tokens
"{radius.sm}", "{radius.md}", "{radius.lg}"

// Elevation tokens
"{elevation.sm}", "{elevation.md}", "{elevation.lg}"
```

**Remember:** These names cannot be changed. They don't follow typical conventions (like color-500) but are your established system.

## Version History

- **v1.0.0** (Current) - Initial naming convention guide with immutable core tokens
- Future: Add theme-specific naming patterns
- Future: Add responsive token naming patterns
- Future: Add motion/animation token patterns

---

*Last Updated: February 2024*  
*Maintained by: Design System Team*