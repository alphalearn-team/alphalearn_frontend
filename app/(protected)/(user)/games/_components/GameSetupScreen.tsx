"use client";

import { useState } from "react";
import { Card, Container, SegmentedControl, Stack } from "@mantine/core";
import OfflineGameSetupScreen from "./OfflineGameSetupScreen";
import OnlineLobbyCreateScreen from "./OnlineLobbyCreateScreen";
import CurrentMonthlyPackSection from "./CurrentMonthlyPackSection";

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

        <CurrentMonthlyPackSection />

        <OnlineLobbyCreateScreen />
      </Stack>
    </Container>
  );
}
