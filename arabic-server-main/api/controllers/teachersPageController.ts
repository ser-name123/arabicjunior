import { Request, Response } from "express";
import TeachersPage from "../models/teachersPage";

/**
 * Seed copy for the tutor grid on /our-teachers. It carries the phrases parents
 * actually search for, so the section is not just a heading above a card grid.
 */
const defaultIntroLines = [
  "Every Arabic Juniors tutor is a native or fluent Arabic speaker with classroom experience teaching children in the UAE, and each one is interviewed and trained before taking a single lesson.",
  "Our tutors teach the UAE Ministry of Education syllabus alongside British, American and IB curricula, covering reading, writing, speaking, grammar and Quranic Arabic from Grade 1 to Grade 10.",
  "Lessons are one-to-one and online, so you can pick the tutor who suits your child and keep the same teacher every week.",
];

const defaultHero = {
  badge: "Expert Arabic Teachers",
  heading: "Meet the Expert Teachers",
  headingHighlight: "",
  subtitle:
    "Our teachers are passionate, qualified and experienced in teaching Arabic to students of all ages and levels. They create engaging lessons that make learning effective, enjoyable and easy to understand.",
  primaryLabel: "Book a Free Trial",
  primaryUrl: "/register",
  secondaryLabel: "Explore Our Courses",
  secondaryUrl: "/pricing",
};

const defaultHighlights = [
  { title: "Experienced Teachers", icon: "UserCheck", iconTheme: "orange", order: 1 },
  { title: "Certified & Qualified", icon: "Award", iconTheme: "green", order: 2 },
  { title: "Student Focused", icon: "Users", iconTheme: "yellow", order: 3 },
  { title: "Safe & Supportive Environment", icon: "ShieldCheck", iconTheme: "pink", order: 4 },
];

const defaultWhyChoose = {
  heading: "Why Choose Our",
  headingHighlight: "Arabic Teachers?",
  subheading:
    "Our teachers are dedicated to helping students build strong Arabic language skills with confidence. Here's what makes our teachers the right choice for your learning journey.",
  cards: [
    {
      title: "Certified Arabic Teachers",
      description:
        "Learn from highly qualified and certified Arabic language teachers with years of experience in online teaching.",
      icon: "Award",
      iconTheme: "orange",
      order: 1,
    },
    {
      title: "One-on-One Classes",
      description:
        "Get personalized attention with one-on-one live classes tailored to your level, pace, and learning goals.",
      icon: "MessageSquare",
      iconTheme: "green",
      order: 2,
    },
    {
      title: "Flexible Timings",
      description:
        "Schedule your classes at times that suit you. Morning, evening, and weekend slots available to fit your routine.",
      icon: "Clock",
      iconTheme: "yellow",
      order: 3,
    },
    {
      title: "Tajweed & Arabic Language Focus",
      description:
        "Improve your Quran recitation with Tajweed and learn Arabic language skills like reading, writing, speaking, and grammar.",
      icon: "BookOpen",
      iconTheme: "pink",
      order: 4,
    },
    {
      title: "Kids & Adults Friendly",
      description:
        "Our teachers are trained to teach children, teens, and adults using age-appropriate methods that make learning enjoyable.",
      icon: "Users",
      iconTheme: "orange",
      order: 5,
    },
  ],
};

const defaultMethodology = {
  heading: "Our Teaching",
  headingHighlight: "Methodology",
  subheading:
    "We follow a structured and student-centered approach to ensure steady progress and a rewarding learning experience.",
  steps: [
    {
      title: "Assessment",
      description:
        "We evaluate your current level, strengths, and goals to understand your learning needs better.",
      icon: "ClipboardList",
      iconTheme: "orange",
      order: 1,
    },
    {
      title: "Personalized Plan",
      description:
        "A customized learning plan is created for you to ensure a clear path forward towards achieving your goals.",
      icon: "Target",
      iconTheme: "green",
      order: 2,
    },
    {
      title: "Guided Practice",
      description:
        "Regular interactive classes, practical exercises, and live practice with expert teachers strengthen your skills.",
      icon: "BookOpen",
      iconTheme: "yellow",
      order: 3,
    },
    {
      title: "Progress Tracking",
      description:
        "We track your progress regularly and provide feedback to help you improve continuously.",
      icon: "LineChart",
      iconTheme: "pink",
      order: 4,
    },
  ],
};

const defaultCta = {
  heading: "Start Your Arabic Learning Journey Today!",
  subtext:
    "Learn with our expert teachers and achieve your goals in Arabic language and Quran understanding.",
  buttonLabel: "Book a Free Trial Now",
  buttonUrl: "/register",
};

