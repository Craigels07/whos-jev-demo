/**
 * Bash command gate: a mixed example, one Choice and two Nouls, with confidence deciding whether the command runs or a human is asked.
 * read only, reversible, irreversible before an agent runs anything. An ambiguous rm -rf once came back irreversible at confidence 0.33, and the 0.33 is what asks the human.
 */
import { jev } from "../../core/client.ts";
import { choice, noul } from "../../core/helpers.ts";
import type { ChoiceAnswer, NoulAnswer } from "../../core/types.ts";
import { CONFIDENCE } from "./confidence.ts";

export type CommandSafety = {
  classification: "read_only" | "reversible" | "irreversible";
  /** What happens next: run unattended, ask the user to confirm, or hand it to a human. */
  action: "run" | "confirm" | "human";
  /** Why, in a few words: the first rule that decided it. */
  reason: string;
  run: boolean;
  requiresHuman: boolean;
  confidence: number;
};

/** Classify a shell command before an agent runs it. */
export async function gateShellCommand(command: string, cwd: string): Promise<CommandSafety> {
  const { answers } = await jev.systemOne({ command, cwd }, {
    risk: choice("Classify the effect of running `command` in `cwd`.", {
      read_only: "Only reads files, state, or output; changes nothing",
      reversible: "Writes, moves, or creates, but is undoable with git or a backup",
      irreversible: "Deletes, force-pushes, rewrites history, deploys, or touches outside the repo",
    }),
    touches_outside_repo: noul("Does `command` modify anything outside `cwd`?"),
    destructive_intent: noul("Does `command` delete files, drop data, or force-push?"),
  });
  return decideCommandSafety(
    answers.risk as ChoiceAnswer,
    answers.touches_outside_repo as NoulAnswer,
    answers.destructive_intent as NoulAnswer
  );
}

export function decideCommandSafety(
  risk: ChoiceAnswer,
  touchesOutside: NoulAnswer,
  destructive: NoulAnswer
): CommandSafety {
  const classification = risk.choice as CommandSafety["classification"];
  // The famous shadow-test result: an ambiguous `rm -rf` came back
  // "irreversible" at 0.56 probability with confidence 0.33 — and the 0.33
  // is what tells the harness to ask a human. We encode exactly that.
  const humanReason =
    risk.confidence < CONFIDENCE.REVIEW_FLOOR ? `unsure, confidence ${risk.confidence.toFixed(2)}` :
    destructive.noul > 0.6 ? "destructive" :
    touchesOutside.noul > 0.6 ? "outside the repo" :
    classification !== "read_only" && risk.confidence < CONFIDENCE.DESTRUCTIVE_BAR ? "a change below 0.9" :
    null;
  const requiresHuman = humanReason !== null;
  const run = classification === "read_only" && !requiresHuman;
  return {
    classification,
    action: run ? "run" : requiresHuman ? "human" : "confirm",
    reason: humanReason ?? (run ? "read only" : "a confident change"),
    run,
    requiresHuman,
    confidence: risk.confidence,
  };
}
