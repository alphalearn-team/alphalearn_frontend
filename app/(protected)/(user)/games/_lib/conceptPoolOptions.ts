import type { ImposterConceptPoolMode } from "./gameSetup";

export const IMPOSTER_CONCEPT_POOL_OPTIONS: Array<{
  label: string;
  value: ImposterConceptPoolMode;
}> = [
  { label: "Current month pack", value: "CURRENT_MONTH_PACK" },
  { label: "Full concept pool", value: "FULL_CONCEPT_POOL" },
];

export function getConceptPoolModeLabel(mode: ImposterConceptPoolMode): string {
  return mode === "CURRENT_MONTH_PACK" ? "Current month pack" : "Full concept pool";
}
