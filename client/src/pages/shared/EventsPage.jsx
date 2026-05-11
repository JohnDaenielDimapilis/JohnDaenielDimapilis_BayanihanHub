import PageHeader from "../../components/PageHeader";
import EventCard from "../../components/EventCard";
import Notice from "../../components/Notice";
import { useResource } from "../../hooks/useResource";
import { sampleEvents } from "../../utils/mockData";

export default function EventsPage() {
  const { data: events, error, isLoading } = useResource("/events/approved", sampleEvents.filter((event) => event.status === "approved"));

  return (
    <>
      <PageHeader
        eyebrow="Approved Events"
        subtitle="Only admin-approved foundation events are public to participants."
        title="Events"
      />
      {error ? <div className="mb-5"><Notice tone="warning">{error}</Notice></div> : null}
      {isLoading ? <p className="font-bold text-slate-500">Loading events...</p> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => (
          <EventCard event={event} key={event._id} />
        ))}
      </div>
    </>
  );
}
