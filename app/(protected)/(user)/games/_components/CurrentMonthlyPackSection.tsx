"use client";

import { useEffect, useState } from "react";
import { Alert, Badge, Card, Group, Loader, Stack, Text } from "@mantine/core";
import { useAuth } from "@/lib/auth/client/AuthContext";
import type { LearnerCurrentImposterMonthlyPack } from "@/interfaces/interfaces";
import {
  fetchLearnerCurrentImposterMonthlyPack,
  toFriendlyLearnerCurrentMonthlyPackError,
} from "../_lib/monthlyPackProvider";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

type PackLoadState = "idle" | "loading" | "loaded" | "error";

function toReadableYearMonth(yearMonth: string | null): string {
  if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
    return "Current month";
  }

  const [yearRaw, monthRaw] = yearMonth.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return "Current month";
  }

  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export default function CurrentMonthlyPackSection() {
  const { session } = useAuth();
  const [state, setState] = useState<PackLoadState>("idle");
  const [pack, setPack] = useState<LearnerCurrentImposterMonthlyPack | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = session?.access_token;

    if (!accessToken) {
      return;
    }

    let cancelled = false;

    const loadPack = async () => {
      setState("loading");
      setErrorMessage(null);

      try {
        const data = await fetchLearnerCurrentImposterMonthlyPack(accessToken);

        if (cancelled) {
          return;
        }

        setPack(data);
        setState("loaded");
      } catch (error) {
        if (cancelled) {
          return;
        }

        setPack(null);
        setState("error");
        setErrorMessage(toFriendlyLearnerCurrentMonthlyPackError(error));
      }
    };

    loadPack();

    return () => {
      cancelled = true;
    };
  }, [session?.access_token]);

  return (
    <Card radius="32px" padding="xl" className={sectionCardClassName}>
      <Stack gap="md">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            Monthly game pack
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--color-text)]">
            Current monthly concepts
          </h2>
          <Text size="sm" className="mt-2 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
            Review visible concepts in this month’s game pack. Weekly featured concepts are clearly
            marked.
          </Text>
        </div>

        {!session?.access_token ? (
          <Alert color="blue" radius="lg" variant="light" title="Sign in to view this pack">
            You need to be signed in to view the current monthly game pack.
          </Alert>
        ) : null}

        {state === "loading" ? (
          <Group gap="xs">
            <Loader size="sm" />
            <Text size="sm" className="text-[var(--color-text-secondary)]">
              Loading current monthly pack...
            </Text>
          </Group>
        ) : null}

        {state === "error" && errorMessage ? (
          <Alert color="red" radius="lg" variant="light" title="Could not load monthly pack">
            {errorMessage}
          </Alert>
        ) : null}

        {state === "loaded" && pack?.exists === false ? (
          <Alert color="blue" radius="lg" variant="light" title="No current monthly pack">
            The monthly game pack has not been published yet.
          </Alert>
        ) : null}

        {state === "loaded" && pack?.exists ? (
          <Stack gap="md">
            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
              <Text size="sm" className="text-[var(--color-text-secondary)]">
                Month: {toReadableYearMonth(pack.yearMonth)}
              </Text>
              <Text size="sm" className="text-[var(--color-text-secondary)]">
                Visible concepts: {pack.visibleConcepts.length}
              </Text>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {pack.weeklyFeaturedSlots.map((slot) => (
                <div key={slot.weekSlot} className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                  <Text size="xs" className="uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
                    {slot.revealed ? `Week ${slot.weekSlot} featured` : `Week ${slot.weekSlot} (upcoming)`}
                  </Text>
                  <Text size="sm" className="mt-1 text-[var(--color-text-secondary)]">
                    {slot.revealed && slot.conceptTitle ? slot.conceptTitle : "Not revealed yet"}
                  </Text>
                </div>
              ))}
            </div>

            {pack.visibleConcepts.length === 0 ? (
              <Alert color="blue" radius="lg" variant="light" title="No visible concepts yet">
                No concepts are visible in the current monthly pack right now.
              </Alert>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              {pack.visibleConcepts.map((concept) => {
                const isFeatured = concept.weeklyFeatured;

                return (
                  <div key={concept.conceptPublicId} className="rounded-[16px] border border-white/10 bg-black/20 p-3">
                    <Group justify="space-between" align="start" wrap="nowrap">
                      <Text size="sm" fw={600} className="text-[var(--color-text)]">
                        {concept.title}
                      </Text>

                      {isFeatured ? (
                        <Badge size="sm" color="teal" variant="light">
                          {concept.weekSlot ? `Week ${concept.weekSlot} featured` : "Weekly featured"}
                        </Badge>
                      ) : null}
                    </Group>
                  </div>
                );
              })}
            </div>
          </Stack>
        ) : null}
      </Stack>
    </Card>
  );
}
