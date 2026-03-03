"use client";

import { useMantineColorScheme } from "@mantine/core";

/**
 * THEME TOGGLE COMPONENT
 * 
 * Purpose: Toggle between light and dark mode
 * Integration: Uses Mantine's color scheme system
 * 
 * Features:
 * - Custom switch with sun/moon icons
 * - Animated sun rotation and moon tilt
 * - Smooth transitions
 * - Persists preference to localStorage automatically (via Mantine)
 * 
 * Usage: <ThemeToggle />
 */

export default function ThemeToggle() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <label className="relative inline-block w-16 h-[34px] cursor-pointer select-none">
      {/* Sun Icon */}
      <span 
        className="absolute top-[5px] left-[36px] z-[1] w-6 h-6 pointer-events-none transition-opacity duration-300"
        style={{ opacity: isDark ? 0 : 1 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="animate-[rotate_15s_linear_infinite]">
          <g fill="#ffd43b">
            <circle r={5} cy={12} cx={12} />
            <path d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z" />
          </g>
        </svg>
      </span>

      {/* Moon Icon */}
      <span 
        className="absolute top-[5px] left-[5px] z-[1] w-5 h-5 pointer-events-none transition-opacity duration-300"
        style={{ opacity: isDark ? 1 : 0 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="#73C0FC" className="animate-[tilt_5s_linear_infinite]">
          <path d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z" />
        </svg>
      </span>

      {/* Hidden Checkbox */}
      <input
        type="checkbox"
        checked={isDark}
        onChange={() => toggleColorScheme()}
        className="opacity-0 w-0 h-0"
        aria-label="Toggle color scheme"
      />

      {/* Slider Track */}
      <span
        className="absolute cursor-pointer top-0 left-0 right-0 bottom-0 rounded-[30px] transition-all duration-[400ms]"
        style={{
          backgroundColor: isDark ? '#183153' : '#73C0FC',
          boxShadow: isDark ? '0 0 1px #183153' : '0 0 1px #73C0FC',
        }}
      >
        {/* Slider Thumb */}
        <span
          className="absolute h-[30px] w-[30px] rounded-[20px] left-[2px] bottom-[2px] z-[2] bg-[#e8e8e8] transition-all duration-[400ms]"
          style={{
            transform: isDark ? 'translateX(30px)' : 'translateX(0)',
          }}
        />
      </span>

      <style jsx>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes tilt {
          0%, 100% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-10deg);
          }
          75% {
            transform: rotate(10deg);
          }
        }
      `}</style>
    </label>
  );
}
