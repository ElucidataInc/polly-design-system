// Token resolution logic v2 - Preserves references for semantic tokens
// Instead of resolving to final values, semantic tokens will reference core tokens
const { getSanitizeCssVarName } = require("./generators/css-generator");

// Resolution context to manage caches and state
class ResolutionContext {
  constructor(stateModifiers = {}) {
    this.cssVarCache = new Map();
    this.stateModifiers = stateModifiers;
    this.stats = {
      cacheHits: 0,
      cacheMisses: 0,
      totalConversions: 0,
    };
  }

  tokenToCssVar(tokenPath) {
    this.stats.totalConversions++;

    if (this.cssVarCache.has(tokenPath)) {
      this.stats.cacheHits++;
      return this.cssVarCache.get(tokenPath);
    }

    this.stats.cacheMisses++;
    const cssVar = `var(${getSanitizeCssVarName(tokenPath)})`;
    this.cssVarCache.set(tokenPath, cssVar);
    return cssVar;
  }

  clear() {
    this.cssVarCache.clear();
  }

  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cssVarCache.size,
      cacheEfficiency:
        this.stats.totalConversions > 0 ? `${((this.stats.cacheHits / this.stats.totalConversions) * 100).toFixed(2)}%` : '0%',
    };
  }
}

// Color space validation
const VALID_COLOR_SPACES = new Set(['srgb', 'srgb-linear', 'lab', 'oklab', 'lch', 'oklch', 'display-p3']);

function validateColorSpace(space) {
  return VALID_COLOR_SPACES.has(space.toLowerCase()) ? space.toLowerCase() : 'srgb';
}

// Process color mixing to CSS color-mix() function
function processCssColorMix(tokenPath, context) {
  const mixMatch = tokenPath.match(/^(.+?)\|mix:(.+)$/);
  if (!mixMatch) {
    return null;
  }

  const [, baseTokenPath, mixParams] = mixMatch;
  const params = mixParams.split(':');

  let colorSpace = 'srgb';
  let percent1;
  let color2;

  // Parse parameters based on count
  if (params.length === 3) {
    [colorSpace, percent1, color2] = params;
    colorSpace = validateColorSpace(colorSpace);
  } else if (params.length === 2) {
    [percent1, color2] = params;
  } else {
    return null;
  }

  percent1 = parseInt(percent1, 10);
  if (isNaN(percent1) || percent1 < 0 || percent1 > 100) {
    console.warn(`Invalid mix percentage: ${percent1}`);
    return null;
  }

  // Convert base token to CSS variable
  const baseVar = context.tokenToCssVar(baseTokenPath);

  // Handle color2 - optimize with a map
  const colorMap = {
    white: 'color.standard.white',
    black: 'color.standard.black',
    transparent: 'transparent',
  };

  let color2Var;
  if (color2 in colorMap) {
    color2Var = colorMap[color2] === 'transparent' ? 'transparent' : context.tokenToCssVar(colorMap[color2]);
  } else if (color2.startsWith('#')) {
    color2Var = color2;
  } else if (color2.includes('.')) {
    color2Var = context.tokenToCssVar(color2);
  } else {
    color2Var = context.tokenToCssVar(`color.${color2}`);
  }

  // Return CSS color-mix function
  return `color-mix(in ${colorSpace}, ${baseVar} ${percent1}%, ${color2Var} ${100 - percent1}%)`;
}

// Process alpha/opacity to CSS color-mix()
function processCssAlpha(tokenPath, context) {
  const alphaMatch = tokenPath.match(/^(.+?)\|alpha:(.+)$/);
  if (!alphaMatch) {
    return null;
  }

  const [, baseTokenPath, alphaValue] = alphaMatch;
  const alpha = parseFloat(alphaValue);

  if (isNaN(alpha) || alpha < 0 || alpha > 1) {
    console.warn(`Invalid alpha value: ${alphaValue}`);
    return null;
  }

  const baseVar = context.tokenToCssVar(baseTokenPath);
  return `color-mix(in srgb, ${baseVar} ${alpha * 100}%, transparent ${(1 - alpha) * 100}%)`;
}

// Process shade/tint using color-mix
function processCssShade(tokenPath, context) {
  const shadeMatch = tokenPath.match(/^(.+?)\|shade:(.+)$/);
  if (!shadeMatch) {
    return null;
  }

  const [, baseTokenPath, shadeAmount] = shadeMatch;
  const percent = parseInt(shadeAmount, 10);

  if (isNaN(percent) || percent < 0 || percent > 100) {
    console.warn(`Invalid shade percentage: ${shadeAmount}`);
    return null;
  }

  const baseVar = context.tokenToCssVar(baseTokenPath);
  const blackVar = context.tokenToCssVar('color.standard.black');
  return `color-mix(in srgb, ${baseVar} ${100 - percent}%, ${blackVar} ${percent}%)`;
}

