"use client";

import { useMemo, useState } from "react";
import { Button, Card, Container, Radio, Stack, Text, Title } from "@mantine/core";
import {
  continueFromSubmittedVote,
  getCurrentVotingPlayer,
  getNextVotingPlayer,
  getVotingCandidates,
  startVotingTurn,
  submitVote,
  type OfflineInitializedMatch,
} from "../_lib/gameSetup";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

interface PrivateVotingScreenProps {
  match: OfflineInitializedMatch;
  onMatchChange: (match: OfflineInitializedMatch) => void;
}

export default function PrivateVotingScreen({
  match,
  onMatchChange,
}: PrivateVotingScreenProps) {
  const currentPlayer = getCurrentVotingPlayer(match);
  const nextPlayer = getNextVotingPlayer(match);
  const candidates = useMemo(() => getVotingCandidates(match), [match]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  if (!currentPlayer) {
    return null;
  }

  if (match.votingState === "handoff") {
    return (
      <Container size="lg" className="py-6 lg:py-8">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="lg">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Secret vote
              </p>
              <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                Pass the phone to {currentPlayer.name}
              </Title>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                Only {currentPlayer.name} should see the next screen. No votes are shown until
                everyone has submitted.
              </Text>
            </div>

            <Button
              type="button"
              radius="xl"
              size="lg"
              fullWidth
              className="min-h-12"
              onClick={() => {
                setSelectedPlayerId(null);
                onMatchChange(startVotingTurn(match));
              }}
              styles={{
                root: {
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                },
              }}
            >
              I’m ready to vote
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  if (match.votingState === "submitted") {
    return (
      <Container size="lg" className="py-6 lg:py-8">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Vote submitted
                </p>
                <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                  Pass the phone to the next learner
                </Title>
                <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                  The vote is locked in and hidden. No vote totals are shown until every learner
                  has voted.
                </Text>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  Next learner
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                  {nextPlayer?.name ?? "Waiting"}
                </p>
              </div>
            </div>

            <Button
              type="button"
              radius="xl"
              size="lg"
              fullWidth
              className="min-h-12"
              onClick={() => {
                setSelectedPlayerId(null);
                onMatchChange(continueFromSubmittedVote(match));
              }}
              styles={{
                root: {
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                },
              }}
            >
              Pass to next learner
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
              Secret vote
            </p>
            <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              {currentPlayer.name}, choose the imposter
            </Title>
            <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
              Pick one learner. Your vote stays hidden until everyone has submitted.
            </Text>
          </div>

          <Radio.Group
            value={selectedPlayerId}
            onChange={setSelectedPlayerId}
            className="rounded-[24px] border border-white/10 bg-black/20 p-4"
          >
            <Stack gap="sm">
              {candidates.map((player) => (
                <Radio
                  key={player.id}
                  value={player.id}
                  label={player.name}
                  color="var(--color-primary)"
                  styles={{
                    root: {
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "18px",
                      padding: "14px 16px",
                      backgroundColor: "rgba(0,0,0,0.16)",
                    },
                    label: {
                      color: "var(--color-text)",
                      fontWeight: 600,
                    },
                  }}
                />
              ))}
            </Stack>
          </Radio.Group>

          <Button
            type="button"
            radius="xl"
            size="lg"
            fullWidth
            className="min-h-12"
            disabled={!selectedPlayerId}
            onClick={() => {
              if (!selectedPlayerId) {
                return;
              }

              onMatchChange(submitVote(match, selectedPlayerId));
            }}
            styles={{
              root: {
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              },
            }}
          >
            Submit vote
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
