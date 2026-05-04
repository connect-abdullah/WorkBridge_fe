"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusTone } from "@/components/ui/status-badge";
import { PaymentActionButton } from "@/components/project-detail/components/PaymentActionButton";
import { Modal } from "@/components/project-detail/components/Modal";
import {
  Field,
  inputCls,
  selectCls,
} from "@/components/project-detail/components/Field";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { getStoredUserId, queryKeys, queryApi } from "@/lib/queryApi";
import type { PaymentRead, PaymentMethod, PaymentStatus } from "@/lib/apis/payments/schema";
import {
  approvePayment,
  failPayment,
  requestPayment,
  submitPayment,
} from "@/lib/apis/payments/payments";
import { uploadPaymentProofOnly } from "@/lib/apis/files/upload";
import { PaymentProofDropzone } from "@/components/payment/PaymentProofDropzone";
import { canShowFreelancerPaymentProof } from "@/lib/apis/payments/preview";
import { InvoicePreviewModal } from "@/components/payment/InvoicePreviewModal";
import { useRole } from "@/lib/permissions";
import { clientPaymentStatusDisplay } from "@/lib/apis/payments/clientStatus";

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "wise", label: "Wise" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "stripe", label: "Stripe" },
  { value: "other", label: "Other" },
];

function getDateValue(iso: string | null | undefined) {
  if (!iso) return 0;
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function paymentStatusToBadge(status: PaymentStatus): { tone: StatusTone; label: string } {
  switch (status) {
    case "pending":
      return { tone: "pending", label: "Pending" };
    case "requested":
      return { tone: "in-progress", label: "Requested" };
    case "submitted":
      return { tone: "completed", label: "Submitted" };
    case "paid":
      return { tone: "paid", label: "Paid" };
    case "disputed":
      return { tone: "issue", label: "Disputed" };
    case "failed":
      return { tone: "issue", label: "Failed" };
    default:
      return { tone: "pending", label: status };
  }
}

function formatMoney(amount: number, currency: string | null) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return String(amount);
  }
}

