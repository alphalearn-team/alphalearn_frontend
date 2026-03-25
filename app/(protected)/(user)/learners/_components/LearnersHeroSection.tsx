"use client";

import { Container, Group, Stack, Text, Title } from "@mantine/core";
import GlowButton from "@/components/GlowButton";

export default function LearnersHeroSection() {
  return (
    <div className="border-b border-[var(--color-border)] min-h-screen flex">
      <Container className="my-auto w-full">
        <Stack gap="xl">
          <Stack gap="xs">
            <Group gap="xs" align="center">
              <div className="w-5 h-px bg-[var(--color-primary)]" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
                Learner Directory
              </span>
            </Group>

            <Title
              order={1}
              className="text-[clamp(2.4rem,5vw,4rem)] font-bold tracking-tight leading-[1.1]"
            >
              Find fellow <span className="text-[var(--color-primary)]">learners</span>
            </Title>

            <Text size="lg" className="max-w-2xl font-light leading-relaxed">
              Browse everyone currently visible in AlphaLearn and filter the directory by
              username without leaving the page.
            </Text>
          </Stack>

          <Group justify="flex-end">
            <GlowButton href="#learners-list" className="!w-[248px] justify-center">
              Browse Learners
            </GlowButton>
          </Group>
        </Stack>
      </Container>
    </div>
  );
}
