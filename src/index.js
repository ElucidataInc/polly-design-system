// Export resolved tokens
const tokens = require('../dist/tokens.json');

// Export individual token categories for easier access
const coreTokens = {};
const semanticTokens = {};

// Define semantic token prefixes (all tokens from semantic folder)
const semanticPrefixes = [
  'semantic.', 'button.', 'card.', 'tabs.', 'accordion.', 'select.', 'toggleswitch.',
  'popover.', 'toast.', 'badge.', 'radiobutton.', 'inputtext.', 'datepicker.',
  'tooltip.', 'table.', 'autocomplete.', 'progressbar.', 'skeleton.', 'avatar.',
  'panel.', 'dialog.', 'confirmdialog.', 'progressspinner.', 'password.',
  'textarea.', 'picklist.', 'listbox.', 'carousel.', 'stepper.', 'chip.'
];

// Categorize tokens
Object.keys(tokens).forEach(key => {
  if (key.startsWith('color.') || key.startsWith('spacing.') || 
      key.startsWith('radius.') || key.startsWith('font.') || 
      key.startsWith('elevation.')) {
    coreTokens[key] = tokens[key];
  } else if (semanticPrefixes.some(prefix => key.startsWith(prefix))) {
    semanticTokens[key] = tokens[key];
  }
});

module.exports = {
  // All tokens
  tokens,
  
  // Categorized tokens
  coreTokens,
  semanticTokens,
  
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