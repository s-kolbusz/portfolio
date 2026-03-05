import React from 'react'

interface CVEntryProps {
  title: string
  subtitle: string
  period: string
  location: string
  description?: string
  highlights?: string[]
}

export const CVEntry: React.FC<CVEntryProps> = ({
  title,
  subtitle,
  period,
  location,
  description,
  highlights,
}) => {
  return (
    <div className="cv-entry group relative pb-[15pt] last:pb-0">
      <div className="flex flex-col gap-[2pt]">
        <div className="flex flex-wrap items-baseline justify-between gap-x-[10pt]">
          <h3 className="text-foreground font-serif text-[12pt] font-semibold">{title}</h3>
          <span className="font-mono text-[8pt] text-emerald-600/80">{period}</span>
        </div>

        <div className="text-muted-foreground flex items-center justify-between text-[9pt] font-medium">
          <span>{subtitle}</span>
          <span className="italic">{location}</span>
        </div>

        {description && (
          <p className="text-muted-foreground/90 mt-[6pt] text-[10pt] leading-[1.4]">
            {description}
          </p>
        )}

        {highlights && highlights.length > 0 && (
          <ul className="text-muted-foreground/80 mt-[6pt] list-outside list-disc space-y-[3pt] pl-[12pt] text-[10pt]">
            {highlights.map((highlight, index) => (
              <li key={index} className="pl-[2pt]">
                {highlight}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
