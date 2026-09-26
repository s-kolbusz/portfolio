# Scroll hero: scenariusz

Data: 2026-09-25
Status: **zaakceptowany** (niewiadome rozstrzygnięte 2026-09-25, patrz „Decyzje”). Kod powstaje według tego dokumentu.
Łączy się z: [przejście sygnaturowe](./2026-09-25-przejscie-sygnaturowe-scenariusz.md).
Kierunek: mieszanka trzech pomysłów, czyli przeostrzenia (C), wchłonięcia imienia (B)
i zanurzenia (A), w tej kolejności.

## Co ma opowiedzieć

Osoba → materia → realizacja. Uwaga przechodzi z imienia na materię,
imię dosłownie staje się materią, kamera w nią wchodzi, a z niej wyłania się
pierwsza realizacja. Jeden ciągły ruch od pierwszej klatki do stronypodhale.pl.

## Budowa

- Hero też się przypina: 1 ekran scrolla (`H` = postęp 0–1). Potem od razu
  zaczyna się przypięcie sceny sygnaturowej (`P`, 2 ekrany). Razem 3 ekrany
  do uformowanej realizacji, na desktopie i na telefonie.
- Wszystko jest funkcją pozycji scrolla, jak w scenie sygnaturowej: szybko,
  wolno, wstecz i po przerwaniu wygląda tak samo.
- Cztery plany głębi z decyzji redesignu: tło (~0.3×), treść (1×),
  pierwszy plan (~1.2–1.4×), blob i kursor (fizyka).

## Klatki

| H         | Etap              | Obraz                                                                                                                                                                                                                                                                                                                                                                                                               |
| --------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0         | **Spoczynek**     | Hero jak dziś: imię, rola, zdanie oferty, CTA, żywy blob, kulka kursora.                                                                                                                                                                                                                                                                                                                                            |
| 0.00–0.30 | **Przeostrzenie** | Ostrość przechodzi z imienia na materię. Imię (pierwszy plan) lekko rośnie (1 → 1.06) i się rozmywa (0 → 8 px). Blob wychodzi do przodu (1 → 1.12) i ma ostrzejszą krawędź. Rola, zdanie i CTA (plan treści) odpływają w górę w tempie scrolla i gasną.                                                                                                                                                             |
| 0.28–0.75 | **Topnienie**     | Imię topnieje jak wosk, jako jeden kształt (w canvasie, podmiana z DOM niewidoczna). Krawędzie liter miękną, z najniższych punktów glifów (brzuszki, stopki, ogonki) ruszają zacieki z cienką szyjką i cięższą główką, najpierw wolno, potem z przyspieszeniem. Nie z każdej litery i nie równo. Na końcu imię osiada, przejmuje zieleń (zacieki pierwsze) i rozpuszcza się w blobie, który rośnie o jego objętość. |
| 0.60–1.00 | **Zanurzenie**    | Blob puchnie, aż wypełni kadr, a kamera wchodzi pod powierzchnię. W chwili przejścia przez taflę tekst roli i oferty najmocniej się załamuje, a potem jest już „pod wodą”: zabarwiony zielenią (mnożenie), miękki i przygaszony. Na końcu cały kadr jest zieloną, lekko falującą taflą.                                                                                                                             |
| → P 0     | **Przekazanie**   | Scena sygnaturowa zaczyna się od kadru wypełnionego materią. Materia cofa się i formuje w 16:9 (zamiast rosnąć z koła). Dalej bez zmian: ciemnienie, tafla, nagłówek, kulka.                                                                                                                                                                                                                                        |

Czasy etapów stroimy w prototypie. Zakładki są celowe: wchłanianie zaczyna się,
zanim imię całkiem straci ostrość, a zanurzenie, zanim ostatnie litery spłyną.

## Zmiany przy implementacji

