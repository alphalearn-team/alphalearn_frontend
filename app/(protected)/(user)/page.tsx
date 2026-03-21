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
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <Stack gap="lg">
              <Stack gap="xs">
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
            <QuestOfTheWeekModule
              weeklyQuest={weeklyQuestResult.data}
              status={weeklyQuestResult.status}
            />
          </div>
        </Container>
      </section>

      <StartHereSection />
    </>
  );
}
