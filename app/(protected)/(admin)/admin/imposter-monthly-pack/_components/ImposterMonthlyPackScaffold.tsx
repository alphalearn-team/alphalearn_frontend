"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { AdminConcept, AdminImposterMonthlyPack } from "@/interfaces/interfaces";
import { showError, showSuccess } from "@/lib/utils/popUpNotifications";
import { saveAdminImposterMonthlyPackAction } from "../actions";

interface ImposterMonthlyPackScaffoldProps {
  selectedMonth: string;
  pack: AdminImposterMonthlyPack;
  concepts: AdminConcept[];
}

function toFeaturedSlots(weeklyFeaturedConceptPublicIds: string[]) {
  return Array.from({ length: 4 }, (_, index) => weeklyFeaturedConceptPublicIds[index] ?? "");
}

export default function ImposterMonthlyPackScaffold({
  selectedMonth,
  pack,
  concepts,
}: ImposterMonthlyPackScaffoldProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  const [selectedConceptPublicIds, setSelectedConceptPublicIds] = useState<string[]>(
    pack.concepts.map((entry) => entry.conceptPublicId),
  );
  const [featuredSlotConceptIds, setFeaturedSlotConceptIds] = useState<string[]>(
    toFeaturedSlots(pack.weeklyFeaturedConceptPublicIds),
  );

  useEffect(() => {
    setSelectedConceptPublicIds(pack.concepts.map((entry) => entry.conceptPublicId));
    setFeaturedSlotConceptIds(toFeaturedSlots(pack.weeklyFeaturedConceptPublicIds));
  }, [pack]);

  const conceptByPublicId = useMemo(
    () => new Map(concepts.map((concept) => [concept.publicId, concept])),
    [concepts],
  );

  const conceptOptions = useMemo(
    () =>
      concepts.map((concept) => ({
        value: concept.publicId,
        label: concept.title,
      })),
    [concepts],
  );

  const featuredOptions = useMemo(
    () =>
      selectedConceptPublicIds
        .map((publicId) => conceptByPublicId.get(publicId))
        .filter((concept): concept is AdminConcept => Boolean(concept))
        .map((concept) => ({
          value: concept.publicId,
          label: concept.title,
        })),
    [conceptByPublicId, selectedConceptPublicIds],
  );

  const handleMonthChange = (nextMonth: string) => {
    if (!nextMonth || nextMonth === selectedMonth) {
      return;
    }

    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.set("month", nextMonth);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleFeaturedSlotChange = (slotIndex: number, nextConceptPublicId: string | null) => {
    setFeaturedSlotConceptIds((currentSlots) => {
      const nextSlots = [...currentSlots];
      nextSlots[slotIndex] = nextConceptPublicId ?? "";
      return nextSlots;
    });
  };

  const selectedFeaturedConceptPublicIds = featuredSlotConceptIds.filter((value) => value);
  const hasAllFeaturedSlots = selectedFeaturedConceptPublicIds.length === 4;
  const hasUniqueFeaturedSlots = new Set(selectedFeaturedConceptPublicIds).size === selectedFeaturedConceptPublicIds.length;
  const featuredWithinSelectedConcepts = selectedFeaturedConceptPublicIds.every((publicId) =>
    selectedConceptPublicIds.includes(publicId),
  );
  const hasExactlyTwentyConcepts = selectedConceptPublicIds.length === 20;

  const validationMessage = (() => {
    if (!hasExactlyTwentyConcepts) {
      return "Select exactly 20 concepts for the monthly pack.";
    }
    if (!hasAllFeaturedSlots) {
      return "Assign all 4 weekly featured slots.";
    }
    if (!hasUniqueFeaturedSlots) {
      return "Weekly featured slots must be unique concepts.";
    }
    if (!featuredWithinSelectedConcepts) {
      return "Weekly featured concepts must come from the selected 20 concepts.";
    }

    return null;
  })();

  const canSave = !validationMessage && !isSaving;

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    setIsSaving(true);
    const result = await saveAdminImposterMonthlyPackAction(selectedMonth, {
      conceptPublicIds: selectedConceptPublicIds,
      weeklyFeaturedConceptPublicIds: selectedFeaturedConceptPublicIds,
    });
    setIsSaving(false);

    if (!result.success || !result.pack) {
      showError(result.message);
      return;
    }

    showSuccess(result.message);
    router.refresh();
  };

  return (
    <Stack gap="lg">
      <Card className="admin-card">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Monthly Pack Editor</h2>
            <Text size="sm" c="dimmed" className="mt-2 text-[var(--color-text-secondary)]">
              Choose exactly 20 concepts and mark one weekly featured concept for each week slot.
            </Text>
          </div>
          <TextInput
            type="month"
            label="Month"
            value={selectedMonth}
            onChange={(event) => handleMonthChange(event.currentTarget.value)}
            disabled={isNavigating || isSaving}
          />
        </div>
      </Card>

      <Group grow>
        <Card className="admin-card">
          <p className="text-sm font-semibold text-[var(--color-text)]">Catalog size</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">{concepts.length}</p>
          <Text size="sm" c="dimmed" className="mt-2 text-[var(--color-text-secondary)]">
            concepts available for monthly selection
          </Text>
        </Card>

        <Card className="admin-card">
          <p className="text-sm font-semibold text-[var(--color-text)]">Configured concepts</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">{selectedConceptPublicIds.length}</p>
          <Text size="sm" c="dimmed" className="mt-2 text-[var(--color-text-secondary)]">
            {hasExactlyTwentyConcepts ? "Ready" : "Target: 20"}
          </Text>
        </Card>

        <Card className="admin-card">
          <p className="text-sm font-semibold text-[var(--color-text)]">Weekly featured slots</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">{selectedFeaturedConceptPublicIds.length}</p>
          <Text size="sm" c="dimmed" className="mt-2 text-[var(--color-text-secondary)]">
            {hasAllFeaturedSlots ? "Ready" : "Target: 4"}
          </Text>
        </Card>
      </Group>

      <Card className="admin-card">
        <Stack gap="md">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-[var(--color-text)]">Pack configuration</h3>
            <Badge color={pack.exists ? "teal" : "yellow"} variant="light" radius="xl">
              {pack.exists ? "Configured" : "Not configured"}
            </Badge>
          </div>

          {validationMessage && (
            <Alert color="yellow" radius="lg" variant="light" title="Validation">
              {validationMessage}
            </Alert>
          )}

          <MultiSelect
            label="Monthly concept pack"
            description="Select exactly 20 concepts for this month"
            placeholder="Pick 20 concepts"
            data={conceptOptions}
            value={selectedConceptPublicIds}
            onChange={setSelectedConceptPublicIds}
            searchable
            maxValues={20}
            nothingFoundMessage="No concepts found"
          />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }, (_, index) => (
              <Select
                key={`featured-slot-${index + 1}`}
                label={`Week ${index + 1} featured concept`}
                placeholder="Select a concept"
                data={featuredOptions}
                value={featuredSlotConceptIds[index] || null}
                onChange={(value) => handleFeaturedSlotChange(index, value)}
                searchable
                clearable
                nothingFoundMessage="No selected concepts available"
              />
            ))}
          </div>

          <Button
            onClick={handleSave}
            disabled={!canSave}
            loading={isSaving}
            className="mt-2"
          >
            Save monthly pack
          </Button>
        </Stack>
      </Card>
    </Stack>
  );
}
