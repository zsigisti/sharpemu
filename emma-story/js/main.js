/* Copyright (C) 2026 SharpEmu Emulator Project
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
/* Az Emma Sztori - scene-ek es indulas. */
(function (global) {
    "use strict";

    var W = 960, H = 540;
    var GROUND = global.GROUND_Y;
    var CH = STORY.chapters;

    function heartsFor(idx) { return (idx + 1) * 3; }

    function napokSzeptember16ig() {
        var now = new Date();
        var y = now.getFullYear();
        var target = new Date(y, 8, 16);
        if (target < new Date(y, now.getMonth(), now.getDate())) target = new Date(y + 1, 8, 16);
        var ms = target - new Date(y, now.getMonth(), now.getDate());
        return Math.round(ms / 86400000);
    }

    /* --- kozos dekor: lebego szivek --------------------------------- */
    function floatHearts(ctx, n, alpha) {
        for (var i = 0; i < n; i++) {
            var x = (i * 137 + Math.sin(G.t * 0.35 + i) * 60) % (W + 80) - 40;
            var y = H - ((G.t * (22 + (i % 5) * 9) + i * 90) % (H + 120));
            ctx.save();
            ctx.globalAlpha = (alpha || 0.35) * (0.4 + 0.6 * Math.abs(Math.sin(i + G.t * 0.4)));
            Art.prop(ctx, "prop_heart", x, y, 22 + (i % 3) * 10, G.t + i);
            ctx.restore();
        }
    }

    function bgGrad(ctx, a, b) {
        var g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, a);
        g.addColorStop(1, b);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    }

    /* ================================================================ */
    /* CIMKEPERNYO                                                       */
    /* ================================================================ */
    function TitleScene() {
        var sel = Math.min(G.state.unlocked - 1, CH.length - 1);
        return {
            update: function () {
                if (G.hit("ArrowUp") || G.hit("KeyW")) { sel = Math.max(0, sel - 1); G.Sfx.blip(); }
                if (G.hit("ArrowDown") || G.hit("KeyS")) { sel = Math.min(G.state.unlocked - 1, sel + 1); G.Sfx.blip(); }
                for (var d = 1; d <= 6; d++) {
                    if (G.hit("Digit" + d) && d <= G.state.unlocked) { sel = d - 1; G.Sfx.blip(); }
                }
                if (G.hit("KeyR")) { G.reset(); sel = 0; G.Sfx.bad(); }
                if (G.hit("KeyM")) { G.Sfx.muted = !G.Sfx.muted; }
                if (G.hit("KeyT")) { G.transition(function () { G.go(ArtScene()); }); return; }
                if (G.hit("Space") || G.hit("KeyE") || G.hit("Enter") || G.hit("Click")) {
                    G.Sfx.heart();
                    var i = sel;
                    G.transition(function () { G.go(IntroScene(i)); });
                }
            },
            draw: function (ctx) {
                bgGrad(ctx, "#3a2740", "#17121d");
                floatHearts(ctx, 12, 0.3);

                Art.prop(ctx, "prop_heart", W / 2 - 40, 44, 80, G.t);

                G.text(ctx, STORY.title, W / 2, 178, {
                    font: "34px 'Press Start 2P', monospace", color: "#ffd9e4", align: "center", shadow: "rgba(232,98,140,.45)"
                });
                G.text(ctx, STORY.subtitle, W / 2, 210, { font: "16px Nunito", color: "#a996b8", align: "center" });

                for (var i = 0; i < CH.length; i++) {
                    var open = i < G.state.unlocked;
                    var on = i === sel;
                    var y = 254 + i * 38;
                    ctx.save();
                    ctx.fillStyle = on ? "rgba(232,98,140,.26)" : "rgba(255,255,255,.04)";
                    G.rrect(ctx, W / 2 - 250, y, 500, 32, 9);
                    ctx.fill();
                    ctx.restore();
                    var label = (i + 1) + ".  " + CH[i].title;
                    G.text(ctx, open ? (on ? "▸ " : "  ") + label : "  🔒  ? ? ?", W / 2 - 228, y + 22, {
                        font: (on ? "bold " : "") + "17px Nunito",
                        color: open ? (on ? "#fff8fb" : "#c9bcd4") : "#5c5168"
                    });
                    if (open) G.text(ctx, CH[i].when, W / 2 + 228, y + 22, {
                        font: "14px Nunito", color: "#8d7f9c", align: "right"
                    });
                }

                G.text(ctx, "🤍 " + G.state.hearts + "   ⭐ " + G.state.memories + "/18",
                    W / 2, 492, { font: "bold 18px Nunito", color: "#ffd9e4", align: "center" });
                G.text(ctx, "SPACE indít  •  ↑↓ / 1-6 fejezet  •  T rajz-lista  •  M hang  •  R újrakezdés",
                    W / 2, 518, { font: "13px Nunito", color: "rgba(255,255,255,.42)", align: "center" });

                var miss = Art.missing().length;
                if (miss) G.text(ctx, miss + " rajz még hiányzik — nyomj T-t", W / 2, 236,
                    { font: "13px Nunito", color: "rgba(255,214,106,.7)", align: "center" });
            }
        };
    }

    /* ================================================================ */
    /* RAJZ-LISTA (amit tolem kerek)                                     */
    /* ================================================================ */
    function ArtScene() {
        var scroll = 0;
        return {
            update: function (dt) {
                if (G.down("ArrowDown") || G.down("KeyS")) scroll += 240 * dt;
                if (G.down("ArrowUp") || G.down("KeyW")) scroll -= 240 * dt;
                scroll = Math.max(0, Math.min(Art.SLOTS.length * 26 - 260, scroll));
                if (G.hit("KeyT") || G.hit("Escape") || G.hit("Space") || G.hit("Click")) {
                    G.transition(function () { G.go(TitleScene()); });
                }
            },
            draw: function (ctx) {
                bgGrad(ctx, "#241b34", "#120f18");
                G.text(ctx, "AMIT RAJZOLHATNÁL", W / 2, 58, {
                    font: "20px 'Press Start 2P', monospace", color: "#ffd76a", align: "center"
                });
                G.text(ctx, "Tedd a png-t ide:  emma-story/assets/art/<név>.png  — a játék magától átveszi.",
                    W / 2, 88, { font: "15px Nunito", color: "#c9bcd4", align: "center" });
                G.text(ctx, "Ajánlott: átlátszó hátterű PNG. Karakterek ~200×325, hátterek 960×540, tárgyak 128×128.",
                    W / 2, 110, { font: "14px Nunito", color: "#8d7f9c", align: "center" });

                ctx.save();
                ctx.beginPath();
                ctx.rect(40, 130, W - 80, 340);
                ctx.clip();
                for (var i = 0; i < Art.SLOTS.length; i++) {
                    var s = Art.SLOTS[i];
                    var y = 152 + i * 26 - scroll;
                    var have = Art.has(s.name);
                    G.text(ctx, have ? "✓" : "•", 56, y, { font: "16px Nunito", color: have ? "#78dc96" : "#6a5f78" });
                    G.text(ctx, s.name + ".png", 84, y, {
                        font: "bold 15px Nunito", color: have ? "#78dc96" : "#ffd9e4"
                    });
                    G.text(ctx, s.desc, 320, y, { font: "14px Nunito", color: "#a196ad" });
                }
                ctx.restore();

                G.text(ctx, "↑↓ görgetés  •  T / SPACE vissza", W / 2, 508,
                    { font: "13px Nunito", color: "rgba(255,255,255,.45)", align: "center" });
            }
        };
    }

    /* ================================================================ */
    /* FEJEZET INTRO                                                     */
    /* ================================================================ */
    function IntroScene(idx) {
        var ch = CH[idx];
        var t = 0;
        return {
            update: function (dt) {
                t += dt;
                if (G.hit("Space") || G.hit("KeyE") || G.hit("Enter") || G.hit("Click")) {
                    if (t < 0.7) return;
                    G.transition(function () { G.go(PlayScene(idx)); });
                }
            },
            draw: function (ctx) {
                bgGrad(ctx, "#241b34", "#0f0b13");
                floatHearts(ctx, 7, 0.18);

                G.text(ctx, (idx + 1) + ". FEJEZET", W / 2, 150, {
                    font: "14px 'Press Start 2P', monospace", color: "#e8628c", align: "center"
                });
                G.text(ctx, ch.title, W / 2, 208, {
                    font: "26px 'Press Start 2P', monospace", color: "#fff8fb", align: "center", shadow: "rgba(0,0,0,.5)"
                });
                G.text(ctx, ch.when, W / 2, 240, { font: "17px Nunito", color: "#a996b8", align: "center" });

                for (var i = 0; i < ch.intro.length; i++) {
                    var a = Math.max(0, Math.min(1, (t - 0.5 - i * 0.75) * 1.6));
                    if (a <= 0) continue;
                    ctx.save();
                    ctx.globalAlpha = a;
                    G.text(ctx, ch.intro[i], W / 2, 316 + i * 34, {
                        font: "italic 20px Nunito", color: "#ded2ea", align: "center"
                    });
                    ctx.restore();
                }

                if (t > 0.5 + ch.intro.length * 0.75) {
                    G.text(ctx, "SPACE — kezdjük", W / 2, 480, {
                        font: "15px Nunito", color: "rgba(255,255,255," + (0.4 + 0.3 * Math.sin(G.t * 4)) + ")", align: "center"
                    });
                }
            }
        };
    }

    /* ================================================================ */
    /* JATEK: vegigjarhato fejezet                                       */
    /* ================================================================ */
    function PlayScene(idx) {
        var ch = CH[idx];
        var lv = LEVELS[idx];
        var p = { x: 60, y: GROUND, vy: 0, ground: true, face: 1, anim: 0, stepT: 0 };
        var camX = 0;
        var ti = 0;
        var fired = false;
        var mg = null, mgKey = null, mgFinish = null;
        var mems = lv.memories.map(function (m) {
            return { x: m.x, got: !!G.state.found[idx + ":" + m.x] };
        });
        var leaving = false;

        function gateX() {
            var tr = lv.triggers[ti];
            return tr ? tr.x + 46 : lv.length - 40;
        }

        function startMinigame() {
            mgKey = ch.minigame;
            var def = MINIGAMES[mgKey];
            if (!def) { advance(); return; }
            var closed = false;
            mgFinish = function (ok) {
                if (closed) return;
                closed = true;
                mg = null;
                mgFinish = null;
                G.state.hearts += ok ? 3 : 1;
                G.save();
                var tr = lv.triggers[ti];
                var after = tr && tr.after ? ch.beats[tr.after] : null;
                if (after) G.Dialog.start(after, advance);
                else advance();
            };
            mg = def.create(mgFinish);
        }

        function advance() {
            ti++;
            fired = false;
        }

        function fireTrigger() {
            var tr = lv.triggers[ti];
            fired = true;
            if (tr.beat && ch.beats[tr.beat]) {
                G.Dialog.start(ch.beats[tr.beat], function () {
                    if (tr.minigame) startMinigame();
                    else advance();
                });
            } else if (tr.minigame) {
                startMinigame();
            } else advance();
        }

        return {
            update: function (dt) {
                if (mg) {
                    /* vesz-eset: ha valaki beragad egy minijatekban, ESC atlepteti */
                    if (G.hit("Escape")) { var f = mgFinish; mg = null; if (f) f(false); return; }
                    mg.update(dt);
                    return;
                }
                if (G.Dialog.active) { G.Dialog.update(dt); return; }

                var tr = lv.triggers[ti];
                if (tr && !fired && p.x >= tr.x) { fireTrigger(); return; }

                /* mozgas */
                var sp = 250;
                var mv = 0;
                if (G.down("ArrowLeft") || G.down("KeyA")) mv -= 1;
                if (G.down("ArrowRight") || G.down("KeyD")) mv += 1;
                if (mv) {
                    p.face = mv;
                    p.x += mv * sp * dt;
                    p.anim += dt * 7;
                    p.stepT -= dt;
                    if (p.stepT <= 0 && p.ground) { G.Sfx.step(); p.stepT = 0.28; }
                } else p.anim = 0;

                /* ugras */
                if ((G.hit("Space") || G.hit("ArrowUp") || G.hit("KeyW")) && p.ground) {
                    p.vy = -430; p.ground = false; G.Sfx.tone(420, 0.08, "square", 0.04);
                }
                p.vy += 1250 * dt;
                p.y += p.vy * dt;
                if (p.y >= GROUND) { p.y = GROUND; p.vy = 0; p.ground = true; }

                p.x = Math.max(30, Math.min(gateX(), p.x));

                /* emlekek */
                mems.forEach(function (m) {
                    if (m.got) return;
                    if (Math.abs(m.x - p.x) < 42 && Math.abs((GROUND - 130) - p.y) < 150) {
                        m.got = true;
                        G.state.memories++;
                        G.state.hearts++;
                        G.state.found[idx + ":" + m.x] = 1;
                        G.save();
                        G.Sfx.pick();
                    }
                });

                /* fejezet vege */
                if (!lv.triggers[ti] && p.x >= lv.length - 60 && !leaving) {
                    leaving = true;
                    G.Sfx.win();
                    G.transition(function () { G.go(OutroScene(idx)); });
                }

                camX = Math.max(0, Math.min(lv.length - W, p.x - W * 0.38));
            },

            draw: function (ctx) {
                Backdrop.draw(ctx, ch, camX);

                ctx.save();
                ctx.translate(-camX, 0);

                /* targyak */
                lv.props.forEach(function (pr) {
                    Art.prop(ctx, pr.name, pr.x, pr.y, pr.s, G.t);
                });

                /* npc-k */
                lv.npcs.forEach(function (n) {
                    Art.person(ctx, n.who, n.x, GROUND, 132, n.pose || "idle", G.t + n.x, n.x > p.x ? true : false);
                    if (Math.abs(n.x - p.x) < 300) {
                        var cast = G.CAST[n.who];
                        G.text(ctx, cast ? cast.name : "", n.x + 22, GROUND - 148, {
                            font: "bold 13px Nunito", color: "rgba(255,255,255,.65)", align: "center"
                        });
                    }
                });

                /* emlekek */
                mems.forEach(function (m) {
                    if (m.got) return;
                    var y = GROUND - 130 + Math.sin(G.t * 2.4 + m.x) * 10;
                    ctx.save();
                    ctx.globalAlpha = 0.28;
                    ctx.fillStyle = "#ffd76a";
                    ctx.beginPath();
                    ctx.arc(m.x + 20, y + 20, 30, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                    Art.prop(ctx, "prop_memory", m.x, y, 40, G.t);
                });

                /* kijarat jelzo */
                if (!lv.triggers[ti]) {
                    var ex = lv.length - 40;
                    ctx.save();
                    ctx.globalAlpha = 0.5 + 0.4 * Math.sin(G.t * 4);
                    G.text(ctx, "▶", ex, GROUND - 60, { font: "40px Nunito", color: "#ffd76a", align: "center" });
                    ctx.restore();
                    G.text(ctx, "tovább", ex, GROUND - 24, { font: "13px Nunito", color: "rgba(255,255,255,.6)", align: "center" });
                }

                /* jatekos */
                var pose = !p.ground ? "jump" : (p.anim ? (Math.floor(p.anim) % 2 ? "walkA" : "walkB") : "idle");
                ctx.save();
                ctx.globalAlpha = 0.22;
                ctx.fillStyle = "#000";
                ctx.beginPath();
                ctx.ellipse(p.x + 40, GROUND + 4, 34, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                Art.person(ctx, "zsiga", p.x, p.y, 132, pose, G.t, p.face < 0);

                ctx.restore();

                /* HUD */
                ctx.save();
                ctx.fillStyle = "rgba(15,11,19,.55)";
                G.rrect(ctx, 14, 12, 300, 38, 10);
                ctx.fill();
                ctx.restore();
                G.text(ctx, (idx + 1) + ". " + ch.title, 28, 37, { font: "bold 16px Nunito", color: "#ffd9e4" });

                ctx.save();
                ctx.fillStyle = "rgba(15,11,19,.55)";
                G.rrect(ctx, W - 194, 12, 180, 38, 10);
                ctx.fill();
                ctx.restore();
                G.text(ctx, "🤍 " + G.state.hearts + "   ⭐ " + G.state.memories,
                    W - 24, 37, { font: "bold 16px Nunito", color: "#ffd9e4", align: "right" });

                /* elorehaladas sav */
                var frac = Math.min(1, p.x / (lv.length - 60));
                ctx.save();
                ctx.fillStyle = "rgba(255,255,255,.15)";
                ctx.fillRect(14, 58, W - 28, 5);
                ctx.fillStyle = "#e8628c";
                ctx.fillRect(14, 58, (W - 28) * frac, 5);
                ctx.restore();

                G.Dialog.draw(ctx);

                if (mg) {
                    ctx.save();
                    ctx.fillStyle = "rgba(12,9,16,.90)";
                    ctx.fillRect(0, 0, W, H);
                    ctx.restore();
                    var def = MINIGAMES[mgKey];
                    G.text(ctx, def.title, W / 2, 78, {
                        font: "18px 'Press Start 2P', monospace", color: "#ffd76a", align: "center"
                    });
                    G.text(ctx, def.hint + "   •   ESC átugrás", W / 2, H - 18, {
                        font: "14px Nunito", color: "rgba(255,255,255,.55)", align: "center"
                    });
                    mg.draw(ctx);
                }
            }
        };
    }

    /* ================================================================ */
    /* FEJEZET VEGE                                                      */
    /* ================================================================ */
    function OutroScene(idx) {
        var ch = CH[idx];
        var t = 0;
        var got = LEVELS[idx].memories.filter(function (m) { return G.state.found[idx + ":" + m.x]; }).length;
        if (G.state.unlocked < idx + 2) { G.state.unlocked = Math.min(6, idx + 2); G.save(); }
        return {
            update: function (dt) {
                t += dt;
                if ((G.hit("Space") || G.hit("KeyE") || G.hit("Enter") || G.hit("Click")) && t > 0.6) {
                    G.transition(function () {
                        if (idx + 1 < CH.length) G.go(IntroScene(idx + 1));
                        else G.go(EndingScene());
                    });
                }
            },
            draw: function (ctx) {
                bgGrad(ctx, "#2c1f38", "#0f0b13");
                floatHearts(ctx, 9, 0.22);

                G.text(ctx, ch.title + " — vége", W / 2, 130, {
                    font: "18px 'Press Start 2P', monospace", color: "#ffd9e4", align: "center"
                });

                for (var i = 0; i < ch.outro.length; i++) {
                    var a = Math.max(0, Math.min(1, (t - 0.3 - i * 0.7) * 1.7));
                    if (a <= 0) continue;
                    ctx.save();
                    ctx.globalAlpha = a;
                    G.text(ctx, ch.outro[i], W / 2, 208 + i * 36, {
                        font: "italic 21px Nunito", color: "#ded2ea", align: "center"
                    });
                    ctx.restore();
                }

                G.text(ctx, "emlékek ebben a fejezetben: " + got + " / 3", W / 2, 372,
                    { font: "bold 17px Nunito", color: "#ffd76a", align: "center" });
                G.text(ctx, "összesen: 🤍 " + G.state.hearts + "   ⭐ " + G.state.memories,
                    W / 2, 400, { font: "16px Nunito", color: "#c9bcd4", align: "center" });

                if (t > 0.6) G.text(ctx, idx + 1 < CH.length ? "SPACE — következő fejezet" : "SPACE — a vége",
                    W / 2, 470, { font: "15px Nunito", color: "rgba(255,255,255," + (0.4 + 0.3 * Math.sin(G.t * 4)) + ")", align: "center" });
            }
        };
    }

    /* ================================================================ */
    /* VEGE                                                              */
    /* ================================================================ */
    function EndingScene() {
        var scroll = 0;
        /* a tartalom magassaga a listak hosszabol: igy nem gorgethetunk uresbe */
        var contentH = 1330 + (STORY.lessons.length - 6) * 32 + (STORY.ahead.length - 5) * 32;
        var maxScroll = Math.max(0, contentH - (H - 60));
        var days = napokSzeptember16ig();
        return {
            update: function (dt) {
                var sp = 200;
                if (G.down("ArrowDown") || G.down("KeyS")) scroll += sp * dt;
                if (G.down("ArrowUp") || G.down("KeyW")) scroll -= sp * dt;
                scroll += dt * 26; /* lassan magatol is megy */
                scroll = Math.max(0, Math.min(maxScroll, scroll));
                if (G.hit("KeyE") || G.hit("Enter") || G.hit("Escape")) {
                    G.transition(function () { G.go(TitleScene()); });
                }
            },
            draw: function (ctx) {
                bgGrad(ctx, "#3a2740", "#120f18");
                floatHearts(ctx, 14, 0.3);

                ctx.save();
                ctx.translate(0, -scroll);

                var y = 120;
                G.text(ctx, "A VÉGE", W / 2, y, { font: "26px 'Press Start 2P', monospace", color: "#ffd9e4", align: "center" });
                y += 60;
                G.text(ctx, "Áprilistól szeptemberig.", W / 2, y, { font: "italic 21px Nunito", color: "#ded2ea", align: "center" });
                y += 34;
                G.text(ctx, "Hat fejezet. Egy lány. Nulla trükk.", W / 2, y, { font: "italic 21px Nunito", color: "#ded2ea", align: "center" });

                y += 80;
                G.text(ctx, "🤍 szívpont: " + G.state.hearts, W / 2, y, { font: "bold 24px Nunito", color: "#e8628c", align: "center" });
                y += 34;
                G.text(ctx, "⭐ emlék: " + G.state.memories + " / 18", W / 2, y, { font: "bold 24px Nunito", color: "#ffd76a", align: "center" });

                y += 80;
                G.text(ctx, "AMIT MEGTANULTÁL", W / 2, y, { font: "15px 'Press Start 2P', monospace", color: "#9fe6d8", align: "center" });
                y += 40;
                STORY.lessons.forEach(function (l) {
                    G.text(ctx, l, W / 2, y, { font: "19px Nunito", color: "#ded2ea", align: "center" });
                    y += 32;
                });

                y += 52;
                G.text(ctx, "AMI ELŐTTED VAN", W / 2, y, { font: "15px 'Press Start 2P', monospace", color: "#ffd76a", align: "center" });
                y += 40;
                STORY.ahead.forEach(function (l) {
                    G.text(ctx, l, W / 2, y, { font: "19px Nunito", color: "#ded2ea", align: "center" });
                    y += 32;
                });

                y += 60;
                ctx.save();
                ctx.fillStyle = "rgba(232,98,140,.14)";
                G.rrect(ctx, W / 2 - 300, y - 40, 600, 150, 18);
                ctx.fill();
                ctx.strokeStyle = "rgba(232,98,140,.6)";
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
                Art.prop(ctx, "prop_cake", W / 2 - 26, y - 26, 52, G.t);
                G.text(ctx, "SZEPTEMBER 16.", W / 2, y + 56, {
                    font: "20px 'Press Start 2P', monospace", color: "#ffd9e4", align: "center"
                });
                G.text(ctx, days === 0 ? "MA VAN. Add oda neki." : days + " nap Emma szülinapjáig",
                    W / 2, y + 90, { font: "bold 19px Nunito", color: "#ffe9a8", align: "center" });

                y += 190;
                G.text(ctx, "és nem trükközéssel csináltad.", W / 2, y, { font: "italic 22px Nunito", color: "#fff8fb", align: "center" });
                y += 34;
                G.text(ctx, "figyelmességgel. türelemmel. őszinteséggel. 🫡", W / 2, y, { font: "italic 22px Nunito", color: "#fff8fb", align: "center" });
                y += 70;
                Art.prop(ctx, "prop_heart", W / 2 - 34, y, 68, G.t);

                ctx.restore();

                G.text(ctx, "↑↓ görgetés  •  ENTER — vissza a menübe", W / 2, H - 14,
                    { font: "13px Nunito", color: "rgba(255,255,255,.45)", align: "center" });
            }
        };
    }

    /* ================================================================ */
    /* BETOLTES                                                          */
    /* ================================================================ */
    function LoadScene(next) {
        var t = 0;
        return {
            update: function (dt) { t += dt; },
            draw: function (ctx) {
                bgGrad(ctx, "#241b34", "#0f0b13");
                G.text(ctx, "betöltés" + ".".repeat(1 + Math.floor(t * 2) % 3), W / 2, H / 2,
                    { font: "20px Nunito", color: "#c9bcd4", align: "center" });
            }
        };
    }

    function start() {
        G.boot(LoadScene());
        var fonts = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
        Promise.all([
            new Promise(function (res) { Art.preload(res); }),
            fonts
        ]).then(function () {
            G.transition(function () { G.go(TitleScene()); });
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else start();
})(window);
