"use client";

import { Alert, Button, Card, Container, Stack, Text, Title } from "@mantine/core";
import {
  getLatestConceptResult,
  getPlayerScore,
  hasMoreConceptsRemaining,
  type OfflineInitializedMatch,
} from "../_lib/gameSetup";
import SharedCanvas from "./SharedCanvas";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

interface VotePhasePlaceholderScreenProps {
  match: OfflineInitializedMatch;
  onContinue: () => void;
  isContinuing: boolean;
  errorMessage: string | null;
}

export default function VotePhasePlaceholderScreen({
  match,
  onContinue,
  isContinuing,
  errorMessage,
}: VotePhasePlaceholderScreenProps) {
  const conceptResult = getLatestConceptResult(match);
  const accusedPlayer = match.players.find((player) => player.id === match.accusedPlayerId) ?? null;
  const roundLabel =
    match.currentVotingRound > 1 ? `Resolved after revote round ${match.currentVotingRound}` : "Resolved after the first vote";
  const title = match.imposterWinsByVotingTie
    ? "Voting stayed tied and the imposter wins"
    : "The group has made an accusation";
  const description = match.imposterWinsByVotingTie
    ? `The voting phase remained tied through round ${match.currentVotingRound}. The imposter wins automatically under the final tie rule.`
    : "Votes stayed hidden until everyone submitted. The final accusation is shown here while the next resolution phase is prepared in the following story.";
  const canContinueToNextConcept = hasMoreConceptsRemaining(match);

  return (
    <Container size="lg" className="py-6 lg:py-8">
      <Card radius="32px" padding="xl" className={sectionCardClassName}>
        <Stack gap="lg">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Voting complete
            </p>
            <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              {title}
            </Title>
            <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
              {description}
            </Text>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Concept
            </p>
            <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
              {conceptResult?.conceptNumber ?? match.currentConceptNumber} of {match.totalConceptCount}: {match.concept.word}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Final vote round
            </p>
            <p className="mt-3 text-lg font-semibold text-[var(--color-text)]">
              {roundLabel}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              {match.imposterWinsByVotingTie ? "Outcome" : "Accused learner"}
            </p>
            <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
              {match.imposterWinsByVotingTie ? "Imposter wins" : accusedPlayer?.name ?? "No accusation"}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Scoreboard
            </p>
            <div className="mt-4 space-y-3">
              {match.players
                .slice()
                .sort((left, right) => getPlayerScore(match, right.id) - getPlayerScore(match, left.id))
                .map((player) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between rounded-[18px] border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-[var(--color-text)]">
                      {player.name}
                    </span>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {getPlayerScore(match, player.id)} point{getPlayerScore(match, player.id) === 1 ? "" : "s"}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Vote tally
            </p>

            <div className="mt-4 space-y-3">
              {match.finalVoteTallies.map((tally) => {
                const player = match.players.find((candidate) => candidate.id === tally.playerId);

                if (!player) {
                  return null;
                }

                return (
                  <div
                    key={tally.playerId}
                    className="flex items-center justify-between rounded-[18px] border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-[var(--color-text)]">
                      {player.name}
                    </span>
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {tally.voteCount} vote{tally.voteCount === 1 ? "" : "s"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white">
            <SharedCanvas strokes={match.strokes} readOnly className="block w-full" />
          </div>

          {errorMessage ? (
            <Alert color="red" radius="lg" variant="light" title="Could not continue the match">
              {errorMessage}
            </Alert>
          ) : null}

          <Button
            type="button"
            radius="xl"
            size="lg"
            fullWidth
            loading={isContinuing}
            className="min-h-12"
            onClick={onContinue}
            styles={{
              root: {
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              },
            }}
          >
            {canContinueToNextConcept ? "Start next concept" : "View final leaderboard"}
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
