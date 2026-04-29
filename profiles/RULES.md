# Token-efficiency rules

These rules eliminate the most common sources of wasted tokens in Claude / Gemini coding sessions.

## Core problems they fix
1. Missing context before coding (rewriting blind).
2. Verbose output that repeats the question.
3. Unnecessary full-file rewrites instead of targeted edits.
4. Re-reading files already in context.
5. No validation before declaring "done".
6. Sycophantic preamble and closing fluff.
7. Over-engineered solutions for trivial requests.
8. Prompt conflict confusion when multiple rule sources disagree.

## Resolution priority (highest to lowest)
1. The user's current message.
2. Project root `CLAUDE.md` / `GEMINI.md`.
3. Profile files under `profiles/`.
4. Tool / system defaults.

When in doubt, the user wins. The rule files never fight an explicit user instruction.

## When to use each profile
- `CLAUDE.md` (root) — universal baseline. Always loaded.
- `profiles/CLAUDE.coding.md` — dev work, code review, refactors.
- `profiles/CLAUDE.agents.md` — pipelines, automation, bots.
- `profiles/CLAUDE.analysis.md` — research, data, reports.
- `profiles/CLAUDE.benchmark.md` — minimum-overhead benchmark runs.
- `profiles/RULES-IN-PROMPT.md` — out-of-repo paste-in version.

To switch profile, copy the desired file over `CLAUDE.md`:
```
cp profiles/CLAUDE.agents.md CLAUDE.md
```
