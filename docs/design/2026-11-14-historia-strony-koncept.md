# kolbusz.xyz: jaką historię opowiada strona

Data: 2026-11-14 · Status: **kierunek przyjęty przez właściciela w rozmowie; szczegóły oznaczone jako
„propozycja” czekają na decyzję.** Zastępuje wcześniejsze wersje tego pliku z tego samego dnia.

Powiązane: `2026-09-24-redesign-decyzje.md` (decyzje z września; tam, gdzie się różnią, **ten dokument jest
nowszy**), `2026-11-14-lusion-przepis.md` (zasady ruchu i ciągłości), `2026-11-14-otwarcie-diagnoza-telefon.md`
(diagnoza otwarcia i plan A, B, C).

## 0. Jak czytać ten dokument

**Co jest zdecydowane, a co nie**

- **Przyjęte przez właściciela:** cel (1), zasady (2), trzy warstwy, hub i zniknięcie katalogu-książki (3),
  część osobista poza stroną główną, definicje i drogi (5), stan „zrozumiane i odłożone” (6), podstrony
  notatki „dlaczego” i „Jak pracuję z agentami” (7), druk 3D w obu rolach, chęć posiadania easter eggów.
- **Propozycje, które ogólnie się spodobały, ale nie mają decyzji w szczegółach:** akty strony głównej (4),
  linie „Jak pracuję” (7), ślady części osobistej na stronie głównej (3), narzędzia narracji (8),
  kandydaci na easter eggi (9), szablon drogi (5).
- **Rozstrzygnięte 14.11 (odpowiedzi właściciela, szczegóły w `otwarcie-diagnoza-telefon.md`, sekcja 5):**
  pionowy zrzut stronypodhale na telefonie jest w porządku; wynurzanie go na cały ekran **nie** (portfolio
  nie ma być zastąpione widokiem cudzej strony; projekt ma być pokazany kreatywnie, a pojawianie ma mieć
  nieregularne, falujące, zniekształcone krawędzie, jak u Lusion). Plan B: warunkowo, ocena później na
  telefonie właściciela. **Główny problem otwarcia to hero, a nie przejście ani urządzenie:** moment
  załadowania, sposób pojawiania się elementów, ich wygląd i układ (imię, blob, trochę tekstu) są nudne.
  Przejście do stronypodhale jest „na tyle ciekawe, na ile może być przy tak nudnym hero”.
- **Nic z tego dokumentu nie jest zgodą na pisanie kodu.** Plan A w kształcie z diagnozy (pełny ekran)
  nie został przyjęty; plan C bez decyzji. Do czasu, aż właściciel zaktualizuje zadania w Linear (SEB-63…73), obowiązują one w swoim
  wrześniowym brzmieniu, a ten dokument mówi, w którą stronę zostaną zmienione.

**Który dokument wygrywa:** ten koncept wygrywa z dokumentem z 24.09 tylko w punktach z sekcji 11. Reszta
wrześniowych decyzji (tożsamość, podział marek, ceny, kontakt, SEO/GEO, dock) stoi bez zmian.
`lusion-przepis` i `otwarcie-diagnoza-telefon` są materiałem pomocniczym; przy kolizji wygrywa koncept.

**Co jest zbudowane i gdzie** (Next.js 16, React 19, GSAP, Lenis, własny shader WebGL; strona zostaje
w Next.js, a Astro i Payload w sekcji 7 to przykłady decyzji z innych projektów właściciela):

- hero: `src/components/sections/hero.tsx`
- scena sygnaturowa (akt 2): `src/components/sections/signature-scene.tsx`
- materia: `src/components/canvas/viscous-puddle.tsx` i katalog `viscous-puddle/`
- kalkulator druku 3D: `src/components/sections/print-calculator.tsx` (dziś na stronie głównej;
  docelowo w Labie, zgodnie z dokumentem z 24.09)

**Słownik**

