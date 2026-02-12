'use client'

import React, { useRef } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { useGSAP } from '@gsap/react'
import { ArrowRightIcon } from '@phosphor-icons/react'

import { BaseSection } from '@/components/ui/BaseSection'
import { SkillTag } from '@/components/ui/SkillTag'
import { skillCategories } from '@/data/skills'
import { useRevealAnimation } from '@/hooks/useRevealAnimation'
import { useSafeAnimation } from '@/lib/constants/animations'
import { gsap } from '@/lib/gsap'

export const About: React.FC = () => {
  const t = useTranslations('about')
  const containerRef = useRef<HTMLElement>(null)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)

  const ANIMATION = useSafeAnimation()

  useRevealAnimation(contentRef, { stagger: ANIMATION.stagger.slow, scope: containerRef })
  useRevealAnimation(statsRef, { x: -20, y: 0, scope: containerRef })

  useGSAP(
    () => {
      if (imageContainerRef.current) {
        gsap.fromTo(
          imageContainerRef.current,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: ANIMATION.duration.slow,
            ease: ANIMATION.ease.inOut,
            delay: ANIMATION.delay.short,
            scrollTrigger: {
              toggleActions: ANIMATION.scrollTrigger.toggleActions,
              trigger: containerRef.current,
              start: 'top 80%',
            },
          }
        )
      }
    },
    { scope: containerRef }
  )

  return (
    <BaseSection
      id="about"
      ref={containerRef}
      containerClassName="grid grid-cols-1 gap-16 lg:grid-cols-12"
    >
      {/* Left Column: Narrative (Editorial Style) - Sticky */}
      <div
        ref={contentRef}
        className="flex flex-col gap-8 lg:sticky lg:top-32 lg:col-span-7 lg:h-fit"
      >
        {/* Main Title - Soft Serif */}
        <h2 className="font-serif text-5xl leading-[1.1] font-normal md:text-6xl lg:text-7xl">
          {t('title')}
        </h2>

        {/* Lead Paragraph - Larger Serif */}
        <p className="text-muted-foreground font-serif text-2xl leading-relaxed italic">
          &quot;{t('bio.description')}&quot;
        </p>

        {/* Body Text - Clean Sans */}
        <div className="text-muted-foreground flex flex-col gap-6 font-sans text-lg leading-relaxed">
          <p>{t('philosophy.details')}</p>
          <p>
            I treat engineering as a craft. It&apos;s not just about writing code; it&apos;s about
            creating digital environments that feel natural, responsive, and human.
          </p>
        </div>

        {/* Signature / Philosophy Marker */}
        <div className="border-primary mt-8 border-l-2 pl-6">
          <p className="text-primary mb-2 font-mono text-sm">{t('philosophy_label')}</p>
          <p className="text-foreground font-serif text-xl italic">{t('philosophy.details')}</p>
        </div>
      </div>

      {/* Right Column: Visuals & Specs (Tech Twist) */}
      <div className="flex flex-col gap-12 lg:col-span-5 lg:pl-12">
        {/* Image with Mask Effect */}
        <div className="relative" ref={imageContainerRef}>
          <div className="bg-muted transition-[filter, --webkit-filter] relative aspect-3/4 w-full overflow-hidden duration-700 hover:grayscale-0 lg:grayscale">
            <Image
              src="/images/sebastian_kolbusz_caricature.avif"
              alt="Sebastian Kolbusz"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
              priority
            />
          </div>

          {/* Decorative Caption */}
          <div className="border-border text-muted-foreground mt-4 flex justify-between border-b py-2 font-mono text-xs">
            <span>{t('figure_profile')}</span>
            <span>{t('location.city')}</span>
          </div>
        </div>

        {/* "System Specs" - Tech/Minimalist Stats */}
        <div ref={statsRef} className="flex flex-col gap-6 font-mono text-sm">
          <div className="stat-line border-border flex items-center justify-between border-b py-3">
            <span className="text-muted-foreground">{t('experience_label')}</span>
            <span className="text-foreground font-bold">
              {t('experience.years')} {t('experience.label')}
            </span>
          </div>

          <div className="stat-line border-border flex items-center justify-between border-b py-3">
            <span className="text-muted-foreground">{t('location_label')}</span>
            <span className="text-foreground font-bold">{t('location.city')}</span>
          </div>

          <div className="stat-line flex flex-col gap-4 py-3">
            <span className="text-muted-foreground flex items-center gap-2">
              <ArrowRightIcon className="text-primary" />
              {t('stack_label')}
            </span>
            <div className="text-foreground/80 flex flex-wrap gap-x-4 gap-y-3">
              {skillCategories[0].skills.map((skill) => (
                <SkillTag key={skill.name} name={skill.name} />
              ))}
              {skillCategories[1].skills.map((skill) => (
                <SkillTag key={skill.name} name={skill.name} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </BaseSection>
  )
}

export default About
