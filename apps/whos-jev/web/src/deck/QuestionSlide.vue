<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from "vue";

/** The first point opens the anatomy of a question. Esc or a click outside closes it. */
const open = ref(false);
/** The batching points stay hidden until the presenter opens them, so the room does not read ahead. */
const statsOpen = ref(false);

/** While the modal is open, Esc closes it and the arrow keys stay here instead of changing slides. */
function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") open.value = false;
  if (["Escape", "ArrowLeft", "ArrowRight"].includes(e.key)) e.stopPropagation();
}
watch(open, (v) => (v ? window.addEventListener("keydown", onKey, true) : window.removeEventListener("keydown", onKey, true)));
onBeforeUnmount(() => window.removeEventListener("keydown", onKey, true));
</script>

<template>
  <section class="slide">
    <h1>Define a question</h1>
    <p class="lead">Questions define the judgement the model should make about the material.</p>
    <ul class="points">
      <li>
        <button type="button" class="point-link" :aria-expanded="open" @click="open = true">
          A question has an ID, a <code>type</code> (<code>choice</code>, <code>score</code> or <code>noul</code>), <code>instructions</code> and criteria.
          <span class="point-more">The four parts</span>
        </button>
      </li>
      <li>
        <button type="button" class="point-link" :aria-expanded="statsOpen" aria-controls="question-stats" @click="statsOpen = !statsOpen">
          Asking more than one question
          <span class="point-more drop" :class="{ open: statsOpen }">{{ statsOpen ? "Hide" : "Show" }}</span>
        </button>
        <ul v-if="statsOpen" id="question-stats" class="sub-points">
          <li>Batching 13 questions together into one call is <mark class="key">11.5x cheaper</mark> and <mark class="key">9.6x faster</mark> than 13 separate calls, with <mark class="key">no additional charge</mark> in the answer.</li>
          <li>Adding questions barely changes the response time, because they <mark class="key">run in parallel</mark>.</li>
          <li>One answer <mark class="key">does not become context</mark> for another question. If a later judgement depends on an earlier answer, make a <mark class="key">2nd request</mark>.</li>
        </ul>
      </li>
    </ul>
    <p class="example-label">Example request (Noul)</p>
    <pre class="example request-example">{
  "model": "jev-latest",
  "state": <span class="part state">{
    "message": "Please refund my duplicate charge."
  }</span>,
  "questions": {
    <span class="part id">"refund_requested"</span>: {
      "type": <span class="part type">"noul"</span>,
      "instructions": <span class="part ins">"Does the customer request a refund?"</span>
    }
  }
}</pre>
    <footer class="sources">
      Sources:
      <a href="https://docs.typesafe.ai/primitives.md">Primitives</a>,
      <a href="https://docs.typesafe.ai/cookbooks/parallel_questions.md">Parallel questions</a>,
      <a href="https://docs.typesafe.ai/patterns/fan-out.md">Fan-out</a>
    </footer>

    <Teleport to="body">
      <div v-if="open" class="modal-backdrop" @click.self="open = false">
        <div class="modal anatomy" role="dialog" aria-modal="true" aria-labelledby="anatomy-title">
          <div class="modal-head">
            <h2 id="anatomy-title">The four parts of a question</h2>
            <span class="spacer"></span>
            <button class="ghost" @click="open = false">Close</button>
          </div>

          <div class="anatomy-body">
            <pre class="anatomy-code" aria-label="An example question, each part in its color"><span class="part id">"refund_reason"</span>: {
  "type": <span class="part type">"choice"</span>,
  "instructions": <span class="part ins">"Why do they want a refund?"</span>,
  "criteria": <span class="part crit">{
    "duplicate": "Charged twice",
    "unhappy": "Not satisfied",
    "other": null
  }</span>
}</pre>

            <div class="anatomy-cards">
              <div class="part-card id">
                <b>ID</b>
                <span>The key you pick, such as <code>refund_reason</code>. It identifies the answer in the response.</span>
              </div>
              <div class="part-card type">
                <b>Type</b>
                <div class="type-pills">
                  <span><code>choice</code> Which option?</span>
                  <span><code>score</code> Which level?</span>
                  <span><code>noul</code> Is it true?</span>
                </div>
              </div>
              <div class="part-card ins">
                <b>Instructions</b>
                <span>The question you are asking about the state, where the evaluation logic goes. A string, object or array.</span>
              </div>
              <div class="part-card crit">
                <b>Criteria</b>
                <span>The possible answers: a map of options for a choice, an ordered list of levels for a score, or an optional description for a noul.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>
