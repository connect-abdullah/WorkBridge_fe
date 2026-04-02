"use client";

import { BriefcaseBusiness } from "lucide-react";
import { ReactNode } from "react";

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen bg-muted/30 lg:grid-cols-2">
      <section className="hidden border-r border-border bg-card p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold">WorkBridge</p>
            <p className="text-sm text-muted-foreground">Freelancer-Client Hub</p>
          </div>
        </div>

        <div className="max-w-md space-y-4">
          <h1 className="text-3xl font-semibold leading-tight text-foreground">
            Built for focused collaboration, delivery, and payment clarity.
          </h1>
          <p className="text-base text-muted-foreground">
            A clean workspace where freelancers and clients stay aligned on
            milestones, approvals, and outcomes.
          </p>
        </div>

        <p className="text-sm text-muted-foreground">WorkBridge SaaS Platform</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-sm sm:p-8">
          <header className="mb-6 space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </header>
          {children}
        </div>
      </section>
    </div>
  );
}
