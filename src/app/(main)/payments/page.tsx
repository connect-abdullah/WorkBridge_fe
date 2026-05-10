import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";

import PaymentsPage from "@/components/payment/payment-page";
import {
  fetchPaymentsReceived,
  fetchPaymentsSentRequested,
} from "@/lib/server-api/server/payments";
import { requireSession } from "@/lib/auth/session";
import { queryKeys } from "@/lib/queryApi";

export const dynamic = "force-dynamic";

export default async function PaymentsRoute() {
  const { user } = await requireSession();

  const queryClient = new QueryClient();
  if (user.role === "freelancer") {
    const received = await fetchPaymentsReceived();
    if (received) {
      queryClient.setQueryData(queryKeys.payments.received(user.id), received);
    }
  } else if (user.role === "client") {
    const sent = await fetchPaymentsSentRequested();
    if (sent) {
      queryClient.setQueryData(
        queryKeys.payments.sentRequested(user.id),
        sent,
      );
    }
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PaymentsPage />
    </HydrationBoundary>
  );
}
