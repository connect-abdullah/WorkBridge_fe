"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type Milestone } from "@/constants/project-detail";
import { StatusBadge } from "@/components/ui/status-badge";
import type { StatusTone } from "@/components/ui/status-badge";
import { PaymentActionButton } from "@/components/project-detail/components/PaymentActionButton";
import { PaymentProofDropzone } from "@/components/payment/PaymentProofDropzone";
import { Modal } from "@/components/project-detail/components/Modal";
import {
  Field,
  inputCls,
  selectCls,
} from "@/components/project-detail/components/Field";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import type { PaymentRead, PaymentMethod } from "@/lib/apis/payments/schema";
import {
  approvePayment,
  failPayment,
  requestPayment,
  submitPayment,
} from "@/lib/apis/payments/payments";
import { uploadPaymentProofOnly } from "@/lib/apis/files/upload";
import { canShowFreelancerPaymentProof } from "@/lib/apis/payments/preview";
import { InvoicePreviewModal } from "@/components/payment/InvoicePreviewModal";
import { PaymentsPanelTableSkeleton } from "@/components/skeletons";
import { queryKeys } from "@/lib/queryApi";
import { useSessionUser } from "@/lib/auth/user-context";
import type { Permissions } from "@/lib/permissions";
import {
  clientCanSubmitPaymentProof,
  clientPaymentStatusDisplay,
  clientPaymentSubmitButtonLabel,
  clientResubmitFreelancerNote,
} from "@/lib/apis/payments/clientStatus";
import { PaymentRequestCurrencyField } from "@/components/payment/PaymentRequestCurrencyField";

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "wise", label: "Wise" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "stripe", label: "Stripe" },
  { value: "other", label: "Other" },
];

