export interface SelectOptionItem {
  label: string;
  value: string;
}

/** Builds a "Todos" + unique sorted values option list from the data actually on screen. */
export function optionsFrom(values: string[], allLabel = "Todos"): SelectOptionItem[] {
  const unique = Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, "es"));
  return [{ label: allLabel, value: "Todos" }, ...unique.map((v) => ({ label: v, value: v }))];
}
