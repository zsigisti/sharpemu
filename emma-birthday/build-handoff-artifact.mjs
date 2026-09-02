// Copyright (C) 2026 SharpEmu Emulator Project
// SPDX-License-Identifier: GPL-2.0-or-later
//
// A HANDOFF.md-bol keszit egy olvashato, designolt lapot (handoff.html),
// amit Claude Artifactkent lehet publikalni.  A markdown a forras: ha azt
// szerkeszted, csak futtasd ujra.
//
//   node build-handoff-artifact.mjs
//
// A markdown BUILD IDOBEN alakul HTML-re (lasd renderMarkdown lentebb), nem
// a bongeszoben: igy a lap statikus, nincs futasideju konyvtar-fugges, es a
// kimenet ellenorizheto.  A markdown reszkeszlete, amit ismer: h2/h3,
// bekezdes, felsorolas (sorszamozott is, egy szinten beagyazva), tablazat,
// kodblokk, idezet, valasztovonal, es inline **felkover** / *kurziv* /
// `kod` / [link](url) / <autolink>.

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT = join(ROOT, "handoff.html");

/* ------------------------------------------------------------------ *
 * Minimalis markdown -> HTML.  Csak azt a reszkeszletet kezeli, amit a
 * HANDOFF.md hasznal; nem altalanos celu konyvtar.
 * ------------------------------------------------------------------ */

function esc(t) {
    return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(t) {
    t = esc(t);
    t = t.replace(/`([^`]+)`/g, (m, c) => "<code>" + c + "</code>");
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
    t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    /* <https://...> autolink (a & mar &amp;-re valt, ezert a lezaro &gt;) */
    t = t.replace(/&lt;(https?:\/\/[^\s&]+)&gt;/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
    return t;
}

function cells(line) {
    return line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
}

function renderMarkdown(src) {
    const lines = src.split("\n");
    const out = [];
    let i = 0;

    function listBlock(ordered) {
        const tag = ordered ? "ol" : "ul";
        const marker = ordered ? /^(\s*)(\d+)\.\s+(.*)$/ : /^(\s*)[-*]\s+(.*)$/;
        out.push("<" + tag + ">");
        let open = false;
        let buf = [];       /* a folyo elem tovabbi sorai */
        let nested = [];    /* beagyazott felsorolas sorai */

        function flush() {
            if (!open) return;
            let html = inline(buf.join(" ").trim());
            if (nested.length) {
                html += renderMarkdown(nested.map((n) => n.replace(/^\s{2,}/, "")).join("\n"));
                nested = [];
            }
            out.push("<li>" + html + "</li>");
            buf = [];
            open = false;
        }

        while (i < lines.length) {
            const line = lines[i];
            const m = line.match(marker);
            if (m) {
                const indent = m[1].length;
                if (indent >= 2 && open) { nested.push(line); i++; continue; }
                flush();
                open = true;
                buf.push(ordered ? m[3] : m[2]);
                i++;
                continue;
            }
            if (/^\s*$/.test(line)) {
                /* ures sor: csak akkor zarja a listat, ha nem folytatodik */
                const next = lines[i + 1] || "";
                if (next.match(marker)) { i++; continue; }
                break;
            }
            if (/^\s{2,}\S/.test(line) && open) {
                /* becsuszott folytatas: ha felsorolas, beagyazott lista */
                if (line.match(/^\s{2,}[-*]\s+/) || line.match(/^\s{2,}\d+\.\s+/)) nested.push(line);
                else buf.push(line.trim());
                i++;
                continue;
            }
            if (open && !/^(#{2,3}\s|>\s|```|\||---\s*$)/.test(line)) {
                buf.push(line.trim());
                i++;
                continue;
            }
            break;
        }
        flush();
        out.push("</" + tag + ">");
    }

    while (i < lines.length) {
        const line = lines[i];

        if (/^\s*$/.test(line)) { i++; continue; }

        if (line.startsWith("```")) {
            i++;
            const code = [];
            while (i < lines.length && !lines[i].startsWith("```")) { code.push(lines[i]); i++; }
            i++;
            out.push("<pre><code>" + esc(code.join("\n")) + "</code></pre>");
            continue;
        }

        if (/^###\s+/.test(line)) { out.push("<h3>" + inline(line.slice(4).trim()) + "</h3>"); i++; continue; }
        if (/^##\s+/.test(line)) { out.push("<h2>" + inline(line.slice(3).trim()) + "</h2>"); i++; continue; }

        if (/^---+\s*$/.test(line)) { out.push("<hr>"); i++; continue; }

        /* tablazat: sor | sor, alatta a valasztosor */
        if (line.trim().startsWith("|") && (lines[i + 1] || "").match(/^\s*\|[\s:|-]+\|\s*$/)) {
            const head = cells(line.trim());
            i += 2;
            const body = [];
            while (i < lines.length && lines[i].trim().startsWith("|")) { body.push(cells(lines[i].trim())); i++; }
            const titled = head.some((c) => c !== "");
            let t = '<div class="tablewrap"><table>';
            if (titled) {
                t += "<thead><tr>";
                head.forEach((c) => { t += "<th>" + inline(c) + "</th>"; });
                t += "</tr></thead>";
            }
            t += "<tbody>";
            body.forEach((r) => {
                t += "<tr>";
                r.forEach((c) => { t += "<td>" + inline(c) + "</td>"; });
                t += "</tr>";
            });
            out.push(t + "</tbody></table></div>");
            continue;
        }

        if (/^>\s?/.test(line)) {
            const q = [];
            while (i < lines.length && /^>\s?/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, "")); i++; }
            out.push("<blockquote><p>" + inline(q.join(" ").trim()) + "</p></blockquote>");
            continue;
        }

        if (/^\s*[-*]\s+/.test(line)) { listBlock(false); continue; }
        if (/^\s*\d+\.\s+/.test(line)) { listBlock(true); continue; }

        /* bekezdes */
        const para = [];
        while (i < lines.length && !/^\s*$/.test(lines[i]) &&
            !/^(#{2,3}\s|>\s|```|---+\s*$)/.test(lines[i]) &&
            !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) &&
            !lines[i].trim().startsWith("|")) {
            para.push(lines[i].trim());
            i++;
        }
        if (para.length) out.push("<p>" + inline(para.join(" ")) + "</p>");
    }

    return out.join("\n");
}

