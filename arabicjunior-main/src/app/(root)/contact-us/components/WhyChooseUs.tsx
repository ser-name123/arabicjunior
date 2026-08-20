"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Plus, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ContactSeoSection } from "@/types/ContactSeoSection";
import { ICON_MAP, ICON_THEMES } from "@/lib/sectionIcons";

/**
 * The SEO block under the contact form.
 *
 * Every card starts open, so the copy is on screen — and in the server-rendered
 * HTML — the moment the page loads. That matters more here than anywhere else
 * on the site: this section exists to be read by search engines.
 */


/**
 * What the page renders if the API is unreachable. Identical to what the
 * database is seeded with, so a failed request looks like a normal page rather
 * than a hole where the section used to be.
 */
export const FALLBACK: ContactSeoSection = {
  heading: "Arabic Tuition for Kids Near Me – Expert Local Arabic Classes",
  introText:
    "Looking for Online Arabic Tuition for Kids that's engaging and trusted by parents? Arabic Juniors offers expert Online Arabic Tuition, making it easy for families searching for Arabic tuition near me to access quality learning from anywhere.",
  ctaHeading: "Ready to start your child's Arabic learning journey?",
  ctaSubtext: "Book a free trial lesson today",
  ctaButtonLabel: "Book Free Trial",
  ctaButtonUrl: "/register",
  items: [
    {
      title: "Qualified Arabic Tutors",
      description:
        "We deliver expert Arabic tuition for kids with a focus on reading, writing, and speaking skills using proven and child-friendly teaching methods.",
      icon: "GraduationCap",
      iconTheme: "green",
      order: 1,
    },
    {
      title: "Engaging Learning Experience",
      description:
        "Engaging, child-friendly lessons are designed to build confidence and interest, making Arabic learning simple, enjoyable, and effective at every stage.",
      icon: "BookOpen",
      iconTheme: "orange",
      order: 2,
    },
    {
      title: "Flexible Class Scheduling",
      description:
        "Our online Arabic tuition offers flexible scheduling, allowing each child to learn at a comfortable pace while fitting smoothly into their daily routine.",
      icon: "CalendarCheck",
      iconTheme: "teal",
      order: 3,
    },
    {
      title: "Online Arabic Tuition",
      description:
        "Personalized Arabic tuition classes delivered online ensure focused one-on-one attention, helping children make steady and confident progress.",
      icon: "Laptop",
      iconTheme: "green",
      order: 4,
    },
    {
      title: "CBSE Arabic Tuition Support",
      description:
        "We specialize in Arabic tuition classes for CBSE near me, helping students understand syllabus, complete homework, and prepare for exams.",
      icon: "ClipboardList",
      iconTheme: "red",
      order: 5,
    },
    {
      title: "Strong Foundation in Arabic",
      description:
        "With a supportive learning environment and proven teaching methods, Arabic Juniors helps children build a strong foundation in Arabic for success.",
      icon: "Award",
      iconTheme: "green",
      order: 6,
    },
  ],
};

const WhyChooseUs = ({ content }: { content?: ContactSeoSection | null }) => {
  const data = content ?? FALLBACK;
  const items = data.items?.length ? data.items : FALLBACK.items;

  // Holds the cards the visitor has collapsed. Storing the closed ones rather
  // than the open ones keeps "everything open" as the starting state without
  // seeding the set with every card's key.
  const [closed, setClosed] = useState<number[]>([]);

  const toggle = (index: number) =>
    setClosed((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );

  return (
    <section aria-label="why-choose-arabic-juniors" className="mt-20">
      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-3xl lg:text-[2rem] leading-tight font-bold text-neutral-900 mb-4 max-w-3xl mx-auto">
          {data.heading}
        </h2>

        <span
          aria-hidden="true"
          className="block w-16 h-1 rounded-full bg-light-green-500 mx-auto mb-5"
        />

        <p className="text-sm sm:text-base text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          {data.introText}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
        {items.map((item, index) => {
          const Icon = ICON_MAP[item.icon] ?? GraduationCap;
          const theme = ICON_THEMES[item.iconTheme] ?? ICON_THEMES.green;
          const isOpen = !closed.includes(index);

          return (
            <div
              key={`${item.title}-${index}`}
              className="rounded-xl border border-neutral-100 bg-white p-5 transition-shadow duration-300 hover:shadow-[0_2px_16px_rgba(24,29,36,0.06)]"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={`flex shrink-0 items-center justify-center w-10 h-10 rounded-lg ${theme}`}
                >
                  <Icon className="w-5 h-5" />
                </span>

                <h3 className="flex-1 min-w-0 pt-1.5 text-base font-bold text-neutral-900 leading-snug">
                  {item.title}
                </h3>

                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  aria-controls={`contact-point-${index}`}
                  aria-label={
                    isOpen
                      ? `Hide details for ${item.title}`
                      : `Show details for ${item.title}`
                  }
                  className="shrink-0 flex items-center justify-center w-7 h-7 rounded-md border border-neutral-100 text-neutral-400 transition-colors duration-200 hover:border-neutral-200 hover:text-neutral-600"
                >
                  {/* Stays a plus in both states, as the design has it. The
                      card visibly opening and closing is the feedback; a cross
                      on a collapsed card would read as "remove this". */}
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* grid-rows 1fr -> 0fr animates a height the browser works out
                  for itself, so the copy stays in the DOM and stays indexable
                  whichever state the card is in. */}
              <div
                id={`contact-point-${index}`}
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <p className="pt-3 text-sm text-neutral-500 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        aria-label="book-free-trial"
        className="rounded-2xl bg-orange-100 px-5 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left"
      >
        <span
          aria-hidden="true"
          className="flex shrink-0 items-center justify-center w-12 h-12 rounded-full bg-white"
        >
          <Rocket className="w-6 h-6 text-orange-500" />
        </span>

        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-neutral-900">
            {data.ctaHeading}
          </h3>
          <p className="text-sm text-neutral-500">{data.ctaSubtext}</p>
        </div>

        <Button asChild className="shrink-0 w-full sm:w-auto md:text-base">
          <Link href={data.ctaButtonUrl || "/register"}>
            {data.ctaButtonLabel}
            <ArrowRight className="w-4 h-4 shrink-0" />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default WhyChooseUs;
