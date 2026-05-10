"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const reviews = [
  {
    quote: "Great for keeping track of project milestones; simple, clear, and effective.",
    name: "Brett R.",
    title: "Contract Developer",
  },
  {
    quote:
      "I was juggling Figma comments, a Notion page, and email for the same sprint. Stupid. Now there's one link to point people at, still chaos some weeks but less.",
    name: "Sanae M.",
    title: "Frontend dev",
  },
  {
    quote: "Fewer duplicate uploads. That alone helped.",
    name: "Dmitri H.",
    title: "Backend, remote",
  },
  {
    quote:
      "DevOps clients want a paper trail. Having approvals and what shipped in one row beats re-writing the recap in Slack every time.",
    name: "Elias K.",
    title: "DevOps consultant",
  },
  {
    quote: "Does what it says. Doesn't fix bad clients.",
    name: "Tanya V.",
    title: "Backend engineer",
  },
  {
    quote:
      "Got a ‘where did we land on that?’ message last month. Opened the activity log, screenshot, done. Would’ve been twenty minutes of scrolling before.",
    name: "Priya N.",
    title: "PM, contracting",
  },
  {
    quote: "Milestones keep my UX clients oriented. They still ghost me sometimes though.",
    name: "Marco W.",
    title: "Designer",
  },
  {
    quote:
      "Change requests used to hit WhatsApp, email, and a shared doc. I still miss things occasionally, just not as often.",
    name: "Maya F.",
    title: "Full-stack",
  },
  {
    quote: "Stopped rebuilding a ‘project status’ doc every Sunday night.",
    name: "Lucas G.",
    title: "WordPress stuff",
  },
  {
    quote:
      "Picky about tools. This one stuck because I'm not doing freelance admin in my head after dinner anymore.",
    name: "Ola S.",
    title: "Backend contractor",
  },
] as const;

function reviewCardWidthClass(quote: string) {
  const n = quote.length;
  if (n < 95) {
    return "w-[min(100vw-2rem,260px)] shrink-0 sm:w-[280px]";
  }
  if (n > 210) {
    return "w-[min(100vw-2rem,380px)] shrink-0 sm:w-[420px]";
  }
  return "w-[min(100vw-2rem,320px)] shrink-0 sm:w-[360px]";
}

function ReviewCard({
  quote,
  name,
  title: role,
}: {
  quote: string;
  name: string;
  title: string;
}) {
  return (
    <figure
      className={cn(
        "rounded-2xl border border-border/80 bg-card/60 px-5 py-4 shadow-sm sm:px-6 sm:py-5",
        reviewCardWidthClass(quote),
      )}
    >
      <blockquote className="text-sm leading-relaxed text-foreground sm:text-[15px]">
        “{quote}”
      </blockquote>
      <figcaption className="mt-3 border-t border-border/60 pt-3 text-xs text-muted-foreground sm:text-sm">
        <span className="font-medium text-foreground">{name}</span>
        <span className="text-muted-foreground"> · {role}</span>
      </figcaption>
    </figure>
  );
}

function MarqueeRow({ direction }: { direction: "left" | "right" }) {
  const loop = [...reviews, ...reviews];

  return (
    <div
      className={cn(
        "flex w-max gap-4 pb-1 hover:[animation-play-state:paused]",
        direction === "left" ? "wb-review-marquee-left" : "wb-review-marquee-right",
      )}
    >
      {loop.map((r, i) => (
        <ReviewCard
          key={`${direction}-${i}-${r.name}`}
          quote={r.quote}
          name={r.name}
          title={r.title}
        />
      ))}
    </div>
  );
}

export function SocialProofSection() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return (
    <section
      id="reviews"
      aria-label="Freelancer reviews"
      className="px-4 pt-16 sm:pt-20"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 max-w-2xl space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            What freelancers say
          </h2>
        </div>

        {reduceMotion ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {reviews.map((r, i) => (
              <ReviewCard
                key={`${r.name}-${i}`}
                quote={r.quote}
                name={r.name}
                title={r.title}
              />
            ))}
          </div>
        ) : (
          <div
            className={cn(
              "relative -mx-4 overflow-hidden py-2 sm:mx-0",
              "[mask-image:linear-gradient(to_right,transparent_0%,black_5%,black_95%,transparent_100%)]",
            )}
          >
            <div className="flex flex-col gap-4">
              <MarqueeRow direction="left" />
              <MarqueeRow direction="right" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
