<script setup lang="ts">
import { arrow, box, circle, path, type Shape } from "../../lib/sketch";

/**
 * What RLCD is, redrawn as a tldraw style sketch from the "RLCD explained" diagram: the model gives
 * an answer and a stated probability, the outcome is checked, a calibration check compares the two,
 * and the reward tied to that match flows back to the model. Drawn once with fixed seeds.
 */
const star = (cx: number, cy: number, r: number) =>
  Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
  }).join(" ") + " Z";

const shapes: Shape[] = [
  // The model and what it returns: an answer and a stated probability.
  { cls: "sk-paper", strokes: box(14, 120, 112, 66, 101) },
  { cls: "sk-ink", strokes: arrow([[126, 140], [142, 108], [160, 92]], 102) },
  { cls: "sk-ink", strokes: arrow([[126, 166], [142, 194], [160, 210]], 103) },
  { cls: "sk-paper", strokes: box(164, 64, 196, 54, 104) },
  { cls: "sk-pick", strokes: box(164, 178, 196, 70, 105) },

  // The answer plays out; the actual result is correct or incorrect.
  { cls: "sk-ink", strokes: arrow([[360, 91], [384, 90], [404, 89]], 106) },
  { cls: "sk-paper", strokes: box(408, 56, 218, 66, 107) },

  // The calibration check compares the stated probability with what happened.
  { cls: "sk-ink", strokes: arrow([[360, 213], [384, 212], [404, 211]], 108) },
  { cls: "sk-ink", strokes: arrow([[517, 122], [519, 148], [517, 176]], 109) },
  { cls: "sk-pick", strokes: box(408, 180, 218, 66, 110) },

  // The reward, tied to the match, flows back to the model.
  { cls: "sk-reward", strokes: arrow([[517, 248], [470, 296], [220, 300], [70, 192]], 111) },
  { cls: "sk-star", strokes: path(star(300, 268, 15), 112, true) },
  { cls: "sk-ink", strokes: circle(340, 268, 28, 113) },
];
</script>

<template>
  <svg class="sk" viewBox="0 0 640 340" role="img" aria-label="What RLCD is: the model gives an answer and a stated probability such as 80%, a calibration check compares the probability with the actual result, and the reward tied to that match flows back to the model">
    <defs>
      <pattern id="sk-dots-what" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" class="sk-dot" /></pattern>
    </defs>
    <rect width="640" height="340" class="sk-canvas" />
    <rect width="640" height="340" fill="url(#sk-dots-what)" />

    <g v-for="(s, i) in shapes" :key="i" :class="s.cls">
      <path v-for="(p, j) in s.strokes" :key="j" :d="p.d" :class="p.fill ? 'f' : 's'" />
    </g>

    <text x="70" y="160" text-anchor="middle">Model</text>
    <text x="262" y="97" text-anchor="middle" class="sk-mid">answer: approve</text>
    <text x="262" y="207" text-anchor="middle" class="sk-mid">stated probability</text>
    <text x="262" y="233" text-anchor="middle" class="sk-small">e.g. 80%</text>
    <text x="517" y="86" text-anchor="middle" class="sk-mid">actual result</text>
    <text x="517" y="110" text-anchor="middle" class="sk-small">correct or incorrect</text>
    <text x="517" y="210" text-anchor="middle" class="sk-mid">calibration check</text>
    <text x="517" y="234" text-anchor="middle" class="sk-small">vs how often right</text>
    <text x="340" y="275" text-anchor="middle" class="sk-coin">$</text>
    <text x="320" y="330" text-anchor="middle" class="sk-label">reward = probability ≈ outcome frequency</text>
  </svg>
</template>
