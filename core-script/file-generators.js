'use strict';

const { generateCssVariables } = require('./generators/css-generator');
const { generateScssHelpers, generateScssVariables, generateMainScss, generateComponentScss } = require('./generators/scss-generator');
const { generateTypeScriptConstants } = require('./generators/ts-generator');
const { writeFiles } = require('./generators/file-writer');

// Re-export everything under the original names so nothing breaks
module.exports = {
  generateCssVariables,
  generateScssHelpers,
  generateScssVariables,
  generateMainScss,
  generateTypeScriptConstants,
  generateComponentScss,
  writeFiles,
};
