import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import { formatCurrency, formatDate } from "../../utils/formatDate";
import { sampleFundraisers } from "../../utils/mockData";

export default function ManageFundraisersPage() {
  const { data: fundraisers, error } = useResource("/fundraisers", sampleFundraisers);

  return (
    <>
      <PageHeader
        eyebrow="Fundraising Operations"
        subtitle="Track campaign progress and approval status."
        title="Manage Fundraisers"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <DataTable
        columns={[
          { key: "campaignTitle", label: "Campaign" },
          { key: "currentAmount", label: "Raised", render: (row) => formatCurrency(row.currentAmount) },
          { key: "targetAmount", label: "Target", render: (row) => formatCurrency(row.targetAmount) },
          { key: "endDate", label: "End Date", render: (row) => formatDate(row.endDate) },
          { key: "status", label: "Status" }
        ]}
        rows={fundraisers}
      />
    </>
  );
}