| Termin                | Znaczenie                                                                                                                                |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Materia, blob         | Zielona, płaska, płynna plama rysowana shaderem (metaballe). Główny motyw strony.                                                        |
| Kulka                 | Mała kropla tej samej materii, która idzie za kursorem albo palcem.                                                                      |
| Tafla                 | Materia rozlana na cały ekran w akcie 2, z której wynurza się zrzut strony.                                                              |
| Prawo ruchu           | Ruch = płynne, spoczynek = stałe.                                                                                                        |
| Plan A, B, C          | Trzy propozycje podniesienia otwarcia z `otwarcie-diagnoza-telefon.md`: pełny ekran na telefonie, tempo na dotyku, kulka prowadzi dalej. |
| Sprężyna jak u Lusion | Pasek „następna strona” wypełnia się tylko przy dalszym przewijaniu i cofa się, gdy przestaniesz.                                        |
| Część osobista        | To samo co warstwa „Człowiek”. „Kim jestem” to jej strona wejściowa.                                                                     |
| Lab                   | Osobna strona z eksperymentami: interaktywny blob i druk 3D (opis w dokumencie z 24.09).                                                 |
| stronypodhale         | Własne studio właściciela dla lokalnych firm, osobna marka i strona stronypodhale.pl.                                                    |
| ready2order           | Austriacka firma (system kasowy SaaS), w której właściciel pracował 2019–2025.                                                           |
| Plugin aspect-preview | Wtyczka open source do Payload CMS, kadrowanie zdjęć z podglądem proporcji.                                                              |
| Zakofy                | Strona turystyczna właściciela, dla której powstał plugin.                                                                               |
| Piczura               | Strona dla klienta, w realizacji.                                                                                                        |
| Airchos               | Własne narzędzie właściciela: bramki jakości dla agentów AI, w realizacji.                                                               |
| Kontor                | Niepubliczny projekt właściciela; pomijamy.                                                                                              |
| VCDS                  | Program do diagnostyki aut grupy VW.                                                                                                     |

## 1. Cel

Strona ma być **cyfrową odpowiedzią na pytanie „kim jestem”**: odciskiem człowieka w wirtualnym świecie,
w którym jest coraz mniej człowieczeństwa (słowa właściciela).

Po zamknięciu strony odwiedzający ma mieć mieszankę trzech odczuć:

1. jest pod wrażeniem sztuki i jakości,
2. wie, czym Sebastian się zajmuje i co oferuje,
3. myśli: „to ktoś więcej niż programista; programowanie to duża część jego życia, ale jest w nim cały
   osobny świat, który chciałbym poznać”.

Odbiorcy bez zmian: klienci premium i agencje, w drugiej kolejności etat lub kontrakt senior. Część
osobista jest dla tych, którzy są ciekawi samej osoby.

## 2. Zasady, które obowiązują wszędzie

- **Tekst jest rzeczowy, metaforę niesie ruch.** Żadnych poetyckich opisów siebie.
- **Oś: materia.** Płynna materia (zielony, płaski blob) krzepnie w konkretną rzecz. Prawo ruchu:
  ruch = płynne, spoczynek = stałe. To nie tylko ozdoba: właściciel dosłownie pracuje z materią, która
  krzepnie (spoina, stopiony filament, kod). Tego nie piszemy; materia ma się po prostu zachowywać tak samo
  przy każdej z tych rzeczy.
- **Drogi.** Metafora właściciela: „choć czasem kierunki zdają się nie mieć sensu, to zawsze prowadzą do
  czegoś”. To **metafora, nie interfejs**: nie budujemy dosłownej mapy. Budujemy połączenia między
  podstronami, z których każde ma powód, i drzwi na końcu każdej strony.
- **Ciągłość jak w Lusion:** każda chwila wynika z poprzedniej, uwaga ma jeden cel i jest prowadzona,
  jeden słownik ruchu, telefon dostaje pełny spektakl.
- **Rozrost jest w porządku, jeśli całość jest spójna.** „W lekkim chaosie, ale pod kontrolą.”
- **Bez ciężkiego 3D, bez karuzel z wieloma projektami,** nic, co „boli w oczy”.
- **Prywatność:** na stronę nie trafia życie uczuciowe ani nic z analiz osobowości poza zawodowym echem.

## 3. Trzy warstwy

| Warstwa        | Dla kogo        | Co zawiera                                                                                                                                                                                              |
| -------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Powierzchnia   | każdy           | Strona główna: otwarcie, trzy sceny, jak pracuję, kontakt, drzwi dalej.                                                                                                                                 |
| Praca i oferta | klient, agencja | stronypodhale (drzwi na zewnątrz), ready2order, plugin aspect-preview z demo, Piczura (w realizacji), Airchos (w realizacji), usługi i ceny, kontakt, CV, notatki „dlaczego”, „Jak pracuję z agentami”. |
| Człowiek       | ciekawi         | „Kim jestem”: definicje z drogami. Drogi: dom, drukarka, auta; później ze zdjęć góry i podróże. Lab.                                                                                                    |

