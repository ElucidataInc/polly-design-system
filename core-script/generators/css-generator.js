// css-generator.js
// Responsible ONLY for generating CSS output strings

'use strict';

const GOOGLE_FONTS_IMPORT = "https://fonts.googleapis.com/css2?family=Inter:wght@400..900&family=Space+Grotesk:wght@400..900&family=JetBrains+Mono:wght@500";

/**
 * Sanitizes a token key into a normalized identifier.
 *
 * Applies structural identifier sanitization (slug-style normalization):
 * - Converts to lowercase for consistency.
 * - Uses whitelist-based sanitization (allows a–z, 0–9, dot, hyphen).
 * - Replaces invalid characters with hyphens.
 * - Converts dot notation to hyphen-separated format.
 * - Collapses consecutive hyphens into one.
 * - Trims leading and trailing hyphens.
 *
 * This is NOT security escaping (e.g., not XSS or injection protection).
 * It is intended for generating valid style identifiers.
 *
 * @param {string} key - Raw token key
 * @returns {string} Sanitized identifier
 */
function sanitizeTokenKey(key) {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/\.+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Converts a dot-notated token key to a CSS custom property name.
 * Sanitizes the key to ensure valid CSS variable names.
 * 
 * @param {string} key - Dot-notated token key
 * @returns {string} CSS custom property name
 */
function getSanitizeCssVarName(key) {
    return `--${sanitizeTokenKey(key)}`;
}

/**
 * Generates a CSS file containing :root custom properties
 * for all resolved design tokens.
 *
 * @param {Record<string, string>} resolvedTokens - Flat map of token key => value
 * @returns {string} Full CSS file content
 *
 * @example
 * generateCssVariables({ 'color.primary': '#6200ee' })
 * // => "@import url(...)\n:root {\n  --color-primary: #6200ee;\n}\n"
 */
function generateCssVariables(resolvedTokens) {
  if (!resolvedTokens || typeof resolvedTokens !== 'object') {
    throw new TypeError('resolvedTokens must be a non-null object');
  }

  const declarations = Object.entries(resolvedTokens)
    .map(([key, value]) => `  ${getSanitizeCssVarName(key)}: ${value};`)
    .join('\n');

  return [
    `@import url('${GOOGLE_FONTS_IMPORT}');`,
    '',
    ':root {',
    declarations,
    '}',
    '',
  ].join('\n');
}

module.exports = {
  generateCssVariables,
  getSanitizeCssVarName, // exported for reuse in scss-generator
  sanitizeTokenKey, // exported for potential reuse in other generators if needed
};