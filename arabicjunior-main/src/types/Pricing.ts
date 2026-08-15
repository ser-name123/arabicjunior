export type AccentColor = "yellow" | "pink" | "green" | "orange";

export interface PlanFeature {
  title: string;
  included: boolean;
}

export interface PricingPlan {
  _id: string;
  groupKey: string;
  title: string;
  price: number;
  currency: string;
  /**
   * Card stripe and badge colour. Previously derived by matching the plan title
   * against a hard-coded list, so renaming a plan quietly reset its colour.
   */
  accentColor: AccentColor;
  features: PlanFeature[];
  actionLabel: string;
  actionUrl: string;
  status: "draft" | "published";
  order: number;
}

/** A tab on the pricing page, with its cards and its footnotes. */
export interface PricingGroup {
  _id: string;
  key: string;
  label: string;
  notes: string[];
  plans: PricingPlan[];
  status: "draft" | "published";
  order: number;
}
