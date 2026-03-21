"use client"

import { Container, Group, Stack, Text, Title } from "@mantine/core";
import GlowButton from "@/components/GlowButton";
import type { UserRole } from "@/lib/auth/server/rbac";

export default function LessonsHeroSection({ role }: { role: UserRole }) {
  return (
    <div className="border-b border-[var(--color-border)] min-h-screen flex">
      <Container className="my-auto w-full">
        <Stack gap="xl">
          <Stack gap="xs">
            <Group gap="xs" align="center">
              <div className="w-5 h-px bg-[var(--color-primary)]" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
                Big Brain Hub
              </span>
            </Group>

            <Title
              order={1}
              className="text-[clamp(2.4rem,5vw,4rem)] font-bold tracking-tight leading-[1.1]"
            >
              Level Up Your <span className="text-[var(--color-primary)]">Skills</span>
            </Title>

            <Text size="lg" className="max-w-xl font-light leading-relaxed">
              Farm XP with interactive lessons. Learn peak skills. Gain elite ball knowledge.
            </Text>
          </Stack>

          {role === "CONTRIBUTOR" ? (
            <Stack align="flex-end" gap="sm">
              <GlowButton href="#lessons-list" className="!w-[248px] justify-center">
                View All Lessons
              </GlowButton>
              <GlowButton href="/lessons/mine" className="!w-[248px] justify-center">
                View My Lessons
              </GlowButton>
            </Stack>
          ) : (
            <Group justify="flex-end">
              <GlowButton href="#lessons-list" className="!w-[248px] justify-center">
                View All Lessons
              </GlowButton>
            </Group>
          )}
        </Stack>
      </Container>
    </div>
  );
}
