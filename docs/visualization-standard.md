# Interactive visualization standard

The template includes course-neutral examples so instructors and agents can see the expected level of work. These examples are disposable. Their design principles are not.

Read `docs/ai101-reference-standard.md` for the deeper teaching model, interaction families, state contract, and failure lessons distilled from the reference platform. This document applies those principles to normal module implementation.

## Product feel

Use “Duolingo meets Brilliant” as shorthand for the experience, not as permission to copy either product's branding, illustrations, or interface.

- Borrow visible momentum from Duolingo. The course path is the main organizing view, progress is easy to read, controls feel friendly, and the next useful action is obvious.
- Borrow intellectual focus from Brilliant. Put one question, model, or relationship at the centre of the screen and let the learner reason with it directly.
- Keep the shared shell calm enough for university teaching. Playfulness should reduce hesitation, not make the course feel childish.
- Use rounded geometry, clear state changes, tactile depth, and restrained motion consistently across the platform.
- Do not lead with a generic dashboard, a wall of cards, or a large marketing hero that pushes the learning path out of view.

On a phone, show the learning path before secondary course statistics. Inside a module, prefer one meaningful action and its feedback per viewport over several competing panels.

## What a visualization must do

Begin with a learning problem that prose or a static image cannot handle as well. A visualization should help the learner inspect a change, compare alternatives, trace a process, construct something, or test a prediction.

State the learner action in one sentence before implementation. Good statements include the following.

- The learner changes one parameter and predicts which part of the graph moves.
- The learner chooses a route, sees the full cost, and revises a local decision rule.
- The learner steps through a process and explains why the next state follows.

If the action is only `click to reveal`, use ordinary prose unless committing before the reveal changes the learning task.

## Choose the smallest useful composition

Start with the relationship, not a chart library.

| Learning need | Smallest likely representation |
| --- | --- |
| Compare exact values across a few cases | Table or aligned bars |
| See change across one continuous variable | Directly manipulated line, curve, or diagram |
| Link several exact mappings | Table or linked highlighting |
| Trace a sequence or changing state | Stepper, timeline, or state diagram |
| Understand hierarchy or branching | Tree or compact flow |
| Compare spatial alternatives | Static map first; interactive map only when pan, zoom, selection, or routing matters |
| Construct or tune a system | Direct manipulation with labelled equivalent controls |

Use plain React and SVG for small course-specific diagrams. Consider Vega-Lite for declarative linked data views, D3 for custom data-driven interaction, or MapLibre for genuine geographic navigation. These libraries are tools, not evidence of quality. Do not add a dependency when a small accessible component is sufficient.

## Reference examples in this repository

### Parameter explorer

`src/course/modules/examples/PriceExplorer.tsx` connects a familiar situation, a formula, and a graph. Each control changes one meaningful quantity. The visual includes a live readout, labelled axes, an accessible description, and a narrow-screen layout.

Use this pattern for rates, thresholds, probabilities, forces, costs, growth, and other relationships that students need to manipulate.

### Map explorer

`src/course/modules/examples/RouteExplorer.tsx` invites a tempting mistake. The learner chooses a route before seeing its total distance. Feedback addresses the rule behind the choice rather than praising the click.

Use this pattern for graph search, process routes, anatomical pathways, decision trees, causal paths, and spatial comparisons.

### Decision with feedback

`src/components/CategoryChallenge.tsx` records a classification before showing an explanation. Several cases let the learner refine one rule.

Use this pattern when plausible cases differ along one important boundary.

## Interaction sequence

Most visualizations work well with this order.

1. Give the learner a concrete question.
2. Let them predict or choose.
3. Change the visual in direct response to that action.
4. Explain what the change means.
5. Offer a reset or another case.
6. Check the idea in a fresh context outside the visual.

Do not animate before the learner knows what to watch. Do not advance automatically while feedback is still being read.

Before implementation, define the learner action, conceptual target, visible response, feedback, completion event, and transfer check in the module brief. Completion should follow a meaningful action. A return visit must restore any explanation needed to understand why the activity is complete.

## Responsive behavior

The same learning task must work at 320 px, at a typical phone width, and on desktop.

- Controls stack before labels or values become cramped.
- SVG uses a `viewBox` and scales to its container.
- Responsive SVG or canvas measures the actual content container rather than assuming the window width.
- Canvas code measures its container and accounts for device pixel ratio.
- Touch targets are at least 44 px in both dimensions when practical.
- Labels remain readable without hover.
- No required information sits outside the viewport.
- The winding course journey keeps its path and nodes on mobile. Secondary descriptions may shorten, but module identity and progress remain visible.

Test portrait mobile first. It exposes weak hierarchy and crowded controls sooner than a desktop check.

Changing width, theme, or reduced-motion preference must not reset the learner's conceptual state. Preserve selections and resolved feedback unless the learner explicitly resets.

## Accessibility

- Every control has a visible label and an accessible name.
- Keyboard input reaches every action.
- A meaningful SVG has a title and description, or nearby text that provides the same information.
- Color is never the only signal. Use text, shape, line style, or icons as well.
- Feedback uses a live region when it changes after an action.
- Motion respects reduced-motion settings.
- Complex canvas scenes need a text explanation or equivalent data view.

## Visual restraint

Use the material-derived course colours, typography, geometry, spacing, and controls from the shared shell. Follow `docs/theme-standard.md`. A concept can have its own diagram, but it should still feel like part of the course.

Motion should show change or preserve orientation. Decoration that competes with the task should be removed. A clean static figure is better than an interaction that teaches nothing.

## Verification

Exercise the complete path with a mouse, keyboard, and touch-sized viewport. Try the likely wrong answers. Resize after changing state. Confirm that labels, feedback, reset controls, and the next-module link remain usable. Check light and dark colour schemes, reduced motion, 320 px, 390 px, and desktop. Confirm no page or console errors and no horizontal overflow.

Use Playwright for stable learner paths and persistence, then perform a visual cold read. Automation can confirm dimensions and controls, but it cannot decide whether the visual makes the intended relationship easier to see than a paragraph or table.
