import {
  Archive,
  CalendarDays,
  CheckCircle,
  ClipboardCheck,
  Edit3,
  FileText,
  ImageIcon,
  MapPin,
  Plus,
  QrCode,
  Send,
  UserMinus,
  Users,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { eventsApi, participantsApi } from "../api/client.js";
import bayanihanLogo from "../assets/bayanihanhub-logo.png";
import DataTable from "../components/DataTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import Modal from "../components/ui/Modal.jsx";
import FormField from "../components/ui/FormField.jsx";
import { useToast } from "../components/ui/Toast.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const blank = {
  title: "",
  eventType: "",
  description: "",
  objectives: "",
  date: "",
  time: "",
  startDateTime: "",
  endDateTime: "",
  durationType: "One Day",
  location: "",
  participantLimit: 50,
  targetBeneficiaries: "",
  requiredResources: "",
  registrationStartDate: "",
  registrationEndDate: "",
  bannerImageUrl: "",
  informationImageUrl: "",
  documentationImageUrl: "",
  postEventImageUrl: "",
  waitlistEnabled: true,
  capacityRule: "Allow Waitlist"
};

const blankReport = {
  attendanceCount: "",
  noShowCount: "",
  actualBeneficiariesServed: "",
  outcomeSummary: "",
  issuesEncountered: "",
  recommendations: ""
};

function toDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function toDateTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatEventDuration(event) {
  const start = event.startDateTime ? new Date(event.startDateTime) : event.date ? new Date(event.date) : null;
  const end = event.endDateTime ? new Date(event.endDateTime) : null;
  if (!start || Number.isNaN(start.getTime())) return "TBA";
  const startText = start.toLocaleString();
  const endText = end && !Number.isNaN(end.getTime()) ? end.toLocaleString() : "";
  return endText ? `${event.durationType || "One Day"} - ${startText} to ${endText}` : `${event.durationType || "One Day"} - ${startText}`;
}

function imageUrlFor(event, imageType) {
  return event.eventImages?.find((image) => image.imageType === imageType)?.imageUrl || "";
}

function buildEventImages(form) {
  return [
    { imageType: "Banner", imageUrl: form.bannerImageUrl, caption: "Event banner" },
    { imageType: "Information", imageUrl: form.informationImageUrl, caption: "Information poster" },
    { imageType: "Documentation", imageUrl: form.documentationImageUrl, caption: "Documentation photo" },
    { imageType: "Post Event", imageUrl: form.postEventImageUrl, caption: "Post-event photo" }
  ].filter((image) => image.imageUrl?.trim());
}

