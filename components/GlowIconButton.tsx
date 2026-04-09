"use client";

import { useRouter } from "next/navigation";


interface GlowIconButtonProps {
  icon: string;
  onClick?: () => void;
  href?: string;
  ariaLabel: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
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
  size = "md",
  disabled = false,
  className = "",
}: GlowIconButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (disabled) {
      return;
    }

    if (href) {
      router.push(href);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      type="button"
      disabled={disabled}
      className={`group relative flex items-center justify-center ${sizeClasses[size]} rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/10 text-[var(--color-primary)] shadow-[0_0_16px_var(--color-shadow)] transition-all duration-300 hover:scale-110 hover:border-[var(--color-primary)]/45 hover:bg-[var(--color-primary)]/20 hover:shadow-[0_0_26px_var(--color-shadow-hover)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100 ${className}`}
      aria-label={ariaLabel}
    >
      <span
        className={`material-symbols-outlined ${iconSizes[size]} transition-all duration-300`}
      >
        {icon}
      </span>

      <style jsx>{`
        button:hover .material-symbols-outlined {
          color: var(--color-primary);
          filter: drop-shadow(0 0 6px var(--color-shadow))
                  drop-shadow(0 0 16px var(--color-shadow-hover));
        }
      `}</style>
    </button>
  );
}
