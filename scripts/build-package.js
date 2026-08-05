const fs = require('fs');
const path = require('path');
const { resolve } = require('path');

// Configuration
const PROJECT_ROOT = path.resolve(__dirname, '..');
const BUILD_DIR = path.resolve(PROJECT_ROOT, 'dist');

// Ensure build directory exists
if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR, { recursive: true });
}

console.log('📦 Building NPM package...');

// Copy JavaScript source files to build directory
const filesToCopy = [
  { src: path.join(PROJECT_ROOT, 'src/index.js'), dest: 'index.js' },
  { src: path.join(PROJECT_ROOT, 'src/index.esm.js'), dest: 'index.esm.js' },
  { src: path.join(PROJECT_ROOT, 'src/index.d.ts'), dest: 'index.d.ts' }
];

filesToCopy.forEach(({ src, dest }) => {
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(BUILD_DIR, dest));
    console.log(`   ✓ Copied ${dest}`);
  } else {
    console.warn(`   ⚠️  Warning: ${src} not found`);
  }
});

// Load and consolidate all tokens
const tokenUtils = require('../core-script/token-utils');
const tokenResolverV2 = require('../core-script/token-resolver-v2');
const { NOVO_THEME_SOURCES, POLLY_THEME_SOURCES } = require('../tokens/theme');

// Base export mirrors the :root layer: core tokens only. Semantic tokens live
// per-theme and are written as separate JSON files below.
const TOKEN_SOURCES = [
  { file: 'tokens/core/color.json', prefix: 'color' },
  { file: 'tokens/core/spacing.json', prefix: 'spacing' },
  { file: 'tokens/core/radius.json', prefix: 'radius' },
  { file: 'tokens/core/font.json', prefix: 'font' },
  { file: 'tokens/core/elevation.json', prefix: 'elevation' },
];

// Client themes carry the semantic tokens. Each is emitted as its own resolved
// JSON alongside the theme CSS so JS/TS consumers can read semantic tokens.
const CLIENT_THEMES = [...NOVO_THEME_SOURCES, ...POLLY_THEME_SOURCES];

try {
  // Load all tokens
  process.chdir(PROJECT_ROOT);
  const allTokens = tokenUtils.loadTokens(TOKEN_SOURCES);
  const coreState = tokenUtils.loadJSON('tokens/core/state.json');

  // Resolve tokens
  const resolvedTokens = tokenResolverV2.resolveRefsV2(allTokens, coreState);

  // Write base tokens as JSON (core only)
  fs.writeFileSync(
    path.join(BUILD_DIR, 'tokens.json'),
    JSON.stringify(resolvedTokens, null, 2)
  );
  console.log('   ✓ Created tokens.json');

  // Write one resolved JSON per client theme (semantic tokens only),
  // mirroring dist/themes/<name>.min.css.
  const themesDir = path.join(BUILD_DIR, 'themes');
  if (!fs.existsSync(themesDir)) {
    fs.mkdirSync(themesDir, { recursive: true });
  }

  CLIENT_THEMES.forEach((theme) => {
    const themeTokens = tokenUtils.loadTokens(theme.files);
    const overrideKeys = Object.keys(themeTokens);

    if (overrideKeys.length === 0) {
      console.warn(`   ⚠️  Theme "${theme.name}" has no tokens — skipping JSON`);
      return;
    }

    // Resolve overrides against the base tokens so references resolve, then
    // keep only the keys this theme defines.
    const resolved = tokenResolverV2.resolveRefsV2(
      { ...allTokens, ...themeTokens },
      coreState
    );
    const themeResolved = {};
    overrideKeys.forEach((key) => {
      themeResolved[key] = resolved[key];
    });

    fs.writeFileSync(
      path.join(themesDir, `${theme.name}.tokens.json`),
      JSON.stringify(themeResolved, null, 2)
    );
    console.log(
      `   ✓ Created themes/${theme.name}.tokens.json (${overrideKeys.length} tokens)`
    );
  });

} catch (error) {
  console.error('   ❌ Error processing tokens:', error.message);
  process.exit(1);
}

console.log('✅ Package build complete!');
