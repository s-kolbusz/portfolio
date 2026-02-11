import { CVData } from './cv'

export const cvDataPl: CVData = {
  name: 'Sebastian Kolbusz',
  title: 'Frontend Engineer',
  contact: {
    email: 's.kolbusz@outlook.com',
    phone: '+48 533 542 880',
    location: 'Zakopane, Polska',
    linkedin: 'https://www.linkedin.com/in/skolbusz',
  },
  summary:
    'Jestem Frontend Software Engineerem, który lubi pracować z React, TypeScript, GraphQL i TailwindCSS. Budowałem moduły funkcjonalne od podstaw i zwiększałem funkcjonalność aplikacji poprzez rozszerzanie API oraz pisanie solidnych testów przy użyciu Jest i Cypress. Jednym z moich największych osiągnięć było zmniejszenie rozmiaru aplikacji o połowę i przyspieszenie czasu ładowania poprzez przebudowę procesu budowania. Pasjonuję się pisaniem czystego kodu wysokiej jakości i przestrzeganiem najlepszych praktyk. Dobrze odnajduję się w zespołach Scrum Agile i swobodnie zarządzam projektami w JIRA, dbając o płynny przebieg prac.',
  experience: [
    {
      company: 'Ready2Order',
      title: 'Frontend Engineer',
      location: 'Wiedeń',
      period: '08/2019 – 12/2025',
      description:
        'Rozwój i utrzymanie wiodącego systemu POS używanego przez tysiące firm w całej Europie.',
      highlights: [
        '50% mniejszy bundle aplikacji ReactJS -> Zredukowany czas ładowania i lepsze wrażenia użytkownika',
        'Rozwój responsywnych interfejsów, takich jak CashBook -> Użycie ReactJS z TypeScript, Apollo GraphQL i TailwindCSS',
        'Ulepszona funkcjonalność aplikacji -> Rozszerzenie API GraphQL/PHP/MySQL',
        'Utrzymanie jakości kodu -> Prowadzenie code review wymuszających najlepsze praktyki i łatwość utrzymania',
        'Zapewnienie niezawodności funkcji -> Pisanie testów w Jest, React-Testing-Library i Cypress',
        'Udział w postępach zespołu -> Uczestnictwo w stand-upach, planowaniu sprintów i retrospektywach',
        'Dokładne wdrożenie UI -> Tłumaczenie makiet i prototypów na interfejs użytkownika',
      ],
    },
    {
      company: 'Freelance',
      title: 'Frontend Engineer',
      location: 'Zakopane, Polska',
      period: '2016 – Obecnie',
      description:
        'Realizacja dedykowanych projektów webowych i aplikacji SaaS. Specjalizacja w Next.js, optymalizacji wydajności i SEO.',
      highlights: [
        'Uruchomienie stron internetowych dla małych firm, w tym: zakofy.com, yourkrakowtravel.com, wellezza.pl, billboardzakopane.pl',
        'Poprawa użyteczności prywatnej platformy rezerwacyjnej poprzez stworzenie nowych komponentów wyszukiwania i modułu wstępnej rezerwacji',
        'Zwiększenie zaangażowania użytkowników poprzez integrację informacji o cenach w wynikach wyszukiwania',
        'Projektowanie makiet aplikacji i tworzenie prototypów w AdobeXD dla narzędzia do dawkowania leków i aplikacji do treningu pamięci',
      ],
    },
  ],
  education: [
    {
      school: 'Uniwersytet Ekonomiczny',
      degree: 'Inżynieria Oprogramowania | Licencjat z Informatyki Stosowanej',
      location: 'Kraków',
      period: '09/2016 – 09/2019',
      highlights: [
        'Członek Koła Naukowego Informatyki (KNI)',
        'Autor strony internetowej Koła KNI w latach 2016-2019',
      ],
    },
  ],
  skills: [
    {
      category: 'Stos Technologiczny',
      items: [
        'React',
        'Next.js',
        'TypeScript',
        'Tailwind CSS',
        'Framer Motion',
        'Node.js',
        'Payload CMS',
      ],
    },
    {
      category: 'Bazy Danych i API',
      items: ['PostgreSQL', 'MongoDB', 'REST APIs', 'GraphQL'],
    },
    {
      category: 'Narzędzia i Testowanie',
      items: ['Jest', 'Cypress', 'JIRA', 'Git', 'Docker'],
    },
  ],
  languages: [
    { language: 'Polski', level: 'Ojczysty' },
    { language: 'Angielski', level: 'Biegły' },
    { language: 'Niemiecki', level: 'Podstawowy' },
  ],
}
