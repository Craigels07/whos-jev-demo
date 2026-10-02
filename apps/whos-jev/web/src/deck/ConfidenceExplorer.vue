<script setup lang="ts">
import { computed, ref } from "vue";

const options = ["A", "B", "C"];
const presets = [
  { label: "Clear winner", values: [90, 6, 4] },
  { label: "Spread out", values: [40, 33, 27] },
  { label: "Even split", values: [100 / 3, 100 / 3, 100 / 3] },
];
const epsilon = 0.000001;

const probabilities = ref([90, 6, 4]);
/** The worked formula stays collapsed until the presenter opens it. */
const whyOpen = ref(false);

function changeProbability(index: number, value: number) {
  const current = probabilities.value;
  const [first, second] = [0, 1, 2].filter((i) => i !== index);
  const remaining = 100 - value;
  const previousRemaining = current[first] + current[second];
  const next = [...current];
  next[index] = value;
  next[first] = previousRemaining > 0 ? (remaining * current[first]) / previousRemaining : remaining / 2;
  next[second] = remaining - next[first];
  probabilities.value = next;
}

function sameValues(a: number[], b: number[]) {
  return a.every((value, i) => Math.abs(value - b[i]) < epsilon);
}

function formatPercent(value: number) {
  if (Math.abs(value - 100 / 3) < epsilon) return "33⅓%";
  return `${Number(value.toFixed(1))}%`;
}

function formatProbability(value: number) {
  return Math.abs(value - 1 / 3) < epsilon ? "0.333" : value.toFixed(2);
}

function trim(value: number) {
  return String(Number(value.toFixed(3)));
}

const peak = computed(() => Math.max(...probabilities.value) / 100);
const confidence = computed(() => Math.max(0, Math.min(1, (3 * peak.value - 1) / 2)));
const winners = computed(() => options.filter((_, i) => Math.abs(probabilities.value[i] / 100 - peak.value) < epsilon));
const hasWinner = computed(() => winners.value.length === 1);
const selected = computed(() => (hasWinner.value ? `Selected: Option ${winners.value[0]}` : `Tie: ${winners.value.join(", ")}`));
const chartLabel = computed(() => {
  const parts = options.map((o, i) => `${o} ${formatPercent(probabilities.value[i])}`).join(", ");
  return `Probability distribution: ${parts}. ${selected.value}.`;
});

const isThird = computed(() => Math.abs(peak.value - 1 / 3) < epsilon);
const isCertain = computed(() => Math.abs(peak.value - 1) < epsilon);
const peakText = computed(() => (isThird.value ? "1/3" : trim(peak.value)));
const numeratorText = computed(() => (isThird.value ? "0" : trim(3 * peak.value - 1)));
const reading = computed(() => {
  if (isCertain.value) return `The model is completely concentrated on ${winners.value[0]}. 100% concentration → confidence 1.0.`;
  if (winners.value.length === 3) return "A perfectly even distribution → confidence 0.";
  return `The largest probability is ${peakText.value}, so confidence is ${confidence.value.toFixed(2)}.`;
});

const references = [
  {
    values: [1, 0, 0],
    table: "A 1.00, B 0.00, C 0.00",
    peak: "1",
    sub: "3(1) − 1",
    num: "2",
    result: "1.0",
    reading: "100% concentration → confidence 1.0",
  },
  {
    values: [1 / 3, 1 / 3, 1 / 3],
    table: "A 0.333, B 0.333, C 0.333",
    peak: "1/3",
    sub: "3(1/3) − 1",
    num: "1 − 1",
    result: "0",
    reading: "perfectly even distribution → confidence 0",
  },
];
const fractions = computed(() => probabilities.value.map((v) => v / 100));
</script>

