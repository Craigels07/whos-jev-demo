<script setup lang="ts">
import { computed } from "vue";
import { EXAMPLES } from "../lib/examples";

const props = defineProps<{ slug: string }>();
const current = computed(() => EXAMPLES.findIndex((e) => e.slug === props.slug));
</script>

<template>
  <div class="progress" aria-label="Example progress">
    <RouterLink
      v-for="(E, i) in EXAMPLES"
      :key="E.slug"
      :to="`/example/${E.slug}`"
      class="seg"
      :class="{ done: i < current, current: i === current }"
      :title="E.title"
    ></RouterLink>
  </div>
</template>
