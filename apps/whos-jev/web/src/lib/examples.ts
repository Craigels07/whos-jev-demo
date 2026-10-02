/** Static example metadata the pages render before any API call. In ramp order. */
export interface ExampleMeta {
  slug: string;
  title: string;
  /** "code": Jev called from plain code. "pi": Jev inside the pi agent, as a hook or a tool. */
  where: "code" | "pi";
  /** One description, always opening with "Use This For:" and when to reach for this example. */
  sub: string;
  /** Shows the "How the score works" button, which works the Score math through on the last run. */
  scoreMath?: boolean;
}

export const USE_LABEL = "Use This For:";

export const WHERE_LABEL: Record<ExampleMeta["where"], string> = {
  code: "In your code",
  pi: "In the pi agent",
};

/** The description split at the label so the page can color it: [before, after]. */
export function splitUse(sub: string): [string, string] {
  const i = sub.indexOf(USE_LABEL);
  return i < 0 ? [sub, ""] : [sub.slice(0, i), sub.slice(i + USE_LABEL.length)];
}

export const EXAMPLES: ExampleMeta[] = [
  { slug: "injection-gate", title: "Prompt Injection Gate", where: "code", sub: "Use This For: one yes or no that a regex or keyword check keeps getting wrong because meaning matters. One Noul, the smart, cheap, fast if statement." },
  { slug: "support-triage", title: "Support Triage", where: "code", sub: "Use This For: picking from lists you define. Two Choices in one call, which team and how urgent, and every answer is one of your options, so it maps straight onto a code path." },
  { slug: "ticket-priority", title: "Ticket Priority", where: "code", scoreMath: true, sub: "Use This For: grading on a scale you define. One Score per factor, and the weights that combine them live in code, so tuning means changing a number, not a prompt." },
  { slug: "bash-command-gate", title: "Bash Command Gate", where: "code", sub: "Use This For: an action where a wrong answer costs more than asking a human. One Choice and two Nouls in one call. The answer says what, confidence says whether: confident runs, unsure goes to a person." },
  { slug: "routing", title: "Routing", where: "code", sub: "Use This For: one cheap decision in front of expensive work, where most requests do not need the big model or a person." },
  { slug: "guardrail-hooks", title: "Guardrail Hooks", where: "pi", sub: "Use This For: checking every tool call an agent makes before it runs, where the agent never sees the check. The bash command gate and the injection gate, now as pi hooks." },
  { slug: "should-compact", title: "Should I Compact", where: "pi", sub: "Use This For: telling an agent when its context has moved on. Numbers in code, judgment in Jev. The agent hears nothing, a notice, a recommendation, or a request." },
];

/** One sentence per use case, shown on the selectable cards when an example has more than one. */
export const USE_CASES: Record<string, [string, string][]> = {
  "injection-gate": [
    ["Prompt injection gate", "One Noul in front of everything else: is this text talking to us, or trying to instruct the model?"],
  ],
  "support-triage": [
    ["Support triage", "Two Choices in one call: which team, how urgent. Both answers are options you declared. The other option gives the model an exit."],
  ],
  "ticket-priority": [
    ["Ticket priority", "Severity 0.6, frustration 0.3, report quality 0.1. Weights a reviewer can read in one line."],
  ],
  "bash-command-gate": [
    ["Bash command gate", "Read only, reversible, or irreversible, plus two Nouls: outside the repo, destructive. Low confidence is what asks the human."],
  ],
  routing: [
    ["Model router", "Choose the least costly model that can complete the task, plus an effort score for reasoning depth."],
  ],
  "guardrail-hooks": [
    ["Bash gate", "The bash command gate as a hook. Before any command runs: read only, reversible, or irreversible. Irreversible blocks. The agent sees only the reason."],
    ["Write gate", "Paths outside the repo block in code, no call. Inside, Jev asks whether the file or its content holds a credential."],
    ["Result screen", "The injection gate as a hook. After a read or a command, before the model sees it: data, or instructions aimed at the agent?"],
  ],
  "should-compact": [
    ["Turn end hook", "Four questions after every turn, one call. Silent, notice, recommend, or request, with Jev's reason. The agent never asked."],
    ["On demand tool", "The agent calls should_i_compact and gets a typed verdict: should it, which tier, why, and what to do next."],
    ["Pick the cut point", "Before compaction, Jev picks which turn starts the live work. The pick becomes the summary instructions."],
  ],
};
