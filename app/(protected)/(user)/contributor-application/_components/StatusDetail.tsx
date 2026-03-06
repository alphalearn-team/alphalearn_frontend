"use client";

import { Text } from "@mantine/core";

type StatusDetailProps = {
  label: string;
  value: string;
  monospace?: boolean;
};

export default function StatusDetail({
  label,
  value,
  monospace = false,
}: StatusDetailProps) {
  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4">
      <Text size="xs" className="font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </Text>
      <Text
        size="sm"
        className={`mt-2 break-all text-[var(--color-text)] ${monospace ? "font-mono" : ""}`}
      >
        {value}
      </Text>
    </div>
  );
}
