import type { Concept } from "@/interfaces/interfaces";
import { Text } from "@mantine/core";
import { formatDateTime } from "@/lib/formatDate";

export default function ConceptDetailCard({ concept }: { concept: Concept }) {
  return (
    <div
      className="rounded-xl border border-[var(--color-border)] overflow-hidden"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="p-6 flex flex-col gap-5">
        <div>
          <Text fw={600} mb={6}>
            Description
          </Text>
          <Text style={{ whiteSpace: "pre-wrap" }}>
            {concept.description || "No description available."}
          </Text>
        </div>

        <div>
          <Text fw={600} mb={6}>
            Created
          </Text>
          <Text c="dimmed">
            {concept.createdAt ? formatDateTime(concept.createdAt) : "Unknown"}
          </Text>
        </div>
      </div>
    </div>
  );
}
