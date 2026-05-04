export type PaymentStatus =
  | "pending"
  | "requested"
  | "submitted"
  | "paid"
  | "failed"
  | "disputed";

export type PaymentMethod =
  | "wise"
  | "bank_transfer"
  | "paypal"
  | "stripe"
  | "other";

export interface PaymentRead {
  id: number;
  amount: number;
  sender_id: number;
  receiver_id: number;
  project_id: number;
  milestone_id: number;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  payment_link: string | null;
  currency: string | null;
  transaction_id: string | null;
  proof_of_payment: string | null;
  payment_approved_date: string | null;
  payment_submitted_date: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  last_failure_reason?: string | null;
  project_title?: string | null;
  milestone_title?: string | null;
}

export interface PaymentRequestBody {
  payment_method: PaymentMethod;
  payment_link: string;
  currency: string;
}

export interface PaymentSubmitBody {
  proof_of_payment: string;
  transaction_id: string;
}

export interface PaymentFailBody {
  failure_reason?: string | null;
}
