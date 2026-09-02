// Copyright (C) 2026 SharpEmu Emulator Project
// SPDX-License-Identifier: GPL-2.0-or-later
//
// Osszefuz mindent EGY html fajlba (standalone.html), hogy Claude Artifactkent
// publikalhato legyen. Az assets/art/*.png rajzokat data URI-kent beagyazza,
// mert az artifactban nincs relativ fajlrendszer.
//
//   node build-standalone.mjs
//
// A kimenet szandekosan doctype/html/head/body tagek NELKUL keszul: az Artifact
// szolgaltatas ezt a vazat maga teszi kore.

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "standalone.html");

const JS_ORDER = ["art.js", "story.js", "engine.js", "minigames.js", "levels.js", "main.js"];
const FONTS = "https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@400;700;900&display=swap";

/* --- rajzok beagyazasa ------------------------------------------------- */
const artDir = join(ROOT, "assets", "art");
const art = {};
let artBytes = 0;
if (existsSync(artDir)) {
    for (const f of readdirSync(artDir)) {
        if (!f.toLowerCase().endsWith(".png")) continue;
        const buf = readFileSync(join(artDir, f));
        artBytes += buf.length;
        art[f.replace(/\.png$/i, "")] = "data:image/png;base64," + buf.toString("base64");
    }
}

/* --- osszefuzes -------------------------------------------------------- */
const css = readFileSync(join(ROOT, "css", "style.css"), "utf8");
const js = JS_ORDER.map((f) => {
    const src = readFileSync(join(ROOT, "js", f), "utf8");
    return `/* ===== js/${f} ===== */\n${src}`;
}).join("\n");

const html = `<title>Az Emma Sztori</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<style>
${css}
</style>

<div id="shell">
    <canvas id="game" width="960" height="540" tabindex="0"></canvas>

    <div id="touch" aria-hidden="true">
        <div class="pad">
            <button class="tbtn" data-key="ArrowLeft" aria-label="balra">&#9664;</button>
            <button class="tbtn" data-key="ArrowRight" aria-label="jobbra">&#9654;</button>
        </div>
        <div class="pad right">
            <button class="tbtn wide" data-key="Space" aria-label="ugrás / tovább">&#9651;</button>
            <button class="tbtn wide" data-key="KeyE" aria-label="ok">OK</button>
        </div>
    </div>

    <div id="rotate">Fordítsd el a telefont fekvőbe &#128260;</div>
</div>

<script>
/* Beagyazott rajzok. Ures objektum = mindenhol a kodbol rajzolt placeholder megy. */
window.EMMA_ART_DATA = ${JSON.stringify(art)};
window.EMMA_ART_INLINE_ONLY = true;
</script>

<script>
${js}
</script>

<script>
/* Az artifact iframe-ben a billentyuzet csak akkor jon at, ha a keret fokuszban
 * van. Elso kattintasra raallitjuk a canvasra. */
(function () {
    var c = document.getElementById("game");
    function grab() { try { window.focus(); c.focus({ preventScroll: true }); } catch (e) { } }
    c.addEventListener("mousedown", grab);
    c.addEventListener("touchstart", grab, { passive: true });
    grab();
})();
</script>
`;

writeFileSync(OUT, html, "utf8");
const kb = (n) => (n / 1024).toFixed(0) + " kB";
const names = Object.keys(art);
console.log("standalone.html kesz: " + kb(Buffer.byteLength(html)));
console.log("beagyazott rajz: " + names.length + (names.length ? " (" + kb(artBytes) + "): " + names.join(", ") : " - mind placeholder"));
if (Buffer.byteLength(html) > 15 * 1024 * 1024) console.warn("FIGYELEM: 15 MB felett - az Artifact limit 16 MB.");
