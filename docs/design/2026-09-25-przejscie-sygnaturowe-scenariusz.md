# Przejście sygnaturowe: scenariusz

Data: 2026-09-25
Zadanie: [SEB-63](https://linear.app/sklbsz/issue/SEB-63)
Status: **wersja 5 w prototypie**: blob się nie kurczy do ramki, tylko cały ekran ciemnieje w taflę, z której wyłania się projekt (grill 2026-09-26).
Wcześniej: przeglądy wersji 3 i 4 (nagłówek w kadrze, kropla jako kulka kursora z hero, tafla zamiast frontu krzepnięcia).
Źródło osi: [decyzje redesignu](./2026-09-24-redesign-decyzje.md) (Fluid → Solid, prawo ruchu, 4 plany).

## Co ma opowiedzieć

Płynna materia z hero staje się tłem, na którym klaruje się konkretna
realizacja. Blob się nie kurczy i nie wpada w ramkę: zieleń wypełniająca kadr
ciemnieje do koloru stronypodhale.pl, a **cały ekran** (nie tylko obszar
projektu) staje się falującą taflą wody, z której wyłaniają się szczegóły.
Tafla się uspokaja i klaruje, aż projekt stoi ostro. To lepiej opowiada
historię: materia nie znika, tylko niesie projekt.

Dlaczego kolor ma znaczenie: tło stronypodhale.pl to ciemna zieleń. Blob
ciemnieje dokładnie do koloru tej strony, więc zmiana koloru jest częścią
przemiany, a nie ozdobnikiem.

## Czego unikamy (wnioski z prototypów 1 i 2)

- Długie mutowanie bloba bez kontekstu.
- Kształt, który przechodzi przez ostre rogi i znów się zaokrągla.
- Pusta ramka, w którą blob „próbuje się wpasować”.
- Crossfade zrzutu nad zielonym prostokątem, czyli podmiana zamiast przemiany.
- Elementy sceny, które nie używają komponentów i animacji reszty strony.
- Nagłówek pod przypiętą sceną, przez co strona przesuwa się, zamiast pokazać całość w jednym kadrze.
- Kropla ze skryptem (odrywanie po sznurku, sprężyna, sztuczne wydłużanie). Wystarczy kulka kursora z hero.
- „Front krzepnięcia”, który wygląda jak rozchodzące się zdejmowanie filtra, a nie jak proces w naturze.
- Kurczenia bloba do ramki (wersje 1–4): materia, która wypełniła kadr, nie cofa się.

## Budowa sceny

- Hero, a zaraz pod nim **scena przypięta**: sekcja o wysokości `100vh + 200vh`
  z wewnętrzną warstwą `position: sticky` o wysokości 100vh. Przez 2 ekrany
  (było 2,5; skrócone, bo część pracy przejmuje [zanurzenie w hero](./2026-09-25-scroll-hero-scenariusz.md))
  scroll steruje przemianą, a strona stoi.
- Wszystko jest funkcją pozycji scrolla (`P` = postęp przypięcia 0–1), więc
  działa tak samo przy szybkim i wolnym scrollu, wstecz i po przerwaniu.
- Blob renderuje się na stałym canvasie za treścią. Zrzut strony trafia do
  shadera jako tekstura (ten sam plik co obraz w DOM).
- **Jeden kadr:** w przypiętej warstwie są nagłówek (etykieta, tytuł, opis),
  obraz i link. Miejsce nagłówka jest zarezerwowane od początku: najpierw
  zajmują je odczyty, a na końcu wjeżdża w nie nagłówek.

## Klatki

| P         | Etap            | Obraz                                                                                                                                                                                                                         | Odczyty (mono, pierwszy plan)                    |
| --------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| przed     | **Hero**        | Scroll hero według [osobnego scenariusza](./2026-09-25-scroll-hero-scenariusz.md). Kończy się kadrem wypełnionym zielenią.                                                                                                    | —                                                |
| 0.00–0.06 | **Wejście**     | Scena się przypina. Cały kadr to płynna zieleń, kursor nadal działa.                                                                                                                                                          | Pojawia się cel: `01 — stronypodhale.pl`         |
| 0.04–0.40 | **Ciemnienie**  | Cały ekran ciemnieje do koloru strony. Powierzchnia faluje: długie, wolne fale z połyskiem. Tekst sceny przechodzi na jasny.                                                                                                  | `lepkość 0.82 → 0.30`, kolor `#7EC58E → #314638` |
| 0.10–0.35 | **Kulka**       | Kulka kursora (ten sam rozmiar i to samo łączenie co w hero) odrywa się od tafli i zostaje zieloną kroplą na ciemnym tle. Bez kursora spływa na miejsce przy obrazie.                                                         | —                                                |
| 0.30–0.60 | **Wyłanianie**  | Spod mętnej tafli wyłaniają się szczegóły strony, na swoim miejscu 16:9: najpierw rozmyte, bez krawędzi, mocno załamane i zabarwione, potem coraz wyraźniej. Fale idą przez cały ekran, także poza obrazem.                   | `lepkość 0.30 → 0.05`                            |
| 0.45–0.82 | **Uspokojenie** | Tafla się uspokaja i robi przejrzysta: fale słabną, załamanie maleje, zmętnienie znika, krawędź obrazu się wyostrza. Wszędzie jednocześnie, bez frontu. Scroll znów ją mąci.                                                  | `przejrzystość 0 → 100%`                         |
| 0.83–0.85 | **Spoczynek**   | Obraz jest jak szkło, a ostatnia klatka canvasa to piksel w piksel obraz DOM, więc zamiana jest niewidoczna. Tło zostaje ciemną, spokojną taflą.                                                                              | gasną                                            |
| 0.88–1.00 | **Nagłówek**    | W miejsce odczytów wjeżdża nagłówek i link, tym samym ruchem co reveal w reszcie strony. Scena nadal stoi, więc całość czyta się jako jeden kadr.                                                                             | —                                                |
| po        | **Odpięcie**    | Kadr razem z ciemną taflą odjeżdża do góry. Dolna krawędź tafli jest płynna (miękka, falująca, jak brzeg bloba), a scroll ją mąci. Zielona kulka zostaje żywa i idzie za kursorem dalej: dusza strony nie znika razem z tłem. | —                                                |

Czasy etapów stroimy w prototypie. Zakładki są celowe: kropla odrywa się,
gdy materia ciemnieje, a szczegóły zaczynają prześwitywać, zanim skończy.

## Po scenie: nawiązanie do bloba

Blob to istota strony, więc nawet gdy tło odjedzie, coś z niego zostaje:

- **Płynna krawędź:** ciemna tafla odjeżdża z miękką, falującą dolną krawędzią
  (ten sam brzeg co blob), a nie prostą linią sekcji.
- **Kulka:** zielona kropla zostaje nad resztą strony i idzie za kursorem.

### Alternatywa (opcja 2, na później)

Materia zostaje tłem całej sekcji „Praca”, a każdy kolejny projekt klaruje się
z niej tak samo jak stronypodhale.pl (tafla ciemnieje do koloru danego projektu).
Do rozważenia przy [SEB-67](https://linear.app/sklbsz/issue/SEB-67).

## Odczyty

- Kontekst daje cel i liczby, a nie proza. Mówią, **czym** blob się stanie
  i **jak daleko** jest proces.
- Wartości są prawdziwe: to te same liczby, które sterują shaderem.
- Styl: mono, `text-xs`, `tracking-widest`, kolor `muted-foreground`, cel w `primary`.
  Na ciemniejącej tafli cała scena przechodzi na paletę ciemnego motywu.
  Pozycja: w miejscu nagłówka, cel po lewej, wartości po prawej (plan 3, ~1.2×).
  Wartości ustawione w kolejności gaśnięcia, więc znikająca nie przesuwa pozostałych.
- `aria-hidden`, bo to dekoracja. Treść sceny jest w nagłówku DOM.

## Prawo ruchu w tej scenie

- Scroll mąci powierzchnię (falowanie rośnie z prędkością scrolla), także po odpięciu.
- Zatrzymanie scrolla w połowie: stan zostaje w pół drogi, a powierzchnia
  się uspokaja. Spoczynek = stałe.
- Kamera z bezwładnością, jak w hero: przebieg podąża za scrollem z tłumieniem.

## Kolory

- Start: `--primary-rgb` bloba (jasny motyw `#7EC58E`, ciemny `#135534`).
- Cel: średni kolor zrzutu, liczony z tekstury przy ładowaniu. Dla obecnego zrzutu to ≈ `#314638`.
  Po wymianie zrzutu cel zmienia się sam.

## Kropla (kulka kursora)

Kroplą jest kulka, która w hero idzie za kursorem i zlewa się z blobem. To ta
część materii, która zostaje płynna. Nie ma osobnej animacji: ten sam kształt,
rozmiar (0,25 jednostki bloba) i to samo lepkie łączenie (`smin` 0,6), co w hero.

- W trakcie ciemnienia (P 0.10–0.35) szerokość łączenia z plamą spada do zera,
  więc kulka odrywa się tak samo, jak w hero, gdy kursor odjeżdża od bloba.
- Z kursorem (`pointer: fine`) kulka dalej idzie za nim, z tą samą płynnością co w hero.
- Bez kursora (dotyk) spływa na swoje miejsce: obok obrazu, gdy jest miejsce,
  inaczej pod jego prawym rogiem albo oparta o ten róg (za obrazem).
- Nie krzepnie: zachowuje zieleń bloba i ruchomą powierzchnię.
- Porusza się względem obrazu, więc po odpięciu przewija się razem z kadrem.
  Canvas śpi, gdy kadr zniknie z ekranu.

Dalsza droga kulki (kolejne sceny, kontakt) należy do kroków 2 i 5 roadmapy.

## Nawigacja i skoki

- Przycisk w hero przewija do końca przypięcia (uformowanej sceny) przez Lenis,
  więc przemiana odtwarza się po drodze.
- Skok (End, kotwica, powrót z innej strony) ustawia stan zgodny z pozycją, bez „doganiania”.

## Telefon

Te same etapy i ta sama długość przypięcia co na desktopie (2 ekrany).
Bez kursora, DPR 1, spokojniejsza powierzchnia. Odczyty w miejscu nagłówka,
maksymalnie dwa naraz (cel i najnowszy odczyt).

## Reduced motion i brak WebGL

Bez przypięcia i bez canvasa. Scena to zwykła sekcja: nagłówek i obraz,
pokazane bez ruchu. Treść i kolejność są takie same.

## SEO

Cała treść sceny (etykieta, tytuł, opis, link, `alt`) jest w HTML z SSR
niezależnie od animacji. Canvas i odczyty mają `aria-hidden`.

## Wydajność

- Canvas renderuje tylko wtedy, gdy tafla jest w kadrze albo żyje kropla (wtedy tylko mały obszar).
- Tekstura ładuje się w bezczynności po hero, a nie w krytycznej ścieżce.
- Bez regresji względem obecnego stanu (Lighthouse, budżet w `lighthouse-budget.json`).

## Do sprawdzenia przy implementacji

- ~~Nagłówek z prototypu 2 miał inny timing niż reszta strony.~~ Zmierzone:
  mechanizm był identyczny jak w Projektach (reveal przy ~700 z 900 px).
  Problemem było miejsce: reveal odpalał się, gdy hero było jeszcze na ekranie.
  Teraz nagłówek wchodzi w kadrze sceny, na etapie ustalonym w tabeli.

## Gotowe gdy

- Kryteria z SEB-63: 5 widoków (390×844 → 3440×1440), szybki i wolny scroll, obie strony, przerwanie.
- PL i EN, oba motywy, dotyk, klawiatura, reduced motion.
- Właściciel zaakceptował przejście w przeglądarce.
