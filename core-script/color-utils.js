// color-utility.js
// Functions for token processing and color manipulation

const {
  D65,
  EPSILON,
  GAMMA_THRESHOLD_DECODE,
  GAMMA_THRESHOLD_ENCODE,
  GAMMA_LINEAR_SCALE,
  GAMMA_COMPRESS_OFFSET,
  GAMMA_COMPRESS_DENOM,
  GAMMA_EXPONENT,
  RGB_TO_XYZ,
  XYZ_TO_RGB,
  LINEAR_ENCODE_THRESHOLD,
  LINEAR_ENCODE_DIVISOR,
  LAB_OFFSET,
  LAB_L_SCALE,
  LAB_A_SCALE,
  LAB_B_SCALE,
  LAB_KAPPA_SCALED,
  HUE_MAX,
  HUE_HALF,
  RGB_CHANNEL_MIN,
  RGB_CHANNEL_MAX,
  COLOR_MIX_METHODS,
} = require('./constants');

// ---------------------------------------------------------------------------
// Input Validation Helpers
// ---------------------------------------------------------------------------

/**
 * Validates that a hex color string is in the correct format.
 * Accepts strings with or without a leading '#'.
 * @param {string} hex
 * @returns {{ valid: boolean, error?: string }}
 */
function validateHex(hex) {
  if (typeof hex !== 'string') {
    return { valid: false, error: `Expected a string, received ${typeof hex}` };
  }

  // Strip leading '#' if present before checking the pattern
  const stripped = hex.startsWith('#') ? hex.slice(1) : hex;

  if (!/^[0-9a-fA-F]{6}$/.test(stripped)) {
    return {
      valid: false,
      error: `Invalid hex color "${hex}". Expected a 6-digit hex string (e.g. #rrggbb).`,
    };
  }

  return { valid: true };
}

/**
 * Validates RGB channel values.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {{ valid: boolean, error?: string }}
 */
