<script setup lang="ts">
import { arrow, box, circle, elbow, line, path, type Shape } from "../../lib/sketch";

/**
 * RLVR as a tldraw style sketch, laid out like the RLHF one so the two compare at a glance: the
 * model makes two attempts, a program checks them, and passing the check flows back as the reward.
 * The sticky note is the limit. Drawn once with fixed seeds, colored by CSS classes.
 */
const shapes: Shape[] = [
  // The model and its two attempts.
  { cls: "sk-paper", strokes: box(22, 128, 124, 66, 21) },
  { cls: "sk-ink", strokes: arrow([[146, 148], [172, 120], [196, 82]], 22) },
  { cls: "sk-ink", strokes: arrow([[146, 176], [172, 204], [196, 236]], 23) },
  { cls: "sk-pick", strokes: box(200, 48, 176, 60, 24) },
  { cls: "sk-paper", strokes: box(200, 210, 176, 60, 25) },

  // Both attempts go to the program.
  { cls: "sk-ink", strokes: arrow([[380, 80], [404, 104], [418, 146]], 26) },
  { cls: "sk-ink", strokes: arrow([[380, 240], [400, 234], [418, 222]], 27) },

  // The program: a terminal window running the tests.
  { cls: "sk-paper", strokes: box(422, 126, 160, 130, 28) },
  { cls: "sk-ink", strokes: line(424, 154, 580, 154, 29) },
  { cls: "sk-ink", strokes: circle(440, 140, 9, 30, true) },
  { cls: "sk-ink", strokes: circle(456, 140, 9, 31, true) },
  { cls: "sk-ink", strokes: circle(472, 140, 9, 32, true) },

  // A tick for the attempt that passes, a cross for the one that fails.
  { cls: "sk-ok", strokes: path("M392 54 L402 66 L420 40", 33) },
  { cls: "sk-bad", strokes: line(394, 254, 414, 274, 34) },
  { cls: "sk-bad", strokes: line(414, 254, 394, 274, 35) },

  // Passing the check flows back to the model as the reward.
  { cls: "sk-reward", strokes: elbow([[502, 258], [502, 296], [84, 296], [84, 200]], 36) },
];

/** The limit, on a sticky note, tilted like one stuck on by hand. */
const note = box(486, 14, 140, 88, 37);
</script>

<template>
  <svg class="sk" viewBox="0 0 640 330" role="img" aria-label="RLVR: the model makes two attempts, a program checks them, and passing the check is the reward">
    <defs>
      <pattern id="sk-dots-rlvr" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" class="sk-dot" /></pattern>
    </defs>
    <rect width="640" height="330" class="sk-canvas" />
    <rect width="640" height="330" fill="url(#sk-dots-rlvr)" />

    <g v-for="(s, i) in shapes" :key="i" :class="s.cls">
      <path v-for="(p, j) in s.strokes" :key="j" :d="p.d" :class="p.fill ? 'f' : 's'" />
    </g>

    <text x="84" y="168" text-anchor="middle">Model</text>
    <text x="288" y="85" text-anchor="middle">answer: 42</text>
    <text x="288" y="247" text-anchor="middle">answer: 41</text>
    <text x="436" y="186" class="sk-small">run tests</text>
    <text x="436" y="214" class="sk-pass">42 pass</text>
    <text x="436" y="240" class="sk-fail">41 fail</text>
    <text x="300" y="322" text-anchor="middle" class="sk-label">reward = the check passed</text>
    <g transform="rotate(-3 556 58)">
      <g class="sk-note"><path v-for="(p, j) in note" :key="j" :d="p.d" :class="p.fill ? 'f' : 's'" /></g>
      <text x="556" y="52" text-anchor="middle" class="sk-note-text">right, but</text>
      <text x="556" y="78" text-anchor="middle" class="sk-note-text">how sure?</text>
    </g>
  </svg>
</template>
