// Export resolved tokens
const tokens = require('../dist/tokens.json');

// Export individual token categories for easier access
const coreTokens = {};
const semanticTokens = {};
const componentTokens = {};

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

module.exports = {
  // All tokens
  tokens,
  
  // Categorized tokens
  coreTokens,
  semanticTokens,
  componentTokens,
  
  // Utility functions
  getToken: (path) => {
    return tokens[path] || null;
  },
  
  getCSSVariable: (path) => {
    const token = tokens[path];
    if (!token) return null;
    return `var(--${path.replace(/\./g, '-')})`;
  },
  
  // Theme utilities
  createTheme: (overrides = {}) => {
    return { ...tokens, ...overrides };
  }
};

// Also export as named exports for ES modules
module.exports.default = module.exports;