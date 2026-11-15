# Otwarcie strony: diagnoza (telefon) i propozycje

Data: 2026-11-14 · Gałąź: `redesign/decyzje` (fcbc6a8d) · Status: **diagnoza, bez zmian w kodzie; plan A w tym kształcie nieprzyjęty, właściciel wskazał hero jako główny problem (sekcja 5)**
Zakres: hero + scena sygnaturowa. Miara: Lusion rozumiany jako **ciągłość** (każda sekunda wynika
z poprzedniej, uwaga ma jeden cel, wszystko płynne i dokończone, przejście do następnego miejsca też).

Jak mierzone: build produkcyjny (`pnpm build && pnpm start`), Playwright/Chromium z GPU (ANGLE Metal),
390×844 DPR 3 z emulacją dotyku oraz 1440×900. Klatki co 0,2 ekranu scrolla (s = ekrany scrolla od góry).
Katalog klatek: `/private/tmp/claude-501/-Users-sklbsz--claude-spares-spare-6B76aA/ab37f83b-4cdb-4c32-b772-1aeada775c6c/scratchpad/otwarcie/` (dalej `OTW/`).

Arkusze zbiorcze (najszybszy przegląd):

- telefon: `OTW/sheet-phone-00.png`, `OTW/sheet-phone-08.png`, `OTW/sheet-phone-16.png`, wyjście `OTW/sheet-phone-out.png`
- telefon, ładowanie i jeden szybki ruch palcem: `OTW/sheet-phone-load.png`, `OTW/sheet-phone-flick.png`
- desktop: `OTW/sheet-desktop-00.png` … `OTW/sheet-desktop-24.png`, wyjście `OTW/sheet-desktop-out.png`

**Czego nie dało się sprawdzić:** prawdziwego telefonu. Liczby klatek pochodzą z M4, więc mówią tylko
o koszcie JS, nie o GPU telefonu ze średniej półki. Zachowanie paska adresu iOS (svh/lvh) i opóźnienie
canvasa względem natywnego scrolla wymagają testu na urządzeniu.

## 1. Co widać dziś na telefonie

| s               | Klatka                                     | Co jest na ekranie                                                                                                                    |
| --------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| ładowanie 0–2 s | `OTW/load-t403.png` … `load-t2001.png`     | Kremowe tło i tekst. Imię pisze się 0,4–3 s, bloba nie ma do ok. 2 s (montaż po 900 + 100 ms, potem zanikanie 1,5 s).                 |
| 0,0             | `phone-00-s0_0.png`                        | Imię w dwóch liniach, blob (skala 0,6) wypełnia szerokość. Dobry kadr.                                                                |
| 0,2–0,4         | `phone-01`, `phone-02`                     | Rola i zdanie gasną, blob podsuwa się pod imię.                                                                                       |
| 0,6–1,0         | `phone-03` … `phone-05`                    | Litery zielenieją, blob blednie. Czytelne, spokojne.                                                                                  |
| 1,2–1,8         | `phone-06` … `phone-09`                    | Wjazd w literę. Na końcu pionowa krawędź kreski przecina ekran jak kurtyna (`phone-09`).                                              |
| 2,0             | `phone-10-s2_0.png`                        | Płaska zieleń na cały ekran, nic więcej. Martwa klatka.                                                                               |
| 2,2–2,6         | `phone-11` … `phone-13`                    | Tafla ciemnieje. Kulka pojawia się w dolnej połowie i odpływa do prawej krawędzi. Odczyt prawie nieczytelny (`phone-11`, `phone-12`). |
| 2,8–3,0         | `phone-14`, `phone-15`                     | Zrzut wyłania się jako mały poziomy prostokąt w środku. Kulka ucięta przez krawędź ekranu, nachodzi na zrzut.                         |
| 3,2–3,4         | `phone-16`, `phone-17`                     | Tafla się klaruje. Zrzut w canvasie jest rozmyty (`OTW/phone-17-s3_4@3x.png`).                                                        |
| 3,6–3,8         | `phone-18`, `phone-19`                     | Zrzut ostrzeje skokiem (podmiana na DOM), jedzie w górę, wchodzi nagłówek.                                                            |
| 3,8–4,4         | `phone-19` … `phone-22`                    | Nic się nie zmienia przez 0,6 ekranu.                                                                                                 |
| 4,6+            | `phone-out-s4_7.png`, `phone-out-s4_9.png` | Ciemny prostokąt odjeżdża, pod nim prosta krawędź i kremowa sekcja „Doświadczenie i Kontekst”. Kulki już nie ma.                      |

## 2. Dlaczego nie robi wrażenia (od największego wpływu)

### 2.1 Kulminacja jest miniaturą: zrzut zajmuje 20% ekranu

Ramka ma `aspect-video` na każdej szerokości (`src/components/sections/signature-scene.tsx:352`). Na 390×844 to
342×192 px, czyli 23% wysokości i 20% powierzchni ekranu. Na 1440×900 ramka ma ok. 974×548 px (61% wysokości, 41%
powierzchni; `signature-scene.tsx:303`). Sam zrzut to desktopowa strona z dwiema kolumnami, więc na telefonie jej
tekst ma 2–3 px wysokości. Dowód: `OTW/phone-15-s3_0.png` obok `OTW/desktop-15-s3_0.png`.
Skutek dla uwagi: moment, do którego prowadzą 3 ekrany scrolla, dzieje się w pasku pośrodku, a 77% kadru
to pusta ciemna zieleń. Na desktopie tafla ma co nieść, na telefonie nie.

### 2.2 Jeden ruch palcem zjada całe otwarcie w ok. 1,5 s

Dotyk jest natywny, a hamulec scen (`×0,6`, przytrzymanie `×0,3`) działa tylko na kółko myszy
(`src/components/ui/smooth-scroller.tsx:36-39` i `:68`: `lenis.options.wheelMultiplier`). Symulacja jednego
machnięcia z wygaszaniem (4,6 ekranu, stała 0,45 s): `OTW/sheet-phone-flick.png`.

- Po 0,25 s scroll jest na s 1,95, a obraz dopiero w połowie wjazdu. Wygładzenie historii (0,12 s) przy
  prędkości ok. 7000 px/s daje opóźnienie ok. 1 ekranu, więc etapy się zlewają.
- Po 0,5 s scroll jest na s 3,08 (P ≈ 0,54), a na ekranie wciąż jasna tafla z początku ciemnienia.
- Po 0,75 s zrzut jest już prawie klarowny. Wyłanianie, czyli sedno sceny, trwało ok. 0,25 s.
- Akt końcowy jest odpalany na czas (1,6 s), więc nagłówek dopiero wjeżdża (`flick-t1503`, `flick-t1752`),
  gdy kadr już prawie stoi u progu odpięcia.

Scenariusz zakładał, że na telefonie „czas na obejrzenie daje samo przytrzymanie kadru”. Przytrzymanie
(0,5 ekranu) bez hamulca to przy machnięciu ułamek sekundy.

### 2.3 Zrzut pod wodą jest rozmyty, potem ostrzeje skokiem

Canvas na telefonie ma DPR 1 (`src/components/canvas/viscous-puddle.tsx:274`), czyli 390×844 px na ekranie
1170×2532: 1/9 pikseli. Miękkiej plamie bloba to nie szkodzi. Zrzut strony w shaderze już tak: przy
„przejrzystość 92%” jest wyraźnie nieostry (`OTW/phone-17-s3_4@3x.png`), a przy podmianie na obraz DOM
(`BEATS.swap` 0,78–0,80) robi się ostry w 2% przebiegu. Scenariusz obiecuje podmianę „piksel w piksel”; na
telefonie jest to widoczny skok jakości, czyli grafika wyglądająca na niedokończoną.

### 2.4 Kulka na telefonie nie ma roli i wygląda jak błąd

