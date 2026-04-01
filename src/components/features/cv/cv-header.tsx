import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  LinkedinLogoIcon,
  GithubLogoIcon,
} from '@phosphor-icons/react/dist/ssr'

interface CVHeaderProps {
  name: string
  title: string
  contact: {
    email: string
    phone: string
    location: string
    linkedin: string
    github?: string
  }
}

export const CVHeader: React.FC<CVHeaderProps> = ({ name, title, contact }) => {
  return (
    <header className="border-border relative mb-8 flex flex-col gap-6 border-b pb-8 md:mb-6 md:pb-5 print:mb-5 print:border-b-2 print:pb-4">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:items-end md:justify-between md:gap-5 print:grid-cols-[1fr_auto] print:items-end print:justify-between print:gap-5">
        <div className="flex flex-col gap-2 md:gap-1 print:gap-1">
          <h1 className="text-foreground font-serif text-4xl leading-none font-bold tracking-tight md:text-[36pt] print:text-[32pt]">
            {name}
          </h1>
          <p className="text-xl leading-tight font-medium text-emerald-500 md:text-[16pt] print:text-[14pt] print:text-emerald-600">
            {title}
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm md:items-end md:gap-1 md:text-[10pt] print:items-end print:gap-1 print:text-[9pt]">
          <a
            href={`mailto:${contact.email}`}
            className="text-muted-foreground flex items-center gap-3 transition-colors hover:text-emerald-500 md:gap-2 print:gap-2 print:text-black"
          >
            <EnvelopeIcon
              weight="duotone"
              className="text-primary print:text-primary size-4 md:size-4 print:size-[10pt]"
            />
            {contact.email}
          </a>
          <a
            href={`tel:${contact.phone.replace(/\s/g, '')}`}
            className="text-muted-foreground flex items-center gap-3 transition-colors hover:text-emerald-500 md:gap-2 print:gap-2 print:text-black"
          >
            <PhoneIcon
              weight="duotone"
              className="text-primary print:text-primary size-4 md:size-4 print:size-[10pt]"
            />
            {contact.phone}
          </a>
          <div className="text-muted-foreground flex items-center gap-3 md:gap-2 print:gap-2 print:text-black">
            <MapPinIcon
              weight="duotone"
              className="text-primary print:text-primary size-4 md:size-4 print:size-[10pt]"
            />
            {contact.location}
          </div>
          <div className="mt-1 flex items-center gap-6 md:mt-1 md:gap-3 print:mt-1 print:gap-3">
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground flex items-center gap-2 transition-colors hover:text-emerald-500 md:gap-2 print:gap-2 print:text-black"
            >
              <LinkedinLogoIcon
                weight="duotone"
                className="text-primary print:text-primary size-4 md:size-4 print:size-[10pt]"
              />
              LinkedIn
            </a>
            {contact.github && (
              <a
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground flex items-center gap-2 transition-colors hover:text-emerald-500 md:gap-2 print:gap-2 print:text-black"
              >
                <GithubLogoIcon
                  weight="duotone"
                  className="text-primary print:text-primary size-4 md:size-4 print:size-[10pt]"
                />
                GitHub
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
