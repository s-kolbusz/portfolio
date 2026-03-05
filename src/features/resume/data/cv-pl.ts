import type { CVData } from './cv'

export const cvDataPl: CVData = {
  name: 'Sebastian Kolbusz',
  title: 'Senior Frontend Engineer',
  contact: {
    email: 's.kolbusz@outlook.com',
    phone: '+48 533 542 880',
    location: 'Zakopane, Polska',
    linkedin: 'https://www.linkedin.com/in/skolbusz',
  },
  summary:
    'Senior Frontend Engineer z ponad 6-letnim doświadczeniem w budowaniu wydajnych produktów SaaS z wykorzystaniem React, TypeScript i GraphQL. Ekspert w optymalizacji architektury, skutecznie redukujący rozmiar aplikacji enterprise o 50%. Doświadczony w prowadzeniu projektów od fazy discovery po wdrożenie, z naciskiem na Developer Experience (DX), skalowalność oraz wysoką jakość testów automatycznych.',
  experience: [
    {
      company: 'Ready2Order',
      title: 'Senior Frontend Engineer',
      location: 'Wiedeń (Zdalnie)',
      period: '08/2019 – 12/2025',
      description:
        'Projektowanie i skalowanie wiodącego na rynku systemu POS obsługującego ponad 10 000 firm w Europie.',
      highlights: [
        'Redukcja rozmiaru bundla aplikacji React o 50%, co znacząco poprawiło parametry TTFB i retencję użytkowników',
        'Architektura i wdrożenie modułu CashBook z użyciem React, Apollo GraphQL oraz TailwindCSS',
        'Optymalizacja legacy API (PHP/MySQL) w celu obsługi wysokowydajnych funkcji frontendowych',
        'Wdrażanie standardów inżynierskich poprzez rygorystyczne code review i mentoring zespołu',
        'Wdrożenie strategii testowych klasy enterprise z wykorzystaniem Jest, RTL oraz Cypress',
        'Prowadzenie zwinnych cykli produktowych w wysokowydajnym środowisku Scrum',
      ],
    },
    {
      company: 'Freelance Architect',
      title: 'Konsultant Frontend',
      location: 'Zakopane, Polska',
      period: '2016 – Obecnie',
      description:
        'Dostarczanie wysokiej klasy rozwiązań cyfrowych i strategii technicznej dla klientów międzynarodowych.',
      highlights: [
        'Uruchomienie platform nastawionych na konwersję (zakofy.com, yourkrakowtravel.com), skutkujące 400% wzrostem ruchu organicznego',
        'Tworzenie immersyjnych doświadczeń 3D oraz animacji GSAP dla marek premium',
        'Projektowanie dedykowanych systemów rezerwacyjnych i zaawansowanych wyszukiwarek dla sektora turystycznego',
        'Doradztwo w zakresie strategii UX i architektury technicznej dla startupów na wczesnym etapie rozwoju',
      ],
    },
  ],
  education: [
    {
      school: 'Uniwersytet Ekonomiczny w Krakowie',
      degree: 'Inżynieria Oprogramowania | Licencjat z Informatyki Stosowanej',
      location: 'Kraków',
      period: '09/2016 – 09/2019',
      highlights: [
        'Członek Koła Naukowego Informatyki (KNI)',
        'Autor i deweloper strony internetowej Koła KNI w latach 2016-2019',
      ],
    },
  ],
  skills: [
    {
      category: 'Stack Technologiczny',
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
    { language: 'Angielski', level: 'Biegły (C1/C2)' },
    { language: 'Niemiecki', level: 'Podstawowy' },
  ],
}
