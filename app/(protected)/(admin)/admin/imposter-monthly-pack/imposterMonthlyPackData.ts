import type { AdminConcept, AdminImposterMonthlyPack } from "@/interfaces/interfaces";
import { fetchAdminConcepts } from "../concepts/conceptsData";
import { fetchAdminImposterMonthlyPack } from "@/lib/utils/imposterMonthlyPack";

const YEAR_MONTH_PATTERN = /^\d{4}-\d{2}$/;

export function resolveYearMonthFromQuery(value?: string) {
  const fallback = new Date().toISOString().slice(0, 7);
  if (!value) {
    return fallback;
  }

  return YEAR_MONTH_PATTERN.test(value) ? value : fallback;
}

export async function fetchImposterMonthlyPackPageData(
  yearMonth: string,
): Promise<{ concepts: AdminConcept[]; pack: AdminImposterMonthlyPack }> {
  const [concepts, pack] = await Promise.all([
    fetchAdminConcepts(),
    fetchAdminImposterMonthlyPack(yearMonth),
  ]);

  return {
    concepts: Array.isArray(concepts) ? concepts : [],
    pack,
  };
}
