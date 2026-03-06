"use client";

import { Text, Tooltip, Stack, Title } from "@mantine/core";
import type { Concept } from "@/interfaces/interfaces";
import ContentCardShell from "@/components/common/contentCardShell";
import { formatShortDate } from "@/lib/formatDate";

type ConceptCardProps = Concept;

export default function ConceptCard({
  publicId,
  title,
  description,
  createdAt,
}: ConceptCardProps) {
  return (
    <ContentCardShell
      href={`/concepts/${publicId}`}
      background="var(--color-card-bg)"
      borderColor="var(--color-card-border)"
      glow="none"
      hoverBorderColor="var(--color-primary)"
    >
      <Stack gap="md" h="100%" justify="space-between" className="relative z-10">
        <Stack gap="xs">
          <div className="flex justify-between items-start">
            <Text size="xs" fw={800} className="uppercase tracking-[0.25em] text-[var(--color-primary)] opacity-70">
              Concept
            </Text>
            <Tooltip label="Explore concept" position="top" withArrow>
              <span className="material-symbols-outlined text-[var(--color-card-text-muted)] opacity-40 group-hover:opacity-80 transition-opacity text-lg">
                arrow_outward
              </span>
            </Tooltip>
          </div>

          <Title
            order={3}
            className="text-2xl font-extrabold tracking-tight leading-tight text-[var(--color-card-text)] group-hover:text-[var(--color-primary)] transition-colors"
          >
            {title}
          </Title>

          <Text size="sm" className="text-[var(--color-card-text-muted)] line-clamp-3 font-light leading-relaxed">
            {description}
          </Text>
        </Stack>

        <div className="pt-4 border-t border-[var(--color-card-border)] flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-card-text-muted)] opacity-70">
            {formatShortDate(createdAt)}
          </span>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-[var(--color-primary)] opacity-30" />
            <div className="w-1 h-1 rounded-full bg-[var(--color-primary)] opacity-50" />
            <div className="w-1 h-1 rounded-full bg-[var(--color-primary)]" />
          </div>
        </div>
      </Stack>
    </ContentCardShell>
  );
}
