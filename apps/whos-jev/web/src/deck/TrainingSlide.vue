<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from "vue";
import DeckDropdown from "./DeckDropdown.vue";
import RlcdWhatSketch from "./sketches/RlcdWhatSketch.vue";
import RlhfSketch from "./sketches/RlhfSketch.vue";
import RlvrSketch from "./sketches/RlvrSketch.vue";
import RlcdSketch from "./sketches/RlcdSketch.vue";
import CalibrationWhySketch from "./sketches/CalibrationWhySketch.vue";

/**
 * Three segments, walked through in order: what RLCD is, then RLHF, RLVR and RLCD side by side on a
 * track the presenter pans along, then why calibration makes sense. Back and
 * Next step through all five stops, so the room sees one thing at a time. The RLHF and RLCD comparison below appears once
 * the walk has reached RLCD.
 */
const segments = [
  { key: "what", label: "What is RLCD?" },
  { key: "signals", label: "Reward signals" },
  { key: "why", label: "Why calibration?" },
];
const methods = [
  { key: "rlhf", name: "RLHF", full: "Reinforcement Learning from Human Feedback" },
  { key: "rlvr", name: "RLVR", full: "Reinforcement Learning with Verifiable Rewards" },
  { key: "rlcd", name: "RLCD", full: "Reinforcement Learning for Calibrated Decisions" },
];
/** The stops in walk order. The middle segment has one stop per method. */
const stops = [
  { segment: 0, label: "What is RLCD?" },
  { segment: 1, method: 0, label: "RLHF" },
  { segment: 1, method: 1, label: "RLVR" },
  { segment: 1, method: 2, label: "RLCD" },
  { segment: 2, label: "Why calibration?" },
];
const stop = ref(0);
const segment = computed(() => stops[stop.value].segment);
/** Outside the middle segment the track rests on the method nearest the current stop. */
const step = computed(() => stops[stop.value].method ?? (segment.value === 0 ? 0 : methods.length - 1));
const reachedEnd = ref(false);
function go(i: number) {
  stop.value = Math.max(0, Math.min(stops.length - 1, i));
  if (stops[stop.value].method === methods.length - 1) reachedEnd.value = true;
}
const goSegment = (s: number) => go(stops.findIndex((x) => x.segment === s));
const goMethod = (m: number) => go(stops.findIndex((x) => x.method === m));

/**
 * Expanded, the same block fills the screen, so the place in the walk is kept. While expanded the
 * arrow keys step through the stops instead of changing slides, and Esc or a click outside closes it.
 */
const expanded = ref(false);
function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") expanded.value = false;
  else if (e.key === "ArrowRight") go(stop.value + 1);
  else if (e.key === "ArrowLeft") go(stop.value - 1);
  else return;
  e.stopPropagation();
  e.preventDefault();
}
watch(expanded, (v) => (v ? window.addEventListener("keydown", onKey, true) : window.removeEventListener("keydown", onKey, true)));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey, true));
</script>

