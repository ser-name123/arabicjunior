import Notification from "../models/notification";

export async function createAdminNotification({
  type,
  title,
  message,
  link,
  data,
}: {
  type: "contact" | "trial" | "teacher" | "job" | "support";
  title: string;
  message: string;
  link?: string;
  data?: any;
}) {
  try {
    const notification = await Notification.create({
      type,
      title,
      message,
      link: link || "",
      data: data || {},
      isRead: false,
    });
    return notification;
  } catch (error) {
    console.error("Failed to create admin notification:", error);
  }
}
