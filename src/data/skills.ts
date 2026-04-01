interface Skill {
  name: string
}

interface SkillCategory {
  title: string
  skills: Skill[]
}

export const skillCategories: SkillCategory[] = [
  {
    title: 'Frontend',
    skills: [
      { name: 'React' },
      { name: 'Next.js' },
      { name: 'TypeScript' },
      { name: 'JavaScript' },
    ],
  },
  {
    title: 'Styling',
    skills: [
      { name: 'Tailwind CSS' },
      { name: 'GSAP' },
      { name: 'Framer Motion' },
      { name: 'CSS / Sass' },
    ],
  },
  {
    title: 'Tools',
    skills: [{ name: 'Git' }, { name: 'Figma' }, { name: 'VS Code' }, { name: 'pnpm' }],
  },
  {
    title: 'Other',
    skills: [{ name: 'i18n' }, { name: 'Accessibility' }, { name: 'Performance' }, { name: 'SEO' }],
  },
]