/* h2-kre id + osztaly, es az index felepitese - mind build idoben */
function decorate(html) {
    const heads = [];
    let n = 0;
    html = html.replace(/<h2>([\s\S]*?)<\/h2>/g, (m, label) => {
        n++;
        const id = "s" + n;
        const plain = label.replace(/<[^>]+>/g, "").trim();
        const flagged = /^Amit NE csin/i.test(plain.replace(/^\d+\.\s*/, ""));
        heads.push({ id, plain });
        return '<h2 id="' + id + '"' + (flagged ? ' class="flagged"' : "") + ">" + label + "</h2>";
    });

    /* a "BLOKKOLVA"-t tartalmazo bekezdes kap egy jelzest */
    html = html.replace(/<p>((?:(?!<\/p>)[\s\S])*BLOKKOLVA(?:(?!<\/p>)[\s\S])*)<\/p>/,
        '<div class="callout"><span class="label">Blokkolva</span><p>$1</p></div>');

    /* a h2 sajat felso vonalat rajzol, szoval a kozvetlenul elotte allo
     * valasztovonal duplan latszana */
    html = html.replace(/<hr>\s*(?=<h2)/g, "");

    const toc = heads.map((h) =>
        '<li><a href="#' + h.id + '">' + h.plain + "</a></li>").join("\n            ");

    return { html, toc };
}

