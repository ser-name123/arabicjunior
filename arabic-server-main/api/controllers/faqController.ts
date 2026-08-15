import { Request, Response } from "express";
import Question from "../models/question";
import { sendEmailToAdmin } from "../utils/sendEmailToAdmin";

// Submit a new question
export const submitQuestion = async (req: Request, res: Response) => {
    try {
        const { your_name, email, user_message } = req.body;

        // Save to DB
        const newQuestion = new Question({ your_name, email, user_message });
        await newQuestion.save();

        const htmlContent = `<table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
            <tr>
                <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); overflow: hidden;">
                    <tr>
                    <td style="background-color: #EF4444; padding: 20px; text-align: center; color: #ffffff;">
                        <h2 style="margin: 0;">❓ New FAQ Question - Arabic Juniors</h2>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding: 30px;">
                        <p style="font-size: 16px; color: #333333;">Hi Admin,</p>
                        <p style="font-size: 16px; color: #333333;">You have received a new question submission from the FAQ form:</p>

                        <table style="width: 100%; font-size: 15px; margin-top: 20px;">
                        <tr>
                            <td style="padding: 8px 0;"><strong>Name:</strong></td>
                            <td>${your_name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0;"><strong>Email:</strong></td>
                            <td>${email}</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; vertical-align: top;"><strong>Message:</strong></td>
                            <td><pre style="white-space: pre-wrap; font-family: inherit; color: #444;">${user_message}</pre></td>
                        </tr>
                        </table>

                        <p style="font-size: 14px; color: #888888; margin-top: 30px;">
                        This question was submitted via <a href="https://arabicjuniors.com" style="color: #EF4444; text-decoration: none;">ArabicJuniors.com</a>
                        </p>
                    </td>
                    </tr>
                </table>
                </td>
            </tr>
            </table>`
        // Send email to admin
        await sendEmailToAdmin({
            subject: "New FAQ Question Submitted",
            htmlContent
        });

        res.status(201).json({ message: "Question submitted successfully!" });
    } catch (error) {
        console.error("Submit Question Error:", error);
        res.status(500).json({ message: "Failed to submit question" });
    }
};
