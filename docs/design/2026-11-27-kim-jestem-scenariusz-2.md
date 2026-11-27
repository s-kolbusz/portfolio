# „Kim jestem” — scenariusz 2: jak się uczę (do akceptacji, 27.11)

Pierwsza zbudowana wersja była płaska i nie miała historii. Ta wersja ma jedną myśl, której
służy każda część strony.

## Myśl przewodnia

**Każda rzecz zaczyna się u mnie od pytania. Potem wchodzę w nią głęboko i decyduję, co z nią
dalej.**

Strona główna pokazuje, co robię i jak rozkładam problemy. Ta strona pokazuje, jak się uczę,
kiedy nikt mi za to nie płaci. Tytuł „Nie wierzę na słowo” wynika z tego wprost: sprawdzam sam.

Każda droga ma te same trzy kroki, ale każda pokazuje je inaczej, ze swojego materiału:

1. **Pytanie.** Duże, w Mattone. To od niego zaczyna się czytanie każdej drogi.
2. **Droga.** Krótki tekst i prawdziwy dowód: zdjęcie, zrzut, kalkulator, odczyt.
3. **Decyzja.** Jedno zwykłe zdanie na końcu. Bez plakatowych haseł stanu i bez kropli jako
   kropki.

Cztery drogi to cztery różne zakończenia tej samej drogi:

| Droga | Pytanie (zaślepka, tekst napisze Codex) | Decyzja |
|---|---|---|
| Dom | Czemu do jednego domu mam pięć aplikacji? | Zostało. Używam tego codziennie. |
| Drukarka | Czy w domu da się zrobić coś więcej niż program? | Nauczyłem się, czego chciałem, i odłożyłem. |
| Auta | Co właściwie znaczy ta kontrolka? | Jeszcze nie wiem, dokąd to prowadzi. |
| Praca | A gdyby ktoś za to zapłacił? | To samo podejście, tylko z klientem. |

## Kolejne ekrany

### 0. Pierwszy ekran

- **Tytuł:** „Nie wierzę na słowo.”
- **Krótka linia pod tytułem:** „Każda rzecz zaczyna się u mnie od pytania.”
- **Fakty na dole:** bez zmian.
- **Kropla:** ta sama ciecz co w hero, reaguje na kursor. Jest **tylko tutaj** i nigdzie dalej na
  tej stronie. Jeśli wolisz stronę bez cieczy, wykreśl ten punkt, a na jej miejsce wejdzie
  zdjęcie z jednej z dróg.

### 1. Dom: z pięciu aplikacji jeden ekran

- **Pytanie:** wchodzi słowo po słowie, jak tytuł.
- **Droga:** pięć ikonek aplikacji różnych producentów przy przewijaniu zsuwa się w jeden
  prawdziwy zrzut Twojego ekranu z danymi o energii. Obok zdjęcie płotu z paneli. Tekst mówi
  krótko: panele, Home Assistant, dwa falowniki, pompa ciepła przez Shelly, własne ekrany.
- **Decyzja:** „Zostało. Używam tego codziennie.”

### 2. Drukarka: zrobić rzecz, nie tylko program

- **Pytanie.**
- **Droga:** zdjęcie przebudowanej drukarki. Wymienione części (płyta, procesor, silniki,
  osie, dysza, extruder) układają się jedna na drugiej jak warstwy wydruku, od dołu do góry.
  Pod nimi kalkulator jako jedno zdanie z podkreślonymi wartościami, który już przyjąłeś.
- **Decyzja:** „Nauczyłem się, czego chciałem, i odłożyłem. Drukuję, gdy ktoś poprosi.”

### 3. Auta: odpowiedzi jeszcze nie ma

- **Pytanie.**
- **Droga:** odczyt w stylu VCDS (kod błędu, opis, wartości) przewija się jak na ekranie
  diagnostyki, w kroju mono. Tekst: kabel, VCDS, auta w rodzinie, oleje, filtry, małe naprawy.
- **Decyzja:** zdanie urywa się na migającym kursorze: „Jeszcze nie wiem, dokąd to prowadzi”.
  Ta droga jako jedyna nie ma końca, bo naprawdę go nie ma.

### 4. Praca: to samo, tylko z klientem

- **Pytanie:** „A gdyby ktoś za to zapłacił?”
- **Droga:** aspect-preview, ready2order i Airchos. Przy każdym jedno zdanie: jakie było
  pytanie i co z niego wyszło. Bez dopisku „działa” przy nazwie. Stan opisuje zdanie, na
  przykład „plugin open source, dostępny w npm” albo „Airchos: powstaje”.
- **Wejście do stron:** nazwa projektu prowadzi do jego strony (ready2order i aspect-preview
  dostaną własne podstrony).
- **Decyzja / przejście do kontaktu:** „Tak samo zacznę od Twojego projektu: od pytań.”

### 5. Koniec (rama)

Kontakt i „drzwi” do „Jak pracuję z agentami” bez zmian.

## Ruch: zasady

- **Jeden rytm na całej stronie:** pytanie wchodzi pierwsze, droga po nim, decyzja na końcu.
  Na tym rytmie każda droga ma swój własny ruch: zsuwanie aplikacji, warstwy, przewijany odczyt,
  wejścia projektów.
- **Płynność:** ruch jest w samym CSS, przypięty do przewijania. Żadnego skryptu liczącego coś
  w każdej klatce poza kroplą na pierwszym ekranie. Ma nie przycinać na Macu ani na
  iPhonie 11 Pro.
- **Ograniczony ruch:** wszystko stoi na miejscu, treść widoczna od razu.

## Układ: zasady

- **Jedna szerokość treści.** Najwyżej około 1440 px, wyśrodkowana. Na ultrawide 1440p
  nic się nie rozciąga, a krój nie maleje względem ekranu.
- **Przestrzeń z powodu.** Pusta przestrzeń jest tylko między drogami, nie wewnątrz nich.
- **Bez uciętych tekstów.** Każdy nagłówek mieści się w swojej kolumnie przy 390, 1600
  i 3440 px. Sprawdzam to, zanim pokażę.

## Czego potrzebuję od Ciebie przy budowie (nie teraz)

- zdjęcie płotu z paneli i zrzut Twojego ekranu z danymi o energii,
- zdjęcie przebudowanej drukarki,
- jeden prawdziwy kod błędu z VCDS i auto, którego dotyczył (albo zgoda na przykładowy).

Do tego czasu na tych miejscach są opisane zaślepki.