function ProgressCell({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, Number(value || 0)));
  return (
    <div className="min-w-[120px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-2xs font-semibold text-surface-500 uppercase">Progress</span>
        <span className="text-xs font-semibold text-surface-700">{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-surface-100 overflow-hidden">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function FormSection({ title, description, children }) {
  return (
    <section className="rounded-lg border border-surface-200 bg-white p-4 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-surface-900">{title}</h4>
        {description && <p className="text-xs text-surface-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function ImageUrlField({ label, value, onChange }) {
  return (
    <FormField label={label} hint="Paste a public image URL for preview and event documentation.">
      <input className="input h-10" placeholder="https://..." value={value} onChange={onChange} />
      {value?.trim() && (
        <div className="mt-2 rounded-lg border border-surface-200 bg-surface-50 overflow-hidden">
          <img src={value} alt={`${label} preview`} className="h-28 w-full object-cover" />
          <div className="px-3 py-2 text-xs text-surface-500 flex items-center gap-1">
            <ImageIcon size={12} /> Preview
          </div>
        </div>
      )}
    </FormField>
  );
}

export default function Events() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(blank);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reportEvent, setReportEvent] = useState(null);
  const [reportForm, setReportForm] = useState(blankReport);
  const [detailsEvent, setDetailsEvent] = useState(null);
  const [dateFilter, setDateFilter] = useState({ type: "all", value: "", startDate: "", endDate: "" });
  const [locationFilter, setLocationFilter] = useState("");
  const [eventStatusFilter, setEventStatusFilter] = useState("all");
  const [registrationStatusFilter, setRegistrationStatusFilter] = useState("all");
  const [userView, setUserView] = useState("join");
  const [progressEvent, setProgressEvent] = useState(null);
  const [progressForm, setProgressForm] = useState({ percentage: "", note: "" });
  const [qrPanel, setQrPanel] = useState(null);

  async function load() {
    try {
      const [eventData, registrationData] = await Promise.all([
        eventsApi.getAll(),
        user.role === "User" ? participantsApi.getMy().catch(() => []) : Promise.resolve([])
      ]);
      setEvents(eventData);
      setRegistrations(registrationData);
    } catch (err) {
      toast.error(err.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const registrationByEvent = useMemo(() => {
    return registrations.reduce((map, registration) => {
      map[registration.eventId?._id || registration.eventId] = registration;
      return map;
    }, {});
  }, [registrations]);

  function openCreate() {
    setEditingEvent(null);
    setForm(blank);
    setModalOpen(true);
  }

  function openEdit(event) {
    setEditingEvent(event);
    setForm({
      title: event.title || "",
      eventType: event.eventType || "",
      description: event.description || "",
      objectives: event.objectives || "",
      date: toDateInput(event.date),
      time: event.time || "",
      startDateTime: toDateTimeInput(event.startDateTime || event.date),
      endDateTime: toDateTimeInput(event.endDateTime || event.date),
      durationType: event.durationType || "One Day",
      location: event.location || "",
      participantLimit: event.participantLimit || 50,
      targetBeneficiaries: event.targetBeneficiaries || "",
      requiredResources: event.requiredResources || "",
      registrationStartDate: toDateInput(event.registrationStartDate),
      registrationEndDate: toDateInput(event.registrationEndDate),
      bannerImageUrl: imageUrlFor(event, "Banner"),
      informationImageUrl: imageUrlFor(event, "Information"),
      documentationImageUrl: imageUrlFor(event, "Documentation"),
      postEventImageUrl: imageUrlFor(event, "Post Event"),
      waitlistEnabled: event.waitlistEnabled !== false,
      capacityRule: event.capacityRule || "Allow Waitlist"
    });
    setModalOpen(true);
  }

  async function saveEvent(mode) {
    setSubmitting(true);
    const start = form.startDateTime ? new Date(form.startDateTime) : null;
    const payload = {
      ...form,
      date: form.startDateTime || form.date,
      time: form.time || (start && !Number.isNaN(start.getTime()) ? start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""),
      participantLimit: Number(form.participantLimit || 0),
      eventImages: buildEventImages(form),
      submitForReview: mode === "submit"
    };
    try {
      if (editingEvent) {
        await eventsApi.update(editingEvent._id, payload);
      } else {
        await eventsApi.create(payload);
      }
      toast.success(mode === "submit" ? "Event submitted for review" : "Event saved as draft");
      setForm(blank);
      setEditingEvent(null);
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function runAction(action, event) {
    try {
      if (action === "submit") await eventsApi.submit(event._id);
      if (action === "approve") {
        await eventsApi.approve(event._id, {
          approvalCriteria: { goalAligned: true, dateValid: true, resourcesAvailable: true, capacityReasonable: true },
          approvalRemarks: "Approved after admin review."
        });
      }
      if (action === "revision") {
        const revisionRemarks = window.prompt("Revision remarks:");
        if (!revisionRemarks) return;
        await eventsApi.requestRevision(event._id, { revisionRemarks });
      }
      if (action === "reject") {
        const rejectionReason = window.prompt("Reason for rejecting this event:");
        if (!rejectionReason) return;
        await eventsApi.reject(event._id, { rejectionReason });
      }
      if (action === "open") await eventsApi.openRegistration(event._id);
      if (action === "close") await eventsApi.closeRegistration(event._id);
      if (action === "archive") await eventsApi.archive(event._id);
      if (action === "qr") {
        const qr = event.qrCodeToken ? await eventsApi.getQr(event._id) : await eventsApi.generateQr(event._id);
        setQrPanel({ event, qr });
        toast.success(event.qrCodeToken ? "QR code loaded" : "QR code generated");
        return;
      }
      if (action === "cancel") {
        const cancellationReason = window.prompt("Reason for cancelling this event:");
        if (!cancellationReason) return;
        await eventsApi.cancel(event._id, { cancellationReason });
      }
      toast.success("Event updated");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function submitProgress(e) {
    e.preventDefault();
    if (!progressEvent) return;
    setSubmitting(true);
    try {
      await eventsApi.updateProgress(progressEvent._id, {
        percentage: Number(progressForm.percentage),
        note: progressForm.note
      });
      toast.success("Progress updated");
      setProgressEvent(null);
      setProgressForm({ percentage: "", note: "" });
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function join(event) {
    try {
      await participantsApi.join(event._id);
      toast.success(event.status === "Full" ? "Added to waitlist" : "Event joined");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function cancelRegistration(event) {
    const cancellationReason = window.prompt("Why are you cancelling this registration?");
    if (!cancellationReason) return;
    try {
      await participantsApi.cancel(event._id, { cancellationReason });
      toast.success("Registration cancelled");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function checkIn(event) {
    try {
      await participantsApi.checkIn(event._id);
      toast.success("Check-in recorded");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function submitReport(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await eventsApi.finish(reportEvent._id, {
        postEventReport: {
          ...reportForm,
          attendanceCount: Number(reportForm.attendanceCount || 0),
          noShowCount: Number(reportForm.noShowCount || 0),
          actualBeneficiariesServed: Number(reportForm.actualBeneficiariesServed || 0)
        }
      });
      toast.success("Post-event report submitted");
      setReportEvent(null);
      setReportForm(blankReport);
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function canManage(row) {
    const ownerId = row.createdBy?._id || row.createdBy;
    return user.role === "Admin" || ownerId === user.id;
  }

  function canReview(row) {
    return user.role === "Admin" || row.createdBy?.role === "User";
  }

  function renderActions(row) {
    const registration = registrationByEvent[row._id];
    const isManager = user.role !== "User" && canManage(row);

    if (user.role === "User") {
      if (registration && ["Joined", "Waitlisted"].includes(registration.participationStatus)) {
        return (
          <>
            {registration.participationStatus === "Joined" && ["Open for Registration", "Full", "Closed", "Finished"].includes(row.status) && (
              <button className="btn-primary btn-xs" onClick={() => checkIn(row)}>
                <ClipboardCheck size={13} />
                Check in
              </button>
            )}
            {row.status === "Finished" && registration.attendanceStatus === "Present" && (
              <button className="btn-outline btn-xs" onClick={() => navigate("/history")}>
                <FileText size={13} />
                Feedback
              </button>
            )}
            <button className="btn-danger btn-xs" onClick={() => cancelRegistration(row)}>
              <UserMinus size={13} />
              Cancel
            </button>
          </>
        );
      }

      if (row.status === "Open for Registration") {
        return <button className="btn-primary btn-xs" onClick={() => join(row)}>Join</button>;
      }
      if (row.status === "Full") return <button className="btn-outline btn-xs" disabled>Full</button>;
      return null;
    }

    return (
      <>
        {["Draft", "Pending Review", "Rejected", "Approved"].includes(row.status) && isManager && (
          <button className="btn-outline btn-xs" onClick={() => openEdit(row)}>
            <Edit3 size={13} />
            Edit
          </button>
        )}
        {["Draft", "Rejected"].includes(row.status) && isManager && (
          <button className="btn-primary btn-xs" onClick={() => runAction("submit", row)}>
            <Send size={13} />
            Submit
          </button>
        )}
        {["Admin", "Staff"].includes(user.role) && row.status === "Pending Review" && canReview(row) && (
          <>
            <button className="btn-primary btn-xs" onClick={() => runAction("approve", row)}>
              <CheckCircle size={13} />
              Approve
            </button>
            <button className="btn-outline btn-xs" onClick={() => runAction("revision", row)}>
              Revision
            </button>
            <button className="btn-danger btn-xs" onClick={() => runAction("reject", row)}>
              <XCircle size={13} />
              Reject
            </button>
          </>
        )}
        {row.status === "Approved" && isManager && (
          <button className="btn-primary btn-xs" onClick={() => runAction("open", row)}>Open Registration</button>
        )}
        {["Open for Registration", "Full"].includes(row.status) && isManager && (
          <>
            <button className="btn-outline btn-xs" onClick={() => runAction("close", row)}>Close</button>
            <button className="btn-danger btn-xs" onClick={() => runAction("cancel", row)}>Cancel</button>
          </>
        )}
        {isManager && !["Archived", "Cancelled", "Rejected"].includes(row.status) && (
          <button className="btn-outline btn-xs" onClick={() => { setProgressEvent(row); setProgressForm({ percentage: row.progressPercentage || 0, note: "" }); }}>
            Progress
          </button>
        )}
        {["Open for Registration", "Full", "Closed", "Finished"].includes(row.status) && isManager && (
          <button className="btn-outline btn-xs" onClick={() => runAction("qr", row)}>
            <QrCode size={13} />
            QR
          </button>
        )}
        {["Open for Registration", "Full", "Closed"].includes(row.status) && isManager && (
          <button className="btn-primary btn-xs" onClick={() => { setReportEvent(row); setReportForm(blankReport); }}>
            <FileText size={13} />
            Report
          </button>
        )}
        {row.status === "Finished" && isManager && (
          <button className="btn-outline btn-xs" onClick={() => runAction("archive", row)}>
            <Archive size={13} />
            Archive
          </button>
        )}
      </>
    );
  }

  function matchesDateFilter(event) {
    if (dateFilter.type === "all") return true;
    const eventDate = new Date(event.startDateTime || event.date);
    if (Number.isNaN(eventDate.getTime())) return true;
    const now = new Date();
    if (dateFilter.type === "day") return eventDate.toDateString() === now.toDateString();
    if (dateFilter.type === "week") {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return eventDate >= weekStart && eventDate <= weekEnd;
    }
    if (dateFilter.type === "month") return eventDate.getFullYear() === now.getFullYear() && eventDate.getMonth() === now.getMonth();
    if (dateFilter.type === "custom") {
      if (dateFilter.startDate && eventDate < new Date(dateFilter.startDate)) return false;
      if (dateFilter.endDate) {
        const end = new Date(dateFilter.endDate);
        end.setHours(23, 59, 59, 999);
        if (eventDate > end) return false;
      }
    }
    return true;
  }

  const userEvents = events.filter((event) => {
    const locationMatch = !locationFilter.trim() || String(event.location || "").toLowerCase().includes(locationFilter.toLowerCase());
    const statusMap = { open: "Open for Registration", waitlist: "Full" };
    const eventStatus = statusMap[eventStatusFilter] || eventStatusFilter;
    const eventStatusMatch = eventStatusFilter === "all" || event.status === eventStatus;
    const registration = registrationByEvent[event._id];
    const registrationLabel = registration?.participationStatus || "Not Joined";
    const registrationMatch = registrationStatusFilter === "all" || registrationLabel === registrationStatusFilter;
    const ownedByUser = (event.createdBy?._id || event.createdBy) === user.id;
    const viewMatch = userView === "join" ? !ownedByUser : ownedByUser;
    return matchesDateFilter(event) && locationMatch && eventStatusMatch && registrationMatch && viewMatch;
  });

  function mainRegistrationButton(event) {
    const registration = registrationByEvent[event._id];
    if (registration && ["Joined", "Waitlisted"].includes(registration.participationStatus)) {
      return (
        <button className="btn-danger w-full justify-center" onClick={() => cancelRegistration(event)}>
          Cancel Registration
        </button>
      );
    }
    if (event.status === "Open for Registration") {
      return <button className="btn-primary w-full justify-center" onClick={() => join(event)}>Join Event</button>;
    }
    if (event.status === "Full") return <button className="btn-outline w-full justify-center" disabled>Event Full</button>;
    if (event.status === "Closed") return <button className="btn-outline w-full justify-center" disabled>Registration Closed</button>;
    if (event.status === "Finished") return <button className="btn-primary w-full justify-center" onClick={() => setDetailsEvent(event)}>View History / Give Feedback</button>;
    if (event.status === "Cancelled") return <button className="btn-danger w-full justify-center" disabled>Cancelled</button>;
    return <button className="btn-outline w-full justify-center" disabled>Unavailable</button>;
  }

  const columns = [
    {
      key: "title",
      header: "Event",
      accessor: "title",
      render: (row) => (
        <div className="flex items-center gap-3 min-w-[220px]">
          <div className="w-9 h-9 rounded-lg bg-info-50 text-info-600 flex items-center justify-center shrink-0">
            <CalendarDays size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-900 truncate">{row.title || "Untitled event"}</p>
            <p className="text-xs text-surface-500">{row.eventType || "No type set"}</p>
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
          <p className="text-sm text-surface-700">{row.startDateTime ? new Date(row.startDateTime).toLocaleDateString() : row.date ? new Date(row.date).toLocaleDateString() : "Not set"}</p>
          <p className="text-xs text-surface-400">{row.durationType || "One Day"}</p>
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
          {row.location || "Not set"}
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
          {row.participantLimit || 0}
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
      key: "progress",
      header: "Progress",
      accessor: "progressPercentage",
      render: (row) => <ProgressCell value={row.progressPercentage} />,
    },
    {
      key: "registration",
      header: "My Registration",
      sortable: false,
      render: (row) => {
        const registration = registrationByEvent[row._id];
        if (user.role !== "User") return <span className="text-xs text-surface-400">-</span>;
        if (!registration) return <span className="text-xs text-surface-400">Not joined</span>;
        return (
          <div className="space-y-1">
            <StatusBadge value={registration.participationStatus} />
            {registration.waitlistPosition && <p className="text-2xs text-surface-500">Position #{registration.waitlistPosition}</p>}
            <p className="text-2xs text-surface-500">{registration.attendanceStatus}</p>
          </div>
        );
      },
    },
    {
      key: "actions",
      header: "",
      sortable: false,
      render: (row) => (
        <div className="flex flex-wrap items-center gap-2 justify-end min-w-[220px]">
          {renderActions(row)}
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1>Events</h1>
          <p>Manage event review, registration, attendance, finish reports, and archive status</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <Plus size={16} />
          {user.role === "User" ? "Create Event" : "New Event"}
        </button>
      </div>

      {user.role === "User" ? (
        <>
          <div className="flex gap-2 flex-wrap">
            <button className={`btn-sm ${userView === "join" ? "btn-primary" : "btn-ghost"}`} onClick={() => setUserView("join")}>
              Join Events
            </button>
            <button className={`btn-sm ${userView === "create" ? "btn-primary" : "btn-ghost"}`} onClick={() => setUserView("create")}>
              Create Events
            </button>
          </div>

          <div className="card-padded grid grid-cols-1 md:grid-cols-5 gap-3">
            <FormField label="Date Filter">
              <div className="flex gap-2">
                <select className="input h-10" value={dateFilter.type} onChange={(e) => setDateFilter({ ...dateFilter, type: e.target.value })}>
                  <option value="all">All</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="custom">Custom</option>
                </select>
                {dateFilter.type === "custom" && (
                  <input
                    type="date"
                    className="input h-10"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter({ ...dateFilter, startDate: e.target.value })}
                  />
                )}
              </div>
            </FormField>
            {dateFilter.type === "custom" && (
              <FormField label="End Date">
                <input
                  type="date"
                  className="input h-10"
                  value={dateFilter.endDate}
                  onChange={(e) => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                />
              </FormField>
            )}
            <FormField label="Location">
              <input className="input h-10" placeholder="Search location..." value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} />
            </FormField>
            <FormField label="Event Status">
              <select className="input h-10" value={eventStatusFilter} onChange={(e) => setEventStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="Closed">Closed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="waitlist">Waitlist</option>
                <option value="Finished">Finished</option>
              </select>
            </FormField>
            <FormField label="Registration">
              <select className="input h-10" value={registrationStatusFilter} onChange={(e) => setRegistrationStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="Joined">Joined</option>
                <option value="Not Joined">Not Joined</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </FormField>
            <div className="flex items-end">
              <button className="btn-outline w-full" onClick={() => {
                setDateFilter({ type: "all", value: "", startDate: "", endDate: "" });
                setLocationFilter("");
                setEventStatusFilter("all");
                setRegistrationStatusFilter("all");
              }}>
                Reset Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="card-padded text-sm text-surface-500">Loading events...</div>
          ) : userEvents.length === 0 ? (
            <div className="card-padded text-sm text-surface-500">No events match your filters.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {userEvents.map((event) => {
                const registration = registrationByEvent[event._id];
                const isOwned = (event.createdBy?._id || event.createdBy) === user.id;
                const bannerUrl = imageUrlFor(event, "Banner") || bayanihanLogo;
                return (
                  <article key={event._id} className="card-padded flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <img src={bannerUrl} alt="Event banner" className="w-12 h-12 rounded-lg bg-white object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h2 className="text-base font-semibold text-surface-900 truncate">{event.title || "Untitled event"}</h2>
                          <span className="badge badge-info">{event.progressPercentage || 0}%</span>
                        </div>
                        <p className="text-xs text-surface-500">{event.eventType || "Community event"}</p>
                      </div>
                    </div>

                    <p className="text-sm text-surface-600 line-clamp-3">{event.description || "No description yet."}</p>

                    <div className="grid grid-cols-2 gap-3 text-sm text-surface-600">
                      <div>
                        <p className="text-2xs uppercase font-semibold text-surface-400">Date</p>
                        <p>{event.startDateTime ? new Date(event.startDateTime).toLocaleDateString() : event.date ? new Date(event.date).toLocaleDateString() : "TBA"}</p>
                      </div>
                      <div>
                        <p className="text-2xs uppercase font-semibold text-surface-400">Duration</p>
                        <p>{event.durationType || "One Day"}</p>
                      </div>
                      <div>
                        <p className="text-2xs uppercase font-semibold text-surface-400">Location</p>
                        <p>{event.location || "TBA"}</p>
                      </div>
                      <div>
                        <p className="text-2xs uppercase font-semibold text-surface-400">Capacity</p>
                        <p>{event.capacityDisplay || `${event.joinedCount || 0}/${event.participantLimit || 0}`}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <StatusBadge value={registration?.participationStatus || (event.status === "Open for Registration" ? "Available" : event.status)} />
                      <button className="btn-ghost btn-sm" onClick={() => setDetailsEvent(event)}>View Details</button>
                    </div>

                    <div className="mt-auto">
                      {isOwned ? (
                        <div className="flex flex-wrap gap-2">
                          {["Draft", "Pending Review", "Rejected", "Approved"].includes(event.status) && (
                            <button className="btn-outline flex-1 justify-center" onClick={() => openEdit(event)}>Edit</button>
                          )}
                          {["Draft", "Rejected"].includes(event.status) && (
                            <button className="btn-primary flex-1 justify-center" onClick={() => runAction("submit", event)}>Submit</button>
                          )}
                          {!["Archived", "Cancelled", "Rejected"].includes(event.status) && (
                            <button className="btn-outline flex-1 justify-center" onClick={() => { setProgressEvent(event); setProgressForm({ percentage: event.progressPercentage || 0, note: "" }); }}>Progress</button>
                          )}
                        </div>
                      ) : mainRegistrationButton(event)}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <DataTable
          data={events}
          columns={columns}
          loading={loading}
          searchPlaceholder="Search events..."
          emptyTitle="No events yet"
          emptyDescription="Create a draft event or open an approved event for registration."
          exportFilename="events"
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? "Edit Event" : "Create Event"}
        description="Save drafts freely, then submit complete event details for review."
        size="2xl"
      >
        <div className="space-y-5">
          <FormSection title="Basic Event Information" description="Set the public title, event type, description, and objectives.">
            <div className="form-grid">
              <FormField label="Title" required>
                <input className="input h-10" placeholder="Event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </FormField>
              <FormField label="Event Type" required>
                <input className="input h-10" placeholder="Workshop, outreach, clinic" value={form.eventType} onChange={(e) => setForm({ ...form, eventType: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Description" required>
              <textarea className="input min-h-[6rem]" placeholder="Describe the event" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </FormField>
            <FormField label="Objectives" required>
              <textarea className="input min-h-[6rem]" placeholder="List the event objectives" value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} />
            </FormField>
          </FormSection>

          <FormSection title="Event Duration" description="Use exact start and end times so event cards and reports stay accurate.">
            <div className="form-grid">
              <FormField label="Start Date & Time" required>
                <input type="datetime-local" className="input h-10" value={form.startDateTime} onChange={(e) => setForm({ ...form, startDateTime: e.target.value, date: e.target.value })} />
              </FormField>
              <FormField label="End Date & Time" required>
                <input type="datetime-local" className="input h-10" value={form.endDateTime} onChange={(e) => setForm({ ...form, endDateTime: e.target.value })} />
              </FormField>
              <FormField label="Duration Type" required>
                <select className="input h-10" value={form.durationType} onChange={(e) => setForm({ ...form, durationType: e.target.value })}>
                  <option>One Day</option>
                  <option>Multiple Days</option>
                  <option>Weekly</option>
                </select>
              </FormField>
              <FormField label="Display Time" hint="Optional human-readable time shown on printed or shared details.">
                <input className="input h-10" placeholder="2:00 PM or 9:00 AM - 4:00 PM" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Location and Beneficiaries" description="Describe where the work happens, who benefits, and what resources are needed.">
            <FormField label="Location" required>
              <input className="input h-10" placeholder="Venue or address" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </FormField>
            <div className="form-grid">
              <FormField label="Target Beneficiaries" required>
                <textarea className="input min-h-[5.5rem]" placeholder="Who will be served?" value={form.targetBeneficiaries} onChange={(e) => setForm({ ...form, targetBeneficiaries: e.target.value })} />
              </FormField>
              <FormField label="Required Resources" required>
                <textarea className="input min-h-[5.5rem]" placeholder="Resources, people, materials" value={form.requiredResources} onChange={(e) => setForm({ ...form, requiredResources: e.target.value })} />
              </FormField>
            </div>
          </FormSection>

          <FormSection title="Capacity and Registration" description="Control participant limit, registration window, and waitlist behavior.">
            <div className="form-grid">
              <FormField label="Participant Limit" required>
                <input type="number" min="1" className="input h-10" value={form.participantLimit} onChange={(e) => setForm({ ...form, participantLimit: e.target.value })} />
              </FormField>
              <FormField label="Capacity Rule" required>
                <select
                  className="input h-10"
                  value={form.capacityRule}
                  onChange={(e) => setForm({ ...form, capacityRule: e.target.value })}
                >
                  <option>Allow Waitlist</option>
                  <option>Block Registration</option>
                </select>
              </FormField>
              <FormField label="Registration Start" required>
                <input type="date" className="input h-10" value={form.registrationStartDate} onChange={(e) => setForm({ ...form, registrationStartDate: e.target.value })} />
              </FormField>
              <FormField label="Registration End" required>
                <input type="date" className="input h-10" value={form.registrationEndDate} onChange={(e) => setForm({ ...form, registrationEndDate: e.target.value })} />
              </FormField>
            </div>
            <label className="inline-flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-50 px-3 py-2 text-sm text-surface-700">
              <input
                type="checkbox"
                checked={form.waitlistEnabled}
                onChange={(e) => setForm({ ...form, waitlistEnabled: e.target.checked })}
              />
              Allow waitlist when the participant limit is reached
            </label>
          </FormSection>

          <FormSection title="Event Images / Documentation" description="Attach the banner, information poster, and documentation images used in event details.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ImageUrlField label="Banner Image URL" value={form.bannerImageUrl} onChange={(e) => setForm({ ...form, bannerImageUrl: e.target.value })} />
              <ImageUrlField label="Information Image URL" value={form.informationImageUrl} onChange={(e) => setForm({ ...form, informationImageUrl: e.target.value })} />
              <ImageUrlField label="Documentation Image URL" value={form.documentationImageUrl} onChange={(e) => setForm({ ...form, documentationImageUrl: e.target.value })} />
              <ImageUrlField label="Post Event Image URL" value={form.postEventImageUrl} onChange={(e) => setForm({ ...form, postEventImageUrl: e.target.value })} />
            </div>
          </FormSection>

          <FormSection title="Submit for Approval" description="Save incomplete work as a draft, or submit completed details to the approval queue.">
            <div className="rounded-lg bg-surface-50 border border-surface-200 p-3 text-sm text-surface-600">
              Required fields are marked with red asterisks. If submission fails, the message will identify the field group that needs attention.
            </div>
          </FormSection>

          <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col sm:flex-row sm:justify-end gap-3 border-t border-surface-200 bg-white/95 p-4 backdrop-blur">
            <button type="button" className="btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="button" className="btn-outline" onClick={() => saveEvent("draft")} disabled={submitting}>
              Save Draft
            </button>
            <button type="button" className="btn-primary" onClick={() => saveEvent("submit")} disabled={submitting}>
              {submitting ? "Saving..." : "Submit for Review"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!reportEvent}
        onClose={() => setReportEvent(null)}
        title="Submit Post-Event Report"
        description={reportEvent ? `Complete "${reportEvent.title || "this event"}" with outcome details.` : ""}
      >
        <form onSubmit={submitReport} className="space-y-4">
          <div className="form-grid">
            <FormField label="Attendance Count" required>
              <input type="number" min="0" className="input" value={reportForm.attendanceCount} onChange={(e) => setReportForm({ ...reportForm, attendanceCount: e.target.value })} required />
            </FormField>
            <FormField label="Absent Count">
              <input type="number" min="0" className="input" value={reportForm.noShowCount} onChange={(e) => setReportForm({ ...reportForm, noShowCount: e.target.value })} />
            </FormField>
            <FormField label="Beneficiaries Served" required>
              <input type="number" min="0" className="input" value={reportForm.actualBeneficiariesServed} onChange={(e) => setReportForm({ ...reportForm, actualBeneficiariesServed: e.target.value })} required />
            </FormField>
          </div>
          <FormField label="Outcome Summary" required>
            <textarea className="input" value={reportForm.outcomeSummary} onChange={(e) => setReportForm({ ...reportForm, outcomeSummary: e.target.value })} required />
          </FormField>
          <FormField label="Issues Encountered">
            <textarea className="input" value={reportForm.issuesEncountered} onChange={(e) => setReportForm({ ...reportForm, issuesEncountered: e.target.value })} />
          </FormField>
          <FormField label="Recommendations">
            <textarea className="input" value={reportForm.recommendations} onChange={(e) => setReportForm({ ...reportForm, recommendations: e.target.value })} />
          </FormField>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-outline" onClick={() => setReportEvent(null)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!detailsEvent}
        onClose={() => setDetailsEvent(null)}
        title={detailsEvent?.title || "Event Details"}
        size="2xl"
        description={detailsEvent ? `${detailsEvent.eventType || "Community event"} - ${detailsEvent.location || "Location TBA"}` : ""}
      >
        {detailsEvent && (
          <div className="space-y-5">
            <p className="text-xs font-semibold text-surface-500 uppercase">Overview</p>
            <div className="flex items-start gap-3 rounded-lg border border-surface-200 bg-surface-50 p-3">
              <img src={imageUrlFor(detailsEvent, "Banner") || bayanihanLogo} alt="Event banner" className="w-12 h-12 rounded-lg bg-white object-cover shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <StatusBadge value={detailsEvent.status} />
                  <span className="badge badge-info">{detailsEvent.progressPercentage || 0}% progress</span>
                </div>
                <p className="text-sm text-surface-600">
                  Created by {detailsEvent.createdBy?.name || "BayanihanHub staff"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-surface-200 p-3">
                <p className="text-2xs uppercase font-semibold text-surface-400">Event Duration</p>
                <p className="font-medium text-surface-800">
                  {formatEventDuration(detailsEvent)}
                </p>
              </div>
              <div className="rounded-lg border border-surface-200 p-3">
                <p className="text-2xs uppercase font-semibold text-surface-400">Capacity</p>
                <p className="font-medium text-surface-800">{detailsEvent.capacityDisplay || `${detailsEvent.joinedCount || 0}/${detailsEvent.participantLimit || 0}`}</p>
              </div>
              <div className="rounded-lg border border-surface-200 p-3">
                <p className="text-2xs uppercase font-semibold text-surface-400">Registration</p>
                <p className="font-medium text-surface-800">
                  {registrationByEvent[detailsEvent._id]?.participationStatus || (detailsEvent.status === "Open for Registration" ? "Available" : detailsEvent.status)}
                </p>
              </div>
              <div className="rounded-lg border border-surface-200 p-3">
                <p className="text-2xs uppercase font-semibold text-surface-400">Attendance</p>
                <p className="font-medium text-surface-800">{registrationByEvent[detailsEvent._id]?.attendanceStatus || "Not joined"}</p>
              </div>
            </div>

            <div className="rounded-lg border border-surface-200 p-4 space-y-3">
              <p className="text-xs font-semibold text-surface-500 uppercase">Purpose and Beneficiaries</p>
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Description</p>
                <p className="text-sm text-surface-700 leading-relaxed">{detailsEvent.description || "No description provided."}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Objectives</p>
                <p className="text-sm text-surface-700 leading-relaxed">{detailsEvent.objectives || "No objectives provided."}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Target Beneficiaries</p>
                  <p className="text-sm text-surface-700">{detailsEvent.targetBeneficiaries || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-surface-500 uppercase mb-1">Required Resources</p>
                  <p className="text-sm text-surface-700">{detailsEvent.requiredResources || "Not specified"}</p>
                </div>
              </div>
            </div>

            {(detailsEvent.eventImages?.length > 0 || detailsEvent.reviewImages?.length > 0) && (
              <div className="rounded-lg border border-surface-200 p-4 space-y-3">
                <p className="text-xs font-semibold text-surface-500 uppercase">Pictures</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detailsEvent.eventImages?.map((image, index) => (
                    <a key={`${image.imageType}-${index}`} href={image.imageUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-surface-200 overflow-hidden no-underline bg-surface-50">
                      <img src={image.imageUrl} alt={image.caption || image.imageType} className="h-32 w-full object-cover" />
                      <div className="p-2 text-xs text-surface-600 flex items-center gap-1">
                        <ImageIcon size={12} /> {image.imageType}
                      </div>
                    </a>
                  ))}
                  {detailsEvent.reviewImages?.map((image, index) => (
                    <a key={`review-${index}`} href={image.imageUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-surface-200 overflow-hidden no-underline bg-surface-50">
                      <img src={image.imageUrl} alt={image.caption || "Review"} className="h-32 w-full object-cover" />
                      <div className="p-2 text-xs text-surface-600 flex items-center gap-1">
                        <ImageIcon size={12} /> Review photo
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {detailsEvent.progressUpdates?.length > 0 && (
              <div className="rounded-lg border border-surface-200 p-4">
                <p className="text-xs font-semibold text-surface-500 uppercase mb-2">Progress Updates</p>
                <div className="space-y-2">
                  {detailsEvent.progressUpdates.slice().reverse().map((update, index) => (
                    <div key={index} className="text-sm text-surface-700">
                      <span className="font-semibold">{update.percentage}%</span>
                      {update.note && <span> - {update.note}</span>}
                      <p className="text-2xs text-surface-400">{update.updatedAt ? new Date(update.updatedAt).toLocaleString() : ""}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="sticky bottom-0 -mx-6 -mb-6 flex flex-col sm:flex-row gap-2 border-t border-surface-200 bg-white/95 p-4 backdrop-blur">
              {mainRegistrationButton(detailsEvent)}
              <button className="btn-outline justify-center" onClick={() => navigate("/history")}>Open History</button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!progressEvent}
        onClose={() => setProgressEvent(null)}
        title="Update Event Progress"
        description={progressEvent ? `Record progress for "${progressEvent.title || "this event"}".` : ""}
      >
        <form onSubmit={submitProgress} className="space-y-4">
          <FormField label="Progress Percentage" required>
            <input
              type="number"
              min="0"
              max="100"
              className="input"
              value={progressForm.percentage}
              onChange={(e) => setProgressForm({ ...progressForm, percentage: e.target.value })}
              required
            />
          </FormField>
          <FormField label="Progress Note">
            <textarea
              className="input"
              placeholder="What changed?"
              value={progressForm.note}
              onChange={(e) => setProgressForm({ ...progressForm, note: e.target.value })}
            />
          </FormField>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-outline" onClick={() => setProgressEvent(null)}>Cancel</button>
            <button className="btn-primary" disabled={submitting}>{submitting ? "Saving..." : "Save Progress"}</button>
          </div>
        </form>
      </Modal>

      <Modal
        open={!!qrPanel}
        onClose={() => setQrPanel(null)}
        title="Event Attendance QR"
        description={qrPanel?.event ? `Display this code for "${qrPanel.event.title}".` : ""}
      >
        {qrPanel && (
          <div className="space-y-4">
            <div className="rounded-lg border border-surface-200 bg-surface-50 p-4 text-center">
              <QrCode size={80} className="mx-auto text-surface-700" />
              <p className="mt-3 text-xs font-semibold text-surface-500 uppercase">QR Payload</p>
              <code className="mt-1 block break-all rounded bg-white px-3 py-2 text-sm text-surface-700 border border-surface-200">
                {qrPanel.qr.qrData}
              </code>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-surface-200 p-3">
                <p className="text-2xs uppercase font-semibold text-surface-400">Generated</p>
                <p className="font-medium text-surface-800">{qrPanel.qr.qrGeneratedAt ? new Date(qrPanel.qr.qrGeneratedAt).toLocaleString() : "Just now"}</p>
              </div>
              <div className="rounded-lg border border-surface-200 p-3">
                <p className="text-2xs uppercase font-semibold text-surface-400">Expires</p>
                <p className="font-medium text-surface-800">{qrPanel.qr.qrExpiresAt ? new Date(qrPanel.qr.qrExpiresAt).toLocaleString() : "Not set"}</p>
              </div>
            </div>
            <button
              className="btn-primary w-full justify-center"
              onClick={() => navigator.clipboard?.writeText(qrPanel.qr.qrData).then(() => toast.success("QR payload copied"))}
            >
              Copy QR Payload
            </button>
          </div>
        )}
      </Modal>
    </section>
  );
}
