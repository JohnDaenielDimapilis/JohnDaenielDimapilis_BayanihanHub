import { useState } from "react";

import FormField from "../../components/FormField";
import FundraiserCard from "../../components/FundraiserCard";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import api from "../../services/api";
import { sampleFundraisers } from "../../utils/mockData";

export default function DonatePage() {
  const { data: fundraisers, error } = useResource(
    "/fundraisers/approved",
    sampleFundraisers.filter((fundraiser) => fundraiser.status === "approved")
  );
  const [form, setForm] = useState({ donationAmount: "", fundraiserId: "", paymentMethod: "gcash" });
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("success");

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/donations", { ...form, donationAmount: Number(form.donationAmount) });
      setTone("success");
      setMessage("Donation recorded successfully.");
      setForm({ donationAmount: "", fundraiserId: "", paymentMethod: "gcash" });
    } catch (requestError) {
      setTone("error");
      setMessage(requestError.response?.data?.message || "Unable to record donation.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Donations"
        subtitle="This prototype records donations for approved campaigns. Payment gateway integration can be added later."
        title="Donate"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form className="card grid gap-5" onSubmit={handleSubmit}>
          <FormField
            label="Fundraiser"
            name="fundraiserId"
            onChange={handleChange}
            options={[
              { label: "Select fundraiser", value: "" },
              ...fundraisers.map((fundraiser) => ({ label: fundraiser.campaignTitle, value: fundraiser._id }))
            ]}
            required
            type="select"
            value={form.fundraiserId}
          />
          <FormField label="Donation amount" min="1" name="donationAmount" onChange={handleChange} required type="number" value={form.donationAmount} />
          <FormField
            label="Payment method"
            name="paymentMethod"
            onChange={handleChange}
            options={[
              { label: "GCash", value: "gcash" },
              { label: "Maya", value: "maya" },
              { label: "Bank Transfer", value: "bank_transfer" },
              { label: "Cash", value: "cash" },
              { label: "Card", value: "card" },
              { label: "Other", value: "other" }
            ]}
            type="select"
            value={form.paymentMethod}
          />
          {message ? <Notice tone={tone}>{message}</Notice> : null}
          <button className="btn-primary" type="submit">
            Record Donation
          </button>
        </form>
        <div className="grid gap-5 md:grid-cols-2">
          {fundraisers.map((fundraiser) => (
            <FundraiserCard fundraiser={fundraiser} key={fundraiser._id} />
          ))}
        </div>
      </div>
    </>
  );
}
