import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Who is WorkBridge for?",
    a: "Freelancers and independent studios who deliver client work in milestones and want a cleaner approval + payment workflow.",
  },
  {
    q: "Is this a project management tool?",
    a: "It’s focused on the freelancer-client loop: milestones, deliverables, client review/approval, and payment visibility — not internal team planning.",
  },
  {
    q: "How does payment tracking work?",
    a: "WorkBridge ties approvals to milestones so you always know what’s approved, what’s pending, and what should be paid next.",
  },
  {
    q: "When will WorkBridge launch?",
    a: "Join the waitlist and you’ll be notified as soon as early access opens.",
  },
  {
    q: "Will there be pricing?",
    a: "Yes — pricing will be announced at launch. For now, the waitlist is the best way to get early access.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="px-4 pt-16 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Frequently asked questions
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Quick answers to the most common questions about WorkBridge.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card/40 px-6">
            <Accordion type="single" collapsible>
              {faqs.map((item) => (
                <AccordionItem key={item.q} value={item.q}>
                  <AccordionTrigger>{item.q}</AccordionTrigger>
                  <AccordionContent>{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}

