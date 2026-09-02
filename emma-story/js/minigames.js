/* Copyright (C) 2026 SharpEmu Emulator Project
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
/* Az Emma Sztori - minijatekok.
 * Fejezetenkent egy. Mindegyik ugyanezt az interfeszt adja:
 *   { title, hint, create(finish) -> { update(dt), draw(ctx) } }
 * A finish(ok, msg) hivas zarja le; nincs game over, csak jobb vagy rosszabb kimenet.
 */
(function (global) {
    "use strict";

    var W = 960, H = 540;

    function panel(ctx, x, y, w, h, alpha) {
        ctx.save();
        ctx.fillStyle = "rgba(20,14,26," + (alpha == null ? 0.72 : alpha) + ")";
        G.rrect(ctx, x, y, w, h, 14);
        ctx.fill();
        ctx.strokeStyle = "rgba(232,98,140,.5)";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    function meter(ctx, x, y, w, h, frac, col, bg) {
        ctx.save();
        ctx.fillStyle = bg || "rgba(255,255,255,.12)";
        G.rrect(ctx, x, y, w, h, h / 2);
        ctx.fill();
        var fw = Math.max(0, Math.min(1, frac)) * w;
        if (fw > 2) {
            ctx.fillStyle = col || "#e8628c";
            G.rrect(ctx, x, y, fw, h, h / 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function timerBar(ctx, left, total) {
        meter(ctx, W / 2 - 160, 16, 320, 11, left / total, "#ffd76a");
        G.text(ctx, Math.ceil(left) + " s", W / 2, 44, { font: "bold 15px Nunito", color: "#ffe9a8", align: "center" });
    }

    /* Zaropanel: elsotetiti az egesz kepet, hogy semmi ne csusszon ala. */
    function resultPanel(ctx, ok, headline, msg) {
        ctx.save();
        ctx.fillStyle = "rgba(10,7,14,.82)";
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        panel(ctx, W / 2 - 330, H / 2 - 96, 660, 192, 0.95);
        G.text(ctx, headline, W / 2, H / 2 - 34, {
            font: "bold 30px Nunito", color: ok ? "#ffd76a" : "#c9bcd4", align: "center"
        });
        ctx.save();
        ctx.font = "18px Nunito";
        var lines = G.wrap(ctx, msg, 580);
        ctx.restore();
        for (var i = 0; i < lines.length; i++) {
            G.text(ctx, lines[i], W / 2, H / 2 + 8 + i * 26, { font: "18px Nunito", color: "#ded2ea", align: "center" });
        }
        G.text(ctx, "SPACE — tovább", W / 2, H / 2 + 74, {
            font: "14px Nunito", color: "rgba(255,255,255,.55)", align: "center"
        });
    }

    /* ================================================================= */
    /* 1. PALACSINTA EVO VERSENY                                          */
    /* ================================================================= */
    var pancake = {
        title: "PALACSINTA EVŐ VERSENY",
        hint: "Verd a SPACE-t! (mobilon a △ gomb)",
        create: function (finish) {
            var T = 12, left = T;
            var me = 0, zoe = 0;
            var chew = 0, zchew = 0;
            var over = false;
            return {
                update: function (dt) {
                    if (over) {
                        if (G.hit("Space") || G.hit("KeyE")) finish(me > zoe, me + " – " + zoe);
                        return;
                    }
                    left -= dt;
                    if (G.hit("Space") || G.hit("KeyE")) {
                        me += 0.26;
                        chew = 0.16;
                        if (Math.floor(me) > Math.floor(me - 0.26)) G.Sfx.pick();
                    }
                    zoe += dt * (1.28 + Math.sin(G.t * 2.3) * 0.22);
                    chew = Math.max(0, chew - dt);
                    zchew = (Math.sin(G.t * 9) > 0.6) ? 0.1 : 0;
                    if (left <= 0) {
                        left = 0;
                        over = true;
                        me = Math.floor(me); zoe = Math.floor(zoe);
                        if (me > zoe) G.Sfx.win(); else G.Sfx.bad();
                    }
                },
                draw: function (ctx) {
                    G.text(ctx, "TE", W * 0.28, 152, { font: "bold 22px Nunito", color: "#ffd9e4", align: "center" });
                    G.text(ctx, "ZOE", W * 0.72, 152, { font: "bold 22px Nunito", color: "#9fe6d8", align: "center" });

                    /* tanyerok */
                    [[W * 0.28, Math.floor(me), chew], [W * 0.72, Math.floor(zoe), zchew]].forEach(function (p) {
                        var cx = p[0], n = p[1];
                        ctx.save();
                        ctx.fillStyle = "#e6e0ea";
                        ctx.beginPath();
                        ctx.ellipse(cx, 418, 100, 26, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                        for (var i = 0; i < Math.min(n, 11); i++) {
                            Art.prop(ctx, "prop_pancake", cx - 46, 372 - i * 19 - p[2] * 40, 92, G.t);
                        }
                        G.text(ctx, String(n), cx, 486, { font: "bold 42px 'Press Start 2P', monospace", color: "#fff8fb", align: "center" });
                    });

                    timerBar(ctx, left, T);

                    if (over) {
                        resultPanel(ctx, me > zoe, me > zoe ? "MEGNYERTED 🥞" : "ZOE NYERT",
                            me > zoe ? "Emma pont ezt látta meg benned." : "Nem baj. Emma akkor is nevetett rajtad.");
                    }
                }
            };
        }
    };

    /* ================================================================= */
    /* 2. JELEK: mi valodi, mi kitalalt felelem                           */
    /* ================================================================= */
    var SIGNS_REAL = [
        "melléd állt Bálint ellen", "szivecskézte az uzijaid",
        "megmutatta a pulcsiját", "hosszan magyarázkodott",
        "egész testtel feléd fordult", "téged keresett a szünetben",
        "nem mondta hogy undi", "veled hangosabb"
    ];
    var SIGNS_FAKE = [
        "csak kedves mindenkivel", "biztos utál",
        "dry a chat = nem érdeklem", "Toni tetszik neki",
        "csak szánalomból beszél", "5 éve ismer, késő"
    ];

    var signals = {
        title: "OLVASD A JELEKET",
        hint: "◀ ▶ mozgás — kapd el a VALÓDI jeleket, hagyd a félelmeket",
        create: function (finish) {
            var T = 26, left = T;
            var x = W / 2, items = [], spawn = 0;
            var got = 0, miss = 0, over = false, ok = false;
            var GOAL = 8;

            function add() {
                var real = Math.random() < 0.58;
                var pool = real ? SIGNS_REAL : SIGNS_FAKE;
                items.push({
                    x: 90 + Math.random() * (W - 180),
                    y: -40,
                    vy: 90 + Math.random() * 55,
                    real: real,
                    label: pool[Math.floor(Math.random() * pool.length)],
                    hitFx: 0
                });
            }

            return {
                update: function (dt) {
                    if (over) {
                        if (G.hit("Space") || G.hit("KeyE")) finish(ok, got + "/" + GOAL);
                        return;
                    }
                    left -= dt;
                    if (G.down("ArrowLeft") || G.down("KeyA")) x -= 430 * dt;
                    if (G.down("ArrowRight") || G.down("KeyD")) x += 430 * dt;
                    x = Math.max(60, Math.min(W - 60, x));

                    spawn -= dt;
                    if (spawn <= 0) { add(); spawn = 0.62 + Math.random() * 0.4; }

                    for (var i = items.length - 1; i >= 0; i--) {
                        var it = items[i];
                        it.y += it.vy * dt;
                        if (it.y > 400 && it.y < 470 && Math.abs(it.x - x) < 72) {
                            if (it.real) { got++; G.Sfx.heart(); }
                            else { miss++; G.Sfx.bad(); }
                            items.splice(i, 1);
                            continue;
                        }
                        if (it.y > H + 40) items.splice(i, 1);
                    }

                    if (got >= GOAL || left <= 0) {
                        over = true;
                        ok = got >= GOAL - 2 && miss <= 3;
                        if (ok) G.Sfx.win(); else G.Sfx.bad();
                    }
                },
                draw: function (ctx) {
                    items.forEach(function (it) {
                        ctx.save();
                        ctx.font = "bold 15px Nunito";
                        var tw = ctx.measureText(it.label).width + 30;
                        ctx.fillStyle = it.real ? "rgba(232,98,140,.90)" : "rgba(90,95,110,.85)";
                        G.rrect(ctx, it.x - tw / 2, it.y - 17, tw, 34, 17);
                        ctx.fill();
                        ctx.restore();
                        G.text(ctx, it.label, it.x, it.y + 5, {
                            font: "bold 15px Nunito", color: it.real ? "#fff8fb" : "#cfc7d8", align: "center"
                        });
                        if (it.real) Art.prop(ctx, "prop_heart", it.x - 12, it.y - 46, 24, G.t);
                    });

                    Art.person(ctx, "zsiga", x - 32, 470, 104, "idle", G.t, false);
                    ctx.save();
                    ctx.strokeStyle = "rgba(232,98,140,.35)";
                    ctx.lineWidth = 3;
                    ctx.setLineDash([8, 8]);
                    ctx.beginPath();
                    ctx.moveTo(x - 72, 434); ctx.lineTo(x + 72, 434);
                    ctx.stroke();
                    ctx.restore();

                    timerBar(ctx, left, T);
                    G.text(ctx, "valódi jel: " + got + " / " + GOAL, 28, 44, { font: "bold 18px Nunito", color: "#ffd9e4" });
                    G.text(ctx, "félelem bekapva: " + miss, 28, 70, { font: "16px Nunito", color: "#9b90a8" });

                    if (over) {
                        resultPanel(ctx, ok, ok ? "TISZTÁN LÁTOD" : "MÉG ZAVAROS",
                            ok ? "\"folyton rólad beszél\" — Zoe" : "A félelmek hangosabbak. De nem igazabbak.");
                    }
                }
            };
        }
    };

    /* ================================================================= */
    /* 3. TURELEM (Erdely)                                                */
    /* ================================================================= */
    var patience = {
        title: "NE PUSHOLD",
        hint: "SPACE tartás = közeledés. Maradj a zöld sávban.",
        create: function (finish) {
            var needle = 0.18, vel = 0;
            var zone = 0.5, zoneW = 0.16, zoneV = 0.07;
            var prog = 0, GOAL = 7;
            var pushed = 0;
            var over = false, ok = false;
            var T = 30, left = T;

            return {
                update: function (dt) {
                    if (over) {
                        if (G.hit("Space") || G.hit("KeyE")) finish(ok, Math.round(prog / GOAL * 100) + "%");
                        return;
                    }
                    left -= dt;
                    zone += zoneV * dt;
                    if (zone > 0.82 || zone < 0.22) zoneV *= -1;
                    zoneV += (Math.random() - 0.5) * 0.02 * dt;

                    var push = G.down("Space") || G.down("KeyE");
                    vel += (push ? 0.62 : -0.42) * dt;
                    vel = Math.max(-0.5, Math.min(0.5, vel));
                    needle += vel * dt;
                    if (needle > 1) { needle = 1; vel = -0.25; pushed++; G.Sfx.bad(); }
                    if (needle < 0) { needle = 0; vel = 0; }

                    var inZone = Math.abs(needle - zone) < zoneW / 2;
                    if (inZone) prog += dt;
                    else prog -= dt * 0.35;
                    prog = Math.max(0, prog);

                    if (prog >= GOAL || left <= 0) {
                        over = true;
                        ok = prog >= GOAL && pushed <= 2;
                        if (ok) G.Sfx.win(); else G.Sfx.bad();
                    }
                },
                draw: function (ctx) {
                    var bx = W / 2 - 34, by = 138, bw = 68, bh = 292;

                    ctx.save();
                    ctx.fillStyle = "rgba(20,14,26,.6)";
                    G.rrect(ctx, bx, by, bw, bh, 14);
                    ctx.fill();
                    /* zold sav */
                    var zy = by + (1 - zone - zoneW / 2) * bh;
                    ctx.fillStyle = "rgba(120,220,150,.35)";
                    G.rrect(ctx, bx + 3, zy, bw - 6, zoneW * bh, 8);
                    ctx.fill();
                    ctx.strokeStyle = "rgba(120,220,150,.8)";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.restore();

                    /* mutato */
                    var ny = by + (1 - needle) * bh;
                    ctx.save();
                    ctx.fillStyle = "#e8628c";
                    G.rrect(ctx, bx - 14, ny - 6, bw + 28, 12, 6);
                    ctx.fill();
                    ctx.restore();

                    G.text(ctx, "túl gyors", W / 2 + 78, by + 16, { font: "14px Nunito", color: "#e08a9c" });
                    G.text(ctx, "túl passzív", W / 2 + 78, by + bh, { font: "14px Nunito", color: "#8a90a8" });
                    G.text(ctx, "Emma komfortja", W / 2, by - 16, { font: "bold 18px Nunito", color: "#cfeaf5", align: "center" });

                    Art.person(ctx, "emma", 150, 440, 130, "sit", G.t, false);
                    Art.prop(ctx, "prop_book", 236, 374, 44, G.t);
                    Art.person(ctx, "zsiga", W - 240, 440, 130, G.down("Space") ? "walkA" : "idle", G.t, true);

                    meter(ctx, W / 2 - 200, H - 56, 400, 16, prog / GOAL, "#78dc96");
                    G.text(ctx, "kapcsolódás", W / 2, H - 66, { font: "14px Nunito", color: "#9fe6b0", align: "center" });
                    timerBar(ctx, left, T);

                    if (over) {
                        resultPanel(ctx, ok, ok ? "ODAJÖTT HOZZÁD" : "MÉG NEM MOST",
                            ok ? "\"meggondoltam magam. mégis akarom. veled.\"" : "A türelem nem gyávaság. Időzítés.");
                    }
                }
            };
        }
    };

    /* ================================================================= */
    /* 4. KEMIA: belso poenok parositasa                                  */
    /* ================================================================= */
    var JOKES = ["hipermangán", "gooner szerva", "one piece", "Solo Leveling", "Duolingo", "palacsinta"];

    var chem = {
        title: "BELSŐ POÉNOK",
        hint: "Nyilak + E, vagy kattints. Párosítsd össze!",
        create: function (finish) {
            var deck = [];
            JOKES.forEach(function (j, i) { deck.push({ id: i, t: j }); deck.push({ id: i, t: j }); });
            for (var i = deck.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = deck[i]; deck[i] = deck[j]; deck[j] = tmp;
            }
            deck.forEach(function (c) { c.up = false; c.done = false; });

            var COLS = 4, ROWS = 3;
            var CW = 176, CH = 104, GAP = 18;
            var ox = (W - (COLS * CW + (COLS - 1) * GAP)) / 2;
            var oy = 130;
            var cur = 0, a = null, b = null, wait = 0, tries = 0, pairs = 0;
            var over = false, ok = false;

            function rectOf(i) {
                var c = i % COLS, r = Math.floor(i / COLS);
                return { x: ox + c * (CW + GAP), y: oy + r * (CH + GAP), w: CW, h: CH };
            }
            function flip(i) {
                var card = deck[i];
                if (!card || card.done || card.up || b) return;
                card.up = true;
                G.Sfx.blip();
                if (a === null) a = i;
                else {
                    b = i;
                    tries++;
                    wait = 0.65;
                }
            }

            return {
                update: function (dt) {
                    if (over) {
                        if (G.hit("Space") || G.hit("KeyE")) finish(ok, pairs + "/6");
                        return;
                    }
                    if (wait > 0) {
                        wait -= dt;
                        if (wait <= 0) {
                            if (deck[a].id === deck[b].id) {
                                deck[a].done = deck[b].done = true;
                                pairs++;
                                G.Sfx.heart();
                            } else {
                                deck[a].up = deck[b].up = false;
                                G.Sfx.bad();
                            }
                            a = b = null;
                            if (pairs === JOKES.length) {
                                over = true;
                                ok = tries <= 13;
                                G.Sfx.win();
                            }
                        }
                        return;
                    }

                    if (G.hit("ArrowLeft") || G.hit("KeyA")) { cur = (cur + deck.length - 1) % deck.length; G.Sfx.blip(); }
                    if (G.hit("ArrowRight") || G.hit("KeyD")) { cur = (cur + 1) % deck.length; G.Sfx.blip(); }
                    if (G.hit("ArrowUp") || G.hit("KeyW")) { cur = (cur + deck.length - COLS) % deck.length; G.Sfx.blip(); }
                    if (G.hit("ArrowDown") || G.hit("KeyS")) { cur = (cur + COLS) % deck.length; G.Sfx.blip(); }

                    if (G.hit("Click") && G.mx != null) {
                        for (var i = 0; i < deck.length; i++) {
                            var r = rectOf(i);
                            if (G.mx >= r.x && G.mx <= r.x + r.w && G.my >= r.y && G.my <= r.y + r.h) {
                                cur = i; flip(i); return;
                            }
                        }
                    } else if (G.hit("KeyE") || G.hit("Enter") || G.hit("Space")) flip(cur);
                },
                draw: function (ctx) {
                    G.text(ctx, "Kémia óra. Egymás mellett.", W / 2, 68, { font: "bold 20px Nunito", color: "#ffd9e4", align: "center" });
                    G.text(ctx, "próbálkozás: " + tries, W - 28, 44, { font: "16px Nunito", color: "#9b90a8", align: "right" });

                    for (var i = 0; i < deck.length; i++) {
                        var c = deck[i], r = rectOf(i);
                        ctx.save();
                        if (c.done) {
                            ctx.globalAlpha = 0.42;
                            ctx.fillStyle = "#78dc96";
                        } else if (c.up) ctx.fillStyle = "#fdf4f7";
                        else ctx.fillStyle = "rgba(60,44,74,.92)";
                        G.rrect(ctx, r.x, r.y, r.w, r.h, 12);
                        ctx.fill();
                        ctx.lineWidth = i === cur ? 4 : 2;
                        ctx.strokeStyle = i === cur ? "#ffd76a" : "rgba(232,98,140,.45)";
                        ctx.stroke();
                        ctx.restore();

                        if (c.up || c.done) {
                            ctx.save();
                            ctx.font = "bold 17px Nunito";
                            var lines = G.wrap(ctx, c.t, r.w - 22);
                            ctx.restore();
                            for (var k = 0; k < lines.length; k++) {
                                G.text(ctx, lines[k], r.x + r.w / 2, r.y + r.h / 2 + 6 - (lines.length - 1) * 11 + k * 22,
                                    { font: "bold 17px Nunito", color: c.done ? "#123" : "#2a1f33", align: "center" });
                            }
                        } else {
                            Art.prop(ctx, "prop_heart", r.x + r.w / 2 - 18, r.y + r.h / 2 - 18, 36, G.t + i);
                        }
                    }

                    if (over) {
                        resultPanel(ctx, ok, "MEGVAN MIND",
                            ok ? "Egy kapcsolat nyelvet épít magának. Ti már beszéltétek."
                               : "Meglett. Kicsit sok próbálkozásból, de meglett.");
                    }
                }
            };
        }
    };

    /* ================================================================= */
    /* 5. A NYAR: tartsd eletben a chatet                                 */
    /* ================================================================= */
    var distance = {
        title: "300 KILOMÉTER",
        hint: "◀ ▶ — kapd el az uzikat és a szíveket, kerüld az 5 nap csendet",
        create: function (finish) {
            var T = 34, left = T;
            var x = W / 2, items = [], spawn = 0;
            var link = 0.55, got = 0;
            var over = false, ok = false;

            function add() {
                var r = Math.random();
                var kind = r < 0.5 ? "msg" : r < 0.74 ? "heart" : r < 0.86 ? "duo" : "silence";
                items.push({
                    x: 80 + Math.random() * (W - 160),
                    y: -40,
                    vy: 120 + Math.random() * 90,
                    kind: kind
                });
            }

            return {
                update: function (dt) {
                    if (over) {
                        if (G.hit("Space") || G.hit("KeyE")) finish(ok, Math.round(link * 100) + "%");
                        return;
                    }
                    left -= dt;
                    link -= dt * 0.055;

                    if (G.down("ArrowLeft") || G.down("KeyA")) x -= 470 * dt;
                    if (G.down("ArrowRight") || G.down("KeyD")) x += 470 * dt;
                    x = Math.max(60, Math.min(W - 60, x));

                    spawn -= dt;
                    if (spawn <= 0) { add(); spawn = 0.42 + Math.random() * 0.3; }

                    for (var i = items.length - 1; i >= 0; i--) {
                        var it = items[i];
                        it.y += it.vy * dt;
                        if (it.y > 396 && it.y < 466 && Math.abs(it.x - x) < 66) {
                            if (it.kind === "silence") { link -= 0.17; G.Sfx.bad(); }
                            else if (it.kind === "heart") { link += 0.11; got++; G.Sfx.heart(); }
                            else if (it.kind === "duo") { link += 0.08; got++; G.Sfx.pick(); }
                            else { link += 0.06; got++; G.Sfx.pick(); }
                            items.splice(i, 1);
                            continue;
                        }
                        if (it.y > H + 40) items.splice(i, 1);
                    }

                    link = Math.max(0, Math.min(1, link));
                    if (left <= 0 || link <= 0) {
                        over = true;
                        ok = link > 0.45;
                        if (ok) G.Sfx.win(); else G.Sfx.bad();
                    }
                },
                draw: function (ctx) {
                    /* ket part */
                    Art.person(ctx, "emma", 40, 200, 96, "idle", G.t, false);
                    G.text(ctx, "Balaton", 74, 220, { font: "13px Nunito", color: "rgba(255,255,255,.5)", align: "center" });

                    items.forEach(function (it) {
                        if (it.kind === "msg") {
                            Art.prop(ctx, "prop_phone", it.x - 20, it.y - 20, 40, G.t);
                        } else if (it.kind === "heart") {
                            Art.prop(ctx, "prop_heart", it.x - 22, it.y - 22, 44, G.t);
                        } else if (it.kind === "duo") {
                            ctx.save();
                            ctx.fillStyle = "#6dc44a";
                            G.rrect(ctx, it.x - 22, it.y - 18, 44, 36, 10);
                            ctx.fill();
                            ctx.restore();
                            G.text(ctx, "duo", it.x, it.y + 6, { font: "bold 14px Nunito", color: "#123", align: "center" });
                        } else {
                            ctx.save();
                            ctx.fillStyle = "rgba(80,84,100,.9)";
                            G.rrect(ctx, it.x - 58, it.y - 20, 116, 40, 20);
                            ctx.fill();
                            ctx.restore();
                            G.text(ctx, "5 nap csend", it.x, it.y + 6, { font: "bold 14px Nunito", color: "#cfc7d8", align: "center" });
                        }
                    });

                    Art.person(ctx, "zsiga", x - 32, 466, 104, "idle", G.t, false);

                    meter(ctx, W / 2 - 240, H - 46, 480, 18, link, link > 0.45 ? "#e8628c" : "#8a6a8a");
                    G.text(ctx, "kapcsolat", W / 2 - 240, H - 54, { font: "14px Nunito", color: "#ffd9e4" });
                    G.text(ctx, "uzi: " + got, 28, 44, { font: "bold 18px Nunito", color: "#ffd9e4" });
                    timerBar(ctx, left, T);

                    if (over) {
                        resultPanel(ctx, ok, ok ? "ÁTVÉSZELTÉTEK" : "NEHÉZ NYÁR VOLT",
                            ok ? "\"Mar varom a hetfot de csak miattad\""
                               : "Az öt nap csend hosszabb, mint amilyennek hangzik.");
                    }
                }
            };
        }
    };

    /* ================================================================= */
    /* 6. SZEPTEMBER: rakd ossze a mondatot                               */
    /* ================================================================= */
    var SENTENCES = [
        ["most", "furcsa", "nekem", "is"],
        ["három", "hónapig", "csak", "írtunk"],
        ["akkor", "tanuljuk", "újra"]
    ];

    var words = {
        title: "ÚJRA BESZÉLNI",
        hint: "Nyilak + E, vagy kattints — jó sorrendben!",
        create: function (finish) {
            var round = 0, placed = [], pool = [], cur = 0, wrong = 0;
            var over = false, ok = false, flash = 0;

            function setup() {
                placed = [];
                pool = SENTENCES[round].map(function (w, i) { return { w: w, i: i }; });
                for (var i = pool.length - 1; i > 0; i--) {
                    var j = Math.floor(Math.random() * (i + 1));
                    var t = pool[i]; pool[i] = pool[j]; pool[j] = t;
                }
                cur = 0;
            }
            setup();

            function rectOf(i) {
                var n = pool.length;
                var tw = 156, gap = 16;
                var ox = (W - (n * tw + (n - 1) * gap)) / 2;
                return { x: ox + i * (tw + gap), y: 360, w: tw, h: 66 };
            }

            function take(i) {
                var item = pool[i];
                if (!item) return;
                if (item.i === placed.length) {
                    placed.push(item.w);
                    pool.splice(i, 1);
                    cur = Math.min(cur, Math.max(0, pool.length - 1));
                    G.Sfx.pick();
                    if (!pool.length) {
                        round++;
                        if (round >= SENTENCES.length) {
                            over = true;
                            ok = wrong <= 2;
                            G.Sfx.win();
                        } else setup();
                    }
                } else {
                    wrong++;
                    flash = 0.4;
                    G.Sfx.bad();
                }
            }

            return {
                update: function (dt) {
                    flash = Math.max(0, flash - dt);
                    if (over) {
                        if (G.hit("Space") || G.hit("KeyE")) finish(ok, wrong + " hiba");
                        return;
                    }
                    if (G.hit("ArrowLeft") || G.hit("KeyA")) { cur = (cur + pool.length - 1) % pool.length; G.Sfx.blip(); }
                    if (G.hit("ArrowRight") || G.hit("KeyD")) { cur = (cur + 1) % pool.length; G.Sfx.blip(); }

                    if (G.hit("Click") && G.mx != null) {
                        for (var i = 0; i < pool.length; i++) {
                            var r = rectOf(i);
                            if (G.mx >= r.x && G.mx <= r.x + r.w && G.my >= r.y && G.my <= r.y + r.h) {
                                cur = i; take(i); return;
                            }
                        }
                    } else if (G.hit("KeyE") || G.hit("Enter") || G.hit("Space")) take(cur);
                },
                draw: function (ctx) {
                    G.text(ctx, "mondat " + Math.min(round + 1, SENTENCES.length) + " / " + SENTENCES.length,
                        W / 2, 62, { font: "bold 16px Nunito", color: "#9b90a8", align: "center" });

                    /* mar lerakott szavak */
                    var line = placed.join(" ");
                    ctx.save();
                    ctx.fillStyle = flash > 0 ? "rgba(200,68,63,.25)" : "rgba(20,14,26,.6)";
                    G.rrect(ctx, W / 2 - 380, 150, 760, 96, 16);
                    ctx.fill();
                    ctx.strokeStyle = "rgba(232,98,140,.5)";
                    ctx.lineWidth = 2;
                    ctx.stroke();
                    ctx.restore();
                    G.text(ctx, line || "...", W / 2, 210, {
                        font: "bold 30px Nunito", color: "#fff8fb", align: "center"
                    });

                    Art.person(ctx, "emma", 90, 340, 128, placed.length ? "happy" : "shy", G.t, false);
                    Art.person(ctx, "zsiga", W - 200, 340, 128, "idle", G.t, true);

                    for (var i = 0; i < pool.length; i++) {
                        var r = rectOf(i);
                        ctx.save();
                        ctx.fillStyle = i === cur ? "#fdf4f7" : "rgba(60,44,74,.92)";
                        G.rrect(ctx, r.x, r.y, r.w, r.h, 12);
                        ctx.fill();
                        ctx.lineWidth = i === cur ? 4 : 2;
                        ctx.strokeStyle = i === cur ? "#ffd76a" : "rgba(232,98,140,.45)";
                        ctx.stroke();
                        ctx.restore();
                        G.text(ctx, pool[i].w, r.x + r.w / 2, r.y + 42, {
                            font: "bold 20px Nunito", color: i === cur ? "#2a1f33" : "#ded2ea", align: "center"
                        });
                    }

                    G.text(ctx, "hiba: " + wrong, 28, 44, { font: "16px Nunito", color: "#9b90a8" });

                    if (over) {
                        resultPanel(ctx, ok, "BEINDULT",
                            ok ? "A harmadik napon már nem kellett gondolkodni rajta."
                               : "Kicsit ment nehezen. De ment.");
                    }
                }
            };
        }
    };

    global.MINIGAMES = {
        pancake: pancake,
        signals: signals,
        patience: patience,
        chem: chem,
        distance: distance,
        words: words
    };
})(window);
