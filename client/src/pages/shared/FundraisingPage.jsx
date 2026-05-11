import FundraiserCard from "../../components/FundraiserCard";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import { sampleFundraisers } from "../../utils/mockData";

export default function FundraisingPage() {
  const { data: fundraisers, error, isLoading } = useResource(
    "/fundraisers/approved",
    sampleFundraisers.filter((fundraiser) => fundraiser.status === "approved")
  );

  return (
    <>
      <PageHeader
        eyebrow="Approved Campaigns"
        subtitle="Fundraising campaigns become visible to donors only after admin approval."
        title="Fundraising"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      {isLoading ? <p className="font-bold text-slate-500">Loading fundraisers...</p> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {fundraisers.map((fundraiser) => (
          <FundraiserCard fundraiser={fundraiser} key={fundraiser._id} showDonate />
        ))}
      </div>
    </>
  );
}
