<script setup lang="ts">
import ConfidenceExplorer from "./ConfidenceExplorer.vue";
</script>

<template>
  <section class="slide">
    <h1>Confidence and probability</h1>
    <ConfidenceExplorer />
    <h2 class="cx-h2">Key points</h2>
    <ul class="points">
      <li>Probability is the model's probability for each answer. Confidence summarizes certainty and is a separate value.</li>
      <li>Calibrated means outcomes given 0.8 happen about 80% of the time, across a group of predictions. It is not a guarantee about one answer.</li>
      <li>Confidence can decide whether software acts automatically or escalates.</li>
      <li><code>choice</code> is already the option with the highest probability. Use <code>confidence</code> to decide whether to act on it: thresholds scale with risk.</li>
    </ul>
    <footer class="sources">
      Sources:
      <a href="https://docs.typesafe.ai/confidence.md">Confidence</a>,
      <a href="https://docs.typesafe.ai/primitives.md">Primitives</a>,
      <a href="https://docs.typesafe.ai/primitives/choice.md">Choice</a>,
      <a href="https://docs.typesafe.ai/introduction/machine-learning-primer.md">AI primer</a>
    </footer>
  </section>
</template>
