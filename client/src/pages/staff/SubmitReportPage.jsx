import { useState } from "react";

import FormField from "../../components/FormField";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import api from "../../services/api";

export default function SubmitReportPage() {
  const [form, setForm] = useState({
    recommendations: "",
    reportTitle: "",
    reportType: "custom",
    summary: ""
  });
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("success");

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/reports", form);
      setTone("success");
      setMessage("Report submitted and logged successfully.");
      setForm({ recommendations: "", reportTitle: "", reportType: "custom", summary: "" });
    } catch (error) {
      setTone("error");
      setMessage(error.response?.data?.message || "Unable to submit report.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Staff Reports"
        subtitle="Staff reports are stored in the report collection and logged for traceability."
        title="Submit Report"
      />
      <form className="card grid max-w-3xl gap-5" onSubmit={handleSubmit}>
        <FormField label="Report title" name="reportTitle" onChange={handleChange} required value={form.reportTitle} />
        <FormField
          label="Report type"
          name="reportType"
          onChange={handleChange}
          options={[
            { label: "Custom", value: "custom" },
            { label: "Events", value: "events" },
            { label: "Fundraising", value: "fundraising" },
            { label: "Participation", value: "participation" }
          ]}
          type="select"
          value={form.reportType}
        />
        <FormField label="Summary" name="summary" onChange={handleChange} required type="textarea" value={form.summary} />
        <FormField label="Recommendations" name="recommendations" onChange={handleChange} type="textarea" value={form.recommendations} />
        {message ? <Notice tone={tone}>{message}</Notice> : null}
        <button className="btn-primary" type="submit">
          Submit Report
        </button>
      </form>
    </>
  );
}
