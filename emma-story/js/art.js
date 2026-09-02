/* Copyright (C) 2026 SharpEmu Emulator Project
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
/* Az Emma Sztori - art layer.
 *
 * Minden sprite-nak van egy proceduralis "placeholder" valtozata, ami kodbol
 * rajzolodik, es van egy nev szerinti slotja. Ha az assets/art/<nev>.png letezik,
 * a jatek automatikusan azt hasznalja helyette. Igy a jatek most is fut, es
 * ahogy jonnek a rajzok, ugy lesz szep. A slotok listaja: Art.SLOTS.
 */
(function (global) {
    "use strict";

    var PATH = "assets/art/";

    /* --- paletta ------------------------------------------------------- */
    var P = {
        skin: "#f2c9a8", skinShade: "#d9a683",
        zsigaHair: "#3b2a20", zsigaTop: "#c8443f", zsigaTopShade: "#9c322e",
        emmaHair: "#6b4630", emmaTop: "#a98ad6", emmaTopShade: "#8467b3",
        zoeHair: "#e0bb62", zoeTop: "#4fb3a4", zoeTopShade: "#3a8a7e",
        boyHair: "#2b2b33", boyTop: "#5b7fbf", boyTopShade: "#44619b",
        jeans: "#4a5b86", jeansShade: "#36446a",
        shoe: "#2a2430", ink: "#2a1f33", white: "#fff8fb"
    };

    var PEOPLE = {
        zsiga: { hair: P.zsigaHair, top: P.zsigaTop, shade: P.zsigaTopShade, long: false, mark: "7" },
        emma: { hair: P.emmaHair, top: P.emmaTop, shade: P.emmaTopShade, long: true, mark: "♡" },
        zoe: { hair: P.zoeHair, top: P.zoeTop, shade: P.zoeTopShade, long: true, pony: true },
        csabi: { hair: P.boyHair, top: P.boyTop, shade: P.boyTopShade, long: false },
        marci: { hair: "#4a3520", top: "#7bc47f", shade: "#5c9b60", long: false },
        toni: { hair: "#1f1f24", top: "#e0a34c", shade: "#b8813a", long: false },
        balint: { hair: "#5a4a3a", top: "#8a8f99", shade: "#6a6f79", long: false }
    };

    /* --- slotok: ide jonnek a rajzok ----------------------------------- */
    var SLOTS = [
        { name: "zsiga", kind: "person", desc: "Te, allo poz, szemben (atlatszo hatter)" },
        { name: "emma", kind: "person", desc: "Emma, allo poz, farmer + one piece pulcsi" },
        { name: "zoe", kind: "person", desc: "Zoe, allo poz" },
        { name: "csabi", kind: "person", desc: "Csabi" },
        { name: "portrait_zsiga", kind: "portrait", desc: "Te - fejportre a szovegbuborekhoz" },
        { name: "portrait_emma", kind: "portrait", desc: "Emma - fejportre" },
        { name: "portrait_zoe", kind: "portrait", desc: "Zoe - fejportre" },
        { name: "bg_ch1", kind: "bg", desc: "1. fejezet - suli udvar / Kempelen nap" },
        { name: "bg_ch2", kind: "bg", desc: "2. fejezet - esti szoba, telefon fenye" },
        { name: "bg_ch3", kind: "bg", desc: "3. fejezet - Erdely, hegyek, fenyok" },
        { name: "bg_ch4", kind: "bg", desc: "4. fejezet - suli folyoso / kemia terem" },
        { name: "bg_ch5", kind: "bg", desc: "5. fejezet - Balaton, nyar, tavolsag" },
        { name: "bg_ch6", kind: "bg", desc: "6. fejezet - szeptemberi suli, reggeli fény" },
        { name: "prop_pancake", kind: "prop", desc: "Palacsinta" },
        { name: "prop_book", kind: "prop", desc: "Konyv (Harry Potter / Leiner Laura)" },
        { name: "prop_ball", kind: "prop", desc: "Roplabda" },
        { name: "prop_phone", kind: "prop", desc: "Telefon uzenettel" },
        { name: "prop_heart", kind: "prop", desc: "Piros sziv" },
        { name: "prop_memory", kind: "prop", desc: "Emlek-csillag (gyujtheto)" },
        { name: "prop_beaker", kind: "prop", desc: "Kemcso hipermanganattal (lila)" },
        { name: "prop_cake", kind: "prop", desc: "Szulinapi torta" }
    ];

    var images = {};
    var loading = 0;

    function px(ctx, s, x, y, w, h, c) {
        ctx.fillStyle = c;
        ctx.fillRect(Math.round(x * s), Math.round(y * s), Math.ceil(w * s), Math.ceil(h * s));
    }

    /* Proceduralis ember 16x26-os racson. */
    function drawPerson(ctx, key, w, h, pose, t) {
        var c = PEOPLE[key] || PEOPLE.csabi;
        var s = w / 16;
        var bob = 0;
        var legA = 0, legB = 0, armA = 0, armB = 0, lean = 0;

        if (pose === "walkA") { legA = 1; legB = -1; armA = -1; armB = 1; bob = -0.4; }
        else if (pose === "walkB") { legA = -1; legB = 1; armA = 1; armB = -1; bob = 0; }
        else if (pose === "jump") { legA = -2; legB = -1; armA = -3; armB = -3; bob = -0.8; }
        else if (pose === "sit") { bob = 3; }
        else if (pose === "happy") { armA = -2; armB = -2; bob = -0.5 + Math.sin(t * 6) * 0.3; }
        else if (pose === "shy") { armA = 1; armB = 1; lean = 0.6; }
        else { bob = Math.sin(t * 2.2) * 0.22; }

        ctx.save();
        ctx.translate(lean * s, bob * s);

        /* haj hatul */
        if (c.long) px(ctx, s, 4, 3, 8, pose === "sit" ? 9 : 12, c.hair);
        if (c.pony) px(ctx, s, 12, 5, 3, 7, c.hair);

        /* labak */
        if (pose === "sit") {
            /* ul: felsolab elore, labszar le - a talp pont a talajon all */
            px(ctx, s, 4, 14, 9, 3, P.jeans);
            px(ctx, s, 10, 17, 3, 4, P.jeansShade);
            px(ctx, s, 9, 21, 5, 2, P.shoe);
        } else {
            px(ctx, s, 5, 18 + legA, 3, 6 - legA, P.jeans);
            px(ctx, s, 9, 18 + legB, 3, 6 - legB, P.jeansShade);
            px(ctx, s, 5, 24, 3, 2, P.shoe);
            px(ctx, s, 9, 24, 3, 2, P.shoe);
        }

        /* torzso */
        px(ctx, s, 4, 10, 8, 8, c.top);
        px(ctx, s, 4, 16, 8, 2, c.shade);

        /* karok */
        px(ctx, s, 2, 11 + armA, 2, 6, c.shade);
        px(ctx, s, 12, 11 + armB, 2, 6, c.shade);
        px(ctx, s, 2, 16 + armA, 2, 2, P.skin);
        px(ctx, s, 12, 16 + armB, 2, 2, P.skin);

        /* fej */
        px(ctx, s, 5, 3, 6, 7, P.skin);
        px(ctx, s, 5, 9, 6, 1, P.skinShade);
        px(ctx, s, 4, 2, 8, 3, c.hair);
        if (!c.long) px(ctx, s, 4, 2, 3, 4, c.hair);

        /* szemek + szaj */
        var blink = (Math.sin(t * 1.3 + key.length) > 0.97);
        if (!blink) {
            px(ctx, s, 6, 6, 1, 2, P.ink);
            px(ctx, s, 9, 6, 1, 2, P.ink);
        } else {
            px(ctx, s, 6, 7, 1, 1, P.ink);
            px(ctx, s, 9, 7, 1, 1, P.ink);
        }
        if (pose === "happy") px(ctx, s, 7, 8, 2, 1, P.ink);
        else px(ctx, s, 7, 8, 1, 1, P.skinShade);

        /* pirulas */
        if (pose === "shy" || pose === "happy") {
            ctx.globalAlpha = 0.5;
            px(ctx, s, 5, 7, 1, 1, "#ef7a9b");
            px(ctx, s, 10, 7, 1, 1, "#ef7a9b");
            ctx.globalAlpha = 1;
        }

        ctx.restore();
    }

    function drawPortrait(ctx, key, w, h, t) {
        var c = PEOPLE[key] || PEOPLE.csabi;
        var s = w / 16;
        ctx.save();
        px(ctx, s, 1, 2, 14, 14, c.top);
        if (c.long) px(ctx, s, 2, 1, 12, 13, c.hair);
        px(ctx, s, 4, 2, 8, 9, P.skin);
        px(ctx, s, 3, 1, 10, 3, c.hair);
        if (!c.long) px(ctx, s, 3, 1, 4, 4, c.hair);
        px(ctx, s, 6, 6, 1, 2, P.ink);
        px(ctx, s, 10, 6, 1, 2, P.ink);
        px(ctx, s, 7, 9, 3, 1, "#c2607a");
        ctx.restore();
    }

    function drawProp(ctx, name, w, h, t) {
        var s = w / 16;
        var f = Math.sin(t * 3) * 0.5;
        switch (name) {
            case "prop_pancake":
                px(ctx, s, 2, 7, 12, 4, "#d9a05b");
                px(ctx, s, 3, 6, 10, 2, "#f0c078");
                px(ctx, s, 6, 5, 4, 2, "#8a4a2a");
                break;
            case "prop_book":
                px(ctx, s, 3, 3, 10, 11, "#7c4bb0");
                px(ctx, s, 4, 4, 8, 9, "#f6eef8");
                px(ctx, s, 5, 6, 6, 1, "#9a7fb8");
                px(ctx, s, 5, 8, 6, 1, "#9a7fb8");
                break;
            case "prop_ball":
                px(ctx, s, 4, 4, 8, 8, P.white);
                px(ctx, s, 4, 7, 8, 1, "#e8a13c");
                px(ctx, s, 7, 4, 1, 8, "#4b8fd6");
                break;
            case "prop_phone":
                px(ctx, s, 5, 2, 6, 12, "#2a2430");
                px(ctx, s, 6, 3, 4, 9, "#bfe4f2");
                px(ctx, s, 7, 5, 2, 1, "#e8628c");
                px(ctx, s, 7, 7, 2, 1, "#e8628c");
                break;
            case "prop_heart":
                ctx.save();
                ctx.translate(w / 2, h / 2 + f * s);
                ctx.scale(w / 32, h / 32);
                ctx.beginPath();
                ctx.moveTo(0, 11);
                ctx.bezierCurveTo(-15, 1, -13, -12, -5.5, -12);
                ctx.bezierCurveTo(-1.5, -12, 0, -8.5, 0, -6.5);
                ctx.bezierCurveTo(0, -8.5, 1.5, -12, 5.5, -12);
                ctx.bezierCurveTo(13, -12, 15, 1, 0, 11);
                ctx.closePath();
                ctx.fillStyle = "#e8628c";
                ctx.fill();
                ctx.strokeStyle = "#b83c66";
                ctx.lineWidth = 1.6;
                ctx.stroke();
                ctx.beginPath();
                ctx.ellipse(-5, -5, 2.6, 1.8, -0.5, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255,255,255,.62)";
                ctx.fill();
                ctx.restore();
                break;
            case "prop_memory":
                ctx.save();
                ctx.translate(w / 2, h / 2 + f * s);
                ctx.rotate(Math.sin(t * 0.9) * 0.18);
                ctx.beginPath();
                for (var q = 0; q < 10; q++) {
                    var ang = -Math.PI / 2 + q * Math.PI / 5;
                    var rad = (q % 2 ? w * 0.19 : w * 0.44);
                    ctx[q ? "lineTo" : "moveTo"](Math.cos(ang) * rad, Math.sin(ang) * rad);
                }
                ctx.closePath();
                var gg = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
                gg.addColorStop(0, "#fff3c4");
                gg.addColorStop(1, "#ffc93c");
                ctx.fillStyle = gg;
                ctx.fill();
                ctx.strokeStyle = "#e0a021";
                ctx.lineWidth = 1.4;
                ctx.stroke();
                ctx.restore();
                break;
            case "prop_beaker":
                px(ctx, s, 5, 3, 6, 2, "#cfe7f0");
                px(ctx, s, 5, 5, 6, 8, "#cfe7f0");
                px(ctx, s, 6, 8, 4, 5, "#8b3fb0");
                px(ctx, s, 6, 7, 4, 1, "#b061d6");
                break;
            case "prop_cake":
                px(ctx, s, 3, 8, 10, 5, "#f6d7e2");
                px(ctx, s, 3, 7, 10, 2, "#e8628c");
                px(ctx, s, 7, 3, 2, 4, "#fff3c4");
                px(ctx, s, 7, 2, 2, 1, "#ffb03a");
                break;
            default:
                px(ctx, s, 4, 4, 8, 8, "#e8628c");
        }
    }

    var Art = {
        SLOTS: SLOTS,
        PEOPLE: PEOPLE,
        palette: P,

        /* Megprobal minden slotot betolteni; a hianyzo png-k csendben kimaradnak. */
        preload: function (done) {
            var pending = SLOTS.length;
            if (!pending) return done();
            SLOTS.forEach(function (slot) {
                var img = new Image();
                img.onload = function () {
                    images[slot.name] = img;
                    if (--pending === 0) done();
                };
                img.onerror = function () {
                    if (--pending === 0) done();
                };
                img.src = PATH + slot.name + ".png";
            });
        },

        has: function (name) { return !!images[name]; },
        missing: function () {
            return SLOTS.filter(function (s) { return !images[s.name]; }).map(function (s) { return s.name; });
        },

        /* Ember kirajzolasa. x,y a bal-also sarok. */
        person: function (ctx, key, x, y, h, pose, t, flip) {
            var w = h * (16 / 26);
            ctx.save();
            ctx.translate(x + (flip ? w : 0), y - h);
            if (flip) ctx.scale(-1, 1);
            if (images[key]) {
                var bob = pose === "walkA" ? -h * 0.02 : pose === "walkB" ? h * 0.01 : Math.sin(t * 2.2) * h * 0.008;
                var sq = pose === "jump" ? 1.04 : 1;
                ctx.drawImage(images[key], 0, bob, w, h * sq);
            } else {
                drawPerson(ctx, key, w, h, pose, t);
            }
            ctx.restore();
        },

        portrait: function (ctx, key, x, y, size, t) {
            var slot = "portrait_" + key;
            ctx.save();
            ctx.translate(x, y);
            if (images[slot]) ctx.drawImage(images[slot], 0, 0, size, size);
            else if (images[key]) {
                /* egesz-test rajz felso reszet vagjuk ki portrenak */
                var im = images[key];
                ctx.drawImage(im, 0, 0, im.width, im.width, 0, 0, size, size);
            } else drawPortrait(ctx, key, size, size, t);
            ctx.restore();
        },

        prop: function (ctx, name, x, y, size, t) {
            ctx.save();
            ctx.translate(x, y);
            if (images[name]) ctx.drawImage(images[name], 0, 0, size, size);
            else drawProp(ctx, name, size, size, t);
            ctx.restore();
        },

        /* Hatterkep, ha van; kulonben false -> a level rajzolja proceduralisan. */
        bg: function (ctx, name, x, y, w, h) {
            if (!images[name]) return false;
            ctx.drawImage(images[name], x, y, w, h);
            return true;
        }
    };

    global.Art = Art;
})(window);
