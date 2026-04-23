export type PaymentStatus = "pending" | "in-progress" | "completed";

export type PaymentItem = {
  id: string;
  milestone: string;
  amount: string;
  status: PaymentStatus;
  date: string;
};

export const payments: PaymentItem[] = [
  {
    id: "p-1",
    milestone: "Discovery and Scope Alignment",
    amount: "$900",
    status: "completed",
    date: "Mar 08, 2026",
  },
  {
    id: "p-2",
    milestone: "Dashboard UX and UI System",
    amount: "$1,300",
    status: "in-progress",
    date: "Mar 24, 2026",
  },
  {
    id: "p-3",
    milestone: "Implementation and QA",
    amount: "$1,200",
    status: "pending",
    date: "Apr 12, 2026",
  },
] as const;
