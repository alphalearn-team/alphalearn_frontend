import AdminPageHeader from "@/app/(protected)/(admin)/admin/_components/PageHeader";
import ImposterMonthlyPackScaffold from "./_components/ImposterMonthlyPackScaffold";
import {
  fetchImposterMonthlyPackPageData,
  resolveYearMonthFromQuery,
} from "./imposterMonthlyPackData";

interface ImposterMonthlyPackPageProps {
  searchParams?: Promise<{
    month?: string;
  }>;
}

export default async function ImposterMonthlyPackPage({
  searchParams,
}: ImposterMonthlyPackPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedMonth = resolveYearMonthFromQuery(resolvedSearchParams?.month);
  const { concepts, pack } = await fetchImposterMonthlyPackPageData(selectedMonth);

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-8 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <AdminPageHeader
          title="Imposter Monthly Pack"
          description="Configure a 20-concept monthly pack and choose 4 weekly featured concept slots."
          icon="filter_alt"
        />

        <ImposterMonthlyPackScaffold
          key={selectedMonth + "-" + pack.yearMonth + "-" + String(pack.exists)}
          selectedMonth={selectedMonth}
          concepts={concepts}
          pack={pack}
        />
      </div>
    </div>
  );
}
