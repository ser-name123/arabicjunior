import { Request, Response } from "express";
import Question from "../models/question";
import { sendEmailToAdmin } from "../utils/sendEmailToAdmin";
import { emailLayout, detailTable, button, spacer, mailLink, nl2br } from "../utils/emailTemplate";

// Submit a new question
export const submitQuestion = async (req: Request, res: Response) => {
    try {
        const { your_name, email, user_message } = req.body;

        // Save to DB
        const newQuestion = new Question({ your_name, email, user_message });
        await newQuestion.save();

        const htmlContent = emailLayout({
            preheader: `${your_name} asked a question through the FAQ form.`,
            eyebrow: "New FAQ question",
            title: your_name,
            accent: "blue",
            content: `
              ${detailTable([
                  { label: "Name", value: your_name },
                  { label: "Email", value: mailLink(email) },
                  { label: "Question", value: nl2br(user_message), wide: true },
              ])}
              ${spacer(6)}
              ${button({ label: "Reply to sender", url: `mailto:${email}` })}
              ${spacer(10)}
            `,
            footerNote: "Submitted through the FAQ form on arabicjuniors.com.",
        });
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
