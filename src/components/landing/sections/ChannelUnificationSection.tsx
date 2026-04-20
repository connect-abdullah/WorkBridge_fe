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
  }
>(({ className, children, label }, ref) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={ref}
        className={cn(
          "z-10 flex size-12 items-center justify-center rounded-full border border-border bg-background p-2 shadow-[0_0_20px_-12px_rgba(0,0,0,0.45)]",
          className,
        )}
      >
        {children}
      </div>
      {label ? (
        <p className="text-center text-xs font-medium text-muted-foreground">
          {label}
        </p>
      ) : null}
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
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Bring every client channel into one workflow.
            </h2>
            <p className="text-sm text-muted-foreground sm:text-base">
              Clients come from everywhere. WorkBridge gives you one place to run
              projects, approvals, and payments.
            </p>
          </div>

          <div
            ref={containerRef}
            className="relative w-full overflow-hidden rounded-3xl border border-border bg-card/30 p-6 sm:p-8"
          >
            <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
              <div className="grid grid-cols-3 gap-4 md:grid-cols-1">
                <Circle ref={linkedinRef} label="LinkedIn">
                  <BrandLogo src="/brands/linkedin.svg" alt="LinkedIn" />
                </Circle>
                <Circle ref={twitterRef} label="Twitter">
                  <BrandLogo src="/brands/x.svg" alt="X" />
                </Circle>
                <Circle ref={whatsappRef} label="WhatsApp">
                  <BrandLogo src="/brands/whatsapp.svg" alt="WhatsApp" />
                </Circle>
                <Circle ref={fiverrRef} label="Fiverr">
                  <BrandLogo src="/brands/fiverr.svg" alt="Fiverr" />
                </Circle>
                <Circle ref={upworkRef} label="Upwork">
                  <BrandLogo src="/brands/upwork.svg" alt="Upwork" />
                </Circle>
              </div>

              <Circle
                ref={clientRef}
                className="size-16 bg-background"
                label="Client"
              >
                <User className="h-6 w-6 text-foreground" />
              </Circle>

              <Circle
                ref={workbridgeRef}
                className="size-16 bg-background p-3"
                label="WorkBridge"
              >
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
            </div>

            <AnimatedBeam
              containerRef={containerRef}
              fromRef={linkedinRef}
              toRef={clientRef}
              curvature={-45}
              delay={0.0}
              duration={3.2}
              {...beamCommon}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={twitterRef}
              toRef={clientRef}
              curvature={-10}
              delay={0.25}
              duration={3.8}
              {...beamCommon}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={whatsappRef}
              toRef={clientRef}
              curvature={15}
              delay={0.55}
              duration={4.1}
              {...beamCommon}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={fiverrRef}
              toRef={clientRef}
              curvature={35}
              delay={0.85}
              duration={3.5}
              {...beamCommon}
            />
            <AnimatedBeam
              containerRef={containerRef}
              fromRef={upworkRef}
              toRef={clientRef}
              curvature={40}
              delay={1.15}
              duration={4.4}
              {...beamCommon}

            />

            <AnimatedBeam
              containerRef={containerRef}
              fromRef={clientRef}
              toRef={workbridgeRef}
              curvature={0}
              delay={0.35}
              duration={3.6}
              {...beamCommon}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

