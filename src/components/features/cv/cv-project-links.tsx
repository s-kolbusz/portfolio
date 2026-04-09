'use client'

import { Link } from '@/i18n/navigation'
import { useNavigationStore } from '@/lib/stores/navigation'

interface CvProjectLinksProps {
  projects: { id: string; title: string }[]
  label: string
}

export function CvProjectLinks({ projects, label }: CvProjectLinksProps) {
  const setProjectOrigin = useNavigationStore((state) => state.setProjectOrigin)

  return (
    <nav aria-label={label} className="mx-auto w-full max-w-[210mm] px-6 print:hidden">
      <p className="text-muted-foreground mb-3 font-mono text-xs tracking-widest uppercase">
        {label}
      </p>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {projects.map((project) => (
          <li key={project.id}>
            <Link
              href={`/projects/${project.id}`}
              className="text-foreground hover:text-primary font-serif text-sm transition-colors"
              onClick={() => setProjectOrigin(null)}
            >
              {project.title}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
