"use client";

import { Badge, Card, Group, Stack, Text, TextInput } from "@mantine/core";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import type { AdminConcept, AdminImposterMonthlyPack } from "@/interfaces/interfaces";

interface ImposterMonthlyPackScaffoldProps {
  selectedMonth: string;
  pack: AdminImposterMonthlyPack;
  concepts: AdminConcept[];
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

  return (
    <Stack gap="lg">
      <Card className="admin-card">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-[var(--color-text)]">Monthly Pack</h2>
            <Text size="sm" c="dimmed" className="mt-2 text-[var(--color-text-secondary)]">
              Select a month to review or configure the 20-concept pack and weekly featured slots.
            </Text>
          </div>
          <TextInput
            type="month"
            label="Month"
            value={selectedMonth}
            onChange={(event) => handleMonthChange(event.currentTarget.value)}
            disabled={isNavigating}
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
          <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">{pack.concepts.length}</p>
          <Text size="sm" c="dimmed" className="mt-2 text-[var(--color-text-secondary)]">
            of 20 required concepts
          </Text>
        </Card>

        <Card className="admin-card">
          <p className="text-sm font-semibold text-[var(--color-text)]">Weekly featured slots</p>
          <p className="mt-2 text-3xl font-bold text-[var(--color-primary)]">
            {pack.weeklyFeaturedConceptPublicIds.length}
          </p>
          <Text size="sm" c="dimmed" className="mt-2 text-[var(--color-text-secondary)]">
            of 4 required featured concepts
          </Text>
        </Card>
      </Group>

      <Card className="admin-card">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-[var(--color-text)]">Pack status</h3>
          <Badge color={pack.exists ? "teal" : "yellow"} variant="light" radius="xl">
            {pack.exists ? "Configured" : "Not configured"}
          </Badge>
        </div>
        <Text size="sm" c="dimmed" className="mt-3 text-[var(--color-text-secondary)]">
          Editor controls are available on this page and will save directly to the selected month.
        </Text>
      </Card>
    </Stack>
  );
}
