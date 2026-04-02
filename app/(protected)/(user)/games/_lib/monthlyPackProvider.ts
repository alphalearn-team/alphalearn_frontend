import type {
  LearnerCurrentImposterMonthlyPack,
  LearnerImposterMonthlyPackWeeklyFeaturedSlot,
} from "@/interfaces/interfaces";
import { ApiError } from "@/lib/api/apiErrors";
import { apiClientFetch } from "@/lib/api/apiClient";

const LEARNER_CURRENT_IMPOSTER_MONTHLY_PACK_ENDPOINT = "/me/imposter/monthly-pack/current";
const DEFAULT_WEEKLY_SLOTS = [1, 2, 3, 4] as const;

function toSlotDefaults(slot: number): LearnerImposterMonthlyPackWeeklyFeaturedSlot {
  return {
    weekSlot: slot,
    revealed: false,
    conceptPublicId: null,
    conceptTitle: null,
  };
}

function normalizeWeeklySlots(
  slots: LearnerImposterMonthlyPackWeeklyFeaturedSlot[] | null | undefined,
): LearnerImposterMonthlyPackWeeklyFeaturedSlot[] {
  const slotMap = new Map<number, LearnerImposterMonthlyPackWeeklyFeaturedSlot>();

  for (const slot of slots ?? []) {
    if (!Number.isInteger(slot.weekSlot) || slot.weekSlot < 1 || slot.weekSlot > 4) {
      continue;
    }

    slotMap.set(slot.weekSlot, {
      weekSlot: slot.weekSlot,
      revealed: Boolean(slot.revealed),
      conceptPublicId: slot.conceptPublicId ?? null,
      conceptTitle: slot.conceptTitle ?? null,
    });
  }

  return DEFAULT_WEEKLY_SLOTS.map((slot) => slotMap.get(slot) ?? toSlotDefaults(slot));
}

function normalizeMonthlyPack(
  pack: LearnerCurrentImposterMonthlyPack | null | undefined,
): LearnerCurrentImposterMonthlyPack {
  if (!pack || !pack.exists) {
    return {
      exists: false,
      yearMonth: pack?.yearMonth ?? null,
      visibleConcepts: [],
      weeklyFeaturedSlots: normalizeWeeklySlots(pack?.weeklyFeaturedSlots),
    };
  }

  return {
    exists: true,
    yearMonth: pack.yearMonth ?? null,
    visibleConcepts: Array.isArray(pack.visibleConcepts)
      ? pack.visibleConcepts.map((concept) => ({
          conceptPublicId: concept.conceptPublicId,
          title: concept.title,
          weeklyFeatured: Boolean(concept.weeklyFeatured),
          weekSlot: concept.weekSlot ?? null,
        }))
      : [],
    weeklyFeaturedSlots: normalizeWeeklySlots(pack.weeklyFeaturedSlots),
  };
}

export async function fetchLearnerCurrentImposterMonthlyPack(
  accessToken: string,
): Promise<LearnerCurrentImposterMonthlyPack> {
  const response = await apiClientFetch<LearnerCurrentImposterMonthlyPack>(
    LEARNER_CURRENT_IMPOSTER_MONTHLY_PACK_ENDPOINT,
    accessToken,
  );

  return normalizeMonthlyPack(response);
}

export function toFriendlyLearnerCurrentMonthlyPackError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      return "Current monthly pack is not available yet.";
    }

    if (error.status >= 500) {
      return "We could not load the monthly pack right now. Please try again soon.";
    }

    return error.message || "We could not load the monthly pack right now.";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "We could not load the monthly pack right now.";
}