/**
 * Fills in any section the stored document does not have yet.
 *
 * The document predates these fields, so it is already in the database with
 * only a heading and intro lines. Without this the new sections would render
 * empty on a live site until somebody opened the admin screen and typed all of
 * it in by hand.
 *
 * Runs once per document. After that the flag stops it, so a field an admin
 * deliberately cleared stays cleared instead of reappearing on the next read.
 */
const backfillSections = (settings: any) => {
  if (settings.sectionsSeeded) return false;
  settings.sectionsSeeded = true;
  let changed = true;

  if (!settings.heroBadge) {
    settings.heroBadge = defaultHero.badge;
    changed = true;
  }
  if (!settings.heroHeading) {
    settings.heroHeading = defaultHero.heading;
    changed = true;
  }
  if (!settings.heroSubtitle) {
    settings.heroSubtitle = defaultHero.subtitle;
    changed = true;
  }
  if (!settings.heroPrimaryLabel) {
    settings.heroPrimaryLabel = defaultHero.primaryLabel;
    changed = true;
  }
  if (!settings.heroPrimaryUrl) {
    settings.heroPrimaryUrl = defaultHero.primaryUrl;
    changed = true;
  }
  if (!settings.heroSecondaryLabel) {
    settings.heroSecondaryLabel = defaultHero.secondaryLabel;
    changed = true;
  }
  if (!settings.heroSecondaryUrl) {
    settings.heroSecondaryUrl = defaultHero.secondaryUrl;
    changed = true;
  }
  if (!settings.highlights?.length) {
    settings.highlights = defaultHighlights;
    changed = true;
  }

  if (!settings.whyChooseHeading) {
    settings.whyChooseHeading = defaultWhyChoose.heading;
    changed = true;
  }
  if (!settings.whyChooseHeadingHighlight) {
    settings.whyChooseHeadingHighlight = defaultWhyChoose.headingHighlight;
    changed = true;
  }
  if (!settings.whyChooseSubheading) {
    settings.whyChooseSubheading = defaultWhyChoose.subheading;
    changed = true;
  }
  if (!settings.whyChooseCards?.length) {
    settings.whyChooseCards = defaultWhyChoose.cards;
    changed = true;
  }

  if (!settings.methodologyHeading) {
    settings.methodologyHeading = defaultMethodology.heading;
    changed = true;
  }
  if (!settings.methodologyHeadingHighlight) {
    settings.methodologyHeadingHighlight = defaultMethodology.headingHighlight;
    changed = true;
  }
  if (!settings.methodologySubheading) {
    settings.methodologySubheading = defaultMethodology.subheading;
    changed = true;
  }
  if (!settings.methodologySteps?.length) {
    settings.methodologySteps = defaultMethodology.steps;
    changed = true;
  }

  if (!settings.ctaHeading) {
    settings.ctaHeading = defaultCta.heading;
    changed = true;
  }
  if (!settings.ctaSubtext) {
    settings.ctaSubtext = defaultCta.subtext;
    changed = true;
  }
  if (!settings.ctaButtonLabel) {
    settings.ctaButtonLabel = defaultCta.buttonLabel;
    changed = true;
  }
  if (!settings.ctaButtonUrl) {
    settings.ctaButtonUrl = defaultCta.buttonUrl;
    changed = true;
  }

  return changed;
};

export const getTeachersPage = async (_req: Request, res: Response): Promise<any> => {
  try {
    let settings = await TeachersPage.findOne();
    if (!settings) {
      settings = new TeachersPage({
        heading: "Meet our dynamic team or tutors",
        introLines: defaultIntroLines,
      });
    }

    if (backfillSections(settings)) {
      await settings.save();
    }

    return res.status(200).json({ success: true, message: "success", data: settings });
  } catch (error) {
    console.error("Error fetching the teachers page settings:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch the teachers page settings" });
  }
};

/** Arrives as a JSON string from a multipart form, as a real array from JSON. */
const asArray = (value: unknown): any[] | null => {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : null;
  } catch (e) {
    console.error("Could not parse an array field:", e);
    return null;
  }
};

/** A card with no title would render as an empty box, so it is dropped. */
const cleanCards = (list: any[], fallbackIcon: string, fallbackTheme: string) =>
  list
    .filter((item) => item?.title?.trim())
    .map((item, index) => ({
      title: String(item.title).trim(),
      description: String(item.description ?? "").trim(),
      icon: String(item.icon || fallbackIcon).trim(),
      iconTheme: String(item.iconTheme || fallbackTheme).trim(),
      // Position in the array is the order — it is what the admin sees.
      order: index + 1,
    }));

