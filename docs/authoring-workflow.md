# Authoring workflow

## 1. Remember before asking

Read `course/MEMORY.md`, `materials/course-info.md`, and `course/COURSE_PLAN.md`. Reuse confirmed preferences and terminology, but check for contradictions or stale decisions. Memory is not evidence for a course claim; the instructor's source material remains the evidence.

## 2. Inventory before interpretation

Inspect filenames, formats, obvious groupings, and the course information first. Record the inventory in `course/COURSE_PLAN.md`. Do not infer the final module structure solely from slide-deck boundaries: one deck may contain several outcomes, and one outcome may span a deck and a lab.

Flag material that cannot be reliably inspected with available tools. Do not pretend extraction succeeded when diagrams, equations, speaker notes, or scanned pages were missed.

Create stable coverage items for each coherent concept, procedure, representation, misconception, lab capability, or practice expectation confirmed in scope. Follow `docs/content-coverage-standard.md`. Keep unreadable or uncertain source regions visible rather than assuming they are covered.

## 3. Confirm instructor-owned decisions

Ask only about decisions that materially change the result and are not already documented. The usual decision set is:

- target learners and assumed prior knowledge;
- whether the platform prepares, accompanies, or reviews teaching;
- target performance: recognise, explain, calculate, implement, critique, or design;
- source boundary and material that may be republished;
- formative versus graded use;
- course language and important terminology.

Offer a reasonable default with each question. If the request is already precise, proceed and record minor assumptions.

Use `docs/instructor-interview.md` when the course goal or learner model is still unclear. Ask one to three questions at a time, briefly reflect what you heard, and stop when the next action is safe.

## 4. Build the course plan

Propose modules around coherent learning outcomes. For each module, record:

- source boundary;
- an observable intended outcome;
- likely misconception or difficult decision;
- candidate activity and why it helps;
- approximate student time;
- unresolved rights or content questions.

Show how modules depend on one another and where the important conceptual transitions occur. The result should be a learning path, not a list of files.

Do not build all modules until the instructor accepts the structure and a representative pilot is chosen.

## 5. Write a module brief

Create `course/module-briefs/<slug>.md`. A useful brief is compact but falsifiable: another instructor should be able to tell whether the implementation matches it.

Use two to four objectives. Avoid unobservable verbs such as “understand” when a more inspectable performance is available. Preserve the instructor's terminology.

Name the prerequisite, conceptual hinge, likely misconception, evidence of transfer, and connection to adjacent modules.

List every coverage ID the brief claims. For each one, state the intended depth or performance and the explanation, example, activity, feedback, or transfer evidence that will satisfy it.

## 6. Choose the learning sequence

A dependable default is:

1. a problem, contrast, or prediction that creates a reason to learn;
2. the minimum explanation needed to make progress;
3. a worked example or visualization;
4. an activity that elicits the target reasoning;
5. feedback addressing both the correct rule and likely misconception;
6. a short independent check.

This is a default, not a mandatory page template. Adapt it to the discipline and learning outcome.

Draft the learner-facing explanation with `docs/content-voice.md`. Start with something the learner can picture. Explain why the mechanism behaves as it does, then introduce the formal name or notation. Use a near miss to make the boundary visible.

## 7. Decide whether interaction earns its cost

Use interaction when students benefit from changing a variable, making a prediction, ordering steps, classifying cases, constructing an object, tracing a process, or receiving contingent feedback.

Use clear prose, a table, code, or a static figure when the learner only needs to inspect information. Avoid interaction whose only effect is revealing text or adding motion.

If interaction earns its place, inspect `docs/ai101-reference-standard.md`, `docs/visualization-standard.md`, and the closest example under `src/course/modules/examples/`. When `example/ai101/` exists, inspect one or two components with the closest learner action and any relevant tests or repair history. Extract the mechanic and failure lessons. Do not copy the subject matter, prose, visual assets, or dependency stack.

Write the six-line interaction contract in the brief: learner action, conceptual target, visible response, feedback, completion event, and transfer. If the contract is vague, simplify the design before implementation.

## 8. Implement one vertical slice

Build the complete module inside `LearningModuleLayout`, register it once, and add its source trail. The registry supplies the route, sidebar, order, and previous/next navigation. Reuse platform components when their semantics fit. Keep course-specific interaction logic beside the module until it has a second genuine reuse case.

Update claimed coverage items from planned to implemented only when the evidence exists in the learner experience. Record the exact evidence. A heading or passing mention does not cover a performance that requires explanation, calculation, implementation, critique, design, or transfer.

Add tests around decisions and state transitions, not snapshots of prose. Examples include answer feedback, score calculation, reset behaviour, and registry invariants.

For a stateful activity, define input, derived, persisted, navigation, terminal, and recovery state. Use stable semantic IDs and versioned validated JSON through `src/lib/courseStorage.ts`. Missing or malformed state must produce a valid activity. Backward and forward navigation must retain resolved answers and explanations.

If the course needs dedicated practice, follow `docs/practice-standard.md` and register it with `kind: 'practice'` on the same course path. Do not assume MCQ is the correct response format.

## 9. Verify and review

Run:

```bash
npm test
npm run build
npm run test:e2e
```

The browser command rebuilds the app and tests the production preview on desktop and mobile. It also scans the home page and every registered module for automatically detectable accessibility violations.

Then inspect the rendered module:

- compare claims, notation, and examples with the source;
- complete every activity with correct and incorrect paths;
- revisit completed activities and confirm that resolved feedback returns;
- confirm that explanations remain visible until the learner explicitly continues;
- navigate with only a keyboard;
- inspect phone and desktop widths;
- run `npm run check:voice` and perform a cold read of the learner-facing prose;
- test reduced-motion behaviour;
- confirm no restricted source file enters `dist/`;
- follow the shared previous/next navigation and confirm the sequence;
- use `docs/quality-checklist.md` for the readiness decision.
- compare the module's claimed coverage IDs with the source and update items to reviewed only after instructor approval.

When a learner path fails, use `docs/debugging.md`: reproduce, model the transition, isolate the cause, fix if authorized, add a regression, and repeat the browser path.

## 10. Close the loop with the instructor

Report what was created, sources used, meaningful design decisions, checks performed, and unresolved questions. If the instructor confirmed a durable preference or reusable correction, add it to `course/MEMORY.md`, say exactly what changed, and supersede any conflicting old entry. Do not store unfinished task state there.

The instructor approves content accuracy and publication. Observe representative students using the pilot: where they hesitate, what they misread, and whether they transfer the idea to a fresh case. Feed confirmed lessons into the next module before scaling production.

Use `manage-course-lifecycle` when coordinating several stages and `prepare-course-release` before publication. Broad course or release work benefits from the coding tool's planning mode when available; one clear reversible module edit usually does not. A release records dated evidence in `course/RELEASE.md` and uses `npm run ci` as the automated gate.
