'use client'

import { Accordion } from '@/components/ui/accordion'

interface FaqAccordionProps {
  question: string
  answer: string
}

export function FaqAccordion({ question, answer }: FaqAccordionProps) {
  // Use a unique ID based on a hash of the question to ensure uniqueness (simplified for client-side)
  const id = question.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()

  return (
    <Accordion
      id={id}
      className="group py-6"
      triggerClassName="w-full"
      contentClassName="pt-4"
      trigger={
        <h3 className="group-hover:text-primary font-serif text-xl font-medium transition-colors md:text-2xl">
          {question}
        </h3>
      }
    >
      <p className="text-muted-foreground font-sans text-base leading-relaxed md:text-lg">
        {answer}
      </p>
    </Accordion>
  )
}
