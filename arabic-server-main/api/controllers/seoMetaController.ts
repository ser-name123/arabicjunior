import { Request, Response } from "express";
import SeoMeta from "../models/seoMeta";

/**
 * Every page the admin can edit, seeded with the metadata that was hard-coded
 * in the pages themselves. Seeding with the live values means turning this on
 * changes nothing until somebody deliberately edits a field.
 *
 * Adding a page here is enough for it to appear in the admin list on the next
 * read; the page itself then asks for its own pageKey.
 */
const DEFAULT_PAGES = [
  {
    pageKey: "home",
    label: "Home",
    path: "/",
    title: "Best Arabic Tuition Online | Affordable Arabic Language Classes for UAE Students & Dubai Schools",
    description: "Join expert-led Arabic tuition online in Dubai & UAE. Affordable one-to-one Arabic language classes for UAE students, schools & UAE curriculum. Book your class now.",
    canonicalUrl: "https://arabicjuniors.com/",
  },
  {
    pageKey: "about-us",
    label: "About Us",
    path: "/about-us",
    title: "About Arabic Juniors | Arabic for kids",
    description: "Learn about Arabic Juniors, our mission, experienced teachers, and student-focused approach to helping learners build strong Arabic language skills.",
    canonicalUrl: "https://arabicjuniors.com/about-us",
  },
  {
    pageKey: "our-teachers",
    label: "Our Teachers",
    path: "/our-teachers",
    title: "Private Online Arabic Tutor for UAE Students & Kids",
    description: "Learn Arabic with an online Arabic tutor for Indian expats in UAE. Private Arabic tuition for kids and students with flexible online classes.Book now.",
    canonicalUrl: "https://arabicjuniors.com/our-teachers",
  },
  {
    pageKey: "pricing",
    label: "Pricing",
    path: "/pricing",
    title: "Arabic Tuition for School Students in UAE & Sharjah | Fees & Contact Details",
    description: "Find the best Arabic tuition for school students in UAE & Sharjah. Get affordable fees, expert tutors, & direct contact information for personalized Arabic classes.",
    canonicalUrl: "https://arabicjuniors.com/pricing",
  },
  {
    pageKey: "blogs",
    label: "Blogs",
    path: "/blogs",
    title: "Arabic Tuition Blog | Tips, Guides & Resources for Students in UAE",
    description: "Explore our Arabic tuition blog for the latest tips, study guides, and resources. Stay updated with expert advice for students & parents across the UAE.",
    canonicalUrl: "https://arabicjuniors.com/blogs",
  },
  {
    pageKey: "careers",
    label: "Careers",
    path: "/careers",
    title: "Careers | Join Our Team of Expert Arabic Tutors in UAE",
    description: "Explore rewarding career opportunities with our Arabic tuition team in UAE. Apply now to become an Arabic tutor and help students succeed with quality education.",
    canonicalUrl: "https://arabicjuniors.com/careers",
  },
  {
    pageKey: "contact-us",
    label: "Contact Us",
    path: "/contact-us",
    title: "Arabic Tuition for Kids Near Me | CBSE Arabic Classes",
    description: "Find the best Arabic tuition near you for kids & CBSE students. Enroll in local Arabic tuition classes with expert tutors for personalized learning. Book a trial now.",
    canonicalUrl: "https://arabicjuniors.com/contact-us",
  },
  {
    pageKey: "faq",
    label: "FAQ",
    path: "/faq",
    title: "FAQs | Arabic Tuition Frequently Asked Questions | UAE Students",
    description: "Find answers to common questions about our Arabic tuition services, online & home classes, fees, curriculum, and more. Get all the information UAE students & parents need.",
    canonicalUrl: "https://arabicjuniors.com/faq",
  },
  {
    pageKey: "register",
    label: "Register / Free Trial",
    path: "/register",
    title: "Book a Free Arabic Trial Class | Arabic Juniors",
    description: "Book a free online Arabic trial lesson for your child. Pick a time that suits you and meet an experienced Arabic teacher before you enrol.",
    canonicalUrl: "https://arabicjuniors.com/register",
  },
  {
    pageKey: "student-registration",
    label: "Student Registration",
    path: "/student-registration",
    title: "Student Registration | Arabic Juniors",
    description: "Complete your student registration for online Arabic classes with Arabic Juniors.",
    canonicalUrl: "https://arabicjuniors.com/student-registration",
  },
  {
    pageKey: "teacher-registration",
    label: "Teacher Registration",
    path: "/teacher-registration",
    title: "Teach Arabic Online | Apply as an Arabic Teacher",
    description: "Apply to teach Arabic online with Arabic Juniors. Share your experience and qualifications and our academic team will get in touch.",
    canonicalUrl: "https://arabicjuniors.com/teacher-registration",
  },
  {
    pageKey: "privacy-policy",
    label: "Privacy Policy",
    path: "/privacy-policy",
    title: "Privacy Policy | Arabic Juniors",
    description: "How Arabic Juniors collects, uses and protects the personal information of students and parents.",
    canonicalUrl: "https://arabicjuniors.com/privacy-policy",
  },
  {
    pageKey: "terms-and-conditions",
    label: "Terms & Conditions",
    path: "/terms-and-conditions",
    title: "Terms & Conditions | Arabic Juniors",
    description: "The terms that apply when you book and attend online Arabic classes with Arabic Juniors.",
    canonicalUrl: "https://arabicjuniors.com/terms-and-conditions",
  },];