let md = readFileSync(join(ROOT, "HANDOFF.md"), "utf8");
md = md.replace(/^<!--[\s\S]*?-->\s*/, "");          // licenc-header le
md = md.replace(/^#\s+.*\n/, "");                     // a H1 a lap fejlecebe megy

const { html: docHtml, toc } = decorate(renderMarkdown(md));

const page = `<title>Emma-projekt átadás</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;1,6..72,400&family=IBM+Plex+Sans:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap">
<style>
/* Vilagos paletta a csupasz :root-on - ez a teljes keszlet.
 * A sotet valtozat csak a tokeneket irja at, harom allapotra:
 * rendszer-sotet, kifejezett sotet, kifejezett vilagos. */
:root {
    --bg: #faf7f3;
    --surface: #ffffff;
    --surface-2: #f3eff8;
    --ink: #221d2b;
    --ink-2: #4a4356;
    --muted: #736b80;
    --rule: #e3ddea;
    --accent: #6c4aa6;
    --accent-soft: #ede6f7;
    --flag: #a8451f;
    --flag-soft: #fbeee8;
    --ok: #2f6b46;
    --ok-soft: #e8f2ec;

    --mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
    --sans: "IBM Plex Sans", system-ui, -apple-system, sans-serif;
    --serif: "Newsreader", Georgia, "Times New Roman", serif;
}

@media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
        --bg: #15121c;
        --surface: #1c1826;
        --surface-2: #241f31;
        --ink: #ece7f4;
        --ink-2: #c4bdd2;
        --muted: #948ca3;
        --rule: #2e2839;
        --accent: #bda1e8;
        --accent-soft: #262034;
        --flag: #e9a184;
        --flag-soft: #2e2029;
        --ok: #8fcfa8;
        --ok-soft: #1b2a22;
    }
}

:root[data-theme="dark"] {
    --bg: #15121c;
    --surface: #1c1826;
    --surface-2: #241f31;
    --ink: #ece7f4;
    --ink-2: #c4bdd2;
    --muted: #948ca3;
    --rule: #2e2839;
    --accent: #bda1e8;
    --accent-soft: #262034;
    --flag: #e9a184;
    --flag-soft: #2e2029;
    --ok: #8fcfa8;
    --ok-soft: #1b2a22;
}

* { box-sizing: border-box; }

body {
    margin: 0;
    background: var(--bg);
    color: var(--ink);
    font-family: var(--sans);
    font-size: 16px;
    line-height: 1.65;
    -webkit-text-size-adjust: 100%;
}

.wrap {
    display: grid;
    grid-template-columns: 232px minmax(0, 1fr);
    gap: clamp(24px, 4vw, 56px);
    max-width: 1180px;
    margin: 0 auto;
    padding: clamp(24px, 4vw, 56px) clamp(18px, 4vw, 40px) 96px;
    align-items: start;
}

/* ---- fejlec ---- */

.masthead {
    grid-column: 1 / -1;
    padding-bottom: 22px;
    margin-bottom: 8px;
    border-bottom: 1px solid var(--rule);
}

.kicker {
    margin: 0 0 6px;
    font-size: .7rem;
    font-weight: 700;
    letter-spacing: .19em;
    text-transform: uppercase;
    color: var(--accent);
}

h1 {
    margin: 0;
    font-family: var(--serif);
    font-weight: 600;
    font-size: clamp(1.9rem, 4.6vw, 2.9rem);
    line-height: 1.1;
    letter-spacing: -.012em;
    text-wrap: balance;
}

.standfirst {
    margin: 12px 0 0;
    max-width: 62ch;
    font-size: 1.02rem;
    color: var(--ink-2);
}

.stamp {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 18px;
    margin-top: 18px;
    font-family: var(--mono);
    font-size: .76rem;
    color: var(--muted);
}

.stamp b {
    color: var(--ink);
    font-weight: 600;
}

/* ---- oldalso index: a dokumentum sorszamozott szakaszai ---- */

nav.index {
    position: sticky;
    top: 20px;
    font-size: .86rem;
}

nav.index p {
    margin: 0 0 10px;
    font-size: .68rem;
    font-weight: 700;
    letter-spacing: .16em;
    text-transform: uppercase;
    color: var(--muted);
}

nav.index ol {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 2px;
    counter-reset: sec;
}

nav.index a {
    display: block;
    padding: 5px 9px 5px 8px;
    border-left: 2px solid transparent;
    color: var(--ink-2);
    text-decoration: none;
    border-radius: 0 4px 4px 0;
}

nav.index a:hover {
    background: var(--surface-2);
    color: var(--ink);
}

nav.index a.here {
    border-left-color: var(--accent);
    background: var(--accent-soft);
    color: var(--ink);
    font-weight: 600;
}

nav.index a:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 1px;
}

/* ---- torzs ---- */

main { min-width: 0; }

main > * { max-width: 68ch; }

h2 {
    margin: 54px 0 4px;
    padding-top: 14px;
    border-top: 1px solid var(--rule);
    font-family: var(--serif);
    font-weight: 600;
    font-size: clamp(1.45rem, 3.2vw, 1.85rem);
    line-height: 1.18;
    letter-spacing: -.008em;
    scroll-margin-top: 18px;
    text-wrap: balance;
}

main > h2:first-child { margin-top: 22px; }

h3 {
    margin: 32px 0 2px;
    font-family: var(--sans);
    font-weight: 700;
    font-size: 1.06rem;
    letter-spacing: .002em;
    color: var(--ink);
    scroll-margin-top: 18px;
}

p, ul, ol { margin: 12px 0; }

li { margin: 5px 0; }

li > ul, li > ol { margin: 4px 0; }

a { color: var(--accent); text-underline-offset: 3px; }

strong { font-weight: 700; }

em { font-style: italic; }

hr {
    max-width: none;
    margin: 46px 0;
    border: 0;
    border-top: 1px solid var(--rule);
}

/* idezet: a sztori igazi mondatai - ez a doksi legszemelyesebb resze */
blockquote {
    margin: 18px 0;
    padding: 2px 0 2px 20px;
    border-left: 3px solid var(--accent);
    font-family: var(--serif);
    font-size: 1.14rem;
    font-style: italic;
    line-height: 1.5;
    color: var(--ink);
}

blockquote p { margin: 6px 0; }

code {
    font-family: var(--mono);
    font-size: .855em;
    padding: .12em .34em;
    background: var(--surface-2);
    border-radius: 3px;
    overflow-wrap: break-word;
}

pre {
    max-width: none;
    margin: 16px 0;
    padding: 14px 16px;
    background: var(--surface-2);
    border: 1px solid var(--rule);
    border-radius: 6px;
    overflow-x: auto;
    font-size: .84rem;
    line-height: 1.55;
}

pre code {
    padding: 0;
    background: none;
    font-size: 1em;
}

/* tablazat: sajat vizszintes gorgeteseben, hogy a lap ne csusszon oldalra */
.tablewrap {
    max-width: none;
    margin: 18px 0;
    overflow-x: auto;
    border: 1px solid var(--rule);
    border-radius: 6px;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: .92rem;
}

th, td {
    padding: 9px 14px;
    text-align: left;
    vertical-align: top;
    border-bottom: 1px solid var(--rule);
}

thead th {
    background: var(--surface-2);
    font-size: .7rem;
    font-weight: 700;
    letter-spacing: .11em;
    text-transform: uppercase;
    color: var(--muted);
    white-space: nowrap;
}

tbody tr:last-child td { border-bottom: 0; }

td:first-child { font-variant-numeric: tabular-nums; }

/* ---- kiemelt szakaszok: a jelzest a tartalom indokolja, nem dekoracio ---- */

/* "Amit NE csinalj" es a blokkolo lepesek */
main h2.flagged {
    border-top-color: var(--flag);
    color: var(--flag);
}

.callout {
    max-width: 68ch;
    margin: 20px 0;
    padding: 14px 18px;
    border-left: 3px solid var(--flag);
    background: var(--flag-soft);
    border-radius: 0 6px 6px 0;
}

.callout p { margin: 0; }

.callout .label {
    display: block;
    margin-bottom: 4px;
    font-family: var(--mono);
    font-size: .7rem;
    font-weight: 600;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--flag);
}

footer {
    max-width: 68ch;
    margin-top: 60px;
    padding-top: 18px;
    border-top: 1px solid var(--rule);
    font-family: var(--mono);
    font-size: .74rem;
    color: var(--muted);
}

@media (max-width: 900px) {
    .wrap {
        grid-template-columns: minmax(0, 1fr);
        gap: 0;
    }

    nav.index {
        position: static;
        margin: 0 0 8px;
        padding-bottom: 14px;
        border-bottom: 1px solid var(--rule);
    }

    nav.index ol {
        display: flex;
        gap: 4px;
        overflow-x: auto;
        scrollbar-width: none;
    }

    nav.index ol::-webkit-scrollbar { display: none; }

    nav.index a {
        white-space: nowrap;
        border-left: 0;
        border-bottom: 2px solid transparent;
        border-radius: 4px 4px 0 0;
        padding: 5px 10px;
    }

    nav.index a.here {
        border-left: 0;
        border-bottom-color: var(--accent);
    }
}

@media (prefers-reduced-motion: reduce) {
    * { scroll-behavior: auto !important; }
}

html { scroll-behavior: smooth; }
</style>

<div class="wrap">
    <header class="masthead">
        <p class="kicker">Átadás · belső jegyzet</p>
        <h1>Emma-projekt</h1>
        <p class="standfirst">Minden, ami egy új AI-nak kell a folytatáshoz: a teljes sztori, a két
        megépített dolog, mi van blokkolva, és mit ne csináljon.</p>
        <div class="stamp">
            <span>repo <b>zsigisti/sharpemu</b></span>
            <span>branch <b>claude/emma-story-summary-73cqoa</b></span>
            <span>határidő <b>szeptember 16.</b></span>
        </div>
    </header>

    <nav class="index" aria-label="Szakaszok">
        <p>Szakaszok</p>
        <ol id="toc">
            ${toc}
        </ol>
    </nav>

    <main id="doc">
${docHtml}
    </main>
</div>

<footer class="wrap" style="padding-top:0;display:block">
    A forrás <code>emma-birthday/HANDOFF.md</code>. Ha azt szerkesztik,
    a <code>node build-handoff-artifact.mjs</code> újragenerálja ezt a lapot.
</footer>

<script>
/* A lap statikus; ez itt csak annyit tesz, hogy az oldalso index kiemeli,
 * melyik szakaszban vagy. Nelkule is minden olvashato. */
(function () {
    "use strict";
    var links = Array.prototype.slice.call(document.querySelectorAll("#toc a"));
    var heads = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });

    function mark() {
        var best = 0;
        for (var i = 0; i < heads.length; i++) {
            if (heads[i] && heads[i].getBoundingClientRect().top <= 90) best = i;
        }
        links.forEach(function (a, i) { a.classList.toggle("here", i === best); });
    }

    mark();
    window.addEventListener("scroll", mark, { passive: true });
    window.addEventListener("resize", mark);
})();
</script>
`;

writeFileSync(OUT, page, "utf8");
console.log("handoff.html kesz: " + (Buffer.byteLength(page) / 1024).toFixed(0) + " kB");
