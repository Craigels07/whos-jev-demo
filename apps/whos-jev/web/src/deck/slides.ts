import type { Component } from "vue";
import WhoSlide from "./WhoSlide.vue";
import StateSlide from "./StateSlide.vue";
import QuestionSlide from "./QuestionSlide.vue";
import VsLlmSlide from "./VsLlmSlide.vue";
import TrainingSlide from "./TrainingSlide.vue";
import CompareSlide from "./CompareSlide.vue";
import ConfidenceSlide from "./ConfidenceSlide.vue";

export type Slide = { id: string; title: string; component: Component };

// Order here is the order of the deck. Reorder or remove a slide by editing one line.
export const slides: Slide[] = [
  { id: "who", title: "What makes Jev different?", component: WhoSlide },
  { id: "state", title: "State", component: StateSlide },
  { id: "question", title: "Define a question", component: QuestionSlide },
  { id: "confidence", title: "Confidence and probability", component: ConfidenceSlide },
  { id: "vs-llm", title: "How Jev differs from an LLM", component: VsLlmSlide },
  { id: "training", title: "Training Jev: from RLHF to RLCD", component: TrainingSlide },
  { id: "next-time", title: "For next time: Jev, Laya, Tev1 and Nimble", component: CompareSlide },
];
