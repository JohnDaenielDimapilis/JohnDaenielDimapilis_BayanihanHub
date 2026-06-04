import { Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { api, participantsApi } from "../api/client.js";
import EmptyState from "../components/ui/EmptyState.jsx";
import FormField from "../components/ui/FormField.jsx";
import Modal from "../components/ui/Modal.jsx";
import { SkeletonCard } from "../components/ui/Skeleton.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`p-0.5 transition-transform ${!readonly ? "hover:scale-110 cursor-pointer" : "cursor-default"}`}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => !readonly && onChange?.(star)}
          aria-label={`${star} stars`}
        >
          <Star
            size={readonly ? 14 : 20}
            className={`transition-colors ${(hover || value) >= star ? "fill-accent-400 text-accent-400" : "text-surface-300"}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function Feedback() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ event: "", rating: 5, comment: "", suggestions: "" });
  const [filters, setFilters] = useState({ event: "all", creator: "", rating: "all", period: "all" });

  async function load() {
    try {
      const eventData = await api("/events");
      setEvents(eventData);
      if (user.role === "User") setRegistrations(await participantsApi.getMy());
      if (user.role !== "User") setFeedback(await api("/feedback"));
    } catch {
      toast.error("Failed to load feedback data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api("/feedback", {
        method: "POST",
        body: JSON.stringify({
          eventId: form.event,
          rating: Number(form.rating),
          comment: form.comment,
          suggestions: form.suggestions,
        }),
      });
      toast.success("Feedback submitted successfully!");
      setForm({ event: "", rating: 5, comment: "", suggestions: "" });
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const filteredFeedback = feedback.filter((item) => {
    if (filters.event !== "all" && (item.eventId?._id || item.eventId) !== filters.event) return false;
    if (filters.creator && !String(item.eventId?.createdBy?.name || "").toLowerCase().includes(filters.creator.toLowerCase())) return false;
    if (filters.rating !== "all" && Number(item.rating) !== Number(filters.rating)) return false;
    if (filters.period !== "all") {
      const created = new Date(item.createdAt);
      const now = new Date();
      if (filters.period === "day" && created.toDateString() !== now.toDateString()) return false;
      if (filters.period === "month" && (created.getFullYear() !== now.getFullYear() || created.getMonth() !== now.getMonth())) return false;
      if (filters.period === "year" && created.getFullYear() !== now.getFullYear()) return false;
    }
    return true;
  });

  const avgRating = filteredFeedback.length
    ? (filteredFeedback.reduce((sum, item) => sum + Number(item.rating || 0), 0) / filteredFeedback.length).toFixed(1)
    : "-";

  const allEventsForFilter = feedback
    .map((item) => item.eventId)
    .filter(Boolean)
    .filter((event, index, list) => list.findIndex((item) => item._id === event._id) === index);

  const attendedEventIds = new Set(
    registrations
      .filter((item) => item.attendanceStatus === "Present")
      .map((item) => item.eventId?._id || item.eventId)
  );
  const feedbackEvents = events.filter((event) => event.status === "Finished" && attendedEventIds.has(event._id));

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1>Feedback Analytics</h1>
          <p>{user.role === "User" ? "Share your event experience from History" : "Review community feedback with event, creator, rating, and date filters"}</p>
        </div>
        {user.role === "User" && (
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Give Feedback
          </button>
        )}
      </div>

      {user.role !== "User" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="stat-card-component">
              <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Total Feedback</span>
              <strong className="text-2xl font-bold text-surface-900">{filteredFeedback.length}</strong>
            </div>
            <div className="stat-card-component">
              <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Average Rating</span>
              <div className="flex items-center gap-2">
                <strong className="text-2xl font-bold text-surface-900">{avgRating}</strong>
                <Star size={18} className="fill-accent-400 text-accent-400" />
              </div>
            </div>
            <div className="stat-card-component">
              <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Rating Distribution</span>
              <div className="flex gap-1 mt-1">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = filteredFeedback.filter((item) => item.rating === rating).length;
                  const pct = filteredFeedback.length ? (count / filteredFeedback.length) * 100 : 0;
                  return (
                    <div key={rating} className="flex-1 flex flex-col items-center gap-1" title={`${rating} stars: ${count}`}>
                      <div className="w-full bg-surface-100 rounded-full h-8 flex items-end overflow-hidden">
                        <div className="w-full bg-accent-400 rounded-full transition-all duration-500" style={{ height: `${Math.max(4, pct)}%` }} />
                      </div>
                      <span className="text-2xs text-surface-500">{rating}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card-padded grid grid-cols-1 sm:grid-cols-4 gap-3">
            <FormField label="Event">
              <select className="input h-10" value={filters.event} onChange={(e) => setFilters({ ...filters, event: e.target.value })}>
                <option value="all">All events</option>
                {allEventsForFilter.map((event) => <option key={event._id} value={event._id}>{event.title}</option>)}
              </select>
            </FormField>
            <FormField label="Creator">
              <input className="input h-10" placeholder="Creator name" value={filters.creator} onChange={(e) => setFilters({ ...filters, creator: e.target.value })} />
            </FormField>
            <FormField label="Rating">
              <select className="input h-10" value={filters.rating} onChange={(e) => setFilters({ ...filters, rating: e.target.value })}>
                <option value="all">All ratings</option>
                {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
              </select>
            </FormField>
            <FormField label="Date">
              <select className="input h-10" value={filters.period} onChange={(e) => setFilters({ ...filters, period: e.target.value })}>
                <option value="all">All time</option>
                <option value="day">Today</option>
                <option value="month">This month</option>
                <option value="year">This year</option>
              </select>
            </FormField>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filteredFeedback.length === 0 ? (
            <EmptyState title="No feedback yet" description="Feedback will appear here when users submit reviews." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFeedback.map((item) => (
                <article key={item._id} className="card-padded flex flex-col gap-3 hover:shadow-soft transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {(item.userId?.name || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{item.userId?.name || "Anonymous"}</p>
                        <p className="text-xs text-surface-500">{item.eventId?.title || "Event"} - {item.eventId?.createdBy?.name || "Creator"}</p>
                      </div>
                    </div>
                    <StarRating value={item.rating} readonly />
                  </div>
                  {item.comment && <p className="text-sm text-surface-600 leading-relaxed">{item.comment}</p>}
                  {item.suggestions && (
                    <div className="bg-surface-50 rounded-lg p-3 border border-surface-100">
                      <p className="text-2xs font-semibold text-surface-500 uppercase mb-1">Suggestion</p>
                      <p className="text-sm text-surface-600">{item.suggestions}</p>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {user.role === "User" && !loading && (
        <EmptyState
          icon="empty"
          title="Share your experience"
          description="Your feedback is now connected to your History page after a finished event with present attendance."
          action={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> Give Feedback</button>}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Submit Feedback" description="Share your experience about an event.">
        <form onSubmit={create} className="space-y-5">
          <FormField label="Event" required>
            <select className="input" value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} required>
              <option value="">Select an event</option>
              {feedbackEvents.map((event) => <option key={event._id} value={event._id}>{event.title}</option>)}
            </select>
            {feedbackEvents.length === 0 && (
              <p className="form-hint">Finished events appear here after your attendance is marked present.</p>
            )}
          </FormField>
          <FormField label="Rating">
            <StarRating value={form.rating} onChange={(rating) => setForm({ ...form, rating })} />
          </FormField>
          <FormField label="Comment" required>
            <textarea className="input" placeholder="How was your experience?" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} required />
          </FormField>
          <FormField label="Suggestions">
            <textarea className="input" placeholder="Any suggestions for improvement?" value={form.suggestions} onChange={(e) => setForm({ ...form, suggestions: e.target.value })} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
