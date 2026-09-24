# kolbusz.xyz: decyzje redesignu

Data: 2026-09-24
Status: **źródło prawdy.** Zastępuje dokumenty z 2026-09-20/21 w tym katalogu
(brief, audyt, roadmapa, sitemapa, visual reset), które zostają jako archiwum.
Zadania: Linear `SEB`, projekt `kolbusz`. Myśli poboczne: [MYS-6](https://linear.app/sklbsz/issue/MYS-6)
(repozycjonowanie stronypodhale), [MYS-7](https://linear.app/sklbsz/issue/MYS-7) (porządek w Linear).

## Dlaczego poprzednia próba upadła

Sesja z 20–21.09 dała trafny audyt (problemy A1–A9 nadal obowiązują jako lista
usterek), ale redesign zabił duszę strony z czterech powodów:

1. Każda decyzja była odejmowaniem (skróć, przenieś, ogranicz), a ruch traktowano
   jako ryzyko dla konwersji.
2. Dusza była listą składników, a nie ideą, więc składniki podmieniono na podobne.
3. Studia wizualne powstały w osobnym HTML zamiast w prawdziwym kodzie.
4. Pozycjonowanie przesunęło się po cichu, bez decyzji.

## Cel

Wzmocnić spektakl i naprawić tylko to, co blokuje drogę do pracy i do kontaktu.
Dla klienta premium i agencji animacje **są dowodem umiejętności**, a nie
przeszkodą w sprzedaży.

- Odbiorca główny: klienci premium i agencje (projekty autorskie, współpraca).
- Odbiorca drugi: etat lub kontrakt senior.

## Oś i prawa ruchu

- **Oś strony: Fluid → Solid.** Płynna materia (blob) krzepnie w konkretne
  realizacje. Metafora jest pokazana ruchem i kompozycją, **nie tekstem**.
- **Prawo ruchu:** ruch = płynne, spoczynek = stałe. Im szybciej coś się porusza
  (scroll, kursor, dock), tym bardziej się rozlewa. Po zatrzymaniu krzepnie.
- **Parallaxa: 4 plany głębi** na całej stronie. Prędkości do strojenia w prototypie.
  1. Tło (~0.3×): rozmyte kadry, ślady bloba.
  2. Treść (1×): obrazy i tytuły, z parallaxą obrazu wewnątrz maski.
  3. Pierwszy plan (~1.2–1.4×): metadane w monospace, numery, znaczniki techniczne.
  4. Blob i kursor: poza siatką, sterowane fizyką.
- Reduced motion: te same treści, przejścia bez morfingu i parallaxy.

## Tożsamość (bez zmian, chronione)

Zielony blob WebGL (materiał, zachowanie, `--primary-rgb` shadera), obecne tokeny
kolorów w obu motywach, typografia serif / sans / mono, kursor, szklany dock,
dwie wersje językowe (PL, EN).

- Etykieta zawodowa: **Creative Developer · Full-stack Engineer**. „Web Architect”
  i „Specjalista tworzenia stron” znikają.
- Copy rzeczowe, krótkie, sprawdzalne. Bez poetyckich opisów siebie.

## Podział marek

Oś główna to **produkt kontra projekt autorski**. Rola (kierunek/inżynieria kontra
wykonanie/infrastruktura) jest osią pomocniczą, a typ klienta decyduje dopiero w ostateczności.

| | kolbusz.xyz | stronypodhale.pl |
|---|---|---|
| Czym jest | projekt autorski, kierunek, ruch/WebGL, full-stack, agencje, etat | produkt w progach, jawny cennik, hosting i opieka |
| Frazy SEO | creative developer, animowane strony, WebGL/GSAP, Next.js, Payload, frontend dla agencji (PL + EN) | wszystkie frazy lokalne i produktowe |

- Piczura: kierunek kreatywny robi kolbusz, infrastrukturę stronypodhale.
- Zdanie „małym firmom robię taniej pod osobną marką” znika. Zamiast niego:
  „potrzebujesz sprawdzonej strony z jawnym cennikiem → stronypodhale.pl”.

## Realizacje lokalne (scalenie decyzji z lipca i z 24.09)

- Podstrony `/{pl,en}/projects/{zakofy,your-krakow-travel,wellezza,billboard-zakopane}`
  znikają z kolbusz, z 301 do stronypodhale (SEB-20, SEB-21). Nie ma duplikatów treści.
- Te realizacje zostają w opowieści: case study stronypodhale ma sekcję
  „Realizacje” z wszystkimi czterema (kadr, 1–2 zdania, link wychodzący). Zakofy
  pokazuje, jak daleko sięga produkt (Payload CMS, własna analityka).

## Mapa strony

Główne pozycje: **Praca · O mnie · Kontakt.** Drugorzędne: Usługi · Lab · CV.

```
/                 strona główna
/projects         katalog (etykieta „Praca”)
/projects/{slug}  stronypodhale, ready2order, payload-plugin-aspect-preview
/about            nowa
/services         przebudowa
/contact          nowa
/lab              nowa
/lab/3d-printing  kalkulator (przeniesiony bez zmian w logice)
/cv               bez zmian w treści, wspólna nawigacja
```

`/#calculator` zostaje jako krótki mostek do `/lab/3d-printing`. `/design`
wypada z publicznej sitemapy.

## Strona główna

1. **Hero (fluid):** blob, imię, etykieta zawodowa, jedno rzeczowe zdanie oferty.
2. **Przejście sygnaturowe:** shader płynnie przechodzi z metaballi w zaokrąglony
   prostokąt, który trafia dokładnie w ramkę pierwszej sceny. Potem crossfade do
   obrazu DOM. Canvas śpi poza kadrem, na telefonie jest wersja uproszczona.
3. **Trzy sceny (solid):** stronypodhale (produkt i biznes), ready2order (skala,
   zespół, opisane jako praca etatowa), payload-plugin-aspect-preview (open source,
   npm, powstał dla Zakofy i YKT).
4. **Teaser Piczury „w realizacji”:** bez case study, dopóki nie jest gotowa. Po premierze pozycja nr 1.
5. **Jak pracuję:** trzy linie oferty, link do /services.
6. **Kim jestem:** krótko, link do /about i CV.
7. **Kontakt:** blob wraca spokojniejszy, formularz, progi, e-mail.

## Katalog `/projects` (B+)

Indeks typograficzny w miejsce książki.

- Tytuły szeryfem, metadane mono (rok, rola, typ).
- Scroll z bezwładnością cieczy: tytuły rozciągają się i skręcają proporcjonalnie
  do prędkości, a na postoju zastygają.
- Podgląd wylewa się z kursora: sprężyna, displacement WebGL w ruchu, wyostrzenie
  na postoju, przelewanie między projektami.
- Wiersze wynurzają się z zielonej cieczy, w tle dryfuje plan rozmytych kadrów.
- Klik: ramka rozlewa się i krzepnie w hero case'a (shared element / View Transitions).
- Dotyk i klawiatura: obraz ożywa w wierszu przy środku ekranu lub przy fokusie.
  Tryb kursora rozpoznajemy po `pointer: fine`, nie po szerokości ekranu.
- Wpis stronypodhale rozwija się w podwiersze z czterema realizacjami, które prowadzą do kotwic w jego case study.

## Case study

Wspólny szkielet:
1. Hero przejęte z katalogu lub strony głównej, metadane mono (rola, rok, typ, stack).
2. 2–3 decyzje: obraz lub interakcja naprzemiennie z 1–3 zdaniami.
3. Dowód: link na żywo, sprawdzalne dane, cytat klienta. Bez niezweryfikowanych liczb.
4. FAQ.
5. Zakończenie: zaproszenie do kontaktu (ścieżka wypełniona automatycznie), a potem następny projekt.

Moment sygnaturowy, po jednym na case:
- **aspect-preview:** działające demo na stronie (punkt ostrości i kadry w 6 proporcjach, na żywo).
- **stronypodhale:** wizualizacja pipeline'u (bramy jakości), strona krzepnie w realizację.
- **ready2order:** do ustalenia po sprawdzeniu, co można pokazać (NDA).

Przyciski „Back” znikają. Zamiast nich jest stały link „← Wszystkie projekty”.

## Nawigacja

Szklany dock na **każdej** stronie, w tym samym miejscu. Etykiety tekstowe w mono
dla pozycji głównych, pozycje drugorzędne w „więcej” albo po separatorze. Motyw
i język jako dyskretne narzędzia. Dock podlega prawu ruchu. Aktywna pozycja to
kropla zieleni, która przepływa między pozycjami.

## Oferta i ceny

Bez pakietów. Trzy linie, każda z progiem „od”. Kwoty netto. Każda wersja językowa mówi
wprost, do jakiego rynku jest kierowana (PL: „dla klientów w Polsce, ceny w PLN”,
EN: „for international clients, prices in EUR”).

| Linia | PL | EN |
|---|---|---|
| Współpraca z agencją | od 1 000 zł / dzień | od €600 / dzień |
| Projekt autorski | od 15 000 zł | od €6 000 |
| Produkty i Payload | od 20 000 zł lub po rozmowie | od €8 000 lub on request |

Podstawy (wrzesień 2026):
- fullstack mid B2B w PL to ~18–22,7 tys. zł/mies., czyli ~850–1100 zł/dzień;
- software house bierze za dedykowaną stronę 15–40 tys. zł netto;
- Europa Zachodnia płaci fullstackom €75–120/h, a za dzień mid–senior €600–960.

Źródła: Just Join IT 2026, Webtom, Lancebase, Arc.dev.

Progi to podłoga. Oferujesz pełny zakres łącznie z infrastrukturą i masz profil
senior, więc realne wyceny powinny lądować wyżej.

Ścieżka etat/kontrakt: CV i kontakt, bez widełek.

## Kontakt

- Opcjonalny wybór ścieżki: projekt autorski / agencja / produkt-Payload /
  etat-kontrakt / wydruk 3D. Wejście z case'a, /services lub /lab wypełnia go
  automatycznie (edytowalnie).
- Pola: imię, e-mail i opis są obowiązkowe, budżet i termin opcjonalne. Przy etacie znika pole budżetu.
- Łagodny filtr: przy budżecie poniżej progu pojawia się informacja o stronypodhale.pl, ale wysłanie nadal jest możliwe.
- E-mail jest widoczny obok formularza, social media trafiają do stopki.
- Blob wraca spokojniejszy i po wysłaniu krzepnie w potwierdzenie.
- Stany: pusty, walidacja, wysyłanie, sukces, błąd dostarczenia (z zachowaniem treści i e-mailem jako alternatywą).
- Kanał wysyłki wybieramy przy implementacji, po sprawdzeniu hostingu.
- Na przyszłość: LimnoScope jako odbiorca zapytań, gdy dojrzeje. To nie jest zobowiązanie.

## /about

Rzeczowo: kim jestem (2–3 zdania), co robię, jak pracuję (proces bez filozofii),
oś czasu doświadczenia, stack w jednym miejscu, FAQ, kontakt. **Prawdziwe zdjęcie
portretowe w chłodnej obróbce** (lekko odbarwione, zielony akcent światła).
Akapity „Strategia rozwoju” ze strony głównej trafiają tutaj, przepisane pod nowe
terytorium SEO.

## /lab

Galeria eksperymentów z najmocniejszym ruchem i luźniejszym layoutem.
- Na start: interaktywny blob (suwaki lepkości, koloru i siły kursora) oraz druk 3D.
- **Druk 3D to realna usługa.** Kalkulator zostaje, a zapytanie idzie przez
  formularz kontaktu ze ścieżką „wydruk 3D”.
- Explorer i LimnoScope trafią tu, gdy dojrzeją.

## SEO i GEO: zasady projektowania treści

1. Cały tekst jest w HTML z SSR. Animacja tylko przekształca istniejącą treść,
   canvas i WebGL są zawsze `aria-hidden`.
2. FAQ na /services, /about i w każdym case study, z `FAQPage` w JSON-LD.
3. Encje:
   - `Person` (`jobTitle`: Creative Developer; `sameAs`: GitHub, npm, LinkedIn),
   - stronypodhale jako `Organization` założona przez Person,
   - plugin jako `SoftwareSourceCode`,
   - case'y jako `CreativeWork`.
4. Treść cytowalna: krótkie akapity z konkretnymi, sprawdzalnymi faktami.
5. Tytuł i opis strony głównej przestają celować w „strony internetowe Zakopane”.
6. `llms.txt` aktualizowany razem z treścią.

Docelowa odpowiedź AI na pytanie „kim jest Sebastian Kolbusz”: *Creative Developer
i full-stack engineer z Zakopanego, autor payload-plugin-aspect-preview, twórca
stronypodhale.pl, wcześniej ready2order.*

## Sposób realizacji

- **Zero makiet poza kodem.** Prototypy powstają na gałęziach w prawdziwym repo, z prawdziwym blobem, tokenami i fontami.
- Najpierw największe ryzyko, czyli przejście sygnaturowe.
- Każdy krok da się wdrożyć osobno, a strona działa przez cały czas.
- Kryteria akceptacji każdego kroku:
  - widoki 390×844, 1024×768, 1440×900, 1920×1080 i 3440×1440, plus szerokości pośrednie,
  - PL i EN,
  - oba motywy,
  - dotyk, klawiatura, reduced motion,
  - brak regresji wydajności względem stanu obecnego.
- Snapshoty wizualne generujemy na Linuksie (workflow w GitHub Actions).

Kolejność:
1. przejście sygnaturowe,
2. prawo ruchu i plany parallaxy,
3. dock,
4. fundament SEO/GEO,
5. strona główna,
6. katalog,
7. szablon case study i demo aspect-preview,
8. /services i /contact,
9. /about,
10. /lab,
11. case stronypodhale i ready2order.

## Otwarte do etapu treści

- ready2order: co można pokazać (NDA), realny zakres roli.
- Cytaty klientów i sprawdzalne dane do case'ów.
- Sesja zdjęciowa do /about.
- Termin premiery Piczury, który zdecyduje o pozycji nr 1.