Bez kursora kulka spoczywa (`viscous-puddle.tsx:444`), a jej miejsce spoczynku na wąskim ekranie to róg zrzutu
(`ballRest` w `choreography.ts:282`). W praktyce: blada plama ucięta prawą krawędzią ekranu, nachodząca na zrzut
i przygaszona do 10% (`uBallSink`): `OTW/phone-14-s2_8@3x.png`. Po scenie znika całkiem (`OTW/sheet-phone-out.png`),
więc zdanie ze scenariusza „dusza strony nie znika razem z tłem” na telefonie nie jest prawdą.
Uwaga ma tu dwa konkurujące cele (zrzut i plama obok), a żaden nie prowadzi do następnego.

### 2.5 Przerwy w ciągłości

- **Ładowanie:** imię pisze się na czas, blob pojawia się 2 s później własnym zanikaniem. Dwa niezwiązane
  zdarzenia; przez pierwsze 2 s strona wygląda jak statyczny tekst (`OTW/sheet-phone-load.png`).
- **Przekazanie hero → scena:** wjazd kończy się twardą pionową krawędzią (`phone-09`), po niej jest płaska
  zieleń bez żadnego zdarzenia (`phone-10`), a tafla zaczyna falować dopiero od P 0,00–0,12 (`surface`).
  Przez ok. 0,3 ekranu nic nie wynika z poprzedniej sekundy.
- **Odczyty:** `text-xs`, szare na średniej zieleni, na telefonie jedyny tekst w kadrze przez 1,5 ekranu
  i przez pierwszą połowę nieczytelny (`phone-11`, `phone-12`).
- **Postój:** s 3,8–4,4 bez żadnej zmiany (`phone-19` … `phone-22`). Na desktopie hamulec robi z tego pauzę
  do czytania; na dotyku to po prostu puste przewijanie.
- **Wyjście:** ciemna tafla kończy się prostą linią i wjeżdża kremowa sekcja „O mnie” ze zwykłym revealem
  (`OTW/phone-out-s4_9.png`). Nic z otwarcia nie przechodzi dalej. To jest dokładnie to miejsce, które
  właściciel ceni u Lusion, i tu go nie ma. (Na desktopie zostaje przynajmniej kulka przy kursorze.)

### 2.6 Niespójne czasy i krzywe (wartości z kodu)

| Co                                        | Wartość                                 | Krzywa                                            | Związane ze scrollem |
| ----------------------------------------- | --------------------------------------- | ------------------------------------------------- | -------------------- |
| Hero: uwaga / przywarcie / odsączanie     | H 0–0,14 / 0,04–0,36 / 0,26–0,54        | `glide`                                           | tak                  |
| Hero: wsiąkanie liter                     | H 0,24–0,54                             | liniowo + `smoothstep` na literę                  | tak                  |
| Hero: wjazd                               | H 0,52–1,00                             | `glide` w skali log, celowanie `smoothstep` 0–0,6 | tak                  |
| Scena: ciemnienie / kulka                 | P 0,02–0,40 / 0,10–0,35                 | `glide`                                           | tak                  |
| Scena: wyłanianie / klarowanie            | P 0,30–0,58 / 0,50–0,78                 | `power2Out`                                       | tak                  |
| Scena: tafla (`surface`), podmiana        | P 0–0,12, 0,78–0,80                     | `smoothstep`                                      | tak                  |
| Akt końcowy (zrzut, nagłówek)             | 1,0 s, stagger 0,1 s, opóźnienie 0,6 s  | `power2.out`                                      | **nie, na czas**     |
| Wygładzenie historii                      | 0,12 s                                  | wykładniczo                                       | czas                 |
| Kulka: śledzenie / spoczynek / zanurzanie | 0,27 s / 0,8 s / 0,18 s                 | wykładniczo                                       | czas                 |
| Canvas: pojawienie                        | CSS 1,5 s `ease-out` + 0,6 s w shaderze | dwie naraz                                        | czas                 |
| Wzburzenie od scrolla (`flow`)            | 0,2 / 0,04 **na klatkę**                | lerp bez `delta`                                  | zależne od Hz        |

Trzy rodziny krzywych w jednej historii (`glide`, `power2Out`, `smoothstep`) plus jeden etap na czas. Na desktopie
maskuje to Lenis; na dotyku różnice widać. `flow` (`viscous-puddle.tsx:428`) jako jedyny nie używa `ease(sekundy)`,
więc na ekranie 120 Hz tafla uspokaja się dwa razy szybciej niż na 60 Hz.

### 2.7 Wydajność: w pomiarze nie jest przyczyną

Ciągły scroll przez całe otwarcie, telefon z CPU ×1, ×4 i ×6: mediana 8,3 ms, p95 9,2 ms, 0 klatek powyżej
25 ms przy ×4 i ×6, 0 długich zadań. Desktop: mediana 8,3 ms, jedna klatka 134 ms na starcie wjazdu. JS na
klatkę jest lekki. Koszt GPU tafli to ok. 14 próbek szumu na piksel; przy DPR 1 telefon liczy 0,33 Mpx, desktop
przy DPR 1,5 liczy 2,9 Mpx. Jest więc zapas na wyższą rozdzielczość, ale wymaga potwierdzenia na urządzeniu.

## 3. Co telefon traci względem desktopu (z kodu)

| #   | Strata                                                                     | Gdzie                                                                      |
| --- | -------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1   | Rozdzielczość canvasa: DPR 1 zamiast 1,5 (na ekranie DPR 3 to 1/9 pikseli) | `viscous-puddle.tsx:274`                                                   |
| 2   | Połowa falowania krawędzi bloba i kulki (`uDetail` 0,5)                    | `viscous-puddle.tsx:507`, `shaders.ts` (`ripple`)                          |
| 3   | Blob i kulka mniejsze o 40% (`scale` 0,6)                                  | `viscous-puddle.tsx:390`, `choreography.ts:273`                            |
| 4   | Kulka nie idzie za niczym; brak jakiejkolwiek reakcji na dotyk             | `viscous-puddle.tsx:444`                                                   |
| 5   | Litery nie reagują na kulkę (źródło, przyciąganie): kulka stoi w blobie    | `hero.tsx:138-161`                                                         |
| 6   | Fale nie rozstępują się i nie ciągną za kulką (`uBallVelocity` ≈ 0)        | `shaders.ts` (blok `uSurface`)                                             |
| 7   | Kulka po scenie znika; na desktopie zostaje przy kursorze                  | `choreography.ts:282`                                                      |
| 8   | Hamulec scrolla i przytrzymanie kadru (tylko kółko)                        | `smooth-scroller.tsx:36-39`, `:68`                                         |
| 9   | Odczyty: najwyżej cel + jeden, w kolumnie                                  | `choreography.ts` (`readoutMotion`), `signature-scene.tsx:236`, `:257-259` |
| 10  | Skala kadru: zrzut 16:9 na 23% wysokości ekranu zamiast 61%                | `signature-scene.tsx:303`, `:352`                                          |

Wniosek: decyzja „telefon: ta sama idea w lżejszej formie” została wykonana jako **odejmowanie**
(rozdzielczość, detal, rozmiar, interakcja, hamulec) bez niczego w zamian. Telefon nie dostał ani własnego
kadru, ani własnej interakcji. To zgadza się z podejrzeniem, ale główny ciężar leży w punktach 10, 8 i 1,
a nie w „spokojniejszej powierzchni”.

## 4. Propozycje (w kolejności wpływ / koszt)

### A. Telefon dostaje własny kadr: strona wynurza się na cały ekran

**Moment:** cały ekran telefonu jest taflą, a pod nią wynurza się stronypodhale.pl w pionie, od krawędzi do
krawędzi, ostra. Dopiero akt końcowy zmniejsza ją do ramki w układzie (krzepnie w kartę), a w zwolnione
miejsce wchodzi nagłówek. Telefon w ręce na chwilę „jest” tą stroną. To ta sama idea, wykonana pod pion.

