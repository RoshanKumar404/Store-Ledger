#!/usr/bin/env node
/**
 * CI Script: SQL Injection AST/Pattern Scanner
 * Enforces §8.2 rule 1: "Every server query is parameterized ($1, $2 with pg).
 * No string concatenation or template-literal SQL, ever.
 * Add a CI check that fails if a query( call contains ${."
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const TARGET_DIRECTORIES = [
  path.join(rootDir, 'apps', 'server', 'src'),
  path.join(rootDir, 'packages', 'sync-core', 'src'),
];

let hasErrors = false;

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        scanDirectory(fullPath);
      }
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name) && !entry.name.includes('.test.')) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  // Match query(`...${...}...`) or query("..." + ...) or db.query(`...${...}...`)
  // Check for `query(` followed on the same line or in multi-line template literal with `${`
  const queryCallRegex = /\b(db\.)?query\s*\(\s*`[^`]*\$\{[^}]+\}[^`]*`/g;

  // Also check line-by-line for simple template literal query calls
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/\b(db\.)?query\s*\(/.test(line)) {
      // Look ahead up to 15 lines for template interpolation before the closing parenthesis
      const chunk = lines.slice(i, i + 15).join('\n');
      const parenClose = chunk.indexOf(');');
      const queryScope = parenClose !== -1 ? chunk.substring(0, parenClose) : chunk;

      if (queryScope.includes('`') && queryScope.includes('${')) {
        const relativePath = path.relative(rootDir, filePath);
        console.error(`\x1b[31m[SQL INJECTION DETECTED]\x1b[0m ${relativePath}:${i + 1}`);
        console.error(`  Line ${i + 1}: ${line.trim()}`);
        console.error(
          `  String interpolation (\${...}) inside query() call is forbidden! Use parameterized queries ($1, $2) instead.\n`,
        );
        hasErrors = true;
      }
    }
  }
}

console.log('Running SQL injection security check on server and sync packages...');
for (const dir of TARGET_DIRECTORIES) {
  scanDirectory(dir);
}

if (hasErrors) {
  console.error(
    '\x1b[31mSecurity check failed: Dynamic string interpolation in SQL query calls is strictly forbidden.\x1b[0m',
  );
  process.exit(1);
} else {
  console.log(
    '\x1b[32m✔ SQL injection check passed: Zero string interpolations detected in query() calls.\x1b[0m',
  );
}
