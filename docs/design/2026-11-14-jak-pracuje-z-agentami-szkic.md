# „Jak pracuję z agentami”: szkic treści podstrony

**Status:** szkic po pierwszej rundzie odpowiedzi właściciela (14.11): wszystkie 15 zdań z części 3
jest rozstrzygnięte i naniesione. Sformułowania zatwierdzone przez niego 15.11; tekst jest gotowy jako wsad do budowy podstrony. To dokument, nie kod.

**Miejsce w koncepcie:** podstrona w warstwie pracy, przyjęta w sekcji 7 konceptu
(`2026-11-14-historia-strony-koncept.md`). Powiązana droga: sekcja 5, „Agenci AI → Airchos”.

**Jak czytać:** część 1 to plan strony, część 2 to tekst do publikacji po poprawkach, część 3 to zdania
do zaznaczenia prawda / fałsz / pomiń, część 4 pokazuje, co odfiltrowałem.

**Skróty źródeł** (używane niżej; to nie jest treść strony):

| Skrót     | Plik                                                               |
| --------- | ------------------------------------------------------------------ |
| G-CLAUDE  | globalne `CLAUDE.md` (koszt, workflow, reguła adopcji narzędzi)    |
| RTK       | globalne `RTK.md`                                                  |
| LINEAR    | `rules/linear.md`                                                  |
| KONTEKST  | `zarzadzanie-kontekstem.md`                                        |
| P-CLAUDE  | `CLAUDE.md` tego repozytorium (komendy, testy, konwencje)          |
| PAMIĘĆ    | pamięć projektu (pliki `feedback_*` i `project_kolbusz_redesign…`) |
| LEARNINGS | `.trail/learnings/` w repozytorium                                 |
| KONCEPT   | sekcje 5 i 7 konceptu                                              |
| README    | `docs/design/README.md`, część „Jak pracujemy nad redesignem”      |

---

## Część 1. Plan strony (6 sekcji)

Każda sekcja: reguła w jednym zdaniu, skąd się wzięła, jak jest pilnowana.

### 1. „Gotowe” znaczy sprawdzone

- **Reguła:** Agent nie zgłasza „gotowe”, dopóki wynik nie przeszedł sprawdzenia, którego nie wykonuje
  on sam na słowo.
- **Skąd:** Agenci zgłaszali „gotowe”, gdy nie było gotowe. Sprawdzanie jest krokiem, który modele
  najczęściej pomijają. Osobny przypadek: propozycja scalenia całej gałęzi, bo testy były zielone, a jedna
  scena zaakceptowana; akceptacja dotyczyła sceny, nie wydania.
- **Pilnowane przez:** narzędzia, które robiły to przed LLM (formatowanie, lint, typy, testy
  jednostkowe z progami pokrycia, testy e2e, dostępność, regresja wizualna), krok weryfikacji przed
  każdym „gotowe”, na końcu obejrzenie wyniku przez człowieka.
- **Źródła:** KONCEPT §5 droga 4; G-CLAUDE (workflow, „własny przegląd wyniku”); P-CLAUDE (komendy
  i progi testów); LINEAR („odhaczyć, gdy skończona i zweryfikowana”); LEARNINGS („The redesign ships as
  a whole”).

### 2. Najpierw pytania i plan, potem kod

- **Reguła:** Nowa funkcja przechodzi kolejno przez pytania szukające dziury w pomyśle, specyfikację,
  plan, wykonanie i weryfikację; drobiazgi idą bez tej ścieżki.
- **Skąd:** Zgadywanie i kolejne rundy poprawek kosztują więcej niż jeden porządny research na starcie.
  (Przykład z wrześniową próbą redesignu usunięty po odpowiedzi 5 właściciela.)
- **Pilnowane przez:** stałą kolejność kroków zapisaną w regułach, prototypy tylko w prawdziwym
  repozytorium, czytanie dokumentu „na zimno” przez recenzenta bez kontekstu po większych przeróbkach.
