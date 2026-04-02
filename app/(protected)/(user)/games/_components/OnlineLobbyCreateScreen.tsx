"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/client/AuthContext";
import { Alert, Button, Card, Code, SegmentedControl, Stack, Text, Title } from "@mantine/core";
import {
  createPrivateImposterLobby,
  toFriendlyCreateLobbyError,
} from "../_lib/conceptProvider";
import {
  getConceptPoolModeLabel,
  IMPOSTER_CONCEPT_POOL_OPTIONS,
} from "../_lib/conceptPoolOptions";
import type { ImposterConceptPoolMode } from "../_lib/gameSetup";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

interface CreatedLobbySummary {
  publicId: string;
  conceptPoolMode: ImposterConceptPoolMode;
  pinnedYearMonth: string | null;
  createdAt: string;
}

export default function OnlineLobbyCreateScreen() {
  const { session } = useAuth();
  const [conceptPoolMode, setConceptPoolMode] = useState<ImposterConceptPoolMode>("FULL_CONCEPT_POOL");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [createdLobby, setCreatedLobby] = useState<CreatedLobbySummary | null>(null);

  const handleCreateLobby = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const accessToken = session?.access_token;

    if (!accessToken) {
      setErrorMessage("You need to be signed in before creating an online lobby.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setCopyStatus(null);

    try {
      const lobby = await createPrivateImposterLobby(accessToken, conceptPoolMode);
      const normalizedLobby = lobby as typeof lobby & {
        conceptPoolMode?: ImposterConceptPoolMode;
        pinnedYearMonth?: string | null;
        createdAt?: string;
      };

      setCreatedLobby({
        publicId: lobby.publicId,
        conceptPoolMode: normalizedLobby.conceptPoolMode ?? conceptPoolMode,
        pinnedYearMonth: normalizedLobby.pinnedYearMonth ?? null,
        createdAt: normalizedLobby.createdAt ?? new Date().toISOString(),
      });
    } catch (error) {
      setCreatedLobby(null);
      setErrorMessage(toFriendlyCreateLobbyError(error) ?? "We could not create the private lobby right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLobbyCode = async () => {
    if (!createdLobby?.publicId) {
      return;
    }

    try {
      await navigator.clipboard.writeText(createdLobby.publicId);
      setCopyStatus("Lobby code copied.");
    } catch {
      setCopyStatus("Could not copy automatically. Please copy the code manually.");
    }
  };

  return (
    <Stack gap="lg">
      <Card radius="32px" padding="xl" className={sectionCardClassName}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Online lobby
        </p>
        <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Create a private online lobby
        </Title>
        <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
          Choose the concept source and create a private lobby. Players can use the lobby code to
          join in a later update.
        </Text>
      </Card>

      <form onSubmit={handleCreateLobby}>
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="lg">
            <div>
              <Text size="sm" fw={600} className="mb-2 text-[var(--color-text)]">
                Concept source
              </Text>
              <SegmentedControl
                fullWidth
                radius="xl"
                value={conceptPoolMode}
                onChange={(value) => setConceptPoolMode(value as ImposterConceptPoolMode)}
                data={IMPOSTER_CONCEPT_POOL_OPTIONS}
              />
            </div>

            {errorMessage ? (
              <Alert color="red" radius="lg" variant="light" title="Lobby could not be created">
                {errorMessage}
              </Alert>
            ) : null}

            <Button
              type="submit"
              radius="xl"
              size="lg"
              className="min-h-12"
              loading={isSubmitting}
              disabled={!session?.access_token}
              styles={{
                root: {
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                },
              }}
            >
              Create private lobby
            </Button>
          </Stack>
        </Card>
      </form>

      {createdLobby ? (
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Lobby ready
            </p>

            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Lobby code</p>
              <Code className="mt-2 text-base">{createdLobby.publicId}</Code>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-[var(--color-text-secondary)]">
              Source: {getConceptPoolModeLabel(createdLobby.conceptPoolMode)}
              <br />
              Pinned month: {createdLobby.pinnedYearMonth ?? "Not pinned"}
              <br />
              Created: {new Date(createdLobby.createdAt).toLocaleString()}
            </div>

            <Button type="button" radius="xl" variant="default" onClick={handleCopyLobbyCode}>
              Copy lobby code
            </Button>

            {copyStatus ? (
              <Text size="sm" className="text-[var(--color-text-secondary)]">
                {copyStatus}
              </Text>
            ) : null}
          </Stack>
        </Card>
      ) : null}
    </Stack>
  );
}
