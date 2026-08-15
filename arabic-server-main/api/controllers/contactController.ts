import { Request, Response } from "express";
import ContactMessage from "../models/contactMessage";
import { sendEmailToAdmin } from "../utils/sendEmailToAdmin";

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
            </table>`

        // Send email notification
        await sendEmailToAdmin({
            subject: "New Contact Message",
            htmlContent,
        });

        res.status(201).json({ message: "Your message has been sent successfully!" });
    } catch (error) {
        console.error("Contact Form Submission Error:", error);
        res.status(500).json({ message: "Failed to submit contact message" });
    }
};
