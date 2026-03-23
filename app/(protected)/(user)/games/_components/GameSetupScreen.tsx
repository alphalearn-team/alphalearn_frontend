"use client";

import { Card, Container, Stack, Text, Title } from "@mantine/core";

export default function GameSetupScreen() {
  return (
    <Container size="lg" className="py-6 lg:py-8">
      <Card
        radius="32px"
        padding="xl"
        className="border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]"
      >
        <Stack gap="md">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Game setup
            </p>
            <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              Prepare an offline match
            </Title>
            <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
              The frontend-only setup flow is loading here.
            </Text>
          </div>
        </Stack>
      </Card>
    </Container>
  );
}
