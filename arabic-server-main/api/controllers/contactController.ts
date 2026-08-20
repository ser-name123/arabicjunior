import { Request, Response } from "express";
import ContactMessage from "../models/contactMessage";
import ContactSettings from "../models/contactSettings";
import { sendEmailToAdmin } from "../utils/sendEmailToAdmin";
import { createAdminNotification } from "../utils/createNotification";

// POST: Submit a contact message (Public)
export const submitContactMessage = async (req: Request, res: Response) => {
    try {
        const { fullName, email, contactingPurpose, message } = req.body;

        // Save to DB
        const newContact = new ContactMessage({
            fullName,
            email,
            contactingPurpose,
            message,
        });
        await newContact.save();

        // Create Admin Notification
        await createAdminNotification({
            type: "contact",
            title: "New Contact Message",
            message: `${fullName} (${email}) sent a message: ${contactingPurpose || "General Inquiry"}`,
            link: "/admin/contact",
            data: { id: newContact._id, fullName, email }
        });

        const htmlContent = `<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <tr>
                <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
                    <tr>
                    <td style="background-color: #14B8A6; padding: 20px; color: #ffffff; text-align: center;">
                        <h2 style="margin: 0;">📩 New Contact Message</h2>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding: 30px;">
                        <p style="font-size: 16px; color: #333333;">Hi Admin,</p>
                        <p style="font-size: 16px; color: #333333;">
                        You’ve received a new contact message via <a href="https://arabicjuniors.com" style="color: #EF4444; text-decoration: none;">ArabicJuniors.com</a>:
                        </p>
 
                        <table style="width: 100%; margin-top: 20px; font-size: 15px;">
                        <tr>
                            <td style="padding: 8px 0;"><strong>Name:</strong></td>
                            <td>${fullName}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Email:</strong></td>
                            <td>${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Purpose:</strong></td>
                            <td>${contactingPurpose}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; vertical-align: top;"><strong>Message:</strong></td>
                            <td><pre style="white-space: pre-wrap; font-family: inherit; color: #444444;">${message}</pre></td>
                        </tr>
                        </table>
 
                        <p style="font-size: 14px; color: #999999; margin-top: 30px;">
                        This message was submitted from <a href="https://arabicjuniors.com" style="color: #EF4444; text-decoration: none;">ArabicJuniors.com</a> contact form.
                        </p>
                    </td>
                    </tr>
                </table>
                </td>
            </tr>
            </table>`;

        // Send email notification safely
        try {
            await sendEmailToAdmin({
                subject: "New Contact Message",
                htmlContent,
            });
        } catch (emailErr) {
            console.error("Email notification error (non-blocking):", emailErr);
        }

        res.status(201).json({ message: "Your message has been sent successfully!" });
    } catch (error) {
        console.error("Contact Form Submission Error:", error);
        res.status(500).json({ message: "Failed to submit contact message" });
    }
};

// GET: Fetch contact settings info (Public)
export const getContactSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    let settings = await ContactSettings.findOne();
    if (!settings) {
      settings = new ContactSettings();
      await settings.save();
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching contact settings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch contact settings" });
  }
};

// PUT: Update contact settings info (Admin Only)
export const updateContactSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      headerPhone,
      headerPhoneLink,
      contactEmail,
      contactLocation,
      contactPhone,
      contactWhatsApp,
      contactWhatsAppLink
    } = req.body;

    let settings = await ContactSettings.findOne();
    if (!settings) {
      settings = new ContactSettings();
    }

    if (headerPhone !== undefined) settings.headerPhone = headerPhone;
    if (headerPhoneLink !== undefined) settings.headerPhoneLink = headerPhoneLink;
    if (contactEmail !== undefined) settings.contactEmail = contactEmail;
    if (contactLocation !== undefined) settings.contactLocation = contactLocation;
    if (contactPhone !== undefined) settings.contactPhone = contactPhone;
    if (contactWhatsApp !== undefined) settings.contactWhatsApp = contactWhatsApp;
    if (contactWhatsAppLink !== undefined) settings.contactWhatsAppLink = contactWhatsAppLink;

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Contact settings updated successfully!",
      data: settings
    });
  } catch (error) {
    console.error("Error updating contact settings:", error);
    res.status(500).json({ success: false, message: "Failed to update contact settings" });
  }
};

// GET: List all submitted contact messages (Admin Only)
export const listContactMessages = async (req: Request, res: Response): Promise<any> => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error("Error listing contact messages:", error);
    res.status(500).json({ success: false, message: "Failed to fetch contact messages" });
  }
};

// PUT: Update status of a contact message (Admin Only)
export const updateContactMessageStatus = async (req: Request, res: Response): Promise<any> => {
  try {
    const { action_taken } = req.body;
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    message.action_taken = action_taken;
    message.action_date = new Date();
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message status updated successfully!",
      data: message
    });
  } catch (error) {
    console.error("Error updating message status:", error);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

/**
 * POST: Delete several contact submissions at once (Admin Only).
 *
 * A POST rather than a DELETE because the ids travel in the body, and a body on
 * DELETE is dropped by some proxies and HTTP clients.
 */
export const deleteManyContactMessages = async (req: Request, res: Response): Promise<any> => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No messages selected" });
    }

    // An upper bound so a malformed request cannot clear the whole inbox in one
    // call. Nobody selects more than this by hand.
    if (ids.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Please delete at most 500 messages at a time",
      });
    }

    const result = await ContactMessage.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} message(s) deleted successfully!`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting contact messages:", error);
    res.status(500).json({ success: false, message: "Failed to delete the messages" });
  }
};

// DELETE: Delete a contact message submission (Admin Only)
export const deleteContactMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    res.status(200).json({ success: true, message: "Message deleted successfully!" });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    res.status(500).json({ success: false, message: "Failed to delete message" });
  }
};
