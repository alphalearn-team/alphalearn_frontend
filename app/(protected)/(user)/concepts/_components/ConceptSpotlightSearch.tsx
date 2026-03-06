"use client";

import { useRouter } from "next/navigation";
import {
    type SpotlightActionData,
    type SpotlightActionGroupData,
    spotlight,
} from "@mantine/spotlight";
import type { Concept } from "@/interfaces/interfaces";
import ContentSpotlight from "@/components/common/contentSpotlight";

type SpotlightActionItem = SpotlightActionData | SpotlightActionGroupData;

interface ConceptSpotlightSearchProps {
    concepts: Concept[];
}

export default function ConceptSpotlightSearch({ concepts }: ConceptSpotlightSearchProps) {
    const router = useRouter();

    const actions: SpotlightActionData[] = concepts.map((concept) => {
        const finalId = concept.publicId;

        return {
            id: String(finalId),
            label: concept.title,
            description: concept.description,
            onClick: () => {
                spotlight.close();
                router.push(`/concepts/${finalId}`);
            },
            leftSection: (
                <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ color: "var(--color-primary)" }}
                >
                    lightbulb
                </span>
            ),
        };
    });

    const filterActions = (rawQuery: string, rawActions: SpotlightActionItem[]): SpotlightActionItem[] => {
        const trimmedQuery = rawQuery.trim().toLowerCase();
        const flatActions = rawActions.filter(
            (action): action is SpotlightActionData => "id" in action
        );


        if (trimmedQuery.length < 2) {
            return [{ id: "search-hint", label: "Type something to search" }];
        }

        return flatActions.filter((action) => {
            const label = String(action.label || "").toLowerCase();
            const description = String(action.description || "").toLowerCase();
            return label.includes(trimmedQuery) || description.includes(trimmedQuery);
        });
    };

    return (
        <ContentSpotlight
            actions={actions}
            filter={filterActions}
            nothingFound="No concepts found..."
            placeholder="Search concepts..."
        />
    );
}

export { spotlight };