function processCssTint(tokenPath, context) {
  const tintMatch = tokenPath.match(/^(.+?)\|tint:(.+)$/);
  if (!tintMatch) {
    return null;
  }

  const [, baseTokenPath, tintAmount] = tintMatch;
  const percent = parseInt(tintAmount, 10);

  if (isNaN(percent) || percent < 0 || percent > 100) {
    console.warn(`Invalid tint percentage: ${tintAmount}`);
    return null;
  }

  const baseVar = context.tokenToCssVar(baseTokenPath);
  const whiteVar = context.tokenToCssVar('color.standard.white');
  return `color-mix(in srgb, ${baseVar} ${100 - percent}%, ${whiteVar} ${percent}%)`;
}

// Process state modifiers (hover, active, disabled, focus)
function processCssStateModifier(tokenPath, context) {
  const stateMatch = tokenPath.match(/^(.+?)\|state\.(.+)$/);
  if (!stateMatch) {
    return null;
  }

  const [, baseTokenPath, stateName] = stateMatch;
  const baseVar = context.tokenToCssVar(baseTokenPath);

  const modifier = context.stateModifiers[stateName];
  if (!modifier) {
    console.warn(`Unknown state modifier: ${stateName}`);
    return baseVar;
  }

  // Convert state modifier to color-mix
  switch (modifier.type) {
    case 'darken': {
      const percent = Math.min(100, Math.max(0, modifier.amount * 100));
      const blackVar = context.tokenToCssVar('color.standard.black');
      return `color-mix(in srgb, ${baseVar} ${100 - percent}%, ${blackVar} ${percent}%)`;
    }
    case 'lighten': {
      const percent = Math.min(100, Math.max(0, modifier.amount * 100));
      const whiteVar = context.tokenToCssVar('color.standard.white');
      return `color-mix(in srgb, ${baseVar} ${100 - percent}%, ${whiteVar} ${percent}%)`;
    }
    case 'desaturate':
    case 'saturate': {
      // For saturate/desaturate, use oklch color space when supported
      // Fallback to base color for now
      return baseVar;
    }
    default: {
      return baseVar;
    }
  }
}

// Process token modifier for CSS output
function processTokenModifierForCss(tokenPath, context) {
  // Process modifiers in order of precedence
  const processors = [
    () => processCssStateModifier(tokenPath, context),
    () => processCssColorMix(tokenPath, context),
    () => processCssAlpha(tokenPath, context),
    () => processCssShade(tokenPath, context),
    () => processCssTint(tokenPath, context),
  ];

  for (const processor of processors) {
    const result = processor();
    if (result) {
      return result;
    }
  }

  // If no modifier, just return as CSS variable
  return context.tokenToCssVar(tokenPath);
}

// Circular reference detection and resolution for core tokens
class TokenResolver {
  constructor(tokens, stateModifiers = {}) {
    this.tokens = tokens;
    this.stateModifiers = stateModifiers;
    this.resolved = {};
    this.resolving = new Set();
    this.circularRefs = new Map();
  }

  detectCircularReference(key, path = []) {
    if (this.resolving.has(key)) {
      const cycle = [...path, key];
      const cycleStart = cycle.indexOf(key);
      const circularPath = cycle.slice(cycleStart);
      this.circularRefs.set(key, circularPath);
      return true;
    }
    return false;
  }

  resolveToken(key, path = []) {
    // Already resolved
    if (key in this.resolved) {
      return this.resolved[key];
    }

    // Check for circular reference
    if (this.detectCircularReference(key, path)) {
      console.warn(`⚠️ Circular reference detected: ${[...path, key].join(' → ')}`);
      this.resolved[key] = `[Circular: ${key}]`;
      return this.resolved[key];
    }

    const value = this.tokens[key];

    // Not a string or doesn't exist
    if (!value || typeof value !== 'string') {
      this.resolved[key] = value;
      return value;
    }

    // Mark as resolving
    this.resolving.add(key);
    const currentPath = [...path, key];

    try {
      // Single token reference
      if (value.startsWith('{') && value.endsWith('}')) {
        const refPath = value.slice(1, -1);
        const resolvedValue = this.resolveToken(refPath, currentPath);
        this.resolved[key] = resolvedValue;
        return resolvedValue;
      }

      // Multiple embedded references
      if (value.includes('{') && value.includes('}')) {
        const tokenRegex = /{([^}]+)}/g;
        let resolvedValue = value;

        resolvedValue = resolvedValue.replace(tokenRegex, (match, refPath) => {
          const resolved = this.resolveToken(refPath, currentPath);
          return resolved || match;
        });

        this.resolved[key] = resolvedValue;
        return resolvedValue;
      }

      // Plain value
      this.resolved[key] = value;
      return value;
    } finally {
      this.resolving.delete(key);
    }
  }

  resolveAll() {
    Object.keys(this.tokens).forEach((key) => {
      if (!(key in this.resolved)) {
        this.resolveToken(key);
      }
    });

    if (this.circularRefs.size > 0) {
      console.error('\n❌ Circular references summary:');
      this.circularRefs.forEach((cycle, key) => {
        console.error(`   ${cycle.join(' → ')}`);
      });
    }

    return this.resolved;
  }
}

