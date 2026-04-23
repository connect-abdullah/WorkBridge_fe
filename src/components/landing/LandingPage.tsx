"use client";

import { useCallback, useState } from "react";
import {
  LandingNavbar,
  WaitlistModal,
  HeroSection,
  ProblemSection,
  SolutionSection,
  ChannelUnificationSection,
  FeaturesSection,
  HowItWorksSection,
  SocialProofSection,
  FaqSection,
  FinalCtaSection,
  LandingFooter,
} from "@/components/landing/__init__";

export default function LandingPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const openWaitlist = useCallback(() => setWaitlistOpen(true), []);

  return (
    <div className="min-h-screen scroll-smooth bg-background text-foreground">
      <LandingNavbar onJoinWaitlist={openWaitlist} />

      <main className="pb-10">
        <HeroSection onJoinWaitlist={openWaitlist} />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <ChannelUnificationSection />
        <HowItWorksSection />
        <SocialProofSection />
        <FinalCtaSection onJoinWaitlist={openWaitlist} />
        <FaqSection />
      </main>

      <LandingFooter />

      <WaitlistModal open={waitlistOpen} onOpenChange={setWaitlistOpen} />
    </div>
  );
}
