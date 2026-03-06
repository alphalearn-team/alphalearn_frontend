"use client";

import Link from "next/link";
import { Card } from "@mantine/core";
import type { ReactNode } from "react";

interface ContentCardShellProps {
  href: string;
  children: ReactNode;
  background: string;
  glow: string;
  borderColor?: string;
  hoverBorderColor?: string;
}

export default function ContentCardShell({
  href,
  children,
  background,
  glow,
  borderColor = "rgba(255,255,255,0.05)",
  hoverBorderColor,
}: ContentCardShellProps) {
  return (
    <Card
      component={Link}
      href={href}
      padding="xl"
      radius="28px"
      className="relative overflow-hidden h-full transition-all duration-500 border-none group-hover:-translate-y-2 group"
      style={{
        background,
        boxShadow: `inset 0 0 0 1px ${borderColor}, 0 10px 30px -10px rgba(0,0,0,0.5)`,
      }}
    >
      {glow !== "none" && (
        <div
          className="absolute inset-0 transition-opacity duration-500 pointer-events-none opacity-0 group-hover:opacity-100"
          style={{ background: glow }}
        />
      )}

      {hoverBorderColor && (
        <div
          className="absolute inset-0 rounded-[28px] transition-opacity duration-300 pointer-events-none opacity-0 group-hover:opacity-100"
          style={{ boxShadow: `inset 0 0 0 1px ${hoverBorderColor}` }}
        />
      )}

      {children}
    </Card>
  );
}
