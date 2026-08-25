# Choosing a coding agent and model

Last checked on 25 August 2026.

You do not need to understand every coding tool before starting. Pick one approved tool, use it for a small pilot, and keep the result only if it follows the course sources and passes the repository checks.

## The short recommendation

Use the coding agent already approved and supported by your university. Institutional support, data policy, and account ownership matter more than a small difference on a public leaderboard.

If you have no existing standard, start with Codex. This template uses `AGENTS.md`, portable skills, repository memory, explicit permissions, and browser checks in a way that maps directly to Codex. Claude Code is an equally reasonable first choice when your institution already uses Anthropic.

Choose OpenCode when you need to select among many model providers or run a suitable local model. Choose Pi when you already understand terminal security and want a small agent that you can shape yourself. Pi has no built-in sandbox or permission prompts, so it is a poor first choice for an instructor who is new to coding agents.

| Your situation | Start with | Reason |
| --- | --- | --- |
| You want the most guided path through this template | Codex | Direct support for `AGENTS.md`, skills, permissions, model selection, and local repository work |
| Your university already supports Anthropic | Claude Code | Strong repository workflow, mature permissions, and direct support for the mirrored project skills |
| You need provider choice or a local model | OpenCode | Broad provider support, local model options, and granular permissions |
| You want a minimal tool that you will configure yourself | Pi | Small core, broad model choice, and many extension points |

This is a recommendation about ease of use in this repository. It is not a claim that one vendor always produces better code.

## Tool and model are different choices

The coding agent is the program that reads the repository, runs commands, edits files, manages permissions, and carries the conversation. Codex, Claude Code, OpenCode, and Pi are coding agents.

The model is the reasoning system used inside that program. The same model can behave differently across tools because each tool supplies different instructions, context, permissions, and tools. A model ranking therefore does not rank the whole coding agent.

This distinction matters when comparing results. Testing GPT-5.6 Sol in Codex against Claude Opus in Claude Code compares both the model and the surrounding tool. That is a useful practical comparison, but it does not isolate which part caused the difference.

## How the four tools differ

### Codex

