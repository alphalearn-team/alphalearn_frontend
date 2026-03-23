"use client";

import { Card, Container, Stack, Text, Title } from "@mantine/core";
import type { OfflineInitializedMatch } from "../_lib/gameSetup";
import SharedCanvas from "./SharedCanvas";

const sectionCardClassName =
  "border border-[var(--color-border)] bg-[linear-gradient(160deg,rgba(255,255,255,0.04),rgba(14,14,14,0.96))]";

interface VotePhasePlaceholderScreenProps {
  match: OfflineInitializedMatch;
}

export default function VotePhasePlaceholderScreen({
  match,
}: VotePhasePlaceholderScreenProps) {
  return (
    <Container size="lg" className="py-6 lg:py-8">
      <Card radius="32px" padding="xl" className={sectionCardClassName}>
        <Stack gap="lg">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Discussion complete
            </p>
            <Title order={1} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
              Discussion has ended
            </Title>
            <Text size="sm" className="mt-3 max-w-2xl leading-relaxed text-[var(--color-text-secondary)]">
              Time is up. The completed drawing remains visible here while the voting phase is
              prepared in the next story.
            </Text>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white">
            <SharedCanvas strokes={match.strokes} readOnly className="block w-full" />
          </div>
        </Stack>
      </Card>
    </Container>
  );
}
