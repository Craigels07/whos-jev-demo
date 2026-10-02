<script setup lang="ts">
import { ref } from "vue";

/**
 * The comparison in three groups the presenter reveals in order: what Jev is, what it costs, and
 * what it guarantees. The first group shows on load; later groups appear when opened.
 */
const groups = [
  {
    label: "What it is",
    rows: [
      ["Built to", "Produce text for humans", "Return decisions for code"],
      ["Inputs", "Text, as a sequence of messages", "Text, as structured program state"],
      ["Outputs", "Text you parse and validate", "Typed values from an answer space you define with Choice, Score and Noul"],
    ],
  },
  {
    label: "What it costs",
    rows: [
      ["Sampling", "One token at a time", "All outputs in one query"],
      ["Speed", "3 to 329 s for frontier models", "70 to 500 ms"],
      ["Cost", "$0.20 to $10 per million input tokens, output about 5x more", "$0.042 per million input tokens, output free"],
    ],
  },
  {
    label: "What it guarantees",
    rows: [
      ["Answers", "Can fall outside what you asked for", "Always one of your options, though it can still pick the wrong one"],
      ["Types", "Can return output that fails your schema", "Always matches your types"],
    ],
  },
];
const shown = ref(0);
</script>

<template>
  <section class="slide">
    <h1>How Jev differs from an LLM</h1>

    <div class="tr-segments" role="tablist" aria-label="Comparison groups">
      <button
        v-for="(g, i) in groups"
        :key="g.label"
        type="button"
        role="tab"
        class="tr-seg"
        :class="{ on: shown === i, done: shown > i }"
        :aria-selected="shown === i"
        @click="shown = i"
      ><b>{{ i + 1 }}</b>{{ g.label }}</button>
    </div>

    <table class="table vs-table">
      <thead>
        <tr><th></th><th>Other LLMs</th><th class="vs-jev">Jev</th></tr>
      </thead>
      <template v-for="(g, i) in groups" :key="g.label">
        <tbody v-if="i <= shown">
          <tr class="vs-group"><th colspan="3">{{ g.label }}</th></tr>
          <tr v-for="r in g.rows" :key="r[0]"><th>{{ r[0] }}</th><td>{{ r[1] }}</td><td class="vs-jev">{{ r[2] }}</td></tr>
        </tbody>
      </template>
    </table>

    <div class="vs-nav">
      <button v-if="shown < groups.length - 1" type="button" class="ghost" @click="shown++">Next: {{ groups[shown + 1].label }}</button>
    </div>

    <p v-if="shown === groups.length - 1" class="note">TypeSafe says Jev "can't hallucinate" and "never makes type errors". That is a guarantee about format: the answer is always a valid option, but it can still be the wrong valid option.</p>
    <ul class="points">
      <li>Jev does not write replies, produce code or explain its reasoning.</li>
    </ul>
    <footer class="sources">
      Sources:
      <a href="https://typesafe.ai/blog/introducing-system-one-models-and-jev">Introducing System One models and Jev</a>,
      <a href="https://docs.typesafe.ai/introduction.md">Introduction</a>,
      <a href="https://docs.typesafe.ai/concepts/system-one.md">System One</a>
    </footer>
  </section>
</template>
