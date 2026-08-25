# Release guide

A release is a dated decision supported by evidence. Tests can reject a broken build. They cannot approve disciplinary claims, publication rights, or the learning design.

## What each test layer does

| Command | What it checks | Typical failure caught |
| --- | --- | --- |
| `npm run test:unit` | Pure logic and React component integration in Vitest | A missing saved value selects the first MCQ option, retry changes the wrong item, or completion fires twice |
| `npm test` | Vitest plus release-guard tests, course coverage, agent-skill mirrors, voice checks, and harness contracts | A skill mirror drifts, a coverage ID disappears, or the release gate can be bypassed |
| `npm run build:app` | TypeScript and the Vite production bundle | A type error, bad import, or production bundling failure |
| `npm run test:e2e` | A fresh production build served with `vite preview`, then Playwright on desktop and mobile Chromium | Broken routing, focus, scroll, reload, persistence, narrow-screen layout, browser errors, or an automatically detectable accessibility violation |
| `npm run ci` | The normal local and remote gate. It tests, builds once, and runs the browser suite against that build | Any engineering failure that should block a merge or release |
| `npm run check:release` | The completed `course/RELEASE.md` | A non-ready status, placeholder evidence, open blockers, or a missing dated CI result |

The Vitest suite contains both small unit tests and component-level integration tests. They use the same runner because the distinction is the boundary under test, not the command name. Playwright covers the assembled learner experience.

The accessibility scan uses axe rules tagged for WCAG 2.0, 2.1, and 2.2 at A and AA where supported. It visits the home page, every module exposed by the registry, and the dark theme. Automated scans find only some accessibility failures. Keyboard use, focus order, zoom and reflow, screen-reader output, reduced motion, and representative user testing still need human evidence.

## Local release gate

Use a clean dependency install when possible.

```bash
npm ci
npx playwright install chromium
npm run ci
```

Inspect a failure before rerunning it. Browser failures retain screenshots, traces on retry, test results, and the Playwright report in GitHub Actions.

`npm run check:coverage` validates stable coverage IDs and statuses throughout authoring. When `course/RELEASE.md` is marked `ready`, it also rejects unresolved coverage, reviewed items without evidence, and deferred or excluded items without decision notes.

`npm run check:release` is expected to fail in a new course. It passes only after the release record says `ready`, contains no `TODO`, `TBD`, or `pending` values, records a dated `npm run ci` result, and lists no open blocker.

## CI and deployment behavior

The `Verify template` workflow runs for pull requests and pushes to `dev` and `main`. It starts from `npm ci`, installs Chromium, runs `npm run ci`, and retains browser evidence when available. When the repository plan supports branch protection, require this workflow before a pull request can merge.

The `Deploy to GitHub Pages` workflow is manual. A push to `main` does not publish a course. The workflow repeats the clean CI gate, runs `npm run check:release`, uploads `dist/`, and then deploys to the `github-pages` environment. This separation prevents a routine merge from becoming a course release.

Repository owners can add a required reviewer to the `github-pages` environment in GitHub settings. That protection is useful when the person who maintains the code is not the instructor who approves publication.

Dependabot proposes grouped monthly npm and GitHub Actions updates against `dev`. Review those pull requests through CI. Do not merge dependency updates merely because the version is newer.

## Release lanes

- Content. The instructor approved claims, terminology, examples, answers, source boundaries, and any interpretation of contradictory material.
- Coverage. Every in-scope item is reviewed, deferred, or excluded. Deferred and excluded decisions have instructor-confirmed reasons.
- Learning. The sequence, prerequisites, practice, feedback, and transfer checks fit the course. Pilot observations are described without overclaiming.
- Experience. The approved material-grounded theme is coherent, and core routes, activities, retry, reset, previous and next links, the mobile menu, reload, and revisit work with keyboard and pointer input.
- Accessibility. Automated scans pass and the manual evidence named above is recorded.
- Privacy and rights. `public/`, source imports, and `dist/` contain no student data, credentials, restricted readings, unpublished exams, unapproved assets, or fonts without a confirmed publication path.
- Engineering. Clean CI passes, production browser tests run, failure evidence is retained, and dependency updates have an owner.
- Operations. The owner, published URL, support route, rollback revision, and browser-local progress behavior are known.

Record the evidence and one outcome in `course/RELEASE.md`. Use `ready`, `needs revision`, or `blocked`. A high coverage percentage does not excuse a missing core topic.

## GitHub Pages

1. Push the course repository to GitHub.
2. In **Settings → Pages**, select **GitHub Actions**.
3. In **Settings → Environments**, consider requiring an instructor or release owner for `github-pages`.
4. Complete `course/RELEASE.md`, mark it `ready`, and run `npm run check:release` locally.
5. Manually run **Deploy to GitHub Pages**.
6. Open the published URL and repeat the smoke path on the deployed site.

The site uses hash routing and relative Vite assets, so repository-subpath hosting does not need server rewrite rules.

Preparing a release does not authorize deployment, a visibility change, or another external action. The instructor or release owner must ask for publication or run the workflow themselves.

## Rollback and maintenance

Record the last known good commit or release tag in `course/RELEASE.md`. If a published release breaks a learner flow, redeploy that revision through the manual workflow. Do not edit files inside `dist/` by hand.

Record any effect on browser-local progress when a storage schema or `storageNamespace` changes. Test the template periodically from a clean repository because cached dependencies and existing browser state can hide setup failures.
