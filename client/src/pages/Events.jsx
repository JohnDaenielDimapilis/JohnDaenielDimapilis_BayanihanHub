import { CalendarDays, MapPin, Plus, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import DataTable from "../components/DataTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/ui/Modal.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import FormField from "../components/ui/FormField.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const blank = { title: "", type: "", description: "", date: "", time: "", location: "", participantLimit: 50 };

export default function Events() {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [joinedEvent, setJoinedEvent] = useState(null);

  async function load() {
    try {
      setEvents(await api("/events"));
    } catch (err) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function create(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api("/events", { method: "POST", body: JSON.stringify(form) });
      toast.success("Event submitted for approval");
      setForm(blank);
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function doApproval(id, status) {
    try {
      const endpoint = status === "Approved" ? `/events/${id}/approve` : `/events/${id}/reject`;
      const body = status === "Rejected"
        ? { rejectionReason: window.prompt("Reason for rejecting this event:") }
        : {};
      if (status === "Rejected" && !body.rejectionReason) return;
      await api(endpoint, { method: "PATCH", body: JSON.stringify(body) });
      toast.success(`Event ${status}`);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function join(id) {
    try {
      await api(`/participants/events/${id}/join`, { method: "POST" });
      const event = events.find(e => e._id === id);
      setJoinedEvent(event);
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const columns = [
    {
      key: "title",
      header: "Event",
      accessor: "title",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-info-50 text-info-600 flex items-center justify-center shrink-0">
            <CalendarDays size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 truncate">{row.title}</p>
            <p className="text-xs text-surface-500">{row.eventType || row.type}</p>
          </div>
        </div>
      ),
    },
    {
      key: "date",
      header: "Date",
      accessor: (row) => row.date,
      render: (row) => (
        <div>
          <p className="text-sm text-surface-700">{new Date(row.date).toLocaleDateString()}</p>
          {row.time && <p className="text-xs text-surface-400">{row.time}</p>}
        </div>
      ),
    },
    {
      key: "location",
      header: "Location",
      accessor: "location",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-surface-600">
          <MapPin size={13} className="text-surface-400" />
          {row.location}
        </span>
      ),
    },
    {
      key: "limit",
      header: "Capacity",
      accessor: "participantLimit",
      render: (row) => (
        <span className="inline-flex items-center gap-1.5 text-sm text-surface-600">
          <Users size={13} className="text-surface-400" />
          {row.participantLimit || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge value={row.status} />,
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          {user.role === "Admin" && row.status === "Pending" && (
            <>
              <button className="btn-primary btn-xs" onClick={() => setConfirm({ id: row._id, action: "Approved", title: row.title })}>
                Approve
              </button>
              <button className="btn-danger btn-xs" onClick={() => setConfirm({ id: row._id, action: "Rejected", title: row.title })}>
                Reject
              </button>
            </>
          )}
          {user.role === "User" && ["Approved", "Published", "Open", "Full"].includes(row.status) && (
            <button className="btn-primary btn-xs" onClick={() => join(row._id)}>
              {row.status === "Full" ? "Waitlist" : "Join"}
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1>Events</h1>
          <p>Manage and track all foundation events</p>
        </div>
        {user.role !== "User" && (
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            New Event
          </button>
        )}
      </div>

      <DataTable
        data={events}
        columns={columns}
        loading={loading}
        searchPlaceholder="Search events..."
        emptyTitle="No events yet"
        emptyDescription="Get started by creating your first event."
        exportFilename="events"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create New Event" description="Submit an event for admin approval.">
        <form onSubmit={create} className="space-y-4">
          <div className="form-grid">
            <FormField label="Title" required>
              <input className="input" placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </FormField>
            <FormField label="Type" required>
              <input className="input" placeholder="e.g. Workshop, Seminar" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} required />
            </FormField>
            <FormField label="Date" required>
              <input type="date" className="input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </FormField>
            <FormField label="Time">
              <input className="input" placeholder="e.g. 2:00 PM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
            </FormField>
            <FormField label="Location" required>
              <input className="input" placeholder="Venue or address" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </FormField>
            <FormField label="Participant Limit" required>
              <input type="number" min="1" className="input" value={form.participantLimit} onChange={(e) => setForm({ ...form, participantLimit: e.target.value })} required />
            </FormField>
          </div>
          <FormField label="Description" required>
            <textarea className="input" placeholder="Describe the event..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Event"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title={`${confirm?.action === "Approved" ? "Approve" : "Reject"} Event?`}
        message={`Are you sure you want to ${confirm?.action === "Approved" ? "approve" : "reject"} "${confirm?.title}"?`}
        confirmLabel={confirm?.action === "Approved" ? "Approve" : "Reject"}
        variant={confirm?.action === "Approved" ? "primary" : "danger"}
        onConfirm={() => { doApproval(confirm.id, confirm.action); setConfirm(null); }}
        onCancel={() => setConfirm(null)}
      />

      {joinedEvent && (
        <Modal 
          open={!!joinedEvent} 
          onClose={() => setJoinedEvent(null)} 
          title="✓ Successfully Joined Event" 
          description="You are now registered for this event"
        >
          <div className="space-y-6">
            <div className="bg-success-50 border border-success-200 rounded-lg p-4">
              <p className="text-sm text-success-700 font-medium">You have successfully joined this event and will receive updates about it.</p>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase">Event Title</p>
                <p className="text-sm font-semibold text-surface-900 mt-1">{joinedEvent.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase">Date</p>
                  <p className="text-sm text-surface-700 mt-1">{new Date(joinedEvent.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase">Time</p>
                  <p className="text-sm text-surface-700 mt-1">{joinedEvent.time || "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase">Location</p>
                  <p className="text-sm text-surface-700 mt-1">{joinedEvent.location}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase">Capacity</p>
                  <p className="text-sm text-surface-700 mt-1">{joinedEvent.participantLimit} participants</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase">Description</p>
                <p className="text-sm text-surface-600 mt-1">{joinedEvent.description}</p>
              </div>

              <div className="bg-info-50 border border-info-200 rounded-lg p-3">
                <p className="text-xs font-medium text-info-700">
                  📧 Check your email for event details and updates
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button className="btn-primary" onClick={() => setJoinedEvent(null)}>
                Done
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
