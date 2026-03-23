"use client";

import { Card, Container, Stack, Text, Title } from "@mantine/core";
import {
  getMatchLeaders,
  getPlayerScore,
  type OfflineInitializedMatch,
} from "../_lib/gameSetup";
import MatchProgressBadge from "./MatchProgressBadge";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

interface MatchSummaryScreenProps {
  match: OfflineInitializedMatch;
}

export default function MatchSummaryScreen({
  match,
}: MatchSummaryScreenProps) {
  const leaders = getMatchLeaders(match);

  return (
    <Container size="lg" className="py-6 lg:py-8">
      <Card radius="32px" padding="xl" className={sectionCardClassName}>
        <Stack gap="lg">
          <div>
            <MatchProgressBadge match={match} />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Match complete
            </p>
            <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              Final leaderboard
            </Title>
            <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
              All {match.totalConceptCount} concepts are finished. The highest total score wins the
              match.
            </Text>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Overall winner
            </p>
            <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
              {leaders.map((leader) => leader.name).join(", ")}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Final scores
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
        </Stack>
      </Card>
    </Container>
  );
}
