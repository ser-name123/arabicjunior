export interface PlanActions {
  url: string;
  label: string;
}

export interface PlanFeatures {
  title: string;
  included: boolean;
}

export interface PlanChildren {
  title: string;
  price: number;
  currencyType: string;
  features: PlanFeatures[];
  actionBtn: PlanActions;
}

export interface PricingPlanTypes {
  label: string;
  key: string;
  children: PlanChildren[];
}
