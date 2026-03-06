"use client";

import { useRouter } from "next/navigation";

/**
 * REUSABLE COMPONENT - Glowing Icon Button
 * 
 * Purpose: Icon button with glowing hover effect
 * Features:
 * - Scales on hover/active
 * - Glows with accent color
 * - Uses Material Symbols icons
 * - Light/dark mode compatible
 * - Can navigate with href or handle clicks
 * 
 * Used for: Search, Add, Actions, etc.
 */

interface GlowIconButtonProps {
  icon: string;
  onClick?: () => void;
  href?: string;
  ariaLabel: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-10 h-10",
  md: "w-12 h-12",
  lg: "w-14 h-14",
};

const iconSizes = {
  sm: "!text-[32px]",
  md: "!text-[40px]",
  lg: "!text-[48px]",
};

export default function GlowIconButton({ 
  icon, 
  onClick,
  href,
  ariaLabel,
  size = "md" 
}: GlowIconButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center justify-center ${sizeClasses[size]} rounded-lg transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer group`}
      style={{
        backgroundColor: 'transparent',
      }}
      aria-label={ariaLabel}
    >
      <span
        className={`material-symbols-outlined ${iconSizes[size]} transition-all duration-200`}
        style={{
          color: 'var(--color-text)',
        }}
      >
        {icon}
      </span>

      <style jsx>{`
        button:hover .material-symbols-outlined {
          color: var(--color-accent);
          filter: drop-shadow(0 0 5px var(--color-accent))
                  drop-shadow(0 0 20px var(--color-accent));
        }
      `}</style>
    </button>
  );
}
