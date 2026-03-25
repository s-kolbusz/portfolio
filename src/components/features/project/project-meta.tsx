import { cn } from '@/lib/cn'

interface ProjectMetaProps {
  year: string | number
  techStack: readonly string[]
  className?: string
  limit?: number
}

export function ProjectMeta({ year, techStack, className, limit = 3 }: ProjectMetaProps) {
  return (
    <div
      className={cn(
        'text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-xs tracking-widest',
        className
      )}
    >
      <span className="text-primary uppercase">{year}</span>
      <span className="opacity-30">/</span>
      <div className="flex min-w-0 flex-wrap gap-x-3 gap-y-1">
        {techStack.slice(0, limit).map((tech) => (
          <span key={tech} className="shrink-0 uppercase">
            {tech}
          </span>
        ))}
      </div>
    </div>
  )
}
