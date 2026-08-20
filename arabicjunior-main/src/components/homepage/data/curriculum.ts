import type { ComponentType } from "react";
import { BadgeCheck, GraduationCap, Languages, Wallet } from "lucide-react";

export type CurriculumItem = {
  /** Stable key — keep it unchanged once live, it is used for React keys and element ids. */
  key: string;
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  /** Tailwind classes for the icon glyph itself. */
  iconClassName: string;
  /** Tailwind classes for the tile behind the icon. */
  iconBgClassName: string;
};

/**
 * Content for the "Experience in UAE School Arabic Curriculum" accordion.
 * Edit titles and descriptions here — the component reads this list as-is,
 * so adding or removing an entry is enough to change the section.
 */
export const CURRICULUM_ITEMS: CurriculumItem[] = [
  {
    key: "moe-standards",
    title: "Online Arabic Tuition Aligned with UAE MOE Standards",
    description:
      "We specialize in delivering online Arabic tuition aligned with the UAE Ministry of Education (MOE) standards. Our curriculum-based approach ensures students meet school learning objectives while strengthening their understanding of Arabic through structured and guided online lessons.",
    icon: BadgeCheck,
    iconClassName: "w-7 h-7 text-[#0062FC]",
    iconBgClassName: "bg-[#F4F5F7]",
  },
  {
    key: "language-skills",
    title: "Comprehensive Arabic Language Skills Development",
    description:
      "Our online Arabic language classes focus on developing all core skills, including reading, writing, speaking, listening, and grammar. Lessons are carefully designed to help students improve fluency and build a strong foundation in the Arabic language at every level.",
    icon: Languages,
    iconClassName: "w-7 h-7 text-yellow-500",
    iconBgClassName: "bg-[#F4F5F7]",
  },
  {
    key: "affordable",
    title: "Affordable Arabic Tuition Online in the UAE",
    description:
      "At Arabic Juniors, we believe quality education should be accessible to everyone. Our affordable online Arabic tuition online in the UAE allows students to learn Arabic from the comfort of their homes while receiving personalized attention. Flexible scheduling and interactive lessons make our online classes ideal for busy families and working parents.",
    icon: Wallet,
    iconClassName: "w-7 h-7 text-green-500",
    iconBgClassName: "bg-[#F4F5F7]",
  },
  {
    key: "school-students",
    title: "Arabic Language Classes for UAE School Students",
    description:
      "We offer structured online Arabic language classes for beginners and advanced learners, with all School curriculum support for CBSE, British, IB, American, and MOE curricula. Our lessons focus on reading, writing, speaking, grammar, Quranic Arabic, and conversational Arabic, helping students build confidence and long-term fluency.",
    icon: GraduationCap,
    iconClassName: "w-7 h-7 text-pink-500",
    iconBgClassName: "bg-[#F4F5F7]",
  },
];
