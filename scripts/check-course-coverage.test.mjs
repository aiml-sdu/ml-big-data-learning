import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCoverageLedger, validateCoverage } from './check-course-coverage.mjs';

const readyRelease = 'Status: **ready**';

function planWith(row) {
  return `# Course plan

## Content coverage ledger

| ID | Source and locator | Required content or performance | Importance | Destination | Evidence | Status | Decision note |
| --- | --- | --- | --- | --- | --- | --- | --- |
${row}

## Risks
`;
}

test('a ready release rejects unresolved coverage', () => {
  const items = parseCoverageLedger(planWith('| `COV-001` | slides.pdf, slide 2 | Explain the rule | core | module-1 | TODO | unassigned | TODO |'));
  assert.throws(() => validateCoverage(items, readyRelease), /COV-001 is unassigned/);
});

test('a ready release rejects deferred coverage without an instructor decision', () => {
  const items = parseCoverageLedger(planWith('| `COV-002` | slides.pdf, slide 3 | Optional history | enrichment | later course | n\/a | deferred | TODO |'));
  assert.throws(() => validateCoverage(items, readyRelease), /without an instructor-confirmed decision note/);
});

test('reviewed coverage with exact evidence satisfies the release guard', () => {
  const items = parseCoverageLedger(planWith('| `COV-003` | slides.pdf, slides 4-6 | Calculate the value | core | module-2 | worked example and transfer check | reviewed | Approved by instructor |'));
  const result = validateCoverage(items, readyRelease);
  assert.equal(result.releaseReady, true);
  assert.equal(result.counts.reviewed, 1);
});

test('unresolved coverage remains valid during authoring', () => {
  const items = parseCoverageLedger(planWith('| `COV-004` | TODO | TODO | core | TODO | TODO | planned | TODO |'));
  const result = validateCoverage(items, 'Status: **not prepared**');
  assert.equal(result.releaseReady, false);
  assert.equal(result.counts.planned, 1);
});
