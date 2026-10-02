<script setup lang="ts">
import { computed } from "vue";

/**
 * How a Score answer reads, and how the code combines several into one number, worked through
 * on the answers from the last run. `weights` and `total` come from the decision the code returned.
 */
const props = defineProps<{
  answers: Record<string, any>;
  weights?: Record<string, number>;
  total?: number;
}>();

const f = (n: number) => n.toFixed(2);

const rows = computed(() =>
  Object.entries(props.answers)
    .filter(([, a]) => a?.type === "score")
    .map(([id, a]) => {
      const levels = Object.keys(a.legend).map(Number).sort((x, y) => x - y);
      const top = levels.at(-1) ?? 0;
      const sum = levels.map((l) => `${l}×${f(Number(a.probabilities[String(l)] ?? 0))}`).join(" + ");
      const normalized = top ? a.score / top : 0;
      const weight = props.weights?.[id];
      return { id, sum, score: a.score, top, normalized, weight, part: weight === undefined ? undefined : weight * normalized, confidence: a.confidence };
    }),
);
</script>

<template>
  <section class="glass wide score-math">
    <h3>How the score works</h3>
    <div class="meta">Why a score can read 2.00 or 1.12, and how the code turns three scores into one priority</div>
    <ul class="math-points">
      <li>A score is a position on your levels, numbered from 0. Three levels run 0 to 2, four run 0 to 3. So 2.00 of 2 is the top level, not a value above 1.</li>
      <li>Jev returns a probability for each level. The score is the probability-weighted average of the level numbers, which is why it can land between two levels.</li>
      <li>Confidence is how concentrated those probabilities are on one level. 1.00 means all of it sits on one level. A split between two levels gives a low confidence, which is Jev saying it is not sure.</li>
      <li>The code divides each score by its top level, so scales with different numbers of levels compare on 0 to 1, then applies the weights and adds them up. Jev answers in your units; the arithmetic stays in code.</li>
    </ul>

    <template v-if="rows.length">
      <h4>Step 1: each score from its probabilities</h4>
      <div class="table-wrap">
        <table class="cost">
          <thead><tr><th class="left">Question</th><th class="left">Level × probability</th><th>Score</th><th>Confidence</th></tr></thead>
          <tbody>
            <tr v-for="r in rows" :key="r.id">
              <td class="left">{{ r.id }}</td>
              <td class="left mono">{{ r.sum }}</td>
              <td class="mono">{{ f(r.score) }} of {{ r.top }}</td>
              <td class="mono">{{ f(r.confidence) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="meta">The probabilities shown are rounded, so the sum can differ from Jev's score in the last digit.</div>

      <template v-if="weights">
        <h4>Step 2: normalize, weight, add</h4>
        <div class="table-wrap">
          <table class="cost">
            <thead><tr><th class="left">Factor</th><th>Score ÷ top level</th><th>Weight</th><th>Contribution</th></tr></thead>
            <tbody>
              <tr v-for="r in rows" :key="r.id">
                <td class="left">{{ r.id }}</td>
                <td class="mono">{{ f(r.score) }} ÷ {{ r.top }} = {{ f(r.normalized) }}</td>
                <td class="mono">× {{ r.weight ?? "–" }}</td>
                <td class="mono">{{ r.part === undefined ? "–" : f(r.part) }}</td>
              </tr>
              <tr v-if="total !== undefined" class="jev">
                <td class="left">priority</td><td></td><td></td><td class="mono">{{ f(total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </template>
    <p v-else class="meta">Run live to see the math worked through on this input.</p>
  </section>
</template>