**Technicznie:**

- Pionowy zrzut strony (mobilny widok stronypodhale.pl, ok. 4:5 lub 9:16) jako drugi plik obok
  `public/images/projects/stronypodhale.avif`; ramka `aspect-[4/5] md:aspect-video`, dwa źródła obrazu
  wybierane mediami (`signature-scene.tsx:352-363`). Tekst i `alt` bez zmian, dalej SSR.
- `boxShift` (dziś tylko przesunięcie w pionie) uogólnić do prostokąta wynurzania: od „prawie cały ekran”
  do miejsca w układzie, sterowane tym samym `placed` (`choreography.ts`: `boxShift`, `box`; DOM dostaje
  `transform: translate + scale` zamiast samego `translateY`, `signature-scene.tsx:159-162`).
  `uImageRect` w shaderze przyjmuje dowolny prostokąt, więc shader zostaje bez zmian.
- Rozdzielczość: na telefonie `dpr = min(devicePixelRatio, 2)` na czas tafli, z pomiarem pierwszych
  ok. 30 klatek i zejściem do 1,5 / 1, gdy średnia przekracza 20 ms (`viscous-puddle.tsx:271-279`).
  To usuwa rozmycie i skok z 2.3.
- Miejsce spoczynku kulki na wąskim ekranie: pod zrzutem, w całości w kadrze (`ballRest`).

**Ryzyko:** DPR 2 to 4× więcej pikseli niż dziś (1,3 Mpx, wciąż mniej niż połowa desktopu); bez adaptacji
słabsze Androidy mogą spaść poniżej 60 kl./s, stąd pomiar i zejście. Snapshoty wizualne 390×844 do
odnowienia (workflow na Linuksie). **Rozmiar:** 2–3 dni + pionowy zrzut.

### B. Tempo na dotyku: bramki zamiast hamulca i limit prędkości historii

**Moment:** jedno machnięcie zawsze kończy się na gotowym kadrze, a nie za nim; kolejne machnięcie jest
świadomym „dalej”. Wyłanianie zawsze trwa widzialny czas, niezależnie od siły ruchu.

**Technicznie:**

- Natywne `scroll-snap` tylko dla `(pointer: coarse)`: punkty przyciągania z `scroll-snap-stop: always` na
  początku hero i na `#work-formed` (`signature-scene.tsx:291-297`), `scroll-snap-type: y proximity` na
  elemencie przewijanym. Palec dalej prowadzi stronę 1:1 (to nie jest `syncTouch`, które odrzucono),
  a bezwładność systemu sama ląduje na kadrze. Desktop bez zmian (Lenis + hamulec).
- Limit prędkości historii: `timeY` nie goni scrolla szybciej niż ok. 1,5 ekranu/s w obrębie scen
  (`viscous-puddle.tsx:402-412`). Ponieważ bramka trzyma kadr przypięty, historia ma gdzie dograć.
- Jedna rodzina krzywych: wyłanianie i klarowanie na `glide` jak reszta, a `flow` na `ease(sekundy)`
  (`choreography.ts`: `imageIn`, `clarity`; `viscous-puddle.tsx:428`).
- Postój s 3,8–4,4 przestaje być pusty: patrz C.

**Ryzyko:** `scroll-snap` na dokumencie bywa kapryśne w iOS Safari (pasek adresu, `proximity`), a z Lenisem
nie może działać jednocześnie, stąd warunek `pointer: coarse`. Wymaga testu na iPhonie i Androidzie.
Wydajność: bez kosztu. **Rozmiar:** 1–1,5 dnia, z czego połowa to testy na urządzeniach.

### C. Wyjście i dotyk: kulka idzie za kciukiem i przeprowadza do następnej sekcji

**Moment:** dodatkowy scroll po uformowanym kadrze nie przesuwa strony, tylko rozjaśnia taflę z powrotem do
tła strony, a zielona kulka wypływa spod zrzutu i zjeżdża w dół razem z użytkownikiem. Następna sekcja
wchodzi na tym samym tle, bez cięcia.

**Technicznie:**

- Postój (dziś 0,5 ekranu bez zdarzeń) dostaje własny etap `exit`: `solid` wraca 1 → 0 względem koloru tła
  motywu, zrzut i nagłówek zostają (`choreography.ts`: nowy zakres po `STORY_END`; `--scene-dark` i klasa
  `dark` w `signature-scene.tsx:163-164` już idą za `solid`). Prosta krawędź tafli przestaje być widoczna,
  bo w chwili odpięcia tafla ma kolor strony.
- Kulka na dotyku: pasywne `touchstart` / `touchmove` ustawiają cel kulki tak jak mysz (te zdarzenia
  działają także w trakcie natywnego scrolla); po puszczeniu kulka wraca na miejsce spoczynku ze stałą 0,8 s
  (`viscous-puddle.tsx:330-333` nasłuch, `:444` warunek `followPointer`). Wracają wtedy straty 4–6 z tabeli:
  litery piją szybciej pod palcem, fale rozstępują się wokół kulki.
- Po odpięciu kulka nie chowa się za zrzutem, tylko zostaje przy dolnej krawędzi nad dockiem (tryb „tylko
  kulka” z wycinkiem `scissor` już istnieje, `viscous-puddle.tsx:487-500`).
- Przy okazji: tafla faluje już w ostatnich 10% wjazdu (`surface` od H ≈ 0,9), żeby zniknęła martwa
  klatka z 2.5.

**Ryzyko:** małe dla wydajności (kulka to mały wycinek). Kulka pod palcem może zasłaniać treść, więc poza
otwarciem powinna być mała i gasnąć nad tekstem (mechanizm `uBallSink` już jest). Etap `exit` zmienia testy
`choreography.test.ts`. **Rozmiar:** 2 dni.

**Kolejność:** A daje jeden moment wart zatrzymania, B sprawia, że da się go zobaczyć, C domyka ciągłość.
Pierwsze pół dnia z A (sam DPR z adaptacją) można wdrożyć osobno i od razu ocenić na telefonie.

## 5. Pytania do właściciela

1. Czy na telefonie może się wynurzać **pionowy** zrzut stronypodhale.pl (inny kadr niż na desktopie), czy
   ma to być ten sam obraz 16:9?
2. Czy bramki na dotyku (machnięcie kończy się na gotowym kadrze, następne idzie dalej) są akceptowalne,
   czy scroll na telefonie ma zostać całkowicie wolny?
3. Na jakim telefonie strona „nie robi wrażenia” (model, przeglądarka)? Od tego zależy próg DPR i to, czy
   problemem jest też płynność, której emulacja nie pokazała.

### Odpowiedzi właściciela (2026-11-14)

1. **Pionowy zrzut: tak. Pełny ekran: nie.** Jego słowa: „pionowy zrzut jest ok, ale rozbudowanie go na
   cały ekran wydaje mi się trochę ryzykowne - nie chcemy zastępować naszego portfolio widokiem nowej
   strony, a w kreatywny sposób ten projekt zaprezentować - tak jak w lusion, pojawianie wiąże się
   z nieregularnymi, falującymi, zniekształconymi krawędziami”. Plan A z sekcji 4 nie jest więc przyjęty
   w opisanym kształcie i nie został wdrożony. Z planu A zostają do ponownego zaproponowania: pionowy
   zrzut w ramce, wyższa rozdzielczość tafli, miejsce spoczynku kulki.
