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
    defaultBg: "var(--color-error)",
    hoverBg: "color-mix(in srgb, var(--color-error) 85%, black)",
  },
  orange: {
    defaultBg: "var(--color-primary)",
    hoverBg: "color-mix(in srgb, var(--color-primary) 85%, black)",
  },
  green: {
    defaultBg: "var(--color-success)",
    hoverBg: "color-mix(in srgb, var(--color-success) 85%, black)",
  },
  yellow: {
    defaultBg: "var(--color-warning)",
    hoverBg: "color-mix(in srgb, var(--color-warning) 85%, black)",
  },
  blue: {
    defaultBg: "var(--color-info)",
    hoverBg: "color-mix(in srgb, var(--color-info) 85%, black)",
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
