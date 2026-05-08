export type CurrencyOption = {
  code: string;
  label: string;
};

/** Common currencies for WorkBridge payments. */
export const CURRENCY_OPTIONS: readonly CurrencyOption[] = [
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
  { code: "INR", label: "INR — Indian Rupee" },
] as const;