- **Źródła:** G-CLAUDE (workflow); KONTEKST (nawyk 9); PAMIĘĆ (`project_kolbusz_redesign…`); README;
  LEARNINGS („Site direction…”, 15 luk znalezionych przy zimnym czytaniu).

### 3. Decyzje żyją w plikach, nie w rozmowie

- **Reguła:** Każde ustalenie trafia do pliku w repozytorium albo na tablicę zadań, a nowa sesja startuje
  z tych plików, nie z historii czatu.
- **Skąd:** Rozmowa znika razem z sesją, a streszczona sesja gubi szczegóły. Pierwszy pomysł, jeden plik
  ze wszystkimi zadaniami, został odrzucony: rósł z każdym zamkniętym zadaniem i trzeba go było czytać
  w całości przy każdej sesji.
- **Pilnowane przez:** indeks dokumentów, który mówi, co jest źródłem prawdy; małą sesję, która kończy
  pracę wpisem do właściwego dokumentu; notatki z sesji (co ustalono, co odrzucono i dlaczego)
  commitowane razem ze zmianą; tablicę odpytywaną celowanie: tylko otwarte zadania jednego projektu.
- **Źródła:** KONTEKST (nawyki 1 i 2); LINEAR („Zasada podstawowa”); README; LEARNINGS (sam mechanizm).

### 4. Jedna sesja, jeden temat, jeden wykonawca

- **Reguła:** Sesja zajmuje się jednym tematem, pracę wykonuje jeden agent, a przed pokazaniem wyniku
  jest najwyżej jedna pętla poprawek.
- **Skąd:** Długa sesja, która miesza tematy, po streszczeniu gubi ustalenia, a jej wynik trudniej
  sprawdzić. Sesja nadzorująca, która sama przerabiała wszystkie otwarte decyzje w głównym wątku, została
  wycofana. Koszt jest skutkiem ubocznym, nie powodem (odpowiedź 14 właściciela: jakość i bezpieczeństwo
  przede wszystkim).
- **Pilnowane przez:** podział na sesję nadzorującą (kierunek, start małych sesji, przegląd wyników)
  i małe sesje od jednej rzeczy; krótkie zlecenia z listą rzeczy nietykalnych i jasnym końcem; jedno
  pytanie zamiast rundy wariantów; raport zużycia po większej rundzie; filtr, który skraca wyniki poleceń
  w terminalu, zanim trafią do modelu.
- **Źródła:** KONTEKST („Główna zasada”, tabela „Co kiedy”); G-CLAUDE („Koszt”); RTK; PAMIĘĆ
  (`feedback_supervising_means_delegating`); README.

### 5. Narzędzie wchodzi do stosu po teście odczytu i po pomiarze

- **Reguła:** Żadne narzędzie nie wchodzi do stosu, dopóki nie sprawdzę, że agent ma z niego odczyt
  przez API, a wybór między narzędziami poprzedza pomiar.
- **Skąd:** Strategia wpisana do narzędzia, którego strony są dokumentami CRDT, była dla agenta
  niewidoczna: nie dało się ich odczytać kluczem API.
- **Pilnowane przez:** test odczytu przed adopcją; porównanie narzędzi na tym samym zadaniu przed
  wyborem; decyzję, która należy do mnie, nie do agenta.
- **Źródła:** G-CLAUDE (reguła globalna, ostatni punkt „Koszt”); LINEAR („Reguła adopcji narzędzi”);
  KONTEKST (wiersz o teście z 04.11).

### 6. Co zostaje przy mnie

- **Reguła:** Agent wykonuje i sprawdza, a o tym, co jest zadaniem, jakie narzędzie zostaje i kiedy coś
  wychodzi na produkcję, decyduję ja.
- **Skąd:** Tablica, na której większość pozycji nigdy nie zostanie zrobiona, przestaje odpowiadać na
  pytanie „co teraz”. Agent, który widzi coś do naprawy, naprawia to, także wtedy, gdy miało zostać
  nieruszone.
