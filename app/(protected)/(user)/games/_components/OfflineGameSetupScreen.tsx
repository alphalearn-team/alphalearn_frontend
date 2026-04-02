"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/client/AuthContext";
import {
  Alert,
  Button,
  Card,
  Container,
  NumberInput,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  MAX_CONCEPT_COUNT,
  MAX_PLAYER_COUNT,
  MAX_ROUNDS_PER_CONCEPT,
  MAX_TIMER_SECONDS,
  MIN_TIMER_SECONDS,
  finalizeMatch,
  hasMoreConceptsRemaining,
  createDefaultGameSetupForm,
  createPlayerDraft,
  getNextPlayerSequence,
  hasGameSetupErrors,
  initializeOfflineMatch,
  prepareNextConcept,
  toOfflineMatchConfig,
  trimPlayerName,
  validateGameSetupForm,
  type GameSetupFormValues,
  type OfflineInitializedMatch,
} from "../_lib/gameSetup";
import {
  createPrivateImposterLobby,
  fetchNextGameConcept,
  isEmptyConceptBankError,
  toFriendlyCreateLobbyError,
  toFriendlyLobbyAccessError,
} from "../_lib/conceptProvider";
import {
  getConceptPoolModeLabel,
  IMPOSTER_CONCEPT_POOL_OPTIONS,
} from "../_lib/conceptPoolOptions";
import { assignImposter } from "../_lib/imposterAssignment";
import DiscussionPhaseScreen from "./DiscussionPhaseScreen";
import DrawingPhaseScreen from "./DrawingPhaseScreen";
import ImposterGuessScreen from "./ImposterGuessScreen";
import MatchSummaryScreen from "./MatchSummaryScreen";
import PrivateRoleRevealScreen from "./PrivateRoleRevealScreen";
import PrivateVotingScreen from "./PrivateVotingScreen";
import VotePhasePlaceholderScreen from "./VotePhasePlaceholderScreen";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

const textInputStyles = {
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
};

