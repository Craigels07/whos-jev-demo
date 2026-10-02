<script setup lang="ts">
import { box, type Shape } from "../../lib/sketch";

/**
 * Four decision models as two-layer stacks, base model below and post-training on top, in the same
 * tldraw style as the training slide. Teal post-training is RL for calibration, amber is a supervised
 * fine-tune, and a dashed base is not disclosed. Drawn once with fixed seeds.
 */
type Kind = "rl" | "sft";
const models: { name: string; post: [string, string]; kind: Kind; base: [string, string]; known: boolean; who: [string, string] }[] = [
  { name: "Jev", post: ["RLCD", "reward: calibration"], kind: "rl", base: ["not disclosed", ""], known: false, who: ["TypeSafe", "hosted API"] },
  { name: "Laya", post: ["RL, RLCD style", "proper scoring rules"], kind: "rl", base: ["ModernBERT-large", "encoder, 421M"], known: true, who: ["Convai Innovations", "Apache-2.0"] },
  { name: "Tev1", post: ["fine-tune", "37,840 examples"], kind: "sft", base: ["Qwen3.5-4B", "LLM, also 0.8B"], known: true, who: ["Together AI", "MIT code"] },
  { name: "Nimble", post: ["fine-tune", "contrastive pairs"], kind: "sft", base: ["Qwen3.5-9B", "LLM"], known: true, who: ["Bespoke Labs", "Apache-2.0"] },
];
const X0 = 158, W = 194, GAP = 6;
const cx = (i: number) => X0 + i * (W + GAP) + W / 2;

const shapes: Shape[] = models.flatMap((m, i) => {
  const x = X0 + i * (W + GAP);
  return [
    { cls: m.kind === "rl" ? "sk-layer-rl" : "sk-layer-sft", strokes: box(x, 76, W, 88, 200 + i * 2) },
    { cls: m.known ? "sk-paper" : "sk-unknown", strokes: box(x, 176, W, 80, 201 + i * 2) },
  ];
});
</script>

<template>
  <svg class="sk" viewBox="0 0 960 372" role="img" aria-label="Four decision models as stacks of base model and post-training: Jev, Laya, Tev1 and Nimble">
    <defs>
      <pattern id="sk-dots-stack" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.4" class="sk-dot" /></pattern>
    </defs>
    <rect width="960" height="372" class="sk-canvas" />
    <rect width="960" height="372" fill="url(#sk-dots-stack)" />

    <text x="14" y="126" class="sk-small">post-training</text>
    <text x="14" y="222" class="sk-small">base model</text>

    <g v-for="(s, i) in shapes" :key="i" :class="s.cls">
      <path v-for="(p, j) in s.strokes" :key="j" :d="p.d" :class="p.fill ? 'f' : 's'" />
    </g>

    <template v-for="(m, i) in models" :key="m.name">
      <text :x="cx(i)" y="56" text-anchor="middle" class="sk-name">{{ m.name }}</text>
      <text :x="cx(i)" y="114" text-anchor="middle" class="sk-mid" :class="m.kind === 'rl' ? 'sk-rl-text' : 'sk-sft-text'">{{ m.post[0] }}</text>
      <text :x="cx(i)" y="142" text-anchor="middle" class="sk-small">{{ m.post[1] }}</text>
      <text :x="cx(i)" :y="m.base[1] ? 210 : 222" text-anchor="middle" class="sk-mid" :class="{ 'sk-unknown-text': !m.known }">{{ m.base[0] }}</text>
      <text v-if="m.base[1]" :x="cx(i)" y="236" text-anchor="middle" class="sk-small">{{ m.base[1] }}</text>
      <text :x="cx(i)" y="290" text-anchor="middle" class="sk-small">{{ m.who[0] }}</text>
      <text :x="cx(i)" y="314" text-anchor="middle" class="sk-small">{{ m.who[1] }}</text>
    </template>

    <text x="480" y="356" text-anchor="middle" class="sk-legend">
      <tspan class="sk-rl-text">teal: RL for calibration</tspan><tspan dx="28" class="sk-sft-text">amber: supervised fine-tune</tspan><tspan dx="28" class="sk-unknown-text">dashed: not disclosed</tspan>
    </text>
  </svg>
</template>
