# Drogi: drukarka 3D i dom (pierwszy szkic)

Data: 2026-11-15 · Status: **szkic do oznaczenia przez właściciela.** Teksty napisał ChatGPT (Codex CLI,
`gpt-6.1-sol`) w dwóch rundach; Claude przygotował brief i sprawdził fakty. Treść tekstów jest przepisana
bez zmian. Źródło faktów: `2026-11-14-historia-strony-koncept.md`, sekcje 5, 6 i 12.

## Teksty (wersja Codexa po jednej rundzie poprawek)

**Tytuł**
Przebudowa drukarki 3D

**Stan**
zrozumiane i odłożone

**Od czego się zaczęło**
Kupiłem drukarkę 3D z ciekawości. Fascynowało mnie, że w domu mogę sam robić nie tylko oprogramowanie, ale też proste gadżety i przedmioty codziennego użytku.

**Kroki**

- Rozebrałem drukarkę i ją przebudowałem.
- Wymieniłem płytę, procesor, silniki oraz mechanizm osi X i Y.
- Przebudowałem też głowicę: dyszę, extruder i procesor głowicy.
- Potem moje zainteresowanie drukarką spadło.

**Co z tego zostało**
Dziś drukuję, gdy ktoś mnie poprosi albo sam czegoś potrzebuję. Nie robię tego stricte dla zarobku ani dla zabawy.

**Definicja**
W domu mogę sam zrobić nie tylko oprogramowanie.

**Dokąd stąd**
Mogę wydrukować na zamówienie, a obok tego tekstu będzie kalkulator, w którym można sprawdzić cenę wydruku.

**Tytuł**
Dom pod kontrolą

**Stan**
działa

**Od czego się zaczęło**
Zacząłem od płotu z paneli fotowoltaicznych.

**Kroki**

- Po płocie przyszła kolej na falowniki i pompę ciepła.
- Następnie zająłem się Home Assistantem.
- Potem zrobiłem własne panele, czyli ekrany z danymi o energii.

**Co z tego zostało**
Działają falowniki, pompa ciepła, Home Assistant i moje ekrany z danymi o energii. Całe to przedsięwzięcie mega mi się podobało. Część fizyczna i oprogramowanie znalazły się w jednym projekcie.

**Definicja**
Realizuję pomysł fizycznie, a potem ogarniam go programowo tak, żebym miał nad nim pełną kontrolę.

**Dokąd stąd**
Teraz korzystam z działającej instalacji i własnych paneli z danymi o energii.

## Do potwierdzenia (tak / nie / popraw)

Drukarka:

1. Stan drukarki to „zrozumiane i odłożone”.
2. Przebudowa objęła: płytę, procesor, silniki, mechanizm osi X i Y oraz głowicę (dysza, extruder,
   procesor głowicy). Tekst mówi „wymieniłem” o płycie, procesorze, silnikach i mechanizmie osi.
3. Zdanie „Nie robię tego stricte dla zarobku ani dla zabawy” może zostać na stronie.
4. Obok tej drogi będzie kalkulator ceny wydruku.
5. Tekst nie mówi, że chętnie byś drukarkę monetyzował; wystarczy „mogę wydrukować na zamówienie”.

Dom:

6. Panele w płocie to panele fotowoltaiczne (w źródle było samo „płot z paneli”; to moje dopowiedzenie).
7. Stan domu to „działa” (to mój domysł z faktów: wszystkie kroki są zrobione i dziś działają).
8. Kolejność była taka: płot, potem falowniki i pompa ciepła, potem Home Assistant, potem własne ekrany
   z danymi o energii.
9. „Własne panele” to ekrany (dashboardy) z danymi o energii, które zrobiłeś sam w Home Assistant.
10. Zdanie „Całe to przedsięwzięcie mega mi się podobało” może zostać w Twoich słowach.
11. Tytuł „Dom pod kontrolą” jest w porządku.

Uwaga do formy: obie historie mają ok. 100–115 słów, czyli trochę poniżej zamówionych 120. Krótsze wyszły
po usunięciu dopowiedzeń; nie dopisywaliśmy niczego na siłę.

## Zdjęcia: co gdzie

- **Drukarka:** zdjęcie drukarki przy „Kroki” (najlepiej po przebudowie, z widoczną głowicą). Zdjęcia
  częściowo są, możesz dorobić. Kandydat na jeden podpis z suchym żartem (pomysł 2 z przeglądu
  jomor.design), np. o liczbie rozkręconych części, jeśli takie zdjęcie istnieje.
- **Dom:** zdjęcie płotu przy „Od czego się zaczęło”; zrzut ekranu z danymi o energii przy „Co z tego
  zostało”. Pompa ciepła bez zdjęcia (nie nadaje się na zdjęcie).

## Brief wysłany do Codexa (do ponownego użycia przy kolejnych drogach)

Komenda: `codex exec -m gpt-6.1-sol -c model_reasoning_effort="medium" -s read-only --skip-git-repo-check "<brief>" < /dev/null`

### Runda 1

