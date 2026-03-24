import { Button, ButtonProps } from "@mantine/core";
import React from "react";

interface CommonButtonProps extends ButtonProps, Omit<React.ComponentPropsWithoutRef<"button">, "color" | "style"> {
  children: React.ReactNode;
}

/**
 * A shared button component that uses the premium AlphaLearn color palette
 * (primary background, surface text, and subtle shadow) without the 
 * interactive glow/scale effects of the GlowButton.
 */
export default function CommonButton({ children, className = "", ...props }: CommonButtonProps) {
  return (
    <Button
      radius="xl"
      className={`!bg-[var(--color-primary)] hover:!bg-[var(--color-primary-hover)] active:!bg-[var(--color-primary-active)] !text-[var(--color-surface)] shadow-[0_0_20px_var(--color-shadow)] ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}
