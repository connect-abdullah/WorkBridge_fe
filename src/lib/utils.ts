import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function getNameValidationError(name: string): string {
  if (!name.trim()) return "Name is required.";
  if (name.trim().length < 2) return "Name must be at least 2 characters.";
  return "";
}

export function getEmailValidationError(email: string): string {
  if (!email.trim()) return "Email is required.";
  if (!EMAIL_REGEX.test(email)) return "Enter a valid email.";
  return "";
}

export function getPasswordValidationError(
  password: string,
  options?: { required?: boolean; minLength?: number },
): string {
  const required = options?.required ?? true;
  const minLength = options?.minLength ?? 8;

  if (!password) return required ? "Password is required." : "";
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters.`;
  }
  return "";
}

export function getConfirmPasswordValidationError(
  password: string,
  confirmPassword: string,
): string {
  if (!confirmPassword) return "";
  if (getPasswordValidationError(password, { required: false })) {
    return "Password must be at least 8 characters.";
  }
  if (password !== confirmPassword) return "Passwords do not match.";
  return "";
}

export function toLocalDateTime(isoLike: string): string {
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const min = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}