2. **Plan B: tak, później.** Warunkowo; ocena na telefonie właściciela, nie teraz.
3. **Telefon odniesienia: iPhone, Safari.** Ale właściciel zaznaczył, że nie o przeglądarkę chodzi.
4. **Diagnoza celowała obok.** Pytanie o to, co jest nie tak (za mały zrzut, za szybko, zacina się),
   właściciel odrzucił w całości: problemem jest **moment otwarcia i samo hero**, nie pierwsze przejście
   i nie rodzaj urządzenia. Jego słowa: „Hero jest nudne, imię nazwisko, blob i trochę tekstu. To jak się
   pojawiają jest nudne. To jak wyglądają jest nudne. To jak są rozłożone jest nudne.” oraz „Samo
   przejście jest na tyle kreatywne i ciekawe na ile może być wykorzystując tak nudne hero”.

**Co z tego wynika:** punkty 2.1–2.4 tej diagnozy (skala zrzutu, tempo, rozmycie, kulka) nie są tym, co
właściciel odczuwa jako słabe. Najbliżej jego uwagi jest pierwszy punkt z 2.5 (ładowanie: przez 2 s strona
wygląda jak statyczny tekst), ale zakres jest szerszy: pojawianie się, wygląd i układ hero. Następny krok
to propozycje kierunku dla hero (2–3 konkretne kandydatury do poprawienia), a nie wdrożenie planu A.

### Kierunek dla hero: druga runda odpowiedzi (2026-11-14)

Właściciel odrzucił samo przestawianie imienia i bloba: „Plama i Sebastian Kolbusz to zero storytellingu
i kreatywności, to tylko 2 elementy”. Blob ma być integralną częścią strony i jej charakterem, ale hero
w obecnej formie nie jest świętością. Hero ma **opowiadać historię**, a pomysły mają czerpać z referencji.

**Przyjęte:**

- Układ na telefonie: **plakat**. Blob duży, wychodzi poza ekran; imię ogromne, do lewej, u dołu; rola
  i zdanie małe, w rogach. Imię jest podpisem, nie tematem.
- Pojawianie: **tafla odpływa i litery tężeją** (oba naraz). Strona startuje jako pełna zielona tafla,
  która ściąga się falującą krawędzią do bloba i odsłania imię.
- Prawdą o dzisiejszym hero jest: blob za mały i za grzeczny; maszyna do pisania może zniknąć; pod imieniem
  za dużo tekstu; blob powinien reagować na palec; „mamy blob i tekst, ale nie mamy historii”.
- Zniekształcanie liter jest dozwolone. Wrześniowe odrzucenie dotyczyło wykonania („niedorzeczny
  i w żadnej mierze nie profesjonalny”), nie pomysłu. Warunek: „implementacja MUSI być na poziomie stron
  AWWWARDS”. Zapis „Czego unikamy” w scenariuszu hero z 25.09 należy czytać z tą poprawką.

**Historia hero: prowadzi „Materia próbuje kształtów”.** Ta sama materia krzepnie po kolei w rzeczy, które
właściciel robi, i znów się rozpływa; dotknięcie rozpuszcza kształt; scroll zostaje przy pierwszej rzeczy
i wchodzi w scenę stronypodhale. Poprawki właściciela:

- Nie wchodzimy w wewnętrzne role stronypodhale (żadnego „strona dla pensjonatu”). Jeśli przeglądarka, to
  po prostu stronypodhale; obok niej plugin albo okno IDE zamiast kolejnej przeglądarki.
- Kształtów ma być **4–5**, trzy to za mało. Dozwolone: strona www, wydruk 3D, dom i energia.
  **Auto: nie.** Kandydaci na komplet (propozycja, bez decyzji): stronypodhale, plugin aspect-preview,
  okno IDE, wydruk 3D, panel energii.

**Bez decyzji:** dwie pozostałe historie też się spodobały („Pod powierzchnią”: blob jako okno, pod wodą
leżą realizacje, palec klaruje wodę; „Rozkładam na czynniki”: materia rozpada się na podpisane części
i składa w coś stałego). Właściciel chce **próbek** w prawdziwym kodzie, żeby wybrać. Próbek jeszcze nie ma.

### Próbki trzech historii hero: wdrożone jako podgląd (2026-11-14)

Trzy próbki są w prawdziwym kodzie pod osobną trasą (noindex, poza stroną główną); produkcyjne hero,
scena sygnaturowa i desktop strony głównej są nietknięte.

- `/pl/design/hero/materia`: materia krzepnie po kolei w pięć rzeczy (stronypodhale, plugin
  aspect-preview, edytor/Airchos, wydruk 3D, panel energii); dotknięcie rozpuszcza kształt.
- `/pl/design/hero/okno`: pod materią leżą zrzuty realizacji, kulka (palec, kursor) klaruje wodę; bez
  dotyku kulka wędruje sama, strony zmieniają się co ok. 5 s albo po dotknięciu.
- `/pl/design/hero/czynniki`: blob rozpada się na cztery podpisane krople (projekt, kod, serwer,
  utrzymanie), krople stykają się parami i zlewają w jeden stały kształt.

Wspólne dla wszystkich: układ plakatowy, odpływ pełnej tafli przy załadowaniu (tafla jest renderowana już
po stronie serwera), litery zostają mokre (zielone, z falującym konturem) i schną do atramentu, kulka
idzie za palcem.

Kod: `src/components/sections/hero-sample.tsx`, `src/components/canvas/hero-samples/`,
`src/app/[locale]/design/hero/[variant]/page.tsx`.

**To są próbki do wyboru historii, nie wykonanie końcowe.** Świadomie nie ma w nich: przejścia w scroll
i w scenę stronypodhale, dopasowania rozdzielczości do wydajności telefonu, wersji dla ograniczonego
ruchu poza statycznym układem, tłumaczeń podpisów (są wpisane na stałe po polsku), testów jednostkowych.
Podpisy kształtów i lista rzeczy to propozycje. Sprawdzone tylko w Chromium (390×844 z dotykiem
i 1440×900, build produkcyjny); **nie sprawdzone na prawdziwym iPhonie**: płynność, filtr na literach
w Safari i zachowanie paska adresu wymagają urządzenia.

### Ocena próbek przez właściciela (2026-11-14)

**Wybrane: połączenie „Materii” i „Czynników”.** „Pod powierzchnią” odpada z dalszej pracy. Do poprawienia
w następnej wersji (słowa właściciela, streszczone):

- więcej organiczności, nieregularności, „kontrolowanego chaosu”;
- obiekt ma mutować bardziej organicznie i naturalnie, lekko się przemieszczać i **nie pojawiać się
  zawsze w tym samym miejscu**;
- tekst może ciekawie reagować na zmiany formy;
- relacja głównego bloba i małego, który idzie za myszką, do poprawienia; tak samo interakcja małego
  bloba z utworzoną materią (dziś po skrzepnięciu nie ma żadnej);
- **ilustracje kształtów są „zbyt nudne, proste, ai-owe”**: obecne piktogramy (okno, kadr, edytor,
  nakrętka, panel) nie zostają w tej formie.

Kierunek połączenia (propozycja): rozpad na krople staje się przejściem między rzeczami, a krople są
częściami rzeczy, która z nich powstaje. Styl ilustracji czeka na decyzję właściciela.

### Próbka druga: „Złożenie” (2026-11-14)

Właściciel wybrał styl ilustracji **„rozebrane na części”**: rzecz nie jest ikoną, tylko układem swoich
części, jak na rysunku złożeniowym. Wdrożone jako podgląd pod `/pl/design/hero/zlozenie`
(`src/components/sections/hero-assembly.tsx`, `src/components/canvas/hero-samples/assembly-shader.ts`);
trzy pierwsze próbki zostają pod swoimi adresami do porównania.

Co robi: materia rozpada się na krople, każda kropla krzepnie w jedną podpisaną część rzeczy (strona:
nagłówek, zdjęcie, treść, kontakt, serwer; plugin; wydruk 3D; dom i energia; Airchos), części topnieją,
materia zbiera się **w innym miejscu** i rozbiera następną rzecz. Za każdym razem inne położenie, obrót,
rozstaw i kolejność części. Imię odpowiada na każdą zmianę stanu (fala przez litery, kontur na moment
płynny). Mały blob bez wskaźnika krąży wokół materii jak satelita, z palcem albo kursorem idzie za nim;
gotową część, której dotknie, miejscowo roztapia i lekko odpycha. Dotknięcie ekranu w trakcie postoju
przechodzi do następnej rzeczy.

