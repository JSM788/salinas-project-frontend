import type { ManagedCustomer } from "@/shared/api/customer-management";

export interface CustomerFilters {
  search: string;
  district: string;
  assigneeId: string;
  zone: string;
  condition: string;
  lastPurchase: string;
}
export const emptyCustomerFilters: CustomerFilters = {
  search: "",
  district: "",
  assigneeId: "",
  zone: "",
  condition: "",
  lastPurchase: "",
};

export function filterCustomers(
  customers: ManagedCustomer[],
  filters: CustomerFilters,
  now = Date.now(),
) {
  const search = filters.search.trim().toLocaleLowerCase();
  return customers.filter((customer) => {
    if (
      search &&
      !`${customer.name} ${customer.ruc ?? ""} ${customer.address}`
        .toLocaleLowerCase()
        .includes(search)
    )
      return false;
    if (filters.district && customer.district !== filters.district)
      return false;
    if (filters.zone && customer.zone !== filters.zone) return false;
    if (
      filters.assigneeId &&
      !customer.assignments.some(
        (assignment) => assignment.membershipId === filters.assigneeId,
      )
    )
      return false;
    if (filters.condition && customer.condition !== filters.condition)
      return false;
    if (filters.lastPurchase) {
      if (!customer.lastPurchaseDate) return false;
      const age =
        (now - Date.parse(`${customer.lastPurchaseDate}T00:00:00Z`)) / 86400000;
      if (filters.lastPurchase === "7_days" && (age < 0 || age > 7))
        return false;
      if (filters.lastPurchase === "30_days" && (age < 0 || age > 30))
        return false;
      if (filters.lastPurchase === "90_days" && age <= 90) return false;
    }
    return true;
  });
}

