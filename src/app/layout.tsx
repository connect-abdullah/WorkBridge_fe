import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { QueryProvider } from "@/lib/providers/query-provider";
import { ThemeApplicator } from "@/components/theme/ThemeApplicator";
import { Toaster } from "@/components/ui/sonner";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "WorkBridge | Freelancer-Client Platform",
  description:
    "WorkBridge connects clients with vetted freelancers and helps teams manage projects, milestones, and payments in one place.",
  applicationName: "WorkBridge",
  keywords: [
    "freelancer platform",
    "hire freelancers",
    "freelance marketplace",
    "client freelancer collaboration",
    "project management",
    "milestones",
    "invoicing",
    "payments",
    "remote work",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "WorkBridge | Freelancer-Client Platform",
    description:
      "WorkBridge connects clients with vetted freelancers and helps teams manage projects, milestones, and payments in one place.",
    siteName: "WorkBridge",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "WorkBridge",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkBridge | Freelancer-Client Platform",
    description:
      "WorkBridge connects clients with vetted freelancers and helps teams manage projects, milestones, and payments in one place.",
    images: ["/logo.png"],
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeApplicator />
        <Toaster />
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