- **Pilnowane przez:** dwa osobne miejsca na pracę i na pomysły; agent zamyka tylko istniejące zadania
  i zapisuje w komentarzu, co zrobił, a nowych nie zakłada; etykiety „nie ruszać” i „zablokowane”
  z warunkiem odblokowania; pomysł odrzucony zostaje razem z powodem odrzucenia.
- **Źródła:** LINEAR („Praca i myśli to dwa zespoły”, „Co wolno zapisywać”); G-CLAUDE (ostatni punkt
  „Koszt”); LEARNINGS („The redesign ships as a whole”); PAMIĘĆ (`feedback_copy_…`,
  `feedback_propose_…`).

---

## Część 2. Szkic tekstu

Pierwsza osoba, bez ścieżek, kluczy i numerów zadań. Po odpowiedziach właściciela
z części 3.

### Wstęp

Pracuję sam, a część pracy wykonują agenci AI. Kod piszę z Claude. Do researchu poza kodem często
używam też Gemini i ChatGPT, a ChatGPT także do pierwszych wersji tekstów po polsku, które potem
redaguję. Nie wierzę im na słowo, tak jak nie wierzę na słowo nikomu: sprawdzam, zanim przyjmę.

Poniżej jest sześć reguł, według których ta współpraca działa. Cały proces służy jednemu: jakość
i bezpieczeństwo przede wszystkim. Bezpieczeństwo znaczy tu dwie rzeczy: kod bez luk i żadnych sekretów
w repozytorium. Każda reguła powstała po konkretnym błędzie i każda ma coś, co jej pilnuje.

### 1. „Gotowe” znaczy sprawdzone

Agenci zgłaszali „gotowe”, gdy nie było gotowe. Modele są niekonsekwentne, a sprawdzanie to krok, który
pomijają najczęściej.

Dlatego weryfikacji nie zostawiam modelowi. Przejmują ją narzędzia, które radziły sobie z nią, zanim LLM
stały się popularne: formatowanie, lint, sprawdzanie typów, testy jednostkowe z progiem pokrycia (80%
gałęzi, 85% funkcji i linii), testy w przeglądarce, test dostępności i porównanie zrzutów ekranu. Zrzuty wzorcowe powstają w tym
samym środowisku, w którym chodzą testy, bo ten sam ekran na innym systemie renderuje czcionki inaczej.

Narzędzia nie zastępują procesu wokół nich. Burza mózgów, planowanie i rozbijanie pracy na etapy
pozostają tak samo ważne, także teraz, gdy buduję Airchos: testy sprawdzają, czy rzecz zrobiono dobrze,
a nie, czy zrobiono właściwą rzecz.

Zielone testy to warunek, a nie koniec. Zdarzyło się, że agent zaproponował wydanie całej przebudowy,
bo testy przechodziły, a ja zaakceptowałem jedną scenę. Akceptacja jednej sceny nie jest zgodą na
wydanie. Wygląd i ruch oceniam sam, w przeglądarce i na własnym telefonie.

### 2. Najpierw pytania i plan, potem kod

Większa zmiana ma stałą kolejność: seria pytań, która szuka dziury w pomyśle, potem specyfikacja, plan,
wykonanie i weryfikacja. Drobiazgi (tekst, kolor, odstęp) idą bez tej ścieżki. Tak samo pracuję
w projektach dla klientów.

Zgadywanie kończy się kolejnymi rundami poprawek. Jeden porządny research na starcie daje lepszy wynik.
Prototypy powstają tylko w prawdziwym kodzie, nie na planszach obok repozytorium.

Dokument po większej przeróbce czyta recenzent, który nie zna rozmowy. Przy pierwszej czystej wersji
konceptu tej strony znalazł 15 luk.

### 3. Decyzje żyją w plikach, nie w rozmowie

