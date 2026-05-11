import DataTable from "../../components/DataTable";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import { formatCurrency, formatDate } from "../../utils/formatDate";
import { sampleDonations } from "../../utils/mockData";

export default function MyDonationsPage() {
  const { data: donations, error } = useResource("/donations/my-donations", sampleDonations);

  return (
    <>
      <PageHeader
        eyebrow="Donation History"
        subtitle="View your contribution records to approved fundraising campaigns."
        title="My Donations"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <DataTable
        columns={[
          { key: "fundraiser", label: "Fundraiser", render: (row) => row.fundraiserId?.campaignTitle || "Campaign" },
          { key: "donationAmount", label: "Amount", render: (row) => formatCurrency(row.donationAmount) },
          { key: "paymentMethod", label: "Payment Method" },
          { key: "donationStatus", label: "Status" },
          { key: "createdAt", label: "Date", render: (row) => formatDate(row.createdAt) }
        ]}
        rows={donations}
      />
    </>
  );
}
