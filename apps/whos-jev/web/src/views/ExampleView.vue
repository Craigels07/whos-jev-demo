<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { fetchExample, type ExamplePayload } from "../lib/api";
import { EXAMPLES, USE_CASES, USE_LABEL, WHERE_LABEL, splitUse } from "../lib/examples";
import { reveal } from "../lib/store";
import { heroSrc } from "../lib/theme";
import ExampleProgress from "../components/ExampleProgress.vue";
import UseCaseCards from "../components/UseCaseCards.vue";
import LiveExample from "../components/LiveExample.vue";

const props = defineProps<{ slug: string }>();

const index = computed(() => EXAMPLES.findIndex((e) => e.slug === props.slug));
const meta = computed(() => EXAMPLES[index.value]);
const cases = computed(() => USE_CASES[props.slug] ?? []);
const payload = ref<ExamplePayload | null>(null);
const selected = ref("A");
const option = computed(() => payload.value?.options.find((o) => o.key === selected.value) ?? null);
const prev = computed(() => EXAMPLES[index.value - 1]);

watch(
  () => props.slug,
  async (slug) => {
    reveal(slug);
    selected.value = "A";
    payload.value = null;
    payload.value = await fetchExample(slug);
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="meta" class="wrap">
    <div class="pagehead">
      <div class="lvl">{{ WHERE_LABEL[meta.where] }}</div>
      <ExampleProgress :slug="slug" />
      <h1>{{ meta.title }}</h1>
      <div class="sub">{{ splitUse(meta.sub)[0] }}<span class="use-label">{{ USE_LABEL }}</span>{{ splitUse(meta.sub)[1] }}</div>
    </div>
    <div class="hero"><img :src="heroSrc(slug)" :alt="meta.title" /></div>

    <template v-if="cases.length > 1">
      <div class="section-head"><h2>Use Cases</h2><span class="meta">Pick one to load it below</span></div>
      <UseCaseCards :cases="cases" :selected="selected" @select="selected = $event" />
    </template>

    <LiveExample v-if="option" :slug="slug" :title="meta.title" :option="option" :multi="cases.length > 1" :agent="payload?.agent" />
    <div v-else class="meta">Loading the example ...</div>

    <div class="pagenav example-wrap">
      <RouterLink v-if="prev" :to="`/example/${prev.slug}`">Previous: {{ prev.title }}</RouterLink>
      <span v-else class="off">Previous</span>
      <RouterLink to="/">Next Example</RouterLink>
    </div>
  </div>
  <div v-else class="wrap"><p class="meta">No such example. <RouterLink to="/">Back to the examples</RouterLink></p></div>
</template>