Nadal próbka: bez przejścia w scroll i scenę stronypodhale, podpisy na stałe po polsku, rysunek części
z prostych brył, bez testów jednostkowych. Sprawdzone w Chromium (390×844 z dotykiem, 1440×900),
**nie na prawdziwym iPhonie**. Znane: mały blob krążąc bywa przez chwilę nad gotową częścią.

### Ocena „Złożenia” przez właściciela (2026-11-15)

**Kierunek zostaje i będzie dociągany. Wykonanie odrzucone:** „wygląda jak prototyp, nie jak coś, co
mógłbym uznać za podstawę do poprawiania”; poziom „licealisty”, a poprzeczką jest Lusion i wyżej.

Uwagi właściciela:

- Chaos ma być **w blobie i kroplach, nie w ostatecznych kształtach** (próbka losowo obracała gotowe części).
- Wszystko dzieje się liniowo, monotonnie; blob przeskakuje; nic nie przechodzi naturalnie; „małe
  sekwencje posklejane na ślinę”.
- Reakcja tekstu (fala przez litery, falujący kontur) jest „całkowicie bez sensu”.
- Osobne podpisy części nie działają; raczej jeden podpis tego, co powstaje (bez pełnej pewności).
- Ikony są brzydkie, a ich morfowanie nie pasuje do bloba.
- Do sprawdzenia także kompozycja, krój, barwa koloru, kształty.

Przyczyny po stronie wykonania (ocena własna):

1. Ruch jest maszyną stanów ze stałymi czasami i przejściami od zera do zera, stąd szwy i skoki
   (promień i położenie bloba zmieniają się skokiem między fazami). Potrzebny jeden ciągły układ
   fizyczny: pozycje i prędkości, sprężyny, tłumienie, nakładające się akcje, zmienne tempo.
2. Morfowanie to mieszanie dwóch pól odległości (koło ↔ bryła), czyli przenikanie, a nie zachowanie
   cieczy. Ciecz powinna **wlewać się w formę** i tężeć od miejsca styku.
3. Kształty to prostokąty z wyciętymi otworami, czyli zestaw ikon. Potrzebny autorski rysunek w jednym
   systemie (ścieżki, jedna grubość, siatka), zamieniony na pole odległości.
4. Prawo strony zostało odwrócone: gotowa rzecz ma być **precyzyjna i równa**, a nieregularna ma być
   tylko ciecz. Kontrast płynne ↔ stałe jest wtedy widoczny.
5. Reakcja tekstu nie miała przyczyny w obrazie. Tekst reaguje tylko na faktyczny styk z materią
   (jak nasiąkanie liter w produkcyjnym hero) albo wcale.
6. Jedna płaska zieleń na dużych powierzchniach, bez światła, głębi i ziarna; podpisy mono wersalikami.

### Kompozycja i krój: uzupełnienie oceny (2026-11-15)

Właściciel słusznie wytknął, że poprzedni wpis pominął kompozycję: „zaburzone hierarchia, grupowanie,
układ”, „zbiór elementów rzuconych na pustą kartkę”, bez historii i wartości. **Decyzja: Fraunces do
wymiany** (nie pasuje do strony, którą budujemy); Satoshi i JetBrains Mono zostają. To znosi wcześniejszy
zakaz ruszania typografii w zakresie kroju nagłówkowego.

Błędy kompozycji w próbkach (390×844):

1. **Hierarchia odwrócona.** Największy i najciemniejszy jest podpis (imię, 18,5vw, półgruby szeryf),
   a to, co ma opowiadać (materia i rzecz), jest jaśniejsze i lżejsze. Nie ma jednego głównego elementu.
2. **Grupowanie.** Rola (lewo) i zdanie (prawo, wyrównane do prawej) to jedna wypowiedź rozdarta na dwa
   rogi. Podpis rzeczy wisi między rzeczą a imieniem i raz jest bliżej jednego, raz drugiego.
3. **Układ bez siatki.** Nic nie dzieli krawędzi ani osi; rzecz ląduje losowo, więc pusta przestrzeń
   między nią a imieniem jest przypadkowa, nie zamierzona. Dół jest wciśnięty w dock, a przełącznik
   motywu nachodzi na materię.
4. **Brak wypowiedzi.** Ekran nie mówi, kim jest ta osoba ani co oferuje: rola ma 12 px, zdanie jest
   ogólnikiem, między rzeczą a człowiekiem nie ma żadnego związku w tekście, nie ma wskazówki „dalej”.
5. **Cztery style pisma na jednym ekranie** (szeryf, mono wersalikami ×2, szary bezszeryf), interlinia
   imienia 0,86 zlepia wiersze.

Zasady dla przebudowy (propozycja): jedna siatka i jeden lewy margines dla wszystkiego; jeden główny
element (scena materii, ok. 60% wysokości); jeden blok tekstu (imię, rola, jedno zdanie) na wspólnej
krawędzi i w stałych odstępach; podpis rzeczy zawsze w tym samym miejscu i przywiązany do bloku tekstu,
tak żeby nieregularna była tylko materia; najwyżej dwa kroje i trzy rozmiary; widoczna wskazówka
przewijania. Kandydaci na krój nagłówkowy do pokazania na żywo: Satoshi w grubej odmianie (jedna rodzina,
precyzja), Bricolage Grotesque (charakter, zmienna szerokość), Instrument Serif (jeśli zostaje szeryf).

### Krój nagłówkowy: kandydaci po odrzuceniu pierwszej listy (2026-11-15)

Właściciel odrzucił Bricolage Grotesque i Instrument Serif jako „AI slop, widzę je wszędzie”. Warunki:
kroje niszowe, z otwartych foundries, darmowe (atrybucja dopuszczalna), ładne i dopasowane.

Sprawdzone na stronach foundry (licencja SIL OFL, polskie znaki ą ć ę ł ń ó ś ź ż w zestawie):

| Krój          | Foundry, autor                          | Charakter                                                                                  | Uwagi                                     |
| ------------- | --------------------------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------- |
| Sprat         | Collletttivo, Ethan Nakache             | Ostry szeryf wg liternictwa Erica Gilla; zmienny w szerokości i grubości, 18 odmian.       | Najbardziej plakatowy; osie do użycia.    |
| Ortica        | Collletttivo, Ben Bovani                | Dwie osobowości: Linear (lekki, kolczaste szeryfy) i Angular (gruby, same odcinki proste). | Angular „krzepnie” dosłownie w odcinki.   |
| Ronzino       | Collletttivo, L. Gorlero, N. Mazzaferro | Grotesk „informacyjny”, celowo anonimowy; 6 odmian; wydany 01.2025.                        | Charakter niesie wtedy wyłącznie materia. |
| Absans        | Collletttivo, Valerio Monopoli          | Grotesk z początku XX w. z drobnymi nieregularnościami; jedna odmiana.                     | Tylko Regular.                            |
| Apfel Grotezk | Collletttivo, Luigi Gorlero             | Okrągły, przyjazny bezszeryf, 5 odmian.                                                    | Raczej za miękki do tej strony.           |

Do sprawdzenia, niepotwierdzone: Bona Nova (polski krój, Heidrich i Machalski; licencja i zestaw znaków
niezweryfikowane w tej sesji). Katalogów Velvetyne i uncut.wtf nie udało się odczytać automatycznie.
Wybór zapada po pokazaniu krojów na żywo na imieniu i polskim zdaniu; pobranie plików wymaga zgody.

### Trzy rundy z krytykami (`/cook`), 2026-11-15