function validateRgb(r, g, b) {
  const channels = { r, g, b };

  for (const [name, value] of Object.entries(channels)) {
    if (typeof value !== 'number' || isNaN(value)) {
      return {
        valid: false,
        error: `RGB channel "${name}" must be a number, received ${value}.`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validates HSL values.
 * @param {number} h - Hue (0–360)
 * @param {number} s - Saturation (0–100)
 * @param {number} l - Lightness (0–100)
 * @returns {{ valid: boolean, error?: string }}
 */
function validateHsl(h, s, l) {
  if (typeof h !== 'number' || isNaN(h) || h < 0 || h > HUE_MAX) {
    return {
      valid: false,
      error: `Hue must be a number between 0 and ${HUE_MAX}, received ${h}.`,
    };
  }

  if (typeof s !== 'number' || isNaN(s) || s < 0 || s > 100) {
    return {
      valid: false,
      error: `Saturation must be a number between 0 and 100, received ${s}.`,
    };
  }

  if (typeof l !== 'number' || isNaN(l) || l < 0 || l > 100) {
    return {
      valid: false,
      error: `Lightness must be a number between 0 and 100, received ${l}.`,
    };
  }

  return { valid: true };
}

/**
 * Validates the inputs for colorMix.
 * @param {string} color1
 * @param {number} percent1
 * @param {string} color2
 * @param {number} percent2
 * @param {string} method
 * @returns {{ valid: boolean, error?: string }}
 */
function validateColorMixInputs(color1, percent1, color2, percent2, method) {
  const hex1Validation = validateHex(color1);
  if (!hex1Validation.valid) {
    return { valid: false, error: `color1: ${hex1Validation.error}` };
  }

  const hex2Validation = validateHex(color2);
  if (!hex2Validation.valid) {
    return { valid: false, error: `color2: ${hex2Validation.error}` };
  }

  if (typeof percent1 !== 'number' || isNaN(percent1) || percent1 < 0) {
    return {
      valid: false,
      error: `percent1 must be a non-negative number, received ${percent1}.`,
    };
  }

  if (typeof percent2 !== 'number' || isNaN(percent2) || percent2 < 0) {
    return {
      valid: false,
      error: `percent2 must be a non-negative number, received ${percent2}.`,
    };
  }

  const validMethods = Object.values(COLOR_MIX_METHODS);
  if (!validMethods.includes(method)) {
    return {
      valid: false,
      error: `Unknown color mix method "${method}". Valid methods: ${validMethods.join(', ')}.`,
    };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Hex ↔ RGB
// ---------------------------------------------------------------------------

/**
 * Converts a hex color string to an RGB object.
 * Accepts strings with or without a leading '#'.
 * @param {string} hex
 * @returns {{ r: number, g: number, b: number }}
 */
function hexToRgb(hex) {
  const validation = validateHex(hex);
  if (!validation.valid) {
    throw new Error(`hexToRgb: ${validation.error}`);
  }

  // Normalise: ensure the string has a leading '#'
  const normalised = hex.startsWith('#') ? hex : `#${hex}`;

  const r = parseInt(normalised.slice(1, 3), 16);
  const g = parseInt(normalised.slice(3, 5), 16);
  const b = parseInt(normalised.slice(5, 7), 16);

  return { r, g, b };
}

/**
 * Converts RGB channel values to a hex color string.
 * Each channel is clamped to [0, 255] and rounded before conversion.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string} Hex color string (e.g. '#rrggbb')
 */
function rgbToHex(r, g, b) {
  const validation = validateRgb(r, g, b);
  if (!validation.valid) {
    throw new Error(`rgbToHex: ${validation.error}`);
  }

  const toHex = (c) => {
    // Clamp to valid range then round before converting
    const clamped = Math.max(RGB_CHANNEL_MIN, Math.min(RGB_CHANNEL_MAX, Math.round(c)));
    const hex = clamped.toString(16);
    return (hex.length === 1) ? (`0${hex}`) : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ---------------------------------------------------------------------------
// Hex ↔ HSL
// ---------------------------------------------------------------------------

/**
 * Converts a hex color string to an HSL array [h, s, l].
 * @param {string} hex
 * @returns {[number, number, number]} [hue (0–360), saturation (0–100), lightness (0–100)]
 */
function hexToHsl(hex) {
  const validation = validateHex(hex);
  if (!validation.valid) {
    throw new Error(`hexToHsl: ${validation.error}`);
  }

  const normalised = hex.startsWith('#') ? hex : `#${hex}`;

  const r = (parseInt(normalised.slice(1, 3), 16) / RGB_CHANNEL_MAX);
  const g = (parseInt(normalised.slice(3, 5), 16) / RGB_CHANNEL_MAX);
  const b = (parseInt(normalised.slice(5, 7), 16) / RGB_CHANNEL_MAX);

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  let s;
  let l = ((max + min) / 2);

  if (max === min) {
    // Achromatic
    h = 0;
    s = 0;
  } else {
    const d = (max - min);
    s = (l > 0.5) ? (d / (2 - max - min)) : (d / (max + min));

    switch (max) {
      case r: {
        h = (((g - b) / d) + (g < b ? 6 : 0));
        break;
      }
      case g: {
        h = (((b - r) / d) + 2);
        break;
      }
      case b: {
        h = (((r - g) / d) + 4);
        break;
      }
      default: {
        h = 0;
        break;
      }
    }

    h = (h / 6);
  }

  return [(h * HUE_MAX), (s * 100), (l * 100)];
}

/**
 * Converts HSL values to a hex color string.
 * @param {number} h - Hue (0–360)
 * @param {number} s - Saturation (0–100)
 * @param {number} l - Lightness (0–100)
 * @returns {string} Hex color string
 */
function hslToHex(h, s, l) {
  const validation = validateHsl(h, s, l);
  if (!validation.valid) {
    throw new Error(`hslToHex: ${validation.error}`);
  }

  const hNorm = (h / HUE_MAX);
  const sNorm = (s / 100);
  const lNorm = (l / 100);

  /**
   * Helper: convert a hue fraction to an RGB channel value.
   * @param {number} p
   * @param {number} q
   * @param {number} t
   * @returns {number}
   */
  const hue2rgb = (p, q, t) => {
    let tMut = t;
    if (tMut < 0) { tMut += 1; }
    if (tMut > 1) { tMut -= 1; }
    if (tMut < (1 / 6)) { return (p + ((q - p) * 6 * tMut)); }
    if (tMut < (1 / 2)) { return q; }
    if (tMut < (2 / 3)) { return (p + ((q - p) * ((2 / 3) - tMut) * 6)); }
    return p;
  };

  let r;
  let g;
  let b;

  if (sNorm === 0) {
    // Achromatic
    r = lNorm;
    g = lNorm;
    b = lNorm;
  } else {
    const q = (lNorm < 0.5)
      ? (lNorm * (1 + sNorm))
      : (lNorm + sNorm - (lNorm * sNorm));
    const p = ((2 * lNorm) - q);

    r = hue2rgb(p, q, (hNorm + (1 / 3)));
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, (hNorm - (1 / 3)));
  }

  const toHex = (c) => {
    const hex = Math.round(c * RGB_CHANNEL_MAX).toString(16);
    return (hex.length === 1) ? (`0${hex}`) : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// ---------------------------------------------------------------------------
// Hex ↔ LAB
// ---------------------------------------------------------------------------

/**
 * Converts a hex color string to a CIE LAB object.
 * @param {string} hex
 * @returns {{ l: number, a: number, b: number }}
 */
function hexToLab(hex) {
  const validation = validateHex(hex);
  if (!validation.valid) {
    throw new Error(`hexToLab: ${validation.error}`);
  }

  const rgb = hexToRgb(hex);

  // Normalise RGB channels to [0, 1]
  let r = (rgb.r / RGB_CHANNEL_MAX);
  let g = (rgb.g / RGB_CHANNEL_MAX);
  let b = (rgb.b / RGB_CHANNEL_MAX);

  // Apply gamma decoding (sRGB → linear light)
  r = (r > GAMMA_THRESHOLD_DECODE)
    ? Math.pow(((r + GAMMA_COMPRESS_OFFSET) / GAMMA_COMPRESS_DENOM), GAMMA_EXPONENT)
    : (r / GAMMA_LINEAR_SCALE);

  g = (g > GAMMA_THRESHOLD_DECODE)
    ? Math.pow(((g + GAMMA_COMPRESS_OFFSET) / GAMMA_COMPRESS_DENOM), GAMMA_EXPONENT)
    : (g / GAMMA_LINEAR_SCALE);

  b = (b > GAMMA_THRESHOLD_DECODE)
    ? Math.pow(((b + GAMMA_COMPRESS_OFFSET) / GAMMA_COMPRESS_DENOM), GAMMA_EXPONENT)
    : (b / GAMMA_LINEAR_SCALE);

  // Convert linear RGB → CIE XYZ (Observer = 2°, Illuminant = D65), scale to [0, 100]
  const x = ((r * RGB_TO_XYZ.RX) + (g * RGB_TO_XYZ.GX) + (b * RGB_TO_XYZ.BX)) * 100;
  const y = ((r * RGB_TO_XYZ.RY) + (g * RGB_TO_XYZ.GY) + (b * RGB_TO_XYZ.BY)) * 100;
  const z = ((r * RGB_TO_XYZ.RZ) + (g * RGB_TO_XYZ.GZ) + (b * RGB_TO_XYZ.BZ)) * 100;

  // Normalise XYZ by D65 reference white
  const xRatio = (x / D65.X);
  const yRatio = (y / D65.Y);
  const zRatio = (z / D65.Z);

  // Apply CIE f() function
  const fx = (xRatio > EPSILON)
    ? Math.pow(xRatio, (1 / 3))
    : ((LAB_KAPPA_SCALED * xRatio) + (LAB_OFFSET / LAB_L_SCALE));

  const fy = (yRatio > EPSILON)
    ? Math.pow(yRatio, (1 / 3))
    : ((LAB_KAPPA_SCALED * yRatio) + (LAB_OFFSET / LAB_L_SCALE));

  const fz = (zRatio > EPSILON)
    ? Math.pow(zRatio, (1 / 3))
    : ((LAB_KAPPA_SCALED * zRatio) + (LAB_OFFSET / LAB_L_SCALE));

  const l = ((LAB_L_SCALE * fy) - LAB_OFFSET);
  const a = (LAB_A_SCALE * (fx - fy));
  const bLab = (LAB_B_SCALE * (fy - fz));

  return { l, a, b: bLab };
}

/**
 * Converts CIE LAB values back to a hex color string.
 * @param {number} l - Lightness
 * @param {number} a - Green–red component
 * @param {number} b - Blue–yellow component
 * @returns {string} Hex color string
 */
function labToHex(l, a, b) {
  // Convert LAB → CIE XYZ
  const fy = ((l + LAB_OFFSET) / LAB_L_SCALE);
  const fx = ((a / LAB_A_SCALE) + fy);
  const fz = (fy - (b / LAB_B_SCALE));

  const fxCubed = (fx * fx * fx);
  const fyCubed = (fy * fy * fy);
  const fzCubed = (fz * fz * fz);

  const x = D65.X * (
    (fxCubed > EPSILON)
      ? fxCubed
      : ((fx - (LAB_OFFSET / LAB_L_SCALE)) / LAB_KAPPA_SCALED)
  );

  const y = D65.Y * (
    (fyCubed > EPSILON)
      ? fyCubed
      : ((fy - (LAB_OFFSET / LAB_L_SCALE)) / LAB_KAPPA_SCALED)
  );

  const z = D65.Z * (
    (fzCubed > EPSILON)
      ? fzCubed
      : ((fz - (LAB_OFFSET / LAB_L_SCALE)) / LAB_KAPPA_SCALED)
  );

  // Convert CIE XYZ → linear RGB (values in [0, 1] range)
  let r = ((x * XYZ_TO_RGB.RX) + (y * XYZ_TO_RGB.RY) + (z * XYZ_TO_RGB.RZ)) / 100;
  let g = ((x * XYZ_TO_RGB.GX) + (y * XYZ_TO_RGB.GY) + (z * XYZ_TO_RGB.GZ)) / 100;
  let bRgb = ((x * XYZ_TO_RGB.BX) + (y * XYZ_TO_RGB.BY) + (z * XYZ_TO_RGB.BZ)) / 100;

  // Apply gamma encoding (linear light → sRGB)
  r = (r > GAMMA_THRESHOLD_ENCODE)
    ? ((GAMMA_COMPRESS_DENOM * Math.pow(r, (1 / GAMMA_EXPONENT))) - GAMMA_COMPRESS_OFFSET)
    : (GAMMA_LINEAR_SCALE * r);

  g = (g > GAMMA_THRESHOLD_ENCODE)
    ? ((GAMMA_COMPRESS_DENOM * Math.pow(g, (1 / GAMMA_EXPONENT))) - GAMMA_COMPRESS_OFFSET)
    : (GAMMA_LINEAR_SCALE * g);

  bRgb = (bRgb > GAMMA_THRESHOLD_ENCODE)
    ? ((GAMMA_COMPRESS_DENOM * Math.pow(bRgb, (1 / GAMMA_EXPONENT))) - GAMMA_COMPRESS_OFFSET)
    : (GAMMA_LINEAR_SCALE * bRgb);

  // Clamp to [0, 1] before scaling to 8-bit
  r = Math.max(0, Math.min(1, r));
  g = Math.max(0, Math.min(1, g));
  bRgb = Math.max(0, Math.min(1, bRgb));

  return rgbToHex(
    Math.round(r * RGB_CHANNEL_MAX),
    Math.round(g * RGB_CHANNEL_MAX),
    Math.round(bRgb * RGB_CHANNEL_MAX),
  );
}

// ---------------------------------------------------------------------------
// Color Mixing
// ---------------------------------------------------------------------------

/**
 * Mixes two hex colors in the given color space.
 * @param {string} color1    - First hex color
 * @param {number} percent1  - Weight of the first color (non-negative)
 * @param {string} color2    - Second hex color
 * @param {number} percent2  - Weight of the second color (non-negative)
 * @param {string} [method='srgb'] - Color space to use for mixing
 * @returns {string} Resulting hex color string
 */
function colorMix(color1, percent1, color2, percent2, method = COLOR_MIX_METHODS.SRGB) {
  const validation = validateColorMixInputs(color1, percent1, color2, percent2, method);
  if (!validation.valid) {
    throw new Error(`colorMix: ${validation.error}`);
  }

  // Guard against a zero total (both weights are 0)
  const total = (percent1 + percent2);
  if (total === 0) {
    throw new Error('colorMix: percent1 and percent2 must not both be zero.');
  }

  // Normalise weights to sum to 1
  const p1 = (percent1 / total);
  const p2 = (percent2 / total);

  switch (method) {
    case COLOR_MIX_METHODS.SRGB:
    case COLOR_MIX_METHODS.SRGB_LINEAR: {
      const c1 = hexToRgb(color1);
      const c2 = hexToRgb(color2);

      if (method === COLOR_MIX_METHODS.SRGB_LINEAR) {
        // Decode to linear light, mix, then re-encode to sRGB
        const toLinear = (c) => (
          (c <= LINEAR_ENCODE_THRESHOLD)
            ? (c / LINEAR_ENCODE_DIVISOR)
            : Math.pow((((c / RGB_CHANNEL_MAX) + GAMMA_COMPRESS_OFFSET) / GAMMA_COMPRESS_DENOM), GAMMA_EXPONENT)
        );

        const toGamma = (c) => (
          (c <= GAMMA_THRESHOLD_ENCODE)
            ? (c * LINEAR_ENCODE_DIVISOR)
            : (RGB_CHANNEL_MAX * ((GAMMA_COMPRESS_DENOM * Math.pow(c, (1 / GAMMA_EXPONENT))) - GAMMA_COMPRESS_OFFSET))
        );

        const r1 = toLinear(c1.r);
        const g1 = toLinear(c1.g);
        const b1 = toLinear(c1.b);
        const r2 = toLinear(c2.r);
        const g2 = toLinear(c2.g);
        const b2 = toLinear(c2.b);

        const r = toGamma((r1 * p1) + (r2 * p2));
        const g = toGamma((g1 * p1) + (g2 * p2));
        const b = toGamma((b1 * p1) + (b2 * p2));

        return rgbToHex(Math.round(r), Math.round(g), Math.round(b));
      }

      // Plain sRGB: mix channel values directly
      const r = Math.round((c1.r * p1) + (c2.r * p2));
      const g = Math.round((c1.g * p1) + (c2.g * p2));
      const b = Math.round((c1.b * p1) + (c2.b * p2));

      return rgbToHex(r, g, b);
    }

    case COLOR_MIX_METHODS.LAB:
    case COLOR_MIX_METHODS.OKLAB: {
      // Perceptually uniform mixing in CIE LAB
      const lab1 = hexToLab(color1);
      const lab2 = hexToLab(color2);

      const l = ((lab1.l * p1) + (lab2.l * p2));
      const a = ((lab1.a * p1) + (lab2.a * p2));
      const b = ((lab1.b * p1) + (lab2.b * p2));

      return labToHex(l, a, b);
    }

    case COLOR_MIX_METHODS.LCH:
    case COLOR_MIX_METHODS.OKLCH: {
      // Mix in the cylindrical LCH representation of CIE LAB
      const lab1 = hexToLab(color1);
      const lab2 = hexToLab(color2);

      /**
       * Convert a LAB object to LCH { l, c, h }.
       * @param {{ l: number, a: number, b: number }} lab
       * @returns {{ l: number, c: number, h: number }}
       */
      const toLch = (lab) => {
        const c = Math.sqrt((lab.a * lab.a) + (lab.b * lab.b));
        const hDeg = ((Math.atan2(lab.b, lab.a) * HUE_MAX) / (2 * Math.PI));
        return { l: lab.l, c, h: (hDeg < 0) ? (hDeg + HUE_MAX) : hDeg };
      };

      const lch1 = toLch(lab1);
      const lch2 = toLch(lab2);

      const l = ((lch1.l * p1) + (lch2.l * p2));
      const c = ((lch1.c * p1) + (lch2.c * p2));

      // Shortest-path angular interpolation for hue
      let h1 = lch1.h;
      let h2 = lch2.h;
      const delta = (h2 - h1);

      if (delta > HUE_HALF) {
        h2 -= HUE_MAX;
      } else if (delta < -HUE_HALF) {
        h2 += HUE_MAX;
      }

      let h = ((h1 * p1) + (h2 * p2));
      if (h < 0) { h += HUE_MAX; }
      if (h >= HUE_MAX) { h -= HUE_MAX; }

      // Convert LCH back to LAB
      const hRad = ((h * 2 * Math.PI) / HUE_MAX);
      const a = (c * Math.cos(hRad));
      const b = (c * Math.sin(hRad));

      return labToHex(l, a, b);
    }

    case COLOR_MIX_METHODS.DISPLAY_P3: {
      // Approximate display-p3 with sRGB
      // A full implementation would require ICC profile conversion.
      return colorMix(color1, percent1, color2, percent2, COLOR_MIX_METHODS.SRGB);
    }

    default: {
      // Fallback to sRGB for any unrecognised method
      return colorMix(color1, percent1, color2, percent2, COLOR_MIX_METHODS.SRGB);
    }
  }
}

// ---------------------------------------------------------------------------
// HSL-based Adjustments
// ---------------------------------------------------------------------------

/**
 * Darkens a color by reducing its HSL lightness.
 * @param {string} color - Hex color string
 * @param {number} percentage - Amount to darken (0–100)
 * @returns {string} Darkened hex color string
 */
function shade(color, percentage) {
  const [h, s, l] = hexToHsl(color);
  return hslToHex(h, s, Math.max(0, (l - percentage)));
}

/**
 * Lightens a color by increasing its HSL lightness.
 * @param {string} color - Hex color string
 * @param {number} percentage - Amount to lighten (0–100)
 * @returns {string} Lightened hex color string
 */
function tint(color, percentage) {
  const [h, s, l] = hexToHsl(color);
  return hslToHex(h, s, Math.min(100, (l + percentage)));
}

/**
 * Increases the saturation of a color.
 * @param {string} color - Hex color string
 * @param {number} percentage - Amount to saturate (0–100)
 * @returns {string} More-saturated hex color string
 */
function saturate(color, percentage) {
  const [h, s, l] = hexToHsl(color);
  return hslToHex(h, Math.min(100, (s + percentage)), l);
}

/**
 * Decreases the saturation of a color.
 * @param {string} color - Hex color string
 * @param {number} percentage - Amount to desaturate (0–100)
 * @returns {string} Less-saturated hex color string
 */
function desaturate(color, percentage) {
  const [h, s, l] = hexToHsl(color);
  return hslToHex(h, Math.max(0, (s - percentage)), l);
}

// ---------------------------------------------------------------------------
// Alpha
// ---------------------------------------------------------------------------

/**
 * Returns an rgba() CSS string for the given hex color and opacity.
 * @param {string} color - Hex color string
 * @param {number} opacity - Opacity value (0–1)
 * @returns {string} CSS rgba() string
 */
function alpha(color, opacity) {
  const validation = validateHex(color);
  if (!validation.valid) {
    throw new Error(`alpha: ${validation.error}`);
  }

  const rgb = hexToRgb(color);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  // Conversion utilities
  hexToRgb,
  rgbToHex,
  hexToHsl,
  hslToHex,
  hexToLab,
  labToHex,
  // Mixing
  colorMix,
  // HSL adjustments
  shade,
  tint,
  saturate,
  desaturate,
  // Alpha
  alpha,
  // Validators (exported so callers can pre-validate if desired)
  validateHex,
  validateRgb,
  validateHsl,
  validateColorMixInputs,
};