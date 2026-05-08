"use client";

import Link from "next/link";
import { memo } from "react";
import { AlertCircle, Eye, Receipt } from "lucide-react";

import { PaymentActionButton } from "@/components/project-detail/components/PaymentActionButton";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import type { PaymentRead } from "@/lib/apis/payments/schema";
import { canShowFreelancerPaymentProof } from "@/lib/apis/payments/preview";
import {
  PaymentsMobileSkeletonList,
  PaymentsTableSkeletonRows,
} from "@/components/skeletons";
import {
  formatDate,
  formatMoney,
  getPaymentBadge,
  paymentStatusBadgeClassName,
  truncateTxnId,
} from "./payment-page-utils";

export type PaymentsListHandlers = {
  onRequestPayment: (paymentId: number) => void;
  onPayNow: (paymentId: number, projectId: number) => void;
  onApprove: (paymentId: number) => void;
  onNotApprove: (paymentId: number) => void;
  onPreviewProof: (payload: { url: string; title: string }) => void;
};

function PaymentRowActions({
  payment: p,
  isFreelancer,
  busy,
  handlers,
}: {
  payment: PaymentRead;
  isFreelancer: boolean;
  busy: boolean;
  handlers: PaymentsListHandlers;
}) {
  if (isFreelancer) {
    if (p.payment_status === "pending") {
      return (
        <PaymentActionButton
          label="Request payment"
          onClick={() => handlers.onRequestPayment(p.id)}
          disabled={busy}
          className="h-9 px-4"
        />
      );
    }
    return (
      <div className="flex flex-wrap items-center gap-2">
        {canShowFreelancerPaymentProof(p) ? (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 shrink-0 border-border/80 shadow-sm transition hover:bg-muted/80 hover:shadow"
            disabled={busy}
            aria-label="Preview submitted proof"
            title="Preview proof"
            onClick={() =>
              handlers.onPreviewProof({
                url: p.proof_of_payment!.trim(),
                title:
                  [p.project_title?.trim(), p.milestone_title?.trim()]
                    .filter(Boolean)
                    .join(" — ") || `Payment #${p.id}`,
              })
            }
          >
            <Eye className="h-4 w-4" />
          </Button>
        ) : null}
        {p.payment_status === "submitted" ? (
          <>
            <PaymentActionButton
              label="Approve"
              onClick={() => handlers.onApprove(p.id)}
              disabled={busy}
              className="h-9 px-4"
            />
            <PaymentActionButton
              label="Not approve"
              variant="destructive"
              onClick={() => handlers.onNotApprove(p.id)}
              disabled={busy}
              className="h-9 px-4"
            />
          </>
        ) : !canShowFreelancerPaymentProof(p) ? (
          <span className="text-xs text-muted-foreground">—</span>
        ) : null}
      </div>
    );
  }

  if (p.payment_status === "requested") {
    return (
      <PaymentActionButton
        label="Pay now"
        onClick={() => handlers.onPayNow(p.id, p.project_id)}
        disabled={busy}
        className="h-9 px-4"
      />
    );
  }

  return <span className="text-xs text-muted-foreground">—</span>;
}

