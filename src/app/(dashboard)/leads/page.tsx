import { getLeadsAction } from "@/actions/leads.actions";
import { LeadsClientPage } from "@/components/leads/LeadsClientPage";

export const metadata = {
  title: "Leads & Pipeline — Prime OS",
  description: "High-velocity client acquisition pipeline and prospect management",
};

export default async function LeadsPage() {
  const result = await getLeadsAction({ page: 1, pageSize: 25 });
  const data = result.data || {
    leads: [],
    totalCount: 0,
    page: 1,
    pageSize: 25,
    totalPages: 1,
    statusCounts: {},
    cities: [],
  };

  return (
    <LeadsClientPage
      initialLeads={data.leads}
      initialTotalCount={data.totalCount}
      initialPage={data.page}
      initialPageSize={data.pageSize}
      initialTotalPages={data.totalPages}
      initialCities={data.cities}
    />
  );
}