- kolbusz.xyz jest **hubem**: prowadzi do stronypodhale i do własnych projektów. Katalog-książka
  z projektami **znika**.
- **Kontor** nie jest publiczny, na razie odpada. Strona „Teraz” odłożona. Strona o narzędziach tylko
  wtedy, gdy gdzieś naturalnie pasuje.
- Część osobista **nie jest na stronie głównej**. Strona główna ma ją tylko zdradzać: kilka drobnych,
  niewyjaśnionych śladów, które nie pasują do programisty (propozycja).
- Każda rzecz z warstwy pracy ma własną podstronę (szablon case study z dokumentu z 24.09). Dochodzi się
  do niej ze scen na stronie głównej i z drzwi na końcach stron. Czy potrzebny jest do tego krótki indeks,
  jest **otwarte**.
- Do „Kim jestem” prowadzi zwykły, jawny link w docku. Ślady na stronie głównej i easter eggi to dodatkowe
  wejścia, nigdy jedyne (propozycja).
- Układ rośnie przez dopisywanie dróg w tym samym szablonie, nie przez wymyślanie nowych typów stron.
  Właściciel odczuwa obecny szkic jako „dość skromny”; to punkt wyjścia.

## 4. Strona główna: akty

| Akt                     | Co widzi odwiedzający                                                                                                                             | Stan                                          |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 0. Narodziny            | Imię i materia pojawiają się razem, jednym zdarzeniem.                                                                                            | Do zrobienia (dziś blob spóźnia się ok. 2 s). |
| 1. Płynne               | Hero: imię, rola, jedno rzeczowe zdanie. Materia reaguje na palec i kursor.                                                                       | Zbudowane.                                    |
| 2. Pierwsze krzepnięcie | Materia staje się taflą, z której wynurza się stronypodhale.pl; na telefonie na cały ekran, potem krzepnie w kartę.                               | Zbudowane, do podniesienia (plan A, B, C).    |
| 3. Co skrzepło          | Trzy sceny, każda jest drzwiami (ramka rośnie, wchodzi się do środka): stronypodhale, ready2order, plugin. Każdą otwiera pytanie i jedna decyzja. | Do zrobienia.                                 |
| 4. Oddech               | „Jak pracuję”: zasady współpracy razem z ich ceną (sekcja 7).                                                                                     | Do zrobienia.                                 |
| 5. Szczyt               | Kontakt. Materia wraca płynna; gdy odwiedzający pisze, nabiera kształtu, po wysłaniu krzepnie w potwierdzenie.                                    | Do zrobienia (propozycja).                    |
| 6. Drzwi                | Dodatkowy scroll na końcu przenosi dalej, ze sprężyną jak u Lusion.                                                                               | Do zrobienia (propozycja).                    |

Akt 2 i akt 3 to jedna sekwencja: karta stronypodhale z aktu 2 **jest** pierwszą z trzech scen, a akt 3
dodaje dwie pozostałe. Piczura i Airchos nie mają scen na stronie głównej; mają własne podstrony.

Scena ready2order: wiele małych kropli (Webpack, Redux, aktualizacje) zlewa się w jedną. Shader metaballi
robi to z natury, a obraz odpowiada definicji z sekcji 5.

## 5. Definicje i drogi (słowa właściciela)

Część „Kim jestem” odpowiada na pytanie kilkoma definicjami. Każda ma drogę jako dowód.

**Definicja główna:** „Nie wierzę na słowo: sprawdzam, weryfikuję, analizuję, rozkładam na czynniki
pierwsze, zanim coś przyjmę.”

| Definicja                                                                                              | Droga       |
| ------------------------------------------------------------------------------------------------------ | ----------- |
| „Problem zwykle nie leży w jednym miejscu, to powiązanie wielu różnych elementów.”                     | ready2order |
| Fizyczna realizacja pomysłu, a potem programowe ogarnięcie jej w sposób, nad którym ma pełną kontrolę. | Dom         |
| Prosty sposób na problem, który pojawia się często, a nikt go tak jeszcze nie rozwiązał.               | Plugin      |
| W domu da się zrobić samemu nie tylko oprogramowanie.                                                  | Drukarka    |
| Definicja główna przełożona na pracę z AI.                                                             | Airchos     |

Drogi, potwierdzone i poprawione przez właściciela:

