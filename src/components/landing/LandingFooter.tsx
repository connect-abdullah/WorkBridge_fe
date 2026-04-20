import Link from "next/link";
import { landingCopy } from "@/components/landing/landingCopy";

export function LandingFooter() {
  return (
    <footer className="px-4 pb-14 pt-6">
      <div className="mx-auto max-w-6xl border-t border-border pt-8">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <Link href="/" className="text-sm font-semibold text-foreground">
            {landingCopy.brand}
          </Link>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground md:justify-end">
            <a href="#features" className="hover:text-foreground">
              Features
            </a>
            <a href="#faq" className="hover:text-foreground">
              FAQ
            </a>
            <a href="#contact" className="hover:text-foreground">
              Contact
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {landingCopy.brand}. All rights reserved.
          </p>
          <p>Built for freelancers.</p>
        </div>

        <div id="contact" className="mt-6 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Contact</p>
          <p className="mt-1">
            Email:{" "}
            <a
              className="underline underline-offset-4 hover:text-foreground"
              href="mailto:insights.abdullah@gmail.com"
            >
              insights.abdullah@gmail.com
            </a>
          </p>
          <p className="mt-1">
            LinkedIn:{" "}
            <a
              className="underline underline-offset-4 hover:text-foreground"
              href="https://www.linkedin.com/in/mabdullahriaz2005/"
              target="_blank"
              rel="noreferrer"
            >
              mabdullahriaz2005
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

