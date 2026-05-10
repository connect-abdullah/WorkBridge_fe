"use client";

import {
  LandingNavbar,
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
  return (
    <div className="min-h-screen scroll-smooth bg-background text-foreground">
      <LandingNavbar />

      <main className="pb-10">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeaturesSection />
        <ChannelUnificationSection />
        <HowItWorksSection />
        <SocialProofSection />
        <FinalCtaSection />
        <FaqSection />
      </main>

      <LandingFooter />
    </div>
  );
}
