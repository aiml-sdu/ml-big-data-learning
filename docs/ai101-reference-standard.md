# AI101 reference standard

AI101 is the design benchmark behind this template. It is not a content library to copy. Its value lies in how it turns course ideas into short reasoning experiences, keeps learners oriented, and makes abstract mechanisms visible.

The reference inspected for this standard is [`phomarkon/ai101`](https://github.com/phomarkon/ai101) at commit `59caaba90bced3582a9f1b832d3806a199b6f64e`. The local checkout, when present, lives in `example/ai101/` and remains outside the distributable template.

## What the reference contains

The inspected version includes 13 topic pages, 119 visualization components, 247 uses of the shared lesson-card frame, 56 quiz blocks, 26 structured exercise blocks, 10 unit-test files, and a full end-to-end desktop and mobile walkthrough for the newest clustering topic.

Those counts show the range of the reference. They are not targets. A new course should use only the interactions its learning outcomes need.

The most useful evidence comes from four places:

- `WelcomePage.tsx` and `LessonStepper.tsx` show course and within-topic progression.
- Topics 10 to 12 show the clearest problem-first, interaction-led lesson design.
- `src/pages/visualizations/` shows a wide family of visual teaching mechanics.
- the tests and commit history show which failures mattered after real use.

## The teaching model

### One conceptual move at a time

AI101 breaks a topic into small lesson cards. Each card normally asks the learner to make one conceptual move: notice a pattern, choose a rule, run one process step, manipulate one relationship, diagnose one failure, or retrieve one idea.

The card is not merely a visual container. It limits cognitive competition. The learner can see the current question, the relevant representation, the response, and the next action without scanning an entire chapter.

Do not imitate this by chopping prose into arbitrary screens. A new card or section is justified when the learner's task, representation, or feedback state changes.

### Problem before terminology

The strongest topics begin with a situation that exposes the need for the concept:

- make a prediction from data before naming regression;
- decide how many groups are visible before defining clustering quality;
- decide when explicit rules stop scaling before presenting learning paradigms;
- choose the next node before reviewing an algorithm's queue rule.

The sequence is concrete problem, learner commitment, visible consequence, explanation, then formal language. This is the same concrete-to-formal progression required by `docs/content-voice.md`.

### Make the learner perform the mechanism

Many strong AI101 interactions turn the learner into the process:

- expand the next search node;
- assign points and move centroids;
- merge the closest clusters;
- trace a decision through a tree;
- construct a formula or probability table;
- tune a parameter and watch the model change.

This is stronger than watching an animation. The learner must decide what the mechanism does next, and the interface makes the result inspectable.

### Contrast reveals the rule

The reference repeatedly teaches with a useful contrast:

- rules versus learning;
- breadth-first versus depth-first search;
- greedy choice versus total path cost;
- good initialization versus crowded initialization;
- training error versus test error;
- compact clusters versus misleading structure;
- a successful case versus a known failure mode.

A contrast earns its place when it isolates the conceptual hinge. Do not create side-by-side panels that change several important variables at once.

### Feedback stays long enough to teach

Correctness feedback explains the mechanism or misconception. The latest repair in the reference removed automatic step advancement because it hid explanations before learners could read them. Completed steps now restore their answer and explanation on revisit, and the learner presses Continue when ready.

This creates a hard standard for the template:

- never auto-advance while explanatory feedback is visible;
- do not auto-clear feedback on a timer;
- restore the resolved state and explanation after navigation or reload when completion is persistent;
- keep retry and reset paths available when repetition is useful;
- make the completion event correspond to a meaningful learner action.

### Progress provides orientation

AI101 uses a winding topic path, card progress, section markers, completed states, and local persistence. The useful function is orientation: where am I, what have I attempted, and what comes next?

Progress is not evidence of mastery. Visiting a page may support orientation, but required learning steps should complete only after the relevant action. Avoid points, streaks, locks, or celebrations that distract from the course purpose or imply a grade.

## Visualization families

Choose a family from the learner action, not from the appearance of the source slide.

### Prediction and reveal

The learner commits to a value, category, path, or interpretation before the model answer appears. Use this to expose prior beliefs and make feedback consequential.

Required elements:

- a clear prediction target;
- no answer cue hidden in the control design;
- a visible comparison between the learner's choice and the model;
- an explanation of the gap;
- a fresh case later in the module.

### Parameter explorer

The learner changes one meaningful quantity and sees linked representations update together. AI101 uses this for weights, thresholds, fit complexity, neighborhood size, probabilities, and acceptance rates.

Required elements:

- each control maps to a concept students need to reason about;
- live numeric readouts accompany the visual change;
- axes, units, legends, and states remain legible;
- the text tells the learner what to compare, not merely what to drag;
- extreme values remain valid and visible.

### Step-through process

The learner advances an algorithm or procedure one state at a time. The display keeps the current state, pending work, and history distinguishable.

Required elements:

- forward, back, reset, and pause where applicable;
- a textual account of the current step;
- stable visual encodings across steps;
- no animation faster than the learner can interpret;
- explicit continuation after an assessed step.

### Direct manipulation

The learner drags, places, connects, orders, or edits the representation itself. Examples include fitting a line, positioning centroids, building a network, and arranging a formula.

Required elements:

- generous targets for pointer and touch input;
- a keyboard or control-based equivalent for the core task;
- visible constraints and invalid-state feedback;
- a reset path;
- completion based on the resulting model, not on the drag event alone.

### Map, graph, and path reasoning

The learner traces a route, expands a frontier, compares costs, or observes a state transition on a network.

Required elements:

- labels that remain readable at phone width;
- current, explored, pending, goal, and final-path states distinguished by more than colour;
- the frontier or decision state shown outside the drawing when it matters;
- zoom and pan that do not hijack normal page scrolling;
- a text description of the selected route or state.

### Construction and diagnosis

The learner builds a valid object or diagnoses why a candidate fails. AI101 uses this for formulas, tables, constraints, model fits, and algorithm choices.

Required elements:

- the validity rule is inferable from prior instruction;
- invalid moves explain the violated rule;
- the interface preserves enough state for the learner to revise;
- success explains why the construction works;
- a near miss or failure mode is part of the learning sequence.

### Simulation and comparison

The learner runs a process, changes conditions, or compares methods on the same case. Use this when dynamic behaviour or tradeoffs are the learning target.

Required elements:

- identical inputs when comparing methods;
- controls for speed, pause, step, and reset when timing matters;
- a small set of meaningful metrics;
- a prompt that directs attention to one difference;
- a conclusion the learner must state or test.

### Data explorer

The learner filters, selects, or links views of a real or realistic dataset. Use this to build data sense before formal modelling.

Required elements:

- provenance and a plain-language description of each variable;
- linked selections across table, plot, and readout where useful;
- no exposure of personal or restricted data;
- honest treatment of missing values, uncertainty, and scale;
- a question that cannot be answered by decorative browsing alone.

## The default learning rhythm

The strongest AI101 topics can be distilled into this rhythm:

1. Pose a concrete problem or tempting interpretation.
2. Ask the learner to predict, choose, build, or trace.
3. Show the consequence in a visual representation.
4. Explain the mechanism and name the formal idea.
5. Contrast a near miss or failure mode.
6. Let the learner manipulate or perform the mechanism.
7. Give explanatory feedback and leave it visible.
8. Test the idea on a fresh case.
9. Preserve progress and resolved explanations for return visits.

This is a design heuristic, not a mandatory nine-screen template. Combine steps when the concept is simple. Expand them when the learner must coordinate several representations.

## Interaction contract

Before implementing an interaction, write six lines in the module brief:

1. **Learner action:** what the learner must decide or do.
2. **Conceptual target:** which mental model or procedure this action reveals.
3. **Visible response:** what changes in the representation.
4. **Feedback:** what the learner learns from a correct and likely incorrect action.
5. **Completion event:** the meaningful action that unlocks continuation.
6. **Transfer:** how the module checks the same idea in a fresh case.

If these lines are vague, the interaction is not ready to build.

## State and return visits

Model these states deliberately when they apply:

- untouched;
- prediction or choice made;
- submitted;
- correct or incorrect feedback visible;
- completed;
- revisited after completion;
- reset for another attempt.

Test transitions rather than screenshots of the initial state. Persistent completion must restore the explanation needed to understand that completion. Never leave a learner in a state where progress says complete but the reasoning that produced it has disappeared.

## Responsive and accessible implementation

The reference provides useful responsive mechanics such as SVG `viewBox`, container measurement, touch-aware pointer handling, responsive grids, and explicit overflow checks. It also contains older click-only or drag-only interactions with incomplete accessible naming. The template must improve on those areas.

- Test desktop, 390 px, and 320 px after changing state, not only at initial render.
- Assert that document width does not exceed viewport width.
- Keep SVG labels and controls readable without hover.
- Give every meaningful visual a title, description, or equivalent nearby explanation.
- Provide keyboard access to every core action, including an alternative to dragging or clicking SVG shapes.
- Do not communicate state by colour alone. Add labels, icons, line styles, shapes, or text.
- Keep page scroll available. Gate wheel zoom behind a modifier key and explain the control.
- Recalculate size-dependent layouts when the container changes.
- Respect reduced motion and cancel asynchronous animation when the component unmounts.

## Engineering patterns worth carrying forward

- Keep deterministic domain logic outside the rendering component so it can be unit tested.
- Generate step traces from one algorithm implementation rather than maintaining a second hand-written animation script.
- Lazy-load heavy interactions and show a stable, correctly sized fallback.
- Share visual primitives within a concept family, such as stages, points, metrics, and feedback panels.
- Keep concept-specific code local until a second credible reuse case appears.
- Store anonymous progress locally by default and never imply that it is synchronized.
- Use stable identifiers for questions, steps, modules, and persistence keys.

## QA standard learned from the reference

The strongest end-to-end test in AI101 walks through every clustering card at desktop size, exercises correct logic, captures meaningful states, checks console errors, and repeats representative states at 390 px. It also asserts that the page has no horizontal overflow.

Apply that pattern proportionally:

- unit-test calculations and state transitions;
- exercise correct, incorrect, retry, reset, and revisit paths;
- verify that feedback persists until the learner moves on;
- inspect at least one extreme parameter state;
- check browser errors and warnings;
- test the shared previous and next sequence;
- visually review the states that carry the most conceptual information;
- confirm that restricted material is absent from the build.

## Failure lessons from AI101 history

Several repairs in the reference reveal reusable standards:

- Auto-advance hid explanations. Use explicit continuation.
- Completed steps lost their explanation on revisit. Restore resolved state from persistent progress.
- Canvas wheel handling blocked normal scrolling. Do not capture ordinary page gestures.
- Visuals failed to recenter after resize. Recompute from the current container.
- Dark-mode and yellow-node text lost contrast. Test actual visual states, not token names.
- Mobile chips and controls overflowed. Test narrow widths with long labels.
- Algorithm games entered stuck states. Define every transition and recovery path.
- Domain changes were invisible. Make the exact state change perceptible.
- A comparison was described as side by side when it was not. Keep instructional claims synchronized with the interface.

## What not to copy

- Do not copy AI-specific prose, datasets, maps, quiz answers, or visual assets into another course.
- Do not reproduce an AI101 interaction when the new objective needs a different learner action.
- Do not import its authentication, gamification, or dependency stack by default.
- Do not inherit its em-dash-heavy prose or any wording that conflicts with `docs/content-voice.md`.
- Do not treat every historical AI101 component as exemplary. Prefer the newer interaction-led topics and the standards documented here.
- Do not measure quality by visualization count. One coherent interaction with transfer is better than a gallery of widgets.

## How agents use the local reference

When `example/ai101/` is present and a non-trivial interaction is justified:

1. choose the visualization family from the learner action;
2. inspect one or two AI101 components with the closest mechanic;
3. inspect any shared hook, test, or bug-fix history that governs that mechanic;
4. record the reusable principle in the brief;
5. implement a course-specific interaction using the template's own architecture and accessibility standard.

When the local reference is absent, use this document and the course-neutral examples in `src/course/modules/examples/`. The resulting module must not depend on AI101 files.
