"use client";

import { Download, ExternalLink } from "lucide-react";
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
      <div className="overflow-x-auto">
      <table className="min-w-[640px] w-full text-left text-sm">
        <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Milestone</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {completedMilestones.length === 0 ? (
            <tr>
              <td
                colSpan={5}
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
                  <td className="px-4 py-3 text-muted-foreground">{ms.dueDate}</td>
                  <td className="px-4 py-3">
                    {action === "pay" ? (
                      <Button
                        className="h-8 px-4"
                        onClick={() => onPay(ms.id)}
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
                          aria-label="Download Invoice"
                          title="Download Invoice"
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
  );
}
