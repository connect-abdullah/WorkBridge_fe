import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { landingCopy } from "@/components/landing/landingCopy";
import { landingLoginCtaClassNames } from "@/components/landing/landingCtaStyles";

export function FinalCtaSection() {
  return (
    <section className="px-4 pb-10 pt-16 sm:pb-14 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card/40 to-card/20 p-8 sm:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {landingCopy.finalCta.headline}
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                {landingCopy.finalCta.subtitle}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Button asChild className={landingLoginCtaClassNames.heroAndBand}>
                <Link href="/auth/login">
                  {landingCopy.auth.login}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 rounded-full px-6 font-semibold"
              >
                <Link href="/auth/signup">{landingCopy.auth.signUp}</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
