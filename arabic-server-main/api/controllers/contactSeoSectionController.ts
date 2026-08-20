import { Request, Response } from "express";
import ContactSeoSection from "../models/contactSeoSection";

/**
 * Seeded with exactly the copy the contact page already showed, so the first
 * read after this ships returns a page that looks unchanged. Nobody has to go
 * and retype the existing content before the section works.
 */
const DEFAULTS = {
  heading: "Arabic Tuition for Kids Near Me – Expert Local Arabic Classes",
  introText:
    "Looking for Online Arabic Tuition for Kids that's engaging and trusted by parents? Arabic Juniors offers expert Online Arabic Tuition, making it easy for families searching for Arabic tuition near me to access quality learning from anywhere.",
  ctaHeading: "Ready to start your child's Arabic learning journey?",
  ctaSubtext: "Book a free trial lesson today",
  ctaButtonLabel: "Book Free Trial",
  ctaButtonUrl: "/register",
  items: [
    {
      title: "Qualified Arabic Tutors",
      description:
        "We deliver expert Arabic tuition for kids with a focus on reading, writing, and speaking skills using proven and child-friendly teaching methods.",
      icon: "GraduationCap",
      iconTheme: "green",
      order: 1,
    },
    {
      title: "Engaging Learning Experience",
      description:
        "Engaging, child-friendly lessons are designed to build confidence and interest, making Arabic learning simple, enjoyable, and effective at every stage.",
      icon: "BookOpen",
      iconTheme: "orange",
      order: 2,
    },
    {
      title: "Flexible Class Scheduling",
      description:
        "Our online Arabic tuition offers flexible scheduling, allowing each child to learn at a comfortable pace while fitting smoothly into their daily routine.",
      icon: "CalendarCheck",
      iconTheme: "teal",
      order: 3,
    },
    {
      title: "Online Arabic Tuition",
      description:
        "Personalized Arabic tuition classes delivered online ensure focused one-on-one attention, helping children make steady and confident progress.",
      icon: "Laptop",
      iconTheme: "green",
      order: 4,
    },
    {
      title: "CBSE Arabic Tuition Support",
      description:
        "We specialize in Arabic tuition classes for CBSE near me, helping students understand syllabus, complete homework, and prepare for exams.",
      icon: "ClipboardList",
      iconTheme: "red",
      order: 5,
    },
    {
      title: "Strong Foundation in Arabic",
      description:
        "With a supportive learning environment and proven teaching methods, Arabic Juniors helps children build a strong foundation in Arabic for success.",
      icon: "Award",
      iconTheme: "green",
      order: 6,
    },
  ],
};

/** GET /contact-seo-section — public, creates the document on first call. */
export const getContactSeoSection = async (_req: Request, res: Response) => {
  try {
    let section = await ContactSeoSection.findOne();

    if (!section) {
      section = await ContactSeoSection.create(DEFAULTS);
    }

    res.status(200).json({ success: true, data: section });
  } catch (error) {
    console.error("Get contact SEO section error:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not load the section" });
  }
};

/** PUT /admin/contact-seo-section */
export const updateContactSeoSection = async (req: Request, res: Response) => {
  try {
    const {
      heading,
      introText,
      items,
      ctaHeading,
      ctaSubtext,
      ctaButtonLabel,
      ctaButtonUrl,
    } = req.body;

    let section = await ContactSeoSection.findOne();
    if (!section) {
      section = await ContactSeoSection.create(DEFAULTS);
    }

    // Each field is only touched when it is actually present, so a partial save
    // from a future screen cannot blank out the fields it did not send.
    if (heading !== undefined) section.heading = heading;
    if (introText !== undefined) section.introText = introText;
    if (ctaHeading !== undefined) section.ctaHeading = ctaHeading;
    if (ctaSubtext !== undefined) section.ctaSubtext = ctaSubtext;
    if (ctaButtonLabel !== undefined) section.ctaButtonLabel = ctaButtonLabel;
    if (ctaButtonUrl !== undefined) section.ctaButtonUrl = ctaButtonUrl;

    if (Array.isArray(items)) {
      // A card with no title would render as an empty box on a live page, so
      // it is dropped rather than saved.
      section.items = items
        .filter((item: any) => item?.title?.trim())
        .map((item: any, index: number) => ({
          title: String(item.title).trim(),
          description: String(item.description ?? "").trim(),
          icon: String(item.icon || "GraduationCap").trim(),
          iconTheme: String(item.iconTheme || "green").trim(),
          // Position in the array is the order — it is what the admin sees.
          order: index + 1,
        }));
    }

    await section.save();

    res.status(200).json({
      success: true,
      message: "Contact page section updated",
      data: section,
    });
  } catch (error) {
    console.error("Update contact SEO section error:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not save the section" });
  }
};
