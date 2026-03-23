"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button, Card, Container, Stack, Text, TextInput, Title } from "@mantine/core";
import {
  getGuessRemainingSeconds,
  getImposterPlayer,
  startImposterGuess,
  submitImposterGuess,
  updateImposterGuess,
  type OfflineInitializedMatch,
} from "../_lib/gameSetup";
import MatchProgressBadge from "./MatchProgressBadge";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

interface ImposterGuessScreenProps {
  match: OfflineInitializedMatch;
  onMatchChange: (match: OfflineInitializedMatch) => void;
}

export default function ImposterGuessScreen({
  match,
  onMatchChange,
}: ImposterGuessScreenProps) {
  const imposterPlayer = getImposterPlayer(match);
  const [now, setNow] = useState(() => Date.now());
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    hasCompletedRef.current = false;
  }, [match.guessEndsAt]);

  useEffect(() => {
    if (match.phase !== "guess" || match.guessState !== "guessing") {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 250);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [match.guessState, match.phase]);

  const remainingSeconds = getGuessRemainingSeconds(match, now);

  useEffect(() => {
    if (
      match.phase !== "guess" ||
      match.guessState !== "guessing" ||
      remainingSeconds > 0 ||
      hasCompletedRef.current
    ) {
      return;
    }

    hasCompletedRef.current = true;
    onMatchChange(submitImposterGuess(match));
  }, [match, onMatchChange, remainingSeconds]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [remainingSeconds]);

  if (!imposterPlayer) {
    return null;
  }

  if (match.guessState === "handoff") {
    return (
      <Container size="lg" className="py-6 lg:py-8">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="lg">
            <div>
              <MatchProgressBadge match={match} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Final guess
              </p>
              <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                Pass the phone to {imposterPlayer.name}
              </Title>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                The imposter was caught. {imposterPlayer.name} now gets one private final guess at
                the concept before the round is decided.
              </Text>
            </div>

            <Button
              type="button"
              radius="xl"
              size="lg"
              fullWidth
              className="min-h-12"
              onClick={() => onMatchChange(startImposterGuess(match))}
              styles={{
                root: {
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                },
              }}
            >
              I&apos;m ready to guess
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-6 lg:py-8">
      <Card radius="32px" padding="xl" className={sectionCardClassName}>
        <Stack gap="lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <MatchProgressBadge match={match} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Final guess
              </p>
              <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                {imposterPlayer.name}, make your final guess
              </Title>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                If the guess matches the concept, the imposter wins this concept. If not, the
                concept holders win.
              </Text>
            </div>

            <div className="min-w-[10rem] rounded-[24px] border border-white/10 bg-black/20 px-5 py-4 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Time left
              </p>
              <p className="mt-3 text-5xl font-semibold tracking-tight text-[var(--color-text)]">
                {formattedTime}
              </p>
            </div>
          </div>

          <TextInput
            label="Your guess"
            placeholder="Type the concept"
            value={match.imposterGuess}
            onChange={(event) => onMatchChange(updateImposterGuess(match, event.currentTarget.value))}
            size="lg"
            styles={{
              label: {
                color: "var(--color-text)",
                marginBottom: "10px",
                fontWeight: 600,
                fontSize: "0.875rem",
              },
              input: {
                backgroundColor: "var(--color-surface)",
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
              },
            }}
          />

          <Button
            type="button"
            radius="xl"
            size="lg"
            fullWidth
            disabled={!match.imposterGuess.trim()}
            className="min-h-12"
            onClick={() => onMatchChange(submitImposterGuess(match))}
            styles={{
              root: {
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              },
            }}
          >
            Submit final guess
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
