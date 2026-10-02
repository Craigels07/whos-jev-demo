<script setup lang="ts">
import { computed } from "vue";
import { highlightTs } from "../lib/highlight";

/**
 * The request and response bodies side by side, one row per question. Each column still reads
 * top to bottom as the exact JSON on the wire; the rows only cut it at the question boundaries,
 * so a question in Sent starts on the same line as its answer in Received.
 */
const props = defineProps<{
  request: { model: string; state: unknown; questions: Record<string, unknown> };
  response: { model: string; answers: Record<string, unknown>; usage: unknown } | null;
  calls: number;
}>();

/** JSON for a value nested `depth` levels in: every line after the first is indented to match. */
const nested = (v: unknown, depth: number) => JSON.stringify(v, null, 2).replace(/\n/g, "\n" + "  ".repeat(depth));
const entry = (key: string, v: unknown, last: boolean) => `    ${JSON.stringify(key)}: ${nested(v, 2)}${last ? "" : ","}`;
/** One block per line, indented by its leading spaces, so a wrapped string stays under its own key. */
const hl = (s: string) =>
  s.split("\n").map((line) => {
    const indent = line.length - line.trimStart().length;
    return `<span class="wl" style="--i:${indent}">${highlightTs(line.trimStart(), "json") || " "}</span>`;
  }).join("");

const ids = computed(() => {
  const asked = Object.keys(props.request.questions);
  const extra = Object.keys(props.response?.answers ?? {}).filter((id) => !asked.includes(id));
  return [...asked, ...extra];
});

const head = computed(() => ({
  sent: hl(`{\n  "model": ${JSON.stringify(props.request.model)},\n  "state": ${nested(props.request.state, 1)},\n  "questions": {`),
  received: props.response ? hl(`{\n  "model": ${JSON.stringify(props.response.model)},\n  "answers": {`) : "",
}));

const rows = computed(() => {
  const q = props.request.questions;
  const a = props.response?.answers ?? {};
  const askedIds = ids.value.filter((id) => id in q);
  const answeredIds = ids.value.filter((id) => id in a);
  return ids.value.map((id) => ({
    id,
    sent: id in q ? hl(entry(id, q[id], askedIds.at(-1) === id)) : "",
    received: id in a ? hl(entry(id, a[id], answeredIds.at(-1) === id)) : "",
  }));
});

const foot = computed(() => ({
  sent: hl("  }\n}"),
  received: props.response ? hl(`  },\n  "usage": ${nested(props.response.usage, 1)}\n}`) : "",
}));
</script>

<template>
  <section class="glass wire">
    <div class="wire-row wire-labels">
      <div>
        <h4>Sent<span v-if="calls > 1" class="meta-inline">call {{ calls }}</span></h4>
        <div class="meta">POST /decisions, the request body</div>
      </div>
      <div>
        <h4>Received<span v-if="calls > 1" class="meta-inline">call {{ calls }}</span></h4>
        <div class="meta">The response body, each answer beside its question</div>
      </div>
    </div>
    <div class="wire-body">
      <div class="wire-row">
        <pre class="code wire-cell" v-html="head.sent"></pre>
        <pre v-if="response" class="code wire-cell" v-html="head.received"></pre>
        <pre v-else class="code wire-cell wire-wait">Waiting for Jev ...</pre>
      </div>
      <div v-for="r in rows" :key="r.id" class="wire-row wire-q" :title="r.id">
        <pre class="code wire-cell" v-html="r.sent"></pre>
        <pre class="code wire-cell" v-html="r.received"></pre>
      </div>
      <div class="wire-row">
        <pre class="code wire-cell" v-html="foot.sent"></pre>
        <pre class="code wire-cell" v-html="foot.received"></pre>
      </div>
    </div>
  </section>
</template>
