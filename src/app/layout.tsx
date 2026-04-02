import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { QueryProvider } from "@/lib/providers/query-provider";
import { ThemeApplicator } from "@/components/theme/ThemeApplicator";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: "WorkBridge",
  description: "Freelancer-Client collaboration platform UI",
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