// Sort tokens alphabetically within their categories
function sortTokensByCategory(tokens) {
  const sorted = {};
  const categories = new Map();

  // Group tokens by their prefix/category
  Object.entries(tokens).forEach(([key, value]) => {
    const parts = key.split('.');
    const category = parts[0];

    if (!categories.has(category)) {
      categories.set(category, []);
    }

    categories.get(category).push({ key, value });
  });

  // Sort each category alphabetically and rebuild the object
  categories.forEach((tokenList) => {
    tokenList.sort((a, b) => a.key.localeCompare(b.key));

    tokenList.forEach(({ key, value }) => {
      sorted[key] = value;
    });
  });
  return sorted;
}

// Main resolution function with optimizations
function resolveRefsV2(tokens, stateModifiers = {}) {
  const context = new ResolutionContext(stateModifiers);
  const resolved = {};

  try {
    // Sort tokens alphabetically within their categories first
    const sortedTokens = sortTokensByCategory(tokens);

    // Pre-categorize tokens for efficiency
    const tokenCategories = {
      core: {},
      semantic: {},
    };

    // Core token prefixes
    const corePrefixes = ['color.', 'spacing.', 'radius.', 'font.', 'elevation.'];

    Object.entries(sortedTokens).forEach(([key, value]) => {
      const isCore = corePrefixes.some((prefix) => key.startsWith(prefix) && !key.startsWith('semantic.'));

      tokenCategories[isCore ? 'core' : 'semantic'][key] = value;
    });

    // Step 1: Resolve core tokens with circular reference detection
    const coreResolver = new TokenResolver(tokenCategories.core);
    const resolvedCore = coreResolver.resolveAll();
    Object.assign(resolved, resolvedCore);

    // Step 2: Process semantic tokens - preserve references as CSS variables
    const tokenRegex = /{([^}]+)}/g;

    Object.entries(tokenCategories.semantic).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // Check for token references
        if (value.startsWith('{') && value.endsWith('}')) {
          const tokenPath = value.slice(1, -1);
          resolved[key] = tokenPath.includes('|') ? processTokenModifierForCss(tokenPath, context) : context.tokenToCssVar(tokenPath);
        } else if (tokenRegex.test(value)) {
          // Reset regex
          tokenRegex.lastIndex = 0;

          resolved[key] = value.replace(tokenRegex, (match, tokenPath) => {
            return tokenPath.includes('|') ? processTokenModifierForCss(tokenPath, context) : context.tokenToCssVar(tokenPath);
          });
        } else {
          resolved[key] = value;
        }
      } else {
        resolved[key] = value;
      }
    });

    // Log cache statistics in development
    const stats = context.getStats();
    console.log(`Token resolution stats: Cache efficiency ${stats.cacheEfficiency}, Size: ${stats.cacheSize}`);
    return resolved;
  } finally {
    // Always clean up context
    context.clear();
  }
}

// Token structure validation
function validateTokenStructure(tokens) {
  const issues = {
    circular: [],
    selfReference: [],
    missingReference: [],
    deepNesting: [],
    invalidModifiers: [],
  };

  const tokenKeys = new Set(Object.keys(tokens));
  const visited = new Map();

  function checkToken(key, path = []) {
    if (visited.has(key)) {
      return visited.get(key);
    }

    const value = tokens[key];
    if (!value || typeof value !== 'string') {
      const result = { depth: 0, references: [] };
      visited.set(key, result);
      return result;
    }

    const references = [];
    const tokenRegex = /{([^}]+)}/g;
    let match;

    while ((match = tokenRegex.exec(value)) !== null) {
      const fullRef = match[1];
      const [refPath] = fullRef.split('|');

      // Check for self-reference
      if (refPath === key) {
        issues.selfReference.push(key);
        continue;
      }

      // Check if reference exists
      if (!tokenKeys.has(refPath)) {
        issues.missingReference.push({
          token: key,
          missingRef: refPath,
        });
        continue;
      }

      // Validate modifiers
      if (fullRef.includes('|')) {
        const modifiers = fullRef.split('|').slice(1);
        for (const mod of modifiers) {
          if (!mod.match(/^(state\.|mix:|alpha:|shade:|tint:|saturate:|desaturate:)/)) {
            issues.invalidModifiers.push({
              token: key,
              modifier: mod,
            });
          }
        }
      }

      references.push(refPath);
    }

    // Check for circular references
    if (path.includes(key)) {
      issues.circular.push({
        token: key,
        path: [...path, key],
      });
      const result = { depth: 0, references };
      visited.set(key, result);
      return result;
    }

    // Calculate nesting depth
    let maxDepth = 0;
    const newPath = [...path, key];

    for (const ref of references) {
      const refInfo = checkToken(ref, newPath);
      maxDepth = Math.max(maxDepth, refInfo.depth + 1);
    }

    // Warn about deep nesting
    if (maxDepth > 5) {
      issues.deepNesting.push({
        token: key,
        depth: maxDepth,
      });
    }

    const result = { depth: maxDepth, references };
    visited.set(key, result);
    return result;
  }

  // Check all tokens
  Object.keys(tokens).forEach((key) => checkToken(key));

  return issues;
}

module.exports = {
  resolveRefsV2,
  validateTokenStructure,
  sortTokensByCategory,
  TokenResolver,
  ResolutionContext,
};
