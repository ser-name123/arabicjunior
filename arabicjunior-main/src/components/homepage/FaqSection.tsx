import { ShafiullahImage } from "@/assets";
import Image from "next/image";
import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Button } from "../ui/button";
import Link from "next/link";
import { FaqTypes } from "@/types";
import { fetchSettings } from "@/lib/contentApi";
import { sanitizeHtml } from "@/utils/security";
import type { FaqSectionContent } from "@/types/FaqSection";

/**
 * Used only when the API cannot be reached, so the section still renders with
 * the copy the page shipped with rather than collapsing to an empty block.
 * The same values seed the database on its first read.
 */
const FALLBACK: FaqSectionContent = {
  heading: "We are often",
  headingHighlight: "Asked",
  introLines: [
    "Parents across Dubai, Abu Dhabi and Sharjah ask us the same things before starting online Arabic tuition, so we have answered the most common ones here.",
    "Our online Arabic classes follow the UAE Ministry of Education curriculum and also support British, American and IB school students from Grade 1 to Grade 10.",
    "Still deciding? Book a free trial lesson and see how your child responds before committing to anything.",
  ],
  imageUrl: "",
  personName: "John Paul",
  personLabel: "Student Grade 4",
  items: [
    {
      question: "Do you follow the UAE school curriculum?",
      answer:
        "Yes, we align our lessons with the UAE Ministry of Education standards to support students' school performance.",
      order: 1,
    },
    {
      question: "Are these classes for native or non-native Arabic speakers?",
      answer: "We offer tailored programs for both native and non-native Arabic speakers.",
      order: 2,
    },
    {
      question: "Are the sessions one-on-one or group-based?",
      answer:
        "We provide both one-on-one and small group sessions to suit your child's learning style.",
      order: 3,
    },
    {
      question: "What is the class schedule and duration?",
      answer:
        "Flexible scheduling is available, with sessions lasting 60 minutes, up to 5 times a week.",
      order: 4,
    },
    {
      question: "Do you offer a free trial?",
      answer:
        'Yes! You can book a <a href="/register">free trial session</a> to experience our teaching approach before enrolling.',
      order: 5,
    },
    {
      question: "How do I enroll my child?",
      answer:
        'Simply fill out our online <a href="/register">Registration Form</a>, and we will contact you to get started.',
      order: 6,
    },
    {
      question: "Who can join these Arabic classes?",
      answer:
        "Our Arabic tuition is open to all students in UAE schools, from Grade 1 to Grade 10, across MOE, British, American, and IB curricula.",
      order: 7,
    },
  ],
};

interface FaqSectionProps {
  /**
   * Pages that need their own question set (pricing, careers, about, teachers)
   * still pass it in. Everything else — heading, intro copy, portrait — comes
   * from the admin screen either way.
   */
  faqData?: FaqTypes[];
}

const FaqSection = async ({ faqData }: FaqSectionProps) => {
  const content =
    (await fetchSettings<FaqSectionContent>("/faq-section")) ?? FALLBACK;

  const heading = content.heading || FALLBACK.heading;
  const headingHighlight = content.headingHighlight || FALLBACK.headingHighlight;
  const introLines = content.introLines?.length
    ? content.introLines
    : FALLBACK.introLines;
  const personName = content.personName || FALLBACK.personName;
  const personLabel = content.personLabel || FALLBACK.personLabel;

  const items: FaqTypes[] = faqData
    ? faqData
    : (content.items?.length ? content.items : FALLBACK.items).map(
        (item, index) => ({
          key: `faq-${index}`,
          question: item.question,
          answer: item.answer,
        })
      );

  return (
    <React.Fragment>
      <section aria-label="faq-section-home" className="pt-10 md:pt-28 pb-11">
        <div className="container">
          <div
            aria-label="faq-content-wrapper"
            className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-6 place-items-center justify-between"
          >
            <div aria-label="faq-column-left" className="h-full">
              <h3 className="text-neutral-900 text-4xl sm:text-5xl leading-tight sm:leading-tight font-bold mb-6">
                {heading}{" "}
                <span className="text-orange-500">{headingHighlight}</span>
              </h3>

              <div
                aria-label="faq-intro"
                className="max-w-[32rem] flex flex-col gap-y-3 mb-10"
              >
                {introLines.map((line, index) => (
                  <p
                    key={index}
                    className="text-neutral-700 text-base sm:text-lg font-normal leading-relaxed"
                  >
                    {line}
                  </p>
                ))}
              </div>

              <div
                aria-label="teacher-info-wrapper"
                className="max-w-[19rem] flex flex-col justify-center items-center"
              >
                <div aria-label="teacher-image-wrapper" className="max-w-[16rem]">
                  <Image
                    src={content.imageUrl || ShafiullahImage}
                    width={2000}
                    height={1333}
                    sizes="(max-width: 768px) 16rem, 16rem"
                    alt={`${personName}, ${personLabel}, in an online Arabic tuition class with Arabic Juniors`}
                    priority
                  />
                </div>

                <div
                  aria-label="info"
                  className="bg-yellow-500 py-4 px-5 rounded-xl flex flex-col items-center justify-center w-full"
                >
                  <h6 className="text-2xl font-bold text-white">
                    {personName} |{" "}
                    <span className="text-base font-normal"> {personLabel}</span>
                  </h6>
                </div>
              </div>
            </div>

            <div
              aria-label="faq-column-right"
              className="w-full h-full flex flex-col justify-center items-center"
            >
              <Accordion type="single" collapsible className="w-full mb-12">
                {items?.map((faq) => (
                  <AccordionItem key={faq.key} value={faq.key}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>
                      {typeof faq.answer === "string" ? (
                        // Answers saved from the admin screen are HTML so they
                        // can carry links; the pages that pass their own data
                        // still hand us React nodes.
                        <span
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(faq.answer),
                          }}
                        />
                      ) : (
                        faq.answer
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <Button asChild className="w-full">
                <Link href="/register">Book your free session now</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default FaqSection;
