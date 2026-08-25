---
name: prepare-course-release
description: Audit and prepare the whole learning platform for a course release, including content approval, source and rights checks, privacy, learner flows, browser QA, CI, deployment configuration, and rollback notes. Use for release readiness, publishing preparation, university handoff, or a final pre-launch audit. Do not deploy or change external repository settings unless the instructor explicitly asks.
---

# Prepare a course release

Produce an evidence-backed release decision for the complete platform.

## Establish the release target

Read `../../../AGENTS.md`, `../../../course/MEMORY.md`, `../../../materials/course-info.md`, `../../../course/COURSE_PLAN.md`, `../../../course/RELEASE.md`, every ready module brief and source trail, `../../../docs/content-coverage-standard.md`, `../../../docs/experience-quality-standard.md`, `../../../docs/theme-standard.md`, `../../../docs/quality-checklist.md`, and `../../../docs/release-guide.md`. Confirm the intended audience, URL or environment, date, owner, assessment relationship, publication rights, and support contact.

Ask when a missing answer changes rights, privacy, grading, accessibility, or launch timing. Local QA and documentation do not authorize pushing, deploying, changing GitHub settings, or exposing a private repository.

## Audit release lanes

1. **Content**: instructor approval is recorded for factual claims, terminology, answers, and source boundaries.
2. **Coverage**: reconcile the complete in-scope material inventory with the coverage ledger and module evidence. Every item is reviewed, deferred, or excluded with instructor approval. Unassigned, planned, unreadable without resolution, and unreviewed implemented items block release.
3. **Learning**: the course path is coherent; prerequisite, practice, feedback, and transfer are represented; pilot evidence is described honestly.
4. **Experience**: evaluate every dimension in `docs/experience-quality-standard.md`; every core route, activity, error recovery, previous or next link, mobile menu, reload, and return visit works with keyboard and pointer input.
5. **Accessibility**: the automated axe scan passes across registered pages and both themes; semantic structure, focus, reflow, target size, alternatives, reduced motion, screen-reader output, and keyboard use also have manual evidence.
6. **Privacy and rights**: `public/`, imports, and `dist/` contain no restricted source, student data, unpublished assessment, unapproved asset, or font without a confirmed publication path. The final platform follows the approved material-grounded visual direction without copying restricted source layouts or media.
7. **Engineering**: `npm run ci` passes against the production preview; CI uses a clean install; browser reports, screenshots, test results, and traces are retained when available; dependencies and workflow actions have an update path.
8. **Operations**: Pages or the chosen host is configured, the support owner knows how to roll back, and browser-local progress is described accurately.

Inspect the built bundle. A source file remaining in `materials/` is not published unless imported or copied, but confirm the actual `dist/` result.

## Record the decision

Update `course/RELEASE.md` with dated evidence and one outcome: `ready`, `needs revision`, or `blocked`. Do not mark ready while coverage, factual approval, rights, a critical learner flow, or CI is unresolved. Distinguish local results from a successful remote workflow run and distinguish instructor review from representative student observation.

After marking the record ready, run `npm run check:release`. A new course should fail this command until placeholders are replaced and `Open blockers` contains only `- None.`. The Pages workflow is manual and repeats both `npm run ci` and the release check before upload.

## Handoff

Lead with the release outcome and blocking findings. List checks run, browser and viewport coverage, content approvals, bundle and rights findings, deployment state, rollback path, and the next smallest action. Deploy only after explicit authorization and then verify the public URL.
