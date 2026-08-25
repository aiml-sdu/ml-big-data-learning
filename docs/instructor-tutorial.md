# Instructor tutorial

This tutorial takes one course from a fresh template to one reviewed pilot module. It assumes that you own the teaching decisions and that a coding agent handles routine repository work.

## Before you begin

Create a new repository with GitHub's **Use this template** button. Fork only when you plan to contribute improvements back to this template.

Install Node.js 22.12 or newer, then run:

```bash
npm install
npm run dev
```

Open the address printed by Vite. The initial modules are disposable demonstrations, not course content.

If you prefer not to use a terminal, give your coding agent this prompt:

> Read README.md and use the manage-course-lifecycle skill. Verify that the template runs locally, then guide me through this tutorial. Inspect existing files before asking questions and offer a concrete default whenever a decision is mine.

## 0. Choose the tool before the model

Use the coding agent already approved by your university. If there is no standard, Codex is the simplest first choice for this template. Claude Code is a sound alternative when your institution already uses Anthropic. OpenCode fits a real need for provider or local-model choice. Pi is better suited to experienced users because it has no built-in sandbox or permission prompts.

Read [choosing-an-agent.md](choosing-an-agent.md) for official setup links, current model evidence, privacy and permission checks, and a small course pilot for comparing tools. Do not select a model only because it is first on a leaderboard. Confirm that your tool and account expose it, then judge it on one source-bounded module.

## 1. Give the course its identity

Edit `src/course/course.config.ts`, or ask the agent to do it. Set the title, short title, description, institution, and a unique `storageNamespace`. The namespace separates progress from other courses opened on the same domain. Do not change it after students begin unless you intend to reset their local progress.

The initial visual theme is neutral. Keep it until representative course material is available, unless an approved institutional design system already governs the course. Onboarding will propose palette, typography, and geometry from the material and record the evidence behind that proposal.

Record known course context in `materials/course-info.md`. Leave unknown fields visibly unresolved rather than guessing.

## 2. Add authoring sources

Place preserved originals under `materials/`. Use the relevant subfolder for slides, labs, readings, practice, datasets, or cleared assets. Do not place student data, credentials, unpublished exams, or material without repository publication rights in a public repository.

Name files so a future instructor can identify the week or topic. Keep originals unchanged. The agent will cite paths and slide, page, section, cell, or notebook locators in module briefs and source trails.

## 3. Onboard the course

Ask:

> Use the onboard-course skill. Inspect the material before asking questions. Help me define the learners, target performances, difficult concepts, practice strategy, publication constraints, material-grounded visual direction, and a coherent course map. Ask at most three focused questions at a time. Prepare the plan and course-wide theme, but do not generate modules yet.

Review `course/COURSE_PLAN.md`. Check that modules are organized around what students should be able to do, not simply around file or slide boundaries. Inspect the content coverage ledger and confirm that every item in scope has a sensible destination or a visible unresolved decision. Review the course visual direction beside representative material and confirm the evidence, accessibility adaptations, and asset rights. Confirm one representative pilot that contains a difficult concept, a likely misconception, and a learner action worth testing.

## 4. Build one vertical slice

Give an exact source boundary and target performance:

> Use the create-study-module skill. Build the pilot from `materials/slides/week-01.pdf`, slides 4 to 12. It should prepare first-semester students to explain the mechanism and apply it to a new case. Use the shared course path and test every non-trivial state transition.

The agent should create a brief, implement one registered module, add tests, run the build, and inspect desktop and mobile behavior. It should stop only for instructor-owned decisions that affect the learning goal, stakes, interpretation, rights, privacy, or scope.

## 5. Review before scaling

Ask for a diagnosis first:

> Use the review-learning-module skill on the pilot. Compare it with its sources and brief. Review factual fidelity, learning sequence, feedback, voice, accessibility, navigation, persistence, responsive behavior, and implementation. Do not edit until I review the findings.

Approve disciplinary accuracy yourself. Then observe a small number of representative students using the pilot without coaching. Note where they hesitate, misread a control, lose context, or finish without demonstrating the objective. Automation cannot supply this evidence.

## 6. Choose a practice strategy

Practice is optional. Choose one of four strategies in `materials/course-info.md`:

- none;
- short checks embedded in lessons;
- dedicated practice stops on the same course path;
- both embedded checks and dedicated practice.

Ask the agent to use `create-practice-set`. It should select MCQ, classification, flashcards, tracing, ordering, calculation, construction, code, or short explanation based on the knowledge students must retrieve or produce. A self-check flashcard deck is not spaced repetition, and browser-local completion is not a grade.

## 7. Scale, debug, and release

Build the next module only after the pilot's reusable lessons are clear. Use `debug-learning-experience` for lost answers, incorrect restoration, broken back or next behavior, layout overflow, keyboard failures, or browser errors. The debugging workflow reproduces the state transition before editing and adds a regression test when a fix is authorized.

Before release, run:

```bash
npm run ci
```

Then use `prepare-course-release`. Review the dated evidence in `course/RELEASE.md`, reconcile the complete material inventory with the coverage ledger, inspect the production bundle for restricted material, and distinguish local checks from a successful remote workflow and instructor approval from student observation.

When the evidence is complete, mark the record `ready` and run `npm run check:release`. Deployment remains a separate manual action in GitHub Actions. A push to `main` runs CI but does not publish the course.

## Working well with different coding agents

Name the skill in your prompt. Broad work across modules or release lanes benefits from the tool's planning mode when available. A clear, reversible module edit usually does not.

Good autonomy means the agent inspects first, proceeds through safe implementation and verification, and reports assumptions. It should ask when an unanswered decision would materially change pedagogy, scope, assessment, interpretation, rights, privacy, or release. It should not ask you to choose filenames, component placement, routine tests, or other engineering details.

The canonical instructions are in `AGENTS.md`; skills are in `.agents/skills/`; `course/MEMORY.md` carries confirmed durable context between tools. See `docs/debugging.md` when a learner flow fails and `docs/release-guide.md` when preparing publication.
