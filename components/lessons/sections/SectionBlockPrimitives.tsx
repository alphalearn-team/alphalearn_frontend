"use client";

import type { CSSProperties, ReactNode } from "react";

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

function joinClasses(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}

interface SectionDisplayCardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function SectionDisplayCard({
  children,
  className,
  style,
}: SectionDisplayCardProps) {
  return (
    <div
      className={joinClasses("rounded-xl border border-[var(--color-border)]", className)}
      style={{
        backgroundColor: "var(--color-surface)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

interface SectionDisplayHeaderProps {
  icon: string;
  title: string;
  className?: string;
  titleClassName?: string;
  iconClassName?: string;
  iconStyle?: CSSProperties;
  titleStyle?: CSSProperties;
}

export function SectionDisplayHeader({
  icon,
  title,
  className,
  titleClassName,
  iconClassName,
  iconStyle,
  titleStyle,
}: SectionDisplayHeaderProps) {
  return (
    <div className={joinClasses("flex items-center gap-2", className)}>
      <span
        className={joinClasses("material-symbols-outlined", iconClassName)}
        style={iconStyle}
      >
        {icon}
      </span>
      <span className={titleClassName} style={titleStyle}>
        {title}
      </span>
    </div>
  );
}

export function SectionNumberBadge({ number }: { number: number }) {
  return (
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
      style={{
        backgroundColor: "var(--color-primary)",
        color: "var(--color-surface)",
      }}
    >
      {number}
    </div>
  );
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
