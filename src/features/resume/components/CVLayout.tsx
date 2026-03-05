'use client'

import React, { useRef } from 'react'

import { useTranslations } from 'next-intl'

import type { CVData } from '@/features/resume/data/cv'
import { ANIMATION } from '@/shared/config/animations'
import { useTimeline } from '@/shared/hooks/timeline/useTimeline'
import { SkillTag } from '@/shared/ui/SkillTag'

import { CVHeader } from './CVHeader'
import { CVTimeline } from './CVTimeline'

interface CVLayoutProps {
  data: CVData
}

export const CVLayout: React.FC<CVLayoutProps> = ({ data }) => {
  const t = useTranslations('cv')
  const containerRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const mainColRef = useRef<HTMLDivElement>(null)
  const sideColRef = useRef<HTMLElement>(null)

  useTimeline(containerRef, { id: 'cv' }, (reveal) => {
    reveal(headerRef, {
      delay: 0.4,
      stagger: ANIMATION.stagger.normal,
    })
    reveal(mainColRef, {
      delay: 0.2,
      stagger: ANIMATION.stagger.loose,
    })
    reveal(sideColRef, {
      delay: 0.2,
      x: 20,
      y: 0,
      stagger: ANIMATION.stagger.normal,
    })
  })

  return (
    <div
      ref={containerRef}
      id="cv-content"
      className="bg-card mx-auto w-full max-w-[210mm] p-6 shadow-2xl transition-all duration-300 md:min-h-[297mm] md:p-[15mm] print:min-h-0 print:w-full print:max-w-none print:bg-white print:p-0 print:shadow-none print:[print-color-adjust:exact]!"
      style={{ boxSizing: 'border-box' }}
    >
      <div ref={headerRef} className="cv-header">
        <CVHeader name={data.name} title={data.title} contact={data.contact} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_140px] print:grid-cols-[1fr_140px]">
        {/* Main Column */}
        <div ref={mainColRef} className="cv-main-col mr-[20pt] flex flex-col print:mr-[20pt]">
          <section className="mb-[10pt] flex flex-col print:mb-[10pt]">
            <h2 className="text-foreground font-serif text-lg font-bold md:text-[16pt] print:text-[16pt]">
              {t('summary')}
            </h2>
            <p className="text-muted-foreground/90 text-xs leading-relaxed md:text-[9pt] md:leading-[1.4] print:text-[9pt] print:leading-[1.4]">
              {data.summary}
            </p>
          </section>

          <CVTimeline experience={data.experience} education={data.education} />
        </div>

        {/* Side Column */}
        <aside ref={sideColRef} className="cv-side-col flex flex-col">
          <section className="flex flex-col md:mb-[10pt] print:mb-[10pt]">
            <h2 className="text-foreground font-serif text-xl font-bold md:text-[14pt] print:text-[14pt]">
              {t('skills')}
            </h2>
            <div className="flex flex-col md:gap-[10pt] print:gap-[10pt]">
              {data.skills.map((skillGroup, index) => (
                <div key={index} className="flex flex-col md:gap-[10pt] print:gap-[10pt]">
                  <h3 className="text-primary/80 text-xs font-bold tracking-widest uppercase md:text-[8pt] print:text-[8pt]">
                    {skillGroup.category}
                  </h3>
                  <div className="flex flex-wrap gap-[4pt] print:gap-[4pt]">
                    {skillGroup.items.map((skill, sIndex) => (
                      <SkillTag key={sIndex} name={skill} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col">
            <h2 className="text-foreground font-serif text-xl font-bold md:text-[14pt] print:text-[14pt]">
              {t('languages')}
            </h2>
            <div className="flex flex-col">
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