Wskazania właściciela przed startem: krój **Bona Nova** (polski, darmowy), referencje dla hero to
borndigital.be (obiekt), papertiger.com (układ, storytelling), zajno (tekst), toyfight.co; Lusion nie jest
dobrym wzorem dla hero. Limit: 3 rundy, jeden budujący, dwóch krytyków na rundę.

Co powstało pod `/pl/design/hero/zlozenie` (strona główna nietknięta):

- **Materia jako pole kropel z masą** (`matter-story.ts`, `matter-renderer.ts`): każda kropla jest
  ciągnięta sprężyną tam, gdzie teraz należy (blob, kropla w drodze, miejsce w rysunku); nic nie jest
  interpolowane między pozami, więc nic nie skacze. Rysunek krzepnie tam, gdzie krople doszły i stanęły.
- **Rysunki** (`things.ts`): dokładne części na jednej siatce, trzy płaskie tony zieleni; na razie dwie
  rzeczy (układ stronypodhale, wydruk w trakcie).
- **Kompozycja:** jedna siatka, jeden obiekt, linia z jednym podpisem, jeden blok tekstu; imię w Bona Nova.

**Błąd w rundzie 2 i jego korekta.** Krytycy żądali od cieczy światła, połysku i cienia; dodałem je i blob
przestał być sobą. Właściciel: „Płaski, pastelowy blob, to był cały zamysł, miałeś poprawić jego ruch,
przekształcanie, interakcje, a nie dodawać mu światłocieni”. Całe cieniowanie usunięte; blob jest znów
płaski, pastelowy, z miękką krawędzią. **Reguła: wygląd bloba jest nietykalny, krytycy muszą to dostać jako
założenie, a brak odpowiedzi na pytanie wstępne nie jest zgodą na zmianę czegoś, co właściciel wcześniej
zastrzegł.**

Oceny krytyków (1–10, referencje ≈ 8,5): runda 1 układ ~5, typografia ~6, materia ~4,5, ruch ~5; runda 2
układ ~5,5, typografia ~6,3, materia ~5, ruch ~4,8. Runda 3 bez krytyków (najpierw ocena właściciela).
Poprzeczka 8,5 nie jest osiągnięta. Najsłabsze: rysunki rzeczy nadal czytane jako „ikony z zestawu UI”.
Nie sprawdzone: prawdziwy iPhone, czas klatki, interakcja palcem na zrzutach. Stan pętli jest w katalogu
`cook/` (lokalnie, poza gitem).

### Szkielet hero: „imię ramuje obiekt” (2026-11-15)

Właściciel po rundach: największym problemem są zasady UI, układ i hierarchia, nie materia; materii nie
ruszamy. Wybrany szkielet (z trzech pokazanych): **imię ramuje obiekt**. Pierwsze słowo imienia stoi nad
obiektem, drugie pod nim (wyrównane do prawej), obiekt jest jedyną rzeczą, która się zmienia. Pod spodem
jeden blok na jednej krawędzi: linia, rola po lewej i podpis rzeczy po prawej, zdanie, przycisk „Zobacz
moje projekty”. Odstępy na skali 4 px. Na desktopie imię ramuje obiekt po przekątnej (lewy górny, prawy
dolny róg), a blok tekstu stoi w lewym dolnym rogu. Odrzucone: „kto, co, dowód, akcja” oraz „zdanie
prowadzi”. Wdrożone w `src/components/sections/hero-assembly.tsx`; shader i ruch materii bez zmian.

### Po ocenie układu (2026-11-15, wieczór)

Właściciel: układ „dużo lepszy”, ale nie działał na ultrawide 1440p; blob z cząstek ciekawszy, lecz „zbyt
luźny i lekki, bardziej jak kulki dymu niż ciecz”; przejścia blob ↔ rysunek i moment ładowania do
dopracowania; **podoba mu się wiele blobów różnej wielkości, które zbiegają się i kondensują w jeden
kształt** (efekt wyszedł przypadkiem, ma zostać jako zamierzony).

Zrobione:

- **Ultrawide:** kontener i pismo skalują się także z wysokością ekranu (`max(1440px, 178svh)`, imię
  `min(8.6vw, 16svh)`, tekst i przycisk przez `clamp` w `svh`). Sprawdzone na 3440×1440.
- **Ciecz zwarta:** sztywniejsze sprężyny i większe tłumienie kropel, węższa miękka krawędź, mniejsze
  rozmycie pola. Wygląd bez zmian: płaski, pastelowy.
- **Kondensacja jako mechanizm:** przy ładowaniu materia jest rozsiana po kadrze w 13 kroplach różnej
  wielkości, które po kolei ruszają i zlewają się w bloba (zielona tafla na start usunięta). Większe części
  rysunku przychodzą w dwóch–trzech nierównych kroplach, więc rzecz kondensuje się z kilkunastu kropel;
  tak samo wraca do bloba.

Nie sprawdzone: prawdziwy iPhone, czas klatki, interakcja palcem.

### Wejście z choreografią ciążenia (2026-11-15, noc)

Uwagi właściciela: całość ma być organiczna, nie sekwencyjna i „robotyczna”; wejście potrzebuje jednej
choreografii; **blob jest cięższą materią: przyciąga i wchłania, nic przed nim nie ucieka**; imię ma być
częścią całości z blobem: prawie wyśrodkowane, z niewielkim przesunięciem, bliżej bloba, który czasem je
przykrywa i lekko zniekształca. Dwa pomysły na ładowanie: (1) ogromny blob spada, rozpryskuje się i zbiega
z powrotem; (2) krople spoza ekranu, w różnym tempie i kształcie, część tworzy bloba, część buduje litery.

Wdrożony pomysł 2 (pomysł 1 nie był próbowany):

- Ruch nie jest już prowadzony po krzywych. Krople **spadają** ku celowi (stałe przyciąganie, opór, własny
  boczny prąd), więc ruszają wolno i dolatują szybko, każda po swoim łuku; małe są szybsze, duże cięższe.
  W locie się wydłużają, spłaszczają i wybrzuszają we własnym rytmie, a wolniejsze cząstki ciągną się za
  nimi jak ogon.
- **Blob wchłania:** przejmuje materię i pęd kropli, odbija i przez chwilę drga; rośnie z tym, co wchłonął.
- **Litery z materii:** ok. 1/3 materii leci w miejsce liter (maska rysowana czcionką dokładnie tam, gdzie
  stoi tekst), wlewa się w nie i tężeje na zielono; potem prawdziwy tekst przejmuje, materia zbiera się
  z liter w krople i spada do bloba. Dopiero wtedy wchodzi blok tekstu i zaczyna się pierwsza rzecz.
- **Wskaźnik:** luźna kropla przy blobie jest do niego wciągana, a płynna materia sięga po nią; nic się
  nie rozstępuje. Gotowy rysunek pod wskaźnikiem tylko mięknie.
- **Układ:** imię i obiekt w jednej kolumnie, słowa przesunięte o ok. 7% i 9% w przeciwne strony, tuż przy
  obiekcie; canvas leży nad imieniem, więc blob je przykrywa, a litery w jego zasięgu lekko się ku niemu
  przechylają.

Nie sprawdzone: prawdziwy iPhone, czas klatki, wskaźnik i palec (zrzuty tego nie pokazują). Pierwsze ok.
0,5 s jest puste (czekanie na czcionkę i dolot pierwszych kropel).

Poza zakresem, zauważone przy okazji: etykieta w hero to nadal „Web Architect” (`src/i18n/messages/pl.json:38`),
a dokument decyzji każe ją zastąpić.

### Prawdziwa ciecz zamiast sprężyn (2026-11-15/16)

Diagnoza uzgodniona z właścicielem: sztuczność brała się z tego, że każda cząstka była przywiązana sprężyną
do z góry przypisanego miejsca, a cząstki na siebie nie działały. To zostało usunięte w całości; **żadna
cząstka nie ma już miejsca ani punktu docelowego**. Wygląd bloba, układ, typografia i rysunki bez zmian.

