export interface DesignToken {
  value: string;
  type?: string;
  description?: string;
}

export interface TokenCollection {
  [key: string]: DesignToken | string;
}

export interface PollyDesignTokens {
  // All tokens
  tokens: TokenCollection;
  
  // Categorized tokens
  coreTokens: TokenCollection;
  semanticTokens: TokenCollection;
  
  // Utility functions
  getToken(path: string): DesignToken | string | null;
  getCSSVariable(path: string): string | null;
  createTheme(overrides?: TokenCollection): TokenCollection;
}

// Named exports
export declare const tokens: TokenCollection;
export declare const coreTokens: TokenCollection;
export declare const semanticTokens: TokenCollection;

export declare function getToken(path: string): DesignToken | string | null;
export declare function getCSSVariable(path: string): string | null;
export declare function createTheme(overrides?: TokenCollection): TokenCollection;

// Default export
declare const pollyDesignTokens: PollyDesignTokens;
export default pollyDesignTokens;

// Module declarations for CSS and SCSS imports
declare module '@polly/design-tokens/css' {
  const css: string;
  export default css;
}

declare module '@polly/design-tokens/scss' {
  const scss: string;
  export default scss;
}

declare module '@polly/design-tokens/tokens' {
  const tokens: TokenCollection;
  export default tokens;
}