<template>
  <section class="slide training">
    <h1>Training Jev: from RLHF to RLCD</h1>
    <p class="lead">Three reinforcement learning <u class="lead-mark">post-training</u> methods. What the reward measures decides what the model is good for.</p>

    <div v-if="expanded" class="tr-backdrop" @click="expanded = false"></div>
    <div class="tr-block" :class="{ expanded }" :role="expanded ? 'dialog' : undefined" :aria-modal="expanded || undefined" aria-label="Training Jev">
      <button type="button" class="tr-expand" :aria-label="expanded ? 'Close the expanded view' : 'Expand the training walk-through'" :title="expanded ? 'Close' : 'Expand'" @click="expanded = !expanded">
        <svg v-if="!expanded" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" /></svg>
        <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>

      <div class="tr-segments" role="tablist" aria-label="Segments">
        <button
          v-for="(sg, i) in segments"
          :key="sg.key"
          type="button"
          role="tab"
          class="tr-seg"
          :class="{ on: segment === i, done: segment > i }"
          :aria-selected="segment === i"
          @click="goSegment(i)"
        ><b>{{ i + 1 }}</b>{{ sg.label }}</button>
      </div>

      <!-- 1: what RLCD is -->
      <div v-show="segment === 0" class="tr-segment">
        <h2 class="tr-seg-title">What is Reinforcement Learning for Calibrated Decisions (RLCD)?</h2>
        <div class="tr-viewport">
          <article class="tr-panel rlcd">
            <RlcdWhatSketch />
            <div class="tr-copy">
              <p class="tr-text"><b>Reinforcement Learning for Calibrated Decisions (RLCD)</b> is a reinforcement learning <mark class="key">post-training method</mark> in which the reward is tied to whether a model's <mark class="key">stated probability matches how often its answer turns out to be correct</mark>, rather than to <mark class="key">human preference ratings or automatic verification</mark>.</p>
              <p class="tr-aside">One caution worth stating up front: RLCD is a vendor-coined method name, not an industry standard. There is no paper, no published reward function, no dataset description, and no released calibration figure.</p>
            </div>
          </article>
        </div>
      </div>

      <!-- 2: RLHF, RLVR and RLCD on one track -->
      <div v-show="segment === 1" class="tr-segment">
        <h2 class="tr-seg-title">How is RLCD different from RLHF and RLVR?</h2>
        <div class="tr-tabs" role="tablist" aria-label="Training methods">
          <button
            v-for="(m, i) in methods"
            :key="m.key"
            type="button"
            role="tab"
            class="tr-tab"
            :class="[m.key, { on: step === i }]"
            :aria-selected="step === i"
            @click="goMethod(i)"
          ><b>{{ m.name }}</b><span>{{ m.full }}</span></button>
        </div>

        <h3 class="tr-signals">Direct reward signals: <span class="rlhf">Preference</span> vs <span class="rlvr">Correctness</span> vs <span class="rlcd">Calibration</span></h3>
        <div class="tr-viewport">
          <div class="tr-track" :style="{ transform: `translateX(-${step * 100}%)` }">
            <article class="tr-panel rlhf" :aria-hidden="step !== 0">
              <RlhfSketch />
              <div class="tr-copy">
                <p class="tr-text"><b>RLHF</b> rewards responses that <mark class="key">human raters prefer</mark>, as described in the InstructGPT paper (Ouyang et al., 2022). It produces <mark class="key">generated text</mark>, and TypeSafe's own primer names <mark class="key">sycophancy and mode dropping</mark> as its side effects, arguing that "an output can be compelling to a person without being reliable enough for unattended automation."</p>
                <p class="tr-aside">Related: Claude's <a href="https://www.anthropic.com/news/claudes-constitution">Constitutional AI</a> swaps the human rater for an AI rater guided by written principles.</p>
              </div>
            </article>

            <article class="tr-panel rlvr" :aria-hidden="step !== 1">
              <RlvrSketch />
              <p class="tr-text"><b>RLVR</b> (Reinforcement Learning with Verifiable Rewards) rewards outputs a <mark class="key">program can mechanically check</mark>: the test passed, the arithmetic came out right. It underpins <mark class="key">reasoning models</mark> such as DeepSeek-R1 and Tulu 3. It works wherever <mark class="key">correctness is cheaply decidable</mark>, and it says <mark class="key">nothing about how sure</mark> the model should have been.</p>
            </article>

            <article class="tr-panel rlcd" :aria-hidden="step !== 2">
              <RlcdSketch />
              <p class="tr-text"><b>RLCD</b> abandons preference and verification alike and targets the <mark class="key">honesty of the stated probability</mark>, with a <mark class="key">typed answer and a distribution</mark> as the output rather than text. The reward signal itself is not published; TypeSafe states <mark class="key">the target, not the mechanism</mark>.</p>
            </article>
          </div>
        </div>
      </div>

      <!-- 3: why calibration makes sense -->
      <div v-show="segment === 2" class="tr-segment">
        <h2 class="tr-seg-title">Why does calibration make sense as a training objective?</h2>
        <div class="tr-viewport">
          <article class="tr-panel rlcd">
            <CalibrationWhySketch />
            <div class="tr-copy">
              <p class="tr-text">Calibration makes sense as a training objective for RLCD because of what the model actually produces. A model that returns a typed decision plus a probability is not writing for a reader. It is a <mark class="key">component inside a control flow</mark>, and its number gets compared against a threshold so the surrounding code can branch: <mark class="key">auto-approve, escalate, reject</mark>.</p>
              <p class="tr-text">Accuracy alone does not make a threshold meaningful. A classifier that is right 90% of the time but reports "99% confident" on everything gives you <mark class="key">nothing to gate on</mark>. A weaker model that says 70% and is right roughly 70% of the time is the one you can <mark class="key">build automation around</mark>.</p>
              <p class="tr-aside">So when the product is a probability rather than prose, calibration is not a refinement layered on top of accuracy. It is the thing being sold.</p>
            </div>
          </article>
        </div>
      </div>

      <div class="tr-nav">
        <button type="button" class="ghost" :disabled="stop === 0" @click="go(stop - 1)">Back</button>
        <span class="tr-count">{{ stop + 1 }} of {{ stops.length }}</span>
        <button v-if="stop < stops.length - 1" type="button" class="ghost" @click="go(stop + 1)">Next: {{ stops[stop + 1].label }}</button>
        <span v-else class="tr-count">End of the walk-through</span>
      </div>
    </div>

    <template v-if="reachedEnd">
      <h2 class="tr-h2">RLHF and RLCD side by side</h2>
      <table class="table tr-compare">
        <thead><tr><th></th><th class="rlhf">RLHF</th><th class="rlcd">RLCD</th></tr></thead>
        <tbody>
          <tr><th>Rewarded for</th><td>What human raters prefer</td><td>Probabilities that match how often it is right</td></tr>
          <tr><th>Output</th><td>Generated text</td><td>A typed decision plus a probability</td></tr>
          <tr><th>Read by</th><td>A person</td><td>Code comparing the number to a threshold</td></tr>
          <tr><th>Method published</th><td>Yes, InstructGPT (2022)</td><td>No, only the objective</td></tr>
        </tbody>
      </table>
    </template>

    <div class="tr-drops">

      <DeckDropdown title="What does RLCD not do?">
        <ul class="drop-points">
          <li><b>It does not make Jev more accurate.</b> Accuracy is how often it is right, calibration is whether its confidence tracks that. They are <mark class="key">independent</mark>, and TypeSafe does not claim RLCD improves accuracy.</li>
          <li><b>It says nothing reliable about one answer.</b> The rates "describe groups of predictions, not a guarantee about any single answer."</li>
          <li><b>It is not why the output is always valid.</b> Schema validity <mark class="key">comes from the architecture</mark>. The model can still return the wrong valid answer.</li>
          <li><b>It has no published scoring rule.</b> The open <code>eve-rlcd</code> reimplementation uses a Brier score gradient, but that is a guess, not TypeSafe's method.</li>
        </ul>
      </DeckDropdown>

      <DeckDropdown title="How is RLCD different from RLHF and RLVR?">
        <ul class="drop-points">
          <li><b class="m-rlhf">RLHF</b> rewards what <mark class="key">human raters prefer</mark> and produces text. Its side effects are sycophancy and mode dropping.</li>
          <li><b class="m-rlvr">RLVR</b> rewards what <mark class="key">a program can check</mark>, like a passing test. It says nothing about how sure the model should have been.</li>
          <li><b class="m-rlcd">RLCD</b> rewards <mark class="key">an honest stated probability</mark>, with a typed answer as the output. The target is published, the reward signal is not.</li>
          <li>TypeSafe says its cofounder Diogo Almeida co-invented RLHF, so the change of objective is a stated position, not unfamiliarity.</li>
        </ul>
      </DeckDropdown>
    </div>

    <footer class="sources">
      Sources:
      <a href="https://www.sanity.io/glossary/rlcd-reinforcement-learning-for-calibrated-decisions">RLCD glossary</a>,
      <a href="https://typesafe.ai/blog/introducing-system-one-models-and-jev">TypeSafe launch post</a>,
      <a href="https://docs.typesafe.ai/introduction/machine-learning-primer.md">AI primer</a>,
      <a href="https://arxiv.org/abs/2203.02155">InstructGPT</a>,
      <a href="https://arxiv.org/abs/2501.12948">DeepSeek-R1</a>,
      <a href="https://arxiv.org/abs/2411.15124">Tulu 3</a>
    </footer>
  </section>
</template>
