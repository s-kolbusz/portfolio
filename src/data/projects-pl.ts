import type { PortfolioEntryContent } from './projects-en'

export const projectsPl: Record<string, PortfolioEntryContent> = {
  zakofy: {
    title: 'Zakofy',
    subtitle: 'Prywatne wycieczki z Zakopanego w Tatry',
    tagline:
      'Platforma rezerwacji wycieczek, która zamienia górskie wypady w bezproblemowe przygody door-to-door.',
    pullQuotes: [
      'Zbudowaliśmy silnik rezerwacji, który przypomina planowanie przygody, a nie wypełnianie formularza.',
      'Każda karta wycieczki musiała sprzedać doświadczenie, zanim turysta w ogóle kliknie.',
    ],
    client: 'Freelance',
    role: 'Lead Developer & Designer',
    problem:
      'Klient organizował prywatne wycieczki z Zakopanego w Tatry, na Słowację i do term — ale opierał się wyłącznie na poleceniach i ręcznych rezerwacjach telefonicznych. Nie istniała żadna obecność online, by przechwycić rosnący popyt ze strony międzynarodowych turystów szukających prywatnych doświadczeń w Małopolsce. Konkurencja wyprzedzała ich na każde istotne słowo kluczowe.',
    approach:
      'Zaprojektowałem platformę opartą na treściach, zbudowaną na Next.js i Payload CMS, która pozycjonuje każdą wycieczkę jako doświadczenie premium. Architektura informacji priorytetyzuje odkrywalność: odwiedzający trafiają na bogatą fotografię górską, przeglądają polecane wycieczki przez filtrowalny katalog i docierają do zapytania o rezerwację w mniej niż trzech kliknięciach. Każda strona jest statycznie generowana, zapewniając błyskawiczne ładowanie i silną wydajność SEO.',
    solution:
      'Platforma oferuje dynamiczny katalog wycieczek zasilany przez Payload CMS, umożliwiając klientowi tworzenie, edytowanie i publikowanie wycieczek bez udziału programisty. Każda strona wycieczki zawiera dane strukturalne dla wyników Google, responsywne galerie zdjęć, przejrzystość cenową i jasne CTA. Sekcja „Dlaczego Zakofy?" komunikuje trzy filary — prywatny i elastyczny transport, serwis door-to-door i lokalną ekspertyzę — konwertując przeglądających w zapytania.',
    results:
      'W ciągu trzech miesięcy od uruchomienia ruch z wyszukiwarek wzrósł o ponad 400%, a strona plasowała się na pierwszej stronie dla kluczowych fraz jak „prywatne wycieczki z Zakopanego" i „jednodniowe wycieczki w Tatry." Zintegrowany formularz zapytań zwiększył wolumen leadów 3x w porównaniu do poprzedniego workflow opartego na telefonie.',
  },

  'your-krakow-travel': {
    title: 'Your Krakow Travel',
    subtitle: 'Prywatne wycieczki premium z Krakowa',
    tagline:
      'Wycieczki all-inclusive z odbiorem z hotelu, anglojęzycznymi kierowcami i biletami bez kolejek.',
    pullQuotes: [
      'Najtrudniejszym wyzwaniem projektowym było sprawienie, by 20+ unikalnych wycieczek wyglądało jak jeden spójny produkt.',
    ],
    client: 'Freelance',
    role: 'Lead Developer & Designer',
    problem:
      'Your Krakow Travel oferowało rozległy katalog prywatnych wycieczek jednodniowych z Krakowa — Auschwitz-Birkenau, Kopalnia Soli w Wieliczce, Zakopane, Ojcowski Park Narodowy i więcej — ale ich obecność online była rozproszona po zewnętrznych portalach. Nie posiadali zunifikowanej platformy do prezentacji pełnej oferty, komunikowania propozycji wartości all-inclusive czy przechwytywania bezpośrednich rezerwacji bez prowizji pośredników.',
    approach:
      'Zbudowałem aplikację Next.js z Payload CMS, służącą zarówno jako strona marketingowa, jak i platforma odkrywania wycieczek. Architektura grupuje wycieczki w kategorie tematyczne z filtrowalną nawigacją. Każda strona wycieczki jest indywidualnie zoptymalizowana pod SEO z danymi strukturalnymi, celując w zapytania o wysokim zamiarze zakupowym. Design kładzie nacisk na sygnały zaufania — przejrzystą cenę all-inclusive, jasną logistykę odbioru i dowody społeczne.',
    solution:
      'Platforma oferuje katalog wycieczek oparty na kategoriach z miniaturami, linkującymi do szczegółowych stron z rozbiciem tras, wliczonymi usługami, cenami i CTA rezerwacji. Hero strony głównej wykorzystuje zdjęcia lotnicze Krakowa, by ustanowić pozycjonowanie premium. Sekcja „Dlaczego My?" wyróżnia sześć kluczowych wyróżników: prywatne pojazdy, odbiór door-to-door, anglojęzycznych kierowców, bilety bez kolejek, elastyczne terminy i cenę all-inclusive.',
    results:
      'Bezpośrednie rezerwacje przez stronę stanowią teraz ponad 60% wszystkich zapytań, znacząco redukując zależność od platform zewnętrznych i związanych z nimi prowizji. Strona plasuje się na pierwszej stronie dla wielu konkurencyjnych fraz związanych z wycieczkami na rynku krakowskim.',
  },

  wellezza: {
    title: 'Wellezza',
    subtitle: 'Salon fryzjerski w Wieliczce',
    tagline:
      'Elegancka strona wizytówka salonu, która napędza rezerwacje przez zintegrowane planowanie online.',
    pullQuotes: [
      'Strona salonu musi robić jedną rzecz wyjątkowo dobrze: przekonać ludzi do umówienia wizyty.',
    ],
    client: 'Freelance',
    role: 'Lead Developer & Designer',
    problem:
      'Wellezza to salon fryzjerski w Wieliczce z pełnym pasji, młodym zespołem, ale zerową widocznością online. Opierał się wyłącznie na wizytach bez umówienia i telefonach. Salon potrzebował profesjonalnej obecności w sieci, która zaprezentuje zespół, skomunikuje ofertę usługową z przejrzystym cennikiem i — najważniejsze — napędzi rezerwacje przez zintegrowany system planowania online (Bukka).',
    approach:
      'Zaprojektowałem stronę jednostronicową, która prowadzi odwiedzających przez naturalny przepływ: branding hero → prezentacja zespołu → katalog usług z cenami → kontakt i lokalizacja. Design wykorzystuje elegancką typografię i stonowane kolory, dopasowane do pozycjonowania premium salonu na rynku wielickim. Integracja z zewnętrzną platformą Bukka była kluczowa — CTA „Umów się!" jest wyeksponowane w nawigacji i powtarzane na całej stronie.',
    solution:
      'Strona zawiera sekcję hero z autorskim brandingiem salonu, prezentację zespołu ze zdjęciami stylistek (Agata i Karolina), ustrukturyzowaną tabelę cenową podzieloną na długość włosów (krótkie/średnie/długie), godziny otwarcia i osadzoną mapę Google dla łatwej nawigacji. Integracja z Bukka zapewnia bezproblemowe planowanie wizyt bez konieczności zarządzania własnym systemem rezerwacji.',
    results:
      'Zapytania o rezerwację online znacząco wzrosły po uruchomieniu, redukując zależność salonu od planowania telefonicznego. Strona ładuje się w poniżej 1 sekundy i osiąga wynik Lighthouse powyżej 95. Optymalizacja lokalnego SEO pozycjonuje Wellezza na kluczowe frazy jak „salon fryzjerski Wieliczka."',
  },

  'billboard-zakopane': {
    title: 'Billboard Zakopane',
    subtitle: 'Reklama wielkoformatowa na Podhalu',
    tagline: 'Platforma biznesowa dla reklamy outdoorowej w regionie Zakopanego i Podhala.',
    pullQuotes: [
      'Kiedy twój produkt jest fizycznie ogromny, twoja strona musi być równie odważna.',
    ],
    client: 'Freelance',
    role: 'Lead Developer & Designer',
    problem:
      'Firma „Jodełka" ma ponad 25 lat doświadczenia w branży reklamy billboardowej w regionie Zakopanego i Podhala, ale nie posiadała platformy cyfrowej do prezentacji lokalizacji billboardów, usług czy profesjonalnej wiarygodności. Potencjalni klienci nie mieli możliwości przeglądania dostępnych powierzchni reklamowych ani zrozumienia pełnego zakresu usług — od wynajmu billboardów i druku banerów po budowę niestandardowych konstrukcji reklamowych.',
    approach:
      'Zaprojektowałem profesjonalną platformę biznesową komunikującą autorytet i doświadczenie. Architektura informacji zbudowana jest wokół trzech filarów: historii firmy i zobowiązania do jakości, portfolio usługowego (wynajem, druk, budowa na zamówienie, konsultacje graficzne) oraz zasięgu geograficznego lokalizacji billboardów na Podhalu.',
    solution:
      'Strona zawiera przegląd firmy podkreślający 25+ lat doświadczenia branżowego, sekcję usługową obejmującą wynajem billboardów, druk/montaż banerów, budowę konstrukcji na zamówienie oraz konsultacje projektów graficznych. Interaktywna mapa lokalizacji pokazuje dostępne pozycje billboardów od Klikuszowej po Zakopane. Sekcja kontaktowa oferuje bezpośrednie kanały komunikacji.',
    results:
      'Strona ustanowiła pierwszą profesjonalną obecność cyfrową firmy, umożliwiając potencjalnym reklamodawcom przeglądanie lokalizacji i usług przed nawiązaniem kontaktu. Serwis służy jako narzędzie sprzedażowe aktywnie udostępniane potencjalnym klientom.',
  },

  ready2order: {
    title: 'ready2order',
    subtitle: 'Frontend Engineer — System POS SaaS',
    tagline:
      'Sześć lat budowania skalowalnego oprogramowania POS używanego przez tysiące europejskich firm.',
    pullQuotes: [
      'Zmniejszenie bundla o 50% było momentem największej dumy — to był czysty kunszt inżynierski.',
      'Najlepszy kod, jaki napisałem w ready2order, to kod, który przekonałem zespół do usunięcia.',
    ],
    phases: [
      {
        title: 'Web Designer & Junior Frontend',
        description:
          "Dołączyłem do wiedeńskiego startupu POS, by przekładać wireframe'y i prototypy Figma na produkcyjne interfejsy. Skupiłem się na implementacji pixel-perfect i nauce ekosystemu React w dynamicznym środowisku produktowym.",
        highlights: [
          "Przekładałem wireframe'y i prototypy na responsywne interfejsy użytkownika",
          'Opanowałem React, TypeScript i architekturę komponentową',
          'Uczestniczyłem w planowaniu sprintów, stand-upach i retrospektywach w zespole Agile Scrum',
        ],
      },
      {
        title: 'Frontend Developer',
        description:
          'Przejąłem odpowiedzialność za budowanie pełnych modułów funkcjonalnych. Zbudowałem interfejs CashBook używając React, TypeScript, Apollo GraphQL i Tailwind CSS. Rozszerzałem API backendowe o nowe funkcje frontendowe.',
        highlights: [
          'Zbudowałem responsywne interfejsy jak CashBook z React, TypeScript, Apollo GraphQL i Tailwind CSS',
          'Rozszerzyłem funkcjonalność API używając GraphQL, PHP i MySQL',
          'Pisałem kompleksowe testy z Jest, React Testing Library i Cypress',
          'Prowadziłem przeglądy kodu egzekwując najlepsze praktyki i standardy utrzymywalności',
        ],
      },
      {
        title: 'Senior Frontend Developer',
        description:
          'Skupiłem się na optymalizacji wydajności i ulepszeniach architektonicznych. Osiągnąłem 50% redukcję rozmiaru bundla aplikacji React poprzez optymalizację procesu budowania, bezpośrednio poprawiając czasy ładowania i doświadczenie użytkownika dla tysięcy merchentów w Europie.',
        highlights: [
          'Zredukowałem rozmiar bundla aplikacji React o 50% przez optymalizację procesu budowania',
          'Poprawiłem czasy ładowania i UX dla tysięcy europejskich merchentów',
          'Mentorowałem młodszych developerów i ustanawiałem standardy kodowania',
          'Podejmowałem decyzje architektoniczne dla nowych modułów funkcjonalnych',
        ],
      },
    ],
  },
}
