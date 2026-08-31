# Polly Design Tokens

`@polly-fe/design-tokens` is the centralized design-token system for Polly applications. It ships a **layered** set of tokens so every app can share one base look while individual clients get their own theme — all through plain CSS custom properties (no runtime, no framework lock-in).

## Architecture

Tokens are split into two layers:

| Layer | What it holds | Where it lives | Emitted to |
| --- | --- | --- | --- |
| **Core** | Raw, brand-agnostic values — color palette, spacing, radius, font, elevation | `:root` | `dist/css-variables.min.css` |
| **Theme** | Semantic & component tokens (button, card, inputs, `semantic.color.*`, `semantic.layout.*`, …) that reference core values | `[data-theme~="<name>"]` | `dist/themes/<name>.min.css` |

Two themes ship today: **`polly`** (the default) and **`novigenix`**.

**How it resolves at runtime:** the base bundle defines core variables on `:root`; each theme bundle redefines the semantic/component variables under its own `[data-theme~="<name>"]` selector. An app loads the core bundle **plus** the theme bundle(s), and sets `data-theme="<name>"` on `<html>`. Switching the attribute switches the whole document's theme.

> ⚠️ Because semantic/component tokens now live **only** in the theme layer, an app that loads `:root` alone (core) will have no component styling. You must also load a theme and set `data-theme`.

## Installation

```bash
npm install @polly-fe/design-tokens
```

## Import paths (package exports)

| Import | Resolves to | Contents |
| --- | --- | --- |
| `@polly-fe/design-tokens` | `dist/index.js` / `.esm.js` | JS/TS API (see below) |
| `@polly-fe/design-tokens/style` | `dist/css-variables.min.css` | Core variables on `:root` |
| `@polly-fe/design-tokens/themes` | `dist/themes/index.min.css` | **All** themes (barrel — `@import`s every theme) |
| `@polly-fe/design-tokens/themes/<name>` | `dist/themes/<name>.min.css` | A single theme (e.g. `themes/polly`) |
| `@polly-fe/design-tokens/themes/<name>.json` | `dist/themes/<name>.tokens.json` | A single theme's resolved tokens as JSON |
| `@polly-fe/design-tokens/scss` | `dist/mixins.scss` | SCSS helper mixins |
| `@polly-fe/design-tokens/tokens` | `dist/tokens.json` | Resolved **core** tokens as JSON |

> The CSS entry is `/style` (not `/css`).

## Usage

### 1. Load the CSS (core + themes)

Import the core variables and the themes barrel once, at the root of your app:

```css
/* core variables on :root */
@import '@polly-fe/design-tokens/style';
/* every theme, scoped to [data-theme~="..."] */
@import '@polly-fe/design-tokens/themes';
```

Prefer only specific themes? Import them individually instead of the barrel:

```css
@import '@polly-fe/design-tokens/themes/polly';
@import '@polly-fe/design-tokens/themes/novigenix';
```

### 2. Apply a theme

Set `data-theme` on the root element. `polly` is the default look:

```html
<html data-theme="polly">
  ...
</html>
```

The selector uses a word match (`[data-theme~="..."]`), so themes can be combined with other document flags, e.g. `data-theme="novigenix rtl"`.

### 3. Consume tokens in your styles

```scss
.card {
  background: var(--color-primary-purple);   /* core token   */
  border-radius: var(--radius-lg);            /* core token   */
  box-shadow: var(--elevation-md);            /* core token   */
  border-color: var(--semantic-color-border-default); /* theme token */
}

.btn {
  border-radius: var(--button-base-borderradius); /* component token (theme layer) */
  padding: var(--button-base-padding);
}
```

### SCSS mixins

```scss
@import '@polly-fe/design-tokens/scss';

.panel {
  @include border-radius(var(--radius-lg));
  @include shadow(var(--elevation-md));
}
```

### JavaScript / TypeScript API

```javascript
import { tokens, coreTokens, getToken, getCSSVariable, createTheme } from '@polly-fe/design-tokens';

getToken('color.primary.purple');        // → resolved value
getCSSVariable('color.primary.purple');  // → "var(--color-primary-purple)"
coreTokens;                              // → all core tokens (color/spacing/radius/font/elevation)
createTheme({ 'color.primary.purple': '#7C3AED' }); // → shallow override of the token map
```

> The JS API is backed by `dist/tokens.json`, which contains the **core** layer only. `coreTokens` holds all core tokens; `semanticTokens` is currently empty because semantic/component tokens live in the theme layer — read those per theme via `@polly-fe/design-tokens/themes/<name>.json`:

```javascript
import polly from '@polly-fe/design-tokens/themes/polly.json';
import novigenix from '@polly-fe/design-tokens/themes/novigenix.json';

polly['button.base.borderradius']; // → "0.5rem"
```

## Angular integration

Add the two stylesheets to the `styles` array of every app in `angular.json` (both `build` and `test` targets):

```jsonc
"styles": [
  "node_modules/@polly-fe/design-tokens/dist/css-variables.min.css",
  "node_modules/@polly-fe/design-tokens/dist/themes/index.min.css",
  "src/styles.scss"
]
```

Because the second line is the themes **barrel**, you never edit `angular.json` when a new theme is added — the barrel is regenerated to include it.

Then apply the theme at startup. A small service that reads the host and sets `data-theme` on `<html>` (defaulting to `polly`) is the recommended pattern:

```typescript
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  init(): void {
    const host = this.document.defaultView?.location.hostname ?? '';
    const theme = SUBDOMAIN_THEME[host.split('.')[0]?.toLowerCase()] ?? 'polly';
    this.document.documentElement.setAttribute('data-theme', theme);
  }
}
```

Call `init()` from an `APP_INITIALIZER` so the theme is set before the app renders.

## Token naming convention

Token paths are dot-separated and map to CSS variables by replacing `.` with `-`:

```
color.primary.purple   → var(--color-primary-purple)
radius.lg              → var(--radius-lg)
elevation.md           → var(--elevation-md)
button.base.padding    → var(--button-base-padding)
semantic.color.border.default → var(--semantic-color-border-default)
```

**Core categories:** `color.*`, `spacing.*`, `radius.*`, `font.*`, `elevation.*`
**Theme categories:** `semantic.color.*`, `semantic.layout.*`, and per-component groups — `button`, `card`, `tabs`, `accordion`, `select`, `inputtext`, `checkbox`, `dialog`, `toast`, `tooltip`, `table`, and ~30 more.

## Project structure

```
polly-design-token/
├── build-tokens.js            # Builds core CSS vars, per-theme CSS, themes barrel, SCSS mixins
├── scripts/
│   └── build-package.js       # Copies JS entrypoints, writes core tokens.json + per-theme JSON
├── core-script/               # Token loading / resolution / file generation
├── src/                       # JS/TS API source (index.js, index.esm.js, index.d.ts)
├── tokens/
│   ├── core/                  # color, spacing, radius, font, elevation, state
│   └── theme/
│       ├── index.js           # Aggregates all theme source definitions
│       ├── polly/             # index.js + semantic/*.json  (default theme)
│       └── novigenix/         # index.js + semantic/*.json
└── dist/                      # Build output (generated)
    ├── index.js / .esm.js / .d.ts
    ├── css-variables.min.css  # Core layer (:root)
    ├── mixins.scss
    ├── tokens.json            # Core tokens (JSON)
    └── themes/
        ├── index.min.css      # Barrel: @imports every theme
        ├── polly.min.css      # [data-theme~="polly"]
        ├── novigenix.min.css  # [data-theme~="novigenix"]
        ├── polly.tokens.json  # Polly semantic tokens (JSON)
        └── novigenix.tokens.json
```

## Building & development

```bash
npm run build
```

Runs two steps:
1. `build-tokens.js` — emits `css-variables.min.css` (core `:root`), one `themes/<name>.min.css` per theme, the `themes/index.min.css` barrel, and `mixins.scss`.
2. `build:package` (`scripts/build-package.js`) — copies the JS entrypoints and writes core `tokens.json` plus per-theme `themes/<name>.tokens.json`.

## Adding a new theme

1. Create `tokens/theme/<name>/semantic/*.json` (copy an existing theme's files and change the values you want to override).
2. Add `tokens/theme/<name>/index.js` exporting `<NAME>_THEME_SOURCES = [{ name: "<name>", selector: '[data-theme="<name>"]', files: [...] }]`.
3. Register it in `tokens/theme/index.js` and add it to the `CLIENT_THEMES` array in both `build-tokens.js` and `scripts/build-package.js`.
4. Run `npm run build`. The theme CSS, its JSON, and its entry in the `themes/index.min.css` barrel are generated automatically — consumers don't change their config.
5. Apply it with `data-theme="<name>"`.

## Publishing

```bash
npm run publish:patch   # or publish:minor / publish:major
```

`prepublishOnly` runs the build automatically before publishing.

## Contributing

1. Modify token definitions under `tokens/` (core or a theme).
2. Run `npm run build` to regenerate `dist/`.
3. Verify in a consuming app.
4. Open a pull request.

## License

MIT
