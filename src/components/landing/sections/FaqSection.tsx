import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Who is WorkBridge for?",
    a: "Freelancers and small teams who run client work in milestones and want one place to deliver work, get approvals, and track milestone payment status without constant follow-ups.",
  },
  {
    q: "Is this a project management tool?",
    a: "No, WorkBridge is built for the freelancer–client loop: deliverables, approvals, and visibility into milestone payment tracking, not internal task or team management.",
  },
  {
    q: "How does milestone payment tracking work?",
    a: "Each milestone has a clear status. After approval, you can see what’s pending or paid at a glance — it’s tracking and workflow visibility, not processing payments for you.",
  },
  {
    q: "Do clients need to learn a new system?",
    a: "No, clients only see a simple interface to review work, give feedback, and approve milestones. No complexity, no onboarding friction.",
  },
  {
    q: "When will WorkBridge launch?",
    a: "We’re currently onboarding early users. Join the waitlist to get access as soon as spots open.",
  },
  // {
  //   q: "Will there be pricing?",
  //   a: "Yes, pricing will be introduced at launch. Early users on the waitlist will get priority access and updates.",
  // },
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
