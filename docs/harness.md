# Course-authoring harness

The harness is the execution system around the model. It keeps collaboration consistent across Codex, Claude Code, OpenCode, and Pi even when their models, interfaces, and native memory differ.

It has two users: the instructor should receive a prepared, low-friction collaboration, while the learner should receive a coherent, testable experience. The harness must protect both without pretending that automation can certify teaching quality.

The north-star result is a course where every confirmed in-scope content item is accounted for and the learner experience meets `docs/experience-quality-standard.md`. Content completeness and experience quality are separate gates. Neither can compensate for failure in the other.

## Route by lifecycle stage

| Current need | Workflow | Evidence produced |
| --- | --- | --- |
| Set up the template or decide what comes next | `manage-course-lifecycle` | Stage, next outcome, and exact handoff |
| Inventory a new course and agree its map | `onboard-course` | Course context, material inventory, reviewed plan |
| Build one source-bounded lesson | `create-study-module` | Brief, registered module, tests, source trail |
| Add optional formative practice | `create-practice-set` | Practice rationale, stable item state, feedback tests |
| Diagnose a learner-flow failure | `debug-learning-experience` | Reproduction, state model, cause, regression evidence |
| Critically assess an existing module | `review-learning-module` | Prioritized findings and readiness decision |
| Prepare a whole-course release | `prepare-course-release` | Dated release record and blockers |

Do not run every workflow for every request. Use the smallest workflow that owns the outcome, and return to the lifecycle workflow when a multi-stage effort needs coordination.

## The shared loop

Every course-authoring task follows the same loop:

```text
orient → remember → inspect → clarify → propose → act → verify → reflect → hand off
```

### 1. Orient

Restate the instructor's concrete goal and identify the artifact that should change. If the request is already precise, do not slow it down with a generic interview.

### 2. Remember

Read `course/MEMORY.md`, `materials/course-info.md`, and `course/COURSE_PLAN.md`. Reuse confirmed information so the instructor does not repeat themselves. Treat missing information as unknown, not as permission to invent it.

### 3. Inspect

Inspect the named material, current module, registry, and relevant tests before asking questions. Report extraction limitations honestly.

### 4. Clarify

Pause only when an unanswered instructor-owned decision would materially change the result. Ask one to three questions at a time, explain why each matters, and give a concrete default or two meaningful options.

Typical instructor-owned decisions are:

- what students should be able to do;
- assessment stakes and acceptable support;
- intended audience and prerequisites;
- discipline-specific interpretation or terminology;
- whether source material or an asset may be published.

Questions about filenames, component placement, test setup, styling implementation, or routine engineering choices normally belong to the agent.

### 5. Propose

Reflect the important interpretation back in a compact brief. Separate confirmed facts, reasonable assumptions, and recommendations. Do not seek approval for every reversible implementation detail.

### 6. Act

Once consequential decisions are clear, carry the task through implementation within the requested scope. Keep the instructor informed at meaningful milestones. Do not stop after producing a plan when the request authorizes implementation.

### 7. Verify

Check source fidelity, behaviour, accessibility, responsive layout, tests, production build, and publication boundaries. For a learner-facing state or navigation change, use a real browser as well as component tests. Passing code checks does not establish factual or pedagogical quality.

### 8. Reflect

Ask whether a correction is local or a durable preference. Update `course/MEMORY.md` only for confirmed reusable facts or feedback. Replace superseded entries rather than accumulating contradictions.

### 9. Hand off

Lead with the result. Report material used, decisions made, checks completed, unresolved risks, and any memory update. Offer the most useful next step without pressuring the instructor to accept it.

## Conversation quality

The agent should feel like a prepared course-design colleague:

- warm, direct, and curious;
- willing to challenge a weak module boundary or misleading explanation;
- concise enough that the instructor can answer quickly;
- explicit about defaults and tradeoffs;
- attentive to what the instructor has already said;
- autonomous after the important choices are settled.

Avoid both extremes: a silent generator that guesses consequential details and an intake form that makes the instructor design the entire solution.

## State artifacts

| Artifact | Purpose | Update rule |
| --- | --- | --- |
| `AGENTS.md` | Repository-wide invariants and agent loop | Template maintainers only |
| `course/MEMORY.md` | Confirmed durable instructor context and corrections | Update after confirmation |
| `materials/course-info.md` | Course facts and initial discovery answers | Instructor or onboarding agent |
| `course/COURSE_PLAN.md` | Reviewed course map and pilot choice | Update when structure changes |
| coverage ledger in `course/COURSE_PLAN.md` | Course-wide accounting from sources to reviewed evidence | Update whenever scope or implementation changes |
| `course/module-briefs/` | Contract for a specific module | Update with that module |
| `course/RELEASE.md` | Dated readiness evidence, approvals, risks, and rollback | Update during release preparation |
| `src/course/modules/index.ts` | Single source for routes and shared navigation | Update when modules change |
| tests and build output | Observable verification | Regenerate, never treat as memory |

## Autonomy boundary

Proceed without interruption for reversible, in-repository work that follows an approved brief. Pause for missing source access, contradictory instructor guidance, factual uncertainty with student impact, assessment-policy choices, privacy or publication rights, and significant scope expansion.

If the instructor says “use your judgement,” choose the strongest defensible option and label it as an agent decision. Do not save it as an instructor preference until confirmed.

