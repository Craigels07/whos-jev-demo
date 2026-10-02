<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { slides } from "../deck/slides";
import { imageUrl, loadNotes, parseNotes, readDraft, saveNotes, settleDraft, uploadImage, writeDraft } from "../deck/notes";
import { enter, indent, insertLine, setLine, toggleMark, type Edit } from "../deck/notes-edit";
import NotesText from "../deck/NotesText.vue";
import { followSlide } from "../deck/sync";

/** The presenter's own window, opened with N from the deck. Share the deck tab, never this window. */
const route = useRoute();
const router = useRouter();

const index = computed(() => Math.max(0, slides.findIndex((s) => s.id === route.params.slide)));
const current = computed(() => slides[index.value]);
const next = computed(() => slides[index.value + 1]);

const text = ref("");
// "offline" means the server could not be read and there is no draft: editing stays off so nothing is overwritten.
const state = ref<"loading" | "ready" | "offline">("loading");
const editing = ref(false);
const status = ref("");
const blocks = computed(() => parseNotes(text.value));
const area = ref<HTMLTextAreaElement>();
const picker = ref<HTMLInputElement>();

// Typing saves after a short pause. Leaving the slide or closing the window saves at once.
let timer: ReturnType<typeof setTimeout> | undefined;
let pendingId = "";

async function save(id: string, value: string) {
  status.value = "Saving";
  try {
    await saveNotes(id, value);
    settleDraft(id, value);
    if (id === current.value.id) status.value = "Saved";
  } catch {
    if (id === current.value.id) status.value = "Not saved, kept in this browser";
  }
}

function queueSave() {
  pendingId = current.value.id;
  writeDraft(pendingId, text.value);
  clearTimeout(timer);
  timer = setTimeout(flush, 600);
}

function flush() {
  if (!timer) return;
  clearTimeout(timer);
  timer = undefined;
  save(pendingId, text.value);
}

watch(
  () => current.value.id,
  async (id) => {
    flush();
    editing.value = false;
    state.value = "loading";
    status.value = "";
    const saved = await loadNotes(id).catch(() => null);
    if (id !== current.value.id) return;
    const draft = readDraft(id);
    if (draft !== null && draft !== saved) {
      text.value = draft;
      state.value = "ready";
      status.value = "Unsaved draft restored";
      if (saved !== null) save(id, draft);
    } else if (saved === null) {
      text.value = "";
      state.value = "offline";
    } else {
      text.value = saved;
      state.value = "ready";
      settleDraft(id, saved);
    }
  },
  { immediate: true },
);

async function edit() {
  if (state.value !== "ready") return;
  editing.value = true;
  await nextTick();
  area.value?.focus();
}

function done() {
  flush();
  editing.value = false;
}

function onType(e: Event) {
  text.value = (e.target as HTMLTextAreaElement).value;
  queueSave();
}

function selection(): Edit {
  const el = area.value!;
  return { text: text.value, from: el.selectionStart, to: el.selectionEnd };
}

function apply(e: Edit) {
  text.value = e.text;
  queueSave();
  nextTick(() => {
    area.value?.focus();
    area.value?.setSelectionRange(e.from, e.to);
  });
}

async function addImage(file: File | undefined) {
  if (!file?.type.startsWith("image/")) return;
  const id = current.value.id;
  status.value = "Uploading image";
  try {
    const name = await uploadImage(id, file);
    if (id !== current.value.id || !editing.value) return;
    apply(insertLine(selection(), `![](${name})`));
  } catch {
    status.value = "Image upload failed (PNG, JPG, GIF or WebP, up to 20 MB)";
  }
}

function onPaste(e: ClipboardEvent) {
  const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
  if (!file) return;
  e.preventDefault();
  addImage(file);
}

function onDrop(e: DragEvent) {
  const file = [...(e.dataTransfer?.files ?? [])].find((f) => f.type.startsWith("image/"));
  if (!file) return;
  e.preventDefault();
  addImage(file);
}

function onPick() {
  addImage(picker.value?.files?.[0]);
  if (picker.value) picker.value.value = "";
}

