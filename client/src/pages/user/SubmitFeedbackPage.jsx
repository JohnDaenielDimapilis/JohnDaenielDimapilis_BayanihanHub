import { useState } from "react";

import FormField from "../../components/FormField";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import api from "../../services/api";
import { sampleEvents } from "../../utils/mockData";

export default function SubmitFeedbackPage() {
  const { data: events } = useResource("/events/approved", sampleEvents.filter((event) => event.status === "approved"));
  const [form, setForm] = useState({ comment: "", eventId: "", rating: "5" });
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("success");

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/feedback", { ...form, rating: Number(form.rating) });
      setTone("success");
      setMessage("Feedback submitted successfully.");
      setForm({ comment: "", eventId: "", rating: "5" });
    } catch (requestError) {
      setTone("error");
      setMessage(requestError.response?.data?.message || "Unable to submit feedback.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Feedback"
        subtitle="Rate completed foundation activities and help improve future events."
        title="Submit Feedback"
      />
      <form className="card grid max-w-3xl gap-5" onSubmit={handleSubmit}>
        <FormField
          label="Event"
          name="eventId"
          onChange={handleChange}
          options={[
            { label: "Select event", value: "" },
            ...events.map((event) => ({ label: event.eventTitle, value: event._id }))
          ]}
          required
          type="select"
          value={form.eventId}
        />
        <FormField
          label="Rating"
          name="rating"
          onChange={handleChange}
          options={[1, 2, 3, 4, 5].map((rating) => ({ label: `${rating}`, value: `${rating}` }))}
          type="select"
          value={form.rating}
        />
        <FormField label="Comment" name="comment" onChange={handleChange} required type="textarea" value={form.comment} />
        {message ? <Notice tone={tone}>{message}</Notice> : null}
        <button className="btn-primary" type="submit">
          Submit Feedback
        </button>
      </form>
    </>
  );
}
