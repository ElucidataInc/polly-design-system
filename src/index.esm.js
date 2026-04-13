// ES Module version
import tokens from '../dist/tokens.json' assert { type: 'json' };

// Export individual token categories for easier access
export const coreTokens = {};
export const semanticTokens = {};

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
  getToken,
  getCSSVariable,
  createTheme
};