Rozmowa z agentem znika razem z sesją. Ustalenia trafiają więc do plików w repozytorium i na tablicę
zadań, a nowa sesja startuje z nich, nie z historii czatu. Jeden plik jest indeksem: mówi, który dokument
jest źródłem prawdy i w jakiej kolejności czytać resztę.

Po sesji zostaje też krótka notatka: co ustalono, co sprawdzono i odrzucono, na co uważać. Jest
commitowana razem ze zmianą, więc następna sesja nie odkrywa tego samego drugi raz.

Zadania nie mieszkają w pliku. Próbowałem: plik rósł z każdym zamkniętym zadaniem i trzeba go było czytać
w całości na początku każdej sesji. Teraz agent pyta tablicę tylko o otwarte zadania jednego projektu.
Kosztuje to, co się przeczyta, a nie sposób czytania.

### 4. Jedna sesja, jeden temat, jeden wykonawca

Długa sesja, która miesza tematy, gubi szczegóły: po streszczeniu rozmowy część ustaleń znika, a wynik
trudniej sprawdzić. Rośnie też jej koszt, ale to skutek uboczny, nie powód tej reguły.

Dlatego jedna sesja pilnuje kierunku, a konkretne rzeczy (jedna podstrona, jeden etap) robią osobne, małe
sesje. Ciężka praca wraca jako plik i kilka zdań podsumowania. Zlecenie dla agenta jest krótkie: co
zrobić, czego nie dotykać, czego nie robić i po czym poznać koniec. Ten podział wziąłem z modelu
Elephant-Goldfish (egm.dev).

Domyślnie pracuje jeden wykonawca. Przed pokazaniem wyniku jest najwyżej jedna pętla poprawek; potem
wynik oglądam ja, zamiast pozwalać agentowi poprawiać go w kółko. Gdy coś jest niejasne, agent zadaje
jedno pytanie, zamiast produkować rundę wariantów. Drugi recenzent pojawia się przy nowym kierunku albo
na moją prośbę. Wyniki poleceń w terminalu przechodzą przez filtr, który skraca je, zanim trafią do
modelu.

### 5. Narzędzie wchodzi do stosu po teście odczytu i po pomiarze

Zanim narzędzie trafi do mojego stosu, sprawdzam, czy agent może z niego czytać przez API. Tej reguły
nauczyłem się drogo na Plane: strategia projektu wpisana w jego strony była dla agenta niewidoczna, bo
te strony to dokumenty CRDT, których nie da się odczytać kluczem API. Linear ten test przechodzi:
dokumenty odpowiadają na zwykłe zapytanie.

Druga połowa reguły: wybór narzędzia poprzedza pomiar. Narzędzie do przeszukiwania kodu, trail, wybrałem
po teście trzech kandydatów na tym samym zadaniu. Agent może zmierzyć i przedstawić wynik. Decyzja,
co zostaje, jest moja.

### 6. Co zostaje przy mnie

Agent wykonuje i sprawdza. Nie decyduje, co jest zadaniem. Na tablicę pracy wchodzi tylko to, co jest
zdecydowane i ma następny krok; pomysły mają osobne miejsce i własną ścieżkę: od surowej notatki, przez
serię pytań, do mojego „tak” albo „nie”. Pomysł odrzucony zostaje w archiwum razem z powodem, bo powód
jest wart tyle, co pomysł.

Agent może zamknąć zadanie, które już istnieje, gdy praca jest skończona i zweryfikowana, i zapisuje
w komentarzu, co konkretnie zrobił. Nowych zadań nie zakłada: zgłasza je w rozmowie. Część zadań ma
etykietę „nie ruszać”. Istnieją po to, żeby ktoś czegoś nie naprawił.

Przy mnie zostają też: wybór narzędzi, moment wydania i każde zdanie, które mówi o mnie. Teksty
o sobie dostaję jako konkretne propozycje złożone z faktów i poprawiam je; otwarte pytania o siebie
u mnie nie działają.

