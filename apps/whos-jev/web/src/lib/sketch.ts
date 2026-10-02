import rough from "roughjs";
import type { Options } from "roughjs/bin/core";

/**
 * Hand-drawn shapes in the style of a tldraw sketch, as plain SVG path data. rough.js draws each
 * shape as one or more wobbly strokes plus, when filled, a fill path. Colors are left to CSS
 * classes so the drawings follow the light and dark themes. Every shape takes a seed, so a drawing
 * looks the same on every render instead of re-wobbling.
 */
const gen = rough.generator();

export interface Stroke {
  d: string;
  /** A fill path (no stroke) rather than an outline. */
  fill: boolean;
}

const BASE: Options = { roughness: 1.2, bowing: 1.4, strokeWidth: 2.2, disableMultiStroke: false, preserveVertices: true };
const FILLED: Options = { fill: "#000", fillStyle: "solid" };

const toStrokes = (drawable: ReturnType<typeof gen.path>): Stroke[] =>
  gen.toPaths(drawable).map((p) => ({ d: p.d, fill: p.stroke === "none" }));

/** A rectangle with softened corners, the tldraw default. */
export function box(x: number, y: number, w: number, h: number, seed: number, filled = true): Stroke[] {
  const r = Math.min(14, w / 4, h / 4);
  const d = `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
  return toStrokes(gen.path(d, { ...BASE, ...(filled ? FILLED : {}), seed }));
}

export function circle(cx: number, cy: number, diameter: number, seed: number, filled = false): Stroke[] {
  return toStrokes(gen.circle(cx, cy, diameter, { ...BASE, ...(filled ? FILLED : {}), seed }));
}

export function line(x1: number, y1: number, x2: number, y2: number, seed: number): Stroke[] {
  return toStrokes(gen.line(x1, y1, x2, y2, { ...BASE, seed }));
}

/** Any SVG path, drawn by hand. */
export function path(d: string, seed: number, filled = false): Stroke[] {
  return toStrokes(gen.path(d, { ...BASE, ...(filled ? FILLED : {}), seed }));
}

/**
 * An arrow along a smooth curve through `points`, with a hand-drawn head at the last point.
 * The head follows the direction of the last segment.
 */
export function arrow(points: [number, number][], seed: number): Stroke[] {
  const body = toStrokes(gen.curve(points, { ...BASE, seed }));
  const [x2, y2] = points[points.length - 1];
  const [x1, y1] = points[points.length - 2];
  const a = Math.atan2(y2 - y1, x2 - x1);
  const len = 14;
  const wing = (s: number) =>
    line(x2, y2, x2 - len * Math.cos(a + s * 0.45), y2 - len * Math.sin(a + s * 0.45), seed + (s > 0 ? 11 : 13));
  return [...body, ...wing(1), ...wing(-1)];
}

/** A straight-segment arrow through `points` (an elbow), with a head at the end. */
export function elbow(points: [number, number][], seed: number): Stroke[] {
  const d = points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const body = toStrokes(gen.path(d, { ...BASE, seed }));
  const [x2, y2] = points[points.length - 1];
  const [x1, y1] = points[points.length - 2];
  const a = Math.atan2(y2 - y1, x2 - x1);
  const len = 14;
  const wing = (s: number) =>
    line(x2, y2, x2 - len * Math.cos(a + s * 0.45), y2 - len * Math.sin(a + s * 0.45), seed + (s > 0 ? 11 : 13));
  return [...body, ...wing(1), ...wing(-1)];
}

/** A shape and the class that colors it. */
export interface Shape {
  cls: string;
  strokes: Stroke[];
}
