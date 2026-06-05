export const EVENT_PROGRESS = {
  Draft: 10,
  "Pending Review": 25,
  Approved: 40,
  "Open for Registration": 55,
  Full: 65,
  Closed: 75,
  Finished: 90,
  Archived: 100,
  Rejected: 0,
  Cancelled: 0
};

export const EVENT_STATUSES = Object.keys(EVENT_PROGRESS);

export const USER_VISIBLE_EVENT_STATUSES = [
  "Open for Registration",
  "Full",
  "Closed",
  "Finished",
  "Cancelled"
];

export const EVENT_REQUIRED_FIELDS = [
  "title",
  "eventType",
  "description",
  "objectives",
  "startDateTime",
  "endDateTime",
  "durationType",
  "location",
  "participantLimit",
  "targetBeneficiaries",
  "requiredResources",
  "registrationStartDate",
  "registrationEndDate"
];

export function getEventProgress(status) {
  return EVENT_PROGRESS[status] ?? 0;
}

export function getMissingEventFields(event) {
  return EVENT_REQUIRED_FIELDS.filter((field) => {
    const value = event[field];
    if (value === null || value === undefined) return true;
    if (typeof value === "string" && value.trim() === "") return true;
    if (field === "participantLimit" && Number(value) < 1) return true;
    return false;
  });
}

export function validateEventSchedule(event) {
  const startDateTime = event.startDateTime ? new Date(event.startDateTime) : null;
  const endDateTime = event.endDateTime ? new Date(event.endDateTime) : null;
  const date = startDateTime || (event.date ? new Date(event.date) : null);
  const start = event.registrationStartDate ? new Date(event.registrationStartDate) : null;
  const end = event.registrationEndDate ? new Date(event.registrationEndDate) : null;

  if (!date || Number.isNaN(date.getTime())) return "Event start date and time is invalid.";
  if (!endDateTime || Number.isNaN(endDateTime.getTime())) return "Event end date and time is invalid.";
  if (endDateTime < date) return "Event end date and time must be after the start date and time.";
  if (!start || Number.isNaN(start.getTime())) return "Registration start date is invalid.";
  if (!end || Number.isNaN(end.getTime())) return "Registration end date is invalid.";
  if (start > end) return "Registration start date must be before the registration end date.";
  if (end > date) return "Registration must end on or before the event starts.";
  return null;
}
