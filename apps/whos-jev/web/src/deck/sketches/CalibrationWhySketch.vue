<script setup lang="ts">
import { arrow, box, path, type Shape } from "../../lib/sketch";

/**
 * Why calibration makes sense, redrawn as a tldraw style sketch from the "RLCD explained" diagram:
 * a calibrated model gives reliable predictions and trustworthy high-stakes decisions, which add up
 * to better trust and safety. Drawn once with fixed seeds.
 */
const cloud =
  "M486 214 C462 214 452 194 466 180 C454 160 474 140 494 148 C500 128 530 124 542 140 C556 126 586 132 588 152 " +
  "C610 154 616 180 600 192 C610 210 590 226 570 218 C560 234 530 236 520 222 C510 232 488 228 486 214 Z";

const shapes: Shape[] = [
  { cls: "sk-pick", strokes: box(18, 138, 136, 72, 121) },
  { cls: "sk-ink", strokes: arrow([[154, 158], [168, 120], [184, 90]], 122) },
  { cls: "sk-ink", strokes: arrow([[154, 190], [168, 226], [184, 254]], 123) },
  { cls: "sk-paper", strokes: box(188, 52, 246, 74, 124) },
  { cls: "sk-paper", strokes: box(188, 218, 246, 74, 125) },
  { cls: "sk-hot", strokes: arrow([[434, 92], [456, 116], [470, 152]], 126) },
  { cls: "sk-hot", strokes: arrow([[434, 254], [456, 236], [476, 212]], 127) },
  { cls: "sk-cloud", strokes: path(cloud, 128, true) },
];
</script>

<template>
  <svg class="sk" viewBox="0 0 640 340" role="img" aria-label="Why calibration makes sense: a calibrated model gives reliable predictions and trustworthy high-stakes decisions, which add up to better trust and safety">
    <defs>
      <pattern id="sk-dots-why" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" class="sk-dot" /></pattern>
    </defs>
    <rect width="640" height="340" class="sk-canvas" />
    <rect width="640" height="340" fill="url(#sk-dots-why)" />

    <g v-for="(s, i) in shapes" :key="i" :class="s.cls">
      <path v-for="(p, j) in s.strokes" :key="j" :d="p.d" :class="p.fill ? 'f' : 's'" />
    </g>

    <text x="86" y="170" text-anchor="middle">Calibrated</text>
    <text x="86" y="196" text-anchor="middle">model</text>
    <text x="311" y="84" text-anchor="middle" class="sk-mid">reliable predictions</text>
    <text x="311" y="110" text-anchor="middle" class="sk-mid">&amp; uncertainty</text>
    <text x="311" y="150" text-anchor="middle" class="sk-small">knows what it doesn't know</text>
    <text x="311" y="250" text-anchor="middle" class="sk-mid">trustworthy for</text>
    <text x="311" y="276" text-anchor="middle" class="sk-mid">high-stakes decisions</text>
    <text x="311" y="316" text-anchor="middle" class="sk-small">less over and underconfidence</text>
    <text x="536" y="180" text-anchor="middle" class="sk-cloud-text">better trust</text>
    <text x="536" y="204" text-anchor="middle" class="sk-cloud-text">&amp; safety</text>
  </svg>
</template>
