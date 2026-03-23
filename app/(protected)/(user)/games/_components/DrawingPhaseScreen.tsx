"use client";

import { useState } from "react";
import { Button, Card, Container, Stack, Text, Title } from "@mantine/core";
import {
  addCanvasStroke,
  continueFromDrawingReview,
  finishDrawingTurn,
  getCurrentDrawingPlayer,
  getCurrentDrawingRound,
  getNextDrawingPlayer,
  startDrawingTurn,
  type CanvasStroke,
  type OfflineInitializedMatch,
} from "../_lib/gameSetup";
import MatchProgressBadge from "./MatchProgressBadge";
import SharedCanvas from "./SharedCanvas";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

interface DrawingPhaseScreenProps {
  match: OfflineInitializedMatch;
  onMatchChange: (match: OfflineInitializedMatch) => void;
}

export default function DrawingPhaseScreen({
  match,
  onMatchChange,
}: DrawingPhaseScreenProps) {
  const activePlayer = getCurrentDrawingPlayer(match);
  const nextPlayer = getNextDrawingPlayer(match);
  const currentRound = getCurrentDrawingRound(match);
  const activePlayerIsImposter = activePlayer?.id === match.imposterPlayerId;
  const [isConceptVisible, setIsConceptVisible] = useState(false);

  if (!activePlayer) {
    return null;
  }

  if (match.drawingState === "handoff") {
    return (
      <Container size="lg" className="py-6 lg:py-8">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="lg">
            <div>
              <MatchProgressBadge match={match} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Drawing phase
              </p>
              <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                Pass the phone to {activePlayer.name}
              </Title>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                The shared canvas is ready. When {activePlayer.name} has the phone, start their
                drawing turn.
              </Text>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Turn
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--color-text)]">
                {activePlayer.name}
              </p>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
                Round {currentRound} of {match.settings.roundsPerConcept}
              </p>
            </div>

            <Button
              type="button"
              radius="xl"
              size="lg"
              fullWidth
              className="min-h-12"
              onClick={() => {
                setIsConceptVisible(false);
                onMatchChange(startDrawingTurn(match));
              }}
              styles={{
                root: {
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                },
              }}
            >
              Start drawing
            </Button>
          </Stack>
        </Card>
      </Container>
    );
  }

  if (match.drawingState === "review") {
    return (
      <Container size="lg" className="py-6 lg:py-8">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <MatchProgressBadge match={match} />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Turn complete
                </p>
                <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                  Show everyone the drawing
                </Title>
                <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                  The canvas is now read-only. Let everyone see the shared drawing before passing
                  the phone to the next learner.
                </Text>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  Next player
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                  {nextPlayer?.name ?? "Waiting"}
                </p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white">
              <SharedCanvas
                strokes={match.strokes}
                readOnly
                className="block w-full"
              />
            </div>

            <Button
              type="button"
              radius="xl"
              size="lg"
              fullWidth
              className="min-h-12"
              onClick={() => {
                setIsConceptVisible(false);
                onMatchChange(continueFromDrawingReview(match));
              }}
              styles={{
                root: {
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                },
              }}
            >
              Pass to next player
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
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <MatchProgressBadge match={match} />
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Drawing turn
              </p>
              <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
                {activePlayer.name} is drawing
              </Title>
              <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
                Everyone builds on the same canvas. Only the current turn can draw right now.
              </Text>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Round
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                {currentRound} / {match.settings.roundsPerConcept}
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  Current player
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                  {activePlayer.name}
                </p>
              </div>

              <Button
                type="button"
                variant="default"
                radius="xl"
                onClick={() => setIsConceptVisible((currentValue) => !currentValue)}
                styles={{
                  root: {
                    backgroundColor: "transparent",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                  },
                }}
              >
                {isConceptVisible ? "Hide concept" : "Peek concept"}
              </Button>
            </div>

            {isConceptVisible ? (
              <div className="mt-4 rounded-[18px] border border-white/10 bg-black/30 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                  Your concept
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-text)]">
                  {activePlayerIsImposter ? "You are the imposter" : match.concept.word}
                </p>
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white">
            <SharedCanvas
              strokes={match.strokes}
              activePlayerId={activePlayer.id}
              onStrokeCommit={(stroke: CanvasStroke) => onMatchChange(addCanvasStroke(match, stroke))}
              className="block w-full"
            />
          </div>

          <Button
            type="button"
            radius="xl"
            size="lg"
            fullWidth
            className="min-h-12"
            onClick={() => {
              setIsConceptVisible(false);
              onMatchChange(finishDrawingTurn(match));
            }}
            styles={{
              root: {
                backgroundColor: "var(--color-primary)",
                color: "var(--color-background)",
              },
            }}
          >
            End Turn
          </Button>
        </Stack>
      </Card>
    </Container>
  );
}
