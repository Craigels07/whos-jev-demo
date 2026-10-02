<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { slides } from "../deck/slides";
import { shareSlide } from "../deck/sync";

const route = useRoute();
const router = useRouter();

const index = computed(() => Math.max(0, slides.findIndex((s) => s.id === route.params.slide)));
const current = computed(() => slides[index.value]);
const isFirst = computed(() => index.value === 0);
const isLast = computed(() => index.value === slides.length - 1);
const percent = computed(() => ((index.value + 1) / slides.length) * 100);

function go(i: number) {
  if (i < 0 || i >= slides.length) return;
  router.push(`/jev/${slides[i].id}`);
}

shareSlide(computed(() => current.value.id), (by) => go(index.value + by));

/** Opens the presenter notes in their own popup window, or brings the open one back to this slide. */
function openNotes() {
  window.open(`/jev-notes/${current.value.id}`, "whosjev-notes", "popup,width=560,height=720");
}

function onKey(e: KeyboardEvent) {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
  if (e.key === "ArrowRight") go(index.value + 1);
  if (e.key === "ArrowLeft") go(index.value - 1);
  if (e.key === "n") openNotes();
}

onMounted(() => window.addEventListener("keydown", onKey));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <div class="deck">
    <div class="deck-bar"><div class="deck-bar-fill" :style="{ width: `${percent}%` }"></div></div>
    <main class="deck-stage">
      <component :is="current.component" :key="current.id" />
    </main>
    <div class="deck-nav">
      <button class="ghost" :disabled="isFirst" @click="go(index - 1)">Previous</button>
      <span class="deck-count">{{ index + 1 }} / {{ slides.length }}</span>
      <button v-if="isLast" class="run" @click="router.push('/')">Start the examples</button>
      <button v-else class="run" @click="go(index + 1)">Next</button>
    </div>
  </div>
</template>
