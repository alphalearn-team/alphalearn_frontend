import { Suspense } from "react";
import { Container, Group, Stack, Text, Title } from "@mantine/core";
import LearnersDirectorySection from "../learners/_components/LearnersDirectorySection";
import LearnersSkeleton from "../learners/_components/LearnersSkeleton";
import MySquadClient from "./_components/MySquadClient";

export default function MySquadPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="bg-[var(--color-background)] pb-8 pt-8">
        <Container size="lg">
          <Stack gap="xs">
            <Title
              order={1}
              className="text-4xl font-black tracking-tight text-[var(--color-text)]"
            >
              My <span className="text-[var(--color-primary)]">Squad</span>
            </Title>

            <Text className="max-w-2xl text-[var(--color-text-secondary)]">
              See everyone in your friends list and keep your AlphaLearn crew close.
            </Text>
          </Stack>
        </Container>
      </div>

      <Container size="lg" className="pb-32">
        <Stack gap="xl">
          <MySquadClient />

          <section
            id="learners-list"
            className="scroll-mt-24 border-t border-[var(--color-border)] pt-12"
          >
            <Stack gap="xl">
              <Stack gap="xs">
                <Group gap="xs" align="center">
                  <div className="h-px w-5 bg-[var(--color-primary)]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
                    Learner Directory
                  </span>
                </Group>

                <Title
                  order={2}
                  className="text-3xl font-black tracking-tight text-[var(--color-text)]"
                >
                  Find More <span className="text-[var(--color-primary)]">Learners</span>
                </Title>

                <Text className="max-w-2xl text-[var(--color-text-secondary)]">
                  Browse the wider AlphaLearn directory, send friend requests, and grow your squad
                  from one place.
                </Text>
              </Stack>

              <Suspense fallback={<LearnersSkeleton />}>
                <LearnersDirectorySection />
              </Suspense>
            </Stack>
          </section>
        </Stack>
      </Container>
    </div>
  );
}
