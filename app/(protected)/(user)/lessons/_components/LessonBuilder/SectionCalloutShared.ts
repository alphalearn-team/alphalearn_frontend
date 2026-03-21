import type { CalloutVariant } from "@/interfaces/interfaces";

export const CALLOUT_VARIANTS: {
  value: CalloutVariant;
  label: string;
  icon: string;
  borderColor: string;
  background: string;
}[] = [
  {
    value: "info",
    label: "Info",
    icon: "info",
    borderColor: "var(--color-info)",
    background: "rgba(59, 130, 246, 0.08)",
  },
  {
    value: "warning",
    label: "Warning",
    icon: "warning",
    borderColor: "var(--color-warning)",
    background: "rgba(245, 158, 11, 0.08)",
  },
  {
    value: "tip",
    label: "Tip",
    icon: "lightbulb",
    borderColor: "var(--color-success)",
    background: "rgba(34, 197, 94, 0.08)",
  },
  {
    value: "note",
    label: "Note",
    icon: "edit_note",
    borderColor: "var(--color-primary)",
    background: "rgba(156, 163, 175, 0.08)",
  },
];

export function getCalloutVariantConfig(variant: CalloutVariant) {
  return CALLOUT_VARIANTS.find((item) => item.value === variant) || CALLOUT_VARIANTS[0];
}
