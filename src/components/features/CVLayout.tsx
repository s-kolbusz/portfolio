'use client'

import React, { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

import { SkillTag } from '@/components/ui/SkillTag'
import { CVData } from '@/data/cv'

import { CVHeader } from './CVHeader'
import { CVTimeline } from './CVTimeline'

interface CVLayoutProps {
  data: CVData
}

export const CVLayout: React.FC<CVLayoutProps> = ({ data }) => {
  const t = useTranslations('cv')
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // Staggered reveal for content sections
      const tl = gsap.timeline({ delay: 0.4 })

      tl.from('.cv-header > *', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power2.out',
      })
        .from(
          '.cv-main-col > *',
          {
            opacity: 0,
            y: 20,
            stagger: 0.15,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.6'
        )
        .from(
          '.cv-side-col > *',
          {
            opacity: 0,
            x: 20,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.6'
        )
    },
    { scope: containerRef }
  )

  return (
    <div
      ref={containerRef}
      id="cv-content"
      className="bg-card mx-auto w-full max-w-[210mm] p-6 shadow-2xl transition-all duration-300 md:min-h-[297mm] md:p-[15mm] print:min-h-0 print:w-full print:max-w-none print:bg-white print:p-0 print:shadow-none print:[print-color-adjust:exact]!"
      style={{ boxSizing: 'border-box' }}
    >
      <div className="cv-header">
        <CVHeader name={data.name} title={data.title} contact={data.contact} />
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[1fr_200px] md:gap-10 print:grid-cols-[1fr_200px] print:gap-10">
        {/* Main Column */}
        <div className="cv-main-col flex flex-col gap-8">
          <section className="flex flex-col gap-3 md:mb-[20pt] md:gap-[8pt] print:mb-[20pt] print:gap-[8pt]">
            <h2 className="text-foreground font-serif text-2xl font-bold md:text-[16pt] print:text-[16pt]">
              {t('summary')}
            </h2>
            <p className="text-muted-foreground/90 text-sm leading-relaxed md:text-[10pt] md:leading-[1.4] print:text-[10pt] print:leading-[1.4]">
              {data.summary}
            </p>
          </section>

          <CVTimeline experience={data.experience} education={data.education} />
        </div>

        {/* Side Column */}
        <aside className="cv-side-col flex flex-col gap-8">
          <section className="flex flex-col gap-5 md:mb-[20pt] md:gap-4 print:mb-[20pt] print:gap-4">
            <h2 className="text-foreground font-serif text-xl font-bold md:text-[14pt] print:text-[14pt]">
              {t('skills')}
            </h2>
            <div className="flex flex-col gap-6 md:gap-4 print:gap-4">
              {data.skills.map((skillGroup, index) => (
                <div key={index} className="flex flex-col gap-3 md:gap-2 print:gap-2">
                  <h3 className="text-primary/80 text-xs font-bold tracking-widest uppercase md:text-[8pt] print:text-[8pt]">
                    {skillGroup.category}
                  </h3>
                  <div className="flex flex-wrap gap-2 md:gap-[4pt] print:gap-[4pt]">
                    {skillGroup.items.map((skill, sIndex) => (
                      <SkillTag key={sIndex} name={skill} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-4 md:gap-4 print:gap-4">
            <h2 className="text-foreground font-serif text-xl font-bold md:text-[14pt] print:text-[14pt]">
              {t('languages')}
            </h2>
            <div className="flex flex-col gap-2 md:gap-2 print:gap-2">
              {data.languages.map((lang, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm md:text-[10pt] print:text-[10pt]"
                >
                  <span className="text-foreground font-medium">{lang.language}</span>
                  <span className="text-muted-foreground">{lang.level}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
