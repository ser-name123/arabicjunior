import mongoose, { Schema, Document } from "mongoose";

/** A card in "Why Choose Our Arabic Teachers". */
export interface TeachersPageCard {
  title: string;
  description: string;
  /** Name of a lucide icon; the page maps it to the real component. */
  icon: string;
  /** Palette name, not a CSS class — the page owns the colours. */
  iconTheme: string;
  order: number;
}

/** A numbered step in "Our Teaching Methodology". */
export interface TeachersPageStep {
  title: string;
  description: string;
  icon: string;
  iconTheme: string;
  order: number;
}

/** One of the small icon + label items in the strip under the hero. */
export interface TeachersPageHighlight {
  title: string;
  icon: string;
  iconTheme: string;
  order: number;
}

export interface TeachersPageDocument extends Document {
  heroBadge: string;
  heroHeading: string;
  /** Second line of the hero heading, shown in orange. */
  heroHeadingHighlight: string;
  heroSubtitle: string;
  heroPrimaryLabel: string;
  heroPrimaryUrl: string;
  heroSecondaryLabel: string;
  heroSecondaryUrl: string;

  highlights: TeachersPageHighlight[];

  /** Heading above the tutor grid. */
  heading: string;
  /** SEO copy shown directly under that heading. */
  introLines: string[];

  whyChooseHeading: string;
  /** Words shown in orange at the end of the heading, as the rest of the site does. */
  whyChooseHeadingHighlight: string;
  whyChooseSubheading: string;
  whyChooseCards: TeachersPageCard[];

  methodologyHeading: string;
  methodologyHeadingHighlight: string;
  methodologySubheading: string;
  methodologySteps: TeachersPageStep[];

  ctaHeading: string;
  ctaSubtext: string;
  ctaButtonLabel: string;
  ctaButtonUrl: string;
  /** Lets an admin take the banner off the page without deleting its copy. */
  ctaEnabled: boolean;

  /**
   * True once the sections have been filled with their starting copy.
   *
   * Without it the seeding would run on every read, and a field an admin
   * deliberately cleared — a button they wanted hidden, say — would silently
   * come back on the next page load.
   */
  sectionsSeeded: boolean;
}

const cardSchema = new Schema<TeachersPageCard>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    icon: { type: String, default: "GraduationCap", trim: true },
    iconTheme: { type: String, default: "green", trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const stepSchema = new Schema<TeachersPageStep>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    icon: { type: String, default: "ClipboardList", trim: true },
    iconTheme: { type: String, default: "orange", trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const highlightSchema = new Schema<TeachersPageHighlight>(
  {
    title: { type: String, required: true, trim: true },
    icon: { type: String, default: "UserCheck", trim: true },
    iconTheme: { type: String, default: "orange", trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const teachersPageSchema = new Schema<TeachersPageDocument>(
  {
    heroBadge: { type: String, default: "", trim: true },
    heroHeading: { type: String, default: "", trim: true },
    heroHeadingHighlight: { type: String, default: "", trim: true },
    heroSubtitle: { type: String, default: "", trim: true },
    heroPrimaryLabel: { type: String, default: "", trim: true },
    heroPrimaryUrl: { type: String, default: "/register", trim: true },
    heroSecondaryLabel: { type: String, default: "", trim: true },
    heroSecondaryUrl: { type: String, default: "/pricing", trim: true },

    highlights: { type: [highlightSchema], default: [] },

    heading: { type: String, default: "Meet our dynamic team or tutors" },
    introLines: { type: [String], default: [] },

    whyChooseHeading: { type: String, default: "", trim: true },
    whyChooseHeadingHighlight: { type: String, default: "", trim: true },
    whyChooseSubheading: { type: String, default: "", trim: true },
    whyChooseCards: { type: [cardSchema], default: [] },

    methodologyHeading: { type: String, default: "", trim: true },
    methodologyHeadingHighlight: { type: String, default: "", trim: true },
    methodologySubheading: { type: String, default: "", trim: true },
    methodologySteps: { type: [stepSchema], default: [] },

    ctaHeading: { type: String, default: "", trim: true },
    ctaSubtext: { type: String, default: "", trim: true },
    ctaButtonLabel: { type: String, default: "", trim: true },
    ctaButtonUrl: { type: String, default: "/register", trim: true },
    ctaEnabled: { type: Boolean, default: true },
    sectionsSeeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<TeachersPageDocument>(
  "TeachersPage",
  teachersPageSchema
);
