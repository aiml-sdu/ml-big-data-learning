import test from 'node:test';
import assert from 'node:assert/strict';

import { releaseReadinessIssues } from './check-release-readiness.mjs';

const readyRecord = `# Course release record

Status: **ready**

## Release target

- Owner: Course team

## Content approval

- Approved by the instructor on 2026-08-25.

## Content coverage

- All in-scope items have a reviewed disposition.

## Rights and privacy

- Reviewed on 2026-08-25.

## Learner experience evidence

- Browser and manual checks completed on 2026-08-25.

## Engineering evidence

- \`npm run ci\`: passed on 2026-08-25 with Node 22.

## Deployment and rollback

- Last known good revision: abc1234

## Open blockers

- None.

## Decision log

- 2026-08-25: Instructor approved release.
`;

test('accepts a completed ready release record', () => {
  assert.deepEqual(releaseReadinessIssues(readyRecord), []);
});

test('rejects a record that is not ready', () => {
  assert.match(releaseReadinessIssues(readyRecord.replace('**ready**', '**not prepared**')).join('\n'), /Status/);
});

test('rejects unresolved placeholders', () => {
  const issues = releaseReadinessIssues(readyRecord.replace('Course team', 'TODO'));
  assert.match(issues.join('\n'), /TODO/);
});

test('allows a completed narrative to use the word pending', () => {
  const record = readyRecord.replace('Instructor approved release.', 'No pending release work remains.');
  assert.deepEqual(releaseReadinessIssues(record), []);
});

test('rejects open blockers', () => {
  const issues = releaseReadinessIssues(readyRecord.replace('- None.', '- Mobile navigation loses focus.'));
  assert.match(issues.join('\n'), /Open blockers/);
});

test('requires a recorded CI result', () => {
  const issues = releaseReadinessIssues(readyRecord.replace('- `npm run ci`: passed on 2026-08-25 with Node 22.', '- Local checks passed.'));
  assert.match(issues.join('\n'), /npm run ci/);
});
