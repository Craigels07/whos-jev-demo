/**
 * Renders the example hero images as SVG in the app's light and dark palettes.
 *
 *   node web/scripts/build-heroes.mjs   -> web/public/heroes/<slug>.svg and <slug>-dark.svg
 *
 * The drawings live in src/lib/hero-scenes.mjs so the run modal animates the same geometry.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { W, H, heroInner, scenes } from "../src/lib/hero-scenes.mjs";

const OUT = fileURLToPath(new URL("../public/heroes/", import.meta.url));
mkdirSync(OUT, { recursive: true });

for (const slug of Object.keys(scenes)) {
  for (const theme of ["light", "dark"]) {
    const name = theme === "dark" ? `${slug}-dark.svg` : `${slug}.svg`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${slug}">${heroInner(slug, { theme })}\n</svg>\n`;
    writeFileSync(`${OUT}${name}`, svg);
    console.log(name);
  }
}
