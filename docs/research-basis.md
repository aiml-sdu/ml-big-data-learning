# Research and product basis

This note records the evidence and product references used to shape the template as of 25 August 2026. It separates empirical learning evidence from interface inspiration. Product behavior is not proof of learning, and marketing claims are not treated as research findings.

## Learning evidence

Active learning improves student performance across STEM settings compared with lecture-only instruction in a large meta-analysis. This supports activities that require prediction, classification, construction, tracing, or explanation, but it does not justify interaction without a learning purpose. See [Freeman et al., PNAS](https://doi.org/10.1073/pnas.1319030111).

Retrieval practice can produce stronger delayed retention than repeated study. Practice in this template therefore asks learners to retrieve or produce before reveal when that matches the objective. See [Roediger and Karpicke, Psychological Science](https://www.psychologicalscience.org/journals/psychological-science/j.1467-9280.2006.01693.x/).

Feedback effects vary with design and context. The template requires explanatory, task-relevant feedback rather than a bare correct or incorrect signal, while avoiding universal claims about the size of the effect. See the [meta-analysis of feedback on student learning](https://pmc.ncbi.nlm.nih.gov/articles/PMC6987456/).

## Interaction and visualization principles

OpenAI describes interactive visual explanations in which learners manipulate variables and observe relationships, and its Study Mode emphasizes active participation, stepwise guidance, knowledge checks, and explanatory feedback. These public descriptions support the template's prediction, manipulation, visible-response, and reflection loop. They do not reveal a private implementation that this repository can copy. See [interactive visual explanations](https://openai.com/index/new-ways-to-learn-math-and-science-in-chatgpt/) and [ChatGPT Study Mode](https://openai.com/index/chatgpt-study-mode/).

The local `visualize` skill reinforces the smallest useful visual composition, direct manipulation, semantic controls, responsive measurement, stable state, and review at narrow widths and both colour schemes. The repository encodes those principles in `docs/visualization-standard.md` and keeps library choice subordinate to the learning task.

For implementation, [Vega-Lite selections](https://vega.github.io/vega-lite/docs/selection.html) provide a declarative option for linked data views, [D3](https://d3js.org/) supports custom data-driven interaction, and [MapLibre GL JS](https://maplibre.org/maplibre-gl-js/docs/) supports map interaction. None is a default dependency. A small accessible React or SVG component is preferable when it can express the idea clearly.

## Course path and practice references

Duolingo's public path redesign motivates a visible ordered journey and integrated practice rather than separate navigation systems; its discussion of spaced repetition is a reminder that a flashcard viewer alone is not a scheduler. See the [learning path explanation](https://blog.duolingo.com/new-duolingo-home-screen-design/) and [spaced repetition overview](https://blog.duolingo.com/spaced-repetition-for-learning/).

Brilliant publicly emphasizes learning by doing and interactive problem solving. The template uses that as product inspiration for focused tasks and immediate visible response, not as independent causal evidence. See the [Brilliant FAQ](https://brilliant.org/faq/).

## Accessibility and learner-flow engineering

WCAG 2.2 reflow and target-size guidance support narrow-width layouts without two-dimensional scrolling and usable pointer targets. The WAI-ARIA radio pattern informs keyboard behavior for answer choices. See [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow), [target size minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), and the [radio-group pattern](https://www.w3.org/WAI/ARIA/apg/patterns/radio/).

React documents that component position and keys control whether state is preserved or reset. This underlies the requirement for stable semantic IDs and explicit reset behavior. See [Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state).

## Agent harness and verification

OpenAI documents repository instructions through `AGENTS.md` and reusable skills as instructions plus optional scripts and resources. Its Codex platform discussion describes a harness around the model that supplies context, tools, progress, approval boundaries, and failure handling. This repository makes those controls portable through files rather than depending on one tool's private memory. See [AGENTS.md guidance](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [building skills](https://learn.chatgpt.com/docs/build-skills), and [Codex as a platform](https://learn.chatgpt.com/blog/codex-as-a-platform).

GitHub recommends clean dependency installation and workflow-based Node testing; Playwright recommends testing user-visible behavior and provides CI traces for browser failures. The repository uses unit tests for state transitions and Playwright for routing, focus, persistence, responsive layout, and console errors. See [GitHub's Node.js CI guide](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs), [Playwright CI](https://playwright.dev/docs/ci), [best practices](https://playwright.dev/docs/best-practices), and [trace viewer](https://playwright.dev/docs/trace-viewer-intro).

## Limits

The template does not prove that a module teaches effectively. Automation can catch structural, state, accessibility, and integration regressions. Instructors must still approve disciplinary accuracy, and representative students must still be observed before strong learning claims. Course context, culture, assessment policy, disability access, institutional privacy requirements, and support capacity can all require adaptation.
