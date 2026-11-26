# Lusion: przepis na wrażenie (analiza klatka po klatce)

Data: 2026-11-14 · Źródło: lusion.co oglądane w przeglądarce, telefon 375×812 i desktop 1440×900.
Cel: wyciągnąć **zasady**, nie wygląd. Kopia Lusion zabiłaby duszę kolbusz.xyz tak samo jak studia z 21.09.
Uzupełnia diagnozę: `2026-11-14-otwarcie-diagnoza-telefon.md`.

**Ograniczenia pomiaru:** klatki co kilka procent przewijania (nie 60 kl./s), scroll kółkiem w emulacji
telefonu, nie prawdziwym palcem. Czasów scen WebGL nie da się odczytać z zewnątrz; odczytane są tylko
czasy przejść w CSS.

## 1. Sekwencja na telefonie

| #   | Moment          | Co się dzieje                                                                                                                                                    | Na co patrzy oko                              |
| --- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| 1   | Ładowanie       | Czarny ekran, licznik 000→100 w rogu, znak marki buduje się kreska po kresce w środku.                                                                           | Jeden punkt w środku.                         |
| 2   | Hero            | Nagłówek u góry, pod nim karta 3D (fizyczne bryły w ruchu) na ok. 75% wysokości telefonu, znaczniki „+” w rogach, „scroll to explore”.                           | Karta. Reszta jest mała i stoi.               |
| 3   | Pierwszy scroll | Karta odjeżdża wolniej, wjeżdża wielki nagłówek linia po linii. Bryły w karcie kręcą się dalej.                                                                  | Z karty na nagłówek.                          |
| 4   | Wstęga          | Niebieska wstęga 3D przecina nagłówek i znika w dół.                                                                                                             | Prowadzi oko do następnego miejsca.           |
| 5   | Reel            | Pomarańczowa karta rośnie prawie do pełnej szerokości, nad i pod nią pasek „play reel” jedzie w poprzek.                                                         | Karta; ruch w poprzek zaprasza do kliknięcia. |
| 6   | Lista prac      | Zwykłe, spokojne karty na całą szerokość.                                                                                                                        | Oddech po spektaklu.                          |
| 7   | Drugi nagłówek  | Wielki tekst, druga (jasna) wstęga.                                                                                                                              | Nagłówek.                                     |
| 8   | Ekran w ekranie | Kadr z astronautą w ramce **rośnie do pełnego ekranu**: wchodzimy do środka ramki.                                                                               | Kadr.                                         |
| 9   | Głębia          | Astronauta odpływa, zdanie w środku rozsuwa się słowo po słowie na szerokość ekranu.                                                                             | Postać i zdanie razem.                        |
| 10  | Tunel           | Astronauta wpada w kryształowy tunel, obraz jaśnieje do bieli.                                                                                                   | Środek tunelu. Kulminacja.                    |
| 11  | Wezwanie        | Czarna przestrzeń z unoszącymi się przedmiotami, wielkie „Let's work together!”, „continue to scroll”.                                                           | Wezwanie do kontaktu.                         |
| 12  | Stopka          | Biała stopka nasuwa się na przytrzymaną scenę.                                                                                                                   | Newsletter i kontakt.                         |
| 13  | Następna strona | Ciemny pasek „keep scrolling / About us / next page” z linią postępu. Linia rośnie tylko przy dalszym przewijaniu i **sprężynuje z powrotem**, gdy przestaniesz. | Linia postępu.                                |

Desktop ma tę samą sekwencję, ułożoną poziomo. **Telefon niczego nie traci:** dostaje ten sam pomysł,
skomponowany pod pion (karty prawie na cały ekran, kulminacja od krawędzi do krawędzi).

## 2. Przepis: zasady

1. **Jedna podróż, jedna kamera.** Ładowanie, karta, ramka, świat, tunel, kosmos, stopka i następna strona to
   jedna droga. Do następnej sceny się **wchodzi** (kamera wjeżdża w ramkę), a nie przechodzi przez cięcie.
   Zmienia się skala i głębia, nigdy nie ma pustego przejścia.
2. **Ramka jako drzwi.** Najmocniejszy moment to rzecz w ramce, która rośnie do całego ekranu i staje się
   światem. Na telefonie dzieje się to od krawędzi do krawędzi.
3. **Jeden punkt uwagi naraz.** W każdej klatce rusza się jedna główna rzecz. Reszta (znaczniki w rogach,
   drobne etykiety, przycisk menu) jest mała i stoi.
