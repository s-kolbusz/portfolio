# „Kim jestem” — scenariusz ruchu (do akceptacji, 27.11)

Punkt wyjścia: zbudowana strona pod /v2/pl/about. Uwaga właściciela: kropla jest zdjęciem,
wszystkie wejścia są takie same i powtarzają się przez całą stronę.

Zasada: **każda droga rusza się tak, jak działa jej rzecz.** Żadne dwa wejścia nie mają tego samego
ruchu. Wspólne zostają tylko pierwszy ekran i koniec (rama).

## 0. Jedna kropla przez całą stronę

Na stronie jest jedna żywa kropla z hero, ta sama ciecz i ta sama fizyka (silnik z ready2order).
Nie ma osobnych kropel, ani zdjęć kropli.

- Na pierwszym ekranie leży po prawej, duża, i reaguje na kursor jak w hero.
- Przy przewijaniu nie znika. Zsuwa się w dół razem z czytaniem i maleje.
- Na końcu każdej drogi **spada na swoje miejsce jako kropka** po słowie stanu i się rozpłaszcza.
  Bez odbicia (dopisek d30).
- Przy następnej drodze odrywa się od tej kropki i płynie dalej. Kropka po poprzednim słowie
  zostaje jako mały ślad tej samej cieczy, więc słowa stanu nie tracą kropek.

Stan cieczy zmienia się przy każdej drodze. To jest jedyne miejsce, gdzie ciecz coś znaczy:

| Droga | Słowo | Kropla |
|---|---|---|
| Dom | Działa | lśniąca, pełne załamanie, jak w hero |
| Drukarka | Zrozumiane i odłożone | matowieje i gęstnieje, prawie bez błysku |
| Auta | (bez słowa) | kropla przepływa obok i się nie zatrzymuje |
| Praca | W realizacji | dalej płynie i mutuje, nigdy nie siada do końca |

## 1. Pierwszy ekran (rama)

Tytuł wychodzi spod linii słowo po słowie, jak na głównej. Kropla nie „rośnie” jak dziś, tylko
**spada od patrzącego** i rozlewa się w swój kształt (tak jak w hero). Fakty na dole pojawiają się
dopiero, gdy kropla osiądzie.

## 2. Dom — „sprzęt, potem program”

Teraz: zdania podjeżdżają, zdjęcia stoją.

Nowy ruch: **dwie rzeczy łączą się w jedną.**
- Zdanie wchodzi w dwóch tempach: część o „fizycznie” wchodzi pierwsza, część o „programowo”
  dojeżdża i domyka zdanie.
- Zdjęcie płotu i zrzut ekranu z danymi przewijają się z różną prędkością i pod koniec drogi
  zachodzą na siebie, aż jeden róg nakrywa drugi. Sprzęt i program w jednym projekcie.
- Przy nazwach w tekście (Home Assistant, falowniki, pompa ciepła) zielone podkreślenie
  dorysowuje się w momencie czytania, jedno po drugim, jak podłączane urządzenia.
- Kropla spada po „Działa”.

## 3. Drukarka — „warstwa po warstwie”

Nowy ruch: **druk.**
- Zdanie „W domu mogę sam zrobić…” wyłania się od dołu w poziomych paskach, jak wydruk
  warstwa po warstwie (krótkie, ostre kroki, nie płynne przesunięcie).
- Zdjęcie drukarki odsłania się tak samo, od dołu do góry.
- Zdanie z wyceną: po zmianie wartości cena **drukuje się na nowo** (pasek po pasku), zamiast
  po prostu się podmienić.
- „Zrozumiane i odłożone” wchodzi spokojnie i szaro. Kropla spada matowa i gęsta.

## 4. Auta — „odczyt”

Nowy ruch: **diagnostyka.**
- Konturowy napis „Auta: tu definicji jeszcze nie mam” przebiega cienka zielona linia odczytu,
  od lewej do prawej, raz. Kontur się nie wypełnia, bo definicji nie ma.
- Tekst o VCDS pojawia się wiersz po wierszu, jak odczyt z kabla.
- Kropla przepływa obok i nie siada. Brak kropki to tu znaczenie, nie pomyłka.

## 5. Praca — „te same zdania mają własne strony”

Nowy ruch: **nazwy jako wejścia.**
- aspect-preview i ready2order wchodzą jak tytuły drzwi z końca strony (ta sama rodzina ruchu),
  bo to są drzwi do ich stron.
- Po najechaniu kursorem kropla przy nazwie lekko się wyciąga w stronę kursora.
- Airchos jest większy i zostaje otwarty: pod nim „W realizacji” w pochyleniu, a kropla płynie
  i mutuje bez końca. To jedyne miejsce, gdzie ruch nie ustaje.

## 6. Koniec (rama)

Kontakt bez zmian, jak na głównej. „Drzwi” zostają, jak są. Gdy pociągniesz pas, kropla z Airchos
spływa do pasa i to ona go rozciąga.

## Telefon

- Jedna kropla, niższa rozdzielczość (tak jak hero na dotyku), zwalniana, gdy jest daleko od widoku.
- Zdjęcia nie zachodzą na siebie (za wąsko), tylko odsłaniają się jedno po drugim.
- Druk warstwami i linia odczytu zostają, bo są tanie (CSS).

## Ograniczony ruch

Wszystko stoi na miejscu: tekst widoczny, kropki po słowach jako nieruchome krople, bez płynięcia.

## Ryzyko do rozstrzygnięcia przed kodem

- Silnik cieczy (drops-stage.ts) ma teraz niezacommitowane zmiany z innej sesji, więc nie wolno go
  ruszać. Matowa i gęsta kropla to nowe ustawienie powierzchni w tym pliku. Albo czekamy na tamtą
  pracę, albo matowienie robimy nakładką na gotowy obraz cieczy.
- Jedna kropla, która podróżuje przez całą stronę, to najdroższy element. Jeśli na iPhonie 11 Pro
  przytnie, wraca rozwiązanie z osobnymi małymi kroplami, które żyją tylko na swoim ekranie.
