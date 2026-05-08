// Responsible ONLY for generating SCSS output strings
'use strict';

const { sanitizeTokenKey } = require('./css-generator');

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Converts a dot-notated token key to a SCSS variable name.
 * Sanitizes the key to ensure valid SCSS variable names.
 *
 * @param {string} key - Dot-notated token key
 * @returns {string} SCSS variable name
 */
function toScssVarName(key) {
  return `$${sanitizeTokenKey(key)}`;
}

// ---------------------------------------------------------------------------
// SCSS mixins / helpers block
// This is a static string — extracted so it can be tested independently
// ---------------------------------------------------------------------------

/**
 * Returns the static SCSS helpers block (functions + mixins).
 * Kept as a pure string-returning function so callers can compose it
 * with generated variable blocks.
 *
 * @returns {string} SCSS helper content
 */
function generateScssHelpers() {
  return `// Generated SCSS helper functions and mixins

// ── Color helpers ──────────────────────────────────────────────────────────

@function color-mix($color1, $percent1, $color2, $percent2: 100 - $percent1) {
  @return mix($color2, $color1, $percent2);
}

@function shade($color, $percent) {
  @return darken($color, $percent);
}

@function tint($color, $percent) {
  @return lighten($color, $percent);
}

// ── Color mixins ───────────────────────────────────────────────────────────

@mixin add-color($property-name, $color) {
  #{$property-name}: $color;
}

@mixin add-color-mix($property, $color1, $percent1, $color2, $percent2) {
  #{$property}: color-mix($color1, $percent1, $color2, $percent2);
}

// ── Transition / shadow / radius ───────────────────────────────────────────

@mixin transition($transition...) {
  -moz-transition:    $transition;
  -o-transition:      $transition;
  -webkit-transition: $transition;
  transition:         $transition;
}

@mixin shadow($value) {
  -moz-box-shadow:    $value;
  -webkit-box-shadow: $value;
  box-shadow:         $value;
}

@mixin border-radius($val) {
  -moz-border-radius:    $val;
  -webkit-border-radius: $val;
  border-radius:         $val;
}

@mixin border-radius-right($val) {
  -moz-border-radius-bottomright:    $val;
  -moz-border-radius-topright:       $val;
  -webkit-border-bottom-right-radius: $val;
  -webkit-border-top-right-radius:    $val;
  border-bottom-right-radius:         $val;
  border-top-right-radius:            $val;
}

@mixin border-radius-left($val) {
  -moz-border-radius-bottomleft:    $val;
  -moz-border-radius-topleft:       $val;
  -webkit-border-bottom-left-radius: $val;
  -webkit-border-top-left-radius:    $val;
  border-bottom-left-radius:         $val;
  border-top-left-radius:            $val;
}

@mixin border-radius-top($val) {
  -moz-border-radius-topleft:     $val;
  -moz-border-radius-topright:    $val;
  -webkit-border-top-left-radius:  $val;
  -webkit-border-top-right-radius: $val;
  border-top-left-radius:          $val;
  border-top-right-radius:         $val;
}

@mixin border-radius-bottom($val) {
  -moz-border-radius-bottomleft:      $val;
  -moz-border-radius-bottomright:     $val;
  -webkit-border-bottom-left-radius:  $val;
  -webkit-border-bottom-right-radius: $val;
  border-bottom-left-radius:          $val;
  border-bottom-right-radius:         $val;
}

// ── Typography ─────────────────────────────────────────────────────────────

@mixin typography(
  $fontFamily,
  $fontSize,
  $fontWeight,
  $lineHeight,
  $letterSpacing,
  $textAlign: null
) {
  font-family:    $fontFamily    !important;
  font-size:      $fontSize      !important;
  font-weight:    $fontWeight    !important;
  line-height:    $lineHeight    !important;
  letter-spacing: $letterSpacing !important;

  @if $textAlign != null {
    text-align: $textAlign !important;
  }
}

// ── Input states ───────────────────────────────────────────────────────────

@mixin focused-input {
  @include shadow($inputFocusShadow);
  border-color: $inputFocusBorderColor;
  outline: 0 none;
}

@mixin disabled-input {
  background-color: $inputDisabledBgColor;
  border-color:     $inputDisabledBorderColor;
  color:            $inputDisabledTextColor;
  cursor:           default !important;
  pointer-events:   none;
}

// ── Misc ───────────────────────────────────────────────────────────────────

@mixin polly-icon-override($icon) {
  &:before {
    content:     $icon;
    font-family: 'iconset';
  }
}

@mixin appearance($val) {
  -moz-appearance:    $val;
  -webkit-appearance: $val;
  appearance:         $val;
}

@mixin opacity($opacity) {
  $opacity-ie: $opacity * 100;
  filter:  alpha(opacity=$opacity-ie);
  opacity: $opacity;
}

@mixin placeholder {
  ::-webkit-input-placeholder { @content; }
  :-moz-placeholder            { @content; }
  ::-moz-placeholder           { @content; }
  :-ms-input-placeholder       { @content; }
}

@mixin rotate($deg) {
  -moz-transform:    rotate($deg);
  -ms-transform:     rotate($deg);
  -o-transform:      rotate($deg);
  -webkit-transform: rotate($deg);
  transform:         rotate($deg);
}

@mixin scale($deg) {
  -moz-transform:    scale($deg);
  -ms-transform:     scale($deg);
  -o-transform:      scale($deg);
  -webkit-transform: scale($deg);
  transform:         scale($deg);
}

@mixin translate-x($deg) {
  -ms-transform:     translateX($deg);
  -webkit-transform: translateX($deg);
  transform:         translateX($deg);
}
`;
}

