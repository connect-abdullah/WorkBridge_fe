"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { Field, inputCls } from "./Field";
import { lookupClientByEmail } from "@/lib/apis/projectInvites/projectInvites";
import type { UserRead } from "@/lib/apis/auth/schema";

const LOOKUP_DEBOUNCE_MS = 400;

export type ClientEmailLookupFieldProps = {
  label: string;
  labelWide?: boolean;
  hint?: string;
  /** Increment when the parent form should clear input, results, and selection. */
  resetKey: number | string;
  disabled?: boolean;
  selectedClient: UserRead | null;
  onSelectedClientChange: (client: UserRead | null) => void;
};

export function ClientEmailLookupField({
  label,
  labelWide,
  hint,
  resetKey,
  disabled,
  selectedClient,
  onSelectedClientChange,
}: ClientEmailLookupFieldProps) {
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [lookupStatus, setLookupStatus] = useState<
    "idle" | "loading" | "found" | "not_found"
  >("idle");
  const [hits, setHits] = useState<UserRead[]>([]);
  const lookupSeqRef = useRef(0);
  const blurTimerRef = useRef<number | null>(null);
  const resetKeyMountedRef = useRef(false);
  const onSelectedRef = useRef(onSelectedClientChange);
  onSelectedRef.current = onSelectedClientChange;

  const clearBlurTimer = () => {
    if (blurTimerRef.current != null) {
      window.clearTimeout(blurTimerRef.current);
      blurTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (!resetKeyMountedRef.current) {
      resetKeyMountedRef.current = true;
      return;
    }
    clearBlurTimer();
    setEmail("");
    setFocused(false);
    setLookupStatus("idle");
    setHits([]);
    lookupSeqRef.current += 1;
    onSelectedRef.current(null);
  }, [resetKey]);

  useEffect(() => {
    const q = email.trim();
    if (!q.includes("@") || q.length < 2) {
      lookupSeqRef.current += 1;
      setLookupStatus("idle");
      setHits([]);
      return;
    }
    const seq = ++lookupSeqRef.current;
    setLookupStatus("loading");
    setHits([]);
    const t = window.setTimeout(async () => {
      if (seq !== lookupSeqRef.current) return;
      try {
        const res = await lookupClientByEmail({ email: q });
        if (seq !== lookupSeqRef.current) return;
        if (!res.success || !res.data) {
          setHits([]);
          setLookupStatus("not_found");
          return;
        }
        const next = res.data;
        setHits(next);
        setLookupStatus(next.length > 0 ? "found" : "not_found");
      } catch {
        if (seq !== lookupSeqRef.current) return;
        setHits([]);
        setLookupStatus("not_found");
      }
    }, LOOKUP_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [email]);

  useEffect(() => {
    if (!selectedClient) return;
    const q = email.trim().toLowerCase();
    if (!q) {
      onSelectedRef.current(null);
      return;
    }
    const sel = selectedClient.email.toLowerCase();
    if (sel.startsWith(q) || q.startsWith(sel)) return;
    onSelectedRef.current(null);
  }, [email, selectedClient]);

  const body = (
    <>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      <div className="relative min-w-0">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onFocus={() => {
            clearBlurTimer();
            setFocused(true);
          }}
          onBlur={() => {
            clearBlurTimer();
            blurTimerRef.current = window.setTimeout(() => {
              setFocused(false);
              blurTimerRef.current = null;
            }, 200);
          }}
          placeholder="client@example.com"
          type="email"
          autoComplete="off"
          disabled={disabled}
          className={inputCls}
        />
        {focused && email.includes("@") && email.trim().length >= 2 ? (
          <div
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-md border border-border bg-card text-left shadow-lg"
            role="listbox"
            aria-label="Client search results"
          >
            {lookupStatus === "loading" ? (
              <div className="flex items-center gap-2 px-3 py-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                Searching…
              </div>
            ) : lookupStatus === "not_found" ? (
              <div className="px-3 py-3 text-sm text-muted-foreground">
                No matching client accounts (up to 3 shown).
              </div>
            ) : lookupStatus === "found" && hits.length > 0 ? (
              <ul className="max-h-52 divide-y divide-border overflow-y-auto py-0.5">
                {hits.map((hit) => (
                  <li key={hit.id}>
                    <button
                      type="button"
                      role="option"
                      className="flex w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left text-sm transition hover:bg-muted"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onSelectedRef.current(hit);
                        setEmail(hit.email);
                        clearBlurTimer();
                        setFocused(false);
                      }}
                    >
                      <span className="font-medium text-foreground">{hit.name}</span>
                      <span className="text-xs text-muted-foreground">{hit.email}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <Field label={label} wide={labelWide}>
      {body}
    </Field>
  );
}
