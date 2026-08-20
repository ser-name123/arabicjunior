/** A card in "Why Choose Our Arabic Teachers", or a step in the methodology. */
export interface TeachersPageCard {
  title: string;
  description: string;
  /** Name of a lucide icon; resolved through ICON_MAP in lib/sectionIcons. */
  icon: string;
  /** Palette name, not a CSS class; resolved through ICON_THEMES. */
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

/** Editable copy for /our-teachers, managed from Admin → Teachers Page. */
export interface TeachersPageContent {
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

  heading: string;
  /** SEO paragraphs shown under the heading, above the tutor grid. */
  introLines: string[];

  whyChooseHeading: string;
  /** Words shown in orange at the end of the heading, as the rest of the site does. */
  whyChooseHeadingHighlight: string;
  whyChooseSubheading: string;
  whyChooseCards: TeachersPageCard[];

  methodologyHeading: string;
  methodologyHeadingHighlight: string;
  methodologySubheading: string;
  methodologySteps: TeachersPageCard[];

  ctaHeading: string;
  ctaSubtext: string;
  ctaButtonLabel: string;
  ctaButtonUrl: string;
  ctaEnabled: boolean;
}