For work spanning several modules, material types, or release lanes, use the coding tool's planning mode when available or maintain a concise visible plan. Planning does not replace the clarify or act stages. Do not propose plan mode as ceremony for one clear, reversible change, and do not stop after planning when implementation was requested.

## Learner-state contract

Every interactive activity needs an explicit state model:

- input state from source content and stable semantic IDs;
- derived state such as correctness or available steps;
- persisted state with an explicit schema version;
- navigation state including current item, focus, and reachable back or next paths;
- terminal state and meaningful completion;
- recovery state for retry, reset, malformed data, and unavailable storage.

Persist IDs, never array positions or displayed labels. Missing state is fresh state. Malformed, stale, unknown, or out-of-range state must recover safely. Scope storage through `src/lib/courseStorage.ts` and the course's unique namespace. Resolved answers and feedback stay visible when moving backward, forward, leaving, and returning.

The failure behind an apparently preselected first MCQ option illustrates why this is a harness rule: coercing a missing storage value with `Number(null)` produces `0`. A local fix is insufficient if another agent can reproduce the pattern, so the contract, test suite, and static harness must all reject it.

## Debugging loop

When a learner flow fails, use:

```text
reproduce → model state → isolate transition → fix if authorized → regress → browser-check → generalize
```

Capture the start state, learner action, observed and expected result, viewport, input method, storage condition, console errors, and recovery path. Do not force-click an inaccessible control, suppress an error, or weaken an assertion to obtain a green run. If the cause is a reusable authoring mistake, update the maintained instruction or check that should prevent recurrence. See `docs/debugging.md`.

## Verification ladder

Use the lowest layer that can catch the defect, but do not let a lower layer stand in for a higher one:

1. voice and harness checks catch prohibited prose patterns and missing contracts;
2. unit and component-integration tests catch pure logic, state transitions, and interaction boundaries;
3. type-check and production build catch integration and packaging defects;
4. Playwright tests the production preview for routing, focus, pointer and keyboard use, persistence, responsive layout, browser errors, and automatically detectable accessibility violations;
5. manual accessibility and visual review catch meaning, hierarchy, comfort, and assistive-use issues automation misses;
6. instructor review establishes disciplinary approval;
7. representative learner observation supplies usability and learning evidence.

`npm run ci` covers layers one through four. `course/RELEASE.md` records all seven without conflating them. `npm run check:release` checks that the record is complete before the manual deployment workflow can upload the site.

## Coverage loop

Use `docs/content-coverage-standard.md` throughout the lifecycle:

```text
inventory → assign coverage IDs → map destinations → implement evidence → instructor-review → release-audit
```

Do not wait until release to discover missing content. Onboarding creates the ledger, module briefs claim items, implementation links evidence, review confirms intended depth, and release resolves every remaining item. Reopen affected coverage when source material or scope changes.

## Visual-direction loop

Build the course theme once from representative evidence:

```text
sample materials → record visual cues and rights → define semantic theme roles → configure the shared shell → review the pilot beside the sources → release-audit
```

Follow `docs/theme-standard.md`. A module can use a concept-specific diagram, but it does not create a new shell or theme. If the sources have no stable visual character, keep the neutral starter and record that decision rather than inventing a brand.

## Human anti-slop pass

Mechanical voice checks are warnings, not an editor. Cold-read learner-facing copy without the source open. Remove sentences that could be pasted into another course unchanged, inflated transitions, slogan-like contrasts, repeated summaries, generic praise, and questions that manufacture excitement. Then compare every remaining non-trivial claim with its source locator. Good prose should sound like this instructor explaining this mechanism to these learners.

## Visualization discipline

Choose the smallest composition that exposes the important relationship. A learner should predict, manipulate, compare, construct, or trace, then see a legible response and explanation. Measure responsive graphics from their actual container, preserve semantic controls and keyboard paths, provide a text alternative, and keep state stable across resize and revisit. Library choice follows the learning task; it is not a quality signal. See `docs/visualization-standard.md`.

## Memory is curated state, not a transcript

Native memory differs between tools and may be unavailable, private to one tool, or scoped differently. `course/MEMORY.md` is therefore canonical. It should answer, “What stable facts would prevent the next agent from repeating a question or mistake?”

Do not record:

- hidden reasoning or summaries of every turn;
- unconfirmed assumptions;
- temporary debugging state;
- praise, conversational filler, or personal trivia;
- sensitive student or instructor data.

## What “excellent” means

The harness can enforce disciplined process, but it cannot certify brilliance by itself. A module earns a strong quality claim only when:

1. its claims and answers are source-checked;
2. its learning sequence targets a clear mental model or performance;
3. its activity elicits meaningful student reasoning;
4. feedback addresses likely errors;
5. the instructor approves disciplinary accuracy;
6. representative students can use it and show the intended learning.

At course level, every in-scope content item must also be reviewed, deferred, or excluded with instructor approval. Use `docs/experience-quality-standard.md` for the full course and module quality rubric.

Use `docs/ai101-reference-standard.md` for the interaction benchmark, `docs/learning-design-standard.md` for design, and `docs/quality-checklist.md` for readiness.

Before publication, use `docs/release-guide.md` and record a dated decision in `course/RELEASE.md`. The harness may prepare a release, but it does not authorize deployment, repository visibility changes, or other external state changes.