- **Topnienie zamiast tuszu (2026-09-26).** Tusz z pojedynczych liter szczerbił
  imię i dawał bezkształtne plamy. Filtr SVG tylko rozciągał piksele. Topnienie
  jest więc w shaderze: maska imienia (ten sam font i pozycje co w DOM, więc
  podmiana jest zgodna co do piksela) plus zacieki jako kształty (zwężająca się
  kapsuła z główką), połączone lepkim `smin`. Rola i oferta gasną wcześniej
  (H 0.05–0.3), żeby topnienie miało kadr dla siebie.

- **Tusz zamiast zielonych kulek.** Imię leży na blobie, więc kulki w kolorze
  materii znikały w nim od razu. Krople w kolorze tekstu widać wszędzie, a ich
  rozpuszczanie się w zieleni opowiada wchłonięcie lepiej. W ciemnym motywie
  tusz jest jasny (jak mleko w wodzie).
- **„Pod wodą” zależy od zanurzenia, a nie od promienia bloba.** Tekst leży na
  blobie od początku, więc liczenie z promienia przyciemniało go w spoczynku.
  Teraz to kamera schodzi pod taflę: załamanie jest najsilniejsze w połowie
  zanurzenia, a zabarwienie i zmiękczenie narastają od jego 20% do 80%.

## Kulka kursora

W hero działa jak dziś. W trakcie zanurzenia znika pod powierzchnią razem
z resztą materii i wynurza się dopiero przy krzepnięciu w scenie sygnaturowej
(tak jak teraz się odrywa). Materia jest jedna od początku do końca.

## Prawo ruchu

- Scroll mąci powierzchnię bloba, a później tafli (jak w scenie sygnaturowej).
- Kulki liter płyną z opóźnieniem względem scrolla. Po zatrzymaniu dopływają i
  uspokajają się, ale ich pozycja docelowa zależy tylko od `H`.

## Telefon

Te same etapy i te same długości co na desktopie (hero 1 ekran, scena 2).
Imię na telefonie ma dwie linie, a kolejność wchłaniania wynika z odległości
od bloba, więc działa bez zmian. Rozmycie zastępuje samo wygaszanie, bo
`filter: blur` na telefonie kosztuje.

## Reduced motion i brak WebGL

Bez przypięcia hero i bez wchłaniania. Hero wygląda i przewija się jak dziś.

## SEO i dostępność

- `h1` z imieniem zostaje w DOM przez cały czas (`aria-label` jak dziś).
  Litery tylko wizualnie gasną, a kulki są w canvasie (`aria-hidden`).
- LCP bez zmian: imię jest widoczne od pierwszego renderu, a ruch zaczyna się
  dopiero od scrolla.

## Wydajność

- Kulki liter to tablica w shaderze (maks. 24), bez dodatkowego canvasa.
- Załamanie tekstu (filtr SVG) działa tylko wtedy, gdy krawędź bloba przechodzi po tekście.
- Rozmycie imienia tylko na desktopie.

## Decyzje (2026-09-25)

1. **Tło (plan 1):** nie w hero. Rozmyte kadry wchodzą w kroku 2 roadmapy
   (prawo ruchu i plany parallaxy) dla całej strony, a nie jako wyjątek w hero.
2. **Długość:** hero 1 ekran i scena sygnaturowa 2 ekrany (zamiast 2,5), razem 3.
   Część pracy sceny (materia wypełnia kadr) przejmuje zanurzenie.
3. **Przekazanie:** scena sygnaturowa startuje z pełnego kadru materii, która cofa się
   do 16:9. Odczyt proporcji zaczyna od proporcji ekranu.
4. **CTA hero:** przewija przez całą sekwencję (ok. 4 s) i kończy na uformowanej realizacji.
5. **Kolejność liter:** najbliższe blobowi pierwsze. Fala wchłaniania rozchodzi się od bloba.
6. **Telefon:** te same długości co desktop.

## Gotowe gdy

- 5 widoków (390×844 → 3440×1440), szybki i wolny scroll, obie strony, przerwanie.
- PL i EN (różna długość imienia nie gra roli, ale rola i zdanie oferty tak), oba motywy.
- Dotyk, klawiatura, reduced motion.
- Właściciel zaakceptował w przeglądarce.
