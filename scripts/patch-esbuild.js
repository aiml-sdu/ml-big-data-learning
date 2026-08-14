/**
 * Patches esbuild to use esbuild-wasm when the native binary cannot execute.
 * This is needed on environments where native binaries are sandboxed (e.g., Node 25
 * with certain macOS sandbox configurations).
 *
 * The patch copies esbuild-wasm's JS-based bin, lib, and wasm files into the
 * esbuild package directory so vite/vitest use the WASM fallback transparently.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const esbuildDir = join(root, 'node_modules', 'esbuild');
const wasmDir = join(root, 'node_modules', 'esbuild-wasm');

if (!existsSync(wasmDir)) {
  // esbuild-wasm not installed — nothing to patch
  process.exit(0);
}

// Test if the native esbuild binary works
const binPath = join(esbuildDir, 'bin', 'esbuild');
try {
  execFileSync(binPath, ['--version'], { timeout: 3000, stdio: 'pipe' });
  // Native binary works — no patch needed
  process.exit(0);
} catch {
  // Native binary fails — apply wasm patch
  console.log('[patch-esbuild] Native esbuild binary unavailable, using esbuild-wasm fallback');
}

const filesToCopy = [
  ['bin/esbuild', 'bin/esbuild'],
  ['lib/main.js', 'lib/main.js'],
  ['esbuild.wasm', 'esbuild.wasm'],
  ['wasm_exec.js', 'wasm_exec.js'],
  ['wasm_exec_node.js', 'wasm_exec_node.js'],
];

for (const [src, dst] of filesToCopy) {
  const srcPath = join(wasmDir, src);
  const dstPath = join(esbuildDir, dst);
  if (existsSync(srcPath)) {
    cpSync(srcPath, dstPath);
  }
}

console.log('[patch-esbuild] Patched esbuild with wasm fallback');
