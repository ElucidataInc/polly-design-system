const fs = require('fs');
const path = require('path');
const { resolve } = require('path');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(PROJECT_ROOT, 'dist');
const BUILD_DIR = path.resolve(PROJECT_ROOT, 'build');

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

console.log('📦 Building NPM package...');

// Copy built files
const filesToCopy = [
  { src: path.join(BUILD_DIR, 'css-variables.min.css'), dest: 'css-variables.css' },
  { src: path.join(BUILD_DIR, 'mixins.scss'), dest: 'mixins.scss' },
  { src: path.join(PROJECT_ROOT, 'src/index.js'), dest: 'index.js' },
  { src: path.join(PROJECT_ROOT, 'src/index.esm.js'), dest: 'index.esm.js' },
  { src: path.join(PROJECT_ROOT, 'src/index.d.ts'), dest: 'index.d.ts' }
];

filesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(DIST_DIR, dest));
    console.log(`   ✓ Copied ${dest}`);
  } else {
    console.warn(`   ⚠️  Warning: ${src} not found`);
  }
});

// Load and consolidate all tokens
const tokenUtils = require('../core-script/token-utils');
const tokenResolverV2 = require('../core-script/token-resolver-v2');

const TOKEN_SOURCES = [
  // Core tokens
  { file: 'tokens/core/color.json', prefix: 'color' },
  { file: 'tokens/core/spacing.json', prefix: 'spacing' },
  { file: 'tokens/core/radius.json', prefix: 'radius' },
  { file: 'tokens/core/font.json', prefix: 'font' },
  { file: 'tokens/core/elevation.json', prefix: 'elevation' },

  // Semantic tokens
  { file: 'tokens/semantic/color.json', prefix: 'semantic.color' },
  { file: 'tokens/semantic/layout.json', prefix: 'semantic.layout' },
  { file: 'tokens/semantic/button.json', prefix: 'button' },
  { file: 'tokens/semantic/card.json', prefix: 'card' },
  { file: 'tokens/semantic/tabs.json', prefix: 'tabs' },
  { file: 'tokens/semantic/accordion.json', prefix: 'accordion' },
  { file: 'tokens/semantic/select.json', prefix: 'select' },
  { file: 'tokens/semantic/toggleswitch.json', prefix: 'toggleswitch' },
  { file: 'tokens/semantic/popover.json', prefix: 'popover' },
  { file: 'tokens/semantic/toast.json', prefix: 'toast' },
  { file: 'tokens/semantic/badge.json', prefix: 'badge' },
  { file: 'tokens/semantic/radiobutton.json', prefix: 'radiobutton' },
  { file: 'tokens/semantic/inputtext.json', prefix: 'inputtext' },
  { file: 'tokens/semantic/datepicker.json', prefix: 'datepicker' },
  { file: 'tokens/semantic/tooltip.json', prefix: 'tooltip' },
  { file: 'tokens/semantic/table.json', prefix: 'table' },
  { file: 'tokens/semantic/autocomplete.json', prefix: 'autocomplete' },
  { file: 'tokens/semantic/progressbar.json', prefix: 'progressbar' },
  { file: 'tokens/semantic/skeleton.json', prefix: 'skeleton' },
  { file: 'tokens/semantic/avatar.json', prefix: 'avatar' },
  { file: 'tokens/semantic/panel.json', prefix: 'panel' },
  { file: 'tokens/semantic/dialog.json', prefix: 'dialog' },
  { file: 'tokens/semantic/confirmdialog.json', prefix: 'confirmdialog' },
  { file: 'tokens/semantic/progressspinner.json', prefix: 'progressspinner' },
  { file: 'tokens/semantic/password.json', prefix: 'password' },
  { file: 'tokens/semantic/textarea.json', prefix: 'textarea' },
  { file: 'tokens/semantic/picklist.json', prefix: 'picklist' },
  { file: 'tokens/semantic/listbox.json', prefix: 'listbox' },
  { file: 'tokens/semantic/carousel.json', prefix: 'carousel' },
  { file: 'tokens/semantic/stepper.json', prefix: 'stepper' },
  { file: 'tokens/semantic/chip.json', prefix: 'chip' },
];

try {
  // Load all tokens
  process.chdir(PROJECT_ROOT);
  const allTokens = tokenUtils.loadTokens(TOKEN_SOURCES);
  const coreState = tokenUtils.loadJSON('tokens/core/state.json');
  
  // Resolve tokens
  const resolvedTokens = tokenResolverV2.resolveRefsV2(allTokens, coreState);
  
  // Write tokens as JSON
  fs.writeFileSync(
    path.join(DIST_DIR, 'tokens.json'),
    JSON.stringify(resolvedTokens, null, 2)
  );
  console.log('   ✓ Created tokens.json');
  
} catch (error) {
  console.error('   ❌ Error processing tokens:', error.message);
  process.exit(1);
}

console.log('✅ Package build complete!');