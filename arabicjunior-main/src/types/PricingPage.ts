export interface PricingPageCard {
  title: string;
  description: string;
  /** Name of a lucide icon; resolved through ICON_MAP in lib/sectionIcons. */
  icon: string;
  /** Palette name, not a CSS class; resolved through ICON_THEMES. */
  iconTheme: string;
  order: number;
}

export interface PricingPlanHint {
  title: string;
  description: string;
  /** Small pill above the title, e.g. "Most Popular". Empty means no pill. */
  badge: string;
  iconTheme: string;
  order: number;
}

export interface PricingPageLabel {
  title: string;
  icon: string;
  iconTheme: string;
  order: number;
}

/** Editable copy for /pricing, managed from Admin → Pricing Page. */
export interface PricingPageContent {
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
}
