import { CVData } from './cv'

export const cvDataEn: CVData = {
  name: 'Sebastian Kolbusz',
  title: 'Frontend Engineer',
  contact: {
    email: 's.kolbusz@outlook.com',
    phone: '+48 533 542 880',
    location: 'Zakopane, Poland',
    linkedin: 'https://www.linkedin.com/in/skolbusz',
  },
  summary:
    'I’m a Frontend Software Engineer who enjoys working with React, TypeScript, GraphQL, and TailwindCSS. I’ve built feature modules from the ground up and boosted app functionality by extending APIs and writing solid tests using Jest and Cypress. One of my proudest achievements was cutting the app size in half and speeding up load times by reworking the build process. I’m passionate about writing clean, high-quality code and following best practices. I’ve thrived in collaborative Scrum Agile teams and am comfortable managing projects with JIRA, keeping everything on track and running smoothly.',
  experience: [
    {
      company: 'Ready2Order',
      title: 'Frontend Engineer',
      location: 'Vienna',
      period: '08/2019 – 12/2025',
      description:
        'Developing and maintaining a leading POS system used by thousands of businesses across Europe.',
      highlights: [
        '50% smaller ReactJS app bundle -> Reduced load times and enhanced user experience',
        'Responsive interfaces like CashBook developed -> Used ReactJS with TypeScript, Apollo GraphQL, and TailwindCSS',
        'Improved app functionality -> Extended API GraphQL/PHP/MySQL',
        'Maintained code quality -> Led code reviews enforcing best practices and maintainability',
        'Ensured feature reliability -> Wrote tests with Jest, React-Testing-Library, and Cypress',
        'Aligned team progress -> Participated in stand-ups, sprint planning, and retrospectives',
        'Accurate UI implementation -> Translated wireframes and prototypes into user interface designs',
      ],
    },
    {
      company: 'Self Employed',
      title: 'Frontend Engineer',
      location: 'Zakopane, Poland',
      period: '2016 – Present',
      description:
        'Delivering high-performance custom web solutions and SaaS products for international clients. Specializing in Next.js, React, and SEO optimization.',
      highlights: [
        'Launched websites for small business owners including zakofy.com, yourkrakowtravel.com, wellezza.pl, billboardzakopane.pl',
        'Improved private booking platform usability by developing new search components and a pre-booking module',
        'Increased user engagement by integrating price information into search results',
        'Designed application mockups and created prototypes using AdobeXD for medication guidance and memory training tools',
      ],
    },
  ],
  education: [
    {
      school: 'University Of Economics',
      degree: 'Software Engineering | Bachelor in Applied Informatics',
      location: 'Cracow',
      period: '09/2016 – 09/2019',
      highlights: ['Science-IT Club Member (KNI)', 'Author of KNI Club website in years 2016-2019'],
    },
  ],
  skills: [
    {
      category: 'Tech Stack',
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
      category: 'Database & API',
      items: ['PostgreSQL', 'MongoDB', 'REST APIs', 'GraphQL'],
    },
    {
      category: 'Tools & Testing',
      items: ['Jest', 'Cypress', 'JIRA', 'Git', 'Docker'],
    },
  ],
  languages: [
    { language: 'Polish', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'German', level: 'Basic' },
  ],
}
