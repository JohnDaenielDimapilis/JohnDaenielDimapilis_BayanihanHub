import { CalendarDays, LogIn, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { eventsApi } from "../api/client.js";
import StatusBadge from "../components/StatusBadge.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
import { SkeletonCard } from "../components/ui/Skeleton.jsx";

export default function PublicEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    eventsApi.getPublic()
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-surface-50">
      <header className="bg-navy-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between gap-4">
          <Link to="/public-events" className="flex items-center gap-3 no-underline text-white">
            <div className="w-10 h-10 rounded-lg bg-accent-400 flex items-center justify-center text-navy-900 font-black text-sm">
              BH
            </div>
            <div>
              <p className="text-base font-bold leading-tight">BayanihanHub</p>
              <p className="text-xs text-surface-400">Community events</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-outline border-white/20 text-white hover:bg-white/10">
              <LogIn size={16} />
              Sign in
            </Link>
            <Link to="/register" className="btn-primary">
              Create account
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="page-header">
          <h1>Available Community Events</h1>
          <p>View upcoming foundation events. Sign in when you are ready to join or waitlist.</p>
        </div>

        {error && (
          <div className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }, (_, index) => <SkeletonCard key={index} />)}
          </div>
        ) : events.length === 0 ? (
          <EmptyState
            title="No public events yet"
            description="Events will appear here once registration opens."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {events.map((event) => (
              <article key={event._id} className="card-padded flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-surface-900 truncate">{event.title || "Untitled event"}</h2>
                    <p className="text-xs text-surface-500 mt-1">{event.eventType || "Community event"}</p>
                  </div>
                  <StatusBadge value={event.status} />
                </div>

                <p className="text-sm text-surface-600 line-clamp-3">{event.description || "Details will be posted soon."}</p>

                <div className="space-y-2 text-sm text-surface-600">
                  <p className="inline-flex items-center gap-2">
                    <CalendarDays size={14} className="text-surface-400" />
                    {event.date ? new Date(event.date).toLocaleDateString() : "Date to be announced"}
                    {event.time ? `, ${event.time}` : ""}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <MapPin size={14} className="text-surface-400" />
                    {event.location || "Location to be announced"}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Users size={14} className="text-surface-400" />
                    {event.participantLimit || 0} slots
                  </p>
                </div>

                <div className="pt-2 mt-auto">
                  <Link to="/login" className="btn-primary w-full justify-center no-underline">
                    Sign in to participate
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
