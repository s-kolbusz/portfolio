# Scroll hero: scenariusz

Data: 2026-09-25, wersja 3: 2026-09-26
Status: **wersja 3 w prototypie** (kinowe tempo, reakcja na kursor; wersja 2 wdrożona i oceniona na żywo).
Łączy się z: [przejście sygnaturowe](./2026-09-25-przejscie-sygnaturowe-scenariusz.md).

## Co ma opowiedzieć

Osoba → materia → realizacja, jednym ruchem:
**imię wypija kolor z bloba jak bibuła, blob zostaje czystą wodą, a kamera
wjeżdża w nasiąkniętą literę, prosto w materię, z której formuje się realizacja.**

Litery zostają nietknięte jako kształty. Zmienia się tylko to, czym są
nasycone. Rozlatywanie się słów i powiększanie to jeden ruch kamery
(najazd z perspektywą), a nie dwa efekty.

## Czego unikamy (wnioski z odrzuconych wersji)

- **Niszczenia typografii:** szczerbienia imienia literami, tuszu rozlewającego
  się plamami, topnienia (filtr SVG i shader). Imię w dobrym kroju to najlepszy
  element hero, a każda z tych wersji je rozbijała.
- **Napełniania szklanki:** liniowego wypełniania liter od dołu razem
  z kurczącym się blobem. Gąbka pije barwnik, a nie objętość.
- **Koloru „prawie jak blob”.** Zieleń w literach jest tą samą zielenią, rysowaną
  w tym samym shaderze z tego samego `uColor`, więc zgodność wynika z konstrukcji.
- **Odzyskiwania bloba na siłę.** Kadr pełen materii bierze się z wnętrza
  nasiąkniętej litery, a scena sygnaturowa już startuje od pełnego kadru.

## Budowa

- Hero przypięte na 2 ekrany scrolla (`H` 0–1), potem scena sygnaturowa
  (`P`, 2 ekrany). Razem 4 ekrany, na desktopie i na telefonie. W wersji 2
  hero miało 1 ekran i przywarcie oraz wjazd były za szybkie względem reszty
  strony.
- Wszystko jest funkcją pozycji scrolla: szybko, wolno, wstecz i po przerwaniu
  wygląda tak samo.
- **Kamera z bezwładnością:** stan sceny nie skacze za scrollem, tylko podąża
  za nim z tłumieniem (stała czasowa ok. 0,2 s, na wierzchu wygładzenia Lenisa).
  Zatrzymanie scrolla dociąga ruch do końca miękko. Pozycje elementów DOM
  zostają przypięte do prawdziwego scrolla, opóźnia się tylko przebieg.
  Duży skok (kotwica, End, resize) ustawia stan od razu, bez doganiania.
- Od początku wsiąkania imię rysuje canvas (maska z tym samym fontem i
  pozycjami co DOM, więc podmiana jest zgodna co do piksela, zmierzone).

## Klatki

| H                                                                                   | Etap            | Obraz                                                                                                                                                                                              |
| ----------------------------------------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0                                                                                   | **Spoczynek**   | Hero jak dziś: imię, rola, zdanie oferty, CTA, żywy blob, kulka kursora.                                                                                                                           |
| 0.00–0.14                                                                           | **Uwaga**       | Rola, zdanie i CTA gasną, zostaje imię i blob.                                                                                                                                                     |
| 0.06–0.32                                                                           | **Przywarcie**  | Blob powoli, z ciężarem, przesuwa się pod imię i rozlewa wzdłuż niego, aż dotknie wszystkich liter (na telefonie obu linii).                                                                       |
| 0.24–0.52                                                                           | **Wsiąkanie**   | Każda litera zasysa kolor w całości: powoli przechodzi od czerni w zieleń bloba, bez plam i bez czoła, falą od liter najbliższych blobowi. Blob w tym samym tempie blednie do przezroczystej wody. |
| 0.50–1.00                                                                           | **Wjazd**       | Kamera powoli najeżdża na najgrubszą nasiąkniętą kreskę przy środku imienia. Słowa rozjeżdżają się na boki i rosną z perspektywy. Na końcu zieleń tej kreski wypełnia cały ekran.                  |
| → P 0                                                                               | **Przekazanie** | Pełny kadr materii zostaje pełnym kadrem: ciemnieje i staje się taflą (scena sygnaturowa).                                                                                                         |
| **Jeden rytm** (wersja 4, po ocenie na żywo: „wszystko w innym tempie”):            |
| każdy etap hero i sceny trwa ok. pół ekranu scrolla i ma tę samą łagodną krzywą     |
| (`smoothstep`), a następny rusza, gdy poprzedni dogasa. Wyjątkiem jest wjazd,       |
| jedyny duży ruch kamery: pełny ekran, też łagodny na starcie i na końcu (bez        |
| przyspieszania pod koniec). Dzięki temu jedna prędkość scrolla czyta całą historię. |
| Wszystko jest związane ze scrollem (scroll-bound), nic nie odpala się na czas.      |

