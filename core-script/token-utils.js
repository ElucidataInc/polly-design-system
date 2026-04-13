// General token utilities and helpers

const { readFileSync } = require('fs');
const { resolve } = require('path');

// Load JSON file
function loadJSON(filePath) {
  const fullPath = resolve(__dirname, '..', filePath);
  return JSON.parse(readFileSync(fullPath, 'utf-8'));
}

// Check if value is a plain object
function isPlainObject(val) {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

// Flatten nested object structure
function flatten(obj, prefix = '') {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const next = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value)) {
      // Check if this is a token group (all values are primitives or token groups)
      const hasNestedObjects = Object.values(value).some((v) => isPlainObject(v));
      if (hasNestedObjects || Object.values(value).every((v) => typeof v === 'string' || typeof v === 'number')) {
        Object.assign(acc, flatten(value, next));
      } else {
        // This is a value object, don't flatten
        acc[next] = JSON.stringify(value);
      }
    } else {
      acc[next] = String(value);
    }
    return acc;
  }, {});
}

// Load and merge token files
function loadTokens(tokenPaths) {
  const tokens = {};

  tokenPaths.forEach(({ file, prefix }) => {
    try {
      const data = flatten(loadJSON(file));
      if (prefix) {
        Object.entries(data).forEach(([key, value]) => {
          tokens[`${prefix}.${key}`] = value;
        });
      } else {
        Object.assign(tokens, data);
      }
    } catch (error) {
      console.error(`
        ---------------------------------------------------
        
        ❌ Error: Could not load ${file}: ${error.message}
        
        ---------------------------------------------------
        `);
    }
  });

  return tokens;
}

// Validate resolved tokens
function validateTokens(resolvedTokens) {
  const unresolvedTokens = [];
  const warnings = [];

  Object.entries(resolvedTokens).forEach(([key, value]) => {
    if (typeof value === 'string') {
      // Check for unresolved references
      if (value.includes('{')) {
        unresolvedTokens.push(`${key}: ${value}`);
      }

      // Check for potential issues
      if (value.includes('undefined') || value.includes('null')) {
        warnings.push(`Potential issue in ${key}: ${value}`);
      }
    }
  });

  return { unresolvedTokens, warnings };
}

// Group tokens by category
function groupTokensByCategory(tokens) {
  const grouped = {};

  Object.entries(tokens).forEach(([key, value]) => {
    const category = key.split('.')[0];
    if (!grouped[category]) {
      grouped[category] = {};
    }
    grouped[category][key] = value;
  });

  return grouped;
}

module.exports = {
  loadJSON,
  isPlainObject,
  flatten,
  loadTokens,
  validateTokens,
  groupTokensByCategory,
};