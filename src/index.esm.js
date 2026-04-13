// ES Module version
import tokens from '../dist/tokens.json' assert { type: 'json' };

// Export individual token categories for easier access
export const coreTokens = {};
export const semanticTokens = {};
export const componentTokens = {};

// Categorize tokens
Object.keys(tokens).forEach(key => {
  if (key.startsWith('color.') || key.startsWith('spacing.') || 
      key.startsWith('radius.') || key.startsWith('font.') || 
      key.startsWith('elevation.')) {
    coreTokens[key] = tokens[key];
  } else if (key.startsWith('semantic.')) {
    semanticTokens[key] = tokens[key];
  } else {
    componentTokens[key] = tokens[key];
  }
});

// Utility functions
export const getToken = (path) => {
  return tokens[path] || null;
};

export const getCSSVariable = (path) => {
  const token = tokens[path];
  if (!token) return null;
  return `var(--${path.replace(/\./g, '-')})`;
};

// Theme utilities
export const createTheme = (overrides = {}) => {
  return { ...tokens, ...overrides };
};

// Export all tokens
export { tokens };

// Default export
export default {
  tokens,
  coreTokens,
  semanticTokens,
  componentTokens,
  getToken,
  getCSSVariable,
  createTheme
};