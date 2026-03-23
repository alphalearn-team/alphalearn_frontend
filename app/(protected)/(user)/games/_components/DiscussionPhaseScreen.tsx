"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Card, Container, Stack, Text, Title } from "@mantine/core";
import {
  completeDiscussionPhase,
  getDiscussionRemainingSeconds,
  isDiscussionTimerLow,
  type OfflineInitializedMatch,
} from "../_lib/gameSetup";
import MatchProgressBadge from "./MatchProgressBadge";
import SharedCanvas from "./SharedCanvas";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

interface DiscussionPhaseScreenProps {
  match: OfflineInitializedMatch;
  onMatchChange: (match: OfflineInitializedMatch) => void;
}

export default function DiscussionPhaseScreen({
  match,
  onMatchChange,
}: DiscussionPhaseScreenProps) {
  const [now, setNow] = useState(() => Date.now());
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    hasCompletedRef.current = false;
  }, [match.discussionEndsAt]);

  useEffect(() => {
    if (match.phase !== "discussion" || match.discussionState !== "running") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [match.discussionState, match.phase]);

  const remainingSeconds = getDiscussionRemainingSeconds(match, now);

  useEffect(() => {
    if (
      match.phase !== "discussion" ||
      match.discussionState !== "running" ||
      remainingSeconds > 0 ||
      hasCompletedRef.current
    ) {
      return;
    }

    hasCompletedRef.current = true;
    onMatchChange(completeDiscussionPhase(match));
  }, [match, onMatchChange, remainingSeconds]);

  const lowTime = isDiscussionTimerLow(match, now);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [remainingSeconds]);

  return (
    <Container size="md" className="py-6 lg:py-8">
      <Card radius="32px" padding="xl" className={sectionCardClassName}>
        <Stack gap="lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <MatchProgressBadge match={match} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Discussion phase
              </p>
              <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                Discuss who the imposter is
              </Title>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                Study the completed drawing together and decide who does not know the concept
                before the timer runs out.
              </Text>
            </div>

            <div
              className="min-w-[10rem] rounded-[24px] border px-5 py-4 text-center transition-colors"
              style={{
                borderColor: lowTime ? "rgba(255,107,107,0.6)" : "rgba(255,255,255,0.12)",
                backgroundColor: lowTime ? "rgba(140,32,32,0.22)" : "rgba(0,0,0,0.2)",
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Time left
              </p>
              <p
                className="mt-3 text-5xl font-semibold tracking-tight"
                style={{
                  color: lowTime ? "#ff9b9b" : "var(--color-text)",
                }}
              >
                {formattedTime}
              </p>
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">
                {lowTime ? "Time is almost up" : `Set to ${match.discussionDurationSeconds} seconds`}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white">
            <SharedCanvas strokes={match.strokes} readOnly className="block w-full" />
          </div>
        </Stack>
      </Card>
    </Container>
  );
}
