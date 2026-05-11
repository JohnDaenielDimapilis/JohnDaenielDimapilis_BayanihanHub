import { CalendarDays, MapPin, Users } from "lucide-react";

import { formatDate } from "../utils/formatDate";
import StatusBadge from "./StatusBadge";

export default function EventCard({ event, onJoin, showJoin = false }) {
  return (
    <article className="card flex h-full flex-col">
      <div className="mb-5 flex items-start justify-between gap-4">
        <h3 className="font-display text-xl font-extrabold text-bayani-ink">{event.eventTitle}</h3>
        <StatusBadge status={event.status} />
      </div>
      <p className="flex-1 text-sm leading-6 text-slate-600">{event.description}</p>
      <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-600">
        <span className="flex items-center gap-2">
          <CalendarDays size={17} className="text-bayani-blue" />
          {formatDate(event.eventDate)}
        </span>
        <span className="flex items-center gap-2">
          <MapPin size={17} className="text-bayani-green" />
          {event.location}
        </span>
        <span className="flex items-center gap-2">
          <Users size={17} className="text-bayani-warm" />
          {event.participants?.length || 0} / {event.capacity} participants
        </span>
      </div>
      {showJoin ? (
        <button className="btn-primary mt-6 w-full" onClick={() => onJoin?.(event)}>
          Join Event
        </button>
      ) : null}
    </article>
  );
}
