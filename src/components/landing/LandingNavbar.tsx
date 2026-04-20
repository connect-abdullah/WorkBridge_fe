"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { landingCopy } from "@/components/landing/landingCopy";

export function LandingNavbar({
  onJoinWaitlist,
  className,
}: {
  onJoinWaitlist: () => void;
  className?: string;
}) {
  return (
    <header className={cn("sticky top-4 z-50 w-full px-4", className)}>
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-full border border-border/60 bg-background/60 px-4 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/45">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full px-2 py-1 text-sm font-semibold text-foreground hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="relative h-12 w-14 overflow-hidden bg-background p-1">
            <Image
              src="/logo.png"
              alt="WorkBridge logo"
              fill
              sizes="32px"
              className="object-contain"
              priority
            />
          </span>
          <span className="text-lg font-semibold">{landingCopy.brand}</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <a
            href="#features"
            className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            How it works
          </a>
          <a
            href="#faq"
            className="rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-accent/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <AnimatedThemeToggler className="hidden sm:inline-flex" />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-10 w-10 rounded-full md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[320px]">
              <SheetHeader className="text-left">
                <SheetTitle>{landingCopy.brand}</SheetTitle>
              </SheetHeader>

              <div className="mt-6 grid gap-2">
                <SheetClose asChild>
                  <a
                    href="#features"
                    className="rounded-lg border border-border bg-card/40 px-4 py-3 text-sm font-medium text-foreground hover:bg-card/60"
                  >
                    Features
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <a
                    href="#how-it-works"
                    className="rounded-lg border border-border bg-card/40 px-4 py-3 text-sm font-medium text-foreground hover:bg-card/60"
                  >
                    How it works
                  </a>
                </SheetClose>
                <SheetClose asChild>
                  <a
                    href="#faq"
                    className="rounded-lg border border-border bg-card/40 px-4 py-3 text-sm font-medium text-foreground hover:bg-card/60"
                  >
                    FAQ
                  </a>
                </SheetClose>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-xl border border-border bg-card/40 p-3">
                <p className="text-sm font-medium text-foreground">Theme</p>
                <AnimatedThemeToggler />
              </div>

              <div className="mt-6 grid gap-2">
                <SheetClose asChild>
                  <Button onClick={onJoinWaitlist} className="h-11 w-full">
                    {landingCopy.hero.primaryCta}
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button variant="outline" className="h-11 w-full" asChild>
                    <Link href="/dashboard">Go to dashboard</Link>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
          <Button
            onClick={onJoinWaitlist}
            className="h-10 rounded-full px-4"
          >
            {landingCopy.hero.primaryCta}
          </Button>
        </div>
      </div>
    </header>
  );
}