4. **Nici prowadzące.** Między punktami uwagi oko prowadzi ruchomy łącznik: wstęgi przecinające sekcje,
   paski tekstu jadące w poprzek. Dzięki nim oko nie skacze, tylko płynie.
5. **Rytm napięcia i oddechu.** Spektakl (hero), oddech (lista prac), spektakl (ekran, tunel), oddech
   (stopka). Spokojne sekcje są celowo zwykłe, żeby następny spektakl znów zadziałał.
6. **Szczyt tuż przed końcem, a koniec to drzwi.** Największa scena (tunel) prowadzi prosto do wezwania do
   kontaktu. Strona nie kończy się stopką, tylko przejściem dalej, które wymaga chęci: trzeba dalej
   przewijać, inaczej sprężyna cofa.
7. **Tempo ustala strona.** Scroll jest wirtualny i wygładzony: mały ruch daje mały krok, scena dostaje tyle
   czasu, ile potrzebuje. Nie da się „przelecieć” kulminacji.
8. **Telefon = ten sam pomysł, inna kompozycja.** Pion, karty prawie na cały ekran, nic nie odjęte.
9. **Jeden słownik ruchu.** Przejścia interfejsu 0,2–0,6 s, jedna rodzina krzywych „szybki start, długie
   wybrzmienie” (`cubic-bezier(0.35, 0, 0, 1)` i `(0.4, 0, 0.1, 1)`). Sceny są przypięte do pozycji scrolla.
10. **Ładowanie to pierwsza scena.** Buduje znak marki w punkcie, w którym potem zaczyna się hero.
11. **Tekst jest w DOM.** Wizualnie wszystko jest WebGL, ale tekst da się przeczytać jako tekst (tak jak
    nasza zasada SSR).

## 3. Co z tego wynika dla naszego otwarcia

| Zasada                                           | Co mamy dziś (z diagnozy)                                                     | Co zrobić                                                                                                                                              |
| ------------------------------------------------ | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2, 8: ramka jako drzwi, pełny ekran na telefonie | Kulminacja to miniatura: 20% ekranu telefonu.                                 | Propozycja **A** z diagnozy (pionowy zrzut wynurza się na cały ekran, potem krzepnie w kartę). Lusion potwierdza ten kierunek.                         |
| 7: tempo ustala strona                           | Jedno machnięcie zjada otwarcie w 1,5 s.                                      | Propozycja **B** (bramki na dotyku, limit prędkości historii).                                                                                         |
| 4, 6: nić prowadząca, koniec to drzwi            | Kulka znika po scenie; wyjście to prosta krawędź i cięcie do kremowej sekcji. | Propozycja **C**, ale mocniej: **kulka to nasza wstęga.** Zostaje z użytkownikiem przez całą stronę i prowadzi oko do każdego następnego punktu uwagi. |
| 1: jedna kamera, wejście zamiast cięcia          | Po wjeździe w literę jest martwa, płaska zieleń (ok. 0,3 ekranu).             | Kamera nie staje: tafla faluje już w końcówce wjazdu (część C).                                                                                        |
| 10: ładowanie to pierwsza scena                  | Imię pisze się samo, blob pojawia się 2 s później.                            | **Nowe:** imię i blob rodzą się razem, jako jedno zdarzenie, w punkcie, z którego startuje hero.                                                       |
| 9: jeden słownik ruchu                           | Trzy rodziny krzywych i jeden etap na czas.                                   | Jedna rodzina (`glide`) dla całej historii (część B); w interfejsie jedna krzywa ease-out z długim wybrzmieniem.                                       |
| 3: jeden punkt uwagi                             | Kulka i zrzut konkurują; odczyty nieczytelne.                                 | Kulka gaśnie nad zrzutem albo prowadzi do niego, nigdy obok. Odczyty większe albo wcale na telefonie.                                                  |
| 5: rytm                                          | Otwarcie to 4,5 ekranu spektaklu, potem nagle zwykła sekcja.                  | Należy do etapu strony głównej (SEB-67): po otwarciu celowy oddech, potem następny moment.                                                             |

## 4. Czego nie bierzemy

- Brył 3D, astronauty, tunelu, wstęg w ich kolorach i ich typografii. Mamy własny materiał: płaski,
  rozmyty blob i zieleń `--primary-rgb`.
- Długiego ładowania z licznikiem. U nich to marka studia 3D, u nas byłoby opóźnieniem treści.
