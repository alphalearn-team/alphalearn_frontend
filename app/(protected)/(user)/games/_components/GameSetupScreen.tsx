"use client";

import { useState } from "react";
import { Card, Container, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import OfflineGameSetupScreen from "./OfflineGameSetupScreen";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

type GamesEntryMode = "offline" | "online";

export default function GameSetupScreen() {
  const [mode, setMode] = useState<GamesEntryMode>("offline");

  if (mode === "offline") {
    return (
      <>
        <Container size="lg" className="pt-6 lg:pt-8">
          <Card radius="32px" padding="xl" className={sectionCardClassName}>
            <Stack gap="sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Game mode
              </p>
              <SegmentedControl
                fullWidth
                radius="xl"
                value={mode}
                onChange={(value) => setMode(value as GamesEntryMode)}
                data={[
                  { label: "Offline", value: "offline" },
                  { label: "Online", value: "online" },
                ]}
              />
            </Stack>
          </Card>
        </Container>

        <OfflineGameSetupScreen />
      </>
    );
  }

  return (
    <Container size="lg" className="py-6 lg:py-8">
      <Stack gap="lg">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Game mode
            </p>
            <SegmentedControl
              fullWidth
              radius="xl"
              value={mode}
              onChange={(value) => setMode(value as GamesEntryMode)}
              data={[
                { label: "Offline", value: "offline" },
                { label: "Online", value: "online" },
              ]}
            />
          </Stack>
        </Card>

        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Online lobby
          </p>
          <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
            Online private lobby
          </Title>
          <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            Online private lobby setup will be available in the next update.
          </Text>
        </Card>
      </Stack>
    </Container>
  );
}
