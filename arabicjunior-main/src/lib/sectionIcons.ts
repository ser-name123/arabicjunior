import type React from "react";
import {
  Award,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Clock,
  Globe,
  GraduationCap,
  Heart,
  Laptop,
  LineChart,
  MessageCircle,
  MessageSquare,
  School,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  UserCheck,
  Users,
  Video,
} from "lucide-react";

/**
 * The icons an admin can pick for an editable card.
 *
 * An explicit map rather than a lookup into everything lucide exports: a typo
 * in the database then renders the fallback icon instead of crashing the page,
 * and the admin dropdown has a short curated list rather than 1,500 entries.
 */
export const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Laptop,
  ClipboardList,
  Award,
  Users,
  UserCheck,
  Star,
  CheckCircle2,
  MessageCircle,
  MessageSquare,
  Clock,
  Globe,
  Heart,
  Trophy,
  Target,
  School,
  Sparkles,
  ShieldCheck,
  Video,
  LineChart,
};

export const ICON_NAMES = Object.keys(ICON_MAP);

/**
 * Colour names rather than raw classes.
 *
 * Tailwind only ships the classes it can see in the source at build time, so a
 * class name assembled from a database string would be purged and the icon
 * would render with no colour at all. Storing a palette name keeps the styling
 * in the code where Tailwind can find it, and means an admin never has to know
 * what `bg-light-green-100` means.
 */
export const ICON_THEMES: Record<string, string> = {
  green: "bg-light-green-100 text-light-green-700",
  orange: "bg-orange-100 text-orange-500",
  teal: "bg-teal-50 text-teal-600",
  red: "bg-rose-50 text-rose-500",
  yellow: "bg-yellow-100 text-yellow-500",
  pink: "bg-pink-100 text-pink-500",
  blue: "bg-sky-50 text-sky-600",
  purple: "bg-violet-50 text-violet-600",
  neutral: "bg-neutral-100 text-neutral-600",
};

export const ICON_THEME_NAMES = Object.keys(ICON_THEMES);

/** Solid version of the same palette, for the numbered steps on a dark band. */
export const STEP_THEMES: Record<string, string> = {
  green: "bg-light-green-500 text-white",
  orange: "bg-orange-500 text-white",
  teal: "bg-teal-500 text-white",
  red: "bg-rose-500 text-white",
  // White on #F5AE14 is too pale at this size; the dark neutral reads cleanly.
  yellow: "bg-yellow-500 text-neutral-900",
  pink: "bg-pink-500 text-white",
  blue: "bg-sky-500 text-white",
  purple: "bg-violet-500 text-white",
  neutral: "bg-neutral-500 text-white",
};
