"use client";

import { useMemo, useState } from "react";
import { Button, Card, Container, Stack, Text, Title } from "@mantine/core";
import {
  MAX_VOTING_ROUNDS,
  continueFromTiePrompt,
  continueFromSubmittedVote,
  getCurrentVotingPlayer,
  getNextVotingPlayer,
  getTiedVotingPlayers,
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
  const tiedPlayers = useMemo(() => getTiedVotingPlayers(match), [match]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  if (!currentPlayer) {
    return null;
  }

  if (match.votingState === "tie-prompt") {
    return (
      <Container size="lg" className="py-6 lg:py-8">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="lg">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Vote tied
              </p>
              <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                The group must revote
              </Title>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                The highest vote count was shared. Start another private voting round using only
                the tied learners.
              </Text>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Tie rule
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                If round {MAX_VOTING_ROUNDS} also ends in a tie, the imposter wins immediately.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Tied learners
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {tiedPlayers.map((player) => (
                  <span
                    key={player.id}
                    className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-[var(--color-text)]"
                  >
                    {player.name}
                  </span>
                ))}
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
                onMatchChange(continueFromTiePrompt(match));
              }}
              styles={{
                root: {
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                },
              }}
            >
              Start revote
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  if (match.votingState === "handoff") {
    return (
      <Container size="lg" className="py-6 lg:py-8">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="lg">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                {match.currentVotingRound > 1 ? "Secret revote" : "Secret vote"}
              </p>
              <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                Pass the phone to {currentPlayer.name}
              </Title>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                Only {currentPlayer.name} should see the next screen. No votes are shown until the
                current voting round is complete.
              </Text>
            </div>

            {match.currentVotingRound > 1 ? (
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  Revote candidates
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {tiedPlayers.map((player) => (
                    <span
                      key={player.id}
                      className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-[var(--color-text)]"
                    >
                      {player.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

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
                {match.currentVotingRound > 1 ? "Pass the phone to the next revoter" : "Pass the phone to the next learner"}
              </Title>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                The vote is locked in and hidden. No vote totals are shown until the current
                voting round is complete.
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
                {match.currentVotingRound > 1 ? "Secret revote" : "Secret vote"}
              </p>
              <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                {currentPlayer.name}, choose the imposter
              </Title>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                {match.currentVotingRound > 1
                  ? "Pick one tied learner. Your vote stays hidden until the revote round is complete."
                  : "Pick one learner. Your vote stays hidden until everyone has submitted."}
              </Text>
            </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <Stack gap="sm">
              {candidates.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => setSelectedPlayerId(player.id)}
                  className="flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left transition-colors"
                  style={{
                    borderColor:
                      selectedPlayerId === player.id
                        ? "var(--color-primary)"
                        : "rgba(255,255,255,0.08)",
                    backgroundColor:
                      selectedPlayerId === player.id
                        ? "rgba(176, 237, 96, 0.12)"
                        : "rgba(0,0,0,0.16)",
                  }}
                >
                  <span className="text-sm font-semibold text-[var(--color-text)]">
                    {player.name}
                  </span>
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-semibold"
                    style={{
                      borderColor:
                        selectedPlayerId === player.id
                          ? "var(--color-primary)"
                          : "rgba(255,255,255,0.2)",
                      color:
                        selectedPlayerId === player.id
                          ? "var(--color-primary)"
                          : "transparent",
                    }}
                  >
                    •
                  </span>
                </button>
              ))}
            </Stack>
          </div>

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
