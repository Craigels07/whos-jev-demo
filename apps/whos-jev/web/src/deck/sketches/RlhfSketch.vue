<script setup lang="ts">
import { arrow, box, circle, elbow, line, path, type Shape } from "../../lib/sketch";

/**
 * RLHF as a tldraw style sketch: the model writes two responses, a person picks the one they
 * prefer, and that preference flows back as the reward. The sticky note is the side effect.
 * Drawn once with fixed seeds, colored by CSS classes so it follows the theme.
 */
const shapes: Shape[] = [
  // The model and its two responses.
  { cls: "sk-paper", strokes: box(22, 128, 124, 66, 1) },
  { cls: "sk-ink", strokes: arrow([[146, 148], [172, 120], [196, 82]], 2) },
  { cls: "sk-ink", strokes: arrow([[146, 176], [172, 204], [196, 236]], 3) },
  { cls: "sk-pick", strokes: box(200, 48, 176, 60, 4) },
  { cls: "sk-paper", strokes: box(200, 210, 176, 60, 5) },

  // Both responses go to the rater.
  { cls: "sk-ink", strokes: arrow([[380, 82], [410, 100], [432, 128]], 6) },
  { cls: "sk-ink", strokes: arrow([[380, 238], [410, 222], [432, 196]], 7) },

  // A stick figure rater.
  { cls: "sk-ink", strokes: circle(470, 118, 36, 8) },
  { cls: "sk-ink", strokes: line(470, 136, 470, 196, 9) },
  { cls: "sk-ink", strokes: line(470, 154, 444, 178, 10) },
  { cls: "sk-ink", strokes: line(470, 154, 500, 138, 11) },
  { cls: "sk-ink", strokes: line(470, 196, 452, 236, 12) },
  { cls: "sk-ink", strokes: line(470, 196, 490, 236, 13) },

  // A tick for A, a cross for B.
  { cls: "sk-ok", strokes: path("M392 54 L402 66 L420 40", 14) },
  { cls: "sk-bad", strokes: line(394, 254, 414, 274, 15) },
  { cls: "sk-bad", strokes: line(414, 254, 394, 274, 16) },

  // The preference flows back to the model as the reward.
  { cls: "sk-reward", strokes: elbow([[470, 250], [470, 296], [84, 296], [84, 200]], 17) },
];

/** The side effect, on a sticky note, tilted like one stuck on by hand. */
const note = box(500, 24, 132, 88, 18);
</script>

<template>
  <svg class="sk" viewBox="0 0 640 330" role="img" aria-label="RLHF: the model writes two responses, a person picks the one they prefer, and that preference is the reward">
    <defs>
      <pattern id="sk-dots-rlhf" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" class="sk-dot" /></pattern>
    </defs>
    <rect width="640" height="330" class="sk-canvas" />
    <rect width="640" height="330" fill="url(#sk-dots-rlhf)" />

    <g v-for="(s, i) in shapes" :key="i" :class="s.cls">
      <path v-for="(p, j) in s.strokes" :key="j" :d="p.d" :class="p.fill ? 'f' : 's'" />
    </g>

    <text x="84" y="168" text-anchor="middle">Model</text>
    <text x="288" y="85" text-anchor="middle">Response A</text>
    <text x="288" y="247" text-anchor="middle">Response B</text>
    <text x="470" y="262" text-anchor="middle" class="sk-small">rater</text>
    <text x="276" y="322" text-anchor="middle" class="sk-label">reward = what the rater preferred</text>
    <g transform="rotate(4 566 68)">
      <g class="sk-note"><path v-for="(p, j) in note" :key="j" :d="p.d" :class="p.fill ? 'f' : 's'" /></g>
      <text x="566" y="62" text-anchor="middle" class="sk-note-text">sounds right</text>
      <text x="566" y="88" text-anchor="middle" class="sk-note-text">≠ is right</text>
    </g>
  </svg>
</template>
