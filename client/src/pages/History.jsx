import { CalendarDays, MapPin, MessageSquare, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { eventsApi, feedbackApi } from "../api/client.js";
import DataTable from "../components/DataTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import FormField from "../components/ui/FormField.jsx";
import Modal from "../components/ui/Modal.jsx";
import { useToast } from "../components/ui/Toast.jsx";

export default function History() {
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: "", suggestions: "" });
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    try {
      const [historyData, feedbackData] = await Promise.all([eventsApi.getHistory(), feedbackApi.getMy()]);
      setHistory(historyData);
      setFeedback(feedbackData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const feedbackByEvent = useMemo(() => {
    return feedback.reduce((map, item) => {
      map[item.eventId?._id || item.eventId] = item;
      return map;
    }, {});
  }, [feedback]);

  async function submitFeedback(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await feedbackApi.create({
        eventId: selected.eventId?._id || selected.eventId,
        rating: Number(form.rating),
        comment: form.comment,
        suggestions: form.suggestions
      });
      toast.success("Feedback submitted");
      setSelected(null);
      setForm({ rating: 5, comment: "", suggestions: "" });
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    {
      key: "event",
      header: "Event",
      accessor: (row) => row.eventId?.title || "Event",
      render: (row) => (
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className="w-9 h-9 rounded-lg bg-info-50 text-info-600 flex items-center justify-center shrink-0">
            <CalendarDays size={16} />
          </div>
          <div>
            <p className="text-sm font-semibold text-surface-900">{row.eventId?.title || "Event"}</p>
            <p className="text-xs text-surface-500">{row.eventId?.date ? new Date(row.eventId.date).toLocaleDateString() : "Date unavailable"}</p>
          </div>
        </div>
      )
    },
    {
      key: "location",
      header: "Location",
      accessor: (row) => row.eventId?.location || "",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-surface-600">
          <MapPin size={13} className="text-surface-400" />
          {row.eventId?.location || "N/A"}
        </span>
      )
    },
    {
      key: "attendance",
      header: "Attendance",
      accessor: "attendanceStatus",
      render: (row) => <StatusBadge value={row.attendanceStatus} />
    },
    {
      key: "result",
      header: "Event Result",
      accessor: (row) => row.eventId?.status || "",
      render: (row) => <StatusBadge value={row.eventId?.status || "Pending"} />
    },
    {
      key: "rating",
      header: "Rating",
      accessor: (row) => feedbackByEvent[row.eventId?._id || row.eventId]?.rating || "",
      render: (row) => {
        const item = feedbackByEvent[row.eventId?._id || row.eventId];
        return item ? (
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-surface-700">
            <Star size={14} className="fill-accent-400 text-accent-400" />
            {item.rating}/5
          </span>
        ) : <span className="text-xs text-surface-400">Not yet submitted</span>;
      }
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      render: (row) => {
        const eventId = row.eventId?._id || row.eventId;
        const canRate = row.eventId?.status === "Finished" && row.attendanceStatus === "Present" && !feedbackByEvent[eventId];
        return canRate ? (
          <button className="btn-primary btn-xs" onClick={() => setSelected(row)}>
            <MessageSquare size={13} />
            Give Feedback
          </button>
        ) : null;
      }
    }
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1>History</h1>
        <p>Events you joined, attendance status, event result, and feedback history</p>
      </div>

      <DataTable
        data={history}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search event history..."
        emptyTitle="No event history"
        emptyDescription="Joined events will appear here."
        exportFilename="event-history"
      />

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Give Feedback" description={selected?.eventId?.title || "Finished event"}>
        <form onSubmit={submitFeedback} className="space-y-4">
          <FormField label="Rating" required>
            <select className="input" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })}>
              {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating}/5</option>)}
            </select>
          </FormField>
          <FormField label="Comment" required>
            <textarea className="input" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} required />
          </FormField>
          <FormField label="Suggestions">
            <textarea className="input" value={form.suggestions} onChange={(e) => setForm({ ...form, suggestions: e.target.value })} />
          </FormField>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-outline" onClick={() => setSelected(null)}>Cancel</button>
            <button className="btn-primary" disabled={submitting}>{submitting ? "Submitting..." : "Submit Feedback"}</button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
