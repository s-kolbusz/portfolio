import type { ResumeData } from './resume'

export const resumeDataEn: ResumeData = {
  name: 'Sebastian Kolbusz',
  title: 'Senior Frontend Engineer',
  contact: {
    email: 's.kolbusz@outlook.com',
    phone: '+48 533 542 880',
    location: 'Zakopane, Poland',
    linkedin: 'https://www.linkedin.com/in/skolbusz',
  },
  summary:
    'Senior Frontend Engineer with 6+ years of experience specialized in building high-performance SaaS products using React, TypeScript, and GraphQL. Expert in architectural optimization, having successfully reduced enterprise application bundle sizes by 50%. Proven track record in leading feature development from discovery to deployment, prioritizing developer experience (DX), scalability, and robust automated testing.',
  experience: [
    {
      company: 'Ready2Order',
      title: 'Senior Frontend Engineer',
      location: 'Vienna (Remote)',
      period: '08/2019 – 12/2025',
      description:
        'Engineered and scaled a market-leading POS system serving 10,000+ European businesses.',
      highlights: [
        'Reduced React application bundle size by 50%, significantly improving TTFB and user retention',
        'Architected and delivered the CashBook module using React, Apollo GraphQL, and TailwindCSS',
        'Optimized legacy backend APIs (PHP/MySQL) to support high-throughput frontend features',
        'Established engineering standards through comprehensive code reviews and mentoring',
        'Implemented enterprise-grade testing strategies using Jest, RTL, and Cypress',
        'Drove agile product cycles within a high-performance Scrum environment',
      ],
    },
    {
      company: 'Freelance Architect',
      title: 'Frontend Consultant',
      location: 'Zakopane, Poland',
      period: '2016 – Present',
      description:
        'Delivering premium digital assets and technical strategy for international clients.',
      highlights: [
        'Launched high-conversion platforms (zakofy.com, yourkrakowtravel.com) resulting in 400% organic traffic growth',
        'Developed interactive 3D and GSAP-powered experiences for premium lifestyle brands',
        'Engineered custom booking systems and search components specialized for the tourism sector',
        'Consulted on UX strategy and technical architecture for early-stage startups',
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
