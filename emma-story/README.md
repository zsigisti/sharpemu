<!--
Copyright (C) 2026 SharpEmu Emulator Project
SPDX-License-Identifier: GPL-2.0-or-later
-->

# Az Emma Sztori — végigjátszható változat

> **Átadás / kontextus:** a teljes sztori, a projekt állása és a következő
> lépések itt: [`emma-birthday/HANDOFF.md`](../emma-birthday/HANDOFF.md).
> Az aktív munka a szülinapi ajándék (`emma-birthday/`), nem ez.

Egy böngészős játék, ami végigmegy az egész sztorin: április (a felismerés) →
szeptember (most). Hat fejezet, mindegyikben sétálás, párbeszéd, döntések és egy
minijáték.

**Nem kell telepíteni semmit.** Nyisd meg az `index.html`-t egy böngészőben, és megy.

```
# ha localhostról szeretnéd (ez a szebb, mert a rajzok is biztosan betöltenek):
cd emma-story
python3 -m http.server 8000
# aztán: http://localhost:8000
```

## Irányítás

| gomb | mit tesz |
|---|---|
| `◀ ▶` vagy `A` / `D` | mozgás |
| `SPACE` vagy `▲` / `W` | ugrás — párbeszédben: tovább |
| `E` / `ENTER` | tovább / kiválaszt |
| `↑ ↓` | választásoknál a lehetőségek közt |
| `ESC` | minijáték átugrása (ha beragadtál) |
| `T` | a rajz-lista (a címképernyőn) |
| `M` | hang ki/be |
| `R` | újrakezdés (a címképernyőn) |

Mobilon a képernyő alján van négy gomb, és a párbeszédet koppintással is lehet
pörgetni. Fekvő tájolás kell hozzá.

## Ami benne van

| # | fejezet | minijáték |
|---|---|---|
| 1 | A felismerés (április) | **Palacsinta evő verseny** — verd a SPACE-t Zoe ellen |
| 2 | Zoe megerősít (április vége) | **Olvasd a jeleket** — kapd el a valódi jeleket, hagyd a félelmeket |
| 3 | Erdély (május 4–9.) | **Ne pushold** — maradj a zöld sávban, ne told túl |
| 4 | Az első hetek (május–június) | **Belső poénok** — memóriajáték a saját nyelvetekből |
| 5 | A nyár (június–augusztus) | **300 kilométer** — tartsd életben a chatet, kerüld az 5 nap csendet |
| 6 | Szeptember (most) | **Újra beszélni** — rakd össze a mondatokat |

Minden fejezetben **3 emlék-csillag** van elrejtve (összesen 18), és a döntéseidre
**szívpontot** kapsz. Mind a kettő elmentődik a böngészőben, és a végén megjelenik.

A végén van egy élő visszaszámláló **szeptember 16-ig**.

## ⭐ Amit tőled kérek: rajzok

A játék **most is fut**, mert minden szereplőnek és háttérnek van egy kódból
rajzolt placeholder változata. De az egész sokkal szebb lesz a te rajzaival.

Ahogy egy rajz elkészül, tedd ide:

```
emma-story/assets/art/<pontosan_ez_a_nev>.png
```

és a játék **magától átveszi**, kódot nem kell hozzányúlni. A címképernyőn a `T`
gomb megmutatja, melyik van már meg (✓) és mi hiányzik.

### Karakterek — átlátszó hátterű PNG, kb. 200 × 325 px, szemből, egész test

| fájlnév | mi legyen rajta |
|---|---|
| `zsiga.png` | te — álló poz, szemben |
| `emma.png` | Emma — farmer + one piece-es pulcsi, nincs smink |
| `zoe.png` | Zoe |
| `csabi.png` | Csabi |

### Portrék — átlátszó hátterű PNG, **négyzet**, kb. 256 × 256 px, fej/váll

Ezek látszanak a szövegbuborékban, szóval ezeknek van a legnagyobb hatása.
Ha csak háromra van energiád, **ezt a hármat rajzold meg**.

| fájlnév | mi legyen rajta |
|---|---|
| `portrait_zsiga.png` | te — fejportré |
| `portrait_emma.png` | Emma — fejportré |
| `portrait_zoe.png` | Zoe — fejportré |

### Hátterek — 960 × 540 px (nem kell átlátszó)

| fájlnév | mi legyen rajta |
|---|---|
| `bg_ch1.png` | suli udvar, Kempelen nap, tömeg, tavaszi fény |
| `bg_ch2.png` | esti szoba, csak a telefon fénye |
| `bg_ch3.png` | Erdély — hegyek, fenyők, kanyargó út |
| `bg_ch4.png` | suli folyosó / kémia terem, szekrények |
| `bg_ch5.png` | Balaton, nyár, nagy távolság érzés |
| `bg_ch6.png` | szeptemberi suli, reggeli fény, sárga levelek |

### Tárgyak — átlátszó hátterű PNG, 128 × 128 px

| fájlnév | mi legyen rajta |
|---|---|
| `prop_pancake.png` | palacsinta |
| `prop_book.png` | könyv (Leiner Laura / Harry Potter) |
| `prop_ball.png` | röplabda |
| `prop_phone.png` | telefon egy üzenettel |
| `prop_heart.png` | piros szív |
| `prop_memory.png` | emlék-csillag (ez a gyűjthető) |
| `prop_beaker.png` | kémcső hipermangánnal (lila) |
| `prop_cake.png` | szülinapi torta |

Nem kell mind. Egy rajz is javít rajta. A hiányzókat a placeholder viszi tovább.

## A szöveg átírása

Az egész sztori **egy fájlban** van: `js/story.js`. Ha valamit másképp
mondtál volna, vagy hiányzik egy jelenet, csak azt kell szerkeszteni — a
kódhoz nem kell hozzányúlni. Egy párbeszéd-sor így néz ki:

```js
{ who: "emma", text: "hipermangán", pose: "happy" }
```

`who` lehet: `zsiga`, `emma`, `zoe`, `csabi`, `marci`, `toni`, `balint`, `narr`
(narrátor). A `pose` opcionális: `idle`, `shy`, `happy`, `sit`.

Egy választás pedig így:

```js
{ choice: { q: "Mit mondasz?", options: [
    { text: "\"nagyon jó, passzol hozzád\"", good: 3, reply: [ /* sorok */ ] }
] } }
```

A `good` (0–3) adja a szívpontot. Nincs game over — csak jobb vagy rosszabb
kimenet, mint az igazi életben.

## Fájlok

```
emma-story/
├── index.html
├── css/style.css
├── js/story.js       ← a teljes szöveg (ezt szerkeszd)
├── js/art.js         ← rajz-betöltés + placeholderek
├── js/engine.js      ← canvas, input, szövegbuborék, mentés
├── js/minigames.js   ← a 6 minijáték
├── js/levels.js      ← pályák, triggerek, hátterek
├── js/main.js        ← képernyők (cím, fejezet, vége)
└── assets/art/       ← ide jönnek a rajzok
```
