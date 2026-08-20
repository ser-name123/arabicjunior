import { Request, Response } from "express";
import FaqSection from "../models/faqSection";
import cloudinary from "../config/cloudinary";

const uploadToCloudinary = async (file: Express.Multer.File) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "faq-section",
    resource_type: "auto",
  });

  return { secure_url: result.secure_url, public_id: result.public_id };
};

/**
 * Seeded with the copy the homepage shipped with, so the very first read
 * returns exactly what was on the page before this became editable.
 */
const defaultIntroLines = [
  "Parents across Dubai, Abu Dhabi and Sharjah ask us the same things before starting online Arabic tuition, so we have answered the most common ones here.",
  "Our online Arabic classes follow the UAE Ministry of Education curriculum and also support British, American and IB school students from Grade 1 to Grade 10.",
  "Still deciding? Book a free trial lesson and see how your child responds before committing to anything.",
];

const defaultItems = [
  {
    question: "Do you follow the UAE school curriculum?",
    answer:
      "Yes, we align our lessons with the UAE Ministry of Education standards to support students' school performance.",
    order: 1,
  },
  {
    question: "Are these classes for native or non-native Arabic speakers?",
    answer: "We offer tailored programs for both native &amp; non-native Arabic speakers.",
    order: 2,
  },
  {
    question: "Are the sessions one-on-one or group-based?",
    answer:
      "We provide both one-on-one and small group sessions to suit your child's learning style.",
    order: 3,
  },
  {
    question: "What is the class schedule and duration?",
    answer:
      "Flexible scheduling is available, with sessions lasting 60 minutes, up to 5 times a week.",
    order: 4,
  },
  {
    question: "Do you offer a free trial?",
    answer:
      'Yes! You can book a <a href="/register">free trial session</a> to experience our teaching approach before enrolling.',
    order: 5,
  },
  {
    question: "How do I enroll my child?",
    answer:
      'Simply fill out our online <a href="/register">Registration Form</a>, and we will contact you to get started.',
    order: 6,
  },
  {
    question: "Who can join these Arabic classes?",
    answer:
      "Our Arabic tuition is open to all students in UAE schools, from Grade 1 to Grade 10, across MOE, British, American, and IB curricula.",
    order: 7,
  },
];

export const getFaqSection = async (_req: Request, res: Response): Promise<any> => {
  try {
    let settings = await FaqSection.findOne();
    if (!settings) {
      settings = await FaqSection.create({
        introLines: defaultIntroLines,
        items: defaultItems,
      });
    }

    // Order is what the admin screen controls; sort here so every caller
    // receives the list already arranged.
    const data = settings.toObject();
    data.items = [...(data.items || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return res.status(200).json({ success: true, message: "success", data });
  } catch (error) {
    console.error("Error fetching FAQ section:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch the FAQ section" });
  }
};

export const updateFaqSection = async (req: Request, res: Response): Promise<any> => {
  try {
    let settings = await FaqSection.findOne();
    if (!settings) {
      settings = new FaqSection({ introLines: defaultIntroLines, items: defaultItems });
    }

    const { heading, headingHighlight, personName, personLabel, introLines, items } = req.body;

    if (heading !== undefined) settings.heading = heading;
    if (headingHighlight !== undefined) settings.headingHighlight = headingHighlight;
    if (personName !== undefined) settings.personName = personName;
    if (personLabel !== undefined) settings.personLabel = personLabel;

    // Both arrive as JSON strings when the form is sent as multipart (which it
    // is whenever an image is attached), and as real arrays otherwise.
    if (introLines !== undefined) {
      try {
        const parsed = typeof introLines === "string" ? JSON.parse(introLines) : introLines;
        if (Array.isArray(parsed)) {
          settings.introLines = parsed.map((l: unknown) => String(l).trim()).filter(Boolean);
        }
      } catch (e) {
        console.error("Could not parse introLines:", e);
      }
    }

    if (items !== undefined) {
      try {
        const parsed = typeof items === "string" ? JSON.parse(items) : items;
        if (Array.isArray(parsed)) {
          settings.items = parsed
            .filter((i: any) => i && String(i.question || "").trim() && String(i.answer || "").trim())
            .map((i: any, index: number) => ({
              question: String(i.question).trim(),
              answer: String(i.answer).trim(),
              order: Number.isFinite(Number(i.order)) ? Number(i.order) : index + 1,
            }));
        }
      } catch (e) {
        console.error("Could not parse items:", e);
      }
    }

    if (req.file) {
      if (settings.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(settings.imagePublicId);
        } catch (e) {
          console.error("Failed to delete the old FAQ image from Cloudinary:", e);
        }
      }
      const result = await uploadToCloudinary(req.file);
      settings.imageUrl = result.secure_url;
      settings.imagePublicId = result.public_id;
    }

    await settings.save();
    return res
      .status(200)
      .json({ success: true, message: "FAQ section updated successfully", data: settings });
  } catch (error) {
    console.error("Error updating FAQ section:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update the FAQ section" });
  }
};