1. **Drukarka 3D.** Kupiona z ciekawości i fascynacji tym, że w domu można samemu robić nie tylko
   oprogramowanie, ale też proste gadżety i przedmioty codziennej użyteczności. Rozebrana i przebudowana:
   nowa płyta, procesor, silniki, mechanizm osi X i Y, głowica (dysza, extruder, procesor głowicy). Potem
   zainteresowanie spadło. Dziś drukuje, gdy ktoś poprosi albo sam czegoś potrzebuje; nie stricte dla
   zarobku ani zabawy, choć chętnie by ją monetyzował. Na stronie: historia w części osobistej **oraz**
   uczciwe „drukuję na zamówienie” z kalkulatorem.
2. **Dom.** Płot z paneli → falowniki i pompa ciepła → Home Assistant → własne panele z danymi o energii.
   Właściciel: „mega mi się podobało”.
3. **Zakofy → plugin aspect-preview.** Strona turystyczna → potrzeba kadrowania zdjęć w CMS-ie → plugin
   open source. Kilkukrotnie chwalony za pomysł i podejście. Źródła pochwał do wskazania; bez nich nie cytujemy.
4. **Agenci AI → Airchos.** Agenci zgłaszali „gotowe”, gdy nie było gotowe. U modeli widać mnóstwo
   niekonsekwencji, a sprawdzanie jest najczęściej pomijane z lenistwa. Weryfikację przejmują więc
   narzędzia, które radziły sobie z nią jeszcze przed popularyzacją LLM. Airchos należy do **pracy**.
5. **Auta.** Usterka → kabel i VCDS → diagnostyka aut w rodzinie. Doszła eksploatacja (oleje, filtry)
   i małe naprawy. Nie ma jeszcze definicji.
6. **ready2order, paczka −50%.** Nie jedna zmiana: przebudowa konfiguracji Webpacka, aktualizacja dla
   lepszych zabezpieczeń, usunięcie Reduxa, który dublował cache Apollo Client. Dużo małych czynników
   złożyło się na wynik.

**Szablon drogi (propozycja, do ustalenia):** tytuł, stan, daty, od czego się zaczęło, kolejne kroki, co
z tego zostało, definicja (jeśli jest) i „dokąd stąd”. Droga to historia w części osobistej; podstrona
projektu to case study w warstwie pracy. Rzecz może mieć jedno i drugie (plugin, Airchos, ready2order).

Metoda zbierania dalszego materiału: propozycje składane z faktów, właściciel je poprawia. Otwarte pytania
o siebie nie działają. Kolejne drogi (góry, podróże) wyjdą ze zdjęć i nagrań z drona (Linear MYS-34,
odłożone na koniec).

## 6. Stany rzeczy

Każda rzecz w hubie ma stan widoczny w materii i podpisany rzeczowo: **w realizacji** (krzepnie),
**działa** (stałe), **zrozumiane i odłożone** (jak drukarka: zainteresowanie trwa, dopóki jest co
rozumieć). Stanu „porzucone” nie używamy. Jak dokładnie stan wygląda w materii i na jakich elementach się pojawia, jest **otwarte**.

## 7. „Jak pracuję”: zaleta razem z ceną (propozycja, linie do poprawienia przez właściciela)

- „Pracuję sam. Projekt, kod, serwer i utrzymanie są w jednych rękach.”
- „Nie używam szablonów ani cudzych widgetów tam, gdzie decydują o wrażeniu. To trwa dłużej.”
- „Zadam więcej pytań »dlaczego«, niż się spodziewasz.”
- „Biorę kilka projektów w roku.”
- „Potrzebujesz sprawdzonej strony w stałej cenie? Od tego jest stronypodhale.pl.”

Dwie nowe podstrony w warstwie pracy (przyjęte):

- **Notatki „dlaczego”:** krótkie teksty o podjętych decyzjach (np. Astro domyślnie, bez gotowych
  bibliotek komponentów, Payload).
- **„Jak pracuję z agentami”:** reguły, bramki jakości, co idzie do narzędzi, a co sprawdza sam. Materiał
  źródłowy: historia współpracy z Claude, opisana rzeczowo; właściciel poprawia.

## 8. Narzędzia narracji

