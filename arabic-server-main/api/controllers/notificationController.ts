import { Request, Response } from "express";
import Notification from "../models/notification";
import ContactMessage from "../models/contactMessage";
import StudentRegistration from "../models/studentRegistration";
import TeacherRegistration from "../models/teacherRegistration";
import JobApplication from "../models/jobApplication";

// GET: Fetch all notifications for Admin (with auto-sync for existing DB entries)
export const getNotifications = async (req: Request, res: Response): Promise<any> => {
  try {
    // 1. Auto-sync pending/recent Contact Messages
    try {
      const contacts = await ContactMessage.find().sort({ createdAt: -1 }).limit(30);
      for (const msg of contacts) {
        const exists = await Notification.findOne({ "data.id": msg._id });
        if (!exists) {
          await Notification.create({
            type: "contact",
            title: `Contact Message: ${msg.fullName}`,
            message: `${msg.fullName} (${msg.email}) sent a message: ${msg.contactingPurpose || "General Inquiry"}`,
            link: "/admin/contact",
            data: { id: msg._id, fullName: msg.fullName, email: msg.email },
            isRead: msg.action_taken !== "pending",
            createdAt: msg.createdAt || new Date(),
          });
        }
      }
    } catch (e) {
      console.error("Contact notification sync error:", e);
    }

    // 2. Auto-sync recent Student Registrations (Free Trial Requests)
    try {
      const students = await StudentRegistration.find().sort({ createdAt: -1 }).limit(30);
      for (const st of students) {
        const exists = await Notification.findOne({ "data.id": st._id });
        if (!exists) {
          await Notification.create({
            type: "trial",
            title: `Trial Request: ${st.first_name || ""} ${st.last_name || ""}`,
            message: `${st.first_name || ""} ${st.last_name || ""} (${st.email}) registered for ${st.pricing_package || "Trial"}`,
            link: "/admin/registered-users",
            data: { id: st._id, email: st.email, pricing_package: st.pricing_package },
            isRead: false,
            createdAt: st.createdAt || new Date(),
          });
        }
      }
    } catch (e) {
      console.error("Student registration notification sync error:", e);
    }

    // 3. Auto-sync recent Teacher Registrations
    try {
      const teachers = await TeacherRegistration.find().sort({ createdAt: -1 }).limit(30);
      for (const t of teachers) {
        const exists = await Notification.findOne({ "data.id": t._id });
        if (!exists) {
          await Notification.create({
            type: "teacher",
            title: `Teacher App: ${t.first_name || ""} ${t.last_name || ""}`,
            message: `${t.first_name || ""} ${t.last_name || ""} (${t.email}) applied as a teacher`,
            link: "/admin/teachers",
            data: { id: t._id, email: t.email },
            isRead: false,
            createdAt: t.createdAt || new Date(),
          });
        }
      }
    } catch (e) {
      console.error("Teacher notification sync error:", e);
    }

    // 4. Auto-sync recent Job Applications
    try {
      const jobs = await JobApplication.find().sort({ createdAt: -1 }).limit(30);
      for (const j of jobs) {
        const exists = await Notification.findOne({ "data.id": j._id });
        if (!exists) {
          await Notification.create({
            type: "job",
            title: `Job Application: ${j.fullName}`,
            message: `${j.fullName} applied for ${j.jobTitle}`,
            link: "/admin/jobs",
            data: { id: j._id, fullName: j.fullName, jobTitle: j.jobTitle },
            isRead: false,
            createdAt: j.createdAt || new Date(),
          });
        }
      }
    } catch (e) {
      console.error("Job application notification sync error:", e);
    }

    // Fetch and return all notifications
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ isRead: false });

    return res.status(200).json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch notifications" });
  }
};

// PUT: Mark notification(s) as read
export const markAsRead = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id, markAll } = req.body;

    if (markAll) {
      await Notification.updateMany({ isRead: false }, { isRead: true });
      return res.status(200).json({ success: true, message: "All notifications marked as read" });
    }

    if (id) {
      await Notification.findByIdAndUpdate(id, { isRead: true });
      return res.status(200).json({ success: true, message: "Notification marked as read" });
    }

    return res.status(400).json({ success: false, message: "Missing id or markAll parameter" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({ success: false, message: "Failed to update notification" });
  }
};

// DELETE: Delete notification or clear read
export const clearNotifications = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    if (id) {
      await Notification.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: "Notification deleted" });
    }

    await Notification.deleteMany({ isRead: true });
    return res.status(200).json({ success: true, message: "Read notifications cleared" });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return res.status(500).json({ success: false, message: "Failed to delete notification" });
  }
};
