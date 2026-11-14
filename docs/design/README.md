# docs/design: co jest źródłem prawdy

Czytaj w tej kolejności. Nowszy dokument wygrywa ze starszym.

| Plik                                         | Do czego                                                                       | Status                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `2026-11-14-historia-strony-koncept.md`      | Cel strony, trzy warstwy, akty, definicje i drogi, stany, otwarte pytania.     | Aktualny kierunek.                                                   |
| `2026-11-14-lusion-przepis.md`               | Zasady ruchu i ciągłości wyciągnięte z Lusion.                                 | Aktualne.                                                            |
| `2026-11-14-otwarcie-diagnoza-telefon.md`    | Diagnoza otwarcia na telefonie i plan A, B, C.                                 | Aktualne, plan czeka na akceptację.                                  |
| `2026-11-14-jak-pracuje-z-agentami-szkic.md` | Szkic treści podstrony „Jak pracuję z agentami” i lista zdań do potwierdzenia. | Treść zatwierdzona 15.11; wsad do budowy.                            |
| `2026-11-15-how-i-work-with-agents-en.md`    | Angielska wersja tekstu podstrony „Jak pracuję z agentami”.                    | Tłumaczenie do przeczytania przez właściciela; polski tekst wygrywa. |
| `2026-09-24-redesign-decyzje.md`             | Tożsamość, podział marek, ceny, kontakt, SEO/GEO.                              | Obowiązuje tam, gdzie koncept z 14.11 nie mówi inaczej.              |
| `2026-09-25-*-scenariusz.md`                 | Scenariusze hero i sceny sygnaturowej.                                         | Opisują to, co zbudowane.                                            |
| `2026-09-20…21-*.md`                         | Sesja GPT.                                                                     | ZASTĄPIONE; ustalenia audytu A1–A9 nadal ważne.                      |

## Jak pracujemy nad redesignem

- Redesign żyje na gałęzi `redesign/decyzje` (PR #20) i wychodzi na produkcję dopiero w całości.
- Jedna sesja nadzoruje kierunek. Konkretne rzeczy (jedna podstrona, jeden etap) robią osobne, małe sesje,
  które startują z tych plików, a nie z historii rozmów.
- Mała sesja kończy pracę wpisem do właściwego dokumentu. Ustalenia zostają w plikach, nie w rozmowie.
- Prototypy tylko w prawdziwym kodzie. Tekst rzeczowy. Otwarte pytania o właściciela zastępujemy
  propozycjami do poprawienia.
