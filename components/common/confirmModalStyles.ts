export type ConfirmColor = "red" | "orange" | "green" | "yellow" | "blue";

const colorClassMap: Record<ConfirmColor, { bg: string; text: string }> = {
  red: {
    bg: "bg-red-500/10",
    text: "text-red-500",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-500",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-500",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-500",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-500",
  },
};

const colorStyleMap: Record<ConfirmColor, { defaultBg: string; hoverBg: string }> = {
  red: {
    defaultBg: "#ef4444",
    hoverBg: "#dc2626",
  },
  orange: {
    defaultBg: "var(--color-primary)",
    hoverBg: "var(--color-primary-hover)",
  },
  green: {
    defaultBg: "#22c55e",
    hoverBg: "#16a34a",
  },
  yellow: {
    defaultBg: "#eab308",
    hoverBg: "#ca8a04",
  },
  blue: {
    defaultBg: "#2563eb",
    hoverBg: "#1d4ed8",
  },
};

export function getConfirmColorClasses(confirmColor: ConfirmColor) {
  return colorClassMap[confirmColor];
}

export function getConfirmButtonStyles(confirmColor: ConfirmColor) {
  const colorStyle = colorStyleMap[confirmColor];

  return {
    root: {
      backgroundColor: colorStyle.defaultBg,
      "&:hover": {
        backgroundColor: colorStyle.hoverBg,
      },
    },
  };
}
