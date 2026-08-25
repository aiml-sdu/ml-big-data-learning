import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const requiredSections = [
  'Release target',
  'Content approval',
  'Content coverage',
  'Rights and privacy',
  'Learner experience evidence',
  'Engineering evidence',
  'Deployment and rollback',
  'Open blockers',
  'Decision log',
];

function sectionBody(markdown, heading) {
  const headings = [...markdown.matchAll(/^## (.+?)\s*$/gm)];
  const index = headings.findIndex((match) => match[1].trim().toLowerCase() === heading.toLowerCase());
  if (index < 0) return null;
  const start = (headings[index].index ?? 0) + headings[index][0].length;
  const end = headings[index + 1]?.index ?? markdown.length;
  return markdown.slice(start, end).trim();
}

export function releaseReadinessIssues(markdown) {
  const issues = [];
  const status = markdown.match(/^Status:\s*\*\*([^*]+)\*\*\s*$/mi)?.[1]?.trim().toLowerCase();

  if (status !== 'ready') {
    issues.push('Set `Status: **ready**` only after the release audit is complete.');
  }

  for (const section of requiredSections) {
    if (sectionBody(markdown, section) === null) issues.push(`Add the \`## ${section}\` section.`);
  }

  for (const placeholder of ['TODO', 'TBD', 'pending']) {
    const valuePattern = new RegExp(`^\\s*-?[^|\\n]*:\\s*${placeholder}\\.?\\s*$`, 'i');
    const bulletPattern = new RegExp(`^\\s*-\\s*${placeholder}\\.?\\s*$`, 'i');
    const hasPlaceholderValue = markdown.split('\n').some((line) => {
      const tableCells = line.startsWith('|') ? line.split('|').slice(1, -1).map((cell) => cell.trim()) : [];
      return valuePattern.test(line) || bulletPattern.test(line) || tableCells.some((cell) => cell.toLowerCase() === placeholder.toLowerCase());
    });
    if (hasPlaceholderValue) {
      issues.push(`Replace every ${placeholder} placeholder with dated evidence or an explicit decision.`);
    }
  }

  const blockers = sectionBody(markdown, 'Open blockers');
  if (blockers !== null && !/^-\s+None\.?\s*$/i.test(blockers)) {
    issues.push('The `Open blockers` section must contain only `- None.` before deployment.');
  }

  const engineering = sectionBody(markdown, 'Engineering evidence');
  if (engineering !== null && !/^-\s+`npm run ci`:\s*\S.+$/mi.test(engineering)) {
    issues.push('Record the dated `npm run ci` result under `Engineering evidence`.');
  }

  return issues;
}

export async function checkReleaseReadiness(path = resolve('course/RELEASE.md')) {
  const markdown = await readFile(path, 'utf8');
  const issues = releaseReadinessIssues(markdown);
  if (issues.length > 0) {
    throw new Error(`Release is not ready:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
  }
  return path;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  try {
    const path = await checkReleaseReadiness();
    console.log(`Release record is ready: ${path}`);
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
