"use client";

import Link from "next/link";
import { Card, Container, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

interface LearnerHomePageProps {
  weeklyQuestModule: ReactNode;
}

const quickLinks = [
  {
    href: "/lessons",
    eyebrow: "Keep learning",
    title: "Browse lessons",
    description: "Review community lessons and keep stacking progress.",
    icon: "menu_book",
  },
  {
    href: "/concepts",
    eyebrow: "Sharpen basics",
    title: "Explore concepts",
    description: "Study the key ideas that power each lesson and quest.",
    icon: "library_books",
  },
  {
    href: "/lessons/mine",
    eyebrow: "Track progress",
    title: "View my lessons",
    description: "Revisit your own lesson work and see what you have built so far.",
    icon: "inventory_2",
  },
];

export default function LearnerHomePage({ weeklyQuestModule }: LearnerHomePageProps) {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <section className="border-b border-[var(--color-border)]">
        <Container size="lg" className="py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <Stack gap="lg">
              <Stack gap="xs">
                <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
                  Learner Home
                </span>

                <Title
                  order={1}
                  className="text-[clamp(2.4rem,5vw,4.4rem)] font-bold tracking-tight leading-[1.05]"
                >
                  Train smarter every <span className="text-[var(--color-primary)]">week</span>
                </Title>

                <Text size="lg" className="max-w-2xl font-light leading-relaxed">
                  Check the current weekly concept, jump back into lessons, and stay on top of
                  what to learn next.
                </Text>
              </Stack>
            </Stack>
            {weeklyQuestModule}
          </div>
        </Container>
      </section>

      <Container size="lg" className="py-14 pb-32">
        <Stack gap="lg">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[var(--color-text-muted)] px-1">
              Start here
            </span>
          </div>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {quickLinks.map((link) => (
              <Card
                key={link.href}
                component={Link}
                href={link.href}
                radius="24px"
                padding="xl"
                className="h-full border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200 hover:-translate-y-1 hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-background-hover)]"
              >
                <Stack gap="md">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/12 text-[var(--color-primary)]">
                    <span className="material-symbols-outlined text-2xl">{link.icon}</span>
                  </div>

                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                      {link.eyebrow}
                    </p>
                    <h2 className="mt-3 text-xl font-semibold text-[var(--color-text)]">
                      {link.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {link.description}
                    </p>
                  </div>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Stack>
      </Container>
    </div>
  );
}
