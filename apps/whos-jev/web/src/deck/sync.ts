import { onBeforeUnmount, onMounted, watch, type Ref } from "vue";

/**
 * Keeps the presenter notes window on the deck's slide. Both windows run in one browser on one origin, so a
 * BroadcastChannel reaches the other one. The deck owns the slide: the notes window asks it to step and shows
 * whatever slide it reports, so the two cannot drift apart.
 */
type Message = { at: string } | { step: number } | { ask: true };

function open(onMessage: (m: Message) => void): BroadcastChannel {
  const channel = new BroadcastChannel("whosjev.deck");
  channel.onmessage = (e: MessageEvent<Message>) => onMessage(e.data);
  onBeforeUnmount(() => channel.close());
  return channel;
}

/** Deck side: reports its slide on every change and on request, and steps when the notes window asks. */
export function shareSlide(slide: Ref<string>, step: (by: number) => void): void {
  const channel = open((m) => {
    if ("step" in m) step(m.step);
    if ("ask" in m) channel.postMessage({ at: slide.value });
  });
  watch(slide, (id) => channel.postMessage({ at: id }));
}

/** Notes side: follows the deck's slide. Returns the function that asks the deck to step. */
export function followSlide(show: (id: string) => void): (by: number) => void {
  const channel = open((m) => {
    if ("at" in m) show(m.at);
  });
  onMounted(() => channel.postMessage({ ask: true }));
  return (by) => channel.postMessage({ step: by });
}
