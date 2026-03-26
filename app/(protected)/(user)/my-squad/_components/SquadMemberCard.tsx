"use client";

import { Card, Stack, Text, Title } from "@mantine/core";
import type { FriendPublic } from "@/interfaces/interfaces";

export default function SquadMemberCard({ publicId, username }: FriendPublic) {
  return (
    <Card
      data-public-id={publicId}
      padding="xl"
      radius="28px"
      className="group relative h-full overflow-hidden transition-all duration-300 hover:-translate-y-1"
      style={{
        background: "var(--color-card-bg)",
        boxShadow:
          "inset 0 0 0 1px var(--color-card-border), 0 10px 30px -10px rgba(0,0,0,0.5)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[28px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: "inset 0 0 0 1px var(--color-primary)" }}
      />

      <Stack gap="md" h="100%" justify="space-between" className="relative z-10">
        <Stack gap="xs">
          <div className="flex items-start justify-between gap-3">
            <Text
              size="xs"
              fw={800}
              className="uppercase tracking-[0.25em] text-[var(--color-primary)] opacity-70"
            >
              Squad Member
            </Text>

            <span className="material-symbols-outlined text-lg text-[var(--color-card-text-muted)] opacity-50">
              diversity_3
            </span>
          </div>

          <Title
            order={3}
            className="min-w-0 break-words text-2xl font-bold leading-tight tracking-tight text-[var(--color-card-text)]"
          >
            {username}
          </Title>

          <Text
            size="sm"
            className="text-[var(--color-card-text-muted)] font-light leading-relaxed"
          >
            Part of your AlphaLearn crew.
          </Text>
        </Stack>

        <div className="flex items-center justify-between border-t border-[var(--color-card-border)] pt-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-card-text-muted)] opacity-70">
            Friend
          </span>

          <div className="flex gap-1">
            <div className="h-1 w-1 rounded-full bg-[var(--color-primary)] opacity-30" />
            <div className="h-1 w-1 rounded-full bg-[var(--color-primary)] opacity-50" />
            <div className="h-1 w-1 rounded-full bg-[var(--color-primary)]" />
          </div>
        </div>
      </Stack>
    </Card>
  );
}
