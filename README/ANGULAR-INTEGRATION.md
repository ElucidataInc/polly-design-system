# Angular Integration Guide for Design Tokens

## Method 1: Add to angular.json (Recommended)

Add the generated CSS variables file to your project's styles array in `angular.json`:

```json
{
  "projects": {
    "polly-frontend-v2": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "node_modules/primeicons/primeicons.css",
              "node_modules/polly-commons/css/shared.min.css",
              "node_modules/polly-qubit/css/primeng/polly.min.css",
              "node_modules/polly-qubit/css/shared.min.css",
              "src/app/polly-design-token/design-tokens/build/css-variables.min.css",  // ← Add this line
              "src/styles.scss"
            ]
          }
        }
      }
    }
  }
}
```

### For Multiple Projects

If you have multiple projects (polly-manage, polly-admin, data-curation, etc.), add it to each project's styles array:

```json
// For polly-manage project
"polly-manage": {
  "architect": {
    "build": {
      "options": {
        "styles": [
          // ... other styles
          "src/app/polly-design-token/design-tokens/build/css-variables.min.css",
          "projects/polly-manage/src/styles.scss"
        ]
      }
    }
  }
}

// For polly-admin project
"polly-admin": {
  "architect": {
    "build": {
      "options": {
        "styles": [
          // ... other styles
          "src/app/polly-design-token/design-tokens/build/css-variables.min.css",
          "projects/polly-admin/src/styles.scss"
        ]
      }
    }
  }
}
```

## Method 2: Import in Global Styles

Alternatively, you can import the CSS variables in your main `styles.scss` file:

### In `src/styles.scss`:
```scss
// Import generated design tokens - makes CSS variables globally accessible
@import 'app/polly-design-token/design-tokens/build/css-variables.min.css';

// Or use a relative path
@import './app/polly-design-token/design-tokens/build/css-variables.min.css';

// Rest of your global styles...
```

### In project-specific styles:
```scss
// In projects/polly-manage/src/styles.scss
@import '../../../src/app/polly-design-token/design-tokens/build/css-variables.min.css';

// In projects/polly-admin/src/styles.scss
@import '../../../src/app/polly-design-token/design-tokens/build/css-variables.min.css';
```

## Method 3: Create a Shared SCSS Import

Create a shared SCSS file that all projects can import:

### Create `src/app/polly-design-token/index.scss`:
```scss
// Main entry point for design tokens
@import './design-tokens/build/css-variables.min.css';
@import './design-tokens/build/mixins.scss';
```

### Then import in your styles:
```scss
// In any SCSS file
@import '@app/polly-design-token/index';
```

## Build Process Integration

### Add npm script to package.json:
```json
{
  "scripts": {
    "build:tokens": "cd src/app/polly-design-token && node build-tokens.js",
    "prebuild": "npm run build:tokens",
    "prestart": "npm run build:tokens"
  }
}
```

This ensures tokens are built before your Angular app starts or builds.

## TypeScript Path Mapping (Optional)

For cleaner imports, add path mapping in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@design-tokens/*": ["src/app/polly-design-token/*"],
      "@design-tokens": ["src/app/polly-design-token/index"]
    }
  }
}
```

Then you can import like:
```scss
@import '@design-tokens/design-tokens/build/css-variables.min.css';
```

## Verification

After adding the import, verify that CSS variables are available:

1. **Restart your Angular dev server** after modifying `angular.json`
2. **Check in browser DevTools**:
   - Open DevTools → Elements
   - Select the `<html>` or `:root` element
   - Check Computed styles for CSS variables starting with `--color-`, `--card-`, etc.

3. **Test in a component**:
```scss
.test-component {
  background: var(--color-primary-purple);
  border: var(--card-border-width) solid var(--card-border-default);
}
```

## Important Notes

1. **Order Matters**: Place the design tokens CSS before your main styles.scss so you can override token values if needed.

2. **Build Tokens First**: Always build tokens before starting Angular:
   ```bash
   npm run build:tokens && ng serve
   ```

3. **Watch Mode** (Optional): Create a watch script for development:
   ```json
   "watch:tokens": "nodemon --watch src/app/polly-design-token/tokens --exec 'npm run build:tokens'"
   ```

4. **Production Build**: Ensure tokens are built in your CI/CD pipeline:
   ```bash
   npm run build:tokens && ng build --configuration=production
   ```

## Troubleshooting

### CSS Variables Not Working?
1. Check if the file path in angular.json is correct
2. Verify the CSS file exists at the specified path
3. Restart Angular dev server after changes to angular.json
4. Clear browser cache

### Path Resolution Issues?
Use absolute paths from project root:
```json
"styles": [
  "src/app/polly-design-token/design-tokens/build/css-variables.min.css"
]
```

### Multiple Projects Sharing Tokens?
Consider publishing tokens as an npm package or using Angular workspace libraries for better sharing across projects.