function paymentStatusBadge(status: PaymentRead["payment_status"]): {
  tone: StatusTone;
  label: string;
} {
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

export function PaymentsPanel({
  projectId,
  payments,
  paymentsLoading,
  completedMilestones,
  permissions,
}: {
  projectId: number;
  payments: PaymentRead[];
  paymentsLoading: boolean;
  completedMilestones: Milestone[];
  permissions: Permissions;
}) {
  const queryClient = useQueryClient();
  const detailKey = queryKeys.projects.detail(projectId);
  const userId = useSessionUser().id;

  const invalidatePaymentData = async () => {
    await queryClient.invalidateQueries({
      queryKey: ["payments", "listByProjectId", projectId],
    });
    // Keep the global /payments page in sync after actions (submit/request/approve/fail).
    if (Number.isFinite(userId) && userId > 0) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.payments.received(userId),
      });
      await queryClient.invalidateQueries({
        queryKey: queryKeys.payments.sentRequested(userId),
      });
    }
    await queryClient.invalidateQueries({ queryKey: detailKey });
  };

  const requestMut = useMutation({
    mutationFn: (vars: {
      paymentId: number;
      body: {
        payment_method: PaymentMethod;
        payment_link: string;
        currency: string;
      };
    }) => requestPayment(vars.paymentId, vars.body),
    onSuccess: async (res) => {
      if (res.success === false) {
        toast.error(res.message || "Could not request payment");
        return;
      }
      toast.success(res.message || "Payment requested");
      await invalidatePaymentData();
    },
    onError: () => toast.error("Could not request payment"),
  });

  const submitMut = useMutation({
    mutationFn: (vars: {
      paymentId: number;
      proof: string;
      transactionId: string;
    }) =>
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
      await invalidatePaymentData();
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
      await invalidatePaymentData();
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
      await invalidatePaymentData();
    },
    onError: () => toast.error("Could not mark payment failed"),
  });

  const [requestOpen, setRequestOpen] = useState(false);
  const [requestPaymentId, setRequestPaymentId] = useState<number | null>(null);
  const [reqMethod, setReqMethod] = useState<PaymentMethod>("wise");
  const [reqLink, setReqLink] = useState("");
  const [reqCurrency, setReqCurrency] = useState("USD");

  const [payOpen, setPayOpen] = useState(false);
  const [payPaymentId, setPayPaymentId] = useState<number | null>(null);
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

  const paymentByMilestone = useMemo(() => {
    const m = new Map<number, PaymentRead>();
    for (const p of payments) m.set(p.milestone_id, p);
    return m;
  }, [payments]);

  function openRequest(pid: number) {
    setRequestPaymentId(pid);
    setReqMethod("wise");
    setReqLink("");
    setReqCurrency("USD");
    setRequestOpen(true);
  }

  function openPay(pid: number) {
    setPayPaymentId(pid);
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

  if (!permissions.canPayPayment && !permissions.canRequestPayment) {
    return (
      <section className="overflow-hidden rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground shadow-sm">
        Only the freelancer or assigned client can manage milestone payments for
        this project.
      </section>
    );
  }

  if (permissions.canPayPayment) {
    return (
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Milestone</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {paymentsLoading ? (
                <PaymentsPanelTableSkeleton />
              ) : payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No payments yet. When the freelancer requests payment for a
                    completed milestone, it will show here with status updates
                    as you pay.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const ms = completedMilestones.find(
                    (m) => Number(m.id) === p.milestone_id,
                  );
                  const badge = clientPaymentStatusDisplay(p.payment_status);
                  return (
                    <tr key={p.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">
                        {ms?.title ?? `Milestone #${p.milestone_id}`}
                      </td>
                      <td className="px-4 py-3">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: p.currency || "USD",
                          maximumFractionDigits: 0,
                        }).format(p.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={badge.tone} label={badge.label} />
                      </td>
                      <td className="max-w-xs px-4 py-3 text-xs text-muted-foreground">
                        {p.last_failure_reason ? (
                          <span className="text-destructive">
                            {p.last_failure_reason}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.payment_status === "requested" ? (
                          <PaymentActionButton
                            label="Pay Now"
                            onClick={() => openPay(p.id)}
                            disabled={busy}
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Modal
          open={payOpen}
          onClose={() => !payBusy && setPayOpen(false)}
          title="Submit payment"
          subtitle="Pay externally using the freelancer’s instructions, then upload proof."
          maxWidth="max-w-lg"
        >
          <ol className="mb-4 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              Complete the payment using the method the freelancer shared.
            </li>
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
                  payBusy || !payFile || !payTxn.trim() || payPaymentId == null
                }
                onClick={async () => {
                  if (!payFile || payPaymentId == null) return;
                  setPayBusy(true);
                  try {
                    const up = await uploadPaymentProofOnly(payFile, userId);
                    if (up.success === false || !up.data?.file_path) {
                      toast.error(up.message || "Upload failed");
                      return;
                    }
                    await submitMut.mutateAsync({
                      paymentId: payPaymentId,
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
      </section>
    );
  }

  /* Freelancer view */
  return (
    <>
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
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
              {paymentsLoading ? (
                <PaymentsPanelTableSkeleton />
              ) : completedMilestones.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No completed milestones yet. Mark a milestone as completed
                    to enable payment.
                  </td>
                </tr>
              ) : (
                completedMilestones.map((ms) => {
                  const mid = Number(ms.id);
                  const p = paymentByMilestone.get(mid);
                  const badge = p
                    ? paymentStatusBadge(p.payment_status)
                    : { tone: "pending" as const, label: "No record" };
                  return (
                    <tr key={ms.id} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{ms.title}</td>
                      <td className="px-4 py-3">{ms.amount}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={badge.tone} label={badge.label} />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {ms.dueDate}
                      </td>
                      <td className="px-4 py-3">
                        {!p ? (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        ) : p.payment_status === "pending" ? (
                          permissions.canRequestPayment ? (
                            <PaymentActionButton
                              label="Request Payment"
                              onClick={() => openRequest(p.id)}
                              disabled={busy}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              —
                            </span>
                          )
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
                                    title: ms.title,
                                  })
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            ) : null}
                            {p.payment_status === "submitted" ? (
                              <>
                                {permissions.canApprovePayment ? (
                                  <PaymentActionButton
                                    label="Approve"
                                    onClick={() => approveMut.mutate(p.id)}
                                    disabled={busy}
                                  />
                                ) : null}
                                {permissions.canFailPayment ? (
                                  <PaymentActionButton
                                    label="Not approve"
                                    variant="destructive"
                                    onClick={() => openFail(p.id)}
                                    disabled={busy}
                                  />
                                ) : null}
                              </>
                            ) : !canShowFreelancerPaymentProof(p) ? (
                              <span className="text-xs text-muted-foreground">
                                —
                              </span>
                            ) : null}
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
                {
                  onSuccess: () => setRequestOpen(false),
                },
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
              <PaymentRequestCurrencyField
                value={reqCurrency}
                onChange={setReqCurrency}
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
                    {
                      paymentId: failPaymentId,
                      reason: failReason.trim() || null,
                    },
                    { onSuccess: () => setFailOpen(false) },
                  );
                }}
              >
                {failMut.isPending ? "Saving…" : "Confirm"}
              </Button>
            </div>
          </div>
        </Modal>
      </section>

      <InvoicePreviewModal
        open={invoicePreview != null}
        onClose={() => setInvoicePreview(null)}
        url={invoicePreview?.url ?? null}
        title={invoicePreview?.title}
      />
    </>
  );
}
