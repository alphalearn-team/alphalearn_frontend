"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/client/AuthContext";
import {
  Alert,
  Button,
  Card,
  Container,
  Radio,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  createPrivateLobby,
  joinPrivateLobby,
  normalizeLobbyCode,
} from "../_lib/api";
import type { LobbyConceptPoolMode } from "../_lib/types";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

export default function OnlineLobbyHubScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const [conceptPoolMode, setConceptPoolMode] =
    useState<LobbyConceptPoolMode>("CURRENT_MONTH_PACK");
  const [lobbyCode, setLobbyCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const accessToken = session?.access_token ?? null;

  const handleCreate = async () => {
    if (!accessToken || isCreating) {
      return;
    }

    setErrorMessage(null);
    setIsCreating(true);

    try {
      const lobby = await createPrivateLobby(accessToken, {
        conceptPoolMode,
      });

      router.push(`/games/online/${lobby.publicId}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Could not create lobby right now.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!accessToken || isJoining) {
      return;
    }

    const normalizedCode = normalizeLobbyCode(lobbyCode);
    if (!normalizedCode) {
      setErrorMessage("Enter a lobby code to join.");
      return;
    }

    setErrorMessage(null);
    setIsJoining(true);

    try {
      const joinedLobby = await joinPrivateLobby(accessToken, {
        lobbyCode: normalizedCode,
      });

      router.push(`/games/online/${joinedLobby.publicId}`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error && error.message
          ? error.message
          : "Could not join lobby right now.",
      );
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Container size="md" className="py-6 lg:py-8">
      <Stack gap="lg">
        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="md">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Online imposter
              </p>
              <Title
                order={1}
                className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]"
              >
                Create or join a private lobby
              </Title>
              <Text
                size="sm"
                className="mt-3 leading-relaxed text-[var(--color-text-secondary)]"
              >
                Multiplayer gameplay now runs on an authoritative backend. Use this page to create
                a lobby or join one using a code.
              </Text>
            </div>

            {!accessToken ? (
              <Alert color="yellow" radius="lg" variant="light" title="Sign in required">
                You need to be signed in before creating or joining a lobby.
              </Alert>
            ) : null}

            {errorMessage ? (
              <Alert color="red" radius="lg" variant="light" title="Action failed">
                {errorMessage}
              </Alert>
            ) : null}
          </Stack>
        </Card>

        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <Stack gap="md">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                Create lobby
              </p>
              <Title
                order={2}
                className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text)]"
              >
                Start a new private lobby
              </Title>
            </div>

            <Radio.Group
              value={conceptPoolMode}
              onChange={(value) => setConceptPoolMode(value as LobbyConceptPoolMode)}
              label="Concept pool"
              styles={{
                label: {
                  color: "var(--color-text)",
                  marginBottom: "10px",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                },
              }}
            >
              <Stack gap="xs">
                <Radio
                  value="CURRENT_MONTH_PACK"
                  label="Current month pack"
                  color="lime"
                />
                <Radio
                  value="FULL_CONCEPT_POOL"
                  label="Full concept pool"
                  color="lime"
                />
              </Stack>
            </Radio.Group>

            <Button
              radius="xl"
              size="lg"
              className="min-h-12"
              onClick={handleCreate}
              loading={isCreating}
              disabled={!accessToken}
              styles={{
                root: {
                  backgroundColor: "var(--color-primary)",
                  color: "var(--color-background)",
                },
              }}
            >
              Create lobby
            </Button>
          </Stack>
        </Card>

        <Card radius="32px" padding="xl" className={sectionCardClassName}>
          <form onSubmit={handleJoin}>
            <Stack gap="md">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
                  Join lobby
                </p>
                <Title
                  order={2}
                  className="mt-2 text-2xl font-semibold tracking-tight text-[var(--color-text)]"
                >
                  Enter a lobby code
                </Title>
              </div>

              <TextInput
                placeholder="ABC123"
                value={lobbyCode}
                onChange={(event) => setLobbyCode(event.currentTarget.value)}
                styles={{
                  input: {
                    backgroundColor: "var(--color-surface)",
                    borderColor: "var(--color-border)",
                    color: "var(--color-text)",
                    textTransform: "uppercase",
                  },
                }}
              />

              <Button
                type="submit"
                radius="xl"
                size="lg"
                className="min-h-12"
                loading={isJoining}
                disabled={!accessToken}
                styles={{
                  root: {
                    backgroundColor: "var(--color-primary)",
                    color: "var(--color-background)",
                  },
                }}
              >
                Join lobby
              </Button>
            </Stack>
          </form>
        </Card>
      </Stack>
    </Container>
  );
}
