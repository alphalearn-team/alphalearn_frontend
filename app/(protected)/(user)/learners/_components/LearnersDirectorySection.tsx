import { Alert, Text } from "@mantine/core";
import { apiFetch } from "@/lib/api/api";
import type { PublicLearner } from "@/interfaces/interfaces";
import { createClient } from "@/lib/supabase/server";
import LearnersGrid from "./LearnersGrid";

function normalizeValue(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null;
}

export default async function LearnersDirectorySection() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const learners = await apiFetch<PublicLearner[]>("/learners").catch(() => null);

  if (!learners) {
    return (
      <Alert color="red" radius="lg" variant="light" title="Learner directory unavailable">
        <Text size="sm">
          We couldn&apos;t load the learner directory right now. Please try again later.
        </Text>
      </Alert>
    );
  }

  const { data: currentLearner } = user?.id
    ? await supabase
        .from("learners")
        .select("public_id, username")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null };

  const currentLearnerPublicId = normalizeValue(currentLearner?.public_id);
  const currentUserId = normalizeValue(user?.id);
  const currentUsernameCandidates = new Set(
    [
      currentLearner?.username,
      typeof user?.user_metadata?.username === "string" ? user.user_metadata.username : null,
      typeof user?.user_metadata?.user_name === "string" ? user.user_metadata.user_name : null,
      typeof user?.user_metadata?.preferred_username === "string"
        ? user.user_metadata.preferred_username
        : null,
      typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : null,
      typeof user?.user_metadata?.full_name === "string" ? user.user_metadata.full_name : null,
      user?.email?.split("@")[0] ?? null,
    ]
      .map(normalizeValue)
      .filter((value): value is string => value !== null),
  );

  const visibleLearners = learners.filter((learner) => {
    const learnerPublicId = normalizeValue(learner.publicId);
    const learnerUsername = normalizeValue(learner.username);

    if (currentLearnerPublicId && learnerPublicId === currentLearnerPublicId) {
      return false;
    }

    if (currentUserId && learnerPublicId === currentUserId) {
      return false;
    }

    if (learnerUsername && currentUsernameCandidates.has(learnerUsername)) {
      return false;
    }

    return true;
  });

  return (
    <LearnersGrid
      learners={visibleLearners}
      currentLearnerPublicId={currentLearnerPublicId}
    />
  );
}
