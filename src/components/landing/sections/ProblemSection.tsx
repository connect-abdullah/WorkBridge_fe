"use client";

import { MessageSquareWarning, Files, Wallet } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const problems = [
  {
    title: "Endless client follow-ups",
    description:
      "You’re chasing updates, re-explaining progress, and repeating the same answers across DMs, email, and calls.",
    Icon: MessageSquareWarning,
  },
  {
    title: "Scattered files and feedback",
    description:
      "Deliverables and comments live in different tools, so “final” is fuzzy and nothing feels like a single thread.",
    Icon: Files,
  },
  {
    title: "Milestone status gets fuzzy",
    description:
      "Without a clear view per milestone, it’s hard to see what’s approved, what’s waiting, and what still needs a decision.",
    Icon: Wallet,
  },
];

export function ProblemSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative px-4 pt-16 sm:pt-20">
      <div
        className="pointer-events-none absolute inset-x-0 top-24 -z-10 h-[420px] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent_55%)]"
        aria-hidden
      />

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-end lg:gap-12">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Where work slips
            </p>
            <h2 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-[1.75rem] lg:leading-snug xl:text-3xl">
            Projects don’t fail all at once; they break down in the small gaps between updates, messages, and milestones.
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              WorkBridge is built to close those gaps: one workspace your clients
              can follow, with structure instead of scattered threads.
            </p>
          </div>

          <ul className="grid gap-2.5 sm:grid-cols-3 lg:grid-cols-1 lg:gap-3">
            {[
              "Updates splinter across apps",
              "Files end up in different places",
              "Milestone status gets fuzzy",
            ].map((line) => (
              <li
                key={line}
                className="flex items-center gap-2 rounded-xl border border-dashed border-border/80 bg-muted/15 px-3 py-2.5 text-xs font-medium text-muted-foreground sm:text-sm"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                {line}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          {problems.map(({ title, description, Icon }, index) => (
            <motion.div
              key={title}
              className="group relative rounded-2xl border border-border/80 bg-card/45 p-6 shadow-sm ring-1 ring-border/30 backdrop-blur-sm transition hover:border-border hover:bg-card/65 hover:shadow-md"
              initial={
                shouldReduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 16 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 0.75,
                      ease: [0.16, 1, 0.3, 1],
                      delay: index * 0.12,
                    }
              }
            >
              <span className="absolute right-5 top-5 font-mono text-[10px] font-medium tabular-nums text-muted-foreground/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex items-start gap-3 pr-8">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary/[0.14]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 space-y-2 pt-0.5">
                  <p className="text-base font-semibold leading-snug text-foreground">
                    {title}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
