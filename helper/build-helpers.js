// Helper functions for the build process

/**
 * Display build header
 */
function displayBuildHeader() {
  console.log(`
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    Building Design Tokens CSS Variables                      ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
  `);
}

/**
 * Display build summary
 */
function displayBuildSummary(startTime, tokenCounts) {
  const endTime = Date.now();
  const buildTime = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log(`
    ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
    ┃                    ✅ Design tokens built successfully!                      ┃
    ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
    
    📊 Build Summary:
    ├─ Total tokens: ${tokenCounts.total}
    ├─ Resolved tokens: ${tokenCounts.resolved}
    ├─ Build time: ${buildTime}s
    │
    📁 Generated Files:
    ├─ CSS Variables: dist/css-variables.min.css
    └─ SCSS Mixins: dist/mixins.scss
  `);
}

/**
 * Display usage examples (verbose mode only)
 */
function displayUsageExamples(isVerbose) {
  if (!isVerbose) {
    return;
  }
  
  console.log(`
    💡 Usage Examples:
    ------------------------------------------------------------------------------
    
    1. Import CSS Variables in your SCSS/CSS files:
       @import '@polly-fe/design-tokens/css';
       
       Then use anywhere:
       .my-component {
         background: var(--color-primary-purple);
         border-color: var(--card-base-border-color);
         border-radius: var(--card-base-radius-default);
       }
    
    2. Import SCSS Mixins (optional):
       @import '@polly-fe/design-tokens/scss';
       
       Then use helper functions:
       .card {
         @include border-radius(var(--radius-lg));
         @include shadow(var(--elevation-md));
       }
    
    3. Direct usage in HTML/Angular templates:
       <div [style.background]="'var(--color-primary-purple)'"></div>
    
    4. PrimeNG Theme Integration:
       The CSS variables are automatically available to PrimeNG components
       after importing '@polly-fe/design-tokens/css' in your main styles file.
    
    🎨 Color Features:
    ├─ Color mixing: {color.secondary.purple|mix:30:white}
    ├─ Color spaces: srgb, lab, oklab, lch, oklch, display-p3
    ├─ State modifiers: {color.primary.purple|state.hover}
    ├─ Shading/Tinting: {color.primary.purple|shade:20}
    └─ Alpha/Opacity: {color.primary.purple|alpha:0.5}
    ------------------------------------------------------------------------------
  `);
}

/**
 * Display help message
 */
function displayHelp() {
  console.log(`
  Design Token Build Script
  
  Usage: node build-tokens.js [options]
  
  Options:
    --help              Show this help message
    --verbose           Show detailed output and usage examples
    --no-validate       Skip token structure validation
    --no-sort           Skip alphabetical sorting of token files
    --fail-on-warnings  Treat warnings as errors
  
  Environment Variables:
    VERBOSE=true            Same as --verbose
    VALIDATE=false          Same as --no-validate  
    SORT_TOKENS=false       Same as --no-sort
    FAIL_ON_WARNINGS=true   Same as --fail-on-warnings
  `);
}

module.exports = {
  displayBuildHeader,
  displayBuildSummary,
  displayUsageExamples,
  displayHelp
};