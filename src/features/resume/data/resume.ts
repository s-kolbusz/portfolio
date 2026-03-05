export interface ResumeExperience {
  company: string
  title: string
  location: string
  period: string
  description: string
  highlights: string[]
}

export interface ResumeEducation {
  school: string
  degree: string
  location: string
  period: string
  highlights: string[]
}

export interface ResumeData {
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
  experience: ResumeExperience[]
  education: ResumeEducation[]
  skills: {
    category: string
    items: string[]
  }[]
  languages: {
    language: string
    level: string
  }[]
}
