// Copyright (C) 2026 SharpEmu Emulator Project
// SPDX-License-Identifier: GPL-2.0-or-later
//
// Egy fajlba fuzi az ajandekot (artifact.html), hogy Claude Artifactkent
// publikalhato legyen.  A kimenet szandekosan doctype/html/head/body tagek
// NELKUL keszul: azt a vazat a szolgaltatas teszi kore.
//
//   node build-artifact.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "artifact.html");

const html = readFileSync(join(ROOT, "index.html"), "utf8");
const css = readFileSync(join(ROOT, "style.css"), "utf8");
const js = ["content.js", "app.js"]
    .map((f) => `/* ===== ${f} ===== */\n` + readFileSync(join(ROOT, f), "utf8"))
    .join("\n");

// a <body> tartalma, a wrapper tagek nelkul
const bodyStart = html.indexOf("<body>") + "<body>".length;
const bodyEnd = html.indexOf("</body>");
let body = html.slice(bodyStart, bodyEnd);

// a helyi <script src> es <link rel=stylesheet href="style.css"> kivezetese
body = body.replace(/\s*<script src="[^"]+"><\/script>/g, "");

const fonts = html.match(/<link rel="stylesheet" href="https:\/\/fonts[^"]+">/)[0];

const out = `<title>Emma szülinapja</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
${fonts}
<style>
${css}
</style>
${body.trim()}

<script>
${js}
</script>
`;

writeFileSync(OUT, out, "utf8");
console.log("artifact.html kesz: " + (Buffer.byteLength(out) / 1024).toFixed(0) + " kB");
