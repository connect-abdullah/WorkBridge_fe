"use client";

import { MessageSquareWarning, Files, Wallet } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const problems = [
  {
    title: "Endless client follow-ups",
    description:
      "You’re constantly chasing updates, clarifying progress, and repeating the same information across messages.",
    Icon: MessageSquareWarning,
  },
  {
    title: "Scattered files and feedback",
    description:
      "Deliverables, comments, and revisions are spread across tools - making it hard to track what’s final and what’s pending.",
    Icon: Files,
  },
  {
    title: "Delayed or unclear payments",
    description:
      "Work gets done, but approvals lag and payments don’t follow a clear structure - slowing down your cash flow.",
    Icon: Wallet,
  },
];

export function ProblemSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="px-4 pt-16 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            A Project breaks down in the gaps.
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base">
            WorkBridge replaces the messy back-and-forth with a system your
            clients can follow.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {problems.map(({ title, description, Icon }, index) => (
            <motion.div
              key={title}
              className="group rounded-2xl border border-border bg-card/40 p-6 transition hover:bg-card/60 shadow-sm"
              initial={
                shouldReduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 20 }
              }
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : {
                      duration: 0.9,
                      ease: [0.16, 1, 0.3, 1],
                      delay: index * 0.3,
                    }
              }
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 text-foreground transition group-hover:bg-muted/60">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-base font-semibold text-foreground">
                  {title}
                </p>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
