const { resolve } = require('path');
const tokenUtils = require('./core-script/token-utils');
const tokenResolverV2 = require('./core-script/token-resolver-v2');
const fileGenerators = require('./core-script/file-generators');

const { reportValidationIssues } = require('./helper/validation-reporter');
const { displayBuildHeader, displayBuildSummary, displayUsageExamples, displayHelp } = require('./helper/build-helpers');

// Build configuration from environment and CLI
const BUILD_CONFIG = {
  verbose: true,
  failOnWarnings: true,
  validateStructure: true,
  sortTokens: true,
};

// Token source definitions
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

/**
 * Load all token files and state modifiers
 */
function loadAllTokens() {
  console.log('\n📁 Loading token files...');

  const allTokens = tokenUtils.loadTokens(TOKEN_SOURCES);
  console.log(`   ✓ Loaded ${Object.keys(allTokens).length} tokens`);

  const coreState = tokenUtils.loadJSON('tokens/core/state.json');
  console.log(`   ✓ Loaded ${Object.keys(coreState).length} state modifiers`);

  return { allTokens, coreState };
}

/**
 * Validate token structure and report issues
 */
function validateTokens(allTokens) {
  if (!BUILD_CONFIG.validateStructure) {
    return true;
  }

  console.log('\n🔍 Validating token structure...');
  const issues = tokenResolverV2.validateTokenStructure(allTokens);

  const hasErrors = reportValidationIssues(issues, BUILD_CONFIG);

  if (hasErrors) {
    console.error('\n❌ Token validation failed. Please fix the issues above.');
    return false;
  }

  if (issues.missingReference.length === 0 && issues.invalidModifiers.length === 0) {
    console.log('   ✓ All tokens validated successfully');
  }

  return true;
}

/**
 * Resolve token references and validate results
 */
function resolveTokens(allTokens, coreState) {
  console.log('\n🔄 Resolving token references...');
  const resolvedTokens = tokenResolverV2.resolveRefsV2(allTokens, coreState);
  console.log(`   ✓ Resolved ${Object.keys(resolvedTokens).length} tokens`);

  // Additional validation on resolved tokens
  const { unresolvedTokens, warnings } = tokenUtils.validateTokens(resolvedTokens);

  if (unresolvedTokens.length > 0) {
    console.warn('\n⚠️  Warning: Some tokens could not be resolved:');
    unresolvedTokens.forEach((token) => console.warn(`   - ${token}`));
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️  Warning: Potential issues found:');
    warnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  return resolvedTokens;
}

/**
 * Minify CSS content by removing unnecessary whitespace
 */
function minifyCss(css) {
  return css
    .replace(/\s+/g, ' ')
    .replace(/;\s/g, ';')
    .replace(/{\s/g, '{')
    .replace(/\s}/g, '}')
    .trim();
}

/**
 * Generate and write output files
 */
function generateOutputFiles(resolvedTokens) {
  console.log('\n📝 Generating output files...');

  const cssVariables = fileGenerators.generateCssVariables(resolvedTokens);
  const files = {
    'css-variables.min.css': minifyCss(cssVariables),
    'mixins.scss': fileGenerators.generateScssHelpers(),
  };

  const buildDir = resolve(__dirname, 'build');
  fileGenerators.writeFiles(buildDir, files);
}

/**
 * Parse command line arguments
 */
function parseCommandLineArgs() {
  if (process.argv.includes('--help')) {
    displayHelp();
    process.exit(0);
  }

  if (process.argv.includes('--verbose')) {
    BUILD_CONFIG.verbose = true;
  }
  if (process.argv.includes('--no-validate')) {
    BUILD_CONFIG.validateStructure = false;
  }
  if (process.argv.includes('--no-sort')) {
    BUILD_CONFIG.sortTokens = false;
  }
  if (process.argv.includes('--fail-on-warnings')) {
    BUILD_CONFIG.failOnWarnings = true;
  }
}

/**
 * Main build function
 */
function buildTokens() {
  const startTime = Date.now();

  displayBuildHeader();

  try {
    // Load all tokens
    const { allTokens, coreState } = loadAllTokens();

    // Validate token structure
    if (!validateTokens(allTokens)) {
      process.exit(1);
    }

    // Resolve token references
    const resolvedTokens = resolveTokens(allTokens, coreState);

    // Generate output files
    generateOutputFiles(resolvedTokens);

    // Display summary
    displayBuildSummary(startTime, {
      total: Object.keys(allTokens).length,
      resolved: Object.keys(resolvedTokens).length,
    });

    // Display usage examples
    displayUsageExamples(BUILD_CONFIG.verbose);
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    if (BUILD_CONFIG.verbose) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Entry point
parseCommandLineArgs();
buildTokens();