Jak to teraz działa (`src/components/canvas/hero-samples/`):

- **`matter-fluid.ts`, ciecz.** Cząstki odpychają się, gdy jest ciasno, trzymają razem, gdy są rozciągane,
  hamują przy zbliżaniu i przejmują ruch sąsiadów. Napięcie powierzchniowe jest osobną siłą: materia jest
  ciągnięta tam, gdzie w pobliżu jest jej więcej. Zlewanie, szyjki, zrywanie i nieregularne kształty
  wynikają z tego same.
- **`matter-moulds.ts`, forma.** Rysunek i litery to dwa pola liczone z istniejących masek: ściana (pole
  odległości i jego kierunek) oraz „pragnienie” (przyciąga tam, gdzie formie jeszcze brakuje materii,
  przestaje, gdy jest pełna). Materia wypełnia formę, bo sama się w niej rozpycha.
- **`matter-story.ts`, historia jako siły.** Blob to ciążenie ku środkowi sceny (w środku żadne). Litery
  buduje deszcz drobnych kropel rzuconych zza słów, grube krople z boków zbierają się w bloba. Gdy litery
  przestają przyjmować materię, nadmiar spływa do bloba, wchodzi prawdziwy tekst, a forma puszcza (najpierw
  najbliżej bloba). Rzecz: każda część rysunku ściąga sobie kroplę na własną stronę, więc blob dzieli się
  na tyle nierównych kropel, ile rysunek ma części; kropla, która ma dość, spada w formę. Tężenie to
  rosnąca lepkość tam, gdzie materia stoi w pełnej części formy. Topnienie idzie tą samą drogą wstecz.
  Wskaźnik ma własną małą kroplę, którą blob wciąga, gdy podejdzie blisko.

Dwa świadome odstępstwa od „samej fizyki”: ok. 1/3 materii jest od startu oznaczona jako ta, na którą
działają litery (bez tego blob zalewał słowa jednym słupem), a podział bloba prowadzą punkty przyciągania
wyznaczone z części rysunku. To są podziały i pola, nie przypisania do punktów.

Odrzucone po drodze: kohezja z samego ciśnienia (ciecz zastygała jak plastelina), większa sztywność (rozpad
symulacji), „pragnienie” odpychające nadmiar (wyrzucało materię z kadru), przyciąganie liter z daleka
(krople przelatywały przez słowa), wybuch jako sposób rozbierania bloba (piana zamiast kropel).

Sprawdzone: ruch oglądany na gęstych paskach, klatka po klatce w 60 kl./s, z prawdziwej strony (zegar
strony przesuwany ręcznie, `cook/strips.mjs`, paski w `cook/stills/final/`) na 390×844, 1440×900 i
3440×1440. Czas klatki, Chrome na Macu, build produkcyjny, ekran 120 Hz (`cook/frame-time.mjs`): JS na
klatkę średnio 1,8 ms w układzie telefonu (1734 cząstki), 2,9 ms na 1440×900 i 3,3 ms na 3440×1440
(2860 cząstek), 95. percentyl 2,8 / 4,5 / 4,8 ms; telefon z procesorem spowolnionym 4×: średnio 6,9 ms, 95. percentyl 10,3 ms. Przy 60 Hz symulacja robi dwa kroki na klatkę, więc koszt jest mniej więcej dwa
razy większy. Testy jednostkowe: `matter-fluid.test.ts`, `matter-moulds.test.ts`, `matter-story.test.ts`.

Nie sprawdzone: prawdziwy iPhone i Safari, koszt po stronie GPU, dotyk palcem (tylko mysz w skrypcie).

Wciąż nie tak: początek podziału bloba rozchyla się w zbyt regularną gwiazdę; litery z materii mają braki
w cienkich kreskach (wypełnienie ok. 75–85%), które przykrywa dopiero prawdziwy tekst; rzecz przed
stężeniem przechodzi przez fazę jednolitej „płyty” nad rysunkiem; blob bywa na chwilę sklejony ze słowami,
gdy litery puszczają; kropla wskaźnika dolatuje do niego rozproszona i zbiera się dopiero na miejscu.

### Rzecz budowana po kolei, tak jak powstaje naprawdę (2026-11-15)

Po ocenie na żywo właściciel uznał, że hero „nie opowiada historii, daje tylko popis umiejętności”, i poprosił
o scenariusz przed szlifowaniem. Przyjęty punkt wyjścia: jedna materia, a z niej rzeczy w trzech stanach
(działa, w realizacji, zrozumiane i odłożone); opowieść dzieje się w dwóch przejściach: krople → obraz
i obraz → blob. Pierwsza zmiana w kodzie dotyczy budowania.

Jak to działa:

- **Części otwierają się po kolei.** Rysunek ma etykietę części dla każdego piksela (`ids` w `things.ts`),
  a forma (`matter-moulds.ts`) umie otwierać się częściami: zamknięta część nie ciągnie materii i nie liczy
  się jako miejsce. Kolejność to kolejność powstawania: strona jak się ją czyta (rzędami od góry, w rzędzie
  od lewej), wydruk od stołu przez ramę i naczynie do szpuli i głowicy (`order` przy rzeczy).
- **Przyczyna zamiast zegara.** Następna część zaczyna się, gdy ok. 30% poprzedniej stężało (albo po 0,7 s,
  żeby cienka belka nie wstrzymywała reszty).
- **Zapas materii zostaje jednym ciałem** i czeka nad tym, czego rzeczy jeszcze brakuje, więc gotowe części
  zostają odsłonięte, a blob maleje i przesuwa się w stronę ostatnich.
- **Blob przed oddaniem materii się rozluźnia** do gęstości rzeczy. Bez tego części leżące pod blobem
  dostawały więcej, niż mieszczą, tężały z nadmiarem i ostatnim częściom brakowało materii.
- **Powrót zaczyna się od części zrobionej na końcu** i idzie przez rzecz; materia sama się ściąga
  i wraca do środka. Wyrzucanie kropel na boki zostało usunięte (punkty przyciągania z poprzedniej wersji
  zniknęły z kodu).

Odrzucone po drodze: ograniczenie tężenia progiem lokalnego wypełnienia (wycięcia w rysunku zawyżają odczyt
i nic nie tężało), odbieranie chwytu nadmiarowej materii (luźna ciecz skleja się do gęstości bloba, więc
nadmiar nigdy nie znikał), uwolnienie materii z obrzeża pełnych części (części wychodziły niepełne).

Świadome odstępstwo od rozpisu: rzecz nie powstaje z osobnych kropel z szyjkami, tylko wyłania się spod
bloba, który ją odsłania. Powód: blob jest prawie tak duży jak rzecz i leży na jej miejscu, więc krople nie
mają dokąd lecieć.

Sprawdzone na paskach 60 kl./s z prawdziwej strony (`cook/stills/g02/`) na 390×844, 1440×900 i 3440×1440.
Budowa trwa ok. 4,2 s, powrót ok. 1,4 s. Krok symulacji w Node: średnio 2,1 ms (1734 cząstki) i 3,7 ms
(2860 cząstek), bez zmiany względem poprzedniej wersji.

Wciąż nie tak: ostatnia część strony (stopka) dostaje ok. 65–80% materii i bywa krótsza na końcach, bo
ok. 15% materii zostaje w szczelinach między częściami; belka powstaje jako „pokrywka” na blobie, zanim
rozleje się na całą szerokość; rozluźniony blob jest o ok. 10% większy i na chwilę dotyka liter imienia.
Nie zrobione z rozpisu: tężenie frontem od miejsca dotknięcia, „ostatnia kropla” jako najciemniejszy
element, różnice między trzema stanami rzeczy, zdanie przy obiekcie (układ).

