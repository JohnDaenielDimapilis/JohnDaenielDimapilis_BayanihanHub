import { MessageSquare, Plus, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import Modal from "../components/ui/Modal.jsx";
import FormField from "../components/ui/FormField.jsx";
import EmptyState from "../components/ui/EmptyState.jsx";
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
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ event: "", rating: 5, comment: "", suggestions: "" });

  async function load() {
    try {
      const eventData = await api("/events");
      setEvents(eventData);
      if (user.role !== "User") setFeedback(await api("/feedback"));
    } catch { toast.error("Failed to load feedback data"); }
    finally { setLoading(false); }
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
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  }

  const avgRating = feedback.length
    ? (feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : "—";

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1>Feedback</h1>
          <p>{user.role === "User" ? "Share your event experience" : "Review community feedback"}</p>
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
              <strong className="text-2xl font-bold text-surface-900">{feedback.length}</strong>
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
                {[5, 4, 3, 2, 1].map((r) => {
                  const count = feedback.filter((f) => f.rating === r).length;
                  const pct = feedback.length ? (count / feedback.length) * 100 : 0;
                  return (
                    <div key={r} className="flex-1 flex flex-col items-center gap-1" title={`${r} stars: ${count}`}>
                      <div className="w-full bg-surface-100 rounded-full h-8 flex items-end overflow-hidden">
                        <div className="w-full bg-accent-400 rounded-full transition-all duration-500" style={{ height: `${Math.max(4, pct)}%` }} />
                      </div>
                      <span className="text-2xs text-surface-500">{r}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : feedback.length === 0 ? (
            <EmptyState title="No feedback yet" description="Feedback will appear here when users submit reviews." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {feedback.map((item) => (
                <article key={item._id} className="card-padded flex flex-col gap-3 hover:shadow-soft transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-bold shrink-0">
                        {(item.user?.name || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-surface-900">{item.user?.name || "Anonymous"}</p>
                        <p className="text-xs text-surface-500">{item.event?.title || "Event"}</p>
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
          description="Your feedback helps us improve future events and programs."
          action={<button className="btn-primary" onClick={() => setModalOpen(true)}><Plus size={16} /> Give Feedback</button>}
        />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Submit Feedback" description="Share your experience about an event.">
        <form onSubmit={create} className="space-y-5">
          <FormField label="Event" required>
            <select className="input" value={form.event} onChange={(e) => setForm({ ...form, event: e.target.value })} required>
              <option value="">Select an event</option>
              {events.filter((e) => e.status === "approved").map((e) => <option key={e._id} value={e._id}>{e.title}</option>)}
            </select>
          </FormField>
          <FormField label="Rating">
            <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} />
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
