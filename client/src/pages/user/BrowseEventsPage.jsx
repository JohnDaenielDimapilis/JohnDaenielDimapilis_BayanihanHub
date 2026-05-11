import api from "../../services/api";
import EventCard from "../../components/EventCard";
import Notice from "../../components/Notice";
import PageHeader from "../../components/PageHeader";
import { useResource } from "../../hooks/useResource";
import { sampleEvents } from "../../utils/mockData";
import { useState } from "react";

export default function BrowseEventsPage() {
  const { data: events, error } = useResource("/events/approved", sampleEvents.filter((event) => event.status === "approved"));
  const [message, setMessage] = useState("");

  const joinEvent = async (event) => {
    try {
      await api.post(`/events/${event._id}/join`);
      setMessage(`You joined ${event.eventTitle}.`);
    } catch (requestError) {
      setMessage(requestError.response?.data?.message || "Unable to join event.");
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Events"
        subtitle="Browse admin-approved opportunities and register as a participant."
        title="Browse Events"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      {message ? <div className="mb-5"><Notice>{message}</Notice></div> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard event={event} key={event._id} onJoin={joinEvent} showJoin />
        ))}
      </div>
    </>
  );
}
