<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";

/**
 * Disclaimer opens TypeSafe's launch video from 2:27 to its end (the clip is cut there) in a modal, with sound.
 * It stops on the last frame. Esc or a click outside closes it, and the arrow keys stay here while it is open.
 */
const open = ref(false);
const clip = ref<HTMLVideoElement>();

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") open.value = false;
  if (["Escape", "ArrowLeft", "ArrowRight"].includes(e.key)) e.stopPropagation();
}
watch(open, async (v) => {
  if (!v) return window.removeEventListener("keydown", onKey, true);
  window.addEventListener("keydown", onKey, true);
  await nextTick();
  clip.value?.play();
});
onBeforeUnmount(() => window.removeEventListener("keydown", onKey, true));
</script>

<template>
  <section class="slide">
    <h1 class="accent-title">What makes Jev different?</h1>
    <div class="stats">
      <div class="stat"><b>$0.042</b><span>per million input tokens, output free</span></div>
      <div class="stat"><b>≤ 500 ms</b><span>per request, from 70 ms</span></div>
      <div class="stat"><b>444.6x</b><span>cheaper in TypeSafe evals</span></div>
    </div>
    <ul class="points">
      <li>TypeSafe AI released Jev on 15 September 2026.</li>
      <li>It is not a traditional LLM. TypeSafe calls it a System One model: it returns choices, scores and probabilities, never free-form text.</li>
      <li>In TypeSafe's workflow evals, Jev was 193.6x faster and 444.6x cheaper than GPT-6 Astra and Fable 5.1, which TypeSafe calls the higher end of real world gains.</li>
    </ul>
    <div class="who-media">
      <img
        class="who-img"
        src="/deck/my-name-is-jev.png"
        alt="The My name is Jeff scene from 22 Jump Street, captioned My Name Is JEV for the TypeSafe AI character and Frontier Models for the other, surrounded by the names gemini, gpt, claude, grok and qwen"
      />
      <button type="button" class="who-disclaimer" @click="open = true">Disclaimer</button>
    </div>
    <footer class="sources">
      Sources:
      <a href="https://typesafe.ai/blog/introducing-system-one-models-and-jev">Introducing System One models and Jev</a>,
      <a href="https://docs.typesafe.ai/models.md">Models and pricing</a>,
      <a href="https://www.sanity.io/glossary/rlcd-reinforcement-learning-for-calibrated-decisions">RLCD glossary</a>,
      <a href="https://x.com/CompleteSkeptic/status/2099925682726002904">Jev launch video</a>
    </footer>

    <Teleport to="body">
      <div v-if="open" class="modal-backdrop" @click.self="open = false">
        <div class="modal clip" role="dialog" aria-modal="true" aria-labelledby="clip-title">
          <div class="modal-head">
            <h2 id="clip-title">Disclaimer</h2>
            <span class="spacer"></span>
            <button class="ghost" @click="open = false">Close</button>
          </div>
          <video ref="clip" class="clip-video" src="/deck/jev-disclaimer.mp4" controls playsinline preload="auto"></video>
        </div>
      </div>
    </Teleport>
  </section>
</template>
