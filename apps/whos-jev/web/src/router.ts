import { createRouter, createWebHistory } from "vue-router";
import IndexView from "./views/IndexView.vue";
import ExampleView from "./views/ExampleView.vue";
import JevDeckView from "./views/JevDeckView.vue";
import DeckNotesView from "./views/DeckNotesView.vue";
import { indexScroll } from "./lib/store";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: IndexView },
    { path: "/jev/:slide?", component: JevDeckView },
    { path: "/jev-notes/:slide?", component: DeckNotesView, meta: { bare: true } },
    { path: "/example/:slug([a-z-]+)", component: ExampleView, props: true },
  ],
  // The index scrolls sideways, so returning to it restores the spot in the line.
  scrollBehavior: (to) => (to.path === "/" ? { top: 0, left: indexScroll.value } : { top: 0, left: 0 }),
});
