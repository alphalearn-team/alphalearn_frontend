"use client"

import { Button } from "@mantine/core";
import Link from "next/link";
import type { MouseEvent, ReactNode } from "react";

interface GlowButtonProps {
  href?: string;
  onClick?: (e?: MouseEvent<HTMLElement>) => void;
  children: ReactNode;
  icon?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function GlowButton({
  href,
  onClick,
  children,
  icon,
  size = "lg",
  className = "",
}: GlowButtonProps) {
  const isHashLink = href?.startsWith("#") ?? false;

  const handleHashClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isHashLink || !href) return;

    event.preventDefault();

    const targetId = href.slice(1);
    if (!targetId) return;

    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;

    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `#${targetId}`);
  };

  const innerContent = (
    <div className="relative group w-fit">
      <div className="absolute -inset-0.5 rounded-full blur-md opacity-0 group-hover:opacity-60 transition duration-500 bg-[var(--color-primary)]" />

      <Button
        size={size}
        radius="xl"
        onClick={!href ? onClick : undefined}
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
  );

  if (!href) {
    return innerContent;
  }

  return (
    <>
      {isHashLink ? (
        <a href={href} className="no-underline" onClick={handleHashClick}>
          {innerContent}
        </a>
      ) : (
        <Link href={href} className="no-underline" onClick={onClick}>
          {innerContent}
        </Link>
      )}
    </>
  );
}
