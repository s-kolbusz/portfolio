interface SkillTagProps {
  name: string
}

export const SkillTag: React.FC<SkillTagProps> = ({ name }) => {
  return (
    <span
      data-cursor="button"
      className="bg-card text-card-foreground border-border inline-block rounded-md border px-2 py-1 font-mono text-xs font-medium transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/50 hover:bg-emerald-500/10 md:px-2 md:py-0.5 md:text-[9pt] print:border-black/20 print:bg-transparent print:px-2 print:py-0.5 print:text-[9pt] print:font-semibold print:text-black print:before:mr-1 print:before:content-['-']"
    >
      {name}
    </span>
  )
}
