/**
 * Lab server. Zero dependencies, node:http only.
 *
 *   GET  /api/state           { provider, live, calls }
 *   GET  /api/example/:slug   { slug, agent, options: [{ key, name, file, inputs: [setA, setB, setC], call, code }] }
 *   POST /api/run/:slug?option=A body { input } -> SSE stream: option-start, then per Jev call
 *                             request (state + questions) and response (typed answers + meta),
 *                             decision, example-done
 *   POST /api/agent/start     body { example, option, config } -> { id, model }; spawns pi in RPC mode
 *   GET  /api/agent/:id/events SSE: every session event so far, then live (agent, tool, jev, hook, stats)
 *   POST /api/agent/:id/prompt body { message }
 *   POST /api/agent/:id/abort
 *   DELETE /api/agent/:id
 *   GET  /api/notes/:slide    { text } presenter notes for one deck slide, "" when there are none
 *   PUT  /api/notes/:slide    body { text } saves them
 *   POST /api/notes-images?slide=:slide  raw image body -> { name }, saved next to the notes
 *   GET  /api/notes-images/:name          that image
 *   GET  /*                   the built Vue app in ../web/dist (SPA fallback to index.html)
 *
 * Live by default when TYPESAFE_API_KEY is set; JEV_BACKEND=mock forces offline.
 */
// The lab opts into mock only when no TypeSafe key exists.
if (!process.env.JEV_BACKEND && !process.env.TYPESAFE_API_KEY?.trim()) {
  process.env.JEV_BACKEND = "mock";
}

import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extname, join, normalize } from "node:path";
import { sharedJev } from "../src/core/client.ts";
import { SCENARIOS } from "./scenarios.mjs";
import * as agents from "./agent-session.mjs";

const DIST = fileURLToPath(new URL("../web/dist/", import.meta.url));
const EXT_DIR = fileURLToPath(new URL("../extensions/", import.meta.url));
const SANDBOX = fileURLToPath(new URL("../sandbox/", import.meta.url));
const EXAMPLES_DIR = fileURLToPath(new URL("../src/examples/", import.meta.url));
// One Markdown file per deck slide id. The folder is git-ignored so the notes never reach the repo.
const NOTES_DIR = fileURLToPath(new URL("../web/src/deck/notes/", import.meta.url));
const PORT = Number(process.env.PORT || 4399);

const client = sharedJev();

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".gif": "image/gif", ".webp": "image/webp", ".mp4": "video/mp4", ".json": "application/json", ".woff2": "font/woff2", ".ico": "image/x-icon",
};

