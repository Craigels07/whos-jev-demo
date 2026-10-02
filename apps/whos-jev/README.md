# Who's Jev, the lab

Seven examples of [Jev](https://typesafe.ai), TypeSafe AI's System One model. The first five call Jev
from plain code and show how it works. The last two run Jev inside the pi coding agent and show how
an agent uses it. Every option is covered by tests: zero runtime dependencies, Node 22+ (Node 24 runs
the TypeScript natively, no build step for the examples).

```
npm test     # offline tests across core and every example (deterministic mock backend)
npm run demo # print every example running end to end
```

## The examples

| Example | Where | Idea | Options |
|---|---|---|---|
| Prompt injection gate | code | `noul`, the smart if statement | one |
| Support triage | code | two `choice`s in one call, every answer maps onto a code path | one |
| Ticket priority | code | `score` per factor, weights in code | one |
| Bash command gate | code | mixed `choice` and `noul`, confidence decides run or ask a human | one |
| Routing | code | Jev in front of expensive things, which model a task needs | one |
| Guardrail hooks | pi | Jev in the tool_call and tool_result hooks | bash gate · write gate · result screen |
| Should I compact | pi | four questions after every turn, four tiers back | turn end hook · on demand tool · pick the cut point |

## The live lab

```sh
npm run web   # → http://127.0.0.1:4399
```

One page per example. The code examples run one call: edit the state, **Run live**, and read the
typed answers as probability bars, then the request and response bodies side by side, one row per
question, so each answer sits beside its question. A cost table compares the call against six chat
models. The pi examples open an **agent window**: a real `pi` session in a copy of `sandbox/`, with
the example's extension loaded and an explicit tool allowlist. You prompt it, the box locks, Go
becomes Stop, and every tool call, hook decision, and Jev call lands as one line. Click a line for
the details. The footer shows the model, the LLM cost, the Jev cost, and the context bar.

The same server serves the deck at `/jev` and its presenter notes window at `/jev-notes`. The
notes are Markdown files in `web/src/deck/notes/` (git-ignored), read and written through
`/api/notes/:slide`, with images through `/api/notes-images`. The root README covers presenting.

Live when `TYPESAFE_API_KEY` is set (`JEV_BACKEND=mock` forces the offline mock for the code
examples). The agent runs `anthropic/claude-sonnet-4-6` through the dario proxy: pi reads
`ANTHROPIC_BASE_URL` and `ANTHROPIC_API_KEY`, and the lab passes both through. Override the model
with `JEV_AGENT_MODEL`. The child pi never inherits `PI_MODEL`/`PI_PROVIDER` from a calling
pi session. Extensions report every decision on stderr as `JEV_EVENT` lines and as session entries.

## Mock vs live

With no backend selected, every call runs against `src/core/mock.ts` — a deterministic, offline
stand-in that mimics the exact wire contract (typed answers, distributions that sum to 1, legends,
confidence). It stands in for **shape**, not intelligence: it decides by token overlap, so rubric
wording matters more than it would live. `npm test` always runs the mock.

Live runs go to TypeSafe (`POST api.typesafe.ai/v1/systemone`) with `TYPESAFE_API_KEY`.

```sh
export TYPESAFE_API_KEY=...
npm run demo:live   # every example against real Jev
npm run test:live   # live tests, one per example
```

Live responses pass a strict contract check before they reach your code (distributions cover every
declared option and sum to ~1, choices are declared options).

## Where things live

```
src/core/       types.ts (wire contract + validation), client.ts, mock.ts, helpers.ts (noul/choice/score)
src/examples/   one folder per example, one file per option, questions and thresholds in that file
src/example.ts  runs one example, one option, or all of them in the terminal
extensions/     jev-guard.ts (guardrail hooks), jev-compact.ts (should I compact), report.ts (side channel)
server/         server.mjs (lab API, static files, notes), scenarios.mjs (what each page runs), agent-session.mjs (pi)
web/src/deck/   the slides, slides.ts (their order), the notes window's parsing, editing, and sync
tests/          core and client tests, one test file per example, live.test.ts
```

## The rules this codebase follows (from the TypeSafe docs and field reports)

1. **One snap judgment per question.** "Does this convey urgency?" — not "analyze and decide the best action."
2. **Fan out.** Ask every question you might need in one request, including speculative ones; code decides which answers to use.
3. **Numbers, dates, and counting stay in code.** Jev picks a card from the deck; it doesn't name one. Filter candidates first, let Jev choose.
4. **Confidence is a second axis.** Floor (route to human), bar (auto-execute destructive), and the middle confirms.
5. **Give the model an exit.** An `other` / `none_of_the_above` option whenever the list might not cover every input.
6. **Describe situations, not degrees.** "Blocking issue; no workaround exists" — not "moderately severe."
7. **Questions and thresholds in one reviewable file per option.** The part a human audits.
8. **Isolate the state.** If you're classifying a passage, don't send the whole document — context rot is real.
9. **Second requests only for real dependencies.** If the next question's options depend on the first answer, that's a second request; otherwise fan out.
10. **The 255-option Choice cap is a feature.** Dynamic blocks prune in code before they build; `validateQuestions` enforces the cap.

## The pi examples in one paragraph

The code examples call Jev from code. The pi examples put Jev inside the pi harness. Guardrail hooks
are two hooks the agent never sees: `tool_call` blocks irreversible commands and credential writes,
`tool_result` flags injected instructions. They are the bash command gate and the injection gate,
moved into the agent. Should I compact is the `turn_end` hook asking four questions after every
turn, with the numbers in code and the agent hearing nothing, a notice, a recommendation, or a
request, plus a `should_i_compact` tool the agent can call itself. Extensions live in `extensions/`,
the decision code they import lives in `src/examples/`, and the sandbox they work in lives in `sandbox/`.
