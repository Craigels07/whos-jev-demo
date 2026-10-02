<script setup lang="ts">
import { reactive, useId, watch } from "vue";

/**
 * One field per top-level key of the input object. Strings edit as text,
 * anything else edits as JSON. Emits the parsed object on every keystroke that parses.
 * `info` puts an (i) by a field; clicking it shows that field's one sentence note.
 */
const props = defineProps<{ modelValue: Record<string, unknown>; info?: Record<string, string> }>();
const emit = defineEmits<{ "update:modelValue": [value: Record<string, unknown>] }>();

const text = reactive<Record<string, string>>({});
const errors = reactive<Record<string, string>>({});
const openInfo = reactive<Record<string, boolean>>({});
const uid = useId();

/** Sync fields from the model without reformatting text that already parses to the same value. */
function load(input: Record<string, unknown>) {
  for (const k of Object.keys(text)) if (!(k in input)) { delete text[k]; delete errors[k]; }
  for (const [k, v] of Object.entries(input)) {
    if (typeof v === "string") {
      if (text[k] !== v) text[k] = v;
      continue;
    }
    let same = false;
    try { same = JSON.stringify(JSON.parse(text[k] ?? "")) === JSON.stringify(v); } catch { same = false; }
    if (!same) text[k] = JSON.stringify(v, null, 2);
  }
}
watch(() => props.modelValue, load, { immediate: true });

function onInput(key: string, isString: boolean) {
  const next = { ...props.modelValue };
  if (isString) {
    next[key] = text[key];
    delete errors[key];
  } else {
    try {
      next[key] = JSON.parse(text[key]);
      delete errors[key];
    } catch (e) {
      errors[key] = (e as Error).message;
      return;
    }
  }
  emit("update:modelValue", next);
}

function grow(e: Event) {
  const t = e.target as HTMLTextAreaElement;
  t.style.height = "auto";
  t.style.height = t.scrollHeight + 2 + "px";
}
</script>

<template>
  <div class="fields">
    <div v-for="(v, key) in modelValue" :key="key" class="field">
      <span class="field-name mono"><label :for="`field-${uid}-${key}`">{{ key }}</label><button
          v-if="info?.[key]"
          type="button"
          class="info-btn"
          :aria-expanded="!!openInfo[key]"
          :aria-label="`About this ${key}`"
          :title="info[key]"
          @click="openInfo[key] = !openInfo[key]"
        >i</button></span>
      <span v-if="info?.[key] && openInfo[key]" class="field-info">{{ info[key] }}</span>
      <textarea
        :id="`field-${uid}-${key}`"
        v-model="text[key]"
        class="mono"
        :class="{ bad: errors[key] }"
        rows="2"
        spellcheck="false"
        @input="onInput(String(key), typeof v === 'string'); grow($event)"
        @focus="grow($event)"
      ></textarea>
      <span v-if="errors[key]" class="field-error">{{ errors[key] }}</span>
    </div>
  </div>
</template>
