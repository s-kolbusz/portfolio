import type { WorkItemContent, WorkItemId } from './work-items'

export const workItemsPl = {
  zakofy: {
    title: 'Zakofy',
    subtitle: 'System rezerwacyjny klasy Premium',
    tagline:
      'Nowoczesny system rezerwacji dla turystyki górskiej, zaprojektowany z myślą o maksymalnej konwersji.',
    pullQuotes: [
      'Zbudowaliśmy system, który sprawia, że planowanie wycieczki jest początkiem przygody, a nie formalnością.',
      'Każda karta wycieczki sprzedaje emocje jeszcze przed pierwszym kliknięciem.',
    ],
    client: 'Freelance',
    role: 'Główny Architekt i Projektant',
    problem:
      'Klient polegał wyłącznie na rezerwacjach telefonicznych, tracąc potencjał płynący z rosnącej liczby turystów zagranicznych szukających prywatnych wypraw w Tatry. Brak widoczności w sieci sprawiał, że rynek przejmowała konkurencja z lepszym zapleczem cyfrowym.',
    approach:
      'Zaprojektowałem platformę nastawioną na wydajność, wykorzystując Next.js oraz Payload CMS. Pozycjonuje ona każdą wyprawę jako unikalne doświadczenie premium. Architektura skupia się na natychmiastowej odkrywalności i budowaniu więzi emocjonalnej poprzez wysokiej jakości fotografię i uproszczony proces zapytania.',
    solution:
      'System oferuje dynamiczny, zoptymalizowany pod SEO katalog wypraw z możliwością błyskawicznej aktualizacji treści. Wdrożyłem dane strukturalne dla wyników wyszukiwania oraz sekcję „Highland Advantage”, budującą zaufanie. Strona generowana statycznie zapewnia czas ładowania poniżej sekundy, co jest kluczowe dla użytkowników mobilnych.',
    results:
      'W ciągu 90 dni od wdrożenia ruch organiczny wzrósł o 400%. Zintegrowany system pozyskiwania leadów zwiększył liczbę zapytań 3-krotnie w stosunku do wcześniejszego modelu, przy współczynniku odrzuceń na mobile poniżej 30%.',
  },

  'your-krakow-travel': {
    title: 'Your Krakow Travel',
    subtitle: 'Zintegrowana Platforma Odkrywania Wycieczek',
    tagline:
      'Skuteczna platforma rezerwacji bezpośrednich, konsolidująca rozproszoną ofertę wycieczek premium.',
    pullQuotes: [
      'Wyzwanie polegało na połączeniu ponad 20 unikalnych wypraw w jeden spójny produkt klasy premium.',
    ],
    client: 'Freelance',
    role: 'Główny Architekt i Projektant',
    problem:
      'Dostawca oferował bogaty katalog wycieczek, ale brakowało mu centralnej platformy. Oferta rozproszona na portalach zewnętrznych (OTA) generowała wysokie prowizje i utrudniała budowanie silnej marki all-inclusive.',
    approach:
      'Zbudowałem zunifikowaną platformę na Next.js, zaprojektowaną z myślą o skalowaniu. Architektura kategoryzuje złożoną ofertę w intuicyjne grupy, redukując obciążenie poznawcze użytkownika. SEO celuje w zapytania o wysokiej intencji zakupowej poprzez dedykowane strony landing page.',
    solution:
      'Wdrożyłem katalog zasilany elastycznym systemem CMS. Zintegrowana „Architektura Zaufania” wyróżnia kluczowe przewagi — jak prywatny transport i przejrzyste ceny — eliminując obiekcje rezerwacyjne już przy pierwszym kontakcie.',
    results:
      'Rezerwacje bezpośrednie stanowią obecnie ponad 60% przychodów, drastycznie zmniejszając zależność od pośredników. Platforma zdominowała wyniki wyszukiwania dla wielu konkurencyjnych fraz, a średni czas sesji przekracza 3 minuty.',
  },

  wellezza: {
    title: 'Wellezza',
    subtitle: 'Cyfrowa Tożsamość Salonu Premium',
    tagline:
      'Elegancki design i płynny system rezerwacji online, które zmodernizowały wizerunek renomowanego salonu.',
    pullQuotes: [
      'Strona salonu musi robić jedną rzecz perfekcyjnie: sprowadzać klientów prosto na fotel.',
    ],
    client: 'Freelance',
    role: 'Lead Developer i Projektant',
    problem:
      'Mimo posiadania zespołu topowych stylistów, salon nie posiadał profesjonalnej wizytówki online. Poleganie wyłącznie na telefonach ograniczało potencjał rozwoju i utrudniało komunikację oferty premium.',
    approach:
      'Zaprojektowałem skuteczną stronę typu Single Page, która przenosi elegancję salonu do sieci. Przepływ użytkownika prowadzi od wizualnej inspiracji do działania, eksponując przycisk rezerwacji na każdym etapie przeglądania.',
    solution:
      'Stworzyłem frontend zintegrowany z systemem Bukka, zapewniając bezproblemowe zapisy 24/7. Strona posiada ustrukturyzowany cennik i jest w pełni responsywna, osiągając wynik wydajności Lighthouse powyżej 95.',
    results:
      'Zapisy online stały się głównym kanałem rezerwacji już w pierwszym miesiącu. Działania Local SEO zapewniły topowe pozycje na frazę „salon fryzjerski Wieliczka”, budując pozycję lokalnego lidera.',
  },

  'billboard-zakopane': {
    title: 'Billboard Zakopane',
    subtitle: 'Platforma B2B Reklamy Zewnętrznej',
    tagline:
      'Interaktywny katalog lokalizacji i profesjonalny design, które zrewolucjonizowały sprzedaż reklam regionalnych.',
    pullQuotes: [
      'Kiedy Twój produkt jest fizycznie ogromny, Twoja obecność cyfrowa musi być równie odważna.',
    ],
    client: 'Freelance',
    role: 'Główny Architekt i Projektant',
    problem:
      'Lider branży z 25-letnim stażem nie posiadał narzędzia do prezentacji swoich zasobów. Sprzedaż opierała się na wizjach lokalnych i statycznych mapach, co znacząco wydłużało proces decyzyjny klientów.',
    approach:
      'Zaprojektowałem platformę B2B, która komunikuje wieloletnie doświadczenie firmy. Design wykorzystuje wysoki kontrast i odważną typografię, priorytetyzując interaktywny wykaz dostępnych powierzchni.',
    solution:
      'Zintegrowałem mapę regionu Podhala, pozwalającą reklamodawcom filtrować i sprawdzać parametry konstrukcji w czasie rzeczywistym. Stworzyłem uproszczony kanał kontaktu, dostarczający komplet specyfikacji technicznych.',
    results:
      'Platforma stała się kluczowym narzędziem sprzedażowym, eliminując potrzebę wstępnych wizyt w terenie. Firma zyskała wiarygodne aktywo wspierające negocjacje z dużymi markami spoza regionu.',
  },

  ready2order: {
    title: 'ready2order',
    subtitle: 'Senior Frontend Engineer — Systemy Enterprise POS',
    tagline:
      'Optymalizacja i skalowanie oprogramowania POS używanego przez ponad 10 000 firm w Europie.',
    pullQuotes: [
      'Zredukowanie rozmiaru aplikacji web o 50% to czysty kunszt inżynierski i jeden z moich kluczowych sukcesów.',
      'Najwartościowszy kod, jaki napisałem, to ten, do którego usunięcia przekonałem zespół.',
    ],
    phases: [
      {
        title: 'Lead Frontend Innovation',
        description:
          'Kierowanie usprawnieniami architektonicznymi i optymalizacją wydajności głównego produktu React. Specjalizacja w redukcji rozmiaru paczek aplikacji i poprawie czasu interaktywności dla urządzeń o niskiej mocy obliczeniowej.',
        highlights: [
          'Osiągnięcie 50% redukcji rozmiaru aplikacji React dzięki zaawansowanej optymalizacji build-pipe',
          'Architektura responsywnych, modułowych interfejsów dla spójności między różnymi systemami',
          'Mentoring zespołów inżynierskich w zakresie wzorców React, testowania i czystego kodu',
          'Rozbudowa złożonych API backendowych (GraphQL) dla wsparcia funkcji o wysokim obciążeniu',
        ],
      },
    ],
  },
} satisfies Record<WorkItemId, WorkItemContent>