```markdown
Napisz po polsku dwa krótkie teksty na osobistą stronę programisty (część „Kim jestem”). Każdy tekst to jedna „droga”: historia jednej rzeczy, którą autor zrobił poza pracą, i dowód jednej definicji tego, kim jest. Piszesz w pierwszej osobie, jako on. Odpowiedz tylko tekstami, bez komentarzy. Jedna wersja na historię, każda 120–200 słów (licząc wszystkie pola).

## Szablon drogi (te pola, w tej kolejności, z tymi nagłówkami)

- **Tytuł** (krótki, rzeczowy)
- **Stan** (jedno z: „działa”, „w realizacji”, „zrozumiane i odłożone”; podaję niżej, nie zmieniaj)
- **Od czego się zaczęło**
- **Kroki** (krótka lista albo kilka zdań w kolejności zdarzeń)
- **Co z tego zostało**
- **Definicja** (jedno zdanie; treść podaję niżej, możesz ją ująć w pierwszej osobie, sens bez zmian)
- **Dokąd stąd** (jedno zdanie: co dalej albo dokąd czytelnik może pójść; bez wymyślania planów, których nie ma w faktach)

Dat nie podawaj, nie mam ich.

## Historia 1: Drukarka 3D

Stan: zrozumiane i odłożone.
Definicja: W domu da się zrobić samemu nie tylko oprogramowanie.
Fakty (nie zmieniaj, nie dodawaj nowych):

1. Kupiłem ją z ciekawości i z fascynacji tym, że w domu można samemu robić nie tylko oprogramowanie, ale też proste gadżety i przedmioty codziennej użyteczności.
2. Rozebrałem ją i przebudowałem: nowa płyta, procesor, silniki, mechanizm osi X i Y, głowica (dysza, extruder, procesor głowicy).
3. Potem zainteresowanie spadło.
4. Dziś drukuję, gdy ktoś poprosi albo sam czegoś potrzebuję. Nie stricte dla zarobku ani dla zabawy.
5. Mogę wydrukować na zamówienie (na stronie będzie obok kalkulator ceny). Zamówień jeszcze nie było.
   Twarda reguła: tekst musi zawierać uczciwe „mogę wydrukować na zamówienie” i NIE może sugerować, że usługa już działa, że są klienci, zamówienia, opinie, doświadczenie w realizacji zleceń. Nie pisz też wprost „nikt jeszcze nie zamówił”, jeśli brzmi to jak żebranie; wystarczy, że nic nie sugeruje klientów.

## Historia 2: Dom

Stan: działa.
Definicja: Fizyczna realizacja pomysłu, a potem programowe ogarnięcie jej tak, żebym miał nad nią pełną kontrolę.
Fakty (nie zmieniaj, nie dodawaj nowych), w tej kolejności:

1. Płot z paneli (fotowoltaicznych).
2. Falowniki i pompa ciepła.
3. Home Assistant.
4. Własne panele (ekrany) z danymi o energii.
5. Jego słowa o tej drodze: „mega mi się podobało”.
   Nie podawaj liczb (mocy, oszczędności, rachunków), modeli urządzeń ani szczegółów technicznych, których tu nie ma. Nie pisz o oszczędzaniu pieniędzy ani o ekologii, bo tego nie ma w faktach.

## Zasady

- Rzeczowo. Krótkie zdania. Pierwsza osoba.
- Żadnego poetyckiego opisu siebie. Metafory niesie animacja na stronie, nie tekst.
- Żadnego tonu marketingowego ani sprzedażowego, żadnych wezwań do działania typu „napisz do mnie już dziś”.
- Najwyżej jeden suchy żart na historię. Może go nie być.
- Nic prywatnego poza tym, co jest w faktach.
- Nie dopowiadaj motywacji, uczuć ani wniosków, których nie ma w faktach.

## Czego nie pisać (odrzucone wcześniej, jako przykłady tonu)

- „full-stack, od shadera po serwer” (poetycki opis siebie; odrzucone jako głupie)
- „zadam więcej pytań, niż się spodziewasz” (autor nie jest gadatliwy, nie obiecuj rozmów)
- „ręcznie, bez gotowców, jak rzemieślnik” i podobne pozy rzemieślnika
- „wyglądało dobrze na tablicach i do niczego się nie nadawało” (autor nie nazywa swoich prób porażkami)
- zwroty w rodzaju „pasja”, „podróż”, „odkrywanie”, „magia”, „tchnąć życie”, „moja przygoda z…”

## Głos autora (jego własne zdania, dla tonu, nie cytuj ich w tekście)

- „Nie wierzę na słowo: sprawdzam, weryfikuję, analizuję, rozkładam na czynniki pierwsze, zanim coś przyjmę.”
- „Choć czasem kierunki zdają się nie mieć sensu, to zawsze prowadzą do czegoś.”
- „W lekkim chaosie, ale pod kontrolą.”
```

### Runda 2 (poprawka; wysłana razem z briefem i poprzednią wersją)

```markdown
Poprawka. Poniżej brief, potem Twoja poprzednia wersja, potem konkretne błędy. Popraw tylko te miejsca, resztę zostaw. Odpowiedz tylko dwoma tekstami, bez komentarzy.

Błędy:
Drukarka:

1. W „Co z tego zostało” zdania „Przebudowa jest za mną, a drukarka została do konkretnych potrzeb. Nie muszę już zajmować się nią dla samego zajmowania się drukarką.” dopowiadają rzeczy, których nie ma w faktach, i powtarzają poprzednie zdanie. Usuń je albo zastąp czymś wprost z faktów.
   Dom:
2. „To był pierwszy element tej realizacji przy domu. Oprogramowanie pojawiło się później — najpierw była część fizyczna.” to wata i powtórzenie. Skróć.
3. „Tak przeszedłem od fizycznej instalacji do jej programowego ogarnięcia.” i „To był kolejny krok po Home Assistancie.” powtarzają kolejność, którą lista już pokazuje. Usuń.
4. „Mega mi się podobało przejście przez te kolejne etapy” zmienia sens jego słów: podobało mu się całe to przedsięwzięcie, nie „przechodzenie przez etapy”. Użyj „mega mi się podobało” o całości.
5. „Mam działającą realizację” brzmi urzędowo. Napisz prościej, co działa.
6. Bez myślników (—) w tekście.
```
