"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Field,
  inputCls,
  selectCls,
} from "@/components/project-detail/components/Field";
import { Modal } from "@/components/project-detail/components/Modal";
import { Button } from "@/components/ui/button";
import { PaymentProofDropzone } from "@/components/payment/PaymentProofDropzone";
import { InvoicePreviewModal } from "@/components/payment/InvoicePreviewModal";
import {
  PaymentsListView,
  type PaymentsListHandlers,
} from "@/components/payment/PaymentsListView";
import { getDateValue } from "@/components/payment/payment-page-utils";
import { queryKeys, queryApi } from "@/lib/queryApi";
import { useSessionUser, useRole } from "@/lib/auth/user-context";
import type { PaymentMethod, PaymentRead } from "@/lib/apis/payments/schema";
import {
  approvePayment,
  failPayment,
  requestPayment,
  submitPayment,
} from "@/lib/apis/payments/payments";
import { uploadPaymentProofOnly } from "@/lib/apis/files/upload";
import { PaymentRequestCurrencyField } from "@/components/payment/PaymentRequestCurrencyField";

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "wise", label: "Wise" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "stripe", label: "Stripe" },
  { value: "other", label: "Other" },
];

export default function PaymentsPage() {
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
  const userId = useSessionUser().id;
  const role = useRole();
  const queryClient = useQueryClient();

  const invalidatePaymentCaches = useCallback(
    async (payment?: PaymentRead | null) => {
      if (userId > 0) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.payments.received(userId),
        });
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
    ...queryApi.payments.received(userId),
    enabled: role === "freelancer" && userId > 0,
    refetchOnMount: "always",
    refetchInterval: 15 * 1000,
  });

  const clientQuery = useQuery({
    ...queryApi.payments.sentRequested(userId),
    enabled: role === "client" && userId > 0,
    refetchOnMount: "always",
    refetchInterval: 15 * 1000,
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
  const [payContext, setPayContext] = useState<{
    paymentId: number;
    projectId: number;
  } | null>(null);
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

  const openRequest = useCallback((pid: number) => {
    setRequestPaymentId(pid);
    setReqMethod("wise");
    setReqLink("");
    setReqCurrency("USD");
    setRequestOpen(true);
  }, []);

  const openPay = useCallback((paymentId: number, projectId: number) => {
    setPayContext({ paymentId, projectId });
    setPayTxn("");
    setPayFile(null);
    setPayOpen(true);
  }, []);

  const openFail = useCallback((pid: number) => {
    setFailPaymentId(pid);
    setFailReason("");
    setFailOpen(true);
  }, []);

  const handleApprove = useCallback(
    (paymentId: number) => approveMut.mutate(paymentId),
    [approveMut],
  );

  const handlePreviewProof = useCallback(
    (payload: { url: string; title: string }) => setInvoicePreview(payload),
    [],
  );

  const listHandlers = useMemo<PaymentsListHandlers>(
    () => ({
      onRequestPayment: openRequest,
      onPayNow: openPay,
      onApprove: handleApprove,
      onNotApprove: openFail,
      onPreviewProof: handlePreviewProof,
    }),
    [openRequest, openPay, handleApprove, openFail, handlePreviewProof],
  );

  const busy =
    requestMut.isPending ||
    submitMut.isPending ||
    approveMut.isPending ||
    failMut.isPending ||
    payBusy;

  const freelancerRows = freelancerQuery.data?.data;
  const clientRows = clientQuery.data?.data;

  const sortedFreelancer = useMemo(() => {
    const rows = freelancerRows ?? [];
    return [...rows].sort((a, b) =>
      sortBy === "latest"
        ? getDateValue(b.created_at) - getDateValue(a.created_at)
        : getDateValue(a.created_at) - getDateValue(b.created_at),
    );
  }, [sortBy, freelancerRows]);

  const sortedClient = useMemo(() => {
    const rows = clientRows ?? [];
    return [...rows].sort((a, b) =>
      sortBy === "latest"
        ? getDateValue(b.created_at) - getDateValue(a.created_at)
        : getDateValue(a.created_at) - getDateValue(b.created_at),
    );
  }, [sortBy, clientRows]);

  const isFreelancer = role === "freelancer";
  const paymentsQuery = isFreelancer ? freelancerQuery : clientQuery;
  const sortedPayments = isFreelancer ? sortedFreelancer : sortedClient;

  return (
    <div className="mx-auto max-w-6xl space-y-6 sm:space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Payments
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
          {isFreelancer ? (
            <>
              Milestone payments where you are the{" "}
              <span className="font-medium text-foreground">freelancer</span>.
            </>
          ) : (
            <>
              Pay when a milestone is due, then track{" "}
              <span className="font-medium text-foreground">approval</span> and
              confirmation. You can also manage these from each project page.
            </>
          )}
        </p>
      </header>

      <PaymentsListView
        isFreelancer={isFreelancer}
        sortBy={sortBy}
        onSortChange={setSortBy}
        payments={sortedPayments}
        isLoading={paymentsQuery.isLoading}
        isError={paymentsQuery.isError}
        busy={busy}
        handlers={listHandlers}
      />

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
                payBusy || !payFile || !payTxn.trim() || payContext == null
              }
              onClick={async () => {
                if (!payFile || payContext == null) return;
                setPayBusy(true);
                try {
                  const up = await uploadPaymentProofOnly(payFile, userId);
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