## Kolor

- Tusz = kolor tekstu z motywu (ciemny w jasnym, jasny w ciemnym).
- Zieleń w literach = `uColor` bloba, czyli dokładnie ten sam kolor.
- Przejście: cała litera naraz, płynnie od tuszu do zieleni (bez plam i czoła).
- Blob: nasycenie i krycie spadają do przezroczystej wody (delikatne załamanie
  i odblask, bez koloru).

## Kulka kursora

W hero działa jak dziś, a w trakcie wsiąkania blednie razem z blobem (to ta sama
woda). W scenie sygnaturowej odrywa się od nowej materii, zielona, jak teraz.

**Litery reagują na kulkę** od chwili, gdy imię rysuje canvas:

- **Źródło:** kulka jest drugim źródłem wody. Litery pod nią zasysają szybciej
  (wsiąkanie wyprzedza scroll w jej zasięgu).
- **Przyciąganie:** zieleń w literach gęstnieje i jaśnieje przy kulce, a gdy
  kulka odjedzie, wraca do poziomu wyznaczonego przez scroll.
- Zasięg ok. 2 promieni kulki, miękko. Bez kursora (dotyk) kulka spoczywa w blobie,
  więc reakcja to spokojny, stały akcent.

## Telefon

Te same etapy i długości. Imię ma dwie linie, więc blob przywiera do obu.
Cel wjazdu jest dobierany z kształtu imienia, więc działa bez zmian.

## Reduced motion i brak WebGL

Bez przypięcia i bez wsiąkania. Hero wygląda i przewija się jak dziś.

## SEO i dostępność

- `h1` z imieniem zostaje w DOM przez cały czas, a canvas ma `aria-hidden`.
- LCP bez zmian: ruch zaczyna się dopiero od scrolla.

## Decyzje

2026-09-25 (nadal obowiązują):

1. **Tło (plan 1):** nie w hero, wejdzie w kroku 2 roadmapy dla całej strony.
2. **Długość:** ~~hero 1 ekran~~ hero 2 ekrany (zmiana 2026-09-26) i scena sygnaturowa 2 ekrany, razem 4.
3. **Przekazanie:** scena sygnaturowa startuje z pełnego kadru materii.
4. **CTA hero:** przewija przez całą sekwencję (ok. 5 s).
5. **Telefon:** te same długości co desktop.

2026-09-26: 6. **Blob** blednie do czystej wody (ubywa koloru, nie objętości). 7. **Kontakt:** blob przywiera do imienia i dotyka wszystkich liter. 8. ~~**Czoło nasiąkania:** włóknisty gradient.~~ Zmienione po klatkach: plamy
rozchodzące się po kreskach wyglądały jak atrament kapiący na bibułę.
Litery zasysają kolor w całości i płynnie przechodzą od czerni w zieleń. 9. **Cel wjazdu:** najgłębszy punkt kreski przy środku (największe koło wpisane),
dobierany z kształtu imienia. 10. **Materiał bloba:** zostaje płaska, rozmyta plama. Test „kropli żelu”
(światło, odblask, cień) odrzucony.

2026-09-26, wersja 3:

11. **Kursor:** litery reagują na kulkę na dwa sposoby: źródło (szybsze wsiąkanie) i przyciąganie (gęstsza, jaśniejsza zieleń).
12. **Tempo:** kinowe. Hero wydłużone do 2 ekranów, przywarcie i wjazd wolniejsze, kamera z bezwładnością.
13. **Jeden rytm i tylko scroll-bound** (wersja 4): etapy po ok. pół ekranu, ta sama krzywa, wjazd bez przyspieszenia.

## Gotowe gdy

- 5 widoków (390×844 → 3440×1440), szybki i wolny scroll, obie strony, przerwanie.
- PL i EN, oba motywy, dotyk, klawiatura, reduced motion.
- Właściciel zaakceptował w przeglądarce.
