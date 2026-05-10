"use client";

import * as Popover from "@radix-ui/react-popover";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { inputCls } from "@/components/project-detail/components/Field";
import { CURRENCY_OPTIONS } from "@/constants/currencies";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (code: string) => void;
  id?: string;
};

/**
 * Searchable currency field with a list anchored **below** the input (Radix
 * Popover `side="bottom"`). Shared by the payments page and project payment tab.
 */
export function PaymentRequestCurrencyField({ value, onChange, id }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const upper = value.trim().toUpperCase();

  useEffect(() => {
    if (open) setQuery(upper);
  }, [open, upper]);

  const filtered = useMemo(() => {
    const q = query.trim().toUpperCase();
    if (!q) return [...CURRENCY_OPTIONS];
    return CURRENCY_OPTIONS.filter(
      (c) => c.code.includes(q) || c.label.toUpperCase().includes(q),
    );
  }, [query]);

  const displayValue = open ? query : upper;

  const applyQuery = (raw: string) => {
    setQuery(raw);
    const code = raw.trim().toUpperCase();
    const exact = CURRENCY_OPTIONS.find((c) => c.code === code);
    if (exact) onChange(exact.code);
  };

  const pick = (code: string) => {
    onChange(code);
    setOpen(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      const q = query.trim().toUpperCase();
      const exact = CURRENCY_OPTIONS.find((c) => c.code === q);
      if (exact) onChange(exact.code);
    }
    setOpen(next);
  };

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange} modal={false}>
      <Popover.Anchor asChild>
        <div className="relative w-full">
          <input
            id={id}
            required
            autoComplete="off"
            spellCheck={false}
            className={cn(inputCls, "pr-9")}
            value={displayValue}
            onChange={(e) => applyQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search or select currency"
            aria-expanded={open}
            aria-controls="payment-currency-listbox"
            aria-autocomplete="list"
            role="combobox"
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label="Open currency list"
            className="absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setOpen((o) => !o)}
          >
            <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
          </button>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          id="payment-currency-listbox"
          role="listbox"
          side="bottom"
          align="start"
          sideOffset={4}
          avoidCollisions
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            "z-[200] max-h-60 overflow-y-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none",
            "w-[var(--radix-popover-trigger-width)]",
          )}
        >
          {filtered.length === 0 ? (
            <p className="px-2 py-3 text-sm text-muted-foreground">
              No matching currency
            </p>
          ) : (
            <ul className="py-0.5">
              {filtered.map((c) => (
                <li key={c.code} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={c.code === upper}
                    className="flex w-full flex-col items-start gap-0.5 rounded-sm px-2 py-2 text-left text-sm transition hover:bg-accent hover:text-accent-foreground"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(c.code)}
                  >
                    <span className="font-medium tabular-nums">{c.code}</span>
                    <span className="text-xs text-muted-foreground">
                      {c.label.includes("—")
                        ? c.label.split("—")[1]?.trim()
                        : c.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
