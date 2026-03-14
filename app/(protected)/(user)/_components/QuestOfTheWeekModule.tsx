import Link from "next/link";
import { Card, Skeleton, Stack, Text } from "@mantine/core";
import type { LearnerCurrentWeeklyQuest } from "@/interfaces/interfaces";

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

  const hasSubmission = Boolean(weeklyQuest.questChallengeSubmission);

  return (
    <Card
      radius="28px"
      padding="lg"
      className="overflow-hidden border border-[#2d5c50] bg-[#1c2220] shadow-[0_18px_48px_-42px_rgba(0,0,0,0.92)]"
    >
      <Stack gap="md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#19f0c2]">
              Concept of the Week
            </p>
            <h2 className="mt-3 text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-tight leading-[0.98] text-[var(--color-text)]">
              {weeklyQuest.concept.title}
            </h2>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#0f332a] text-[#19f0c2]">
            <span className="material-symbols-outlined text-2xl">bolt</span>
          </div>
        </div>

        {weeklyQuest.concept.description ? (
          <Text size="sm" className="max-w-xl leading-relaxed text-[#9aa29b]">
            {weeklyQuest.concept.description}
          </Text>
        ) : null}

        <div className="rounded-[24px] bg-[#101513] px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7f8a82]">
                Challenge
              </p>
              <h3 className="mt-3 max-w-[14ch] text-[clamp(1.5rem,2.4vw,2.1rem)] font-semibold leading-[1.06] text-[var(--color-text)]">
                {hasSubmission ? "Submission ready to manage" : "Open today’s upload flow"}
              </h3>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#31413b] bg-[#19211f] px-3 py-1.5 text-xs font-semibold text-[#8ea096]">
                <span className="material-symbols-outlined text-base">cycle</span>
                {hasSubmission ? "Posted" : "No post yet"}
              </div>
              <p className="mt-4 max-w-[24rem] text-sm leading-relaxed text-[#8e9790]">
                {hasSubmission
                  ? "Review or replace your saved challenge from the dedicated page."
                  : "Start the guided upload flow for this week’s challenge."}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/weekly-quest"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#19f0c2]/40 bg-[#27e0bf] px-5 text-sm font-semibold text-[#102019] transition-colors hover:bg-[#46e6c9]"
            >
              {hasSubmission ? "Open submission page" : "Start upload"}
            </Link>
            <Link
              href={`/concepts/${weeklyQuest.concept.publicId}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#2d3632] bg-[#222926] px-5 text-sm font-semibold text-[var(--color-text)] transition-colors hover:bg-[#2a322e]"
            >
              Concept details
            </Link>
          </div>
        </div>
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
      className="border border-[#313530] bg-[#1f211f]"
    >
      <Stack gap="lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#19f0c2]">
              Concept of the Week
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              Weekly focus
            </h2>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#313530] bg-[#181a18] text-[var(--color-text-muted)]">
            <span className="material-symbols-outlined text-2xl">{icon}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-[#313530] bg-[#181a18] p-5">
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
      className="border border-[#313530] bg-[#1f211f]"
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
