import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth/rbac";
import { apiFetch } from "@/lib/api";
import type { ConceptSuggestionDraft } from "@/interfaces/interfaces";
import NotFound from "@/components/notFound";
import ConceptSuggestionDraftForm from "../conceptSuggestionDraftForm";

async function getDraft(publicId: string): Promise<ConceptSuggestionDraft | null> {
  try {
    return await apiFetch<ConceptSuggestionDraft>(`/concept-suggestions/${publicId}`);
  } catch {
    return null;
  }
}

export default async function EditConceptSuggestionDraftPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const role = await getUserRole();

  if (role === "ADMIN") {
    redirect("/admin/concepts");
  }

  const draft = await getDraft(id);

  if (!draft) {
    return <NotFound title="Draft not found" subtitle="We couldn't find that concept suggestion draft." />;
  }

  return <ConceptSuggestionDraftForm initialDraft={draft} />;
}
