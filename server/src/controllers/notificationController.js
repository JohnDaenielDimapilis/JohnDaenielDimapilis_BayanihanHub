import Notification from "../models/Notification.js";

export async function createNotification({ userId, title, message, type = "System", relatedRecordId }) {
  if (!userId) return null;
  return Notification.create({ userId, title, message, type, relatedRecordId });
}

export async function createNotifications(items = []) {
  const validItems = items.filter((item) => item?.userId && item?.title && item?.message);
  if (!validItems.length) return [];
  return Notification.insertMany(validItems, { ordered: false });
}

export async function getNotifications(req, res) {
  try {
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
