"use client";

import Link from "next/link";
import { Card, Container, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import type { LearnerCurrentWeeklyQuest } from "@/interfaces/interfaces";

interface LearnerHomePageProps {
  weeklyQuest: LearnerCurrentWeeklyQuest | null;
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

export default function LearnerHomePage({ weeklyQuest }: LearnerHomePageProps) {
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
                  Check the current weekly focus, jump back into lessons, and stay on top of
                  what to learn next.
                </Text>
              </Stack>
            </Stack>

            <QuestOfTheWeekCard weeklyQuest={weeklyQuest} />
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

function QuestOfTheWeekCard({ weeklyQuest }: LearnerHomePageProps) {
  if (!weeklyQuest) {
    return null;
  }

  return (
    <Card
      radius="28px"
      padding="xl"
      className="border border-[var(--color-primary)]/25 bg-[linear-gradient(160deg,rgba(214,158,46,0.18),rgba(18,18,18,0.94))] shadow-[0_24px_80px_-42px_rgba(214,158,46,0.75)]"
    >
      <Stack gap="lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Quest of the Week
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              {weeklyQuest.concept.title}
            </h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-primary)]/30 bg-black/20 text-[var(--color-primary)]">
            <span className="material-symbols-outlined text-2xl">bolt</span>
          </div>
        </div>

        {weeklyQuest.concept.description ? (
          <Text size="sm" className="leading-relaxed text-[var(--color-text-secondary)]">
            {weeklyQuest.concept.description}
          </Text>
        ) : null}

        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Current quest
          </p>
          <h3 className="mt-3 text-xl font-semibold text-[var(--color-text)]">
            {weeklyQuest.quest.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {weeklyQuest.quest.instructionText}
          </p>
        </div>
      </Stack>
    </Card>
  );
}
