export const inputCls =
  "h-10 w-full rounded-md border border-input bg-input-background px-3 text-sm text-input-foreground outline-none transition placeholder:text-neutral-500 dark:placeholder:text-neutral-600 focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-0";

export const selectCls =
  "h-10 w-full rounded-md border border-input bg-input-background px-3 text-sm text-input-foreground outline-none transition focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-0";

export function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`space-y-1.5 ${wide ? "md:col-span-2" : ""}`}>
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}
