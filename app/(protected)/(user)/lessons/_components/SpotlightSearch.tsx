"use client";

import { useRouter } from "next/navigation";
import {
    type SpotlightActionData,
    type SpotlightActionGroupData,
    spotlight,
} from "@mantine/spotlight";
import type { LessonSummary } from "@/interfaces/interfaces";
import ContentSpotlight from "@/components/common/contentSpotlight";

type SpotlightActionItem = SpotlightActionData | SpotlightActionGroupData;

interface SpotlightSearchProps {
    lessons: LessonSummary[];
}

export default function SpotlightSearch({ lessons }: SpotlightSearchProps) {
    const router = useRouter();

    const actions: SpotlightActionData[] = lessons.map((lesson) => {
        const id = lesson.lessonPublicId;
        const contributor = lesson.author?.username || "Anonymous";

        return {
            id,
            label: lesson.title,
            description: `By ${String(contributor).split("-")[0]}`,
            onClick: () => {
                spotlight.close();
                router.push(`/lessons/${id}`);
            },
            leftSection: (
                <span
                    className="material-symbols-outlined text-[22px]"
                    style={{ color: "var(--color-primary)" }}
                >
                    auto_stories
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
            return [{ id: "search-hint", label: "Search For Something" }];
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
            nothingFound="No lessons found..."
            placeholder="Search lessons..."
        />
    );
}

export { spotlight };
