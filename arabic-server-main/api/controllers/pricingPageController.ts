import { Request, Response } from "express";
import PricingPage from "../models/pricingPage";

/**
 * Starting copy for /pricing, taken from the approved design so the page is
 * complete the moment this ships. Everything here is editable afterwards.
 */
const DEFAULTS = {
  planNotes: [
    "According to your plan, you need to inform the teacher and admin at least 4 hour(s) in advance to cancel a class.",
    "Make-up classes will be provided according to our rescheduling policy for missed or cancelled classes.",
    "You can reschedule a class without losing any class credits anytime before the class starts. This allows flexibility in joining a lesson.",
    "Once you join, you choose will be get auto deducted only once a month.",
    "Enjoy focused group learning with just 3 to 5 students per session!",
  ],

  includedHeading: "What's Included With",
  includedHeadingHighlight: "Every Plan",
  includedSubheading: "",
  includedCards: [
    {
      title: "Experienced Arabic Teachers",
      description: "Learn from qualified and passionate native speakers.",
      icon: "UserCheck",
      iconTheme: "orange",
      order: 1,
    },
    {
      title: "Live Online Classes",
      description: "Interactive live classes from the comfort of your home.",
      icon: "Video",
      iconTheme: "pink",
      order: 2,
    },
    {
      title: "Structured Arabic Curriculum",
      description: "Well-structured lessons aligned with learning standards.",
      icon: "BookOpen",
      iconTheme: "green",
      order: 3,
    },
    {
      title: "Personalized Learning",
      description: "Tailored lessons to match your child's learning pace.",
      icon: "Target",
      iconTheme: "yellow",
      order: 4,
    },
    {
      title: "Progress Tracking",
      description: "Regular assessments and progress reports for parents.",
      icon: "LineChart",
      iconTheme: "teal",
      order: 5,
    },
    {
      title: "Parent Feedback",
      description: "Stay updated with regular feedback from our teachers.",
      icon: "MessageSquare",
      iconTheme: "orange",
      order: 6,
    },
  ],

  chooseHeading: "Which Plan Is Right for",
  chooseHeadingHighlight: "Your Child?",
  chooseSubheading: "",
  chooseCards: [
    {
      title: "Starter",
      description:
        "Best for beginners and students starting their Arabic learning journey.",
      badge: "",
      iconTheme: "yellow",
      order: 1,
    },
    {
      title: "Essential",
      description:
        "Perfect for regular learners who need consistent school support.",
      badge: "Most Popular",
      iconTheme: "pink",
      order: 2,
    },
    {
      title: "Premium",
      description:
        "Ideal for students who want faster progress and additional practice.",
      badge: "",
      iconTheme: "green",
      order: 3,
    },
    {
      title: "Elite",
      description:
        "Best for students who want intensive learning and maximum support.",
      badge: "",
      iconTheme: "orange",
      order: 4,
    },
  ],

  howHeading: "How Our Arabic Tuition",
  howHeadingHighlight: "Works",
  howSubheading: "",
  howSteps: [
    {
      title: "Choose Your Plan",
      description:
        "Select the plan that suits your child's learning needs and goals.",
      icon: "ClipboardList",
      iconTheme: "orange",
      order: 1,
    },
    {
      title: "Book Your Free Trial",
      description:
        "Experience our teaching approach with a free trial lesson.",
      icon: "CalendarCheck",
      iconTheme: "pink",
      order: 2,
    },
    {
      title: "Start Learning",
      description:
        "Begin regular Arabic lessons and watch your child grow with confidence.",
      icon: "GraduationCap",
      iconTheme: "green",
      order: 3,
    },
  ],

  flexibleHeading: "Flexible Learning, Anytime, Anywhere",
  flexibleSubtext: "Our online Arabic tuition is designed to fit your schedule.",
  flexiblePills: [
    { title: "Online Classes", icon: "Laptop", iconTheme: "blue", order: 1 },
    { title: "One-to-One", icon: "UserCheck", iconTheme: "orange", order: 2 },
    { title: "Flexible Timing", icon: "Clock", iconTheme: "purple", order: 3 },
    { title: "Kids Friendly", icon: "Heart", iconTheme: "yellow", order: 4 },
  ],

  whyHeading: "Why Parents Choose",
  whyHeadingHighlight: "Arabic Juniors",
  whySubheading: "",
  whyItems: [
    { title: "Safe & Supportive Environment", icon: "ShieldCheck", iconTheme: "orange", order: 1 },
    { title: "Fun & Engaging Lessons", icon: "Sparkles", iconTheme: "pink", order: 2 },
    { title: "Improved Arabic Confidence", icon: "Star", iconTheme: "purple", order: 3 },
    { title: "Better School Performance", icon: "LineChart", iconTheme: "green", order: 4 },
    { title: "Strong Foundation for the Future", icon: "BookOpen", iconTheme: "yellow", order: 5 },
  ],
};

