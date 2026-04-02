"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth/client/AuthContext";
import {
  Alert,
  Button,
  Card,
  Code,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  createPrivateImposterLobby,
  joinPrivateImposterLobby,
  toFriendlyCreateLobbyError,
  toFriendlyJoinLobbyError,
} from "../_lib/conceptProvider";
import {
  getConceptPoolModeLabel,
  IMPOSTER_CONCEPT_POOL_OPTIONS,
} from "../_lib/conceptPoolOptions";
import type { ImposterConceptPoolMode } from "../_lib/gameSetup";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

type OnlineLobbyEntryMode = "create" | "join";

interface LobbySummary {
  lobbyCode: string;
  isPrivate: boolean;
  conceptPoolMode: ImposterConceptPoolMode;
  pinnedYearMonth: string | null;
  createdAt: string;
  joinedAt?: string;
  alreadyMember?: boolean;
}

function toPinnedMonthLabel(pinnedYearMonth: string | null): string {
  const fallback = new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" });

  if (!pinnedYearMonth) {
    return `Current month (${fallback})`;
  }

  const [yearRaw, monthRaw] = pinnedYearMonth.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return `Current month (${fallback})`;
  }

  const date = new Date(Date.UTC(year, month - 1, 1));
  return `Current month (${date.toLocaleDateString(undefined, { month: "long", year: "numeric" })})`;
}

export default function OnlineLobbyCreateScreen() {
  const { session } = useAuth();
  const [mode, setMode] = useState<OnlineLobbyEntryMode>("create");
  const [conceptPoolMode, setConceptPoolMode] = useState<ImposterConceptPoolMode>("FULL_CONCEPT_POOL");
  const [lobbyCodeInput, setLobbyCodeInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [lobbySummary, setLobbySummary] = useState<LobbySummary | null>(null);

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

      setLobbySummary({
        lobbyCode: lobby.lobbyCode,
        isPrivate: lobby.isPrivate,
        conceptPoolMode: lobby.conceptPoolMode,
        pinnedYearMonth: lobby.pinnedYearMonth,
        createdAt: lobby.createdAt,
      });
    } catch (error) {
      setLobbySummary(null);
      setErrorMessage(toFriendlyCreateLobbyError(error) ?? "We could not create the private lobby right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinLobby = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const accessToken = session?.access_token;

    if (!accessToken) {
      setErrorMessage("You need to be signed in before joining an online lobby.");
      return;
    }

    const normalizedLobbyCode = lobbyCodeInput.trim().toUpperCase();

    if (!normalizedLobbyCode) {
      setErrorMessage("Enter a lobby code to join.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setCopyStatus(null);

    try {
      const lobby = await joinPrivateImposterLobby(accessToken, normalizedLobbyCode);

      setLobbySummary({
        lobbyCode: lobby.lobbyCode,
        isPrivate: lobby.isPrivate,
        conceptPoolMode: lobby.conceptPoolMode,
        pinnedYearMonth: lobby.pinnedYearMonth,
        createdAt: lobby.createdAt,
        joinedAt: lobby.joinedAt,
        alreadyMember: lobby.alreadyMember,
      });
      setLobbyCodeInput(lobby.lobbyCode);
    } catch (error) {
      setLobbySummary(null);
      setErrorMessage(toFriendlyJoinLobbyError(error) ?? "We could not join that lobby right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLobbyCode = async () => {
    if (!lobbySummary?.lobbyCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(lobbySummary.lobbyCode);
      setCopyStatus("Lobby code copied.");
    } catch {
      setCopyStatus("Could not copy automatically. Please copy the code manually.");
    }
  };

  const handleModeChange = (value: string) => {
    const nextMode = value as OnlineLobbyEntryMode;
    setMode(nextMode);
    setErrorMessage(null);
    setCopyStatus(null);
    setLobbySummary(null);
  };

  return (
    <Stack gap="lg">
      <Card radius="32px" padding="xl" className={sectionCardClassName}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
          Online lobby
        </p>
        <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Create or join a private online lobby
        </Title>
        <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
          Create a private lobby as host, or join an existing one with a lobby code.
        </Text>
      </Card>

      <Card radius="32px" padding="xl" className={sectionCardClassName}>
        <Stack gap="sm">
          <Text size="sm" fw={600} className="text-[var(--color-text)]">
            Action
          </Text>
          <SegmentedControl
            fullWidth
            radius="xl"
            value={mode}
            onChange={handleModeChange}
            data={[
              { label: "Create", value: "create" },
              { label: "Join", value: "join" },
            ]}
          />
        </Stack>
      </Card>

      {mode === "create" ? (
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
      ) : (
        <form onSubmit={handleJoinLobby}>
          <Card radius="32px" padding="xl" className={sectionCardClassName}>
            <Stack gap="lg">
              <TextInput
                label="Lobby code"
                placeholder="Enter code"
                value={lobbyCodeInput}
                onChange={(event) => setLobbyCodeInput(event.currentTarget.value.toUpperCase())}
                size="md"
                autoCapitalize="characters"
                spellCheck={false}
                styles={{
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
                    textTransform: "uppercase",
                  },
                }}
              />

              {errorMessage ? (
                <Alert color="red" radius="lg" variant="light" title="Lobby could not be joined">
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
                Join private lobby
              </Button>
            </Stack>
          </Card>
        </form>
      )}

      {lobbySummary ? (
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Lobby ready
            </p>

            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-text-muted)]">Lobby code</p>
              <Code className="mt-2 text-base">{lobbySummary.lobbyCode}</Code>
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4 text-sm text-[var(--color-text-secondary)]">
              Visibility: {lobbySummary.isPrivate ? "Private" : "Public"}
              <br />
              Source: {getConceptPoolModeLabel(lobbySummary.conceptPoolMode)}
              <br />
              Pinned month: {toPinnedMonthLabel(lobbySummary.pinnedYearMonth)}
              <br />
              Created: {new Date(lobbySummary.createdAt).toLocaleString()}
              {lobbySummary.joinedAt ? (
                <>
                  <br />
                  Joined: {new Date(lobbySummary.joinedAt).toLocaleString()}
                </>
              ) : null}
            </div>

            {typeof lobbySummary.alreadyMember === "boolean" ? (
              <Text size="sm" className="text-[var(--color-text-secondary)]">
                {lobbySummary.alreadyMember
                  ? "You are already a member of this lobby."
                  : "You joined this lobby successfully."}
              </Text>
            ) : null}

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