### Dokąd stąd

- Droga „Agenci AI → Airchos”: ta sama zasada, czyli weryfikacja oddana narzędziom, jako osobny
  projekt.
- Notatki „dlaczego”: krótkie teksty o pojedynczych decyzjach technicznych.

---

## Część 3. Do potwierdzenia

Zaznacz przy każdym: **prawda / fałsz / pomiń**. To wszystko, co wywnioskowałem, a nie przeczytałem
wprost, oraz decyzje o tym, co wolno nazwać publicznie.

1. **PRAWDA (właściciel, 14.11), z uzupełnieniem:** narzędzia „sprzed LLM” to formatowanie, lint,
   sprawdzanie typów, testy jednostkowe, testy e2e, test dostępności i regresja wizualna; agent nie
   zgłasza „gotowe”, zanim przejdą. Uzupełnienie właściciela: ważną częścią pozostaje cały proces wokół
   (burza mózgów, planowanie, rozbijanie pracy na etapy), mimo budowania Airchos. Dopisane w sekcji 1
   tekstu; zdanie „testy sprawdzają, czy rzecz zrobiono dobrze, a nie, czy zrobiono właściwą rzecz”
   jest moim sformułowaniem tego uzupełnienia; właściciel 15.11: zostaje.
2. **PRAWDA (właściciel, 14.11):** strona może wymieniać narzędzia z nazwy: Claude Code, Linear, Plane
   (jako to, które nie przeszło testu odczytu), trail, RTK. W tekście nazwane są na razie Plane, Linear
   i trail; RTK czeka na punkt 7.
3. **PRAWDA (właściciel, 14.11):** wygląd i ruch zawsze oceniam sam, w przeglądarce i na własnym
   telefonie; zielone testy do tego nie wystarczają.
4. **PRAWDA (właściciel, 14.11):** Airchos jest moim projektem, który oddaje weryfikację pracy agentów
   narzędziom, i może być podlinkowany z tej strony jako „dokąd stąd”.
5. **FAŁSZ (właściciel, 14.11):** wrześniowa próba redesignu nie „nie nadawała się do niczego”. Słowa
   właściciela: „była dobrym rozpoczęciem, na które brakło mi czasu”. Przykład usunięty z tekstu; reguła
   „prototypy tylko w prawdziwym kodzie” została bez anegdoty. Uwaga dla następnej sesji: pamięć
   projektu opisuje tę próbę ostrzej (studia odrzucone); na stronie obowiązuje wersja właściciela.
6. **PRAWDA (właściciel, 14.11):** przykład recenzenta bez kontekstu, który w czystej wersji konceptu
   znalazł 15 miejsc niejasnych albo brakujących, może zostać na stronie razem z liczbą.
7. **PRAWDA (właściciel, 14.11):** filtr wyników terminala (RTK) działa na co dzień i zostaje w tekście
   jednym zdaniem. Nazwa RTK nie pada w tekście; do dopisania, jeśli właściciel zechce.
8. **PRAWDA (właściciel, 14.11):** trail wybrany 4 listopada po teście trzech kandydatów na tym samym
   zadaniu. Nazwy dwóch pozostałych narzędzi nie trafiają na stronę.
9. **PRAWDA (właściciel, 14.11):** zdanie „otwarte pytania o siebie u mnie nie działają” może być na
   stronie.
10. **PRAWDA (właściciel, 14.11):** progi pokrycia testów (80% gałęzi, 85% funkcji i linii) podane
    liczbami; dopisane w sekcji 1 tekstu.
11. **PRAWDA Z ZASTRZEŻENIEM (właściciel, 14.11):** reguły dotyczą pracy z Claude. Zastrzeżenie
    właściciela: Gemini i ChatGPT często używa do researchu poza kodem, a samego ChatGPT do pisania
    treści po polsku, które idą do redakcji. Dopisane we wstępie; „pierwsze wersje tekstów, które potem
    redaguję” to moje odczytanie słów „pisanie treści do redakcji”; właściciel 15.11: redaguje je sam,
    zostaje.
