"use client";

import { useMemo, useState } from "react";
import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { payments as initialPayments, type PaymentItem } from "@/constants/payments";

type PaymentAction = "pay" | "invoice";

function getDateValue(date: string) {
  return new Date(date).getTime();
}

export default function PaymentsPage() {
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const [payments, setPayments] = useState<PaymentItem[]>(initialPayments);
  const [actions, setActions] = useState<Record<string, PaymentAction>>({
    "p-1": "invoice",
  });

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) =>
      sortBy === "latest"
        ? getDateValue(b.date) - getDateValue(a.date)
        : getDateValue(a.date) - getDateValue(b.date),
    );
  }, [sortBy, payments]);

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground">
          Track milestone payouts and invoices in one place.
        </p>
      </header>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <p className="text-sm font-medium text-foreground">Milestone payments</p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "latest" | "oldest")}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
          >
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Milestone</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-muted-foreground"
                  >
                    No payments available yet.
                  </td>
                </tr>
              ) : (
                sortedPayments.map((item) => {
                  const action = actions[item.id] ?? "pay";
                  return (
                    <tr
                      key={item.id}
                      className="border-t border-border/70 transition hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        {item.milestone}
                      </td>
                      <td className="px-4 py-3 text-foreground">{item.amount}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.date}</td>
                      <td className="px-4 py-3">
                        {action === "pay" ? (
                          <Button
                            className="h-8 px-4"
                            onClick={() => {
                              setPayments((prev) =>
                                prev.map((p) =>
                                  p.id === item.id ? { ...p, status: "completed" } : p,
                                ),
                              );
                              setActions((prev) => ({ ...prev, [item.id]: "invoice" }));
                            }}
                          >
                            Pay
                          </Button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button variant="outline" className="h-8 px-3">
                              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                              View Invoice
                            </Button>
                            <Button
                              variant="outline"
                              className="h-8 w-8 px-0"
                              title="Download Invoice"
                              aria-label="Download Invoice"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
