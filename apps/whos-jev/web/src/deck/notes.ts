/**
 * Presenter notes, one Markdown file per slide id in ./notes/ (git-ignored, so they never reach the repo).
 * The lab server reads and writes them, so they are never bundled into the built app.
 */
export async function loadNotes(id: string): Promise<string> {
  const res = await fetch(`/api/notes/${id}`);
  if (!res.ok) throw new Error(`notes ${id}: HTTP ${res.status}`);
  return (await res.json()).text;
}

/** keepalive lets the last save finish when the notes window closes. */
export async function saveNotes(id: string, text: string): Promise<void> {
  const res = await fetch(`/api/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
    keepalive: true,
  });
  if (!res.ok) throw new Error(`notes ${id}: HTTP ${res.status}`);
}

/**
 * Typed text is also kept in this browser until the server confirms the save, so a failed save or a closed window
 * never loses it. The next load of the slide offers it back.
 */
const draftKey = (id: string) => `whosjev.notes.draft.${id}`;

export function readDraft(id: string): string | null {
  try {
    return localStorage.getItem(draftKey(id));
  } catch {
    return null;
  }
}

export function writeDraft(id: string, text: string): void {
  try {
    localStorage.setItem(draftKey(id), text);
  } catch {
    /* storage blocked: the server save still runs */
  }
}

/** Clears the draft once the saved text matches it. A newer draft typed meanwhile stays. */
export function settleDraft(id: string, saved: string): void {
  try {
    if (localStorage.getItem(draftKey(id)) === saved) localStorage.removeItem(draftKey(id));
  } catch {
    /* nothing to clear */
  }
}

/** Saves an image next to the notes and returns the name to put in ![](name). */
export async function uploadImage(id: string, file: Blob): Promise<string> {
  const res = await fetch(`/api/notes-images?slide=${id}`, { method: "POST", headers: { "Content-Type": file.type }, body: file });
  if (!res.ok) throw new Error(`image: HTTP ${res.status}`);
  return (await res.json()).name;
}

export function imageUrl(src: string): string {
  return /^https?:\/\//.test(src) ? src : `/api/notes-images/${encodeURIComponent(src)}`;
}

export type Bullet = { text: string; level: number };
export type Block =
  | { kind: "section"; text: string }
  | { kind: "bullets"; items: Bullet[] }
  | { kind: "text"; text: string }
  | { kind: "image"; src: string; alt: string };

/**
 * The small Markdown the notes use: "## " starts a section, "- " a bullet, two more spaces (or a tab) in front of
 * the "- " nest it a level, "![](name)" on its own line is an image, and a blank line ends a paragraph or a list.
 * Everything else is plain text with its line breaks kept. Inline marks are read by parseInline.
 */
export function parseNotes(source: string): Block[] {
  const blocks: Block[] = [];
  let open: Block | null = null;
  for (const raw of source.split("\n")) {
    const line = raw.trimEnd();
    const section = line.match(/^#{1,6}\s+(.*)$/);
    const bullet = line.match(/^(\s*)[-*]\s+(.*)$/);
    const image = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if (!line.trim()) {
      open = null;
    } else if (section) {
      blocks.push({ kind: "section", text: section[1] });
      open = null;
    } else if (image) {
      blocks.push({ kind: "image", alt: image[1], src: image[2] });
      open = null;
    } else if (bullet) {
      const item = { text: bullet[2], level: Math.floor(bullet[1].replace(/\t/g, "  ").length / 2) };
      if (open?.kind === "bullets") open.items.push(item);
      else blocks.push((open = { kind: "bullets", items: [item] }));
    } else if (open?.kind === "text") {
      open.text += `\n${line}`;
    } else {
      blocks.push((open = { kind: "text", text: line }));
    }
  }
  return blocks;
}

export type Span = { text: string; bold: boolean; underline: boolean };

/**
 * Inline marks inside any block: **bold** and __underline__ (underline is this deck's own mark, plain Markdown has
 * none). Marks can nest. A mark with no partner later in the text stays as typed.
 */
export function parseInline(source: string): Span[] {
  const parts = source.split(/(\*\*|__)/);
  const left: Record<string, number> = { "**": 0, __: 0 };
  for (const part of parts) if (part in left) left[part]++;
  const spans: Span[] = [];
  let bold = false;
  let underline = false;
  for (const part of parts) {
    if (part in left) {
      left[part]--;
      const on = part === "**" ? bold : underline;
      if (on || left[part] > 0) {
        if (part === "**") bold = !bold;
        else underline = !underline;
        continue;
      }
    }
    if (part) spans.push({ text: part, bold, underline });
  }
  return spans;
}