export const updateTeachersPage = async (req: Request, res: Response): Promise<any> => {
  try {
    let settings = await TeachersPage.findOne();
    if (!settings) {
      settings = new TeachersPage({ introLines: defaultIntroLines });
      backfillSections(settings);
    }

    const {
      heroBadge,
      heroHeading,
      heroHeadingHighlight,
      heroSubtitle,
      heroPrimaryLabel,
      heroPrimaryUrl,
      heroSecondaryLabel,
      heroSecondaryUrl,
      highlights,
      heading,
      introLines,
      whyChooseHeading,
      whyChooseHeadingHighlight,
      whyChooseSubheading,
      whyChooseCards,
      methodologyHeading,
      methodologyHeadingHighlight,
      methodologySubheading,
      methodologySteps,
      ctaHeading,
      ctaSubtext,
      ctaButtonLabel,
      ctaButtonUrl,
      ctaEnabled,
    } = req.body;

    // Each field is only touched when it is actually present, so a partial save
    // cannot blank out the fields it did not send.
    if (heroBadge !== undefined) settings.heroBadge = heroBadge;
    if (heroHeading !== undefined) settings.heroHeading = heroHeading;
    if (heroHeadingHighlight !== undefined)
      settings.heroHeadingHighlight = heroHeadingHighlight;
    if (heroSubtitle !== undefined) settings.heroSubtitle = heroSubtitle;
    if (heroPrimaryLabel !== undefined) settings.heroPrimaryLabel = heroPrimaryLabel;
    if (heroPrimaryUrl !== undefined) settings.heroPrimaryUrl = heroPrimaryUrl;
    if (heroSecondaryLabel !== undefined)
      settings.heroSecondaryLabel = heroSecondaryLabel;
    if (heroSecondaryUrl !== undefined) settings.heroSecondaryUrl = heroSecondaryUrl;

    if (highlights !== undefined) {
      const parsed = asArray(highlights);
      // A highlight is a label only — cleanCards drops the description it does
      // not have, which is exactly right here.
      if (parsed) {
        settings.highlights = parsed
          .filter((item: any) => item?.title?.trim())
          .map((item: any, index: number) => ({
            title: String(item.title).trim(),
            icon: String(item.icon || "UserCheck").trim(),
            iconTheme: String(item.iconTheme || "orange").trim(),
            order: index + 1,
          }));
      }
    }

    if (heading !== undefined) settings.heading = heading;

    if (introLines !== undefined) {
      const parsed = asArray(introLines);
      if (parsed) {
        settings.introLines = parsed.map((l: unknown) => String(l).trim()).filter(Boolean);
      }
    }

    if (whyChooseHeading !== undefined) settings.whyChooseHeading = whyChooseHeading;
    if (whyChooseHeadingHighlight !== undefined)
      settings.whyChooseHeadingHighlight = whyChooseHeadingHighlight;
    if (whyChooseSubheading !== undefined)
      settings.whyChooseSubheading = whyChooseSubheading;
    if (whyChooseCards !== undefined) {
      const parsed = asArray(whyChooseCards);
      if (parsed) settings.whyChooseCards = cleanCards(parsed, "GraduationCap", "green");
    }

    if (methodologyHeading !== undefined) settings.methodologyHeading = methodologyHeading;
    if (methodologyHeadingHighlight !== undefined)
      settings.methodologyHeadingHighlight = methodologyHeadingHighlight;
    if (methodologySubheading !== undefined)
      settings.methodologySubheading = methodologySubheading;
    if (methodologySteps !== undefined) {
      const parsed = asArray(methodologySteps);
      if (parsed) settings.methodologySteps = cleanCards(parsed, "ClipboardList", "orange");
    }

    if (ctaHeading !== undefined) settings.ctaHeading = ctaHeading;
    if (ctaSubtext !== undefined) settings.ctaSubtext = ctaSubtext;
    if (ctaButtonLabel !== undefined) settings.ctaButtonLabel = ctaButtonLabel;
    if (ctaButtonUrl !== undefined) settings.ctaButtonUrl = ctaButtonUrl;
    if (ctaEnabled !== undefined) settings.ctaEnabled = Boolean(ctaEnabled);

    await settings.save();
    return res
      .status(200)
      .json({ success: true, message: "Teachers page updated successfully", data: settings });
  } catch (error) {
    console.error("Error updating the teachers page settings:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update the teachers page settings" });
  }
};
