"use client";

import type { ReactNode } from "react";

type FieldStyleOptions = {
  backgroundColor?: string;
  color?: string;
  fontSize?: string;
  fontStyle?: string;
  lineHeight?: number;
};

export function createSectionFieldStyles(options: FieldStyleOptions = {}) {
  return {
    label: {
      color: "var(--color-text-muted)",
      marginBottom: "8px",
      fontWeight: 700,
      textTransform: "uppercase",
      fontSize: "0.75rem",
      letterSpacing: "0.2em",
    },
    input: {
      backgroundColor: options.backgroundColor ?? "var(--color-surface)",
      borderColor: "var(--color-border)",
      color: options.color ?? "var(--color-text)",
      ...(options.fontSize ? { fontSize: options.fontSize } : {}),
      ...(options.fontStyle ? { fontStyle: options.fontStyle } : {}),
      ...(options.lineHeight ? { lineHeight: options.lineHeight } : {}),
    },
  };
}

interface EditableItemCardProps {
  children: ReactNode;
  onRemove: () => void;
  removeLabel?: string;
  title: string;
}

export function EditableItemCard({
  children,
  onRemove,
  removeLabel = "Remove item",
  title,
}: EditableItemCardProps) {
  return (
    <div
      className="rounded-xl border border-[var(--color-border)] p-4"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <span
          className="text-xs font-bold uppercase tracking-[0.2em]"
          style={{ color: "var(--color-text-muted)" }}
        >
          {title}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-1 text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300"
          title={removeLabel}
        >
          <span className="material-symbols-outlined text-lg">delete</span>
        </button>
      </div>

      <div className="space-y-3">{children}</div>
    </div>
  );
}
