/* Copyright (C) 2026 SharpEmu Emulator Project
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
/* Az Emma Sztori - palyak es hatterek.
 *
 * Minden fejezet egy balrol jobbra vegigjarhato palya. A triggerek sorrendben
 * sulnek el: amig egy trigger parbeszede le nem fut, addig nem mesz tovabb.
 * Ha egy triggeren minigame:true van, a parbeszed utan indul a minijatek.
 */
(function (global) {
    "use strict";

    var GROUND = 452;

    var LEVELS = [
        /* 1 */ {
            length: 3100,
            npcs: [
                { who: "zoe", x: 880, pose: "idle" },
                { who: "emma", x: 1180, pose: "shy" },
                { who: "balint", x: 1930, pose: "idle" },
                { who: "csabi", x: 2680, pose: "idle" },
                { who: "marci", x: 2740, pose: "idle" }
            ],
            props: [{ name: "prop_pancake", x: 840, y: GROUND - 46, s: 52 }],
            memories: [{ x: 520 }, { x: 1520 }, { x: 2480 }],
            triggers: [
                { x: 50, beat: "start" },
                { x: 840, beat: "stand", minigame: true, after: "after_game" },
                { x: 1300, beat: "jelek" },
                { x: 1650, beat: "rajz" },
                { x: 1980, beat: "balint" },
                { x: 2330, beat: "pulcsi" },
                { x: 2720, beat: "ship" }
            ]
        },
        /* 2 */ {
            length: 2300,
            npcs: [{ who: "zoe", x: 1880, pose: "idle" }],
            props: [
                { name: "prop_phone", x: 880, y: GROUND - 130, s: 56 },
                { name: "prop_phone", x: 1390, y: GROUND - 130, s: 56 }
            ],
            memories: [{ x: 460 }, { x: 1150 }, { x: 1650 }],
            triggers: [
                { x: 50, beat: "start" },
                { x: 900, beat: "bomba" },
                { x: 1400, beat: "bonyolult" },
                { x: 1880, beat: "wingman", minigame: true }
            ]
        },
        /* 3 */ {
            length: 2900,
            npcs: [
                { who: "csabi", x: 420, pose: "idle" },
                { who: "emma", x: 740, pose: "sit" },
                { who: "marci", x: 1280, pose: "idle" },
                { who: "toni", x: 1340, pose: "idle" },
                { who: "emma", x: 1900, pose: "shy" }
            ],
            props: [
                { name: "prop_book", x: 790, y: GROUND - 108, s: 42 },
                { name: "prop_ball", x: 2450, y: GROUND - 40, s: 44 }
            ],
            memories: [{ x: 980 }, { x: 1620 }, { x: 2600 }],
            triggers: [
                { x: 50, beat: "start" },
                { x: 720, beat: "busz" },
                { x: 1300, beat: "tabortuz" },
                { x: 1780, beat: null, minigame: true },
                { x: 1880, beat: "emma_jon" },
                { x: 2480, beat: "busz_vissza" }
            ]
        },
        /* 4 */ {
            length: 2700,
            npcs: [
                { who: "emma", x: 300, pose: "happy" },
                { who: "zoe", x: 1700, pose: "idle" },
                { who: "emma", x: 2320, pose: "sit" }
            ],
            props: [
                { name: "prop_beaker", x: 1160, y: GROUND - 44, s: 48 },
                { name: "prop_ball", x: 640, y: GROUND - 40, s: 44 }
            ],
            memories: [{ x: 500 }, { x: 1400 }, { x: 2100 }],
            triggers: [
                { x: 50, beat: "start" },
                { x: 720, beat: "szulok" },
                { x: 1160, beat: "poenok" },
                { x: 1580, beat: null, minigame: true },
                { x: 1700, beat: "baratno" },
                { x: 2320, beat: "vonat" }
            ]
        },
        /* 5 */ {
            length: 3700,
            npcs: [{ who: "emma", x: 3560, pose: "shy" }],
            props: [
                { name: "prop_phone", x: 700, y: GROUND - 130, s: 56 },
                { name: "prop_heart", x: 2120, y: GROUND - 150, s: 46 },
                { name: "prop_cake", x: 3300, y: GROUND - 44, s: 48 }
            ],
            memories: [{ x: 900 }, { x: 1900 }, { x: 3100 }],
            triggers: [
                { x: 50, beat: "start" },
                { x: 720, beat: "duo" },
                { x: 1120, beat: "csend" },
                { x: 1540, beat: null, minigame: true },
                { x: 1660, beat: "alkohol" },
                { x: 2120, beat: "erett" },
                { x: 2520, beat: "randi" },
                { x: 2920, beat: "siras" },
                { x: 3320, beat: "szerelem" }
            ]
        },
        /* 6 */ {
            length: 2400,
            npcs: [
                { who: "emma", x: 820, pose: "shy" },
                { who: "csabi", x: 1600, pose: "idle" },
                { who: "zoe", x: 1660, pose: "idle" },
                { who: "emma", x: 1960, pose: "happy" }
            ],
            props: [
                { name: "prop_beaker", x: 1420, y: GROUND - 44, s: 48 },
                { name: "prop_cake", x: 2260, y: GROUND - 44, s: 52 }
            ],
            memories: [{ x: 480 }, { x: 1120 }, { x: 2150 }],
            triggers: [
                { x: 50, beat: "start" },
                { x: 820, beat: "ujra" },
                { x: 1240, beat: null, minigame: true, after: "after_game" },
                { x: 1960, beat: "zaras" }
            ]
        }
    ];

    /* ------------------------------------------------------------------ */
    /* Hatter: proceduralis parallax, ha nincs bg_chN.png                  */
    /* ------------------------------------------------------------------ */
    function hash(n) {
        var x = Math.sin(n * 12.9898) * 43758.5453;
        return x - Math.floor(x);
    }

    function sky(ctx, colors) {
        var g = ctx.createLinearGradient(0, 0, 0, 460);
        g.addColorStop(0, colors[0]);
        g.addColorStop(1, colors[1]);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 960, 460);
    }

    function clouds(ctx, camX, tint) {
        for (var i = 0; i < 8; i++) {
            var bx = (i * 520 + hash(i) * 300 - camX * 0.2) % 2200;
            if (bx < -260) bx += 2200;
            var by = 46 + hash(i + 9) * 120;
            var s = 0.7 + hash(i + 3) * 0.7;
            ctx.save();
            ctx.globalAlpha = 0.75;
            ctx.fillStyle = tint || "#ffffff";
            ctx.beginPath();
            ctx.ellipse(bx, by, 66 * s, 24 * s, 0, 0, Math.PI * 2);
            ctx.ellipse(bx + 48 * s, by + 8, 44 * s, 18 * s, 0, 0, Math.PI * 2);
            ctx.ellipse(bx - 44 * s, by + 10, 38 * s, 16 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    function pine(ctx, x, y, s, c1, c2) {
        ctx.fillStyle = "#5a3f2a";
        ctx.fillRect(x - 5 * s, y - 26 * s, 10 * s, 26 * s);
        for (var k = 0; k < 3; k++) {
            ctx.fillStyle = k % 2 ? c2 : c1;
            ctx.beginPath();
            ctx.moveTo(x, y - (86 + k * -6) * s);
            ctx.lineTo(x - (34 - k * 6) * s, y - (30 + k * 16) * s);
            ctx.lineTo(x + (34 - k * 6) * s, y - (30 + k * 16) * s);
            ctx.closePath();
            ctx.fill();
        }
    }

    function tree(ctx, x, y, s, leaf) {
        ctx.fillStyle = "#6b4a2f";
        ctx.fillRect(x - 7 * s, y - 44 * s, 14 * s, 44 * s);
        ctx.fillStyle = leaf;
        ctx.beginPath();
        ctx.ellipse(x, y - 66 * s, 44 * s, 38 * s, 0, 0, Math.PI * 2);
        ctx.ellipse(x - 32 * s, y - 46 * s, 28 * s, 24 * s, 0, 0, Math.PI * 2);
        ctx.ellipse(x + 32 * s, y - 48 * s, 30 * s, 25 * s, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    function building(ctx, x, y, w, h, c, win) {
        ctx.fillStyle = c;
        ctx.fillRect(x, y - h, w, h);
        ctx.fillStyle = win;
        for (var r = 0; r < Math.floor(h / 46); r++) {
            for (var q = 0; q < Math.floor(w / 44); q++) {
                if (hash(x + r * 7 + q * 13) > 0.32) {
                    ctx.fillRect(x + 14 + q * 44, y - h + 18 + r * 46, 20, 26);
                }
            }
        }
    }

    var Backdrop = {
        draw: function (ctx, ch, camX) {
            var id = ch.id;
            if (Art.bg(ctx, ch.bg, -camX * 0.25 % 960 - 0, 0, 960, 540)) {
                /* rajzolt hatter: meg egy csik hogy vegtelen legyen */
                Art.bg(ctx, ch.bg, (-camX * 0.25 % 960) + 960, 0, 960, 540);
            } else {
                sky(ctx, ch.sky);
                if (id === 1) this.schoolYard(ctx, camX);
                else if (id === 2) this.night(ctx, camX);
                else if (id === 3) this.mountains(ctx, camX);
                else if (id === 4) this.corridor(ctx, camX);
                else if (id === 5) this.lake(ctx, camX);
                else this.autumn(ctx, camX);
            }
            /* talaj */
            ctx.fillStyle = ch.ground;
            ctx.fillRect(0, GROUND, 960, 540 - GROUND);
            ctx.fillStyle = "rgba(0,0,0,.16)";
            ctx.fillRect(0, GROUND, 960, 7);
            /* fugazas a talajon, hogy erezd a mozgast */
            ctx.fillStyle = "rgba(0,0,0,.08)";
            for (var i = 0; i < 14; i++) {
                var gx = (i * 90 - (camX % 90));
                ctx.fillRect(gx, GROUND + 18, 46, 5);
            }
        },

        schoolYard: function (ctx, camX) {
            clouds(ctx, camX);
            for (var i = 0; i < 8; i++) {
                var bx = (i * 400 - camX * 0.45) % 3200;
                if (bx < -320) bx += 3200;
                building(ctx, bx, GROUND, 210 + hash(i) * 90, 150 + hash(i + 2) * 110, "#c8b6a8", "#f5e9c9");
            }
            for (var j = 0; j < 12; j++) {
                var tx = (j * 300 - camX * 0.8) % 3600;
                if (tx < -160) tx += 3600;
                tree(ctx, tx, GROUND + 6, 0.9 + hash(j) * 0.4, "#5f9e4f");
            }
        },

        night: function (ctx, camX) {
            for (var i = 0; i < 70; i++) {
                var sx = (hash(i) * 2600 - camX * 0.1) % 2600;
                if (sx < 0) sx += 2600;
                var sy = hash(i + 50) * 300;
                ctx.globalAlpha = 0.35 + hash(i + 7) * 0.6;
                ctx.fillStyle = "#fff8fb";
                ctx.fillRect(sx, sy, 2, 2);
            }
            ctx.globalAlpha = 1;
            for (var b = 0; b < 8; b++) {
                var bx = (b * 380 - camX * 0.5) % 3040;
                if (bx < -300) bx += 3040;
                building(ctx, bx, GROUND, 190 + hash(b) * 100, 180 + hash(b + 4) * 130, "#241b34", "#f2c85c");
            }
            /* lampak */
            for (var l = 0; l < 10; l++) {
                var lx = (l * 300 - camX * 0.95) % 3000;
                if (lx < -60) lx += 3000;
                ctx.fillStyle = "#1a1424";
                ctx.fillRect(lx, GROUND - 130, 6, 130);
                ctx.save();
                var g = ctx.createRadialGradient(lx + 3, GROUND - 134, 4, lx + 3, GROUND - 134, 88);
                g.addColorStop(0, "rgba(255,214,120,.55)");
                g.addColorStop(1, "rgba(255,214,120,0)");
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(lx + 3, GROUND - 134, 88, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        },

        mountains: function (ctx, camX) {
            clouds(ctx, camX);
            /* hattervonulat */
            for (var m = 0; m < 10; m++) {
                var mx = (m * 340 - camX * 0.3) % 3400;
                if (mx < -340) mx += 3400;
                var mh = 160 + hash(m) * 130;
                ctx.fillStyle = "#7d94a8";
                ctx.beginPath();
                ctx.moveTo(mx - 220, GROUND);
                ctx.lineTo(mx, GROUND - mh);
                ctx.lineTo(mx + 220, GROUND);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = "#e8f2f7";
                ctx.beginPath();
                ctx.moveTo(mx - 42, GROUND - mh + 46);
                ctx.lineTo(mx, GROUND - mh);
                ctx.lineTo(mx + 42, GROUND - mh + 46);
                ctx.closePath();
                ctx.fill();
            }
            for (var p = 0; p < 18; p++) {
                var px = (p * 210 - camX * 0.85) % 3780;
                if (px < -120) px += 3780;
                pine(ctx, px, GROUND + 8, 0.8 + hash(p) * 0.5, "#2f6b3a", "#3d8047");
            }
        },

        corridor: function (ctx, camX) {
            ctx.fillStyle = "#e3d2da";
            ctx.fillRect(0, 120, 960, GROUND - 120);
            /* ablakok */
            for (var i = 0; i < 14; i++) {
                var wx = (i * 260 - camX * 0.9) % 3640;
                if (wx < -180) wx += 3640;
                ctx.fillStyle = "#f7f2e4";
                ctx.fillRect(wx, 150, 150, 180);
                ctx.fillStyle = "#bfe0f0";
                ctx.fillRect(wx + 10, 160, 130, 160);
                ctx.fillStyle = "#f7f2e4";
                ctx.fillRect(wx + 70, 160, 10, 160);
                ctx.fillRect(wx + 10, 232, 130, 10);
            }
            /* szekrenyek */
            for (var l = 0; l < 20; l++) {
                var lx = (l * 190 - camX) % 3800;
                if (lx < -130) lx += 3800;
                ctx.fillStyle = "#9c7f92";
                ctx.fillRect(lx, GROUND - 150, 120, 150);
                ctx.fillStyle = "#8a6f80";
                ctx.fillRect(lx + 8, GROUND - 142, 46, 134);
                ctx.fillRect(lx + 62, GROUND - 142, 46, 134);
                ctx.fillStyle = "#d8c4cf";
                ctx.fillRect(lx + 44, GROUND - 96, 6, 6);
                ctx.fillRect(lx + 98, GROUND - 96, 6, 6);
            }
        },

        lake: function (ctx, camX) {
            /* nap */
            var sx = 780 - camX * 0.05 % 200;
            ctx.save();
            var g = ctx.createRadialGradient(sx, 110, 20, sx, 110, 150);
            g.addColorStop(0, "rgba(255,240,180,.95)");
            g.addColorStop(1, "rgba(255,240,180,0)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(sx, 110, 150, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            clouds(ctx, camX, "#fff6e8");
            /* viz */
            ctx.fillStyle = "#4f9fc4";
            ctx.fillRect(0, 300, 960, GROUND - 300);
            for (var i = 0; i < 40; i++) {
                var wx = (i * 90 - camX * 0.6 + Math.sin(G.t * 1.4 + i) * 14) % 3600;
                if (wx < 0) wx += 3600;
                ctx.fillStyle = "rgba(255,255,255,.35)";
                ctx.fillRect(wx % 960, 314 + (i % 6) * 22, 34, 3);
            }
            /* nadas */
            for (var r = 0; r < 26; r++) {
                var rx = (r * 150 - camX * 0.95) % 3900;
                if (rx < -40) rx += 3900;
                ctx.fillStyle = "#7a8b4a";
                ctx.fillRect(rx, GROUND - 70, 4, 70);
                ctx.fillStyle = "#8f6b3a";
                ctx.fillRect(rx - 2, GROUND - 82, 8, 16);
            }
        },

        autumn: function (ctx, camX) {
            clouds(ctx, camX, "#fffaf2");
            for (var i = 0; i < 8; i++) {
                var bx = (i * 420 - camX * 0.45) % 3360;
                if (bx < -340) bx += 3360;
                building(ctx, bx, GROUND, 220 + hash(i) * 80, 160 + hash(i + 5) * 90, "#c4b3a2", "#f7ebc8");
            }
            var leaves = ["#c8863f", "#b8563f", "#d8a44a", "#8f9e4a"];
            for (var j = 0; j < 14; j++) {
                var tx = (j * 280 - camX * 0.82) % 3920;
                if (tx < -160) tx += 3920;
                tree(ctx, tx, GROUND + 6, 0.85 + hash(j) * 0.45, leaves[j % 4]);
            }
            /* hullo levelek */
            for (var k = 0; k < 22; k++) {
                var lx = (k * 130 - camX * 0.9 + Math.sin(G.t * 0.8 + k) * 40) % 2860;
                if (lx < 0) lx += 2860;
                var ly = ((G.t * 40 + k * 90) % 520);
                ctx.save();
                ctx.globalAlpha = 0.8;
                ctx.fillStyle = leaves[k % 4];
                ctx.translate(lx % 960, ly);
                ctx.rotate(G.t + k);
                ctx.fillRect(-5, -3, 10, 6);
                ctx.restore();
            }
        }
    };

    global.LEVELS = LEVELS;
    global.Backdrop = Backdrop;
    global.GROUND_Y = GROUND;
})(window);
