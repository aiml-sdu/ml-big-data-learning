import { readdir, readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const scanRoots = ['src', 'course/module-briefs'];
const extensions = new Set(['.md', '.ts', '.tsx']);

const rules = [
  { label: 'em dash', pattern: /\u2014/g },
  { label: 'double dash used as punctuation', pattern: /\s--\s/g },
  { label: 'inflated AI-shaped verb', pattern: /\b(delve|leverage|utilize|facilitate|showcases?)\b/gi },
  { label: 'stock transition', pattern: /\b(moreover|furthermore|to that end|in conclusion)\b/gi },
  { label: 'empty signposting', pattern: /\bit is (important|worth noting)\b/gi },
  { label: 'hedge stack', pattern: /\b(may potentially|could possibly|might perhaps)\b/gi },
  { label: 'stock contrast', pattern: /\bnot (?:only|just)\b[^.!?]{0,100}\bbut (?:also\b)?/gi },
  { label: 'generic audience sweep', pattern: /\bwhether you(?:'|’)re\b[^.!?]{0,100}\bor\b/gi },
  { label: 'inflated invitation', pattern: /\bembark on\b/gi },
  { label: 'inflated promise', pattern: /\bunlock (?:the |your )?(?:power|potential|secrets?)\b/gi },
  { label: 'generic era opening', pattern: /\bin (?:today(?:'|’)s|an ever-changing) world\b/gi },
  { label: 'generic integration claim', pattern: /\bseamless(?:ly)? (?:integrates?|blends?|connects?)\b/gi },
  { label: 'marketing cliché', pattern: /\b(?:game-changer|a testament to)\b/gi },
];

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(path));
    else if (extensions.has(extname(entry.name))) files.push(path);
  }

  return files;
}

const files = (await Promise.all(scanRoots.map((directory) => collectFiles(resolve(root, directory))))).flat();
const findings = [];

for (const file of files) {
  const lines = (await readFile(file, 'utf8')).split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    for (const rule of rules) {
      rule.pattern.lastIndex = 0;
      if (rule.pattern.test(line)) {
        findings.push(`${file.slice(root.length + 1)}:${index + 1} ${rule.label}`);
      }
    }
  }
}

if (findings.length > 0) {
  throw new Error(`Study-content voice check failed:\n${findings.join('\n')}`);
}

console.log(`Checked ${files.length} study-content file(s) for mechanical voice warnings.`);
