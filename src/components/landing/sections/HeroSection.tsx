"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Highlighter } from "@/components/ui/highlighter";
import { landingCopy } from "@/components/landing/landingCopy";

export function HeroSection({
  onJoinWaitlist,
}: {
  onJoinWaitlist: () => void;
}) {
  return (
    <section className="px-4 pt-10 sm:pt-14">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[1fr_1.25fr]">
        <div className="order-2 space-y-6 lg:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Freelancer-Client Collaboration Platform
          </div>

          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {landingCopy.hero.headline}
          </h1>
          <p className="text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            WorkBridge gives freelancers a structured workspace where clients
            review work, approve milestones, and release payments{" - "}
            <Highlighter action="underline" color="#FF9800" strokeWidth={2}>
              All In One Place
            </Highlighter>
            .
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button className="h-11 rounded-full px-6" onClick={onJoinWaitlist}>
              {landingCopy.hero.primaryCta}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 rounded-full px-6"
            >
              <a href="#how-it-works">{landingCopy.hero.secondaryCta}</a>
            </Button>
          </div>

          {/* <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card/40 p-4">
              <p className="text-sm font-medium text-foreground">
                Faster approvals
              </p>
              <p className="text-xs text-muted-foreground">
                Built-in review + signoff loop.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card/40 p-4">
              <p className="text-sm font-medium text-foreground">
                Clear milestones
              </p>
              <p className="text-xs text-muted-foreground">
                Align scope before work starts.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card/40 p-4">
              <p className="text-sm font-medium text-foreground">
                Payment tracking
              </p>
              <p className="text-xs text-muted-foreground">
                Know what’s approved and due.
              </p>
            </div>
          </div> */}
        </div>

        <div className="order-1 relative lg:order-2 lg:-mr-8 xl:-mr-16">
          <div className="relative mx-auto max-w-[560px] sm:max-w-[720px] lg:max-w-none">
            <Image
              src="/laptop_image.png"
              alt="WorkBridge Dashboard"
              width={1900}
              height={1800}
              priority
              className="h-auto w-full scale-[1.02] drop-shadow-[0_18px_50px_rgba(0,0,0,0.25)] dark:drop-shadow-[0_18px_50px_rgba(0,0,0,0.55)] sm:scale-[1.06] lg:scale-[1.1]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

