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

| P         | Etap            | Obraz                                                                                                                                                                                                       | Odczyty (mono, pierwszy plan)                    |
| --------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| przed     | **Hero**        | Scroll hero według [osobnego scenariusza](./2026-09-25-scroll-hero-scenariusz.md). Kończy się kadrem wypełnionym zielenią.                                                                                  | —                                                |
| 0.00–0.05 | **Wejście**     | Scena się przypina. Cały kadr to płynna zieleń, kursor nadal działa.                                                                                                                                        | Pojawia się cel: `01 — stronypodhale.pl`         |
| 0.02–0.40 | **Ciemnienie**  | Cały ekran ciemnieje do koloru strony. Powierzchnia faluje: długie, wolne fale z połyskiem. Tekst sceny jaśnieje razem z tłem.                                                                              | `lepkość 0.82 → 0.30`, kolor `#7EC58E → #314638` |
| 0.10–0.35 | **Kulka**       | Kulka kursora (ten sam rozmiar i to samo łączenie co w hero) odrywa się od tafli i zostaje zieloną kroplą na ciemnym tle. Bez kursora spływa na miejsce przy obrazie.                                       | —                                                |
| 0.30–0.58 | **Wyłanianie**  | Spod mętnej tafli wyłaniają się szczegóły strony, na swoim miejscu 16:9: najpierw rozmyte, bez krawędzi, mocno załamane i zabarwione, potem coraz wyraźniej. Fale idą przez cały ekran, także poza obrazem. | `lepkość 0.30 → 0.05`                            |
| 0.50–0.78 | **Uspokojenie** | Tafla się uspokaja i robi przejrzysta: fale słabną, załamanie maleje, zmętnienie znika, krawędź obrazu się wyostrza. Wszędzie jednocześnie, bez frontu. Scroll znów ją mąci.                                | `przejrzystość 0 → 100%`                         |
| 0.78–0.80 | **Spoczynek**   | Obraz jest jak szkło, a ostatnia klatka canvasa to piksel w piksel obraz DOM, więc zamiana jest niewidoczna. Tło zostaje ciemną, spokojną taflą.                                                            | gasną                                            |
| 0.80–0.97 | **Nagłówek**    | W miejsce odczytów wjeżdża nagłówek i link: ruch revealu z reszty strony, ale przewijany scrollem, nie odpalany na czas. Scena nadal stoi, więc całość czyta się jako jeden kadr.                           | —                                                |
| po        | **Odpięcie**    | Kadr razem z ciemną taflą odjeżdża do góry. Uspokojona tafla kończy się prosto na dole sekcji. Zielona kulka zostaje żywa i idzie za kursorem dalej: dusza strony nie znika razem z tłem.                   | —                                                |

Rytm jak w hero: każdy etap ok. pół ekranu (0.25 P), ta sama krzywa, wszystko scroll-bound. Zakładki są celowe: kropla odrywa się,
gdy materia ciemnieje, a szczegóły zaczynają prześwitywać, zanim skończy.

## Po scenie: nawiązanie do bloba

Blob to istota strony, więc nawet gdy tło odjedzie, coś z niego zostaje:

- ~~**Płynna krawędź**~~ (odrzucona w wersji 7: przycięta przez kolejną sekcję
  wyglądała źle). Uspokojona tafla kończy się prosto, dokładnie na dole sekcji,
  i odjeżdża jak jej tło.
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

## Tafla

Organiczna, nie „z kafli”: trzy oktawy szumu, każda obrócona i dryfująca
w inną stronę, na wolno wykrzywianej domenie (domain warping), a wysokość fal
zmienia się po tafli (spokojne i niespokojne płaty). Połysk szeroki i miękki,
bez ostrych linii kaustyk.

## Prawo ruchu w tej scenie

- Scroll mąci powierzchnię (falowanie rośnie z prędkością scrolla), także po odpięciu.
- Zatrzymanie scrolla w połowie: stan zostaje w pół drogi, a powierzchnia
  się uspokaja. Spoczynek = stałe.
- Kamera z bezwładnością, jak w hero: przebieg podąża za scrollem z tłumieniem.

## Kolory

- Start: `--primary-rgb` bloba (jasny motyw `#7EC58E`, ciemny `#135534`).
- Cel: kolor tła strony, czyli mediana pikseli z lewej, prawej i dolnej krawędzi zrzutu (wersja 5). Średnia całego obrazu (≈ `#314638`) była za jasna i nie pasowała do stronypodhale.
- Tafla ma jeden płaski kolor (bez cieniowania głębi), więc styka się z obrazem bez szwu.
  Po wymianie zrzutu cel zmienia się sam.

## Kropla (kulka kursora)

**Wersja 7 (po ocenie wersji 6):** na tafli pływa **dokładnie ten sam** mniejszy
blob co w hero: ten sam wzór w shaderze (koło, pole szumu, falowanie krawędzi,
miękka krawędź, cieniowanie) i to samo śledzenie myszy (0,27 s). Bez
zniekształceń od fal i bez „przenikania” zieleni.

- Bez osobnej symulacji fal (wersja 6 dokładała nową warstwę abstrakcji).
  Blob zaburza **istniejące falowanie tafli** w stanie przejściowym: fale
  rozstępują się wokół niego i są ciągnięte za nim, gdy się porusza. Gdy tafla
  się uspokoi, nie ma czego zaburzać, więc efekt znika razem z falowaniem.

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

## Wersja 8 (po teście na telefonie)

- **Zrzut strony na środku:** dopóki jest jedynym elementem w kadrze, stoi
  wyśrodkowany w pionie (odczyty jadą tuż nad nim). Na swoje miejsce w układzie
  przesuwa się razem z wejściem nagłówka, sterowany scrollem.
- **Czytelność:** pod jasnym tekstem sceny (nagłówek, odczyty, link) blob
  „zanurza się”, czyli blednie do koloru tafli w obrysie tekstu (miękko).
- **Bezwładność:** Lenis prowadzi też przewijanie dotykiem (`syncTouch`), więc
  rzut palcem ma tę samą wagę co kółko, a w przypiętych scenach (hero i ta
  scena) scroll jest cięższy (×0,6), żeby łatwo nie przelecieć dalej.
- **Kolor przeglądarki:** gdy tafla wypełnia ekran, `theme-color` i tło strony
  (widoczne w paskach wokół niej na telefonie) przyjmują kolor tafli.

## Kursor i docki nad taflą

Stały interfejs (docki, kursor) przyjmuje paletę tego, co jest pod nim: nad
ciemną taflą przechodzi na tokeny ciemnego motywu, więc ikony i kursor są
czytelne. Kursor ma kolor tekstu (ciemny na jasnym, jasny na ciemnym) i nie
używa już `mix-blend-difference`, który na zieleni dawał przypadkowe kolory.

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
