const { resolve } = require("path");
const tokenUtils = require("./core-script/token-utils");
const tokenResolverV2 = require("./core-script/token-resolver-v2");
const fileGenerators = require("./core-script/file-generators");

const { reportValidationIssues } = require("./helper/validation-reporter");
const {
  displayBuildHeader,
  displayBuildSummary,
  displayUsageExamples,
  displayHelp,
} = require("./helper/build-helpers");
const { NOVO_THEME_SOURCES, POLLY_THEME_SOURCES } = require("./tokens/theme");

// Build configuration from environment and CLI
const BUILD_CONFIG = {
  verbose: true,
  failOnWarnings: true,
  validateStructure: true,
  sortTokens: true,
};

// Core tokens resolve to raw values and form the base layer.
const CORE_SOURCES = [
  { file: "tokens/core/color.json", prefix: "color" },
  { file: "tokens/core/spacing.json", prefix: "spacing" },
  { file: "tokens/core/radius.json", prefix: "radius" },
  { file: "tokens/core/font.json", prefix: "font" },
  { file: "tokens/core/elevation.json", prefix: "elevation" },
];


// The :root base = core raw values + semantic (Polly) defaults.
const TOKEN_SOURCES = [...CORE_SOURCES];

// Client themes = thin overrides layered on top of the Polly defaults. Each is
// emitted to its own dist/themes/<name>.min.css scoped to [data-theme~="<name>"],
// containing ONLY the tokens that client changes; everything else falls through
// to :root via the CSS cascade. Add a new client by adding a theme source here.
const CLIENT_THEMES = [...NOVO_THEME_SOURCES , ...POLLY_THEME_SOURCES];

/**
 * Load all token files and state modifiers
 */
function loadAllTokens() {
  console.log("\n📁 Loading token files...");

  const allTokens = tokenUtils.loadTokens(TOKEN_SOURCES);
  console.log(`   ✓ Loaded ${Object.keys(allTokens).length} tokens`);

  const coreState = tokenUtils.loadJSON("tokens/core/state.json");
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

  console.log("\n🔍 Validating token structure...");
  const issues = tokenResolverV2.validateTokenStructure(allTokens);

  const hasErrors = reportValidationIssues(issues, BUILD_CONFIG);

  if (hasErrors) {
    console.error("\n❌ Token validation failed. Please fix the issues above.");
    return false;
  }

  if (
    issues.missingReference.length === 0 &&
    issues.invalidModifiers.length === 0
  ) {
    console.log("   ✓ All tokens validated successfully");
  }

  return true;
}

/**
 * Resolve token references and validate results
 */
function resolveTokens(allTokens, coreState) {
  console.log("\n🔄 Resolving token references...");
  const resolvedTokens = tokenResolverV2.resolveRefsV2(allTokens, coreState);
  console.log(`   ✓ Resolved ${Object.keys(resolvedTokens).length} tokens`);

  // Additional validation on resolved tokens
  const { unresolvedTokens, warnings } =
    tokenUtils.validateTokens(resolvedTokens);

  if (unresolvedTokens.length > 0) {
    console.warn("\n⚠️  Warning: Some tokens could not be resolved:");
    unresolvedTokens.forEach((token) => console.warn(`   - ${token}`));
  }

  if (warnings.length > 0) {
    console.warn("\n⚠️  Warning: Potential issues found:");
    warnings.forEach((warning) => console.warn(`   - ${warning}`));
  }

  return resolvedTokens;
}

/**
 * Resolve each client theme into its own minified CSS file.
 *
 * A client theme is resolved against the full base token set so its references
 * (e.g. {color.primary.blue}) become var(--color-...) exactly like Polly's
 * tokens. Only the keys the client actually overrides are emitted, scoped to
 * [data-theme~="<name>"], so every unset token falls through to the Polly
 * default in :root via the CSS cascade.
 *
 * @returns {Record<string, string>} map of `themes/<name>.css` => minified CSS
 */
function generateClientThemes(allTokens, coreState) {
  if (!CLIENT_THEMES.length) {
    return {};
  }

  console.log("\n🎨 Resolving client theme overrides...");
  const files = {};

  CLIENT_THEMES.forEach((theme) => {
    const themeTokens = tokenUtils.loadTokens(theme.files);
    const overrideKeys = Object.keys(themeTokens);

    if (overrideKeys.length === 0) {
      console.warn(`   ⚠️  Theme "${theme.name}" has no overrides — skipping`);
      return;
    }

    // Resolve overrides alongside the base tokens so references resolve,
    // then keep only the keys this client redefines.
    const resolved = tokenResolverV2.resolveRefsV2(
      { ...allTokens, ...themeTokens },
      coreState,
    );
    const themeResolved = {};
    overrideKeys.forEach((key) => {
      themeResolved[key] = resolved[key];
    });

    // Word-match selector so themes can be combined, e.g. data-theme="acme rtl".
    const selector = `[data-theme~="${theme.name}"]`;
    files[`themes/${theme.name}.min.css`] = minifyCss(
      fileGenerators.generateCssBlock(themeResolved, selector),
    );

    console.log(
      `   ✓ ${theme.name}: ${overrideKeys.length} overrides → dist/themes/${theme.name}.min.css  ${selector}`,
    );
  });

  return files;
}

/**
 * Minify CSS content by removing unnecessary whitespace
 */
function minifyCss(css) {
  return css
    .replace(/\s+/g, " ")
    .replace(/;\s/g, ";")
    .replace(/{\s/g, "{")
    .replace(/\s}/g, "}")
    .trim();
}

/**
 * Generate and write output files
 */
function generateOutputFiles(resolvedTokens, clientThemeFiles = {}) {
  console.log("\n📝 Generating output files...");

  // Base bundle: :root with core raw values + Polly defaults. Import this
  // everywhere — on its own it gives the default Polly look, no attribute needed.
  const cssVariables = fileGenerators.generateCssVariables(resolvedTokens);
  const files = {
    "css-variables.min.css": minifyCss(cssVariables),
    "mixins.scss": fileGenerators.generateScssHelpers(),
    // One file per client; loaded alongside the base bundle.
    ...clientThemeFiles,
  };

  const buildDir = resolve(__dirname, "dist");
  fileGenerators.writeFiles(buildDir, files);
}

/**
 * Parse command line arguments
 */
function parseCommandLineArgs() {
  if (process.argv.includes("--help")) {
    displayHelp();
    process.exit(0);
  }

  if (process.argv.includes("--verbose")) {
    BUILD_CONFIG.verbose = true;
  }
  if (process.argv.includes("--no-validate")) {
    BUILD_CONFIG.validateStructure = false;
  }
  if (process.argv.includes("--no-sort")) {
    BUILD_CONFIG.sortTokens = false;
  }
  if (process.argv.includes("--fail-on-warnings")) {
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

    // Resolve each client theme into its own dist/themes/<name>.min.css
    const clientThemeFiles = generateClientThemes(allTokens, coreState);

    // Generate output files
    generateOutputFiles(resolvedTokens, clientThemeFiles);

    // Display summary
    displayBuildSummary(startTime, {
      total: Object.keys(allTokens).length,
      resolved: Object.keys(resolvedTokens).length,
    });

    // Display usage examples
    displayUsageExamples(BUILD_CONFIG.verbose);
  } catch (error) {
    console.error("\n❌ Build failed:", error.message);
    if (BUILD_CONFIG.verbose) {
      console.error("\nStack trace:", error.stack);
    }
    process.exit(1);
  }
}

// Entry point
parseCommandLineArgs();
buildTokens();
