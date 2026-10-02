<script setup lang="ts">
import ModelStackSketch from "./sketches/ModelStackSketch.vue";
</script>

<template>
  <section class="slide">
    <h1>For next time: Jev, Laya, Tev1 and Nimble</h1>
    <p class="lead">Four decision models with the same three answer types. They differ in the base model and in how it was post-trained.</p>

    <ModelStackSketch />

    <table class="table compare stack-table">
      <thead>
        <tr><th></th><th>Jev</th><th>Laya</th><th>Tev1</th><th>Nimble</th></tr>
      </thead>
      <tbody>
        <tr>
          <th>Outputs</th>
          <td>Noul, choice, score with probabilities</td>
          <td>Noul, choice, score</td>
          <td>Noul, choice, score with probabilities</td>
          <td>Noul, choice, score with probabilities</td>
        </tr>
        <tr>
          <th>Sizes</th>
          <td>Not disclosed</td>
          <td>322M and 421M</td>
          <td>4B and 0.8B</td>
          <td>9B</td>
        </tr>
        <tr>
          <th>Run it</th>
          <td>Hosted API</td>
          <td>Self-host the weights</td>
          <td><code>ollama run tev1</code></td>
          <td><code>ollama run nimble</code></td>
        </tr>
      </tbody>
    </table>
    <p class="note">Three open alternatives to look at in a later session. Laya says it uses RLCD style training. Tev1 and Nimble are fine-tunes of Qwen3.5.</p>
    <footer class="sources">
      Sources:
      <a href="https://typesafe.ai/blog/introducing-system-one-models-and-jev">Jev launch post</a>,
      <a href="https://github.com/NandhaKishorM/laya">Laya README</a>,
      <a href="https://ollama.com/library/tev1">Tev1 on Ollama</a>,
      <a href="https://ollama.com/library/nimble">Nimble on Ollama</a>
    </footer>
  </section>
</template>
