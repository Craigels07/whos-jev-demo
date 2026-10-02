# Who's Jev

Seven examples of [Jev](https://typesafe.ai), TypeSafe's System One decision model, and a short deck that introduces it. The examples ramp from a single yes or no in your code to Jev running inside the pi coding agent.

## What Jev does

You send Jev a `state` and a set of typed questions. 70 to 500 ms later you get typed answers back, with probabilities your code can branch on, for a fraction of a cent. It does not write text. It decides.

| Type | You ask | You get back |
|---|---|---|
| `noul` | a yes or no question | the probability of yes, 0 to 1 |
| `choice` | pick one of up to 255 options you define | the pick, a probability per option, and a confidence |
| `score` | a position on 2 to 10 levels you describe | the score, the probabilities, and a confidence |

A `choice` answer is always one of your options, so every answer maps onto a code path.

## Setup

Prerequisites: [Node 22+](https://nodejs.org), [just](https://github.com/casey/just), a TypeSafe key for live runs, and for the two pi examples [pi](https://github.com/earendil-works/pi-mono) with the dario proxy running on `localhost:3456`.

```bash
cd apps/whos-jev/web && npm install && cd ../../..
cp .env.example .env                             # then put your TypeSafe key in it
npm install -g @earendil-works/pi-coding-agent   # only for the pi examples
just web                                         # opens the lab on http://127.0.0.1:4399
```

Without a key, the code examples run on an offline mock. The pi agent runs Claude Sonnet (`anthropic/claude-sonnet-4-6`) through dario, using `ANTHROPIC_BASE_URL` and `ANTHROPIC_API_KEY` from `.env`.

## The deck

Open http://127.0.0.1:4399/jev, or click **What is Jev** in the lab. Seven slides, moved with the arrow keys or the buttons:

1. What makes Jev different?
2. State
3. Define a question
4. Confidence and probability
5. How Jev differs from an LLM
6. Training Jev: from RLHF to RLCD
7. For next time: Jev, Laya, Tev1 and Nimble

**Disclaimer** on the first slide plays the end of TypeSafe's launch video, from 2:27, with sound.

### Presenter notes

Press `n` on any slide. The notes open in their own popup window and follow the deck as you move, and the arrow keys work in either window. When you present, share only the deck's browser tab, and the notes stay private. In Chrome's share picker, choose the tab and turn on **Also share tab audio** so the room hears the Disclaimer clip.

Click **Edit** in the popup to write notes. `## ` starts a section, `- ` a bullet, Tab nests a bullet, `**bold**` and `__underline__` mark text, and you can paste or drop an image. Notes save as you type to `apps/whos-jev/web/src/deck/notes/<slide-id>.md`, with images in `notes/images/`. That folder is git-ignored, so the notes stay on your machine. Typed text is also kept in the browser until the lab server confirms the save.

## The examples

The first five call Jev from plain code and show how Jev works. The last two run Jev inside the pi coding agent and show how an agent uses it: as hooks the agent never sees, and as a tool it chooses to call.

| Example | Where | Idea | Options |
|---|---|---|---|
| Prompt injection gate | your code | `noul`: one yes or no, the smart if statement | one |
| Support triage | your code | `choice`: two picks in one call, which team and how urgent | one |
| Ticket priority | your code | `score`: one score per factor, weights in code | one |
| Bash command gate | your code | mixed: one `choice` and two `noul`s in one call, confidence decides run or ask a human | one |
| Routing | your code | one cheap decision in front of expensive work: which model a task needs | one |
| Guardrail hooks | pi agent | Jev checks tool calls before they run | bash gate, write gate, result screen |
| Should I compact | pi agent | Jev decides when the agent's context has moved on | turn end hook, on demand tool, pick the cut point |

The guardrail hooks reuse two earlier ideas inside pi: the bash gate is the bash command gate as a `tool_call` hook, and the result screen is the injection gate as a `tool_result` hook.

The design rules the example code follows are in [`apps/whos-jev/README.md`](apps/whos-jev/README.md).

## Commands

```bash
just web          # build the Vue app and serve the lab and deck on port 4399
```

The rest run from `apps/whos-jev` with npm: `npm test` for the offline tests, `npm run demo` to print every example on the mock, and `npm run demo:live` or `npm run test:live` against real Jev.

## Layout

```
apps/whos-jev/
├── src/core/          # Jev client, types, helpers, offline mock
├── src/examples/      # one folder per example, one file per option
├── extensions/        # pi extensions for the two pi examples
├── sandbox/           # small billing service the agents work in, with one failing test on purpose
├── server/            # lab API, pi session management, presenter notes storage
├── web/               # the Vue lab
│   ├── src/deck/      # the slides, their sketches, and the presenter notes window
│   └── public/deck/   # the deck's image and video clip
└── tests/             # offline and live tests
```

## Caveats

- The offline mock matches by word overlap. It checks contracts and decision code, not judgment quality.
- Jev guardrails are one signal, not a security control. In testing, an agent blocked from writing a file wrote it with a bash heredoc instead.
- The agent's bash tool can print its environment, so the lab passes pi only the variables it needs. Treat `.sessions/` as sensitive.
- Through dario, Claude only receives Claude Code's own tools (Bash, Edit, Read, Write), not the ones an extension adds. In Should I compact, Jev still advises the agent, but the agent cannot call `compact_now` or `should_i_compact`.
- Presenter notes exist only on the machine that wrote them. Copy `web/src/deck/notes/` yourself if you present from somewhere else.
