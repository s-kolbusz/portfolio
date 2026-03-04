export interface CVExperience {
  company: string
  title: string
  location: string
  period: string
  description: string
  highlights: string[]
}

export interface CVEducation {
  school: string
  degree: string
  location: string
  period: string
  highlights: string[]
}

export interface CVData {
  name: string
  title: string
  contact: {
    email: string
    phone: string
    location: string
    linkedin: string
    github?: string
  }
  summary: string
  experience: CVExperience[]
  education: CVEducation[]
  skills: {
    category: string
    items: string[]
  }[]
  languages: {
    language: string
    level: string
  }[]
}
