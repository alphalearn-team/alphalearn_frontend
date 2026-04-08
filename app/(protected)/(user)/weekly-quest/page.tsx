import Link from "next/link";
import { Card, Container, Stack, Text } from "@mantine/core";
import { fetchCurrentWeeklyQuest } from "@/lib/utils/weeklyQuests";
import QuestChallengeSubmissionSection from "./_components/QuestChallengeSubmissionSection";

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
          className="border border-[var(--color-border)] bg-black/30"
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
          className="border border-[var(--color-border)] bg-black/30"
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
            <Stack gap="lg">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#19f0c2]">
                  Weekly quest
                </p>
                <h1 className="mt-2 text-[clamp(1.5rem,2.8vw,2.4rem)] font-semibold tracking-tight leading-[1.1] text-[var(--color-text)]">
                  Complete your weekly challenge
                </h1>
              </div>

              <Text size="sm" className="leading-relaxed text-[var(--color-text-secondary)]">
                Learn the concept, create your unique submission, and share with friends. You can tag people who inspired or contributed to your work.
              </Text>

              <div className="grid gap-2 sm:grid-cols-2">
                <Link
                  href={`/concepts/${weeklyQuest.concept.publicId}`}
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#19f0c2]/40 bg-[#19f0c2] px-4 text-xs font-semibold text-[#102019] transition-colors hover:bg-[#40f3cf]"
                >
                  Review concept
                </Link>
                <Link
                  href="/friends-feed"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-[#2f5f53] bg-[#1e2f29] px-4 text-xs font-semibold text-[#8bf6dd] transition-colors hover:bg-[#254037]"
                >
                  Browse feed
                </Link>
              </div>

              <div className="space-y-3">
                <div className="rounded-[20px] border border-[#3a3a34] bg-[#1f1e1a] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    This week&apos;s topic
                  </p>
                  <h2 className="mt-2 text-lg font-semibold leading-tight text-[var(--color-text)]">
                    {weeklyQuest.concept.title}
                  </h2>
                  {weeklyQuest.concept.description ? (
                    <Text size="xs" className="mt-2 leading-relaxed text-[var(--color-text-secondary)]">
                      {weeklyQuest.concept.description}
                    </Text>
                  ) : null}
                </div>

                <div className="rounded-[20px] border border-[#3a3a34] bg-[#1f1e1a] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    Your submission
                  </p>
                  <h2 className="mt-2 text-lg font-semibold leading-tight text-[var(--color-text)]">
                    {submission ? "Already submitted" : "Not yet submitted"}
                  </h2>
                  <Text size="xs" className="mt-2 leading-relaxed text-[var(--color-text-secondary)]">
                    {submission
                      ? "You can update or replace your submission below."
                      : "Upload an image or video to complete the challenge."}
                  </Text>
                </div>

                <div className="rounded-[20px] border border-[#3a3a34] bg-[#1f1e1a] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                    Challenge prompt
                  </p>
                  <h2 className="mt-2 text-base font-semibold text-[var(--color-text)]">
                    {weeklyQuest.quest.title}
                  </h2>
                  <Text size="xs" className="mt-2 leading-relaxed text-[var(--color-text-secondary)]">
                    {weeklyQuest.quest.instructionText}
                  </Text>
                </div>
              </div>
            </Stack>
          </Card>

          <QuestChallengeSubmissionSection weeklyQuest={weeklyQuest} variant="page" />
        </div>
      </Container>
    </div>
  );
}
