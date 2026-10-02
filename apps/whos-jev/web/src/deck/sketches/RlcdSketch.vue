<script setup lang="ts">
import { arrow, box, circle, elbow, line, path, type Shape } from "../../lib/sketch";

/**
 * RLCD as a tldraw style sketch, laid out like the RLHF and RLVR ones: Jev returns a decision with
 * a probability, many such decisions play out, and the reward is whether the stated number matched
 * how often they were right. The sticky note is the boundary. Drawn once with fixed seeds.
 */
const OUTCOMES = 10;
const RIGHT = 8;
const dot = (i: number) => ({ cx: 438 + (i % 5) * 30, cy: i < 5 ? 146 : 180 });

const shapes: Shape[] = [
  // Jev and a stack of decisions, each with its probability.
  { cls: "sk-paper", strokes: box(22, 128, 124, 66, 41) },
  { cls: "sk-ink", strokes: arrow([[146, 161], [170, 163], [194, 164]], 42) },
  { cls: "sk-paper", strokes: box(212, 116, 168, 76, 43) },
  { cls: "sk-paper", strokes: box(206, 122, 168, 76, 44) },
  { cls: "sk-pick", strokes: box(200, 128, 168, 76, 45) },

  // The decisions play out.
  { cls: "sk-ink", strokes: arrow([[384, 166], [400, 164], [414, 163]], 46) },
  ...Array.from({ length: OUTCOMES }, (_, i) => {
    const { cx, cy } = dot(i);
    return i < RIGHT
      ? { cls: "sk-hit", strokes: circle(cx, cy, 22, 47 + i, true) }
      : { cls: "sk-miss", strokes: [...circle(cx, cy, 22, 47 + i), ...line(cx - 6, cy - 6, cx + 6, cy + 6, 60 + i), ...line(cx + 6, cy - 6, cx - 6, cy + 6, 70 + i)] };
  }),

  // Said 0.80, right 8 of 10: a match.
  { cls: "sk-ok", strokes: path("M444 232 L452 242 L468 220", 81) },

  // The match flows back to Jev as the reward.
  { cls: "sk-reward", strokes: elbow([[498, 256], [498, 296], [84, 296], [84, 200]], 82) },
];

/** The boundary, on a sticky note, tilted like one stuck on by hand. */
const note = box(486, 14, 140, 88, 83);
</script>

<template>
  <svg class="sk" viewBox="0 0 640 330" role="img" aria-label="RLCD: Jev returns decisions at 0.80, 8 of 10 turn out right, and that match is the reward">
    <defs>
      <pattern id="sk-dots-rlcd" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" class="sk-dot" /></pattern>
    </defs>
    <rect width="640" height="330" class="sk-canvas" />
    <rect width="640" height="330" fill="url(#sk-dots-rlcd)" />

    <g v-for="(s, i) in shapes" :key="i" :class="s.cls">
      <path v-for="(p, j) in s.strokes" :key="j" :d="p.d" :class="p.fill ? 'f' : 's'" />
    </g>

    <text x="84" y="168" text-anchor="middle">Jev</text>
    <text x="290" y="108" text-anchor="middle" class="sk-small">many decisions</text>
    <text x="284" y="160" text-anchor="middle">approve</text>
    <text x="284" y="190" text-anchor="middle" class="sk-label">0.80</text>
    <text x="498" y="124" text-anchor="middle" class="sk-small">what happened</text>
    <text x="498" y="214" text-anchor="middle" class="sk-small">8 of 10 right</text>
    <text x="476" y="240" class="sk-label">match</text>
    <text x="290" y="322" text-anchor="middle" class="sk-label">reward = the number matched reality</text>
    <g transform="rotate(3 556 58)">
      <g class="sk-note"><path v-for="(p, j) in note" :key="j" :d="p.d" :class="p.fill ? 'f' : 's'" /></g>
      <text x="556" y="52" text-anchor="middle" class="sk-note-text">calibrated</text>
      <text x="556" y="78" text-anchor="middle" class="sk-note-text">≠ accurate</text>
    </g>
  </svg>
</template>
