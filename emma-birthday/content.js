/* Copyright (C) 2026 SharpEmu Emulator Project
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* AZ AJANDEK SZOVEGE.  Csak ezt a fajlt kell szerkeszteni, ha at akarsz irni
 * valamit. A kodhoz nem kell hozzanyulni. */

/* ------------------------------------------------------------------ *
 * A HELY - ahol hivatalosan osszejottetek
 * ------------------------------------------------------------------ *
 * name:    ez latszik a lapon
 * link:    a Google Maps link (ez MINDENHOL mukodik, artifactben is)
 *
 * A 360-as korbenezeshez KETTO kozul eleg az egyik:
 *
 * coords:  a hely koordinatai, pl. "46.5401, 24.5580".  Ez a konnyebb ut:
 *          Google Maps -> jobb klikk a helyre -> a legfelso sor a koordinata,
 *          rakattintva vagolapra kerul.  Ebbol maga a lap epiti a Street View
 *          beagyazast, nem kell hozza API kulcs.
 * heading: melyik iranyba nezzen indulaskor, 0-359 fok (0 = eszak). Elhagyhato.
 *
 * embed:   VAGY a teljes beagyazo URL, ha az pontosabb kepet ad:
 *          Google Maps -> a hely Street View kepe -> "Megosztas"
 *          -> "Terkep beagyazasa" -> HTML masolasa -> a <iframe src="...">
 *          erteke (a https://www.google.com/maps/embed?pb=... kezdetu URL).
 *          Ha ez ki van tolve, a coords-ot felulirja.
 *
 * Ha egyik sincs megadva - vagy a bongeszo blokkolja a beagyazast, ami Claude
 * artifactben mindig igy van -, akkor a rajzolt alkonyati jelenet latszik.
 */
window.PLACE = {
    name: "Erdély",
    link: "https://maps.app.goo.gl/QEsHS4qS6WmShFi5A",
    coords: "",
    heading: 0,
    embed: ""
};

/* ------------------------------------------------------------------ *
 * A KOZOS EMLEKEK - idorendben, apriltol augusztusig
 * ------------------------------------------------------------------ *
 * when:  ami az idoszalagon latszik (rovid)
 * date:  a kartya fejlecen
 * title: a kartya cime (kezirasos betuvel)
 * body:  a szoveg - neki szol, egyes szemelyben
 * quote: egy igazi mondat kozuletek (elhagyhato, akkor toroljd a sort)
 * who:   ki mondta az idezetet: "emma" vagy "zsiga"
 */
window.MEMORIES = [
    {
        when: "ápr.",
        date: "április · Kempelen nap",
        title: "Nyolc palacsinta",
        body: "Zoe-val fogadtunk, és én ott az udvaron megettem nyolcat. Te meg nevettél, és odajöttél. Öt éve voltunk osztálytársak, és ez volt az első rendes beszélgetésünk.",
        quote: "te most komolyan hét palacsintát ettél meg",
        who: "emma"
    },
    {
        when: "ápr.",
        date: "április · a csoportos chat",
        title: "Egy sor, amit nem felejtek",
        body: "Bálint leszólta a rajzomat, te meg egyetlen sorral lezártad az egészet. Nyilvánosan, ahol mindenki látta. Nem tudom, emlékszel-e rá — én igen.",
        quote: "a balintra nem kell halgatni",
        who: "emma"
    },
    {
        when: "ápr.",
        date: "április",
        title: "A one piece-es pulcsi",
        body: "Megjött, és megmutattad nekem, és megkérdezted, hogy tetszik-e. Nem a pulcsiról volt szó. Arról, hogy nekem mutattad meg.",
        quote: "figyu megjött az új pulcsim. one piece-es. tetszik?",
        who: "emma"
    },
    {
        when: "máj.",
        date: "május · Erdély, a busz",
        title: "Solo Leveling",
        body: "Egymásnak dőlve néztük egy telefonon, minden kanyarban nyikorgott a busz, és te végig szidtad, hogy a fickó túl erős. Aztán végignéztük.",
        quote: "ez a fickó túl erős, ez így nem izgalmas",
        who: "emma"
    },
    {
        when: "máj.",
        date: "május · Erdély",
        title: "A szék",
        body: "Nem én mentem oda. Te jöttél. Azt mondtad, meggondoltad magad. Aztán megfogtam a kezed a szék karfáján, és egyikünk sem szólt semmit. Ez az a hely, ami mögötted van a háttérben.",
        quote: "meggondoltam magam. mégis akarom. veled.",
        who: "emma"
    },
    {
        when: "máj.",
        date: "május–június · kémia",
        title: "Hipermangán",
        body: "Egy szó, amin rajtunk kívül senki nem nevet. Meg a gooner szerva, ami röplabdában nem is létezik. Van egy nyelvünk, amit ketten beszélünk.",
        quote: "ez röplabdában nem is létezik",
        who: "emma"
    },
    {
        when: "jún.",
        date: "június · vonat",
        title: "Ne mozogj",
        body: "Egynapos kirándulás, fogtad a kezem, és a válladra… illetve a vállamra döntötted a fejed, és annyit mondtál, hogy ne mozogjak. Negyven percig nem mozogtam.",
        quote: "ne mozogj most jó",
        who: "emma"
    },
    {
        when: "aug.",
        date: "nyár · 300 kilométer",
        title: "Negyvenegy nap",
        body: "Te a Balatonon, én máshol, és egy zöld bagoly tartotta össze a napjainkat. Volt, hogy napi száz üzenet ment. Ezt te írtad, én meg elmentettem.",
        quote: "Mar varom a hetfot de csak miattad",
        who: "emma"
    }
];

/* ------------------------------------------------------------------ *
 * A SZOVEGEK
 * ------------------------------------------------------------------ */
window.COPY = {
    greeting: "Boldog szülinapot, Emma",
    subtitle: "szeptember 16.",

    /* az elso hint, amig egy emlek sincs megnyitva */
    hintStart: "Nézz körül a helyen — és nyisd ki az emlékeket az idővonalon.",
    /* kozben */
    hintMid: "Minden emlék egy gyertya.",
    /* amikor mind a nyolc megvan */
    hintDone: "Megvan mind a nyolc. Fújd el.",
    /* a fujas kozben */
    hintBlow: "Tartsd nyomva…",

    blowLabel: "Fújd el a gyertyákat",

    /* a zaro uzenet - a gyertyak elfujasa utan */
    finaleTitle: "Boldog szülinapot 🤍",
    finaleLines: [
        "Nem tudtam, mit vegyek, ezért csináltam valamit.",
        "Ez az a hely, és ezek azok a dolgok, amikre emlékszem.",
        "Négy hónap volt. És most van egy egész tanévünk."
    ],
    signature: "— Zsiga",

    /* ha a 360-as korbenezes nem tud betoltodni */
    embedFallback: "A 360°-os körbenézés itt nem tud betöltődni — nyisd meg a helyet a Maps-ben.",
    mapsLabel: "Nyisd meg a Maps-ben"
};
