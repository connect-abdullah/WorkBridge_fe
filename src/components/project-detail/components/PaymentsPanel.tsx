"use client";

import { Download } from "lucide-react";
import { type Milestone } from "@/constants/project-detail";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

export function PaymentsPanel({
  completedMilestones,
  paymentActions,
  onPay,
}: {
  completedMilestones: Milestone[];
  paymentActions: Record<string, "pay" | "invoice">;
  onPay: (milestoneId: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Milestone</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {completedMilestones.length === 0 ? (
            <tr>
              <td
                colSpan={4}
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                No completed milestones yet. Mark a milestone as completed to
                enable payment.
              </td>
            </tr>
          ) : (
            completedMilestones.map((ms) => {
              const action = paymentActions[ms.id] ?? "pay";
              return (
                <tr key={ms.id} className="border-t border-border">
                  <td className="px-4 py-3 font-medium">{ms.title}</td>
                  <td className="px-4 py-3">{ms.amount}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={action === "invoice" ? "paid" : "completed"}
                    />
                  </td>
                  <td className="px-4 py-3">
                    {action === "pay" ? (
                      <Button
                        className="h-8 px-4"
                        onClick={() => onPay(ms.id)}
                      >
                        Pay
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="h-8 w-9 px-0"
                        aria-label="Download Invoice"
                        title="Download Invoice"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </section>
  );
}
