// Responsible ONLY for generating TypeScript output strings

'use strict';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Converts a flat dot-notated token map into a deeply nested object.
 * This gives consumers a properly typed nested structure in TypeScript.
 *
 * @param {Record<string, string>} flatTokens - e.g. { 'color.primary.bg': '#fff' }
 * @returns {object} Nested object - e.g. { color: { primary: { bg: '#fff' } } }
 *
 * @example
 * buildNestedObject({ 'a.b.c': '1', 'a.b.d': '2' })
 * // => { a: { b: { c: '1', d: '2' } } }
 */
function buildNestedObject(flatTokens) {
  const result = {};

  for (const [key, value] of Object.entries(flatTokens)) {
    const segments = key.split('.');
    let cursor = result;

    // Walk all segments except the last, creating objects as needed
    for (let i = 0; i < segments.length - 1; i++) {
      const segment = segments[i];
      if (cursor[segment] === undefined) {
        cursor[segment] = {};
      }
      cursor = cursor[segment];
    }

    // Set the leaf value
    cursor[segments[segments.length - 1]] = value;
  }

  return result;
}

// ---------------------------------------------------------------------------
// Public generators
// ---------------------------------------------------------------------------

/**
 * Generates a TypeScript constants file with a fully typed, nested token object.
 *
 * @param {Record<string, string>} resolvedTokens - Flat map of token key => value
 * @returns {string} Full TypeScript file content
 *
 * @example
 * generateTypeScriptConstants({ 'color.primary': '#6200ee' })
 * // => "export const designTokens = { color: { primary: '#6200ee' } } as const;\n..."
 */
function generateTypeScriptConstants(resolvedTokens) {
  if (!resolvedTokens || typeof resolvedTokens !== 'object') {
    throw new TypeError('resolvedTokens must be a non-null object');
  }

  const nested = buildNestedObject(resolvedTokens);

  // Indent the JSON body to align with the `export const` wrapper
  const jsonBody = JSON.stringify(nested, null, 2)
    .split('\n')
    .map((line, index) => (index === 0 ? line : `  ${line}`))
    .join('\n');

  return [
    '// Generated TypeScript token constants',
    '// Do not edit manually — regenerate via the token build pipeline.',
    '',
    `export const designTokens = ${jsonBody} as const;`,
    '',
    '// Derive the type automatically from the const so it stays in sync',
    'export type DesignTokens = typeof designTokens;',
    '',
  ].join('\n');
}

module.exports = {
  generateTypeScriptConstants,
  buildNestedObject, // exported for unit testing
};