/** GET /pricing-page — public, creates and seeds the document on first call. */
export const getPricingPage = async (_req: Request, res: Response) => {
  try {
    let page = await PricingPage.findOne();

    if (!page) {
      page = await PricingPage.create({ ...DEFAULTS, sectionsSeeded: true });
    } else if (!page.sectionsSeeded) {
      // An existing document from before these fields existed. Fill it once so
      // the page is not empty, then never touch it again — see sectionsSeeded.
      Object.assign(page, DEFAULTS, { sectionsSeeded: true });
      await page.save();
    }

    res.status(200).json({ success: true, data: page });
  } catch (error) {
    console.error("Get pricing page error:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not load the pricing page" });
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

/**
 * Drops entries with no title — one would render as an empty box on a live
 * page — and renumbers from the array order, which is what the admin sees.
 */
const clean = (list: any[], keys: string[]) =>
  list
    .filter((item) => item?.title?.trim())
    .map((item, index) => {
      const out: Record<string, unknown> = {
        title: String(item.title).trim(),
        order: index + 1,
      };
      for (const key of keys) {
        out[key] = String(item[key] ?? "").trim();
      }
      return out;
    });

/** PUT /admin/pricing-page */
export const updatePricingPage = async (req: Request, res: Response) => {
  try {
    let page = await PricingPage.findOne();
    if (!page) {
      page = await PricingPage.create({ ...DEFAULTS, sectionsSeeded: true });
    }

    const body = req.body ?? {};

    // Plain text fields, only touched when present so a partial save cannot
    // blank out what it did not send.
    const textFields = [
      "includedHeading",
      "includedHeadingHighlight",
      "includedSubheading",
      "chooseHeading",
      "chooseHeadingHighlight",
      "chooseSubheading",
      "howHeading",
      "howHeadingHighlight",
      "howSubheading",
      "flexibleHeading",
      "flexibleSubtext",
      "whyHeading",
      "whyHeadingHighlight",
      "whySubheading",
    ] as const;

    for (const field of textFields) {
      if (body[field] !== undefined) (page as any)[field] = body[field];
    }

    if (body.planNotes !== undefined) {
      const parsed = asArray(body.planNotes);
      if (parsed) {
        page.planNotes = parsed.map((n: unknown) => String(n).trim()).filter(Boolean);
      }
    }

    const lists: Array<[string, string[]]> = [
      ["includedCards", ["description", "icon", "iconTheme"]],
      ["chooseCards", ["description", "badge", "iconTheme"]],
      ["howSteps", ["description", "icon", "iconTheme"]],
      ["flexiblePills", ["icon", "iconTheme"]],
      ["whyItems", ["icon", "iconTheme"]],
    ];

    for (const [field, keys] of lists) {
      if (body[field] !== undefined) {
        const parsed = asArray(body[field]);
        if (parsed) (page as any)[field] = clean(parsed, keys);
      }
    }

    await page.save();

    res.status(200).json({
      success: true,
      message: "Pricing page updated",
      data: page,
    });
  } catch (error) {
    console.error("Update pricing page error:", error);
    res
      .status(500)
      .json({ success: false, message: "Could not save the pricing page" });
  }
};
