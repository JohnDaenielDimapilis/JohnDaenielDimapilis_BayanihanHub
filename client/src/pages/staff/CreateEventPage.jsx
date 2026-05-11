import { useState } from "react";

import FormField from "../../components/FormField";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import api from "../../services/api";

export default function CreateEventPage() {
  const [form, setForm] = useState({
    capacity: "",
    description: "",
    eventDate: "",
    eventTitle: "",
    location: ""
  });
  const [message, setMessage] = useState("");
  const [tone, setTone] = useState("success");

  const handleChange = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/events", { ...form, capacity: Number(form.capacity) });
      setTone("success");
      setMessage("Event submitted for admin approval.");
      setForm({ capacity: "", description: "", eventDate: "", eventTitle: "", location: "" });
    } catch (error) {
      setTone("error");
      setMessage(error.response?.data?.message || "Unable to create event.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Event Management"
        subtitle="New events are created as pending records and require Admin approval before becoming public."
        title="Create Event"
      />
      <form className="card grid max-w-3xl gap-5" onSubmit={handleSubmit}>
        <FormField label="Event title" name="eventTitle" onChange={handleChange} required value={form.eventTitle} />
        <FormField label="Description" name="description" onChange={handleChange} required type="textarea" value={form.description} />
        <div className="grid gap-5 md:grid-cols-2">
          <FormField label="Location" name="location" onChange={handleChange} required value={form.location} />
          <FormField label="Event date" name="eventDate" onChange={handleChange} required type="date" value={form.eventDate} />
          <FormField label="Capacity" min="1" name="capacity" onChange={handleChange} required type="number" value={form.capacity} />
        </div>
        {message ? <Notice tone={tone}>{message}</Notice> : null}
        <button className="btn-primary" type="submit">
          Submit Event
        </button>
      </form>
    </>
  );
}
