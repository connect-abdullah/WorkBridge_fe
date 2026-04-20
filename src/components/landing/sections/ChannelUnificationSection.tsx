"use client";

import Image from "next/image";
import React, { forwardRef, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { User } from "lucide-react";

const Circle = forwardRef<
  HTMLDivElement,
  {
    className?: string;
    children?: React.ReactNode;
    label?: string;
    hideLabelOnDesktop?: boolean;
    onTop?: boolean;
  }
>(({ className, children, label, hideLabelOnDesktop, onTop }, ref) => {

  const labelDiv = label ? (
    <p
      className={cn(
        "text-center text-xs font-medium text-muted-foreground",
        hideLabelOnDesktop ? "md:hidden" : "",
      )}
    >
      {label}
    </p>
  ) : null;

  return (
    <div className="flex flex-col items-center gap-2">
      {onTop ? labelDiv : null}
      <div
        ref={ref}
        className={cn(
          "z-10 flex size-12 items-center justify-center rounded-full border border-border bg-background p-2 shadow-[0_0_20px_-12px_rgba(0,0,0,0.45)]",
          className,
        )}
      >
        {children}
      </div>
      {!onTop ? labelDiv : null}
    </div>
  );
});

Circle.displayName = "Circle";

function BrandLogo({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-6 w-6" />
  );
}

export function ChannelUnificationSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const linkedinRef = useRef<HTMLDivElement>(null);
  const twitterRef = useRef<HTMLDivElement>(null);
  const whatsappRef = useRef<HTMLDivElement>(null);
  const fiverrRef = useRef<HTMLDivElement>(null);
  const upworkRef = useRef<HTMLDivElement>(null);
  const clientRef = useRef<HTMLDivElement>(null);
  const workbridgeRef = useRef<HTMLDivElement>(null);
  const freelancerRef = useRef<HTMLDivElement>(null);

  const beamCommon = useMemo(
    () => ({
      pathColor: "hsl(var(--border))",
      pathOpacity: 0.35,
      gradientStartColor: "hsl(var(--primary))",
      gradientStopColor: "hsl(var(--foreground))",
    }),
    [],
  );

  return (
    <section className="px-4 pt-16 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Bring every client into one structured workflow.
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
            Clients come from everywhere; messages, referrals, platforms, and emails. WorkBridge centralizes everything into one structured system; so you can manage projects, handle approvals, deliver files, and track payments without scattered communication or constant follow-ups.
            </p>
          </div>

          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-3xl border border-border bg-card/30 p-5 shadow-md sm:p-8"
          >
            {/* Mobile: simplified, non-cluttered flow */}
            <div className="md:hidden">
              <div className="space-y-6">
                <div className="flex items-center justify-between gap-2 rounded-2xl border border-border bg-background/40 p-4">
                  <BrandLogo src="/brands/linkedin.svg" alt="LinkedIn" />
                  <BrandLogo src="/brands/x.svg" alt="X" />
                  <BrandLogo src="/brands/whatsapp.svg" alt="WhatsApp" />
                  <BrandLogo src="/brands/fiverr.svg" alt="Fiverr" />
                  <BrandLogo src="/brands/upwork.svg" alt="Upwork" />
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-px bg-border" />

                  <Circle className="size-16 bg-background" label="Client">
                    <User className="h-6 w-6 text-foreground" />
                  </Circle>

                  <div className="h-8 w-px bg-border" />

                  <Circle className="size-16 bg-background p-3" label="WorkBridge">
                    <div className="relative h-8 w-8">
                      <Image
                        src="/logo.png"
                        alt="WorkBridge logo"
                        fill
                        sizes="32px"
                        className="object-contain"
                      />
                    </div>
                  </Circle>

                  <div className="h-8 w-px bg-border" />

                  <Circle className="size-16 bg-background" label="Freelancer">
                    <User className="h-6 w-6 text-foreground" />
                  </Circle>
                </div>
              </div>
            </div>

            {/* Desktop/tablet: simplified graph (less clutter) */}
            <div className="hidden md:flex md:min-h-[320px] md:items-center md:justify-start md:gap-10">
              {/* Left: platforms (tight vertical list) */}
              <div className="flex w-[170px] flex-col items-center gap-4">
                <Circle
                  ref={linkedinRef}
                  label="LinkedIn"
                  hideLabelOnDesktop
                  className="md:mx-auto"
                >
                  <BrandLogo src="/brands/linkedin.svg" alt="LinkedIn" />
                </Circle>
                <Circle
                  ref={twitterRef}
                  label="X"
                  hideLabelOnDesktop
                  className="md:mx-auto"
                >
                  <BrandLogo src="/brands/x.svg" alt="X" />
                </Circle>
                <Circle
                  ref={whatsappRef}
                  label="WhatsApp"
                  hideLabelOnDesktop
                  className="md:mx-auto"
                >
                  <BrandLogo src="/brands/whatsapp.svg" alt="WhatsApp" />
                </Circle>
                <Circle
                  ref={fiverrRef}
                  label="Fiverr"
                  hideLabelOnDesktop
                  className="md:mx-auto"
                >
                  <BrandLogo src="/brands/fiverr.svg" alt="Fiverr" />
                </Circle>
                <Circle
                  ref={upworkRef}
                  label="Upwork"
                  hideLabelOnDesktop
                  className="md:mx-auto"
                >
                  <BrandLogo src="/brands/upwork.svg" alt="Upwork" />
                </Circle>
                <p className="mt-2 text-center text-xs font-medium text-muted-foreground">
                  Channels
                </p>
              </div>

              {/* Middle: client */}
              <div className="flex flex-col items-center gap-3">
                <Circle
                  ref={clientRef}
                  className="size-20 bg-background"
                  label="Client"
                >
                  <User className="h-7 w-7 text-foreground" />
                </Circle>
              </div>

              {/* Right: WorkBridge -> Freelancer (overlapping) */}
              <div className="flex w-[220px] flex-col items-center gap-10">
                <Circle
                  ref={workbridgeRef}
                  className="relative z-20 size-20 bg-background p-3"
                  label="WorkBridge"
                  onTop={true}
                >
                  <div className="relative h-9 w-9">
                    <Image
                      src="/logo.png"
                      alt="WorkBridge logo"
                      fill
                      sizes="36px"
                      className="object-contain"
                    />
                  </div>
                </Circle>

                <Circle
                  ref={freelancerRef}
                  className="relative z-30 -mt-8 size-20 bg-background md:translate-x-10"
                  label="Freelancer"
                >
                  <User className="h-7 w-7 text-foreground" />
                </Circle>
              </div>
            </div>

            <div className="hidden md:block">
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={linkedinRef}
                toRef={clientRef}
                curvature={18}
                delay={0.0}
                duration={6}
                {...beamCommon}
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={twitterRef}
                toRef={clientRef}
                curvature={12}
                delay={0.2}
                duration={6}
                {...beamCommon}
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={whatsappRef}
                toRef={clientRef}
                curvature={6}
                delay={0.4}
                duration={6}
                {...beamCommon}
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={fiverrRef}
                toRef={clientRef}
                curvature={-6}
                delay={0.6}
                duration={6}
                {...beamCommon}
              />
              <AnimatedBeam
                containerRef={containerRef}
                fromRef={upworkRef}
                toRef={clientRef}
                curvature={-12}
                delay={0.8}
                duration={6.0}
                {...beamCommon}
              />

              <AnimatedBeam
                containerRef={containerRef}
                fromRef={clientRef}
                toRef={workbridgeRef}
                curvature={0}
                delay={0.35}
                duration={4.0}
                {...beamCommon}
              />

              <AnimatedBeam
                containerRef={containerRef}
                fromRef={workbridgeRef}
                toRef={freelancerRef}
                curvature={125}
                delay={0.2}
                duration={5.0}
                startYOffset={36}
                endYOffset={-36}
                {...beamCommon}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