12. **PRAWDA (właściciel, 14.11):** model „jedna sesja nadzoruje, małe sesje robią jedną rzecz” pochodzi
    z Elephant-Goldfish (egm.dev); źródło podane w sekcji 4 tekstu.
13. **PRAWDA (właściciel, 14.11):** kolejność „pytania → specyfikacja → plan → wykonanie → weryfikacja”
    obowiązuje przy każdej większej zmianie, także w projektach dla klientów; dopisane w sekcji 2.
14. **FAŁSZ (właściciel, 14.11):** uzasadnianie jednego wykonawcy i jednej pętli poprawek kosztem brzmi
    sztucznie. Słowa właściciela: „jakość i bezpieczeństwo przede wszystkim, a po to mamy ten proces”.
    Zmienione: wstęp nazywa ten cel wprost; sekcje 2 i 4 uzasadniają reguły jakością wyniku, koszt jest
    w sekcji 4 jednym zdaniem jako skutek uboczny; zdanie o raporcie zużycia tokenów usunięte z tekstu.
    Moje sformułowania „wynik trudniej sprawdzić” i „daje lepszy wynik”: właściciel 15.11: zostają. Definicja
    bezpieczeństwa dopisana we wstępie słowami właściciela (14.11): „kod bez luk i żadnych sekretów
    w repo”. Tekst nie mówi, czym to jest pilnowane, bo źródła tego nie podają.
15. **PRAWDA (właściciel, 14.11):** sześć sekcji w tej kolejności.

Wszystkie 15 zdań jest rozstrzygnięte, a trzy moje sformułowania (punkty 1, 11 i 14) właściciel
zatwierdził 15.11. Otwartych punktów w tym szkicu nie ma.

---

## Część 4. Co pominąłem celowo

Żebyś widział filtr. Nic z poniższych nie ma w części 2.

- **Klucze i konfiguracja:** gdzie leży klucz do tablicy zadań, adres API, uprawnienia plików.
- **Ścieżki z Twojego komputera:** katalogi reguł, pamięci, kontekstu dla agentów, nazwy plików
  z porównaniem narzędzi.
- **Wewnętrzne identyfikatory:** nazwy zespołów na tablicy, numery zadań i myśli, numer PR, nazwy
  gałęzi, nazwy stanów lejka pomysłów, nazwy etykiet projektów.
- **Koszty:** minuty i liczby tokenów zapisane przy learnings, wynik pomiarów oszczędności, wszystko, co
  dałoby się przeliczyć na kwotę.
- **Klienci i inne projekty:** żaden projekt poza tą stroną nie jest wymieniony z nazwy (poza Airchos,
  punkt 4 do potwierdzenia). Kontor i inne prywatne projekty: nic.
- **Rzeczy osobiste:** analizy osobowości, relacje, wszystko z części „Kim jestem”. Jedyny wyjątek to
  zdanie o otwartych pytaniach (punkt 9 do potwierdzenia).
- **Cytaty z rozmów:** Twoje słowa do agenta, w tym sprzeciw wobec przerabiania wszystkiego w głównym
  wątku. W tekście jest sama reguła.
- **Treść redesignu:** oceny stron referencyjnych, ustalenia audytu z marca, plan A/B/C otwarcia, stan
  hero. To nie jest o pracy z agentami.
- **Nazwy modeli i wersji** oraz nazwy wewnętrznych skilli i pluginów (w tym tego, który został
  zastąpiony własnym workflow).
- **Nazwy przegranych narzędzi** w tekście strony (są tylko w punkcie 8 do potwierdzenia).
- **Rzeczy, których źródła nie mówią:** jak działa Airchos, ile kosztuje praca agentów, ile sesji
  dziennie, jakiekolwiek wyniki „przed i po”. Nie zgadywałem.