/** Adds any page missing from the collection without touching existing rows. */
const ensureSeeded = async () => {
  const existing = await SeoMeta.find({}, "pageKey").lean();
  const have = new Set(existing.map((e) => e.pageKey));
  const missing = DEFAULT_PAGES.filter((p) => !have.has(p.pageKey));
  if (missing.length) await SeoMeta.insertMany(missing);
};

export const getAllSeoMeta = async (_req: Request, res: Response): Promise<any> => {
  try {
    await ensureSeeded();
    const data = await SeoMeta.find().sort({ label: 1 });
    return res.status(200).json({ success: true, message: "success", data });
  } catch (error) {
    console.error("Error listing SEO settings:", error);
    return res.status(500).json({ success: false, message: "Failed to load the SEO settings" });
  }
};

export const getSeoMetaByKey = async (req: Request, res: Response): Promise<any> => {
  try {
    await ensureSeeded();
    const data = await SeoMeta.findOne({ pageKey: req.params.pageKey });
    if (!data) {
      return res.status(404).json({ success: false, message: "Unknown page" });
    }
    return res.status(200).json({ success: true, message: "success", data });
  } catch (error) {
    console.error("Error fetching SEO settings:", error);
    return res.status(500).json({ success: false, message: "Failed to load the SEO settings" });
  }
};

export const updateSeoMeta = async (req: Request, res: Response): Promise<any> => {
  try {
    const record = await SeoMeta.findOne({ pageKey: req.params.pageKey });
    if (!record) {
      return res.status(404).json({ success: false, message: "Unknown page" });
    }

    const { title, description, canonicalUrl, keywords, noIndex } = req.body;

    if (title !== undefined) record.title = String(title).trim();
    if (description !== undefined) record.description = String(description).trim();
    if (canonicalUrl !== undefined) record.canonicalUrl = String(canonicalUrl).trim();
    if (noIndex !== undefined) record.noIndex = Boolean(noIndex);

    if (keywords !== undefined) {
      const parsed = typeof keywords === "string" ? keywords.split(",") : keywords;
      if (Array.isArray(parsed)) {
        record.keywords = parsed.map((k: unknown) => String(k).trim()).filter(Boolean);
      }
    }

    await record.save();
    return res.status(200).json({ success: true, message: "SEO settings updated", data: record });
  } catch (error) {
    console.error("Error updating SEO settings:", error);
    return res.status(500).json({ success: false, message: "Failed to update the SEO settings" });
  }
};
