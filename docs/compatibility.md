# Coding-agent compatibility

## Canonical files

`AGENTS.md` is the canonical project instruction file. Codex, OpenCode, and Pi load it directly. Claude Code loads `CLAUDE.md`, whose first line imports `AGENTS.md`.

`.agents/skills/` is the canonical skill directory. Codex, OpenCode, and Pi discover this location directly. Claude Code discovers `.claude/skills/`, so `npm run sync:skills` mirrors the canonical skills there. `npm test` fails if the copies drift.

`course/MEMORY.md` is the canonical course memory for every tool. Keeping durable context in the repository makes handoffs inspectable and prevents the workflow from depending on a vendor-specific memory feature.

Do not edit `.claude/skills/` directly.

## Why skills instead of vendor-specific subagents

The four tools use different formats for named subagents, but they share the `SKILL.md` convention. The starter therefore models lifecycle coordination, onboarding, module and practice creation, debugging, review, and release as portable skills. This gives instructors named workflows without maintaining four agent configurations.

Vendor-specific agents can be added later if a real workflow needs separate model settings, permissions, or delegation. They should reference the canonical skills instead of copying their behavioural instructions.

## Invocation summary

| Tool | Project instructions | Skills | Explicit invocation |
| --- | --- | --- | --- |
| Codex | `AGENTS.md` | `.agents/skills/` | `$skill-name …` |
| Claude Code | `CLAUDE.md` imports `AGENTS.md` | `.claude/skills/` | `/skill-name …` |
| OpenCode | `AGENTS.md` | `.agents/skills/` | ask it to use the named skill |
| Pi | `AGENTS.md` | `.agents/skills/` | `/skill:skill-name …` |

## Choosing among the tools

Compatibility does not make the tools identical. Their model access, permissions, sandboxing, planning support, interfaces, and cost controls differ. Instructors should use [choosing-an-agent.md](choosing-an-agent.md) before selecting a tool or copying a model name from a leaderboard.

The default recommendation is the coding agent already approved by the university. Codex is the simplest starting point when no standard exists. Pi requires particular care because its default installation has no built-in sandbox or permission prompts.

## Maintenance

After editing, adding, or renaming a canonical skill:

```bash
npm run sync:skills
npm test
```

This compatibility design was checked against the official documentation available on 25 August 2026:

- [Codex `AGENTS.md`](https://developers.openai.com/codex/guides/agents-md)
- [Codex skills](https://developers.openai.com/codex/skills)
- [Claude Code project memory](https://code.claude.com/docs/en/memory)
- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [OpenCode skills](https://opencode.ai/docs/skills)
- [Pi skills](https://pi.dev/docs/latest/skills)
- [Pi security](https://pi.dev/docs/latest/security)

The collaboration loop also follows the broader Codex harness pattern: manage context and progress around the model, keep confirmed facts distinct from assumptions, track decisions and blockers, verify work, and leave a clear next step. See OpenAI's [Codex as a platform](https://learn.chatgpt.com/blog/codex-as-a-platform) and [project teammate pattern](https://learn.chatgpt.com/use-cases/project-teammate).
