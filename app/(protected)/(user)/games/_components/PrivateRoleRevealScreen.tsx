"use client";

import { Button, Card, Container, Stack, Text, Title } from "@mantine/core";
import {
  getCurrentRevealPlayer,
  getFirstDrawingPlayer,
  hideCurrentPlayerRole,
  isCurrentRevealPlayerImposter,
  revealCurrentPlayerRole,
  type OfflineInitializedMatch,
} from "../_lib/gameSetup";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

interface PrivateRoleRevealScreenProps {
  match: OfflineInitializedMatch;
  onMatchChange: (match: OfflineInitializedMatch) => void;
}

export default function PrivateRoleRevealScreen({
  match,
  onMatchChange,
}: PrivateRoleRevealScreenProps) {
  const currentPlayer = getCurrentRevealPlayer(match);
  const firstDrawingPlayer = getFirstDrawingPlayer(match);
  const currentPlayerIsImposter = isCurrentRevealPlayerImposter(match);

  if (match.revealState === "completed") {
    return (
      <Container size="lg" className="py-6 lg:py-8">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="lg">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Reveal complete
              </p>
              <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                Pass the phone to {firstDrawingPlayer?.name ?? "Player 1"}
              </Title>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                Everyone has seen their role privately. The drawing phase is next, but this story
                stops at the neutral handoff screen so no secret information is still visible.
              </Text>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Next player
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
                {firstDrawingPlayer?.name ?? "Player 1"}
              </p>
            </div>
          </Stack>
        </Card>
      </Container>
    );
  }

  if (!currentPlayer) {
    return null;
  }

  if (match.revealState === "revealed") {
    return (
      <Container size="lg" className="py-6 lg:py-8">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="lg">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Private role
              </p>
              <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                {currentPlayer.name}, this screen is for you only
              </Title>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                Memorize your role, then hide it before handing the phone to the next learner.
              </Text>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-black/25 p-6 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Your role
              </p>
              <p className="mt-4 text-[clamp(2.5rem,7vw,4.5rem)] font-semibold tracking-tight text-[var(--color-text)]">
                {currentPlayerIsImposter ? "Imposter" : match.concept.word}
              </p>
            </div>

            <Button
              type="button"
              radius="xl"
              size="lg"
              fullWidth
              className="min-h-12"
              onClick={() => onMatchChange(hideCurrentPlayerRole(match))}
              styles={{
                root: {
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                },
              }}
            >
              Hide role
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
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Pass the phone
            </p>
            <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              Pass to {currentPlayer.name}
            </Title>
            <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
              When {currentPlayer.name} is holding the phone privately, tap below to reveal their
              role card.
            </Text>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Current learner
            </p>
            <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
              {currentPlayer.name}
            </p>
          </div>

          <Button
            type="button"
            radius="xl"
            size="lg"
            fullWidth
            className="min-h-12"
            onClick={() => onMatchChange(revealCurrentPlayerRole(match))}
            styles={{
              root: {
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              },
            }}
          >
            I&apos;m ready
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
