import Link from "next/link";
import { Card, Skeleton, Stack, Text } from "@mantine/core";
import type { LearnerCurrentWeeklyQuest } from "@/interfaces/interfaces";
import QuestChallengeSubmissionSection from "./QuestChallengeSubmissionSection";

interface QuestOfTheWeekModuleProps {
  weeklyQuest: LearnerCurrentWeeklyQuest | null;
  status: "success" | "empty" | "error" | "loading";
}

export default function QuestOfTheWeekModule({
  weeklyQuest,
  status,
}: QuestOfTheWeekModuleProps) {
  if (status === "loading") {
    return <QuestOfTheWeekLoadingCard />;
  }

  if (status === "empty") {
    return (
      <QuestOfTheWeekMessageCard
        icon="schedule"
        message="Concept of the Week is not available yet."
      />
    );
  }

  if (status === "error" || !weeklyQuest) {
    return (
      <QuestOfTheWeekMessageCard
        icon="error"
        message="Concept of the Week is unavailable right now. Please check back soon."
      />
    );
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
              Concept of the Week
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

        <Link
          href={`/concepts/${weeklyQuest.concept.publicId}`}
          className="inline-flex min-h-11 w-fit items-center justify-center rounded-2xl border border-[var(--color-primary)]/35 bg-[var(--color-primary)]/14 px-5 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
        >
          View concept details
        </Link>

        <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Weekly prompt
          </p>
          <h3 className="mt-3 text-xl font-semibold text-[var(--color-text)]">
            {weeklyQuest.quest.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            {weeklyQuest.quest.instructionText}
          </p>
        </div>

        <QuestChallengeSubmissionSection weeklyQuest={weeklyQuest} />
      </Stack>
    </Card>
  );
}

function QuestOfTheWeekMessageCard({
  icon,
  message,
}: {
  icon: string;
  message: string;
}) {
  return (
    <Card
      radius="28px"
      padding="xl"
      className="border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.03),rgba(18,18,18,0.94))]"
    >
      <Stack gap="lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Concept of the Week
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              Weekly focus
            </h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-black/20 text-[var(--color-text-muted)]">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--color-border)] bg-black/20 p-5">
          <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{message}</p>
        </div>
      </Stack>
    </Card>
  );
}

function QuestOfTheWeekLoadingCard() {
  return (
    <Card
      radius="28px"
      padding="xl"
      className="border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.03),rgba(18,18,18,0.94))]"
    >
      <Stack gap="lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Skeleton height={12} width={132} radius="xl" />
            <Skeleton height={40} width="72%" radius="md" className="mt-4" />
          </div>
          <Skeleton height={48} width={48} radius="xl" />
        </div>

        <Stack gap="sm">
          <Skeleton height={12} width="100%" radius="xl" />
          <Skeleton height={12} width="82%" radius="xl" />
        </Stack>

        <div className="rounded-3xl border border-[var(--color-border)] bg-black/20 p-5">
          <Skeleton height={12} width={120} radius="xl" />
          <Skeleton height={26} width="58%" radius="md" className="mt-4" />
          <Stack gap="sm" className="mt-4">
            <Skeleton height={12} width="100%" radius="xl" />
            <Skeleton height={12} width="94%" radius="xl" />
            <Skeleton height={12} width="76%" radius="xl" />
          </Stack>
        </div>
      </Stack>
    </Card>
  );
}
