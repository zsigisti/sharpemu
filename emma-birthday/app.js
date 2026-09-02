/* Copyright (C) 2026 SharpEmu Emulator Project
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* Az ajandek logikaja. A szoveget NE itt szerkeszd, hanem a content.js-ben. */
(function () {
    "use strict";

    var MEM = window.MEMORIES || [];
    var COPY = window.COPY || {};
    var PLACE = window.PLACE || {};
    var STORE = "emma-birthday-v1";

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var el = {
        stage: document.getElementById("stage"),
        place: document.getElementById("place"),
        ui: document.getElementById("ui"),
        greeting: document.getElementById("greeting"),
        sub: document.getElementById("sub"),
        placeName: document.getElementById("place-name"),
        cake: document.getElementById("cake"),
        candles: document.getElementById("candles"),
        hint: document.getElementById("hint"),
        timeline: document.getElementById("timeline"),
        rail: document.getElementById("rail"),
        look: document.getElementById("look"),
        cardWrap: document.getElementById("card-wrap"),
        card: document.getElementById("card"),
        cardDate: document.getElementById("card-date"),
        cardTitle: document.getElementById("card-title"),
        cardBody: document.getElementById("card-body"),
        cardQuote: document.getElementById("card-quote"),
        cardClose: document.getElementById("card-close"),
        finale: document.getElementById("finale"),
        finaleTitle: document.getElementById("finale-title"),
        finaleBody: document.getElementById("finale-body"),
        finaleSig: document.getElementById("finale-sig"),
        again: document.getElementById("again"),
        confetti: document.getElementById("confetti")
    };

    var opened = load();
    var blownOut = false;
    var stops = [];
    var lastFocus = null;

    function load() {
        try {
            var raw = localStorage.getItem(STORE);
            var d = raw ? JSON.parse(raw) : null;
            if (d && Array.isArray(d.opened)) return d.opened.slice(0, MEM.length);
        } catch (e) { /* privat mod - egyszeruen ujra kezdi */ }
        return [];
    }

    function save() {
        try { localStorage.setItem(STORE, JSON.stringify({ opened: opened })); } catch (e) { }
    }

    /* ================================================================ */
    /* Szoveg beirasa a lapba                                            */
    /* ================================================================ */
    function fillCopy() {
        el.greeting.textContent = COPY.greeting || "";
        el.sub.textContent = COPY.subtitle || "";
        el.finaleTitle.textContent = COPY.finaleTitle || "";
        el.finaleSig.textContent = COPY.signature || "";
        (COPY.finaleLines || []).forEach(function (line) {
            var p = document.createElement("p");
            p.textContent = line;
            el.finaleBody.appendChild(p);
        });
        el.cardClose.textContent = "Bezárom";
        el.again.textContent = "Nézd meg újra";

        if (PLACE.name) {
            var span = document.createElement("span");
            span.textContent = PLACE.name;
            el.placeName.appendChild(span);
            if (PLACE.link) {
                var sep = document.createElement("span");
                sep.textContent = "·";
                sep.style.opacity = ".5";
                var a = document.createElement("a");
                a.href = PLACE.link;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.textContent = COPY.mapsLabel || "Maps";
                el.placeName.appendChild(sep);
                el.placeName.appendChild(a);
            }
        }
    }

    /* ================================================================ */
    /* Idoszalag                                                         */
    /* ================================================================ */
    function buildTimeline() {
        MEM.forEach(function (m, i) {
            var b = document.createElement("button");
            b.className = "stop";
            b.type = "button";
            b.setAttribute("aria-label", (m.date || m.when) + " — " + m.title);

            var dot = document.createElement("span");
            dot.className = "dot";
            var when = document.createElement("span");
            when.className = "when";
            when.textContent = m.when || "";

            b.appendChild(dot);
            b.appendChild(when);
            b.addEventListener("click", function () { openCard(i); });
            el.timeline.appendChild(b);
            stops.push(b);
        });

        var fin = document.createElement("button");
        fin.className = "stop finish";
        fin.type = "button";
        fin.id = "finish";
        fin.disabled = true;
        var fdot = document.createElement("span");
        fdot.className = "dot";
        var fwhen = document.createElement("span");
        fwhen.className = "when";
        fwhen.textContent = COPY.subtitle || "szeptember 16.";
        fin.appendChild(fdot);
        fin.appendChild(fwhen);
        el.timeline.appendChild(fin);
        el.finish = fin;

        bindBlow(fin);
        bindBlow(el.cake);
    }

    /* ================================================================ */
    /* Kartya                                                            */
    /* ================================================================ */
    function openCard(i) {
        var m = MEM[i];
        if (!m) return;

        lastFocus = document.activeElement;
        el.cardDate.textContent = m.date || "";
        el.cardTitle.textContent = m.title || "";
        el.cardBody.textContent = m.body || "";

        el.cardQuote.innerHTML = "";
        if (m.quote) {
            el.cardQuote.hidden = false;
            el.cardQuote.appendChild(document.createTextNode("„" + m.quote + "”"));
            var cite = document.createElement("cite");
            cite.textContent = m.who === "zsiga" ? "Zsiga" : "Emma";
            el.cardQuote.appendChild(cite);
        } else {
            el.cardQuote.hidden = true;
        }

        el.cardWrap.classList.add("show");
        el.card.scrollTop = 0;
        el.cardClose.focus();

        if (opened.indexOf(i) === -1) {
            opened.push(i);
            save();
            paint();
        }
    }

    function closeCard() {
        el.cardWrap.classList.remove("show");
        if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    /* ================================================================ */
    /* Allapot kirajzolasa                                               */
    /* ================================================================ */
    function paint() {
        var n = opened.length;
        var total = MEM.length;

        stops.forEach(function (b, i) {
            b.classList.toggle("open", opened.indexOf(i) !== -1);
        });

        /* A sin a megnyitott emlekek SZAMA szerint vilagit: igy mindig monoton,
         * akarmilyen sorrendben nyitja ki oket. A 100% a zaro megallo. */
        var fill = n >= total ? 100 : (n / (total + 1)) * 100;
        el.rail.style.setProperty("--fill", fill.toFixed(1) + "%");

        /* gyertyak */
        for (var c = 0; c < total; c++) {
            var cd = el.candles.children[c];
            if (cd) cd.classList.toggle("on", c < n && !blownOut);
        }
        el.cake.style.setProperty("--lit", String(blownOut ? 0 : n));

        var done = n >= total;
        var justReady = done && !blownOut && el.finish.disabled;
        el.finish.disabled = !done || blownOut;
        el.finish.classList.toggle("ready", done && !blownOut);
        if (done && !blownOut) {
            el.finish.setAttribute("aria-label", COPY.blowLabel || "Fújd el a gyertyákat");
            /* telefonon az idoszalag oldalra gorog, es a zaro megallo kilog */
            if (justReady && el.finish.scrollIntoView) {
                el.finish.scrollIntoView({ inline: "end", block: "nearest", behavior: reduce ? "auto" : "smooth" });
            }
        }

        el.hint.textContent = blownOut ? "" :
            done ? (COPY.hintDone || "") :
                n === 0 ? (COPY.hintStart || "") : (COPY.hintMid || "");
    }

    /* ================================================================ */
    /* A gyertyak elfujasa: nyomd es tartsd                              */
    /* ================================================================ */
    function bindBlow(node) {
        var timer = null;

        function start(ev) {
            if (blownOut || opened.length < MEM.length) return;
            if (ev.type === "keydown" && ev.code !== "Space" && ev.code !== "Enter") return;
            if (ev.cancelable) ev.preventDefault();
            if (timer) return;
            el.cake.classList.add("blowing");
            el.hint.textContent = COPY.hintBlow || "";
            timer = setTimeout(function () {
                timer = null;
                blowOut();
            }, reduce ? 200 : 950);
        }

        function stop() {
            if (timer) { clearTimeout(timer); timer = null; }
            if (!blownOut) {
                el.cake.classList.remove("blowing");
                paint();
            }
        }

        node.addEventListener("pointerdown", start);
        node.addEventListener("keydown", start);
        node.addEventListener("pointerup", stop);
        node.addEventListener("pointercancel", stop);
        node.addEventListener("pointerleave", stop);
        node.addEventListener("keyup", stop);
    }

    function blowOut() {
        blownOut = true;
        el.cake.classList.remove("blowing");
        el.cake.classList.add("out");
        paint();
        if (!reduce) confetti();
        setTimeout(function () {
            el.finale.classList.add("show");
            el.again.focus();
        }, reduce ? 200 : 1100);
    }

    function replay() {
        opened = [];
        blownOut = false;
        save();
        el.cake.classList.remove("out", "blowing");
        el.finale.classList.remove("show");
        paint();
    }

    /* ================================================================ */
    /* Konfetti                                                          */
    /* ================================================================ */
    function confetti() {
        var cv = el.confetti;
        var ctx = cv.getContext("2d");
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        var w, h;

        function size() {
            w = cv.clientWidth; h = cv.clientHeight;
            cv.width = w * dpr; cv.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        size();

        var colors = ["#a98ad6", "#cbb8e8", "#ffcf6b", "#ff9d4d", "#f7f2ea"];
        var bits = [];
        for (var i = 0; i < 110; i++) {
            bits.push({
                x: Math.random() * w,
                y: -20 - Math.random() * h * 0.7,
                w: 5 + Math.random() * 6,
                h: 8 + Math.random() * 10,
                vy: 70 + Math.random() * 130,
                vx: (Math.random() - 0.5) * 50,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * 5,
                c: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        var t0 = performance.now(), last = t0;
        (function frame(now) {
            var dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            ctx.clearRect(0, 0, w, h);
            var alive = false;
            bits.forEach(function (b) {
                b.y += b.vy * dt;
                b.x += b.vx * dt;
                b.rot += b.vr * dt;
                if (b.y < h + 30) alive = true;
                ctx.save();
                ctx.translate(b.x, b.y);
                ctx.rotate(b.rot);
                ctx.fillStyle = b.c;
                ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
                ctx.restore();
            });
            if (alive && now - t0 < 9000) requestAnimationFrame(frame);
            else ctx.clearRect(0, 0, w, h);
        })(t0);

        window.addEventListener("resize", size);
    }

    /* ================================================================ */
    /* A HELY: rajzolt alkonyati jelenet, korbenezheto                   */
    /* ================================================================ */
    function scene() {
        var cv = el.place;
        var ctx = cv.getContext("2d");
        var dpr = Math.min(2, window.devicePixelRatio || 1);
        var w = 0, h = 0;
        var pan = 0.5;          /* 0..1 - hol tartunk a panoramaban */
        var vel = 0;
        var wide = 2.4;         /* a jelenet ennyivel szelesebb a kepernyonel */
        var t = 0;

        function size() {
            w = cv.clientWidth; h = cv.clientHeight;
            cv.width = Math.max(1, w * dpr);
            cv.height = Math.max(1, h * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        size();
        window.addEventListener("resize", size);

        function rnd(n) {
            var x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
            return x - Math.floor(x);
        }

        /* --- korbenezes: huzas, nyilak --- */
        var drag = null;
        cv.style.touchAction = "pan-y";
        cv.addEventListener("pointerdown", function (e) {
            drag = { x: e.clientX, pan: pan };
            cv.setPointerCapture(e.pointerId);
        });
        cv.addEventListener("pointermove", function (e) {
            if (!drag) return;
            var span = w * (wide - 1);
            pan = Math.max(0, Math.min(1, drag.pan - (e.clientX - drag.x) / span));
        });
        function endDrag() { drag = null; }
        cv.addEventListener("pointerup", endDrag);
        cv.addEventListener("pointercancel", endDrag);

        window.addEventListener("keydown", function (e) {
            if (el.cardWrap.classList.contains("show")) return;
            if (e.code === "ArrowLeft") { vel = -0.5; }
            if (e.code === "ArrowRight") { vel = 0.5; }
        });
        window.addEventListener("keyup", function (e) {
            if (e.code === "ArrowLeft" || e.code === "ArrowRight") vel = 0;
        });

        function pine(x, ground, s, near) {
            ctx.fillStyle = near ? "#141a26" : "#1d2436";
            ctx.fillRect(x - 2 * s, ground - 16 * s, 4 * s, 16 * s);
            for (var k = 0; k < 4; k++) {
                var top = ground - (54 - k * 5) * s;
                var half = (17 - k * 3.2) * s;
                var base = ground - (16 + k * 11) * s;
                ctx.beginPath();
                ctx.moveTo(x, top);
                ctx.lineTo(x - half, base);
                ctx.lineTo(x + half, base);
                ctx.closePath();
                ctx.fill();
            }
        }

        function draw() {
            var span = w * (wide - 1);
            var off = -pan * span;
            var horizon = h * 0.66;

            /* eg */
            var sky = ctx.createLinearGradient(0, 0, 0, horizon + 40);
            sky.addColorStop(0, "#141a2e");
            sky.addColorStop(0.52, "#2b3450");
            sky.addColorStop(0.84, "#5b5170");
            sky.addColorStop(1, "#a4756e");
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, w, horizon + 40);

            /* csillagok */
            for (var i = 0; i < 90; i++) {
                var sx = (rnd(i) * w * wide + off * 0.35);
                sx = ((sx % (w * wide)) + w * wide) % (w * wide);
                if (sx > w + 4) continue;
                var sy = rnd(i + 200) * horizon * 0.62;
                var tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.8 + i));
                ctx.globalAlpha = tw * (1 - sy / (horizon * 0.9));
                ctx.fillStyle = "#f2ecff";
                ctx.fillRect(sx, sy, 1.6, 1.6);
            }
            ctx.globalAlpha = 1;

            /* hold */
            var mx = w * 0.78 + off * 0.2;
            var my = Math.min(horizon * 0.22, 118);
            var glow = ctx.createRadialGradient(mx, my, 3, mx, my, 66);
            glow.addColorStop(0, "rgba(247,242,234,.34)");
            glow.addColorStop(1, "rgba(247,242,234,0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(mx, my, 66, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#f7f2ea";
            ctx.beginPath();
            ctx.arc(mx, my, 12, 0, Math.PI * 2);
            ctx.fill();

            /* tavoli gerinc */
            [[0.34, "#4a4763", horizon - 30], [0.62, "#33334c", horizon - 8]].forEach(function (layer, li) {
                var par = layer[0], col = layer[1], base = layer[2];
                ctx.fillStyle = col;
                ctx.beginPath();
                ctx.moveTo(-40, base + 60);
                for (var px = -40; px <= w + 40; px += 22) {
                    var u = (px - off * par) / 210 + li * 7;
                    var peak = base - (46 + rnd(Math.floor(u)) * 96) * (1 - li * 0.32)
                        - Math.sin(u * 1.3) * 16;
                    ctx.lineTo(px, peak);
                }
                ctx.lineTo(w + 40, base + 60);
                ctx.closePath();
                ctx.fill();
            });

            /* fenyoerdo - ket melyseg */
            for (var d = 0; d < 2; d++) {
                var par = d ? 0.95 : 0.78;
                var ground = horizon + (d ? 26 : 6);
                var stepX = d ? 58 : 74;
                var first = Math.floor((-off * par - 80) / stepX);
                var count = Math.ceil(w / stepX) + 4;
                for (var p = 0; p < count; p++) {
                    var idx = first + p;
                    var x = idx * stepX + off * par + rnd(idx + d * 50) * 26;
                    if (x < -60 || x > w + 60) continue;
                    pine(x, ground + rnd(idx + 9) * 8, (d ? 1.15 : 0.8) + rnd(idx + 3) * 0.3, !!d);
                }
            }

            /* talaj */
            var gnd = ctx.createLinearGradient(0, horizon + 10, 0, h);
            gnd.addColorStop(0, "#1a2130");
            gnd.addColorStop(1, "#10141f");
            ctx.fillStyle = gnd;
            ctx.fillRect(0, horizon + 14, w, h - horizon);

            /* A SZEK - ahol kezet fogtatok. Ez az egy targy a jelenetben. */
            var bx = w * 0.5 + off * 1.0 + span * 0.5;
            if (bx > -140 && bx < w + 140) {
                var by = h * 0.9;
                ctx.fillStyle = "#0c0f18";
                ctx.beginPath();
                ctx.ellipse(bx + 34, by + 6, 62, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "#161c28";
                ctx.fillRect(bx - 30, by - 16, 128, 7);        /* ules */
                ctx.fillRect(bx - 30, by - 44, 128, 5);        /* hattamla */
                ctx.fillRect(bx - 30, by - 32, 128, 4);
                ctx.fillRect(bx - 28, by - 46, 5, 32);         /* tamasztek */
                ctx.fillRect(bx + 91, by - 46, 5, 32);
                ctx.fillRect(bx - 24, by - 10, 5, 22);         /* labak */
                ctx.fillRect(bx + 87, by - 10, 5, 22);
            }

            /* szentjanosbogarak */
            for (var f = 0; f < 16; f++) {
                var fx = ((rnd(f + 400) * w * wide + off * 1.05 + Math.sin(t * 0.5 + f) * 28) % (w * wide) + w * wide) % (w * wide);
                if (fx > w + 10) continue;
                var fy = horizon + 30 + rnd(f + 500) * (h - horizon - 50) + Math.sin(t * 0.9 + f * 2) * 14;
                var a = 0.25 + 0.75 * Math.abs(Math.sin(t * 1.4 + f));
                ctx.globalAlpha = a * 0.8;
                ctx.fillStyle = "#ffcf6b";
                ctx.beginPath();
                ctx.arc(fx, fy, 1.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        var last = performance.now();
        (function loop(now) {
            var dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            if (!reduce) t += dt;
            if (vel) pan = Math.max(0, Math.min(1, pan + vel * dt * 0.55));
            draw();
            requestAnimationFrame(loop);
        })(last);
    }

    /* ================================================================ */
    /* A 360-as korbenezes (ha van hozza URL es a bongeszo engedi)        */
    /* ================================================================ */
    function tryEmbed() {
        if (!PLACE.embed) return;
        var f = document.createElement("iframe");
        f.id = "embed";
        f.title = PLACE.name || "a hely";
        f.loading = "eager";
        f.referrerPolicy = "no-referrer-when-downgrade";
        f.allow = "fullscreen";
        f.src = PLACE.embed;

        var ok = false;
        f.addEventListener("load", function () { ok = true; });
        el.stage.insertBefore(f, el.stage.firstChild.nextSibling);

        /* Ha 3 masodperc alatt nem tolt be (pl. az artifact biztonsagi
         * szabalya blokkolja), levesszuk es marad a rajzolt jelenet. */
        setTimeout(function () {
            if (ok) {
                el.look.textContent = "Húzd, hogy körülnézz a helyen.";
                return;
            }
            if (f.parentNode) f.parentNode.removeChild(f);
            el.look.textContent = COPY.embedFallback || "";
        }, 3000);
    }

    /* ================================================================ */
    /* Indulas                                                           */
    /* ================================================================ */
    fillCopy();
    buildTimeline();
    for (var i = 0; i < MEM.length; i++) {
        var span = document.createElement("span");
        span.className = "candle";
        el.candles.appendChild(span);
    }
    paint();
    scene();
    tryEmbed();

    el.look.textContent = PLACE.embed ? "Betöltés…" : "Húzd (vagy ◀ ▶), hogy körülnézz.";

    el.cardClose.addEventListener("click", closeCard);
    el.cardWrap.addEventListener("click", function (e) {
        if (e.target === el.cardWrap) closeCard();
    });
    el.again.addEventListener("click", replay);
    document.addEventListener("keydown", function (e) {
        if (e.code === "Escape" && el.cardWrap.classList.contains("show")) closeCard();
    });
})();
