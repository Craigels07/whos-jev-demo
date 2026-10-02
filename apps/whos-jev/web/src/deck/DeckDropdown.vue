<script setup lang="ts">
import { ref } from "vue";

/** A titled section the presenter opens when ready, so the room does not read ahead. Collapsed on load. */
defineProps<{ title: string }>();
const open = ref(false);
</script>

<template>
  <div class="deck-drop">
    <button type="button" class="point-link" :aria-expanded="open" @click="open = !open">
      {{ title }}
      <span class="point-more drop" :class="{ open }">{{ open ? "Hide" : "Show" }}</span>
    </button>
    <div v-if="open" class="deck-drop-body"><slot /></div>
  </div>
</template>
