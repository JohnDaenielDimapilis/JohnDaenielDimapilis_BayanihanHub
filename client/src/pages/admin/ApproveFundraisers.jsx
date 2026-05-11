import api from "../../services/api";
import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import { formatCurrency, formatDate } from "../../utils/formatDate";
import { sampleFundraisers } from "../../utils/mockData";

export default function ApproveFundraisers() {
  const { data: fundraisers, error, setData } = useResource("/fundraisers", sampleFundraisers);

  const updateStatus = async (fundraiser, action) => {
    const { data } = await api.patch(`/fundraisers/${fundraiser._id}/${action}`);
    setData((currentFundraisers) =>
      currentFundraisers.map((currentFundraiser) => (currentFundraiser._id === fundraiser._id ? data : currentFundraiser))
    );
  };

  return (
    <>
      <PageHeader
        eyebrow="Approval Workflow"
        subtitle="Fundraisers stay private until Admin approval makes them available for donations."
        title="Approve Fundraisers"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <DataTable
        columns={[
          { key: "campaignTitle", label: "Campaign" },
          { key: "targetAmount", label: "Target", render: (row) => formatCurrency(row.targetAmount) },
          { key: "endDate", label: "End Date", render: (row) => formatDate(row.endDate) },
          { key: "status", label: "Status" },
          {
            key: "actions",
            label: "Actions",
            render: (row) => (
              <div className="flex gap-2">
                <button className="btn-secondary px-3 py-2" onClick={() => updateStatus(row, "approve")} type="button">
                  Approve
                </button>
                <button className="btn-secondary px-3 py-2" onClick={() => updateStatus(row, "reject")} type="button">
                  Reject
                </button>
              </div>
            )
          }
        ]}
        rows={fundraisers}
      />
    </>
  );
}
