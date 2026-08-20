import mongoose, { Schema, Document } from "mongoose";

/**
 * Everything on /pricing except the plan cards themselves, which are managed
 * separately under Pricing because they carry prices and feature lists.
 *
 * One document, like the other page-settings models.
 */

/** A card with an icon, a title and a paragraph. */
export interface PricingPageCard {
  title: string;
  description: string;
  icon: string;
  iconTheme: string;
  order: number;
}

/** A card in "Which plan is right for your child" — no icon, but a tier badge. */
export interface PricingPlanHint {
  title: string;
  description: string;
  /** Shown as a small pill above the title, e.g. "Most Popular". Optional. */
  badge: string;
  iconTheme: string;
  order: number;
}

/** A small icon + label, used for the pills on the flexible-learning banner. */
export interface PricingPageLabel {
  title: string;
  icon: string;
  iconTheme: string;
  order: number;
}

export interface PricingPageDocument extends Document {
  /** The small print under the plan cards. */
  planNotes: string[];

  includedHeading: string;
  includedHeadingHighlight: string;
  includedSubheading: string;
  includedCards: PricingPageCard[];

  chooseHeading: string;
  chooseHeadingHighlight: string;
  chooseSubheading: string;
  chooseCards: PricingPlanHint[];

  howHeading: string;
  howHeadingHighlight: string;
  howSubheading: string;
  howSteps: PricingPageCard[];

  flexibleHeading: string;
  flexibleSubtext: string;
  flexiblePills: PricingPageLabel[];

  whyHeading: string;
  whyHeadingHighlight: string;
  whySubheading: string;
  whyItems: PricingPageLabel[];

  /**
   * True once the sections have been filled with their starting copy. Without
   * it the seeding would run on every read and a field an admin deliberately
   * cleared would come back on the next page load.
   */
  sectionsSeeded: boolean;
}

const cardSchema = new Schema<PricingPageCard>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    icon: { type: String, default: "Star", trim: true },
    iconTheme: { type: String, default: "orange", trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const hintSchema = new Schema<PricingPlanHint>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    badge: { type: String, default: "", trim: true },
    iconTheme: { type: String, default: "orange", trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const labelSchema = new Schema<PricingPageLabel>(
  {
    title: { type: String, required: true, trim: true },
    icon: { type: String, default: "Star", trim: true },
    iconTheme: { type: String, default: "orange", trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const pricingPageSchema = new Schema<PricingPageDocument>(
  {
    planNotes: { type: [String], default: [] },

    includedHeading: { type: String, default: "", trim: true },
    includedHeadingHighlight: { type: String, default: "", trim: true },
    includedSubheading: { type: String, default: "", trim: true },
    includedCards: { type: [cardSchema], default: [] },

    chooseHeading: { type: String, default: "", trim: true },
    chooseHeadingHighlight: { type: String, default: "", trim: true },
    chooseSubheading: { type: String, default: "", trim: true },
    chooseCards: { type: [hintSchema], default: [] },

    howHeading: { type: String, default: "", trim: true },
    howHeadingHighlight: { type: String, default: "", trim: true },
    howSubheading: { type: String, default: "", trim: true },
    howSteps: { type: [cardSchema], default: [] },

    flexibleHeading: { type: String, default: "", trim: true },
    flexibleSubtext: { type: String, default: "", trim: true },
    flexiblePills: { type: [labelSchema], default: [] },

    whyHeading: { type: String, default: "", trim: true },
    whyHeadingHighlight: { type: String, default: "", trim: true },
    whySubheading: { type: String, default: "", trim: true },
    whyItems: { type: [labelSchema], default: [] },

    sectionsSeeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<PricingPageDocument>(
  "PricingPage",
  pricingPageSchema
);
