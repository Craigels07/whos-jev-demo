<script setup lang="ts">
import { computed } from "vue";
import { parseInline } from "./notes";

/** One line of presenter notes with its **bold** and __underline__ marks applied. */
const props = defineProps<{ text: string }>();
const spans = computed(() => parseInline(props.text));
</script>

<template>
  <span v-for="(s, i) in spans" :key="i" :class="{ 'notes-b': s.bold, 'notes-u': s.underline }">{{ s.text }}</span>
</template>
