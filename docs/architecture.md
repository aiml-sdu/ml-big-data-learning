# Architecture

## Design goal

The template separates instructor-owned evidence, reviewed learning design, course-specific implementation, and reusable platform mechanics. That separation makes generated work easier to inspect and prevents the application from becoming a collection of one-off pages.

```text
memory + materials → course plan and module brief → module implementation → tests and review
```

## Main layers

### Source layer: `materials/`

Original teaching inputs live here. These files are not part of the deployed bundle unless code explicitly imports them or someone copies them into `public/`. Preserve originals so source references stay stable.

### Planning layer: `course/`

`MEMORY.md` stores only confirmed, durable knowledge that should survive between agent sessions and tools. `COURSE_PLAN.md` records the agreed course map and the course-wide content coverage ledger. `module-briefs/` records the source boundary, claimed coverage IDs, learning objectives, misconceptions, sequence, and interaction rationale for each module. A brief is the contract between instructor intent and implementation.

Keep these roles separate: memory is reusable context, the course plan is reviewed structure, and a module brief is scoped work. This prevents an unconfirmed assumption from silently becoming a permanent course rule.

The coverage ledger connects the source inventory to module evidence and release decisions. Stable coverage IDs survive module renaming and allow the release audit to find unassigned, planned, uncertain, deferred, or excluded content without treating slide count as learning design.

### Course layer: `src/course/`

`course.config.ts` owns course-wide identity, the material-derived visual system, and the unique browser-storage namespace. Its typed theme records light and dark semantic palettes, typography, geometry, rationale, and source references. `AppShell` maps those values to shared CSS roles, while `ThemeToggle` persists the learner's light or dark choice locally. Follow `docs/theme-standard.md`. `modules/index.ts` is the typed module registry and therefore the single source of truth for the winding course journey, routes, sidebar navigation, order, previous and next links, time estimates, module or practice kind, and source trails.

Each module receives its own metadata from the registry. A module may define local visualizations beside its page when they are course-specific.

### Platform layer: `src/components/`, `src/hooks/`, and `src/pages/`

These folders contain course-neutral mechanics: navigation, module framing, progress, checks for understanding, and activity patterns. A component belongs here only if at least two plausible course modules could reuse it without importing course terminology.

## Route and deployment model

`src/App.tsx` derives module routes and sequence context from the registry. `CourseJourney` renders the responsive learning path on the home page. `LearningModuleLayout` renders the common module frame and previous or next navigation. The app uses hash routing so GitHub Pages does not need rewrite rules. Vite uses relative assets through `base: './'` for repository-subpath deployment.

Do not hand-maintain a second navigation list or build a module-specific shell. Add the module once to `COURSE_MODULES` and wrap its content in `LearningModuleLayout`.

A dedicated practice experience uses the same registry with `kind: 'practice'`. This keeps lessons and practice in one ordered journey. It must not introduce a second router, sidebar, or progress model.

## Reference interactions

`src/course/modules/examples/` contains course-neutral reference implementations. They set the expected standard for responsive SVG, labelled controls, explanatory feedback, and behavior at phone widths. Agents inspect the closest example before building a new visual pattern. They copy mechanics where useful, but they do not reuse the example subject matter.

The examples leave the repository when real course modules replace them. The maintained principles live in `docs/visualization-standard.md`.

`docs/ai101-reference-standard.md` records the deeper benchmark learned from the ignored AI101 reference checkout: lesson grain, interaction families, completion semantics, return-state behaviour, responsive mechanics, and QA failures. The template copies those principles, not the reference's course content or dependency stack.

## Progress and interaction state

`src/lib/courseStorage.ts` scopes browser keys under `COURSE.storageNamespace`, handles unavailable storage, and provides validated JSON helpers. Completion is a list of module slugs. Stateful interactions use their own explicit versioned schemas with stable semantic IDs.

Do not persist array indexes or displayed labels. Missing values are fresh state; malformed, stale, unknown, or out-of-range values recover to a valid state. Changing source order must not restore a different answer. Activities preserve resolved feedback when a learner navigates backward, forward, away, and back.

All progress is intentionally anonymous and device-local. It does not synchronize, identify students, or report completion to an instructor.

Authentication, analytics, and server-side persistence are outside the starter's default scope because each adds privacy, operational, and governance decisions. Add them only after explicit course-level approval.

## Source trail

Every real module should define at least one `sourceRefs` entry:

```ts
sourceRefs: [
  {
    label: 'Week 3 lecture',
    path: 'materials/slides/week-03.pdf',
    locator: 'slides 7–15',
  },
],
```

Paths must be repository-relative and may not escape the repository. Locators should be meaningful for the file type: slides, pages, sections, cells, or notebook headings.

## When to extend the architecture

- Add a reusable interaction component after the second credible use case appears.
- Add a new module-local component when it is tightly coupled to one concept.
- Add a backend only for an approved requirement that cannot remain browser-local.
- Split the module registry only when course size makes a single ordered list difficult to review.
- Do not add a content management system merely to avoid editing TypeScript; first validate the instructor workflow with real courses.

## Verification and release

Unit tests cover reusable state transitions. Playwright covers the assembled learner path: routes, focus, keyboard and pointer input, reload persistence, responsive navigation, overflow, console errors, and page errors. `npm run ci` combines harness, voice, unit, type, bundle, and browser gates.

GitHub Actions repeats the clean gate and retains Playwright reports when failures need diagnosis. Pages deployment runs the same gate before uploading `dist/`. `course/RELEASE.md` records instructor approval, manual accessibility and visual evidence, rights review, representative learner observation, deployment state, and rollback. Automation does not fill those fields by implication.
