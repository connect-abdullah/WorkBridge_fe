import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Who is WorkBridge for?",
    a: "Freelancers and small teams who manage client work in milestones and want a structured way to deliver work, get approvals, and track payments without constant follow-ups.",
  },
  {
    q: "Is this a project management tool?",
    a: "No — WorkBridge is built specifically for the freelancer-client workflow. It focuses on deliverables, approvals, and payments, not internal task or team management.",
  },
  {
    q: "How does payment tracking work?",
    a: "Payments are tied directly to milestones. When work is approved, you can clearly see what’s due, what’s pending, and what’s already paid — all in one place.",
  },
  {
    q: "Do clients need to learn a new system?",
    a: "No — clients only see a simple interface to review work, give feedback, and approve milestones. No complexity, no onboarding friction.",
  },
  {
    q: "When will WorkBridge launch?",
    a: "We’re currently onboarding early users. Join the waitlist to get access as soon as spots open.",
  },
  {
    q: "Will there be pricing?",
    a: "Yes — pricing will be introduced at launch. Early users on the waitlist will get priority access and updates.",
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

