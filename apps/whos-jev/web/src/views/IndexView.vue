<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { EXAMPLES, WHERE_LABEL } from "../lib/examples";
import { revealed, setIndexScroll } from "../lib/store";
import { heroSrc } from "../lib/theme";

/** Each card is 7% larger than the one to its left, so the line reads as a ramp. */
const scale = (i: number) => String(1.07 ** i);

function save() {
  setIndexScroll(window.scrollX);
}

onMounted(() => window.addEventListener("scroll", save, { passive: true }));
onBeforeUnmount(() => {
  save();
  window.removeEventListener("scroll", save);
});
</script>

<template>
  <div class="index-wrap">
    <section class="index-intro">
      <h1>Every agent decision is another model call</h1>
      <p>An agent works in a loop. A model picks the next step, a tool runs it, a model checks the result, and the loop repeats until the task is done.</p>
      <p>Tool calling and structured outputs made models easier to plug into software that expects structured data and predictable interfaces. They did not make the loop cheaper. Each decision still waits on a full model call.</p>
      <p>Jev, released by TypeSafe AI on 15 September 2026, makes those decisions in milliseconds for a fraction of a cent. The examples below show where it fits, first in your code, then inside the pi agent.</p>
    </section>
    <div class="example-line">
      <RouterLink class="card intro-card" to="/jev">
        <div class="body">
          <div class="lvl">Start here</div>
          <h2>What is Jev</h2>
          <p>A short introduction before the examples.</p>
        </div>
      </RouterLink>
      <RouterLink v-for="(E, i) in EXAMPLES" :key="E.slug" class="card" :style="{ '--s': scale(i) }" :to="`/example/${E.slug}`">
        <div class="hero-box">
          <img v-if="revealed.includes(E.slug)" :src="heroSrc(E.slug)" :alt="E.title" />
          <span v-else class="qq">???</span>
        </div>
        <div class="body">
          <div class="lvl">{{ WHERE_LABEL[E.where] }}</div>
          <h2 v-if="revealed.includes(E.slug)">{{ E.title }}</h2>
        </div>
      </RouterLink>
    </div>
  </div>
</template>
