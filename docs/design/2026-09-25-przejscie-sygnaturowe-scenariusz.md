# Przejście sygnaturowe: scenariusz

Data: 2026-09-25
Zadanie: [SEB-63](https://linear.app/sklbsz/issue/SEB-63)
Status: **do akceptacji.** Po akceptacji kod powstaje według tego dokumentu.
Źródło osi: [decyzje redesignu](./2026-09-24-redesign-decyzje.md) (Fluid → Solid, prawo ruchu, 4 plany).

## Co ma opowiedzieć

Płynna materia z hero krzepnie w konkretną realizację. To ta sama materia,
a nie podmiana: blob nie wpada w gotową ramkę, tylko sam staje się stroną
stronypodhale.pl.

Dlaczego kolor ma znaczenie: tło stronypodhale.pl to ciemna zieleń. Blob,
krzepnąc, ciemnieje dokładnie do koloru tej strony, więc zmiana koloru jest
częścią przemiany, a nie ozdobnikiem.

## Czego unikamy (wnioski z prototypów 1 i 2)

- Długie mutowanie bloba bez kontekstu.
- Kształt, który przechodzi przez ostre rogi i znów się zaokrągla.
- Pusta ramka, w którą blob „próbuje się wpasować”.
- Crossfade zrzutu nad zielonym prostokątem, czyli podmiana zamiast przemiany.
- Elementy sceny, które nie używają komponentów i animacji reszty strony.

## Budowa sceny

- Hero, a zaraz pod nim **scena przypięta**: sekcja o wysokości `100vh + 250vh`
  z wewnętrzną warstwą `position: sticky` o wysokości 100vh. Przez 2,5 ekranu
  scroll steruje przemianą, a strona stoi.
- Wszystko jest funkcją pozycji scrolla (`P` = postęp przypięcia 0–1), więc
  działa tak samo przy szybkim i wolnym scrollu, wstecz i po przerwaniu.
- Blob renderuje się na stałym canvasie za treścią. Zrzut strony trafia do
  shadera jako tekstura (ten sam plik co obraz w DOM).

## Klatki

| P         | Etap              | Obraz                                                                                                                                                                                                                                                                | Odczyty (mono, pierwszy plan)                      |
| --------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| przed     | **Hero**          | Blob żyje jak dziś: kursor, oddech, dryf. Tekst hero odjeżdża normalnie, a blob płynie na środek kadru.                                                                                                                                                              | —                                                  |
| 0.00–0.10 | **Wejście**       | Scena się przypina. Blob na środku, jeszcze płynny, kursor nadal działa.                                                                                                                                                                                             | Pojawia się cel: `01 — stronypodhale.pl`           |
| 0.10–0.45 | **Formowanie**    | Blob się uspokaja i sam wyciąga do docelowego 16:9. Jeden kształt: koło → zaokrąglony prostokąt, rogi tylko maleją. Wpływ kursora gaśnie.                                                                                                                            | `lepkość 0.82 → 0.30`, `proporcje 1.00:1 → 1.78:1` |
| 0.45–0.70 | **Krzepnięcie**   | Kolor schodzi do koloru strony. Rogi dochodzą do promienia docelowego. Przy P≈0.55 odrywa się **kropla** i osiada przy krawędzi sceny.                                                                                                                               | `lepkość 0.30 → 0.05`, kolor `#7EC58E → #314638`   |
| 0.60–0.92 | **Przeobrażenie** | Wewnątrz materii jest już obraz, zniekształcony jak przez ciecz i zabarwiony na zielono. Od najgęstszego punktu (środka) rozchodzi się **front krzepnięcia** o nieregularnej krawędzi. Za frontem obraz jest ostry i w prawdziwych kolorach, przed nim nadal płynny. | `krzepnięcie 0 → 100%`                             |
| 0.92–1.00 | **Spoczynek**     | Ostatnia klatka canvasa to piksel w piksel obraz DOM, więc zamiana jest niewidoczna. Odczyty gasną.                                                                                                                                                                  | gasną                                              |
| po        | **Odpięcie**      | Nagłówek sceny (etykieta, tytuł, opis, link) wchodzi zwykłym reveal strony, z tym samym komponentem i parametrami co sekcja Projekty. Scroll rusza dalej. Kropla zostaje żywa.                                                                                       | —                                                  |

Czasy etapów stroimy w prototypie. Zakładka przeobrażenia i krzepnięcia
(0.60–0.70) jest celowa: obraz zaczyna prześwitywać, zanim materia skończy
ciemnieć.

## Odczyty

- Kontekst daje cel i liczby, a nie proza. Mówią, **czym** blob się stanie
  i **jak daleko** jest proces.
- Wartości są prawdziwe: to te same liczby, które sterują shaderem.
- Styl: mono, `text-xs`, `tracking-widest`, kolor `muted-foreground`, cel w `primary`.
  Pozycja: przy lewej górnej krawędzi docelowego kadru (plan 3, ~1.2×).
- `aria-hidden`, bo to dekoracja. Treść sceny jest w nagłówku DOM.

## Prawo ruchu w tej scenie

- Scroll w trakcie formowania mąci powierzchnię (falowanie rośnie z prędkością scrolla).
- Zatrzymanie scrolla w połowie: kształt zostaje w pół drogi, a powierzchnia
  się uspokaja. Spoczynek = stałe.

## Kolory

- Start: `--primary-rgb` bloba (jasny motyw `#7EC58E`, ciemny `#135534`).
- Cel: średni kolor zrzutu, liczony z tekstury przy ładowaniu. Dla obecnego zrzutu to ≈ `#314638`.
  Po wymianie zrzutu cel zmienia się sam.

## Kropla

Przy krzepnięciu mała część materii (ok. 4% objętości) odrywa się od kształtu,
zanim ten stwardnieje, i osiada przy prawej krawędzi sceny. Po odpięciu zostaje
żywa (oddech, kursor) i przewija się razem ze sceną. Dalsza droga kropli
(kolejne sceny, kontakt) należy do kroków 2 i 5 roadmapy. Tutaj tylko się odrywa i zostaje.

## Nawigacja i skoki

- Przycisk w hero przewija do końca przypięcia (uformowanej sceny) przez Lenis,
  więc przemiana odtwarza się po drodze.
- Skok (End, kotwica, powrót z innej strony) ustawia stan zgodny z pozycją, bez „doganiania”.

## Telefon

Te same etapy. Przypięcie ok. 1,5 ekranu (propozycja, stroimy na urządzeniu).
Bez kursora, DPR 1, tekstura do 1024 px szerokości, prostszy front krzepnięcia
(mniej oktaw szumu). Odczyty nad kadrem, maksymalnie dwa naraz.

## Reduced motion i brak WebGL

Bez przypięcia i bez canvasa. Scena to zwykła sekcja: nagłówek i obraz,
pokazane bez ruchu. Treść i kolejność są takie same.

## SEO

Cała treść sceny (etykieta, tytuł, opis, link, `alt`) jest w HTML z SSR
niezależnie od animacji. Canvas i odczyty mają `aria-hidden`.

## Wydajność

- Canvas renderuje tylko wtedy, gdy scena jest w kadrze albo żyje kropla (wtedy tylko mały obszar).
- Tekstura ładuje się w bezczynności po hero, a nie w krytycznej ścieżce.
- Bez regresji względem obecnego stanu (Lighthouse, budżet w `lighthouse-budget.json`).

## Do sprawdzenia przy implementacji

- Nagłówek z prototypu 2 miał inny timing niż reszta strony. Trzeba znaleźć
  przyczynę (podejrzenie: ScrollTrigger liczył pozycje przed ustabilizowaniem
  layoutu), a nie tylko ją obejść.

## Gotowe gdy

- Kryteria z SEB-63: 5 widoków (390×844 → 3440×1440), szybki i wolny scroll, obie strony, przerwanie.
- PL i EN, oba motywy, dotyk, klawiatura, reduced motion.
- Właściciel zaakceptował przejście w przeglądarce.
