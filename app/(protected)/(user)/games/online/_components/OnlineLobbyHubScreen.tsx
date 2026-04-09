"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { LearnerCurrentImposterMonthlyPack } from "@/interfaces/interfaces";
import { useAuth } from "@/lib/auth/client/AuthContext";
import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Modal,
  Radio,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  createPrivateLobby,
  getPrivateLobbyState,
  joinPrivateLobby,
  normalizeLobbyCode,
} from "../_lib/api";
import {
  fetchLearnerCurrentImposterMonthlyPack,
  toFriendlyLearnerCurrentMonthlyPackError,
} from "../../_lib/monthlyPackProvider";
import type { LobbyConceptPoolMode } from "../_lib/types";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";
const JOIN_STATE_HYDRATE_RETRY_DELAYS_MS = [200, 400, 700];

export default function OnlineLobbyHubScreen() {
  const router = useRouter();
  const { session } = useAuth();

  const [conceptPoolMode, setConceptPoolMode] =
    useState<LobbyConceptPoolMode>("CURRENT_MONTH_PACK");
  const [lobbyCode, setLobbyCode] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [monthlyPack, setMonthlyPack] =
    useState<LearnerCurrentImposterMonthlyPack | null>(null);
  const [isMonthlyPackLoading, setIsMonthlyPackLoading] = useState(false);
  const [monthlyPackError, setMonthlyPackError] = useState<string | null>(null);
  const [isConceptsModalOpen, setIsConceptsModalOpen] = useState(false);

  const accessToken = session?.access_token ?? null;
  const featuredWeekSlotByConceptId = useMemo(() => {
    const map = new Map<string, number>();
    if (!monthlyPack) {
      return map;
    }

    for (const slot of monthlyPack.weeklyFeaturedSlots) {
      if (!slot.conceptPublicId) {
        continue;
      }
      map.set(slot.conceptPublicId, slot.weekSlot);
    }

    return map;
  }, [monthlyPack]);

  const sortedVisibleConcepts = useMemo(() => {
    const concepts = monthlyPack?.visibleConcepts ?? [];

    return [...concepts].sort((left, right) => {
      const leftWeekSlot =
        left.weekSlot ?? featuredWeekSlotByConceptId.get(left.conceptPublicId) ?? Number.POSITIVE_INFINITY;
      const rightWeekSlot =
        right.weekSlot ?? featuredWeekSlotByConceptId.get(right.conceptPublicId) ?? Number.POSITIVE_INFINITY;

      if (left.weeklyFeatured && !right.weeklyFeatured) {
        return -1;
      }

      if (!left.weeklyFeatured && right.weeklyFeatured) {
        return 1;
      }

      if (left.weeklyFeatured && right.weeklyFeatured && leftWeekSlot !== rightWeekSlot) {
        return leftWeekSlot - rightWeekSlot;
      }

      return left.title.localeCompare(right.title);
    });
  }, [featuredWeekSlotByConceptId, monthlyPack?.visibleConcepts]);

  useEffect(() => {
    if (!accessToken) {
      setMonthlyPack(null);
      setMonthlyPackError(null);
      setIsMonthlyPackLoading(false);
      return;
    }

    let active = true;
    setIsMonthlyPackLoading(true);
    setMonthlyPackError(null);

    void fetchLearnerCurrentImposterMonthlyPack(accessToken)
      .then((pack) => {
        if (!active) {
          return;
        }
        setMonthlyPack(pack);
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setMonthlyPack(null);
        setMonthlyPackError(toFriendlyLearnerCurrentMonthlyPackError(error));
      })
      .finally(() => {
        if (!active) {
          return;
        }
        setIsMonthlyPackLoading(false);
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

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
      await hydrateJoinedLobbyState(accessToken, joinedLobby.publicId);

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

            <Group justify="space-between" align="center">
              <Text size="sm" className="text-[var(--color-text-secondary)]">
                Preview the current month pack before creating.
              </Text>
              <Button
                type="button"
                variant="default"
                radius="xl"
                size="sm"
                onClick={() => setIsConceptsModalOpen(true)}
                styles={{
                  root: {
                    borderColor: "color-mix(in srgb, var(--color-primary) 45%, transparent)",
                    color: "var(--color-primary)",
                    backgroundColor: "color-mix(in srgb, var(--color-primary) 10%, transparent)",
                  },
                }}
              >
                View monthly concepts
              </Button>
            </Group>

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

        <Modal
          opened={isConceptsModalOpen}
          onClose={() => setIsConceptsModalOpen(false)}
          title="Current month concepts"
          centered
          size="lg"
          styles={{
            content: {
              backgroundColor: "var(--color-surface)",
              color: "var(--color-text)",
            },
            header: {
              backgroundColor: "var(--color-surface)",
            },
            title: {
              fontWeight: 700,
            },
          }}
        >
          <Stack gap="sm">
            {monthlyPack?.yearMonth ? (
              <Badge color="lime" radius="sm" variant="light" className="w-max">
                {formatYearMonthLabel(monthlyPack.yearMonth)}
              </Badge>
            ) : null}

            {isMonthlyPackLoading ? (
              <Text size="sm" className="text-[var(--color-text-secondary)]">
                Loading current month concepts...
              </Text>
            ) : null}

            {!isMonthlyPackLoading && monthlyPackError ? (
              <Alert color="red" radius="md" variant="light" title="Could not load monthly pack">
                {monthlyPackError}
              </Alert>
            ) : null}

            {!isMonthlyPackLoading && !monthlyPackError && !monthlyPack?.exists ? (
              <Alert color="yellow" radius="md" variant="light" title="Monthly pack unavailable">
                No monthly concept pack is available right now.
              </Alert>
            ) : null}

            {!isMonthlyPackLoading
            && !monthlyPackError
            && monthlyPack?.exists
            && sortedVisibleConcepts.length === 0 ? (
              <Text size="sm" className="text-[var(--color-text-secondary)]">
                No visible concepts have been published for this monthly pack yet.
              </Text>
            ) : null}

            {!isMonthlyPackLoading
            && !monthlyPackError
            && monthlyPack?.exists
            && sortedVisibleConcepts.length > 0 ? (
              <Stack gap="xs" className="max-h-[60vh] overflow-y-auto pr-1">
                {sortedVisibleConcepts.map((concept) => {
                  const weekSlot =
                    concept.weekSlot
                    ?? featuredWeekSlotByConceptId.get(concept.conceptPublicId)
                    ?? null;

                  return (
                    <Link
                      key={concept.conceptPublicId}
                      href={`/concepts/${concept.conceptPublicId}`}
                      className="block rounded-xl border border-white/10 bg-black/20 px-3 py-2 transition-colors hover:border-[var(--color-primary)] hover:bg-black/30"
                      onClick={() => setIsConceptsModalOpen(false)}
                    >
                      <Group justify="space-between" align="center" className="gap-2">
                        <Text size="sm" className="font-medium text-[var(--color-text)]">
                          {concept.title}
                        </Text>
                        {concept.weeklyFeatured ? (
                          <Badge color="lime" radius="sm" variant="light">
                            {weekSlot ? `Featured in Week ${weekSlot}` : "Featured"}
                          </Badge>
                        ) : null}
                      </Group>
                    </Link>
                  );
                })}
              </Stack>
            ) : null}
          </Stack>
        </Modal>

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

function formatYearMonthLabel(yearMonth: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(yearMonth);
  if (!match) {
    return yearMonth;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return yearMonth;
  }

  const parsedDate = new Date(Date.UTC(year, month - 1, 1));
  return parsedDate.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
}

async function hydrateJoinedLobbyState(
  accessToken: string,
  lobbyPublicId: string,
): Promise<void> {
  for (const retryDelayMs of JOIN_STATE_HYDRATE_RETRY_DELAYS_MS) {
    try {
      await getPrivateLobbyState(accessToken, lobbyPublicId);
      return;
    } catch {
      await waitMs(retryDelayMs);
    }
  }
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