Codex works in a terminal, IDE, desktop app, or cloud environment. The CLI can inspect and edit a local repository, run its existing commands, select a model and reasoning level, apply permissions, and run non-interactively in scripts or CI. The [official Codex CLI guide](https://developers.openai.com/codex/cli) documents the current setup and commands.

Use Codex when you want the simplest route through this template. Start it from the repository root, keep the normal permission checks enabled, and name the course skill in each request.

Useful commands include `/status`, `/model`, `/permissions`, and `/review`.

### Claude Code

Claude Code is available in the terminal, IDEs, a desktop app, and the browser. It reads `CLAUDE.md`, supports skills, runs repository commands, and provides configurable permissions. This repository keeps `CLAUDE.md` small and mirrors the canonical skills into `.claude/skills/`.

Use Claude Code when your institution already has Anthropic accounts or when your team prefers its terminal and IDE workflow. The [official overview](https://code.claude.com/docs/en/overview), [model guide](https://code.claude.com/docs/en/model-config), and [permission guide](https://code.claude.com/docs/en/permissions) describe the current behavior.

Useful commands include `/status`, `/model`, and `/permissions`.

### OpenCode

OpenCode is a provider-flexible coding agent. It can use many hosted providers and suitable local models. It reads `AGENTS.md`, discovers `.agents/skills/`, and lets you configure whether each action is allowed, blocked, or requires approval.

Use OpenCode when model choice, local inference, or provider routing is a real requirement. Expect more setup and more responsibility for credentials, billing, model compatibility, and provider-specific failures. The official guides cover [providers](https://opencode.ai/docs/providers), [models](https://opencode.ai/docs/models), [permissions](https://opencode.ai/docs/permissions), and [skills](https://opencode.ai/docs/skills).

Useful commands include `/connect` and `/models`. Keep approval prompts enabled while learning the tool.

### Pi

Pi is a small terminal coding agent with a deliberately minimal core. It reads `AGENTS.md`, discovers `.agents/skills/`, supports many providers, and can be extended with packages or TypeScript extensions.

Pi intentionally omits built-in permission prompts, a sandbox, plan mode, subagents, and several other workflow features. Those can be added, but the default places more responsibility on the user. Pi's own [usage guide](https://pi.dev/docs/latest/usage) and [security guide](https://pi.dev/docs/latest/security) recommend external containment for untrusted or unattended work.

Use Pi only when you are comfortable reviewing commands and protecting the host system. Run it in a container or another controlled environment when the work is untrusted or will run without supervision. The [quickstart](https://pi.dev/docs/latest/quickstart), [provider guide](https://pi.dev/docs/latest/providers), and [skills guide](https://pi.dev/docs/latest/skills) cover setup.

Useful commands include `/login`, `/model`, and `/skill:<name>`.

## What the current Arena rankings say

[Arena](https://arena.ai/leaderboard) is a public model evaluation based on user preferences and observed agent sessions. It is one useful source. It does not test whether a generated lesson is faithful to your slides, pedagogically sound, accessible, privacy-safe, or maintainable in this repository.

The most relevant boards disagree because they measure different work.

| Board and snapshot | What it measures | Current result worth knowing |
| --- | --- | --- |
| [Agent Arena overall](https://arena.ai/leaderboard/agent), 24 August 2026 | Tool use, task completion, steerability, command recovery, and tool hallucination across real agent sessions | Claude Opus 5 High ranks first. Claude Opus 5 Max and Claude Fable 5 High follow. GPT-5.6 Sol at xHigh ranks fourth. |
| [Code Arena WebDev](https://arena.ai/leaderboard/code/webdev), 21 August 2026 | Preference on front-end web development, including multi-step tool use | Claude Opus 5 Max ranks first. GPT-5.6 Sol at xHigh in the Codex harness ranks seventh. |
| [Text Arena coding](https://arena.ai/leaderboard/text/coding), 21 August 2026 | Preference on text-to-text coding answers | Claude Opus 4.7 High ranks first. Several top rank intervals overlap. GPT-5.6 Sol at xHigh ranks eleventh. |

The small score differences near the top should not be treated as stable proof that one model will build the better course. Rank intervals overlap, the boards change, and some Arena model labels are not available in every coding tool or account.

There is a concrete availability mismatch at the time of writing. Arena evaluates Claude Opus 5, while the current Claude Code model guide maps its `opus` alias to Opus 4.7 on the Anthropic API. Do not configure an Arena model name until your coding tool lists it. Use the tool's model picker and official documentation.

## A practical model policy

Use the strongest approved model for work where a subtle mistake can spread through the course. This includes onboarding, course planning, the first pilot module, difficult debugging, source review, and release preparation.

Use a balanced model after the pilot pattern has been approved. Routine test updates, repeated module mechanics, and documentation cleanup usually do not need the most expensive reasoning setting.

For Codex, OpenAI currently recommends [GPT-5.6 Sol](https://developers.openai.com/api/docs/models) for complex reasoning and coding, GPT-5.6 Terra for a balance of capability and cost, and GPT-5.6 Luna for cost-sensitive volume. Medium reasoning is a sound starting point. Increase it when the task contains difficult architecture, ambiguous source interpretation, or a persistent bug.

For Claude Code, the official model guide recommends `sonnet` for daily coding and `opus` for complex reasoning. The `best` alias selects the strongest model available to the account. The `opusplan` option uses Opus for planning and Sonnet for execution. Availability and defaults vary by plan and provider.

For OpenCode and Pi, select a model that your approved provider exposes and that reliably supports tool use. Do not assume that a high chat score means the model can edit a repository safely. Run the pilot below before scaling.

## Run a small pilot before committing

Use the same repository, source boundary, prompt, and acceptance criteria for every candidate. Do not compare generic landing pages. Compare one real learning module that includes a difficult concept, one interaction, learner feedback, back and next navigation, reload recovery, and mobile behavior.

Start with this prompt.

> Read README.md, AGENTS.md, course/MEMORY.md, materials/course-info.md, and course/COURSE_PLAN.md. Use the manage-course-lifecycle skill. Verify the template and tell me the current lifecycle stage. Do not change course content yet. Ask only if an instructor-owned decision would materially change the next step.

Then onboard the course and build one representative module. Score the result with evidence.

| Check | A good result |
| --- | --- |
| Source fidelity | Every non-trivial claim and answer can be traced to the supplied material or an approved source |
| Instructor burden | The agent inspects first and asks only about consequential teaching, scope, rights, privacy, or assessment decisions |
| Coverage | The source ledger records what is included, deferred, excluded, or unresolved |
| Learning design | The module asks students to reason, practise, compare, construct, trace, or explain |
| Feedback | Correct and incorrect paths explain the governing idea |
| State and navigation | Answers and explanations survive back, next, reload, and revisit without selecting an option by accident |
| Accessibility and layout | Keyboard and narrow-screen paths preserve the core task |
| Verification | `npm run ci` passes and the agent reports manual checks separately from automated checks |
| Change discipline | The agent preserves instructor material and unrelated work |

Reject a candidate if it invents course claims, loses learner state, skips the source trail, or calls the work excellent because the build passed. Those are product failures, even if the interface looks polished.

## First prompt in each tool

The workflow is the same. Only the explicit skill syntax changes.

| Tool | First prompt |
| --- | --- |
| Codex | `$manage-course-lifecycle Verify this template and guide me through the instructor tutorial. Do not change course content yet.` |
| Claude Code | `/manage-course-lifecycle Verify this template and guide me through the instructor tutorial. Do not change course content yet.` |
| OpenCode | `Use the manage-course-lifecycle skill. Verify this template and guide me through the instructor tutorial. Do not change course content yet.` |
| Pi | `/skill:manage-course-lifecycle Verify this template and guide me through the instructor tutorial. Do not change course content yet.` |

Natural language may load the right skill. Naming it makes the workflow easier to inspect and teach.

## Privacy, permissions, and cost

Do not give any coding agent student records, grades, health information, credentials, unpublished examinations, or source material that the selected account and provider are not approved to process.

A local coding tool can still send selected file content to a remote model provider. Provider-flexible tools can also route the same repository through different organizations. Confirm the exact account, provider, data terms, retention policy, and billing owner with your university before adding restricted material.

Keep the default permission prompts while learning a tool. Review proposed commands and the final diff. Do not enable unrestricted or unattended modes merely to avoid approval prompts. Pi needs an external sandbox or container when that protection is required.

API costs depend on the provider, model, reasoning level, context size, and retries. Set a budget before a large course run. A stronger model on one reviewed pilot is often cheaper than generating many weak modules and repairing them later.

Keep API keys and access tokens out of the repository. Use the tool's supported authentication or environment mechanism.

## Keep this guide current

Before each course release or at least once per term:

1. Open the live Arena Agent, WebDev, and Text Coding boards.
2. Check the official model picker and documentation for the tool you actually use.
3. Review provider, privacy, permission, and pricing changes with the university owner.
4. Repeat the representative pilot when changing the main model or coding tool.
5. Update the checked date and any model-specific wording in this file.

The pilot result is the local evidence that matters. A leaderboard helps choose candidates. It does not approve the course.