1. **Kulka = uwaga.** Zostaje z odwiedzającym przez całą stronę i prowadzi oko od punktu do punktu.
2. **Pytanie przed odpowiedzią.** Scena zaczyna się pytaniem, które faktycznie padło, i pokazuje decyzję.
3. **Rzecz dowodzi siebie sama** (lekcja z leonlin.de): demo, komenda instalacji, prawdziwa liczba.
4. **Przejścia między stronami** to to samo prawo ruchu: nawigacja zalewa ekran materią, nowa strona krzepnie.
5. **Drzwi na końcu każdej strony:** „dokąd stąd”, z powodem.

## 9. Easter eggi (właściciel chce jeden albo dwa; kandydaci, bez decyzji)

- **Bezruch:** kto przestanie przewijać, temu materia krzepnie w coś, czego inaczej nie widać, np. w wejście
  do części osobistej. Zagadką jest samo prawo ruchu. Działa na telefonie.
- **„marvin”:** słowo z pierwszego Gothica (do sprawdzenia) włącza podgląd budowy strony. Wymaga klawiatury.
- **Współrzędne Kościeliska** w drobnych metadanych strony głównej jako drzwi.

## 10. Co wzięte z referencji

| Strona                 | Wrażenie właściciela                                                                                             | Jak to u nas                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Lusion                 | Najbliżej tego, co kocha: ciągłość, prowadzenie uwagi, dopracowanie.                                             | Zasady w `2026-11-14-lusion-przepis.md`.                                                        |
| jomor.design           | (15.11) Jedna z najfajniejszych i najciekawszych, jakie widział: mnóstwo pomysłów, z humorem. Nie do kopiowania. | Źródło pomysłów i tonu (humor), nie wzorzec układu. Rozpisane w `2026-11-15-jomor-przeglad.md`. |
| leonlin.de             | Całościowo przemyślana historia i ruch.                                                                          | Hub; rzecz dowodzi siebie sama.                                                                 |
| Locomotive             | Lista projektów.                                                                                                 | Wzorzec dla krótkiego indeksu, jeśli będzie potrzebny.                                          |
| Aristide Benoist       | Tylko pomysł na otwieranie projektów; działa wyłącznie na desktopie.                                             | Sceny jako drzwi, ale działające na telefonie.                                                  |
| Joffrey Spitzer, Zajno | Przejścia między stronami (u Zajno zniekształcenia).                                                             | Sekcja 8, punkt 4.                                                                              |
| 14islands              | Całkiem ciekawa.                                                                                                 | Bez konkretnego zapożyczenia.                                                                   |
| Hello Monday           | Rysunki i falowanie, nic poza tym.                                                                               | Falowanie mamy w materii.                                                                       |
| wodniack.dev           | Ciekawy, ale boli w oczy; za dużo karuzeli.                                                                      | Granica, której nie przekraczamy.                                                               |

## 11. Co to zmienia w planie z września

- Katalog-książka `/projects` znika. Etap „katalog” wymaga nowej definicji (krótki indeks albo nic).
- `/about` staje się stroną „Kim jestem” z definicjami i drogami.
- Dochodzą: szablon drogi, notatki „dlaczego”, „Jak pracuję z agentami”, stany rzeczy, drzwi na końcu stron.
- Druk 3D: „realna usługa” z dokumentu wrześniowego zmienia się w „drukuję na zamówienie”.
- Kolejność: najpierw podniesienie otwarcia (plan A, B, C), potem reszta. Dokument z 24.09 i zadania
  w Linear wymagają aktualizacji; to decyzja właściciela.

## 12. Otwarte

1. Otwarcie: **nowy kierunek dla hero** (załadowanie, pojawianie się, wygląd, układ). Właściciel wskazał
   14.11, że to tu leży problem; propozycji jeszcze nie ma. Zamknięte tego dnia: pionowy zrzut na telefonie
   tak, pełny ekran nie, plan B do oceny później, telefon odniesienia to iPhone z Safari. Otwarte zostaje,
   jak ma wyglądać wynurzanie z falującymi krawędziami w ramce oraz plan C. Kierunek hero po drugiej
   rundzie (diagnoza, sekcja 5): hero ma opowiadać historię, prowadzi „Materia próbuje kształtów”
   (4–5 rzeczy, bez auta), układ plakatowy, tafla odpływa przy załadowaniu. Otwarte: wybór między trzema
   historiami po próbkach w kodzie i ostateczna lista kształtów.
2. Linie z sekcji 7: które brzmią jak właściciel.
3. Źródła pochwał pluginu.
4. Które rzeczy z części osobistej mogą być publiczne i jakie są zdjęcia.
5. Wybór easter eggów.
