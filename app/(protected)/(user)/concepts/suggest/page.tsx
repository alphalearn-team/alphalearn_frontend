import { redirect } from "next/navigation";
import { getUserRole } from "@/lib/auth/rbac";
import ConceptSuggestionDraftForm from "./conceptSuggestionDraftForm";

export default async function SuggestConceptPage() {
  const role = await getUserRole();

  if (role === "ADMIN") {
    redirect("/admin/concepts");
  }

  return <ConceptSuggestionDraftForm />;
}
