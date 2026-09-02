/* Copyright (C) 2026 SharpEmu Emulator Project
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
/* Az Emma Sztori - motor.
 * Canvas, input, scene-kezeles, szovegbuborek, mentes, hangok.
 */
(function (global) {
    "use strict";

    var W = 960, H = 540;

    /* ------------------------------------------------------------------ */
    /* Hang: pici WebAudio szintetizator, nem kell hangfajl               */
    /* ------------------------------------------------------------------ */
    var Sfx = {
        ac: null,
        muted: false,
        init: function () {
            if (this.ac) return;
            try {
                var AC = global.AudioContext || global.webkitAudioContext;
                if (AC) this.ac = new AC();
            } catch (e) { this.ac = null; }
        },
        tone: function (freq, dur, type, vol) {
            if (this.muted) return;
            this.init();
            if (!this.ac) return;
            var ac = this.ac;
            if (ac.state === "suspended") ac.resume();
            var o = ac.createOscillator(), g = ac.createGain();
            o.type = type || "square";
            o.frequency.value = freq;
            g.gain.value = 0;
            g.gain.linearRampToValueAtTime(vol == null ? 0.06 : vol, ac.currentTime + 0.01);
            g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
            o.connect(g); g.connect(ac.destination);
            o.start(); o.stop(ac.currentTime + dur + 0.02);
        },
        blip: function () { this.tone(520 + Math.random() * 90, 0.035, "square", 0.025); },
        pick: function () { this.tone(880, 0.09, "triangle", 0.07); setTimeout(function () { Sfx.tone(1320, 0.1, "triangle", 0.05); }, 60); },
        heart: function () { this.tone(660, 0.1, "sine", 0.09); setTimeout(function () { Sfx.tone(990, 0.14, "sine", 0.07); }, 80); },
        bad: function () { this.tone(180, 0.16, "sawtooth", 0.05); },
        step: function () { this.tone(150 + Math.random() * 40, 0.03, "sine", 0.03); },
        win: function () {
            [523, 659, 784, 1046].forEach(function (f, i) {
                setTimeout(function () { Sfx.tone(f, 0.18, "triangle", 0.07); }, i * 110);
            });
        }
    };

    /* ------------------------------------------------------------------ */
    /* Rajzolo segedek                                                    */
    /* ------------------------------------------------------------------ */
    function rrect(ctx, x, y, w, h, r) {
        r = Math.min(r, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    function wrap(ctx, text, maxW) {
        var words = String(text).split(" ");
        var lines = [], cur = "";
        for (var i = 0; i < words.length; i++) {
            var test = cur ? cur + " " + words[i] : words[i];
            if (ctx.measureText(test).width > maxW && cur) {
                lines.push(cur);
                cur = words[i];
            } else cur = test;
        }
        if (cur) lines.push(cur);
        return lines;
    }

    function text(ctx, str, x, y, opt) {
        opt = opt || {};
        ctx.save();
        ctx.font = opt.font || "20px Nunito, sans-serif";
        ctx.textAlign = opt.align || "left";
        ctx.textBaseline = opt.baseline || "alphabetic";
        if (opt.shadow) {
            ctx.fillStyle = opt.shadow;
            ctx.fillText(str, x + 2, y + 2);
        }
        ctx.fillStyle = opt.color || "#2a1f33";
        ctx.fillText(str, x, y);
        ctx.restore();
    }

    /* ------------------------------------------------------------------ */
    /* Szereplo nevek / szinek                                            */
    /* ------------------------------------------------------------------ */
    var CAST = {
        zsiga: { name: "Zsiga", color: "#c8443f" },
        emma: { name: "Emma", color: "#8467b3" },
        zoe: { name: "Zoe", color: "#3a8a7e" },
        csabi: { name: "Csabi", color: "#44619b" },
        marci: { name: "Marci", color: "#5c9b60" },
        toni: { name: "Toni", color: "#b8813a" },
        balint: { name: "Bálint", color: "#6a6f79" },
        narr: { name: "", color: "#5b4a6b" }
    };

    /* ------------------------------------------------------------------ */
    /* Dialogus                                                           */
    /* ------------------------------------------------------------------ */
    var Dialog = {
        active: false,
        lines: [],
        i: 0,
        shown: 0,
        onEnd: null,
        choice: null,
        sel: 0,
        boxY: 0,
        speed: 48,

        start: function (lines, onEnd) {
            this.lines = (lines || []).slice();
            this.i = 0;
            this.shown = 0;
            this.onEnd = onEnd || null;
            this.choice = null;
            this.sel = 0;
            this.active = this.lines.length > 0;
            if (!this.active && onEnd) onEnd();
        },

        current: function () { return this.lines[this.i]; },

        full: function () {
            var l = this.current();
            return !l || !l.text || this.shown >= l.text.length;
        },

        update: function (dt) {
            if (!this.active) return;
            var l = this.current();
            if (!l) { this.finish(); return; }

            if (l.choice && !this.choice) {
                this.choice = l.choice;
                this.sel = 0;
            }

            if (this.choice) {
                if (G.hit("ArrowUp") || G.hit("KeyW")) { this.sel = (this.sel + this.choice.options.length - 1) % this.choice.options.length; Sfx.blip(); }
                if (G.hit("ArrowDown") || G.hit("KeyS")) { this.sel = (this.sel + 1) % this.choice.options.length; Sfx.blip(); }
                if (G.hit("Space") || G.hit("KeyE") || G.hit("Enter") || G.hit("Click")) this.pickChoice();
                return;
            }

            if (l.text && this.shown < l.text.length) {
                var prev = Math.floor(this.shown);
                this.shown += this.speed * dt;
                if (Math.floor(this.shown) > prev && Math.floor(this.shown) % 3 === 0) Sfx.blip();
                if (this.shown > l.text.length) this.shown = l.text.length;
            }

            if (G.hit("Space") || G.hit("KeyE") || G.hit("Enter") || G.hit("Click")) {
                if (!this.full()) this.shown = l.text.length;
                else this.next();
            }
        },

        pickChoice: function () {
            var opt = this.choice.options[this.sel];
            G.state.hearts += (opt.good || 0);
            if (opt.good >= 2) Sfx.heart(); else Sfx.bad();
            var rest = this.lines.slice(this.i + 1);
            this.lines = (opt.reply || []).concat(rest);
            this.i = 0;
            this.shown = 0;
            this.choice = null;
            if (!this.lines.length) this.finish();
        },

        next: function () {
            this.i++;
            this.shown = 0;
            if (this.i >= this.lines.length) this.finish();
        },

        finish: function () {
            this.active = false;
            var cb = this.onEnd;
            this.onEnd = null;
            if (cb) cb();
        },

        draw: function (ctx) {
            if (!this.active) return;
            var l = this.current();
            if (!l) return;

            var boxH = 148;
            var y = H - boxH - 18;
            var x = 26, w = W - 52;

            /* valasztas panel */
            if (this.choice) {
                var opts = this.choice.options;
                var ph = 46 * opts.length + 62;
                var py = y - ph - 12;
                ctx.save();
                ctx.fillStyle = "rgba(20,14,26,.88)";
                rrect(ctx, x, py, w, ph, 16);
                ctx.fill();
                ctx.strokeStyle = "rgba(232,98,140,.7)";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();

                text(ctx, this.choice.q, x + 24, py + 34, { font: "bold 19px Nunito, sans-serif", color: "#ffd9e4" });
                for (var i = 0; i < opts.length; i++) {
                    var oy = py + 56 + i * 46;
                    var on = i === this.sel;
                    ctx.save();
                    ctx.fillStyle = on ? "rgba(232,98,140,.30)" : "rgba(255,255,255,.05)";
                    rrect(ctx, x + 18, oy, w - 36, 38, 10);
                    ctx.fill();
                    ctx.restore();
                    text(ctx, (on ? "▸ " : "  ") + opts[i].text, x + 34, oy + 26,
                        { font: (on ? "bold " : "") + "18px Nunito, sans-serif", color: on ? "#fff8fb" : "#c9bcd4" });
                }
                this.drawHint(ctx, "↑↓ választ  •  SPACE / OK rábök");
                return;
            }

            /* szovegbuborek */
            var narr = l.who === "narr";
            ctx.save();
            ctx.fillStyle = narr ? "rgba(18,12,24,.94)" : "rgba(253,244,247,.97)";
            rrect(ctx, x, y, w, boxH, 18);
            ctx.fill();
            ctx.strokeStyle = narr ? "rgba(180,160,200,.45)" : "rgba(232,98,140,.65)";
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.restore();

            var tx = x + 30;
            var cast = CAST[l.who] || CAST.narr;

            if (!narr) {
                var ps = 92;
                Art.portrait(ctx, l.who, x + 18, y + boxH / 2 - ps / 2, ps, G.t);
                ctx.save();
                ctx.strokeStyle = cast.color;
                ctx.lineWidth = 3;
                rrect(ctx, x + 18, y + boxH / 2 - ps / 2, ps, ps, 12);
                ctx.stroke();
                ctx.restore();
                tx = x + 18 + ps + 24;
                text(ctx, cast.name, tx, y + 34, { font: "bold 20px Nunito, sans-serif", color: cast.color });
            }

            var shownText = l.text ? l.text.slice(0, Math.floor(this.shown)) : "";
            ctx.save();
            ctx.font = narr ? "italic 20px Nunito, sans-serif" : "20px Nunito, sans-serif";
            var maxW = W - 52 - (tx - x) - 30;
            var lines = wrap(ctx, shownText, maxW);
            ctx.restore();

            var ty = narr ? y + 44 : y + 66;
            for (var k = 0; k < lines.length && k < 4; k++) {
                text(ctx, lines[k], tx, ty + k * 27, {
                    font: narr ? "italic 20px Nunito, sans-serif" : "20px Nunito, sans-serif",
                    color: narr ? "#ded2ea" : "#2a1f33"
                });
            }

            if (this.full()) {
                var bob = Math.sin(G.t * 6) * 3;
                text(ctx, "▾", W - 54, y + boxH - 18 + bob, {
                    font: "20px Nunito, sans-serif", color: narr ? "#e8628c" : "#b83c66"
                });
            }
        },

        drawHint: function (ctx, s) {
            text(ctx, s, W / 2, H - 14, { font: "13px Nunito, sans-serif", color: "rgba(255,255,255,.5)", align: "center" });
        }
    };

    /* ------------------------------------------------------------------ */
    /* Motor                                                              */
    /* ------------------------------------------------------------------ */
    var G = {
        W: W, H: H,
        canvas: null,
        ctx: null,
        t: 0,
        scene: null,
        keys: {},
        hits: {},
        Sfx: Sfx,
        Dialog: Dialog,
        CAST: CAST,
        rrect: rrect,
        wrap: wrap,
        text: text,

        state: {
            chapter: 0,
            hearts: 0,
            memories: 0,
            unlocked: 1,
            found: {}
        },

        /* --- mentes --- */
        save: function () {
            try {
                localStorage.setItem("emma-story", JSON.stringify({
                    hearts: this.state.hearts,
                    memories: this.state.memories,
                    unlocked: this.state.unlocked,
                    found: this.state.found
                }));
            } catch (e) { /* privat mod, nem baj */ }
        },
        load: function () {
            try {
                var raw = localStorage.getItem("emma-story");
                if (!raw) return;
                var d = JSON.parse(raw);
                if (d && typeof d === "object") {
                    this.state.hearts = d.hearts || 0;
                    this.state.memories = d.memories || 0;
                    this.state.unlocked = Math.max(1, Math.min(6, d.unlocked || 1));
                    this.state.found = d.found || {};
                }
            } catch (e) { /* sercli mentes, ujrakezdjuk */ }
        },
        reset: function () {
            this.state.hearts = 0;
            this.state.memories = 0;
            this.state.unlocked = 1;
            this.state.found = {};
            this.save();
        },

        /* --- input --- */
        down: function (k) { return !!this.keys[k]; },
        hit: function (k) { return !!this.hits[k]; },

        /* --- scene --- */
        go: function (scene) {
            this.pending = scene;
        },

        /* --- fade atmenet --- */
        fadeT: 0,
        fadeDir: 0,
        fadeCb: null,
        transition: function (cb) {
            if (this.fadeDir) return;
            this.fadeDir = 1;
            this.fadeCb = cb;
        },

        boot: function (first) {
            var c = document.getElementById("game");
            this.canvas = c;
            this.ctx = c.getContext("2d");
            this.ctx.imageSmoothingEnabled = false;
            this.load();
            bindInput(c);
            this.go(first);
            var last = performance.now();
            var self = this;
            function frame(now) {
                var dt = Math.min(0.05, (now - last) / 1000);
                last = now;
                self.tick(dt);
                requestAnimationFrame(frame);
            }
            requestAnimationFrame(frame);
        },

        tick: function (dt) {
            this.t += dt;

            if (this.pending && !this.fadeDir) {
                if (this.scene && this.scene.exit) this.scene.exit();
                this.scene = this.pending;
                this.pending = null;
                if (this.scene.enter) this.scene.enter();
            }

            /* fade logika */
            if (this.fadeDir === 1) {
                this.fadeT += dt * 3.2;
                if (this.fadeT >= 1) {
                    this.fadeT = 1;
                    this.fadeDir = -1;
                    var cb = this.fadeCb;
                    this.fadeCb = null;
                    if (cb) cb();
                    if (this.pending) {
                        if (this.scene && this.scene.exit) this.scene.exit();
                        this.scene = this.pending;
                        this.pending = null;
                        if (this.scene.enter) this.scene.enter();
                    }
                }
            } else if (this.fadeDir === -1) {
                this.fadeT -= dt * 3.2;
                if (this.fadeT <= 0) { this.fadeT = 0; this.fadeDir = 0; }
            }

            var ctx = this.ctx;
            if (this.scene) {
                if (this.scene.update) this.scene.update(dt);
                ctx.save();
                if (this.scene.draw) this.scene.draw(ctx);
                ctx.restore();
            }

            if (this.fadeT > 0) {
                ctx.save();
                ctx.globalAlpha = this.fadeT;
                ctx.fillStyle = "#0f0b13";
                ctx.fillRect(0, 0, W, H);
                ctx.restore();
            }

            this.hits = {};
        }
    };

    /* ------------------------------------------------------------------ */
    /* Input bekotes                                                      */
    /* ------------------------------------------------------------------ */
    function bindInput(canvas) {
        var MAP = {
            ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1,
            KeyA: 1, KeyD: 1, KeyW: 1, KeyS: 1, KeyE: 1, KeyR: 1, KeyM: 1,
            Space: 1, Enter: 1, Escape: 1, Digit1: 1, Digit2: 1, Digit3: 1,
            Digit4: 1, Digit5: 1, Digit6: 1
        };

        global.addEventListener("keydown", function (e) {
            if (!MAP[e.code]) return;
            e.preventDefault();
            if (!G.keys[e.code]) G.hits[e.code] = true;
            G.keys[e.code] = true;
            Sfx.init();
        }, { passive: false });

        global.addEventListener("keyup", function (e) {
            if (!MAP[e.code]) return;
            e.preventDefault();
            G.keys[e.code] = false;
        }, { passive: false });

        /* kattintas / koppintas = "tovabb" */
        function tap(e) {
            e.preventDefault();
            Sfx.init();
            G.hits.Click = true;
            G.hits.Space = true;
            var r = canvas.getBoundingClientRect();
            var pt = e.touches ? e.touches[0] : e;
            if (pt) {
                G.mx = (pt.clientX - r.left) / r.width * W;
                G.my = (pt.clientY - r.top) / r.height * H;
            }
        }
        canvas.addEventListener("mousedown", tap);
        canvas.addEventListener("touchstart", tap, { passive: false });

        /* erintos gombok */
        Array.prototype.forEach.call(document.querySelectorAll(".tbtn"), function (b) {
            var code = b.getAttribute("data-key");
            function on(e) {
                e.preventDefault();
                Sfx.init();
                if (!G.keys[code]) G.hits[code] = true;
                G.keys[code] = true;
            }
            function off(e) { e.preventDefault(); G.keys[code] = false; }
            b.addEventListener("touchstart", on, { passive: false });
            b.addEventListener("touchend", off, { passive: false });
            b.addEventListener("touchcancel", off, { passive: false });
            b.addEventListener("mousedown", on);
            b.addEventListener("mouseup", off);
            b.addEventListener("mouseleave", off);
        });

        /* ha elveszik a fokusz, ne ragadjon be gomb */
        global.addEventListener("blur", function () { G.keys = {}; });
    }

    global.G = G;
})(window);
