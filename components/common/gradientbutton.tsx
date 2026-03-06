"use client"

import { Button } from "@mantine/core";
import Link from "next/link";
import type { ReactNode } from "react";

interface GradientButtonProps {
  href: string;
  children: ReactNode;
  icon?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function GradientButton({
  href,
  children,
  icon,
  size = "lg",
  className = "",
}: GradientButtonProps) {
  const isHashLink = href.startsWith("#");
  const Wrapper = isHashLink ? "a" : Link;

  return (
    <Wrapper
      href={href}
      className="no-underline"
    >
      <div className="relative group w-fit">
        {/* 1. THE UNDER-GLOW 
            Uses the theme primary color so the glow follows light/dark mode.
        */}
        <div className="absolute -inset-0.5 rounded-full blur-md opacity-0 group-hover:opacity-60 transition duration-500 bg-[var(--color-primary)]" />

        <Button
          size={size}
          radius="xl"
          leftSection={
            icon ? (
              <span className="material-symbols-outlined text-[20px] transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
                {icon}
              </span>
            ) : undefined
          }
          className={`
            relative overflow-hidden transition-all duration-300
            hover:scale-[1.03] active:scale-95
            !bg-[var(--color-primary)] hover:!bg-[var(--color-primary-hover)] active:!bg-[var(--color-primary-active)]
            !text-[var(--color-surface)] shadow-[0_0_20px_var(--color-shadow)] hover:shadow-[0_0_30px_var(--color-shadow-hover)]
            before:absolute before:top-0 before:-left-full before:w-full before:h-full 
            before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent 
            before:transition-all before:duration-500 hover:before:left-full
            ${className}
          `}
        >
          <span className="relative z-10">{children}</span>
        </Button>
      </div>
    </Wrapper>
  );
}