function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export default function PaymentsPage() {
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const userId = getStoredUserId();
  const role = useRole();
  const queryClient = useQueryClient();

  const invalidatePaymentCaches = useCallback(
    async (payment?: PaymentRead | null) => {
      if (userId != null && userId > 0) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.payments.received(userId) });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.payments.sentRequested(userId),
        });
      }
      if (payment) {
        await queryClient.invalidateQueries({
          queryKey: ["payments", "listByProjectId", payment.project_id],
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.projects.detail(payment.project_id),
        });
      }
    },
    [queryClient, userId],
  );

  const freelancerQuery = useQuery({
    ...queryApi.payments.received(userId ?? 0),
    enabled: role === "freelancer" && userId != null && userId > 0,
  });

  const clientQuery = useQuery({
    ...queryApi.payments.sentRequested(userId ?? 0),
    enabled: role === "client" && userId != null && userId > 0,
  });

  const requestMut = useMutation({
    mutationFn: (vars: {
      paymentId: number;
      body: { payment_method: PaymentMethod; payment_link: string; currency: string };
    }) => requestPayment(vars.paymentId, vars.body),
    onSuccess: async (res) => {
      if (res.success === false) {
        toast.error(res.message || "Could not request payment");
        return;
      }
      toast.success(res.message || "Payment requested");
      await invalidatePaymentCaches(res.data ?? undefined);
    },
    onError: () => toast.error("Could not request payment"),
  });

  const submitMut = useMutation({
    mutationFn: (vars: { paymentId: number; proof: string; transactionId: string }) =>
      submitPayment(vars.paymentId, {
        proof_of_payment: vars.proof,
        transaction_id: vars.transactionId,
      }),
    onSuccess: async (res) => {
      if (res.success === false) {
        toast.error(res.message || "Submit failed");
        return;
      }
      toast.success(res.message || "Payment submitted");
      await invalidatePaymentCaches(res.data ?? undefined);
    },
    onError: () => toast.error("Submit failed"),
  });

  const approveMut = useMutation({
    mutationFn: (paymentId: number) => approvePayment(paymentId),
    onSuccess: async (res) => {
      if (res.success === false) {
        toast.error(res.message || "Approve failed");
        return;
      }
      toast.success("Payment approved");
      await invalidatePaymentCaches(res.data ?? undefined);
    },
    onError: () => toast.error("Approve failed"),
  });

  const failMut = useMutation({
    mutationFn: (vars: { paymentId: number; reason?: string | null }) =>
      failPayment(vars.paymentId, { failure_reason: vars.reason }),
    onSuccess: async (res) => {
      if (res.success === false) {
        toast.error(res.message || "Could not mark payment failed");
        return;
      }
      toast.success("Payment not approved — client can resubmit");
      await invalidatePaymentCaches(res.data ?? undefined);
    },
    onError: () => toast.error("Could not mark payment failed"),
  });

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestPaymentId, setRequestPaymentId] = useState<number | null>(null);
  const [reqMethod, setReqMethod] = useState<PaymentMethod>("wise");
  const [reqLink, setReqLink] = useState("");
  const [reqCurrency, setReqCurrency] = useState("USD");

  const [payOpen, setPayOpen] = useState(false);
  const [payContext, setPayContext] = useState<{ paymentId: number; projectId: number } | null>(
    null,
  );
  const [payTxn, setPayTxn] = useState("");
  const [payFile, setPayFile] = useState<File | null>(null);
  const [payBusy, setPayBusy] = useState(false);

  const [failOpen, setFailOpen] = useState(false);
  const [failPaymentId, setFailPaymentId] = useState<number | null>(null);
  const [failReason, setFailReason] = useState("");

  const [invoicePreview, setInvoicePreview] = useState<{
    url: string;
    title: string;
  } | null>(null);

  function openRequest(pid: number) {
    setRequestPaymentId(pid);
    setReqMethod("wise");
    setReqLink("");
    setReqCurrency("USD");
    setRequestOpen(true);
  }

  function openPay(paymentId: number, projectId: number) {
    setPayContext({ paymentId, projectId });
    setPayTxn("");
    setPayFile(null);
    setPayOpen(true);
  }

  function openFail(pid: number) {
    setFailPaymentId(pid);
    setFailReason("");
    setFailOpen(true);
  }

  const busy =
    requestMut.isPending ||
    submitMut.isPending ||
    approveMut.isPending ||
    failMut.isPending ||
    payBusy;

  const freelancerRows = freelancerQuery.data?.data ?? [];
  const clientRows = clientQuery.data?.data ?? [];

  const sortedFreelancer = useMemo(() => {
    return [...freelancerRows].sort((a, b) =>
      sortBy === "latest"
        ? getDateValue(b.created_at) - getDateValue(a.created_at)
        : getDateValue(a.created_at) - getDateValue(b.created_at),
    );
  }, [sortBy, freelancerRows]);

  const sortedClient = useMemo(() => {
    return [...clientRows].sort((a, b) =>
      sortBy === "latest"
        ? getDateValue(b.created_at) - getDateValue(a.created_at)
        : getDateValue(a.created_at) - getDateValue(b.created_at),
    );
  }, [sortBy, clientRows]);

  if (role !== "freelancer" && role !== "client") {
    return (
      <div className="space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground">
            Sign in as a freelancer or client to manage milestone payments here.
          </p>
        </header>
        <section className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          Sign in to see payments linked to your account.
        </section>
      </div>
    );
  }

  if (userId == null || userId <= 0) {
    return (
      <div className="space-y-5">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold text-foreground">Payments</h1>
        </header>
        <section className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          Sign in to continue.
        </section>
      </div>
    );
  }

  const isFreelancer = role === "freelancer";
  const paymentsQuery = isFreelancer ? freelancerQuery : clientQuery;
  const sortedPayments = isFreelancer ? sortedFreelancer : sortedClient;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground">
          {isFreelancer
            ? "All milestone payments where you are the freelancer — same actions as each project’s Payments tab."
            : "Your milestone payments: pay when due, then track approval and confirmation here or on each project."}
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
          <table className="min-w-[960px] w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Milestone</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                {!isFreelancer ? <th className="px-4 py-3">Note</th> : null}
                <th className="px-4 py-3">Updated</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {paymentsQuery.isLoading ? (
                <tr>
                  <td colSpan={isFreelancer ? 6 : 7} className="px-4 py-10 text-muted-foreground">
                    Loading payments…
                  </td>
                </tr>
              ) : paymentsQuery.isError ? (
                <tr>
                  <td colSpan={isFreelancer ? 6 : 7} className="px-4 py-10 text-destructive">
                    Could not load payments.
                  </td>
                </tr>
              ) : sortedPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={isFreelancer ? 6 : 7}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    {isFreelancer
                      ? "No milestone payments yet."
                      : "No payments yet. When a freelancer requests payment for a completed milestone, it will appear here."}
                  </td>
                </tr>
              ) : (
                sortedPayments.map((p: PaymentRead) => {
                  const badge = isFreelancer
                    ? paymentStatusToBadge(p.payment_status)
                    : clientPaymentStatusDisplay(p.payment_status);
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-border/70 transition hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/projects/${p.project_id}`}
                          className="font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {p.project_title?.trim() || `Project #${p.project_id}`}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        <Link
                          href={`/projects/${p.project_id}`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {p.milestone_title?.trim() || `Milestone #${p.milestone_id}`}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        {formatMoney(p.amount, p.currency)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={badge.tone} label={badge.label} />
                      </td>
                      {!isFreelancer ? (
                        <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">
                          {p.last_failure_reason ? (
                            <span className="text-destructive">{p.last_failure_reason}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                      ) : null}
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(p.updated_at ?? p.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {isFreelancer ? (
                          <>
                            {p.payment_status === "pending" ? (
                              <PaymentActionButton
                                label="Request Payment"
                                onClick={() => openRequest(p.id)}
                                disabled={busy}
                              />
                            ) : (
                              <div className="flex flex-wrap items-center gap-2">
                                {canShowFreelancerPaymentProof(p) ? (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 shrink-0"
                                    disabled={busy}
                                    aria-label="Preview submitted proof"
                                    title="Preview proof"
                                    onClick={() =>
                                      setInvoicePreview({
                                        url: p.proof_of_payment!.trim(),
                                        title:
                                          [
                                            p.project_title?.trim(),
                                            p.milestone_title?.trim(),
                                          ]
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
                                      onClick={() => approveMut.mutate(p.id)}
                                      disabled={busy}
                                    />
                                    <PaymentActionButton
                                      label="Not approve"
                                      variant="destructive"
                                      onClick={() => openFail(p.id)}
                                      disabled={busy}
                                    />
                                  </>
                                ) : !canShowFreelancerPaymentProof(p) ? (
                                  <span className="text-xs text-muted-foreground">—</span>
                                ) : null}
                              </div>
                            )}
                          </>
                        ) : p.payment_status === "requested" ? (
                          <PaymentActionButton
                            label="Pay Now"
                            onClick={() => openPay(p.id, p.project_id)}
                            disabled={busy}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
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

      <Modal
        open={requestOpen}
        onClose={() => !requestMut.isPending && setRequestOpen(false)}
        title="Request payment"
        subtitle="Share how the client should pay you."
        maxWidth="max-w-lg"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (requestPaymentId == null) return;
            requestMut.mutate(
              {
                paymentId: requestPaymentId,
                body: {
                  payment_method: reqMethod,
                  payment_link: reqLink.trim(),
                  currency: reqCurrency.trim().toUpperCase(),
                },
              },
              { onSuccess: () => setRequestOpen(false) },
            );
          }}
        >
          <Field label="Payment method">
            <select
              className={selectCls}
              value={reqMethod}
              onChange={(e) => setReqMethod(e.target.value as PaymentMethod)}
            >
              {PAYMENT_METHOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Payment link">
            <input
              className={inputCls}
              required
              value={reqLink}
              onChange={(e) => setReqLink(e.target.value)}
              placeholder="https://…"
            />
          </Field>
          <Field label="Currency">
            <input
              className={inputCls}
              required
              value={reqCurrency}
              onChange={(e) => setReqCurrency(e.target.value)}
              placeholder="USD"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRequestOpen(false)}
              disabled={requestMut.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={requestMut.isPending}>
              {requestMut.isPending ? "Saving…" : "Request"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        open={payOpen}
        onClose={() => !payBusy && setPayOpen(false)}
        title="Submit payment"
        subtitle="Pay externally using the freelancer’s instructions, then upload proof."
        maxWidth="max-w-lg"
      >
        <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Complete the payment using the method the freelancer shared.</li>
          <li>Save a screenshot of the confirmation.</li>
          <li>Upload the screenshot and enter the transaction ID.</li>
        </ol>
        <div className="space-y-4">
          <Field label="Payment screenshot" wide>
            <PaymentProofDropzone
              file={payFile}
              onFileChange={setPayFile}
              disabled={payBusy}
            />
          </Field>
          <Field label="Transaction ID">
            <input
              className={inputCls}
              value={payTxn}
              disabled={payBusy}
              onChange={(e) => setPayTxn(e.target.value)}
              placeholder="Reference from bank / Wise / etc."
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={payBusy}
              onClick={() => setPayOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                payBusy ||
                !payFile ||
                !payTxn.trim() ||
                payContext == null
              }
              onClick={async () => {
                if (!payFile || payContext == null) return;
                setPayBusy(true);
                try {
                  const up = await uploadPaymentProofOnly(payFile);
                  if (up.success === false || !up.data?.file_path) {
                    toast.error(up.message || "Upload failed");
                    return;
                  }
                  await submitMut.mutateAsync({
                    paymentId: payContext.paymentId,
                    proof: up.data.file_path,
                    transactionId: payTxn.trim(),
                  });
                  setPayOpen(false);
                } finally {
                  setPayBusy(false);
                }
              }}
            >
              {payBusy ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={failOpen}
        onClose={() => !failMut.isPending && setFailOpen(false)}
        title="Not approve payment"
        subtitle="Add an optional note for the client. They can submit payment proof again; previous proof stays in history."
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          <Field label="Note for client (optional)">
            <textarea
              className={`${inputCls} min-h-[88px]`}
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
              placeholder="e.g. wrong account, amount mismatch, proof unclear…"
            />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setFailOpen(false)}
              disabled={failMut.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={failMut.isPending || failPaymentId == null}
              onClick={() => {
                if (failPaymentId == null) return;
                failMut.mutate(
                  { paymentId: failPaymentId, reason: failReason.trim() || null },
                  { onSuccess: () => setFailOpen(false) },
                );
              }}
            >
              {failMut.isPending ? "Saving…" : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>

      <InvoicePreviewModal
        open={invoicePreview != null}
        onClose={() => setInvoicePreview(null)}
        url={invoicePreview?.url ?? null}
        title={invoicePreview?.title}
      />
    </div>
  );
}