export default function OfflineGameSetupScreen() {
  const { session } = useAuth();
  const [formValues, setFormValues] = useState<GameSetupFormValues>(() => createDefaultGameSetupForm());
  const [playerErrors, setPlayerErrors] = useState<Record<string, string>>({});
  const [isStartingMatch, setIsStartingMatch] = useState(false);
  const [isContinuingMatch, setIsContinuingMatch] = useState(false);
  const [matchConfig, setMatchConfig] = useState<OfflineInitializedMatch | null>(null);
  const [startError, setStartError] = useState<string | null>(null);
  const [conceptTransitionError, setConceptTransitionError] = useState<string | null>(null);

  if (matchConfig) {
    if (matchConfig.phase === "draw") {
      return <DrawingPhaseScreen match={matchConfig} onMatchChange={setMatchConfig} />;
    }

    if (matchConfig.phase === "discussion") {
      return <DiscussionPhaseScreen match={matchConfig} onMatchChange={setMatchConfig} />;
    }

    if (matchConfig.phase === "vote") {
      return <PrivateVotingScreen match={matchConfig} onMatchChange={setMatchConfig} />;
    }

    if (matchConfig.phase === "guess") {
      return <ImposterGuessScreen match={matchConfig} onMatchChange={setMatchConfig} />;
    }

    if (matchConfig.phase === "vote-result") {
      return (
        <VotePhasePlaceholderScreen
          match={matchConfig}
          onContinue={async () => {
            const accessToken = session?.access_token;

            if (!accessToken) {
              setConceptTransitionError("You need to be signed in before continuing the match.");
              return;
            }

            setConceptTransitionError(null);

            if (!hasMoreConceptsRemaining(matchConfig)) {
              setMatchConfig(finalizeMatch(matchConfig));
              return;
            }

            setIsContinuingMatch(true);

            try {
              const concept = await fetchNextGameConcept(
                accessToken,
                matchConfig.usedConceptPublicIds,
                matchConfig.lobbyPublicId,
              );
              const assignment = assignImposter(matchConfig.players);

              setMatchConfig(
                prepareNextConcept(
                  matchConfig,
                  {
                    conceptPublicId: concept.conceptPublicId,
                    word: concept.word,
                  },
                  assignment.imposterPlayerId,
                ),
              );
            } catch (error) {
              const lobbyError = toFriendlyLobbyAccessError(error);

              if (isEmptyConceptBankError(error)) {
                setConceptTransitionError(
                  "No more unused concepts are available for this match. Add more concepts before continuing.",
                );
              } else if (lobbyError) {
                setConceptTransitionError(lobbyError);
              } else if (error instanceof Error && error.message) {
                setConceptTransitionError(error.message);
              } else {
                setConceptTransitionError("We could not load the next concept right now. Please try again.");
              }
            } finally {
              setIsContinuingMatch(false);
            }
          }}
          isContinuing={isContinuingMatch}
          errorMessage={conceptTransitionError}
        />
      );
    }

    if (matchConfig.phase === "match-summary") {
      return <MatchSummaryScreen match={matchConfig} />;
    }

    return <PrivateRoleRevealScreen match={matchConfig} onMatchChange={setMatchConfig} />;
  }

  const updatePlayerName = (playerId: string, nextName: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      players: currentValues.players.map((player) =>
        player.id === playerId ? { ...player, name: nextName } : player,
      ),
    }));
    setStartError(null);
    setPlayerErrors((currentErrors) => {
      if (!currentErrors[playerId]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[playerId];
      return nextErrors;
    });
  };

  const addPlayer = () => {
    setFormValues((currentValues) => {
      if (currentValues.players.length >= MAX_PLAYER_COUNT) {
        return currentValues;
      }

      const nextSequence = getNextPlayerSequence(currentValues.players);

      return {
        ...currentValues,
        players: [...currentValues.players, createPlayerDraft(nextSequence)],
      };
    });
    setStartError(null);
  };

  const removePlayer = (playerId: string) => {
    setFormValues((currentValues) => {
      if (currentValues.players.length <= 2) {
        return currentValues;
      }

      return {
        ...currentValues,
        players: currentValues.players.filter((player) => player.id !== playerId),
      };
    });
    setStartError(null);
    setPlayerErrors((currentErrors) => {
      if (!currentErrors[playerId]) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[playerId];
      return nextErrors;
    });
  };

  const updateNumberSetting = (
    key: "conceptCount" | "roundsPerConcept" | "discussionTimerSeconds" | "imposterGuessTimerSeconds",
    value: string | number,
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      settings: {
        ...currentValues.settings,
        [key]: typeof value === "number" ? value : Number(value || 1),
      },
    }));
    setStartError(null);
  };

  const updateConceptPoolMode = (value: "CURRENT_MONTH_PACK" | "FULL_CONCEPT_POOL") => {
    setFormValues((currentValues) => ({
      ...currentValues,
      settings: {
        ...currentValues.settings,
        conceptPoolMode: value,
      },
    }));
    setStartError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedValues: GameSetupFormValues = {
      ...formValues,
      players: formValues.players.map((player) => ({
        ...player,
        name: trimPlayerName(player.name),
      })),
    };

    setFormValues(trimmedValues);

    const validationResult = validateGameSetupForm(trimmedValues);

    if (hasGameSetupErrors(validationResult)) {
      setPlayerErrors(validationResult.playerErrors);
      setMatchConfig(null);
      return;
    }

    setPlayerErrors({});
    const accessToken = session?.access_token;
    if (!accessToken) {
      setStartError("You need to be signed in before you can start the match.");
      return;
    }

    const offlineMatchConfig = toOfflineMatchConfig(trimmedValues);

    setIsStartingMatch(true);
    setStartError(null);
    setConceptTransitionError(null);

    try {
      const lobby = await createPrivateImposterLobby(accessToken, offlineMatchConfig.settings.conceptPoolMode);
      const concept = await fetchNextGameConcept(accessToken, [], lobby.publicId);
      const assignment = assignImposter(offlineMatchConfig.players);

      setMatchConfig(
        initializeOfflineMatch(
          offlineMatchConfig,
          {
            conceptPublicId: concept.conceptPublicId,
            word: concept.word,
          },
          assignment.imposterPlayerId,
          lobby.publicId,
          offlineMatchConfig.settings.conceptPoolMode,
        ),
      );
    } catch (error) {
      const createLobbyError = toFriendlyCreateLobbyError(error);
      const lobbyAccessError = toFriendlyLobbyAccessError(error);

      setMatchConfig(null);
      if (createLobbyError) {
        setStartError(createLobbyError);
      } else if (isEmptyConceptBankError(error)) {
        setStartError("No concepts are available right now. Add concepts before starting a match.");
      } else if (lobbyAccessError) {
        setStartError(lobbyAccessError);
      } else if (error instanceof Error && error.message) {
        setStartError(error.message);
      } else {
        setStartError("We could not start the match right now. Please try again.");
      }
    } finally {
      setIsStartingMatch(false);
    }
  };

  return (
    <Container size="lg" className="py-6 lg:py-8">
      <Stack gap="lg">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Game setup
            </p>
            <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              Prepare an offline match
            </Title>
            <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
              Enter player names, tune the match settings, and start a reveal-ready offline match
              on the same phone.
            </Text>
          </div>
        </Card>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <Card radius="32px" padding="xl" className={sectionCardClassName}>
              <Stack gap="lg">
                <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                      Players
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                      Add everyone joining the match
                    </h2>
                    <Text size="sm" className="mt-2 max-w-xl leading-relaxed text-[var(--color-text-secondary)]">
                      Start with defaults, rename people directly, and adjust the player count on
                      this screen.
                    </Text>
                  </div>

                  <Button
                    type="button"
                    radius="xl"
                    size="md"
                    onClick={addPlayer}
                    className="min-h-11 self-start px-6 sm:min-w-[11rem]"
                    disabled={formValues.players.length >= MAX_PLAYER_COUNT}
                    styles={{
                      root: {
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-background)",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    Add player
                  </Button>
                </div>

                {Object.keys(playerErrors).length > 0 ? (
                  <Alert color="red" radius="lg" variant="light" title="Player names required">
                    Enter a name for every player before starting the match.
                  </Alert>
                ) : null}

                {startError ? (
                  <Alert color="red" radius="lg" variant="light" title="Match could not start">
                    {startError}
                  </Alert>
                ) : null}

                <Stack gap="md">
                  {formValues.players.map((player, index) => (
                    <div
                      key={player.id}
                      className="rounded-[24px] border border-white/10 bg-black/20 p-4 sm:p-5"
                    >
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                        <TextInput
                          label={`Player ${index + 1}`}
                          placeholder="Enter name here"
                          value={player.name}
                          onChange={(event) => updatePlayerName(player.id, event.currentTarget.value)}
                          size="md"
                          styles={textInputStyles}
                        />

                        <Button
                          type="button"
                          variant="default"
                          radius="xl"
                          size="md"
                          className="min-h-11"
                          disabled={formValues.players.length <= 2}
                          onClick={() => removePlayer(player.id)}
                          styles={{
                            root: {
                              backgroundColor: "transparent",
                              borderColor: "var(--color-border)",
                              color: "var(--color-text)",
                            },
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </Stack>
              </Stack>
            </Card>

            <div className="space-y-6">
              <Card radius="32px" padding="xl" className={sectionCardClassName}>
                <Stack gap="lg">
                  <div className="border-b border-white/10 pb-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                      Match settings
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                      Tune the round setup
                    </h2>
                  </div>

                  <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    <NumberInput
                      label="Number of concepts"
                      min={1}
                      max={MAX_CONCEPT_COUNT}
                      value={formValues.settings.conceptCount}
                      onChange={(value) => updateNumberSetting("conceptCount", value)}
                      allowDecimal={false}
                      clampBehavior="strict"
                      styles={textInputStyles}
                    />
                    <NumberInput
                      label="Rounds per concept"
                      min={1}
                      max={MAX_ROUNDS_PER_CONCEPT}
                      value={formValues.settings.roundsPerConcept}
                      onChange={(value) => updateNumberSetting("roundsPerConcept", value)}
                      allowDecimal={false}
                      clampBehavior="strict"
                      styles={textInputStyles}
                    />
                    <NumberInput
                      label="Discussion timer (seconds)"
                      min={MIN_TIMER_SECONDS}
                      max={MAX_TIMER_SECONDS}
                      value={formValues.settings.discussionTimerSeconds}
                      onChange={(value) => updateNumberSetting("discussionTimerSeconds", value)}
                      allowDecimal={false}
                      clampBehavior="strict"
                      styles={textInputStyles}
                    />
                    <NumberInput
                      label="Imposter guess timer (seconds)"
                      min={MIN_TIMER_SECONDS}
                      max={MAX_TIMER_SECONDS}
                      value={formValues.settings.imposterGuessTimerSeconds}
                      onChange={(value) => updateNumberSetting("imposterGuessTimerSeconds", value)}
                      allowDecimal={false}
                      clampBehavior="strict"
                      styles={textInputStyles}
                    />
                  </SimpleGrid>

                  <div>
                    <Text size="sm" fw={600} className="mb-2 text-[var(--color-text)]">
                      Concept source
                    </Text>
                    <SegmentedControl
                      fullWidth
                      radius="xl"
                      value={formValues.settings.conceptPoolMode}
                      onChange={(value) =>
                        updateConceptPoolMode(value as "CURRENT_MONTH_PACK" | "FULL_CONCEPT_POOL")
                      }
                      data={IMPOSTER_CONCEPT_POOL_OPTIONS}
                    />
                  </div>
                </Stack>
              </Card>

              <Card radius="32px" padding="xl" className={sectionCardClassName}>
                <Stack gap="md">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                      Start
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
                      Ready to create the match
                    </h2>
                    <Text size="sm" className="mt-2 leading-relaxed text-[var(--color-text-secondary)]">
                      Starting the match now assigns one concept and one imposter automatically,
                      then prepares the game for the reveal phase.
                    </Text>
                  </div>

                  <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                    <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
                      {formValues.players.length} players, {formValues.settings.conceptCount} concepts,
                      {" "}
                      {formValues.settings.roundsPerConcept} rounds per concept,
                      {" "}
                      {formValues.settings.discussionTimerSeconds}s discussion,
                      {" "}
                      {formValues.settings.imposterGuessTimerSeconds}s guess timer, source:{" "}
                      {getConceptPoolModeLabel(formValues.settings.conceptPoolMode)}
                      .
                    </p>
                  </div>

                  <Button
                    type="submit"
                    radius="xl"
                    size="lg"
                    fullWidth
                    className="min-h-12"
                    loading={isStartingMatch}
                    disabled={!session?.access_token}
                    styles={{
                      root: {
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-background)",
                      },
                    }}
                  >
                    Start match
                  </Button>
                </Stack>
              </Card>
            </div>
          </div>
        </form>
      </Stack>
    </Container>
  );
}
