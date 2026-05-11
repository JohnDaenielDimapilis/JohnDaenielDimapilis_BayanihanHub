import { useState } from "react";

import FormField from "../../components/FormField";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import api from "../../services/api";

export default function CreateFundraiserPage() {
  const [form, setForm] = useState({
    campaignTitle: "",
    description: "",
    endDate: "",
    startDate: "",
    targetAmount: ""
  });
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("success");

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/fundraisers", { ...form, targetAmount: Number(form.targetAmount) });
      setTone("success");
      setMessage("Fundraiser submitted for admin approval.");
      setForm({ campaignTitle: "", description: "", endDate: "", startDate: "", targetAmount: "" });
    } catch (error) {
      setTone("error");
      setMessage(error.response?.data?.message || "Unable to create fundraiser.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Fundraising"
        subtitle="New campaigns are pending until an Admin approves or rejects them."
        title="Create Fundraiser"
      />
      <form className="card grid max-w-3xl gap-5" onSubmit={handleSubmit}>
        <FormField label="Campaign title" name="campaignTitle" onChange={handleChange} required value={form.campaignTitle} />
        <FormField label="Description" name="description" onChange={handleChange} required type="textarea" value={form.description} />
        <div className="grid gap-5 md:grid-cols-3">
          <FormField label="Target amount" min="1" name="targetAmount" onChange={handleChange} required type="number" value={form.targetAmount} />
          <FormField label="Start date" name="startDate" onChange={handleChange} required type="date" value={form.startDate} />
          <FormField label="End date" name="endDate" onChange={handleChange} required type="date" value={form.endDate} />
        </div>
        {message ? <Notice tone={tone}>{message}</Notice> : null}
        <button className="btn-primary" type="submit">
          Submit Fundraiser
        </button>
      </form>
    </>
  );
}
