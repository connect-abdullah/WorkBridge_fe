import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { QueryProvider } from "@/lib/providers/query-provider";

export const metadata: Metadata = {
  title: "WorkBridge",
  description: "Freelancer-Client collaboration platform UI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

