/** Typed client for the node server: example metadata and the SSE run stream. */

export interface OptionMeta {
  key: "A" | "B" | "C";
  name: string;
  file: string;
  /** Example states, Set A onward. */
  inputs: Record<string, unknown>[];
  /** Optional names for the input sets, in the same order. Set A, Set B when absent. */
  sets?: string[];
  /** Optional per field: one plain sentence per input set, shown behind an (i) by the field. */
  info?: Record<string, string[]>;
  call: string;
  code: string;
  /** pi examples only: the extension file and tool allowlist the session loads. */
  extension?: string;
  tools?: string[];
}

export interface ExamplePayload {
  slug: string;
  /** The pi examples run a pi session instead of a one shot call. */
  agent?: boolean;
  options: OptionMeta[];
}

export async function fetchExample(slug: string): Promise<ExamplePayload> {
  const res = await fetch(`/api/example/${slug}`);
  if (!res.ok) throw new Error(`example ${slug}: HTTP ${res.status}`);
  return res.json();
}

export type StreamEvent = { event: string; data: any };

/** POST the edited input and yield every SSE event as it arrives. */
export async function* runOption(
  slug: string,
  option: string,
  input: Record<string, unknown>,
): AsyncGenerator<StreamEvent> {
  const res = await fetch(`/api/run/${slug}?option=${option}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ input }),
  });
  if (!res.ok || !res.body) throw new Error(`run: HTTP ${res.status}`);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let i: number;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const chunk = buf.slice(0, i);
      buf = buf.slice(i + 2);
      const ev = chunk.match(/^event: (.+)$/m);
      const data = chunk.match(/^data: (.+)$/m);
      if (ev && data) yield { event: ev[1], data: JSON.parse(data[1]) };
    }
  }
}
