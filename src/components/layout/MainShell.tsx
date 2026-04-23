import { ReactNode } from "react";

export function MainShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-card">
        <div className="container flex h-16 items-center justify-between">
          <span className="font-semibold">Project Template</span>
        </div>
      </header>
      <main className="container flex-1 py-8">{children}</main>
      <footer className="border-t bg-card">
        <div className="container py-4 text-xs text-muted-foreground">
          Starter template.
        </div>
      </footer>
    </div>
  );
}
