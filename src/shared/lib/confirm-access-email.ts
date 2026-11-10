import { accessActionLabel } from "@/shared/api/access-history";

export function confirmAccessEmail(email: string, status: "pending" | "accepted" | "expired"): boolean {
  return window.confirm(`¿${accessActionLabel(status)} a ${email}?`);
}
