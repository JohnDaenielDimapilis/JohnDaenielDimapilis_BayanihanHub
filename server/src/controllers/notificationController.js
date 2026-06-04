import Notification from "../models/Notification.js";
import Participant from "../models/Participant.js";

export async function createNotification({ userId, title, message, type = "System", relatedRecordId }) {
  if (!userId) return null;
  return Notification.create({ userId, title, message, type, relatedRecordId });
}

export async function createNotifications(items = []) {
  const validItems = items.filter((item) => item?.userId && item?.title && item?.message);
  if (!validItems.length) return [];
  return Notification.insertMany(validItems, { ordered: false });
}

async function createEventRemindersForUser(userId) {
  const registrations = await Participant.find({ userId, participationStatus: "Joined" }).populate("eventId");
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  for (const registration of registrations) {
    const event = registration.eventId;
    if (!event || event.status === "Cancelled") continue;
    const eventDay = new Date(event.date);
    eventDay.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((eventDay - today) / 86400000);
    if (daysUntil < 0 || daysUntil > 3) continue;

    const title = daysUntil === 0 ? "Event is today" : `Event reminder: ${daysUntil} day${daysUntil === 1 ? "" : "s"} left`;
    const existing = await Notification.findOne({ userId, title, relatedRecordId: event._id });
    if (existing) continue;

    const timing = daysUntil === 0 ? "today" : daysUntil === 1 ? "tomorrow" : `in ${daysUntil} days`;
    await createNotification({
      userId,
      title,
      message: `Reminder: "${event.title || "Your event"}" will happen ${timing}. Date: ${new Date(event.date).toLocaleDateString()}. Location: ${event.location || "TBA"}.`,
      type: "Event",
      relatedRecordId: event._id
    });
  }
}

export async function getNotifications(req, res) {
  try {
    if (req.user.role === "User") {
      await createEventRemindersForUser(req.user._id);
    }
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to load notifications.", error: error.message });
  }
}

export async function markNotificationRead(req, res) {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to update notification.", error: error.message });
  }
}

export async function markAllNotificationsRead(req, res) {
  try {
    await Notification.updateMany(
      { userId: req.user._id, readAt: { $exists: false } },
      { readAt: new Date() }
    );

    res.status(200).json({ message: "Notifications marked as read." });
  } catch (error) {
    res.status(500).json({ message: "Failed to update notifications.", error: error.message });
  }
}
