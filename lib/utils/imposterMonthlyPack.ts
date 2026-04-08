import type {
  AdminImposterMonthlyPack,
  SaveAdminImposterMonthlyPackRequest,
} from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api/api";

const ADMIN_IMPOSTER_MONTHLY_PACK_BASE_PATH = "/admin/games/monthly-packs";

function normalizeMonthValue(yearMonth: string) {
  const normalizedYearMonth = yearMonth.trim();
  if (!/^\d{4}-\d{2}$/.test(normalizedYearMonth)) {
    throw new Error("Month must use yyyy-MM format");
  }

  return normalizedYearMonth;
}

function normalizePack(pack: AdminImposterMonthlyPack): AdminImposterMonthlyPack {
  return {
    yearMonth: pack.yearMonth,
    exists: Boolean(pack.exists),
    concepts: Array.isArray(pack.concepts) ? pack.concepts : [],
    weeklyFeaturedConceptPublicIds: Array.isArray(pack.weeklyFeaturedConceptPublicIds)
      ? pack.weeklyFeaturedConceptPublicIds
      : [],
  };
}

export async function fetchAdminImposterMonthlyPack(
  yearMonth: string,
): Promise<AdminImposterMonthlyPack> {
  const normalizedYearMonth = normalizeMonthValue(yearMonth);
  const pack = await apiFetch<AdminImposterMonthlyPack>(
    `${ADMIN_IMPOSTER_MONTHLY_PACK_BASE_PATH}?yearMonth=${encodeURIComponent(normalizedYearMonth)}`,
  );

  return normalizePack(pack);
}

export async function fetchCurrentAdminImposterMonthlyPack(): Promise<AdminImposterMonthlyPack> {
  const pack = await apiFetch<AdminImposterMonthlyPack>(
    `${ADMIN_IMPOSTER_MONTHLY_PACK_BASE_PATH}?scope=CURRENT`,
  );

  return normalizePack(pack);
}

export async function saveAdminImposterMonthlyPack(
  yearMonth: string,
  payload: SaveAdminImposterMonthlyPackRequest,
): Promise<AdminImposterMonthlyPack> {
  const normalizedYearMonth = normalizeMonthValue(yearMonth);
  const pack = await apiFetch<AdminImposterMonthlyPack>(
    `${ADMIN_IMPOSTER_MONTHLY_PACK_BASE_PATH}/${encodeURIComponent(normalizedYearMonth)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  return normalizePack(pack);
}
