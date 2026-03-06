import { Container, Group, Stack, Text, Title } from "@mantine/core";
import GradientButton from "@/components/common/GradientButton";
import type { UserRole } from "@/lib/auth/rbac";

export default function LessonsHeroSection({ role }: { role: UserRole }) {
  return (
    <div className="border-b border-[var(--color-border)] min-h-screen flex">
      <Container className="my-auto w-full">
        <Stack gap="xl">
          <Stack gap="xs">
            <Group gap="xs" align="center">
              <div className="w-5 h-px bg-[var(--color-primary)]" />
              <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--color-primary)]">
                Big Brain Hub
              </span>
            </Group>

            <Title
              order={1}
              className="text-[clamp(2.4rem,5vw,4rem)] font-bold tracking-tight leading-[1.1]"
            >
              Level Up Your <span className="text-[var(--color-primary)]">Skills</span>
            </Title>

            <Text size="lg" className="max-w-xl font-light leading-relaxed">
              Farm XP with interactive lessons. Learn peak skills. Gain elite ball knowledge.
            </Text>
          </Stack>

          {role === "CONTRIBUTOR" || role === "LEARNER" ? (
            <Stack align="flex-end" gap="sm">
              <GradientButton href="#lessons-list">View All Lessons</GradientButton>
              <GradientButton href="/lessons/mine">View My Lessons</GradientButton>
            </Stack>
          ) : (
            <Group justify="flex-end">
              <GradientButton href="#lessons-list">View All Lessons</GradientButton>
            </Group>
          )}
        </Stack>
      </Container>
    </div>
  );
}