const PaymentMobileCard = memo(function PaymentMobileCard({
  payment: p,
  isFreelancer,
  busy,
  handlers,
}: {
  payment: PaymentRead;
  isFreelancer: boolean;
  busy: boolean;
  handlers: PaymentsListHandlers;
}) {
  const badge = getPaymentBadge(p, isFreelancer ? "freelancer" : "client");
  const projectLabel = p.project_title?.trim() || `Project #${p.project_id}`;
  const milestoneLabel =
    p.milestone_title?.trim() || `Milestone #${p.milestone_id}`;
  const txn = p.transaction_id?.trim();

  return (
    <article
      className={cn(
        "rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition",
        "hover:border-border hover:shadow-md",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <Link
            href={`/projects/${p.project_id}`}
            className="block font-semibold leading-snug text-foreground underline-offset-4 hover:text-primary hover:underline"
          >
            {projectLabel}
          </Link>
          <Link
            href={`/projects/${p.project_id}`}
            className="block text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {milestoneLabel}
          </Link>
        </div>
        <StatusBadge
          status={badge.tone}
          label={badge.label}
          className={cn(
            "max-w-[min(13rem,70vw)] shrink-0 text-right text-xs capitalize leading-snug whitespace-normal",
            paymentStatusBadgeClassName(p.payment_status),
          )}
        />
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border/60 pt-3">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Amount
          </span>
          <span className="text-lg font-semibold tabular-nums tracking-tight text-foreground">
            {formatMoney(p.amount, p.currency)}
          </span>
        </div>

        <dl className="grid gap-1.5 text-xs text-muted-foreground">
          <div className="flex justify-between gap-3">
            <dt className="shrink-0 text-muted-foreground">Updated</dt>
            <dd className="text-right font-medium text-foreground">
              {formatDate(p.updated_at ?? p.created_at)}
            </dd>
          </div>
          {p.payment_status === "paid" && p.payment_approved_date ? (
            <div className="flex justify-between gap-3">
              <dt className="shrink-0">Approved</dt>
              <dd className="text-right font-medium text-foreground">
                {formatDate(p.payment_approved_date)}
              </dd>
            </div>
          ) : null}
          {txn ? (
            <div className="flex justify-between gap-3">
              <dt className="shrink-0">Transaction ID</dt>
              <dd className="max-w-[60%] break-all text-right font-mono text-[11px] text-foreground">
                {txn}
              </dd>
            </div>
          ) : null}
        </dl>
      </div>

      {!isFreelancer && p.last_failure_reason?.trim() ? (
        <p className="mt-3 flex gap-2 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{p.last_failure_reason.trim()}</span>
        </p>
      ) : null}

      <div className="mt-4 border-t border-border/60 pt-3">
        <PaymentRowActions
          payment={p}
          isFreelancer={isFreelancer}
          busy={busy}
          handlers={handlers}
        />
      </div>
    </article>
  );
});

const PaymentDesktopRow = memo(function PaymentDesktopRow({
  payment: p,
  isFreelancer,
  busy,
  handlers,
}: {
  payment: PaymentRead;
  isFreelancer: boolean;
  busy: boolean;
  handlers: PaymentsListHandlers;
}) {
  const badge = getPaymentBadge(p, isFreelancer ? "freelancer" : "client");
  const projectLabel = p.project_title?.trim() || `Project #${p.project_id}`;
  const milestoneLabel =
    p.milestone_title?.trim() || `Milestone #${p.milestone_id}`;
  const txn = p.transaction_id?.trim();

  return (
    <tr
      className={cn(
        "border-b border-border/60 transition-colors last:border-b-0",
        "hover:bg-muted/40",
      )}
    >
      <td className="px-4 py-3 align-top">
        <Link
          href={`/projects/${p.project_id}`}
          className="font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          {projectLabel}
        </Link>
        <div className="mt-1 text-sm text-muted-foreground">
          <Link
            href={`/projects/${p.project_id}`}
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            {milestoneLabel}
          </Link>
        </div>
        {txn ? (
          <p className="mt-1.5 font-mono text-[11px] text-muted-foreground">
            <span className="text-muted-foreground/80">Txn </span>
            <span className="text-foreground/90" title={txn}>
              {truncateTxnId(txn, 18)}
            </span>
          </p>
        ) : null}
      </td>
      <td className="px-4 py-3 align-top">
        <span className="text-base font-semibold tabular-nums text-foreground">
          {formatMoney(p.amount, p.currency)}
        </span>
      </td>
      <td className="px-4 py-3 align-top">
        <StatusBadge
          status={badge.tone}
          label={badge.label}
          className={cn(
            "whitespace-nowrap capitalize",
            paymentStatusBadgeClassName(p.payment_status),
          )}
        />
      </td>
      {!isFreelancer ? (
        <td className="max-w-[14rem] px-4 py-3 align-top text-xs text-muted-foreground">
          {p.last_failure_reason?.trim() ? (
            <span className="text-destructive">{p.last_failure_reason}</span>
          ) : (
            "—"
          )}
        </td>
      ) : null}
      <td className="whitespace-nowrap px-4 py-3 align-top text-sm text-muted-foreground">
        <div>{formatDate(p.updated_at ?? p.created_at)}</div>
        {p.payment_status === "paid" && p.payment_approved_date ? (
          <div className="mt-0.5 text-[11px] text-muted-foreground/90">
            Approved {formatDate(p.payment_approved_date)}
          </div>
        ) : null}
      </td>
      <td className="px-4 py-3 align-top">
        <PaymentRowActions
          payment={p}
          isFreelancer={isFreelancer}
          busy={busy}
          handlers={handlers}
        />
      </td>
    </tr>
  );
});

export const PaymentsListView = memo(function PaymentsListView({
  isFreelancer,
  sortBy,
  onSortChange,
  payments,
  isLoading,
  isError,
  busy,
  handlers,
}: {
  isFreelancer: boolean;
  sortBy: "latest" | "oldest";
  onSortChange: (v: "latest" | "oldest") => void;
  payments: PaymentRead[];
  isLoading: boolean;
  isError: boolean;
  busy: boolean;
  handlers: PaymentsListHandlers;
}) {
  const colCount = isFreelancer ? 5 : 6;

  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b border-border/80 bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Milestone payments
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {isFreelancer
              ? ""
              : "Pay milestones and track approval status."}
          </p>
        </div>
        <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
          <span className="sr-only">Sort</span>
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as "latest" | "oldest")
            }
            className="h-9 min-w-[10rem] rounded-lg border border-input bg-input-background px-3 text-sm font-medium text-input-foreground shadow-sm outline-none transition hover:bg-neutral-100 dark:hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </label>
      </div>

      <div className="p-3 md:hidden">
        {isLoading ? (
          <PaymentsMobileSkeletonList />
        ) : isError ? (
          <div className="rounded-2xl border border-destructive/25 bg-destructive/5 px-4 py-10 text-center text-sm text-destructive">
            Could not load payments. Try refreshing the page.
          </div>
        ) : payments.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/80 bg-muted/10 px-6 py-14 text-center">
            <Receipt
              className="h-10 w-10 text-muted-foreground/50"
              aria-hidden
            />
            <p className="max-w-sm text-sm text-muted-foreground">
              {isFreelancer
                ? "No milestone payments yet. Completed milestones will create payment records on each project."
                : "No payments yet. When a freelancer requests payment for a completed milestone, it will appear here."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <PaymentMobileCard
                key={p.id}
                payment={p}
                isFreelancer={isFreelancer}
                busy={busy}
                handlers={handlers}
              />
            ))}
          </div>
        )}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/25 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3.5">Project / milestone</th>
              <th className="px-4 py-3.5">Amount</th>
              <th className="px-4 py-3.5">Status</th>
              {!isFreelancer ? (
                <th className="px-4 py-3.5">Note</th>
              ) : null}
              <th className="px-4 py-3.5">Activity</th>
              <th className="px-4 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <PaymentsTableSkeletonRows colCount={colCount} />
            ) : isError ? (
              <tr>
                <td
                  colSpan={colCount}
                  className="px-4 py-12 text-center text-sm text-destructive"
                >
                  Could not load payments. Try refreshing the page.
                </td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="px-4 py-0">
                  <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-muted/10 py-16 text-center">
                    <Receipt
                      className="h-10 w-10 text-muted-foreground/50"
                      aria-hidden
                    />
                    <p className="max-w-md text-sm text-muted-foreground">
                      {isFreelancer
                        ? "No milestone payments yet."
                        : "No payments yet. When a freelancer requests payment for a completed milestone, it will appear here."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <PaymentDesktopRow
                  key={p.id}
                  payment={p}
                  isFreelancer={isFreelancer}
                  busy={busy}
                  handlers={handlers}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
});
