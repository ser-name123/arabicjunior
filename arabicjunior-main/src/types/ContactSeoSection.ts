export interface ContactSeoItem {
  title: string;
  description: string;
  /** Name of a lucide icon; resolved through ICON_MAP in WhyChooseUs. */
  icon: string;
  /** Palette name, not a CSS class; resolved through ICON_THEMES. */
  iconTheme: string;
  order: number;
}

export interface ContactSeoSection {
  heading: string;
  introText: string;
  items: ContactSeoItem[];
  ctaHeading: string;
  ctaSubtext: string;
  ctaButtonLabel: string;
  ctaButtonUrl: string;
}
