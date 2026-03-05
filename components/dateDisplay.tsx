"use client";

import { useMemo } from "react";
import { Text } from "@mantine/core";

interface DateDisplayProps {
  date: string;
  size?: string;
  className?: string;
}

export function DateDisplay({ date, size, className }: DateDisplayProps) {
  const formatted = useMemo(() => new Date(date).toLocaleDateString(), [date]);

  if (!formatted) return null;

  return (
    <Text 
      size={size} 
      className={className}
    >
      {formatted}
    </Text>
  );
}
