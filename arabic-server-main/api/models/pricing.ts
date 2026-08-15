import mongoose, { Schema, Document } from "mongoose";

/**
 * Pricing is modelled as two collections rather than one nested document.
 *
 * A group is a tab on the pricing page — "Individual", "Group Class" — and owns
 * the bullet notes printed under the cards, which differ per tab. A plan is one
 * card. Keeping them apart means the admin edits a single card at a time
 * instead of a four-card, forty-feature form.
 */

export const ACCENT_COLORS = ["yellow", "pink", "green", "orange"] as const;
export type AccentColor = (typeof ACCENT_COLORS)[number];

// ---------------------------------------------------------------------------

export interface IPricingGroup extends Document {
  /** Stable slug used as the tab value and as the plans' foreign key. */
  key: string;
  label: string;
  notes: string[];
  status: "draft" | "published";
  order: number;
}

const PricingGroupSchema = new Schema<IPricingGroup>(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    label: { type: String, required: true, trim: true },
    notes: [{ type: String, trim: true }],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// NOTE: no index on `key` here — `unique: true` already creates one, and
// declaring it twice makes mongoose emit a duplicate-index warning.
PricingGroupSchema.index({ status: 1, order: 1 });

export const PricingGroup = mongoose.model<IPricingGroup>(
  "PricingGroup",
  PricingGroupSchema
);

// ---------------------------------------------------------------------------

export interface IPlanFeature {
  title: string;
  included: boolean;
}

export interface IPricingPlan extends Document {
  groupKey: string;
  title: string;
  price: number;
  currency: string;
  /**
   * The card's stripe and badge colour. This used to be derived by matching the
   * plan title against a hard-coded list, so renaming "Starter" silently
   * dropped the card back to the default yellow.
   */
  accentColor: AccentColor;
  features: IPlanFeature[];
  actionLabel: string;
  actionUrl: string;
  status: "draft" | "published";
  order: number;
}

const PricingPlanSchema = new Schema<IPricingPlan>(
  {
    groupKey: { type: String, required: true, trim: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, trim: true, default: "AED" },
    accentColor: { type: String, enum: ACCENT_COLORS, default: "yellow" },
    features: [
      {
        _id: false,
        title: { type: String, required: true, trim: true },
        included: { type: Boolean, default: true },
      },
    ],
    actionLabel: { type: String, trim: true, default: "Lets start" },
    actionUrl: { type: String, trim: true, default: "/register" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

PricingPlanSchema.index({ status: 1, groupKey: 1, order: 1 });

export const PricingPlan = mongoose.model<IPricingPlan>(
  "PricingPlan",
  PricingPlanSchema
);
