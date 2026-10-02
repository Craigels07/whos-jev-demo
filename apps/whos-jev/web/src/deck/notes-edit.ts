/**
 * Editing commands for the notes textarea. Each takes the text and the selection and returns the new text and
 * selection, so the view only applies the result.
 */
export type Edit = { text: string; from: number; to: number };

const lineStart = (text: string, pos: number) => text.lastIndexOf("\n", pos - 1) + 1;
const lineEnd = (text: string, pos: number) => {
  const end = text.indexOf("\n", pos);
  return end < 0 ? text.length : end;
};
const caret = (text: string, at: number): Edit => ({ text, from: at, to: at });

/** Turns the line under the caret into a section, or into a bullet at the line's current depth. */
export function setLine(e: Edit, kind: "section" | "bullet"): Edit {
  const start = lineStart(e.text, e.from);
  const end = lineEnd(e.text, e.from);
  const [, indent, body] = e.text.slice(start, end).match(/^(\s*)(?:#{1,6}\s+|[-*]\s+)?(.*)$/)!;
  const line = kind === "section" ? `## ${body}` : `${indent}- ${body}`;
  return caret(e.text.slice(0, start) + line + e.text.slice(end), start + line.length);
}

/** Wraps the selection in a mark, or removes the mark when the selection already has it. */
export function toggleMark(e: Edit, mark: string): Edit {
  const n = mark.length;
  const { text, from, to } = e;
  if (text.slice(from - n, from) === mark && text.slice(to, to + n) === mark) {
    return { text: text.slice(0, from - n) + text.slice(from, to) + text.slice(to + n), from: from - n, to: to - n };
  }
  return { text: text.slice(0, from) + mark + text.slice(from, to) + mark + text.slice(to), from: from + n, to: to + n };
}

/** Moves every selected line one level in (two spaces) or out. */
export function indent(e: Edit, by: 1 | -1): Edit {
  const start = lineStart(e.text, e.from);
  const end = lineEnd(e.text, e.to);
  const lines = e.text.slice(start, end).split("\n");
  const moved = lines.map((l) => (by > 0 ? `  ${l}` : l.replace(/^(\t| {1,2})/, "")));
  const first = moved[0].length - lines[0].length;
  const total = moved.join("\n").length - (end - start);
  return {
    text: e.text.slice(0, start) + moved.join("\n") + e.text.slice(end),
    from: Math.max(start, e.from + first),
    to: Math.max(start, e.to + total),
  };
}

/**
 * Enter on a bullet starts the next one at the same depth. Enter on an empty bullet steps it out a level, and at
 * the top level ends the list. Null means Enter types a plain newline.
 */
export function enter(e: Edit): Edit | null {
  if (e.from !== e.to) return null;
  const start = lineStart(e.text, e.from);
  const m = e.text.slice(start, e.from).match(/^(\s*)([-*]\s+)(.*)$/);
  if (!m) return null;
  const [, depth, marker, body] = m;
  if (body.trim()) {
    const insert = `\n${depth}${marker}`;
    return caret(e.text.slice(0, e.from) + insert + e.text.slice(e.from), e.from + insert.length);
  }
  if (depth) return indent(e, -1);
  return caret(e.text.slice(0, start) + e.text.slice(e.from), start);
}

/** Puts a line of its own after the caret's line, or in place of it when that line is empty. */
export function insertLine(e: Edit, line: string): Edit {
  const start = lineStart(e.text, e.from);
  const end = lineEnd(e.text, e.from);
  if (!e.text.slice(start, end).trim()) return caret(e.text.slice(0, start) + line + e.text.slice(end), start + line.length);
  return caret(e.text.slice(0, end) + `\n${line}` + e.text.slice(end), end + 1 + line.length);
}
