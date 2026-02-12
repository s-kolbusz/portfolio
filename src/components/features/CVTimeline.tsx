'use client'

import React, { useRef, useEffect } from 'react'

import { useTranslations } from 'next-intl'

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { CVExperience, CVEducation } from '@/data/cv'

import { CVEntry } from './CVEntry'

gsap.registerPlugin(ScrollTrigger)

interface CVTimelineProps {
  experience: CVExperience[]
  education: CVEducation[]
}

export const CVTimeline: React.FC<CVTimelineProps> = ({ experience, education }) => {
  const t = useTranslations('cv')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const ctx = gsap.context(() => {
      const entries = gsap.utils.toArray<HTMLElement>('.cv-entry')
      entries.forEach((entry) => {
        gsap.fromTo(
          entry,
          { opacity: 0, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: entry,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          }
        )
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="relative flex flex-col gap-6 md:gap-5 print:gap-5">
      <section className="flex flex-col gap-4 md:gap-4 print:gap-4">
        <h2 className="text-foreground font-serif text-xl font-bold md:text-[14pt] print:text-[14pt]">
          {t('experience')}
        </h2>
        <div className="flex flex-col">
          {experience.map((exp, index) => (
            <CVEntry
              key={index}
              title={exp.company}
              subtitle={exp.title}
              period={exp.period}
              location={exp.location}
              description={exp.description}
              highlights={exp.highlights}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 md:gap-4 print:gap-4">
        <h2 className="text-foreground font-serif text-xl font-bold md:text-[14pt] print:text-[14pt]">
          {t('education')}
        </h2>
        <div className="flex flex-col">
          {education.map((edu, index) => (
            <CVEntry
              key={index}
              title={edu.school}
              subtitle={edu.degree}
              period={edu.period}
              location={edu.location}
              highlights={edu.highlights}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
