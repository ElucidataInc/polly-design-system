// constants.js
// Color space constants for color calculations

// D65 illuminant reference values (Observer = 2°, Illuminant = D65)
const D65 = Object.freeze({
  X: 95.047,
  Y: 100.0,
  Z: 108.883,
});

// LAB color space thresholds
const EPSILON = 0.008856; // Intent: 216/24389
const KAPPA = 903.3; // Intent: 24389/27

// Gamma correction thresholds
const GAMMA_THRESHOLD_DECODE = 0.04045;
const GAMMA_THRESHOLD_ENCODE = 0.0031308;
const GAMMA_LINEAR_SCALE = 12.92;
const GAMMA_COMPRESS_OFFSET = 0.055;
const GAMMA_COMPRESS_DENOM = 1.055;
const GAMMA_EXPONENT = 2.4;

// RGB-XYZ matrix coefficients (sRGB, D65)
const RGB_TO_XYZ = Object.freeze({
  RX: 0.4124,
  RY: 0.2126,
  RZ: 0.0193,
  GX: 0.3576,
  GY: 0.7152,
  GZ: 0.1192,
  BX: 0.1805,
  BY: 0.0722,
  BZ: 0.9505,
});

// XYZ-RGB matrix coefficients (sRGB, D65)
const XYZ_TO_RGB = Object.freeze({
  RX: 3.2406,
  RY: -1.5372,
  RZ: -0.4986,
  GX: -0.9689,
  GY: 1.8758,
  GZ: 0.0415,
  BX: 0.0557,
  BY: -0.204,
  BZ: 1.057,
});

// Linear light threshold constants for srgb-linear mixing
const LINEAR_ENCODE_THRESHOLD = 10;
const LINEAR_ENCODE_DIVISOR = 3294.6;

// LAB conversion helpers
const LAB_OFFSET = 16;
const LAB_L_SCALE = 116;
const LAB_A_SCALE = 500;
const LAB_B_SCALE = 200;
const LAB_KAPPA_SCALED = 7.787; // KAPPA / 116 approx

// Hue angle constants
const HUE_MAX = 360;
const HUE_HALF = 180;

// Color channel bounds
const RGB_CHANNEL_MIN = 0;
const RGB_CHANNEL_MAX = 255;

// Supported color mix methods
const COLOR_MIX_METHODS = Object.freeze({
  SRGB: 'srgb',
  SRGB_LINEAR: 'srgb-linear',
  LAB: 'lab',
  OKLAB: 'oklab',
  LCH: 'lch',
  OKLCH: 'oklch',
  DISPLAY_P3: 'display-p3',
});

module.exports = {
  D65,
  EPSILON,
  KAPPA,
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
};