function sse(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

/** The page shows the real source, minus comments: block comments, full-line comments, and 3+ blank lines collapsed. */
function stripComments(source) {
  return source
    .replace(/^[ \t]*\/\*\*[\s\S]*?\*\/\n?/gm, "")
    .replace(/^[ \t]*\/\/[^\n]*\n/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim() + "\n";
}

async function readJson(req) {
  let body = "";
  for await (const chunk of req) body += chunk;
  return body ? JSON.parse(body) : {};
}

async function readRaw(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw new Error("too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

async function runOption(example, option, input, res) {
  sse(res, "option-start", { example, option: option.key, name: option.name });
  const off = client.on((e) => sse(res, e.kind, e));
  try {
    const emit = (e) => sse(res, e.kind, e);
    const output = await option.run(input, { emit });
    sse(res, "decision", { example, option: option.key, name: option.name, input, output });
  } catch (err) {
    sse(res, "option-error", { example, option: option.key, error: String(err?.message ?? err) });
  } finally {
    off();
  }
  sse(res, "example-done", { example });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  if (url.pathname === "/api/state") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ provider: client.provider, live: client.isLive, calls: client.calls }));
  }

  // Agent sessions: one pi process per run, driven over RPC.
  if (url.pathname === "/api/agent/start" && req.method === "POST") {
    let body;
    try { body = await readJson(req); } catch { res.writeHead(400); return res.end("{}"); }
    const scenario = Object.hasOwn(SCENARIOS, body.example) ? SCENARIOS[body.example] : undefined;
    const option = scenario?.options.find((o) => o.key === (body.option || "A"));
    if (!scenario?.agent || !option) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "not a pi example or unknown option" }));
    }
    const session = agents.start({
      example: body.example, option: option.key,
      extension: join(EXT_DIR, option.extension), tools: option.tools, cwd: SANDBOX,
      config: body.config ?? {},
    });
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ id: session.id, model: session.model }));
  }
  const agentMatch = url.pathname.match(/^\/api\/agent\/([a-z0-9]+)(?:\/(events|prompt|abort))?$/);
  if (agentMatch) {
    const session = agents.getSession(agentMatch[1]);
    if (!session) { res.writeHead(404, { "Content-Type": "application/json" }); return res.end(JSON.stringify({ error: "no such session" })); }
    const action = agentMatch[2];
    if (action === "events" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
      const off = session.subscribe((item) => sse(res, "item", item));
      req.on("close", off);
      return;
    }
    try {
      if (action === "prompt" && req.method === "POST") {
        const body = await readJson(req);
        await session.prompt(String(body.message ?? ""));
      } else if (action === "abort" && req.method === "POST") {
        await session.abort();
      } else if (!action && req.method === "DELETE") {
        session.close();
      } else {
        res.writeHead(405); return res.end();
      }
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok: true }));
    } catch (err) {
      res.writeHead(409, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: String(err?.message ?? err) }));
    }
  }

  const exampleMatch = url.pathname.match(/^\/api\/example\/([a-z-]+)$/);
  if (exampleMatch && Object.hasOwn(SCENARIOS, exampleMatch[1])) {
    const slug = exampleMatch[1];
    const options = await Promise.all(SCENARIOS[slug].options.map(async (o) => ({
      key: o.key, name: o.name, file: `src/examples/${o.file}`, inputs: o.inputs, sets: o.sets, info: o.info, call: o.call,
      extension: o.extension, tools: o.tools,
      code: stripComments(await readFile(join(EXAMPLES_DIR, o.file), "utf8")),
    })));
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ slug, agent: !!SCENARIOS[slug].agent, options }));
  }

  const runMatch = url.pathname.match(/^\/api\/run\/([a-z-]+)$/);
  if (runMatch && req.method === "POST") {
    const slug = runMatch[1];
    const scenario = Object.hasOwn(SCENARIOS, slug) ? SCENARIOS[slug] : undefined;
    const option = scenario?.options.find((o) => o.key === (url.searchParams.get("option") || "A"));
    if (!option) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "unknown example or option" }));
    }
    let input = option.inputs[0];
    try {
      const body = await readJson(req);
      if (body && typeof body.input === "object" && body.input) input = body.input;
    } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "body must be JSON { input }" }));
    }
    res.writeHead(200, { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    await runOption(slug, option, input, res);
    return res.end();
  }

  // Images in the notes. No SVG: an SVG can carry script, and these are served from the lab's own origin.
  const IMAGE_TYPES = { "image/png": "png", "image/jpeg": "jpg", "image/gif": "gif", "image/webp": "webp" };
  if (url.pathname === "/api/notes-images" && req.method === "POST") {
    const slide = url.searchParams.get("slide") ?? "";
    const ext = IMAGE_TYPES[req.headers["content-type"]];
    if (!/^[a-z0-9-]+$/.test(slide) || !ext) { res.writeHead(400); return res.end("{}"); }
    let data;
    try { data = await readRaw(req, 20 * 1024 * 1024); } catch { res.writeHead(413); return res.end("{}"); }
    const name = `${slide}-${Date.now()}.${ext}`;
    await mkdir(join(NOTES_DIR, "images"), { recursive: true });
    await writeFile(join(NOTES_DIR, "images", name), data);
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ name }));
  }
  const imageMatch = url.pathname.match(/^\/api\/notes-images\/([a-z0-9-]+\.(?:png|jpg|gif|webp))$/);
  if (imageMatch && req.method === "GET") {
    try {
      const data = await readFile(join(NOTES_DIR, "images", imageMatch[1]));
      res.writeHead(200, { "Content-Type": MIME[extname(imageMatch[1])] });
      return res.end(data);
    } catch { res.writeHead(404); return res.end(); }
  }

  const notesMatch = url.pathname.match(/^\/api\/notes\/([a-z0-9-]+)$/);
  if (notesMatch) {
    const file = join(NOTES_DIR, `${notesMatch[1]}.md`);
    if (req.method === "GET") {
      const text = await readFile(file, "utf8").catch(() => "");
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ text }));
    }
    if (req.method === "PUT") {
      let body;
      try { body = await readJson(req); } catch { res.writeHead(400); return res.end("{}"); }
      await mkdir(NOTES_DIR, { recursive: true });
      await writeFile(file, String(body.text ?? ""));
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ ok: true }));
    }
    res.writeHead(405); return res.end();
  }

  if (url.pathname.startsWith("/api/")) {
    res.writeHead(404, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ error: "not found" }));
  }

  // Static: the built Vue app, with SPA fallback for client routes.
  const path = normalize(url.pathname);
  if (path.includes("..")) { res.writeHead(403); return res.end(); }
  const candidates = [join(DIST, path), join(DIST, "index.html")];
  // A hard refresh (shift reload) sends Cache-Control: no-cache; a normal reload sends max-age=0.
  // The page reads the mark and starts with every example hidden again.
  const hardReload = /no-cache/.test(req.headers["cache-control"] ?? "") || /no-cache/.test(req.headers.pragma ?? "");
  for (const file of candidates) {
    try {
      let data = await readFile(file);
      if (hardReload && file.endsWith("index.html")) {
        data = data.toString().replace("</head>", "<script>window.__JEV_HARD_RELOAD__=true</script></head>");
      }
      const type = MIME[extname(file)] ?? "application/octet-stream";
      // Byte ranges, so a video in the deck can seek and replay.
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range ?? "");
      if (range && (range[1] || range[2])) {
        const start = range[1] ? Number(range[1]) : Math.max(0, data.length - Number(range[2]));
        const end = range[1] && range[2] ? Math.min(Number(range[2]), data.length - 1) : data.length - 1;
        if (start > end) { res.writeHead(416, { "Content-Range": `bytes */${data.length}` }); return res.end(); }
        res.writeHead(206, { "Content-Type": type, "Content-Range": `bytes ${start}-${end}/${data.length}`, "Accept-Ranges": "bytes", "Cache-Control": "no-cache" });
        return res.end(data.subarray(start, end + 1));
      }
      res.writeHead(200, { "Content-Type": type, "Accept-Ranges": "bytes", "Cache-Control": "no-cache" });
      return res.end(data);
    } catch { /* next candidate */ }
  }
  res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("No build found. Run `just web` (builds web/dist, then starts this server).");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Who's Jev lab → http://127.0.0.1:${PORT} (backend: ${client.provider})`);
});
