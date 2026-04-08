import Link from "next/link";
import { Container, Stack, Text, Title } from "@mantine/core";
import { fetchCurrentWeeklyQuest } from "@/lib/utils/weeklyQuests";
import QuestOfTheWeekModule from "./_components/QuestOfTheWeekCard";
import StartHereSection from "./_components/StartHereSection";

export default async function UserHomePage() {
  const weeklyQuestResult = await fetchCurrentWeeklyQuest();

  return (
    <>
      <section className="border-b border-[var(--color-border)]">
        <Container size="lg" className="py-16 lg:py-24">
          <Stack gap="xl">
            <QuestOfTheWeekModule
              weeklyQuest={weeklyQuestResult.data}
              status={weeklyQuestResult.status}
            />

            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <Stack gap="sm">
                <Title
                  order={1}
                  className="text-[clamp(2.1rem,3.8vw,3.5rem)] font-bold tracking-tight leading-[1.07]"
                >
                  Train smarter every <span className="text-[var(--color-primary)]">week</span>
                </Title>

                <Text size="lg" className="max-w-2xl font-light leading-relaxed text-[var(--color-text-secondary)]">
                  Check the current weekly concept, jump back into lessons, and stay on top of
                  what to learn next.
                </Text>
              </Stack>


              <div className="mt-18 grid gap-3">
                <Link
                  href="/friends-feed"
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#2f5f53] bg-[#1e2f29] px-5 text-sm font-semibold text-[#8bf6dd] transition-colors hover:bg-[#254037]"
                >
                  Browse social feed
                </Link>

              </div>
            </div>
          </Stack>
        </Container>
      </section>

      <StartHereSection />
    </>
  );
}
