'use client'

import { EntryLink } from '@/components/features/project/entry-link'
import type { LinkableEntry } from '@/data/entry-href'
import { useNavigationStore } from '@/lib/stores/navigation'

type CvProjectLinksProps = {
  projects: (LinkableEntry & { title: string })[]
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
            <EntryLink
              entry={project}
              className="text-foreground hover:text-primary font-serif text-sm transition-colors"
              onInternalClick={() => setProjectOrigin(null)}
            >
              {project.title}
            </EntryLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
