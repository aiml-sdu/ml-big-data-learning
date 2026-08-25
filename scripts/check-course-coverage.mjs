import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const allowedStatuses = new Set(['unassigned', 'planned', 'implemented', 'reviewed', 'deferred', 'excluded']);
const resolvedStatuses = new Set(['reviewed', 'deferred', 'excluded']);

export function parseCoverageLedger(plan) {
  const ledgerStart = plan.indexOf('## Content coverage ledger');
  if (ledgerStart < 0) throw new Error('course/COURSE_PLAN.md has no content coverage ledger.');

  const afterHeading = plan.slice(ledgerStart + '## Content coverage ledger'.length);
  const nextHeading = afterHeading.search(/\n##\s/);
  const ledger = nextHeading < 0 ? afterHeading : afterHeading.slice(0, nextHeading);
  const items = [];
  const ids = new Set();

  for (const line of ledger.split(/\r?\n/)) {
    if (!line.trimStart().startsWith('|')) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim().replace(/^`|`$/g, ''));
    const id = cells[0];
    if (!/^COV-[A-Z0-9-]+$/.test(id ?? '')) continue;
    if (cells.length !== 8) throw new Error(`${id} must have all eight coverage-ledger fields.`);
    if (ids.has(id)) throw new Error(`Duplicate coverage ID: ${id}.`);
    ids.add(id);

    const [coverageId, source, requirement, importance, destination, evidence, rawStatus, decisionNote] = cells;
    const status = rawStatus.toLowerCase();
    if (!allowedStatuses.has(status)) throw new Error(`${coverageId} has unknown coverage status: ${rawStatus}.`);
    items.push({ id: coverageId, source, requirement, importance, destination, evidence, status, decisionNote });
  }

  return items;
}

export function validateCoverage(items, release) {
  const counts = Object.fromEntries([...allowedStatuses].map((status) => [status, items.filter((item) => item.status === status).length]));
  const releaseReady = /Status:\s*\*\*ready\*\*/i.test(release);

  if (releaseReady) {
    const failures = [];
    if (items.length === 0) failures.push('A ready release must contain at least one coverage item.');

    for (const item of items) {
      if (!resolvedStatuses.has(item.status)) failures.push(`${item.id} is ${item.status}, not reviewed, deferred, or excluded.`);
      if (item.status === 'reviewed') {
        for (const [field, value] of [['source', item.source], ['requirement', item.requirement], ['destination', item.destination], ['evidence', item.evidence]]) {
          if (!value || /\bTODO\b/i.test(value)) failures.push(`${item.id} needs a resolved ${field} field.`);
        }
      }
      if (['deferred', 'excluded'].includes(item.status) && (!item.decisionNote || /\bTODO\b/i.test(item.decisionNote))) {
        failures.push(`${item.id} is ${item.status} without an instructor-confirmed decision note.`);
      }
    }

    if (failures.length > 0) throw new Error(`Ready release has unresolved content coverage:\n${failures.join('\n')}`);
  }

  return { counts, releaseReady };
}

async function main() {
  const plan = await readFile(resolve(root, 'course/COURSE_PLAN.md'), 'utf8');
  const release = await readFile(resolve(root, 'course/RELEASE.md'), 'utf8');
  const items = parseCoverageLedger(plan);
  const { counts, releaseReady } = validateCoverage(items, release);
  console.log(`Coverage ledger: ${items.length} item(s); ${Object.entries(counts).map(([status, count]) => `${status}=${count}`).join(', ')}${releaseReady ? '; release status=ready' : '; release status is not ready'}.`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
