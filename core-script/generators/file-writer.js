// Responsible ONLY for writing content to the file system

'use strict';

const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { dirname, join } = require('path');

/**
 * Ensures a directory (and all parents) exist.
 * No-ops when the directory already exists.
 *
 * @param {string} dirPath - Absolute or relative directory path
 */
function ensureDir(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Writes a single file to disk, creating parent directories as needed.
 *
 * @param {string} filePath - Full path (including filename) of the output file
 * @param {string} content  - File content to write
 * @throws {TypeError} if filePath or content are not strings
 *
 * @example
 * writeFile('/output/dist/tokens.css', ':root { --color: red; }');
 */
function writeFile(filePath, content) {
  if (typeof filePath !== 'string' || !filePath) {
    throw new TypeError('filePath must be a non-empty string');
  }
  if (typeof content !== 'string') {
    throw new TypeError('content must be a string');
  }

  ensureDir(dirname(filePath));
  writeFileSync(filePath, content, 'utf8');
}

/**
 * Writes multiple files to disk under a shared base directory.
 * Each key in `files` is a relative filename; the value is its content.
 * Parent directories (including nested) are created automatically.
 *
 * @param {string}                  buildDir - Base output directory
 * @param {Record<string, string>}  files    - Map of relative path => file content
 *
 * @example
 * writeFiles('/output/dist', {
 *   'tokens.css':        cssContent,
 *   'tokens.scss':       scssContent,
 *   'tokens.ts':         tsContent,
 *   'components/btn.scss': btnContent,
 * });
 */
function writeFiles(buildDir, files) {
  if (typeof buildDir !== 'string' || !buildDir) {
    throw new TypeError('buildDir must be a non-empty string');
  }
  if (!files || typeof files !== 'object') {
    throw new TypeError('files must be a non-null object');
  }

  ensureDir(buildDir);

  for (const [relativePath, content] of Object.entries(files)) {
    const absolutePath = join(buildDir, relativePath);
    writeFile(absolutePath, content);
  }
}

module.exports = {
  writeFile,
  writeFiles,
  ensureDir, // exported for testing / direct use
};
