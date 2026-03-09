'use client'

import { useEffect, useRef, useState } from 'react'

import { type PortfolioEntry } from '@/data/projects-en'
import { useTimeline } from '@/hooks/timeline'
import { ANIMATION } from '@/lib/constants/animations'

import { ProjectHoverPreview } from './project-hover-preview'
import { getImageToRender } from './project-hover-preview/state'
import { ProjectItem } from './project-item'

interface ProjectListProps {
  projects: PortfolioEntry[]
}

export function ProjectList({ projects }: ProjectListProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useTimeline(containerRef, { id: 'project-list' }, (reveal) => {
    reveal(listRef, {
      y: 0,
      x: -100,
      stagger: ANIMATION.stagger.slow,
    })
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
        if (!entry.isIntersecting) {
          setActiveImage(null)
        }
      },
      {
        threshold: 0,
        rootMargin: '0px',
      }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const handleToggle = (id: string) => {
    setOpenId((current) => (current === id ? null : id))
  }

  const handleHover = (image: string | null) => {
    setActiveImage(image)
    if (image) {
      setPreviewImage(image)
    }
  }

  const imageToRender = getImageToRender(activeImage, previewImage)

  return (
    <div ref={containerRef} className="relative" onMouseLeave={() => setActiveImage(null)}>
      <div className="hidden md:block">
        <ProjectHoverPreview image={imageToRender} isActive={!!activeImage} isVisible={isVisible} />
      </div>

      <div className="flex flex-col" ref={listRef}>
        {projects.map((project) => (
          <ProjectItem
            key={project.id}
            project={project}
            isOpen={openId === project.id}
            onToggle={() => handleToggle(project.id)}
            onHover={handleHover}
          />
        ))}
      </div>
    </div>
  )
}
