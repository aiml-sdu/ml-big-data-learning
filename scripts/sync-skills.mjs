import { cp, mkdir, readdir, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const canonicalRoot = resolve(root, '.agents/skills');
const mirrorRoot = resolve(root, '.claude/skills');
const checkOnly = process.argv.includes('--check');

const skillNames = (await readdir(canonicalRoot, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (skillNames.length === 0) {
  throw new Error('No canonical skills found in .agents/skills.');
}

const mismatches = [];

async function listFiles(directory, prefix = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(join(directory, entry.name), relativePath));
    } else if (entry.isFile()) {
      files.push(relativePath);
    }
  }

  return files.sort();
}

for (const name of skillNames) {
  if (checkOnly) {
    try {
      const canonicalDirectory = resolve(canonicalRoot, name);
      const mirrorDirectory = resolve(mirrorRoot, name);
      const canonicalFiles = await listFiles(canonicalDirectory);
      const mirrorFiles = await listFiles(mirrorDirectory);
      let matches = JSON.stringify(canonicalFiles) === JSON.stringify(mirrorFiles);

      for (const file of canonicalFiles) {
        const source = await readFile(resolve(canonicalDirectory, file));
        const copy = await readFile(resolve(mirrorDirectory, file));
        if (!source.equals(copy)) matches = false;
      }

      if (!matches) mismatches.push(name);
    } catch {
      mismatches.push(name);
    }
    continue;
  }

  await mkdir(resolve(mirrorRoot, name), { recursive: true });
  await cp(resolve(canonicalRoot, name), resolve(mirrorRoot, name), {
    recursive: true,
    force: true,
  });
}

if (mismatches.length > 0) {
  console.error(`Claude skill mirrors are missing or stale: ${mismatches.join(', ')}`);
  console.error('Run npm run sync:skills, then commit both canonical and mirrored files.');
  process.exitCode = 1;
} else if (checkOnly) {
  console.log(`Verified ${skillNames.length} canonical skill mirror(s).`);
} else {
  console.log(`Synchronized ${skillNames.length} skill(s) to .claude/skills.`);
}