<template>
  <section class="cx" aria-label="Explore probabilities and confidence">
    <div class="cx-head">
      <div>
        <div class="cx-eyebrow">Choice question with three options</div>
        <div class="cx-title">See how probability distribution changes confidence</div>
      </div>
      <div class="cx-score" role="status" aria-live="polite" aria-atomic="true">
        <div class="cx-score-label">Confidence</div>
        <output class="cx-score-value">{{ confidence.toFixed(2) }}</output>
      </div>
    </div>

    <div class="cx-body">
      <div role="img" :aria-label="chartLabel">
        <div class="cx-chart" aria-hidden="true">
          <div v-for="tick in [0, 50, 100]" :key="tick" class="cx-grid" :style="{ bottom: `${tick}%` }">
            <span>{{ tick }}%</span>
          </div>
          <div class="cx-bars">
            <div v-for="(option, i) in options" :key="option" class="cx-bar" :style="{ height: `${probabilities[i]}%` }">
              <span class="cx-bar-value">{{ formatPercent(probabilities[i]) }}</span>
              <div class="cx-bar-fill" :class="{ win: hasWinner && winners[0] === option }"></div>
              <span class="cx-bar-name">{{ option }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="cx-controls">
        <label v-for="(option, i) in options" :key="option" class="cx-row">
          <span class="cx-row-name">{{ option }}</span>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            :value="probabilities[i]"
            :aria-label="`Probability of ${option}`"
            :aria-valuetext="formatPercent(probabilities[i])"
            @input="changeProbability(i, Number(($event.target as HTMLInputElement).value))"
          />
          <output class="cx-row-value">{{ formatPercent(probabilities[i]) }}</output>
        </label>
        <div class="cx-presets" role="group" aria-label="Example distributions">
          <button
            v-for="preset in presets"
            :key="preset.label"
            type="button"
            class="ghost cx-preset"
            :aria-pressed="sameValues(probabilities, preset.values)"
            @click="probabilities = [...preset.values]"
          >
            {{ preset.label }}
          </button>
        </div>
        <div class="cx-selected" aria-live="polite">{{ selected }}</div>
      </div>
    </div>
  </section>

  <div class="cx-formula">
    <span>confidence =</span>
    <span class="cx-frac"><span>3p<sub>max</sub> − 1</span><span>2</span></span>
    <span>where p<sub>max</sub> is the largest probability among the three options.</span>
  </div>
  <p class="cx-note">The demo on the TypeSafe Confidence page uses this formula to approximate confidence for three options.</p>

  <h2 class="cx-h2">
    <button type="button" class="point-link" :aria-expanded="whyOpen" aria-controls="cx-why-body" @click="whyOpen = !whyOpen">
      Why that formula?
      <span class="point-more drop" :class="{ open: whyOpen }">{{ whyOpen ? "Hide" : "Show" }}</span>
    </button>
  </h2>
  <div v-if="whyOpen" id="cx-why-body">
  <div class="cx-why">
    <table class="table cx-table">
      <thead>
        <tr><th>Option</th><th>Probability</th></tr>
      </thead>
      <tbody>
        <tr v-for="(option, i) in options" :key="option">
          <th>{{ option }}</th>
          <td>{{ formatProbability(fractions[i]) }}</td>
        </tr>
      </tbody>
    </table>
    <div class="cx-work">
      <div>p<sub>max</sub> = {{ peakText }}</div>
      <div class="cx-steps">
        <span class="cx-frac"><span>3p<sub>max</sub> − 1</span><span>2</span></span>
        <span>=</span>
        <span class="cx-frac"><span>3({{ peakText }}) − 1</span><span>2</span></span>
        <span>=</span>
        <span class="cx-frac"><span>{{ numeratorText }}</span><span>2</span></span>
        <span>=</span>
        <span class="cx-box">{{ confidence.toFixed(2) }}</span>
      </div>
      <p>{{ reading }}</p>
    </div>
  </div>

  <div class="cx-refs">
    <div v-for="example in references" :key="example.table" class="cx-ref" :class="{ match: sameValues(fractions, example.values) }">
      <div class="cx-ref-table">{{ example.table }}</div>
      <div>p<sub>max</sub> = {{ example.peak }}</div>
      <div class="cx-steps">
        <span class="cx-frac"><span>{{ example.sub }}</span><span>2</span></span>
        <span>=</span>
        <span class="cx-frac"><span>{{ example.num }}</span><span>2</span></span>
        <span>=</span>
        <span class="cx-box">{{ example.result }}</span>
      </div>
      <div class="cx-ref-reading">{{ example.reading }}</div>
    </div>
  </div>
  <p class="cx-note">For three options the largest probability ranges from 1/3 to 1, and the formula maps that range linearly onto 0 to 1.</p>
  </div>
</template>
