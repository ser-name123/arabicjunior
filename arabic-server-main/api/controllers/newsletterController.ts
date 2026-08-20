import { Request, Response } from "express";
import Newsletter from "../models/newsletter";
import { sendEmailToAdmin } from "../utils/sendEmailToAdmin";

// Subscribe to newsletter
export const subscribeNewsletter = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        // Save to DB
        const newSubscriber = new Newsletter({ email });
        await newSubscriber.save();

        const htmlContent = `<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
            <tr>
                <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
                    <tr>
                    <td style="background-color: #4F46E5; padding: 20px; color: #ffffff; text-align: center;">
                        <h2 style="margin: 0;">📰 New Newsletter Subscription</h2>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding: 30px;">
                        <p style="font-size: 16px; color: #333333; margin: 0 0 10px;">Hi Admin,</p>
                        <p style="font-size: 16px; color: #333333; margin: 0 0 20px;">
                        A new user has subscribed to your newsletter:
                        </p>
                        <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; background-color: #f3f4f6; border-radius: 4px;">
                            <strong>Email:</strong> ${email}
                            </td>
                        </tr>
                        </table>
                        <p style="font-size: 14px; color: #999999; margin-top: 30px;">
                        You’re receiving this email because someone subscribed via <a href="https://arabicjuniors.com" style="color: #EF4444; text-decoration: none;">ArabicJuniors.com</a>.
                        </p>
                    </td>
                    </tr>
                </table>
                </td>
            </tr>
            </table>
            `

        // Send email to admin
        await sendEmailToAdmin({
            subject: "New Newsletter Subscription",
            htmlContent,
        });

        res.status(201).json({ message: "Subscribed to newsletter successfully!" });
    } catch (error: any) {
        console.error("Newsletter Subscribe Error:", error);
        res.status(500).json({ message: "Failed to subscribe" });
    }
};

// Get newsletters with pagination and filter
export const getNewsletters = async (req: Request, res: Response) => {
    try {
        let { page = "1", limit = "10", startDate, endDate } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const pageSize = parseInt(limit as string, 10) || 10;

        // Build search filter
        let filter: any = {};

        if (startDate || endDate) {
            filter.createdAt = {}
            if (startDate) filter.createdAt.$gte = new Date(startDate as string)
            if (endDate) filter.createdAt.$lte = new Date(endDate as string)
        }

        // Count total documents
        const total = await Newsletter.countDocuments(filter);

        // Fetch paginated newsletters
        const newsletters = await Newsletter.find(filter)
            .sort({ createdAt: -1 })
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        res.status(200).json({
            status: "success",
            data: newsletters,
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error) {
        console.error("Error fetching newsletters:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch newsletters",
            error,
        });
    }
};

// Get All newsletters (for export, no pagination)
export const getAllNewsletters = async (req: Request, res: Response) => {
    try {
        let { startDate, endDate } = req.query;
        let filter: any = {};

        if (startDate || endDate) {
            filter.createdAt = {}
            if (startDate) filter.createdAt.$gte = new Date(startDate as string)
            if (endDate) filter.createdAt.$lte = new Date(endDate as string)
        }

        const users = await Newsletter.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            status: "success",
            data: users,
            total: users.length,
        });
    } catch (error) {
        console.error("Error fetching all newsletters:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch all newsletters",
            error,
        });
    }
};
// Delete a single subscriber
export const deleteNewsletter = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const removed = await Newsletter.findByIdAndDelete(id);

        if (!removed) {
            res.status(404).json({ status: "error", message: "Subscriber not found" });
            return;
        }

        res.status(200).json({ status: "success", message: "Subscriber deleted" });
    } catch (error) {
        console.error("Error deleting newsletter subscriber:", error);
        res.status(500).json({ status: "error", message: "Failed to delete the subscriber" });
    }
};

/**
 * Delete several subscribers at once.
 *
 * A POST rather than a DELETE because the ids travel in the body, and a request
 * body on DELETE is poorly supported by proxies and some HTTP clients.
 */
export const deleteManyNewsletters = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            res.status(400).json({ status: "error", message: "No subscribers selected" });
            return;
        }

        // Guard against a runaway request wiping the list in one call. The admin
        // screen sends at most one page of rows, so this is far above normal use.
        if (ids.length > 500) {
            res.status(400).json({ status: "error", message: "Too many at once. Select up to 500." });
            return;
        }

        const result = await Newsletter.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            status: "success",
            message: `${result.deletedCount} subscriber(s) deleted`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("Error deleting newsletter subscribers:", error);
        res.status(500).json({ status: "error", message: "Failed to delete the subscribers" });
    }
};