### Powrót do bloba z produkcji: charakter zamiast nowej techniki (2026-11-15)

Po ocenie na żywo właściciel odrzucił hero, w którym ciecz buduje rysunki („dziecięco, mega niedopracowanie,
kompletnie nieprofesjonalnie”), a potem także pomysł cieczy odsłaniającej zdjęcie w hero („niedopuszczalne”;
zostaje tylko w przejściu z hero do sekcji). Sprawdzony po drodze EffectCraft (odpowiednik After Effects,
sterowany z agenta przez lokalny kanał aplikacji) daje ostrą płaską ciecz, ale gotowy klip nie zareaguje na
kursor, a to interakcja jest dla niego najważniejsza. Punktem wyjścia został więc blob z obecnej strony:
„kształt i mutowanie wyglądały już naprawdę dobrze, potrzebowało dopracowania i ekspresji”.

Jak to działa:

- **Stół do strojenia** pod `/pl/design/hero/blob`: blob z produkcji przepisany wzór po wzorze i panel
  suwaków. Właściciel stroi na żywo i kopiuje wartości; agent dostarcza tylko mechanizmy.
- **Charakter bloba** (`viscous-puddle/character.ts`), wspólny dla próbki i strony głównej: zarys wędruje
  w dużej skali (wygina samo ciało, przed zlaniem z kroplą), ciało pochyla się za kursorem z opóźnieniem,
  po wejściu kropli faluje i rośnie o to, co wchłonęło, a kropla wyciąga się w kierunku ruchu.
- **Ustawienia właściciela** (`TUNED`): mutacja 0,7, tempo 1,5, ciężar 0,25, połknięcie 0,5, bezwładność
  kropli 1, sprężystość 0. Most między ciałem a kroplą („nitka”) został na jego prośbę usunięty.
- **Na stronie głównej** charakter działa tylko na wolnego bloba: choreografia podaje `loose` (1 w spoczynku,
  0 gdy blob przywiera do imienia i jako tafla), więc przywieranie, wsiąkanie, przelot i scena przejścia
  wyglądają jak dotąd.

Odrzucone po drodze: mutacja skalowana ostrym przełącznikiem ciało/kropla (cięła szew wzdłuż granicy między
nimi), most jako odcinek o malejącej grubości (miękka krawędź rysowała go jako smugę z każdej odległości).

Sprawdzone: zrzuty z przeglądarki, spoczynek, kursor i całe przewijanie strony głównej na 1440×900 i 390×844
(`cook/stills/home1/`). Nie sprawdzone: ruch na żywo oceniał tylko właściciel i tylko na próbce; prawdziwy
iPhone i Safari; testy e2e.

Dotyk (ten sam dzień, na prośbę właściciela): na stronie głównej i w próbce kropla idzie za palcem, póki
dotyka ekranu, i wraca do bloba po puszczeniu. Zdarzenia dotyku zamiast wskaźnika, bo te drugie przeglądarka
przerywa w chwili, gdy palec zaczyna przewijać. Sprawdzone na emulowanym telefonie (`cook/stills/touch1/`),
nie na prawdziwym.

### Co hero mówi: jeden gest i trzy zdania; trzy kadry do wyboru (2026-11-15, późny wieczór)

Runda pytań o treść, przed jakimkolwiek układem. Ustalenia właściciela:

- **Bez listy dowodów w hero.** Lista rzeczy ze stanami (działa, w realizacji, zrozumiane i odłożone)
  wyglądała na „upychaną na siłę”. Rzeczy zostają dla scen po scrollu. Poprawki faktów przy okazji: Piczura
  jest zbudowana i live; Airchos nie do hero; ready2order „niekoniecznie”.
- **Hero ma być osobiste** („to nie strona produktu, tylko moje portfolio”) i łączyć zabawę oraz wrażenie
  z tym, co robi i jak pracuje.
- **Jeden gest:** gość kroplą rozrywa bloba na kilka nierównych części, a blob, jako cięższa materia, sam
  składa się z powrotem. Gest odgrywa trzy cechy naraz: rozkładanie na części, wszystko w jednych rękach,
  nic z gotowych klocków. Tekst tylko nazywa to, co gość właśnie zobaczył.
- **Tekst (angielski, zatwierdzony):** mała linia „I design and build websites and web apps.” oraz trzy
  zdania, po jednym na chwilę bloba: „I take things apart.” / „I put them back together myself.” /
  „Nothing off the shelf.” Wszystkie trzy są zawsze widoczne; zdanie bieżącej chwili jest w pełnym
  atramencie, pozostałe przygaszone.
- **Bez etykiety roli w hero.** „Web Architect” znika; tytuł zawodowy żyje w metadanych, docku i na
  stronie o mnie.
- Odrzucone: „By hand.” (koliduje ze stroną „Jak pracuję z agentami” i obiecuje pracę „jak jaskiniowiec”),
  „No templates.” (mniej znaczenia). Pierwsze polskie brzmienie trzech zdań brzmiało źle; **polską wersję
  trzeba napisać od nowa, nie tłumaczyć.**

**Trzy kadry (statyczne, bez ruchu)** pod `/en/design/hero/kadr-imie`, `kadr-slowa`, `kadr-materia`
(`src/components/sections/hero-frame.tsx`, `src/components/canvas/hero-samples/frame-shader.ts`). Różnią
się tym, co jest największe:

1. **Imię** (szkielet „imię ramuje obiekt”): imię ramuje bloba po przekątnej, trzy zdania są blokiem
   w lewym dolnym rogu.
2. **Słowa:** trzy zdania jako plakat na całą szerokość, blob rozrywany wśród nich, imię jako podpis.
3. **Materia:** cała opowieść w jednym kadrze, z góry na dół: luźne krople, krople zlewające się, jedno
   ciało; każde zdanie stoi przy swoim stanie.

Blob w kadrach jest liczony tymi samymi wzorami co produkcyjny (płaski, pastelowy, miękka krawędź, wędrujący
zarys), rozszerzonymi o kilka ciał i zwężający się „język” ciągniętej materii; czas stoi. Zrzuty:
`cook/stills/kadry-final/` (lokalnie, poza gitem), skrypt `cook/kadry-shots.mjs`.

Wnioski z budowy kadrów:

- **Małe części bloba dymią.** Miękka krawędź ma stałą szerokość (ok. 18 px), więc część o promieniu
  poniżej ok. 60 px wygląda jak kłębek dymu, a nie ciecz. Gest rozrywania będzie takie części produkował;
  ruch musi to rozstrzygnąć (większe części albo krawędź skalowana z rozmiarem, co zmienia wygląd i wymaga
  zgody właściciela).
- **Części ułożone w jednej osi czyta się jako figurę** (pionek, butelka, totem). Ciągnięcie musi iść po
  skosie, z przewężeniem, a stany materii nie mogą stać jeden nad drugim.
- Na telefonie palec, który ciągnie bloba, jednocześnie przewija stronę; kadry tego nie rozstrzygają.

Rekomendacja wykonawcy: kadr 2 (słowa). Wybór należy do właściciela; do tego czasu nie powstaje kod ruchu.

**Wybór właściciela (2026-11-15): kadr 1, imię.** Szkielet „imię ramuje obiekt” zostaje; trzy zdania są
blokiem przy imieniu, a nie plakatem. Powodu nie podał. Kadry 2 i 3 nie idą dalej; ich kod zostaje na
trasie próbek do czasu, aż ruch dla kadru 1 będzie gotowy. Następny krok: scenariusz ruchu dla kadru 1,
krok po kroku i z przyczyną każdego ruchu, do poprawienia przez właściciela, zanim powstanie kod. Do
rozstrzygnięcia w scenariuszu: małe części bloba, które dymią; gest rozrywania a przewijanie na telefonie;
to, że w tym kadrze trzy zdania są najmniejszym elementem.
