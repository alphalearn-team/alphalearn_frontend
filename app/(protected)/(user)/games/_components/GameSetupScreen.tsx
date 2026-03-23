"use client";

import { useState } from "react";
import {
  Button,
  Card,
  Container,
  NumberInput,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  createDefaultGameSetupForm,
  createPlayerDraft,
  getNextPlayerSequence,
  type GameSetupFormValues,
} from "../_lib/gameSetup";

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

export default function GameSetupScreen() {
  const [formValues, setFormValues] = useState<GameSetupFormValues>(() => createDefaultGameSetupForm());

  const updatePlayerName = (playerId: string, nextName: string) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      players: currentValues.players.map((player) =>
        player.id === playerId ? { ...player, name: nextName } : player,
      ),
    }));
  };

  const addPlayer = () => {
    setFormValues((currentValues) => {
      const nextSequence = getNextPlayerSequence(currentValues.players);

      return {
        ...currentValues,
        players: [...currentValues.players, createPlayerDraft(nextSequence)],
      };
    });
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
  };

  const updateSetting = (
    key: keyof GameSetupFormValues["settings"],
    value: string | number,
  ) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      settings: {
        ...currentValues.settings,
        [key]: typeof value === "number" ? value : Number(value),
      },
    }));
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
              Enter player names, tune the match settings, and create a local offline match config
              without any backend dependency.
            </Text>
          </div>
        </Card>

        <form onSubmit={(event) => event.preventDefault()}>
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
                    className="min-h-11"
                    styles={{
                      root: {
                        backgroundColor: "var(--color-primary)",
                        color: "var(--color-background)",
                      },
                    }}
                  >
                    Add player
                  </Button>
                </div>

                <Stack gap="md">
                  {formValues.players.map((player, index) => (
                    <div
                      key={player.id}
                      className="rounded-[24px] border border-white/10 bg-black/20 p-4 sm:p-5"
                    >
                      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
                        <TextInput
                          label={`Player ${index + 1}`}
                          placeholder={`Player ${index + 1}`}
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
                      value={formValues.settings.conceptCount}
                      onChange={(value) => updateSetting("conceptCount", value)}
                      allowDecimal={false}
                      clampBehavior="strict"
                      styles={textInputStyles}
                    />
                    <NumberInput
                      label="Rounds per concept"
                      min={1}
                      value={formValues.settings.roundsPerConcept}
                      onChange={(value) => updateSetting("roundsPerConcept", value)}
                      allowDecimal={false}
                      clampBehavior="strict"
                      styles={textInputStyles}
                    />
                    <NumberInput
                      label="Discussion timer (seconds)"
                      min={1}
                      value={formValues.settings.discussionTimerSeconds}
                      onChange={(value) => updateSetting("discussionTimerSeconds", value)}
                      allowDecimal={false}
                      clampBehavior="strict"
                      styles={textInputStyles}
                    />
                    <NumberInput
                      label="Imposter guess timer (seconds)"
                      min={1}
                      value={formValues.settings.imposterGuessTimerSeconds}
                      onChange={(value) => updateSetting("imposterGuessTimerSeconds", value)}
                      allowDecimal={false}
                      clampBehavior="strict"
                      styles={textInputStyles}
                    />
                  </SimpleGrid>
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
                      This story stops at local setup. Starting will create a frontend-only match
                      config for review.
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
                      {formValues.settings.imposterGuessTimerSeconds}s guess timer.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    radius="xl"
                    size="lg"
                    fullWidth
                    className="min-h-12"
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
