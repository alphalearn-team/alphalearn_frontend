"use client";

import { Container, Stack, Title, Text, Group } from "@mantine/core";
import GlowButton from "@/components/GlowButton";

export default function ConceptsHeroSection() {
  return (
    <div className="border-b border-[var(--color-border)] min-h-screen flex">
      <Container className="my-auto w-full">
        <Stack gap="xl">
          <Stack gap="xs">
            <Group gap="xs" align="center">
              <div className="w-5 h-px bg-[var(--color-primary)]" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
                Core Concepts
              </span>
            </Group>

            <Title
              order={1}
              className="text-[clamp(2.4rem,5vw,4rem)] font-bold tracking-tight leading-[1.1]"
            >
              Build your{" "}
              <span className="text-[var(--color-primary)]">Foundations</span>
            </Title>

            <Text size="lg" className="max-w-xl font-light leading-relaxed">
              Explore the fundamental ideas and principles that lessons are built upon.
              Strengthen your understanding and gain mastery of the building blocks of knowledge.
            </Text>
          </Stack>

          <Group justify="flex-end">
            <GlowButton href="#concepts-list" className="!w-[248px] justify-center">
              Browse Concepts
            </GlowButton>
          </Group>
        </Stack>
      </Container>
    </div>
  );
}
