# Scroll hero: scenariusz

Data: 2026-09-25, wersja 2: 2026-09-26
Status: **choreografia zaakceptowana w rozmowie, prototyp w klatkach przed wdrożeniem.**
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

- Hero przypięte na 1 ekran scrolla (`H` 0–1), potem scena sygnaturowa
  (`P`, 2 ekrany). Razem 3 ekrany, na desktopie i na telefonie.
- Wszystko jest funkcją pozycji scrolla: szybko, wolno, wstecz i po przerwaniu
  wygląda tak samo.
- Od początku wsiąkania imię rysuje canvas (maska z tym samym fontem i
  pozycjami co DOM, więc podmiana jest zgodna co do piksela, zmierzone).

## Klatki

| H         | Etap            | Obraz                                                                                                                                                                                                                                                                                                                                                           |
| --------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0         | **Spoczynek**   | Hero jak dziś: imię, rola, zdanie oferty, CTA, żywy blob, kulka kursora.                                                                                                                                                                                                                                                                                        |
| 0.00–0.15 | **Uwaga**       | Rola, zdanie i CTA gasną, zostaje imię i blob.                                                                                                                                                                                                                                                                                                                  |
| 0.10–0.30 | **Przywarcie**  | Blob, wciągany kapilarnie, przywiera do imienia: spłaszcza się i wydłuża wzdłuż niego, aż dotknie wszystkich liter (na telefonie obu linii).                                                                                                                                                                                                                    |
| 0.15–0.55 | **Wsiąkanie**   | Tam, gdzie blob dotyka liter, kolor wchodzi w kreski i rozchodzi się po nich jak w bibule: nierównym, włóknistym czołem, najpierw szybko, potem coraz wolniej, z miękkim przejściem tusz → zieleń. Kolejność wynika z odległości od miejsca styku. Blob w tym samym tempie blednie do przezroczystej, lekko załamującej wody: ubywa mu koloru, a nie objętości. |
| 0.55–1.00 | **Wjazd**       | Kamera najeżdża na najgrubszą nasiąkniętą kreskę przy środku imienia. Słowa rozjeżdżają się na boki i rosną z perspektywy, a woda po blobie zostaje za nimi i wychodzi z kadru. Na końcu zieleń tej kreski wypełnia cały ekran.                                                                                                                                 |
| → P 0     | **Przekazanie** | Pełny kadr materii cofa się i formuje w 16:9. Dalej scena sygnaturowa bez zmian: ciemnienie, tafla, nagłówek, kulka.                                                                                                                                                                                                                                            |

Czasy etapów stroimy w prototypie.

## Kolor

- Tusz = kolor tekstu z motywu (ciemny w jasnym, jasny w ciemnym).
- Zieleń w literach = `uColor` bloba, czyli dokładnie ten sam kolor.
- Czoło: gradient tusz → zieleń na krótkim odcinku z szumem włókien.
  Za czołem jest pełna zieleń.
- Blob: nasycenie i krycie spadają do przezroczystej wody (delikatne załamanie
  i odblask, bez koloru).

## Kulka kursora

W hero działa jak dziś, a w trakcie wsiąkania blednie razem z blobem (to ta sama
woda). W scenie sygnaturowej odrywa się od nowej materii, zielona, jak teraz.

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
2. **Długość:** hero 1 ekran i scena sygnaturowa 2 ekrany, razem 3.
3. **Przekazanie:** scena sygnaturowa startuje z pełnego kadru materii.
4. **CTA hero:** przewija przez całą sekwencję (ok. 4 s).
5. **Telefon:** te same długości co desktop.

2026-09-26: 6. **Blob** blednie do czystej wody (ubywa koloru, nie objętości). 7. **Kontakt:** blob przywiera do imienia i dotyka wszystkich liter. 8. **Czoło nasiąkania:** włóknisty gradient, najpierw szybko, potem wolniej. 9. **Cel wjazdu:** najgrubsza kreska przy środku, dobierana z kształtu imienia.

## Gotowe gdy

- 5 widoków (390×844 → 3440×1440), szybki i wolny scroll, obie strony, przerwanie.
- PL i EN, oba motywy, dotyk, klawiatura, reduced motion.
- Właściciel zaakceptował w przeglądarce.
