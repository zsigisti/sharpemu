/* Copyright (C) 2026 SharpEmu Emulator Project
 * SPDX-License-Identifier: GPL-2.0-or-later
 */
/* Az Emma Sztori - a szoveg.
 *
 * Itt lakik az egesz tortenet. Ha barmit at akarsz irni, csak ezt a fajlt
 * kell szerkesztened, a kodhoz nem kell hozzanyulni.
 *
 * Egy sor formaja:  { who: "emma", text: "...", pose: "shy" }
 *   who: zsiga | emma | zoe | csabi | marci | toni | balint | narr
 *   pose (opcionalis): idle | shy | happy | sit
 * Valasztas:        { choice: { q: "...", options: [ { text, good, reply } ] } }
 *   good: mennyi szivpontot ad (0-3). Nincs "game over", csak mas hangulat.
 */
window.STORY = {
    title: "AZ EMMA SZTORI",
    subtitle: "2026. április – szeptember",

    chapters: [

        /* ================= 1. FEJEZET ================= */
        {
            id: 1,
            title: "A FELISMERÉS",
            when: "április",
            bg: "bg_ch1",
            sky: ["#9fd4f0", "#e8f4fb"],
            ground: "#7fb069",
            intro: [
                "Kempelen nap.",
                "Zoe-val palacsinta evő versenyt csináltatok az udvaron.",
                "És valaki nézte."
            ],
            minigame: "pancake",
            outro: [
                "Ott látott meg téged igazán.",
                "Nem a partyarcot. Téged.",
                "Onnantól már ő is figyelt."
            ],
            beats: {
                start: [
                    { who: "narr", text: "Április. Kempelen nap. Az udvar tele van, valaki hangosbeszélőn kiabál." },
                    { who: "zoe", text: "zsiga! palacsinta evő verseny, most! te meg én. aki kevesebbet eszik az fizet" },
                    { who: "zsiga", text: "ez nagyon rossz üzlet neked" },
                    { who: "narr", text: "Menj jobbra a standhoz. (Nyilak / A-D a mozgás, E az interakció.)" }
                ],
                stand: [
                    { who: "zoe", text: "kész vagy?" },
                    { who: "zsiga", text: "születésem óta" },
                    { who: "narr", text: "SPACE-t verd, ahogy csak tudod!" }
                ],
                after_game: [
                    { who: "narr", text: "És ekkor észrevettél valamit a tömeg szélén." },
                    { who: "emma", text: "...", pose: "shy" },
                    { who: "narr", text: "Emma. Öt éve osztálytársak vagytok. Halk, sokat olvas, röplabdázik." },
                    { who: "narr", text: "Most viszont nevet. Rajtad." },
                    { who: "emma", text: "te most komolyan hét palacsintát ettél meg", pose: "happy" },
                    { who: "zsiga", text: "nyolc. az egyik a földön van, de az is számít" },
                    { who: "emma", text: "az nem számít bele", pose: "happy" },
                    { who: "narr", text: "Öt év után ez volt az első rendes beszélgetésetek." }
                ],
                jelek: [
                    { who: "narr", text: "A következő hetekben gyűltek a jelek. Suliban, szünetekben, magától." },
                    { who: "narr", text: "Egész testtel feléd fordult. Szemkontaktus, mosoly, tekintetelkapás." },
                    { who: "narr", text: "Szivecskézte az uzijaidat." },
                    { who: "zsiga", text: "vagy csak kedves. mindenkivel kedves." },
                    { who: "narr", text: "Igen. De nem mindenkivel hangosabb." }
                ],
                rajz: [
                    { who: "narr", text: "Egyszer csináltál egy rajzot, és azt hitte, megbántottad vele." },
                    { who: "emma", text: "bocsi ha rosszul jött ki amit írtam, nem úgy értettem, csak féltem hogy megbántottalak és tényleg nem akartam, szóval bocsi, és remélem nem haragszol", pose: "shy" },
                    { who: "zsiga", text: "emma. három sor bocsánatkérés egy rajz miatt" },
                    { who: "emma", text: "tudom. sajnálom hogy sokat sajnálkozom", pose: "shy" },
                    { who: "narr", text: "Aki nem érdeklődik, az nem magyarázkodik hosszan." }
                ],
                balint: [
                    { who: "balint", text: "hát ez a rajz elég szar zsiga" },
                    { who: "emma", text: "a balintra nem kell halgatni" },
                    { who: "narr", text: "Melléd állt. Nyilvánosan. Chaten, ahol mindenki látta." },
                    { who: "zsiga", text: "..." },
                    { who: "zsiga", text: "oké ez egy jel" }
                ],
                pulcsi: [
                    { who: "emma", text: "figyu megjött az új pulcsim. one piece-es. tetszik?", pose: "shy" },
                    { choice: {
                        q: "Mit mondasz?",
                        options: [
                            { text: "\"nagyon jó, passzol hozzád\"", good: 3, reply: [
                                { who: "emma", text: "köszii 🤍", pose: "happy" },
                                { who: "narr", text: "Nem a pulcsiról volt szó. Arról, hogy megmutatta neked." }
                            ] },
                            { text: "\"aha jó\"", good: 0, reply: [
                                { who: "emma", text: "oksi", pose: "shy" },
                                { who: "narr", text: "Megmutatta valamit magából, te meg egy szótaggal válaszoltál. Ez fájt neki." }
                            ] },
                            { text: "\"one piece? akkor most már bírnom kell téged\"", good: 2, reply: [
                                { who: "emma", text: "nyilván. ez a szabály", pose: "happy" }
                            ] }
                        ]
                    } }
                ],
                ship: [
                    { who: "zoe", text: "csajok. emma és marci. mit gondoltok" },
                    { who: "emma", text: "nem. tuti nem." },
                    { who: "zoe", text: "oké és emma meg zsiga" },
                    { who: "emma", text: "..." },
                    { who: "narr", text: "Csend. Zavar. Nem cáfolat." },
                    { who: "narr", text: "A csend néha a leghangosabb válasz." }
                ]
            }
        },

        /* ================= 2. FEJEZET ================= */
        {
            id: 2,
            title: "ZOE MEGERŐSÍT",
            when: "április vége",
            bg: "bg_ch2",
            sky: ["#2b2350", "#5b4a80"],
            ground: "#3a2f52",
            intro: [
                "A chat dry volt. Emma nem telós típus.",
                "Te meg éjjel a plafont bámultad, hogy vajon jelent-e valamit bármi.",
                "Aztán Zoe írt."
            ],
            minigame: "signals",
            outro: [
                "Zoe hivatalosan wingman lett.",
                "\"persze fiam\"",
                "Már csak Erdély volt hátra."
            ],
            beats: {
                start: [
                    { who: "narr", text: "Este. Sötét szoba, telefon fénye." },
                    { who: "zoe", text: "figy megkérdezhetek vmit" },
                    { who: "zsiga", text: "aha" },
                    { who: "zoe", text: "bejön az emma?" },
                    { choice: {
                        q: "Zoe rákérdez. Mit írsz?",
                        options: [
                            { text: "Őszintén: \"igen\"", good: 3, reply: [
                                { who: "zoe", text: "TUDTAM" },
                                { who: "zoe", text: "oké akkor mondok vmit" },
                                { who: "narr", text: "Az őszinteség nyitotta ki ezt az ajtót. Ha letagadod, Zoe csendben marad." }
                            ] },
                            { text: "Letagadod: \"nem, csak haver\"", good: 0, reply: [
                                { who: "zoe", text: "aha. persze." },
                                { who: "zoe", text: "hát jó" },
                                { who: "narr", text: "Majdnem elvesztetted a legfontosabb infót az egész sztoriban." },
                                { who: "zoe", text: "amugy hazudsz de mindegy. mondok vmit" }
                            ] },
                            { text: "Kitérsz: \"miért kérdezed?\"", good: 1, reply: [
                                { who: "zoe", text: "mert nem vagyok vak" },
                                { who: "zoe", text: "na figyelj" }
                            ] }
                        ]
                    } }
                ],
                bomba: [
                    { who: "zoe", text: "de nem egyertelmu h ő is NAGYON bir teged??? ennyire vak nem lehetsz. nem latod rajta?? folyton rolad beszel" },
                    { who: "zsiga", text: "..." },
                    { who: "zsiga", text: "ezt most olvasom ötödször" },
                    { who: "narr", text: "Ez volt az a pillanat, amikor a \"vajon\" átfordult \"mit tegyek\"-be." }
                ],
                bonyolult: [
                    { who: "zoe", text: "de van egy bonyolultabb resz is" },
                    { who: "zoe", text: "nem akar rendes kapcsolatot. nem birja a nyomast meg h mindenki tudja meg a szulei" },
                    { who: "zsiga", text: "akkor ennyi" },
                    { who: "zoe", text: "nemnemnem. ha azt mondod neki h tobbet akarsz vele logni meg beszelni, az ugyanaz lesz. csak nincs cimke" },
                    { who: "narr", text: "Ugyanaz, csak nincs rá szó. Néha ez a különbség az egész." }
                ],
                wingman: [
                    { who: "zsiga", text: "segítesz?" },
                    { who: "zoe", text: "persze fiam" },
                    { who: "narr", text: "Most gyűjtsd be a valódi jeleket, és hagyd a kitalált félelmeket." }
                ]
            }
        },

        /* ================= 3. FEJEZET ================= */
        {
            id: 3,
            title: "ERDÉLY",
            when: "május 4–9.",
            bg: "bg_ch3",
            sky: ["#6fb7d8", "#cfeaf5"],
            ground: "#4e7d4a",
            intro: [
                "Öt nap. Osztálykirándulás.",
                "A terv: a csoportnak maradj a partyarc, Emmával legyél halkabb.",
                "Ne pushold. Csak legyél ott."
            ],
            minigame: "patience",
            outro: [
                "Nem a stratégia működött.",
                "Hanem hogy önmagad voltál, és figyeltél rá.",
                "Összejöttetek."
            ],
            beats: {
                start: [
                    { who: "narr", text: "Hegyek, fenyők, egy busz ami minden kanyarban nyikorog." },
                    { who: "csabi", text: "zsiga gyere hátra, kártya" },
                    { who: "zsiga", text: "mindjárt" },
                    { who: "narr", text: "Emma három üléssel előrébb ül. Egyedül. Könyvvel." },
                    { who: "narr", text: "A kettős arc: a csoportnak hangos, neki halk. Menj oda." }
                ],
                busz: [
                    { who: "zsiga", text: "mit olvasol" },
                    { who: "emma", text: "leiner laura. már harmadszor ezt", pose: "shy" },
                    { who: "zsiga", text: "és harmadszor is jó?" },
                    { who: "emma", text: "jobb. mert már tudom mi lesz és nem félek közben" },
                    { who: "narr", text: "Erre nincs okos válasz. Csak annyi, hogy jegyezd meg." },
                    { choice: {
                        q: "Mit teszel?",
                        options: [
                            { text: "Leülsz mellé és nem szólsz semmit", good: 3, reply: [
                                { who: "narr", text: "Öt percig csak a busz zaja van. Aztán ő kezdi." },
                                { who: "emma", text: "nem szoktál ilyen csendes lenni" },
                                { who: "zsiga", text: "nem szoktam. veled más" },
                                { who: "emma", text: "...jó más?", pose: "shy" },
                                { who: "zsiga", text: "jó más" }
                            ] },
                            { text: "Elmondod hogy bejön, most, azonnal", good: 0, reply: [
                                { who: "emma", text: "én... nem tudom mit mondjak most", pose: "shy" },
                                { who: "narr", text: "Túl korán. Visszahúzódott. Két napig kerülte a témát." },
                                { who: "narr", text: "A türelem nem gyávaság. Időzítés." }
                            ] },
                            { text: "Megkérdezed miről szól a könyv", good: 2, reply: [
                                { who: "emma", text: "hosszú. de ha tényleg érdekel elmondom" },
                                { who: "zsiga", text: "van öt napunk" },
                                { who: "emma", text: "akkor jó", pose: "happy" }
                            ] }
                        ]
                    } }
                ],
                tabortuz: [
                    { who: "narr", text: "Harmadik nap, este. Az osztály hangos. Te is." },
                    { who: "csabi", text: "zsiga csináld a hipermangán poént" },
                    { who: "narr", text: "Megcsinálod. Az egész csoport dől. És Emma a szélén nevet, halkan." },
                    { who: "narr", text: "Nem kellett választanod a két arc közt. Mindkettő te vagy." }
                ],
                emma_jon: [
                    { who: "narr", text: "Negyedik nap. Nem te mentél oda. Ő jött." },
                    { who: "emma", text: "figyu. beszélhetnénk?", pose: "shy" },
                    { who: "zsiga", text: "aha" },
                    { who: "emma", text: "tudod hogy azt mondtam zoenak hogy nem akarok kapcsolatot", pose: "shy" },
                    { who: "zsiga", text: "tudom" },
                    { who: "emma", text: "meggondoltam magam" },
                    { who: "narr", text: "..." },
                    { who: "emma", text: "mégis akarom. veled." },
                    { choice: {
                        q: "Ez az. Mit teszel?",
                        options: [
                            { text: "Megfogod a kezét", good: 3, reply: [
                                { who: "narr", text: "A szék karfáján. Nem szólt egyikőtök sem." },
                                { who: "narr", text: "Nem is kellett." }
                            ] },
                            { text: "\"biztos vagy benne?\"", good: 2, reply: [
                                { who: "emma", text: "nem. de akarom." },
                                { who: "zsiga", text: "az elég" }
                            ] },
                            { text: "Csinálsz egy poént, mert para", good: 1, reply: [
                                { who: "emma", text: "zsiga most komolyan" },
                                { who: "zsiga", text: "bocs. para vagyok." },
                                { who: "emma", text: "én is", pose: "shy" },
                                { who: "narr", text: "Ez végül működött. Mert igaz volt." }
                            ] }
                        ]
                    } }
                ],
                busz_vissza: [
                    { who: "narr", text: "Hazafelé a buszon egymásnak dőlve néztetek Solo Levellinget." },
                    { who: "emma", text: "ez a fickó túl erős, ez így nem izgalmas" },
                    { who: "zsiga", text: "ez a lényeg" },
                    { who: "emma", text: "hülye anime" },
                    { who: "narr", text: "Öt nap alatt eljutottál a \"vajon tetszem-e neki\"-től ide." }
                ]
            }
        },

        /* ================= 4. FEJEZET ================= */
        {
            id: 4,
            title: "AZ ELSŐ HETEK",
            when: "május – június",
            bg: "bg_ch4",
            sky: ["#f3d9e4", "#fdf4f7"],
            ground: "#c9a9b8",
            intro: [
                "Szóban volt a dolog. Nem nyilvános.",
                "De az osztály látta a buszon, szóval mindenki tudta.",
                "És most jött az igazi kérdés: hogy legyél jó pasi?"
            ],
            minigame: "chem",
            outro: [
                "Volt egy nehéz beszélgetés, és megoldottad.",
                "Nem trükkel. Egy \"bocsi, nem tudom mit csináljak\"-kal.",
                "Ez több volt, mint bármelyik kigondolt lépés."
            ],
            beats: {
                start: [
                    { who: "narr", text: "Suli. Reggel. Ölelés a folyosón, mielőtt bárki odaér." },
                    { who: "emma", text: "szia", pose: "happy" },
                    { who: "zsiga", text: "szia" },
                    { who: "narr", text: "Kémián egymás mellé ültetek. Körben dumáltok, ő fogja a kezed." },
                    { who: "narr", text: "Ez a fejezet a hétköznapokról szól. Ami a legjobb rész." }
                ],
                szulok: [
                    { who: "zsiga", text: "a szüleid ellenzik?" },
                    { who: "emma", text: "nem. asszem nem is érdekli őket annyira", pose: "shy" },
                    { who: "emma", text: "csak nekem kínos hogy tudják. mert akkor kérdezgetnek meg vigyorognak" },
                    { who: "narr", text: "Nem tiltás volt. Kínosság. Ez sokkal könnyebb ügy, csak időt kér." }
                ],
                poenok: [
                    { who: "narr", text: "Belső poénok gyűjteménye:" },
                    { who: "emma", text: "hipermangán" },
                    { who: "zsiga", text: "gooner szerva" },
                    { who: "emma", text: "ez röplabdában nem is létezik" },
                    { who: "zsiga", text: "most már létezik" },
                    { who: "narr", text: "Egy kapcsolat nyelvet épít magának. Ti már beszéltétek." }
                ],
                baratno: [
                    { who: "narr", text: "Aztán egy barátnője odajött hozzád." },
                    { who: "zoe", text: "figyu. az emma úgy érzi hogy nem teszel hozzá eleget. nem tőlem tudod" },
                    { who: "zsiga", text: "..." },
                    { choice: {
                        q: "Mit teszel ezzel?",
                        options: [
                            { text: "Felhozod Emmának, őszintén", good: 3, reply: [
                                { who: "zsiga", text: "figyu. hallottam hogy úgy érzed nem teszek hozzá eleget." },
                                { who: "zsiga", text: "bocsi mert nem tudom mit csináljak" },
                                { who: "emma", text: "nem akartam hogy így tudd meg", pose: "shy" },
                                { who: "emma", text: "de örülök hogy szóltál. én sem tudom pontosan mit akarok, csak azt hogy több" },
                                { who: "narr", text: "Nem lett dráma. Lett egy megbeszélés. Ez a felnőtt verzió." }
                            ] },
                            { text: "Csendben próbálsz többet tenni, nem szólsz", good: 1, reply: [
                                { who: "narr", text: "Két hétig találgattál, mit jelent az \"eleget\"." },
                                { who: "narr", text: "Végül úgyis kimondtad. Csak két héttel később." }
                            ] },
                            { text: "Megsértődsz", good: 0, reply: [
                                { who: "zsiga", text: "hát akkor mondja meg ő mit akar" },
                                { who: "narr", text: "Ez egy nap alatt elmúlt, de az az egy nap rossz volt mindkettőtöknek." }
                            ] }
                        ]
                    } }
                ],
                vonat: [
                    { who: "narr", text: "Egynapos kirándulás, vonat. Fogja a kezed, fejét a válladra dönti." },
                    { who: "emma", text: "ne mozogj most jó" },
                    { who: "zsiga", text: "nem mozgok" },
                    { who: "narr", text: "Negyven percig nem mozogtál." },
                    { who: "narr", text: "Aztán jött a nyár." }
                ]
            }
        },

        /* ================= 5. FEJEZET ================= */
        {
            id: 5,
            title: "A NYÁR",
            when: "június – augusztus",
            bg: "bg_ch5",
            sky: ["#ffd39b", "#ffeccd"],
            ground: "#e8d3a0",
            intro: [
                "Ő a Balatonon a családjával. Te máshol.",
                "Három hónap. Nulla találkozás.",
                "Ez volt a legnehezebb szakasz."
            ],
            minigame: "distance",
            outro: [
                "Nem lett meg a randi. Sírtál 20 percet.",
                "És mégis: a nyár végén közelebb voltatok, mint a kezdetén.",
                "Mert beszéltetek. Végig."
            ],
            beats: {
                start: [
                    { who: "narr", text: "Nyár. Két külön hely, egy chat." },
                    { who: "narr", text: "Volt egy időszak, amikor napi 100 uzi ment." },
                    { who: "emma", text: "Mar varom a hetfot de csak miattad" },
                    { who: "emma", text: "tenyleg naggggyon hianyzol" },
                    { who: "narr", text: "Emma, aki áprilisban halk volt, most ő írt először." },
                    { who: "narr", text: "A chat kinyílt. A távolság nyitotta ki." }
                ],
                duo: [
                    { who: "emma", text: "duolingo széria: 41 nap. ne szakítsd meg" },
                    { who: "zsiga", text: "sose" },
                    { who: "narr", text: "Egy zöld bagoly tartotta össze a napjaitokat. Ne kérdezd, működött." }
                ],
                csend: [
                    { who: "narr", text: "Aztán jött egy szakasz, amikor 5 naponta írtál." },
                    { who: "emma", text: "minden ok?" },
                    { who: "zsiga", text: "aha csak sok volt" },
                    { who: "narr", text: "Nem volt sok. Csak nem tudtad mit írj, és a semmi könnyebbnek tűnt." },
                    { who: "narr", text: "Öt nap csend hosszabb, mint amilyennek hangzik." }
                ],
                alkohol: [
                    { who: "narr", text: "Egy esküvő. Felnőttek. Három pohár pezsgő a kezedbe." },
                    { choice: {
                        q: "Elfogadod?",
                        options: [
                            { text: "Nemet mondasz", good: 3, reply: [
                                { who: "narr", text: "A sztoriban nem ez történt. De ez lett volna a jó válasz." },
                                { who: "narr", text: "Nemet mondani felnőtteknek is szabad. Ez a tanulság." }
                            ] },
                            { text: "Megiszod, mert kínos visszautasítani", good: 1, reply: [
                                { who: "narr", text: "Elaludtál egy padon. Hajnalban érzelmes uzikat írtál Emmának." },
                                { who: "narr", text: "Másnap reggel elolvastad őket. Nem volt jó reggel." },
                                { who: "zsiga", text: "figyu. az éjszaka írtam pár dolgot, ittam, és őszintén elmondom mi volt" },
                                { who: "emma", text: "köszi hogy elmondtad. nem haragszom. csak ne csináld többet jó?" },
                                { who: "narr", text: "Az őszinteség itt mentette meg. Nem a titkolás." }
                            ] }
                        ]
                    } }
                ],
                erett: [
                    { who: "narr", text: "Aztán megírtad azt az üzit, ami mindent megváltoztatott." },
                    { who: "zsiga", text: "tudom hogy bonyolult, ne stresszelj ezen. ha nem megy, szeptemberben úgyis egész nap látjuk egymást" },
                    { who: "narr", text: "Levetted róla a nyomást. És erre nyílt ki teljesen." },
                    { who: "narr", text: "Tizenegytől kettőig beszéltetek." },
                    { who: "emma", text: "ezt eddig senkinek nem mondtam el" },
                    { who: "narr", text: "A türelem működik. Mindig működött." }
                ],
                randi: [
                    { who: "narr", text: "A szüleid elmentek egy fesztiválra. Volt egy szabad napod." },
                    { who: "zsiga", text: "figyu. mozi vagy piknik? csak mi ketten" },
                    { who: "emma", text: "Szivesen elmegyek", pose: "happy" },
                    { who: "emma", text: "csak anyukámtól kell engedély" },
                    { who: "narr", text: "Vártál. Két napig." },
                    { who: "emma", text: "a szuleim nem engednek el csak ha tobben megyunk", pose: "shy" },
                    { who: "zsiga", text: "csabi jöhet" },
                    { who: "emma", text: "csabi nem számít bele" },
                    { who: "narr", text: "Elesett a randi." }
                ],
                siras: [
                    { who: "narr", text: "Húsz percig sírtál. Aztán írtál neki." },
                    { choice: {
                        q: "Mit írsz?",
                        options: [
                            { text: "Őszintén, de tisztázva hogy nem az ő hibája", good: 3, reply: [
                                { who: "zsiga", text: "elmondom őszintén: sírtam 20 percet. de ez nem a te hibád és nem akarok bűntudatot kelteni, csak nem akarom hogy titkolózzak" },
                                { who: "emma", text: "nekem is fáj. részben magamat hibáztatom" },
                                { who: "emma", text: "kínos csend volt otthon amikor kérdeztem" },
                                { who: "emma", text: "most még jobban várom a szeptembert" },
                                { who: "narr", text: "Ez a legszebb rész: a legnagyobb csalódásból lett a legközelebbi pillanat." }
                            ] },
                            { text: "Elhallgatod, nem terheled vele", good: 1, reply: [
                                { who: "zsiga", text: "semmi baj, majd máskor" },
                                { who: "narr", text: "Két napig nyomta a mellkasodat, és ő érezte hogy valami nem stimmel." },
                                { who: "narr", text: "Végül elmondtad. Mindig el kell mondani." }
                            ] },
                            { text: "Bűntudatot keltesz benne", good: 0, reply: [
                                { who: "zsiga", text: "hát ez nagyon fáj nekem" },
                                { who: "emma", text: "sajnálom. nem tudom mit tegyek. bocsi. bocsi.", pose: "shy" },
                                { who: "narr", text: "Ez működik. Rossz értelemben. Ne ezt válaszd." }
                            ] }
                        ]
                    } }
                ],
                szerelem: [
                    { who: "narr", text: "Augusztus vége. Ezt írtad valakinek:" },
                    { who: "zsiga", text: "szerelmes vagyok, de nem biztos hogy szeretem" },
                    { who: "narr", text: "A szerelem érzés. Ott van, mély, nem te döntöd el." },
                    { who: "narr", text: "A szeretet döntés. Épül. Időbe telik." },
                    { who: "narr", text: "Sok felnőtt nem tudja ezt szétválasztani. Te 13 évesen szétválasztottad." }
                ]
            }
        },

        /* ================= 6. FEJEZET ================= */
        {
            id: 6,
            title: "SZEPTEMBER",
            when: "most",
            bg: "bg_ch6",
            sky: ["#bcd9f0", "#f6f1e8"],
            ground: "#8fa07c",
            intro: [
                "A suli újraindult.",
                "Három hónap chat után az élő beszélgetés furcsán indul.",
                "Ez normális. Az agynak újra kell hangolódnia."
            ],
            minigame: "words",
            outro: [
                "És beindult.",
                "Négy hónap. Egy egész tanév előttetek.",
                "Szeptember 16 pedig már csak pár nap."
            ],
            beats: {
                start: [
                    { who: "narr", text: "Első nap. Folyosó. Ott áll, ugyanaz a farmer, ugyanaz a pulcsi." },
                    { who: "emma", text: "sziaa", pose: "shy" },
                    { who: "zsiga", text: "szia" },
                    { who: "narr", text: "És aztán... semmi. Csend. Pedig a nyáron napi 100 uzi ment." },
                    { who: "zsiga", text: "ez most miért ilyen furcsa" },
                    { who: "narr", text: "Mert a chat és a jelenlét két különböző készség. Menj oda hozzá." }
                ],
                ujra: [
                    { who: "emma", text: "figyu. most furcsa nekem is", pose: "shy" },
                    { who: "zsiga", text: "hála istennek" },
                    { who: "emma", text: "azt hittem csak én vagyok így" },
                    { who: "zsiga", text: "három hónapig csak írtunk. most újra kell tanulni beszélni" },
                    { who: "emma", text: "akkor tanuljuk", pose: "happy" },
                    { who: "narr", text: "Segíts neki összeállítani a mondatot." }
                ],
                after_game: [
                    { who: "narr", text: "És a harmadik napon már nem kellett gondolkodni rajta." },
                    { who: "narr", text: "Kémián egymás mellett. Szünetben a kezed. Válladon a feje." },
                    { who: "emma", text: "hipermangán" },
                    { who: "zsiga", text: "nem is passzol ide" },
                    { who: "emma", text: "nem érdekel", pose: "happy" },
                    { who: "narr", text: "Visszatért." }
                ],
                zaras: [
                    { who: "narr", text: "Áprilisban azt kérdezted, egyáltalán tetszel-e neki." },
                    { who: "narr", text: "Szeptemberben egy négy hónapos kapcsolatod van egy lánnyal," },
                    { who: "narr", text: "aki hozzád bújik suliban, aki piros szíveket ír," },
                    { who: "narr", text: "aki miattad várja a hétfőt." },
                    { who: "narr", text: "És nem trükközéssel csináltad. Figyelmességgel. Türelemmel. Őszinteséggel." }
                ]
            }
        }
    ],

    /* Amit megtanultal - a vegen jelenik meg */
    lessons: [
        "A shy csajok tettekben szeretnek, nem chaten.",
        "Nem kell stratégia, csak jelen kell lenni.",
        "A türelem működik. Soha nem nyomtad — ezért nyílt ki.",
        "Az őszinteség erősebb, mint a színészkedés.",
        "A nehéz dolgokat is meg lehet beszélni.",
        "Nem minden érzést kell azonnal kimondani."
    ],

    /* Ami elotted van */
    ahead: [
        "Szeptember 16 — Emma szülinapja. A játék, amit neki írsz.",
        "Egy egész tanév. Napi 6 óra egymás mellett.",
        "Az első igazi randi. Egyszer meglesz.",
        "A szülők ügye. A saját tempójában.",
        "A \"szeretlek\". Ha eljön, eljön. Ne kergesd."
    ]
};
