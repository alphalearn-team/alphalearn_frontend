"use client";

import { Card, Container, Stack, Text, Title } from "@mantine/core";
import type { OfflineInitializedMatch } from "../_lib/gameSetup";
import SharedCanvas from "./SharedCanvas";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

interface VotePhasePlaceholderScreenProps {
  match: OfflineInitializedMatch;
}

export default function VotePhasePlaceholderScreen({
  match,
}: VotePhasePlaceholderScreenProps) {
  const accusedPlayer = match.players.find((player) => player.id === match.accusedPlayerId) ?? null;

  return (
    <Container size="lg" className="py-6 lg:py-8">
      <Card radius="32px" padding="xl" className={sectionCardClassName}>
        <Stack gap="lg">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Voting complete
            </p>
            <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              The group has made an accusation
            </Title>
            <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
              Votes stayed hidden until everyone submitted. The final accusation is shown here
              while the next resolution phase is prepared in the following story.
            </Text>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Accused learner
            </p>
            <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
              {accusedPlayer?.name ?? "No accusation"}
            </p>
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
        </Stack>
      </Card>
    </Container>
  );
}