function onAreaKey(e: KeyboardEvent) {
  const mod = (e.ctrlKey || e.metaKey) && !e.altKey;
  if (e.key === "Escape" || (mod && (e.key === "s" || e.key === "Enter"))) {
    e.preventDefault();
    done();
  } else if (mod && !e.shiftKey && (e.key === "b" || e.key === "u")) {
    e.preventDefault();
    apply(toggleMark(selection(), e.key === "b" ? "**" : "__"));
  } else if (e.key === "Tab" && !mod) {
    e.preventDefault();
    apply(indent(selection(), e.shiftKey ? -1 : 1));
  } else if (e.key === "Enter" && !mod && !e.shiftKey) {
    const result = enter(selection());
    if (!result) return;
    e.preventDefault();
    apply(result);
  }
}

const step = followSlide((id) => router.replace(`/jev-notes/${id}`));

function onKey(e: KeyboardEvent) {
  if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.target instanceof HTMLTextAreaElement) return;
  if (e.key === "ArrowRight") step(1);
  if (e.key === "ArrowLeft") step(-1);
}

onMounted(() => {
  window.addEventListener("keydown", onKey);
  window.addEventListener("pagehide", flush);
});
onBeforeUnmount(() => {
  flush();
  window.removeEventListener("keydown", onKey);
  window.removeEventListener("pagehide", flush);
});
</script>

<template>
  <div class="notes">
    <div class="notes-head">
      <p class="notes-count">{{ index + 1 }} / {{ slides.length }}</p>
      <span class="notes-status">{{ status }}</span>
      <button v-if="editing" class="run small" type="button" @click="done">Done</button>
      <button v-else class="ghost small" type="button" :disabled="state !== 'ready'" @click="edit">Edit</button>
    </div>
    <h1>{{ current.title }}</h1>

    <template v-if="editing">
      <div class="notes-tools">
        <button class="ghost small" type="button" @mousedown.prevent @click="apply(setLine(selection(), 'section'))">Section</button>
        <button class="ghost small" type="button" @mousedown.prevent @click="apply(setLine(selection(), 'bullet'))">Bullet</button>
        <button class="ghost small" type="button" title="Tab" @mousedown.prevent @click="apply(indent(selection(), 1))">Indent</button>
        <button class="ghost small" type="button" title="Shift+Tab" @mousedown.prevent @click="apply(indent(selection(), -1))">Outdent</button>
        <button class="ghost small" type="button" title="Ctrl+B" @mousedown.prevent @click="apply(toggleMark(selection(), '**'))"><b>Bold</b></button>
        <button class="ghost small" type="button" title="Ctrl+U" @mousedown.prevent @click="apply(toggleMark(selection(), '__'))"><u>Underline</u></button>
        <button class="ghost small" type="button" @mousedown.prevent @click="picker?.click()">Image</button>
        <input ref="picker" type="file" accept="image/png,image/jpeg,image/gif,image/webp" hidden @change="onPick" />
      </div>
      <p class="notes-hint">## section, - bullet, Tab nests it, **bold**, __underline__. Paste or drop an image. Esc when done.</p>
      <textarea
        ref="area"
        :value="text"
        class="notes-area"
        spellcheck="true"
        @input="onType"
        @keydown="onAreaKey"
        @paste="onPaste"
        @drop="onDrop"
      ></textarea>
    </template>
    <div v-else-if="blocks.length" class="notes-body" @dblclick="edit">
      <template v-for="(b, i) in blocks" :key="i">
        <h2 v-if="b.kind === 'section'"><NotesText :text="b.text" /></h2>
        <ul v-else-if="b.kind === 'bullets'">
          <li v-for="(item, j) in b.items" :key="j" :class="`level-${Math.min(item.level, 3)}`"><NotesText :text="item.text" /></li>
        </ul>
        <img v-else-if="b.kind === 'image'" class="notes-img" :src="imageUrl(b.src)" :alt="b.alt" />
        <p v-else><NotesText :text="b.text" /></p>
      </template>
    </div>
    <p v-else-if="state === 'offline'" class="notes-error">
      Can't reach the notes server, so editing is off to keep your saved notes safe. Run <code>just web</code> again, then
      reopen this window.
    </p>
    <p v-else-if="state === 'ready'" class="notes-empty">No notes for this slide. Press Edit to add some.</p>

    <p class="notes-next">{{ next ? `Next: ${next.title}` : "Last slide" }}</p>
  </div>
</template>
