import Link from "next/link";
import { Card, Container, Stack, Text } from "@mantine/core";
import { fetchCurrentWeeklyQuest } from "@/lib/utils/weeklyQuests";
import QuestChallengeSubmissionSection from "../_components/QuestChallengeSubmissionSection";

export default async function WeeklyQuestPage() {
  const weeklyQuestResult = await fetchCurrentWeeklyQuest();
  const weeklyQuest = weeklyQuestResult.data;
  const submission = weeklyQuest?.questChallengeSubmission ?? null;

  if (weeklyQuestResult.status === "empty" || !weeklyQuest) {
    return (
      <Container size="xl" className="py-6 lg:py-8">
        <Card
          radius="32px"
          padding="xl"
          className="border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]"
        >
          <Stack gap="lg">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-black/25 text-[var(--color-text-muted)]">
              <span className="material-symbols-outlined text-3xl">bolt</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Weekly quest
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                No active challenge right now
              </h1>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                There is no live weekly quest challenge to submit at the moment. Check back from
                the learner home page when the next quest opens.
              </Text>
            </div>
            <Link
              href="/"
              className="inline-flex min-h-11 w-fit items-center justify-center rounded-2xl border border-[var(--color-primary)]/35 bg-[var(--color-primary)]/14 px-5 text-sm font-semibold text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary)]/20"
            >
              Back to home
            </Link>
          </Stack>
        </Card>
      </Container>
    );
  }

  if (weeklyQuestResult.status === "error") {
    return (
      <Container size="xl" className="py-6 lg:py-8">
        <Card
          radius="32px"
          padding="xl"
          className="border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]"
        >
          <Stack gap="lg">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Weekly quest
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                Challenge unavailable
              </h1>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                We could not load the current weekly quest challenge. Please try again soon.
              </Text>
            </div>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <div className="min-h-screen">
      <Container size="xl" className="py-6 lg:py-8">
        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <Card
            radius="32px"
            padding="xl"
            className="border border-[#2d5c50] bg-[#25231d]"
          >
            <Stack gap="xl">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#19f0c2]">
                  Weekly quest
                </p>
                <h1 className="mt-3 text-[clamp(2rem,3.5vw,3.1rem)] font-semibold tracking-tight leading-[1.02] text-[var(--color-text)]">
                  Post your weekly challenge in two steps.
                </h1>
              </div>

              <Text size="sm" className="max-w-xl leading-relaxed text-[var(--color-text-secondary)]">
                Learn first, upload next!
              </Text>

              <div className="grid pl-1">
                <Link
                  href={`/concepts/${weeklyQuest.concept.publicId}`}
                  className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-[#19f0c2]/40 bg-[#19f0c2] px-5 text-sm font-semibold text-[#102019] transition-colors hover:bg-[#40f3cf]"
                >
                  View concept details
                </Link>
              </div>

              <div className="grid auto-rows-fr items-stretch gap-4 sm:grid-cols-2">
                <div className="flex h-full flex-col rounded-[26px] border border-[#3a3a34] bg-[#1f1e1a] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    Concept of the week
                  </p>
                  <h2 className="mt-3 min-h-[5.25rem] text-2xl font-semibold leading-[1.1] text-[var(--color-text)]">
                    {weeklyQuest.concept.title}
                  </h2>
                  {weeklyQuest.concept.description ? (
                    <Text size="sm" className="mt-2 flex-1 leading-relaxed text-[var(--color-text-secondary)]">
                      {weeklyQuest.concept.description}
                    </Text>
                  ) : (
                    <div className="mt-2 flex-1" />
                  )}
                </div>

                <div className="flex h-full flex-col rounded-[26px] border border-[#3a3a34] bg-[#1f1e1a] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                    Submission status
                  </p>
                  <h2 className="mt-3 min-h-[5.25rem] text-2xl font-semibold leading-[1.1] text-[var(--color-text)]">
                    {submission ? "Submitted" : "Start upload"}
                  </h2>
                  <Text size="sm" className="mt-2 flex-1 leading-relaxed text-[var(--color-text-secondary)]">
                    {submission
                      ? "You can replace it from this page."
                      : "Upload one image or video when you are ready."}
                  </Text>
                </div>
              </div>

              <div className="rounded-[28px] border border-[#3a3a34] bg-[#1f1e1a] p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  Prompt
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
                  {weeklyQuest.quest.title}
                </h2>
                <Text size="sm" className="mt-3 leading-relaxed text-[var(--color-text-secondary)]">
                  {weeklyQuest.quest.instructionText}
                </Text>
              </div>
            </Stack>
          </Card>

          <QuestChallengeSubmissionSection weeklyQuest={weeklyQuest} variant="page" />
        </div>
      </Container>
    </div>
  );
}
