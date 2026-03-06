import type {
  AdminContributor,
  AdminLearner,
  AdminUser,
} from "@/interfaces/interfaces";
import { apiFetch } from "@/lib/api";

function mergeUsers(
  learners: AdminLearner[],
  contributors: AdminContributor[],
): AdminUser[] {
  const contributorMap = new Map(contributors.map((contributor) => [
    contributor.publicId,
    contributor,
  ]));

  return learners.map((learner) => {
    const contributorData = contributorMap.get(learner.publicId);

    if (!contributorData) {
      return {
        publicId: learner.publicId,
        username: learner.username,
        role: "LEARNER" as const,
      };
    }

    const isActiveContributor = contributorData.demotedAt === null;

    return {
      publicId: learner.publicId,
      username: learner.username,
      role: isActiveContributor ? ("CONTRIBUTOR" as const) : ("LEARNER" as const),
      promotedAt: contributorData.promotedAt,
      demotedAt: contributorData.demotedAt,
    };
  });
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const [learners, contributors] = await Promise.all([
    apiFetch<AdminLearner[]>("/admin/learners"),
    apiFetch<AdminContributor[]>("/admin/contributors"),
  ]);

  return mergeUsers(learners, contributors);
}
