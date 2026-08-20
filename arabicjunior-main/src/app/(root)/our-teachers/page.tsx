import React from "react";
import TeacherCard from "./components/TeacherCard";
import { FaqTypes } from "@/types";
import { FaqSection } from "@/components/homepage";
import { fetchContent, fetchSettings } from "@/lib/contentApi";
import type { TeachersPageContent } from "@/types/TeachersPage";
import type { Teacher } from "@/types/Teacher";
import Reveal from "@/components/Reveal";
import WhyChooseTeachers from "./components/WhyChooseTeachers";
import TeachingMethodology from "./components/TeachingMethodology";
import TeachersCta from "./components/TeachersCta";
import TeacherHighlights from "./components/TeacherHighlights";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const FAQ_DATA: FaqTypes[] = [
  {
    key: "first-faq",
    question: "How can I apply to become a teacher at Arabic Juniors Academy?",
    answer: `You can fill out the “Apply Now” form on our Careers Page and fill the form. Our team will review your profile and get in touch with you if you’re shortlisted`,
  },
  {
    key: "second-faq",
    question: "What qualifications do I need to teach with your academy?",
    answer: `You need a bachelor’s degree in Arabic, good knowledge of the UAE school curriculum, and the ability to teach and manage children well.`,
  },
  {
    key: "third-faq",
    question: "Is teaching experience necessary?",
    answer: `Yes, a minimum of 2 years teaching experience in the UAE school Arabic syllabus is required.`,
  },
  {
    key: "fourth-faq",
    question: " What are the working hours and schedule flexibility?",
    answer: `You can set your own hours. Evening and weekend availability is preferred.`,
  },
  {
    key: "fifth-faq",
    question: "How are lessons conducted?",
    answer: `Lessons are live via MS Teams, Zoom or Google Meet using engaging materials.`,
  },
];

const TeachersPage = async () => {
  const [teachers, pageContent] = await Promise.all([
    fetchContent<Teacher>("/teachers"),
    fetchSettings<TeachersPageContent>("/teachers-page"),
  ]);

  const heading = pageContent?.heading || "Meet our dynamic team or tutors";
  const introLines = pageContent?.introLines ?? [];

  // Each new section renders nothing when its list is empty, so an API outage
  // or an admin clearing a section leaves the page shorter rather than broken.
  const highlights = pageContent?.highlights ?? [];
  const whyChooseCards = pageContent?.whyChooseCards ?? [];
  const methodologySteps = pageContent?.methodologySteps ?? [];

  return (
    <React.Fragment>
      <section
        aria-describedby="teacher-page-hero"
        className="py-24 bg-gradient-to-r from-[-5%] from-[#FF60A8] via-50% via-[#FB6238] to-100% to-[#F5AE14]"
      >
        <div className="container">
          <Reveal
            variant="rise"
            aria-describedby="content-wrapper"
            className="flex items-center justify-center flex-col gap-y-6"
          >
            {pageContent?.heroBadge && (
              <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
                {pageContent.heroBadge}
              </span>
            )}

            <h1 className="text-4xl leading-snug md:text-5xl font-bold text-white text-center">
              {pageContent?.heroHeading || "Meet the Expert Teachers"}{" "}
              {pageContent?.heroHeadingHighlight && (
                <span className="block">{pageContent.heroHeadingHighlight}</span>
              )}
            </h1>

            <p className="max-w-3xl text-lg md:text-xl font-normal text-white/90 text-center leading-relaxed">
              {pageContent?.heroSubtitle ||
                "Trusted Private Arabic Tutor for UAE Students Excellence"}
            </p>

            {(pageContent?.heroPrimaryLabel || pageContent?.heroSecondaryLabel) && (
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                {/* White on the gradient: the site's orange button would
                    disappear into the background it sits on. */}
                {pageContent?.heroPrimaryLabel && (
                  <Button
                    asChild
                    className="bg-white text-orange-500 hover:bg-white/90 md:text-base"
                  >
                    <Link href={pageContent.heroPrimaryUrl || "/register"}>
                      {pageContent.heroPrimaryLabel}
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </Link>
                  </Button>
                )}

                {pageContent?.heroSecondaryLabel && (
                  <Button
                    asChild
                    variant="outline"
                    className="border-white bg-transparent text-white hover:bg-white hover:text-orange-500 md:text-base"
                  >
                    <Link href={pageContent.heroSecondaryUrl || "/pricing"}>
                      {pageContent.heroSecondaryLabel}
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </Reveal>
        </div>
      </section>

      <TeacherHighlights highlights={highlights} />

      <WhyChooseTeachers
        heading={pageContent?.whyChooseHeading || "Why Choose Our"}
        headingHighlight={pageContent?.whyChooseHeadingHighlight || "Arabic Teachers?"}
        subheading={pageContent?.whyChooseSubheading || ""}
        cards={whyChooseCards}
      />

      <TeachingMethodology
        heading={pageContent?.methodologyHeading || "Our Teaching"}
        headingHighlight={pageContent?.methodologyHeadingHighlight || "Methodology"}
        subheading={pageContent?.methodologySubheading || ""}
        steps={methodologySteps}
      />

      {teachers.length > 0 && (
        <section
          aria-describedby="all-teachers-section"
          className="bg-[#F3F7F4] py-20"
        >
          <div className="container">
            <div aria-describedby="main-wrapper">
              <Reveal
                variant="up"
                aria-describedby="title-wrapper"
                className="mb-6 flex items-center justify-center"
              >
                <h3 className=" text-neutral-800 text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl lg:font-bold text-center">
                  {heading}
                </h3>
              </Reveal>

              {introLines.length > 0 && (
                <Reveal
                  variant="up"
                  delay={100}
                  aria-describedby="teachers-intro"
                  className="mx-auto mb-12 flex max-w-3xl flex-col gap-y-3"
                >
                  {introLines.map((line, index) => (
                    <p
                      key={index}
                      className="text-neutral-700 text-base sm:text-lg font-normal leading-relaxed text-center"
                    >
                      {line}
                    </p>
                  ))}
                </Reveal>
              )}

              <div
                aria-describedby="teacher-card-wrapper"
                className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <TeacherCard teachersData={teachers} />
              </div>
            </div>
          </div>
        </section>
      )}

      {pageContent?.ctaEnabled !== false && (
        <TeachersCta
          heading={pageContent?.ctaHeading || ""}
          subtext={pageContent?.ctaSubtext || ""}
          buttonLabel={pageContent?.ctaButtonLabel || ""}
          buttonUrl={pageContent?.ctaButtonUrl || "/register"}
        />
      )}

      <FaqSection faqData={FAQ_DATA} />
    </React.Fragment>
  );
};

export default TeachersPage;
