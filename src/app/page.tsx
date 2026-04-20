"use client";

import { useCallback, useState } from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { WaitlistModal } from "@/components/landing/WaitlistModal";
import { HeroSection } from "@/components/landing/sections/HeroSection";
import { ProblemSection } from "@/components/landing/sections/ProblemSection";
import { SolutionSection } from "@/components/landing/sections/SolutionSection";
import { ChannelUnificationSection } from "@/components/landing/sections/ChannelUnificationSection";
import { FeaturesSection } from "@/components/landing/sections/FeaturesSection";
import { HowItWorksSection } from "@/components/landing/sections/HowItWorksSection";
import { SocialProofSection } from "@/components/landing/sections/SocialProofSection";
import { FaqSection } from "@/components/landing/sections/FaqSection";
import { FinalCtaSection } from "@/components/landing/sections/FinalCtaSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

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