// ---------------------------------------------------------------------------
// Public generators
// ---------------------------------------------------------------------------

/**
 * Generates a full SCSS variables file including helpers and token variables.
 *
 * @param {Record<string, string>} resolvedTokens - Flat map of token key => value
 * @returns {string} Full SCSS file content
 */
function generateScssVariables(resolvedTokens) {
  if (!resolvedTokens || typeof resolvedTokens !== 'object') {
    throw new TypeError('resolvedTokens must be a non-null object');
  }

  const variableLines = Object.entries(resolvedTokens)
    .map(([key, value]) => `${toScssVarName(key)}: ${value};`)
    .join('\n');

  return [
    generateScssHelpers(),
    '// Generated SCSS variables',
    variableLines,
    '',
  ].join('\n');
}

/**
 * Generates the main SCSS entry file that imports the CSS variables file.
 * This file is static — it never changes based on token values.
 *
 * @returns {string} SCSS import file content
 */
function generateMainScss() {
  return `// Main SCSS file — imports design tokens
//
// Usage in your own SCSS files:
//   @import '@design-tokens/dist/tokens.scss';
//
// Then use CSS custom properties anywhere:
//   .my-component {
//     background:    var(--color-primary-purple);
//     border-radius: var(--card-base-radius-default);
//   }

// Import the generated CSS custom properties
@import './css-variables.min.css';

// CSS custom properties are now globally available in all SCSS files.
// PrimeNG theme components will pick them up automatically.
`;
}
/**
 * Generates a scoped SCSS partial for a single component's tokens.
 * Case-insensitive component name matching.
 *
 * @param {string} componentName           - Component namespace prefix (e.g. "button")
 * @param {Record<string, string>} tokens  - Full flat token map
 * @returns {string} Component-scoped SCSS partial content
 */
function generateComponentScss(componentName, tokens) {
  if (!componentName || typeof componentName !== 'string') {
    throw new TypeError('componentName must be a non-empty string');
  }

  if (!tokens || typeof tokens !== 'object') {
    throw new TypeError('tokens must be a non-null object');
  }

  // Normalize component name to lowercase for consistent matching
  const normalizedComponentName = componentName.toLowerCase();
  const prefix = `${normalizedComponentName}.`;

  const variableLines = Object.entries(tokens)
    .filter(([key]) => key.toLowerCase().startsWith(prefix))
    .map(([key, value]) => {
      // Extract the part after the component prefix
      const keyLower = key.toLowerCase();
      const strippedKey = key.slice(keyLower.indexOf(prefix) + prefix.length);
      
      // Sanitize the variable name
      const varName = `${normalizedComponentName}-${sanitizeTokenKey(strippedKey)}`;
      
      return `$${varName}: ${value};`;
    })
    .join('\n');

  return [
    `// Generated ${componentName} component tokens`,
    `// Usage: @import 'path/to/${normalizedComponentName}-tokens';`,
    '',
    variableLines,
    '',
  ].join('\n');
}
module.exports = {
  generateScssHelpers,
  generateScssVariables,
  generateMainScss,
  generateComponentScss,
  toScssVarName, // exported for potential reuse
};