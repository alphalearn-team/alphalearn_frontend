"use client";

interface ProgressBarProps {
  value: number;
  max: number;
  completed?: boolean;
  size?: "sm" | "md";
}

export default function ProgressBar({
  value,
  max,
  completed = false,
  size = "md",
}: ProgressBarProps) {
  const percent = max === 0 ? (completed ? 100 : 0) : Math.min(100, Math.round((value / max) * 100));
  const height = size === "sm" ? "4px" : "8px";

  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, background: "var(--color-input)" }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{
          width: `${percent}%`,
          background: completed
            ? "var(--color-success)"
            : "linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-primary) 70%, white))",
        }}
      />
    </div>
  );
}
