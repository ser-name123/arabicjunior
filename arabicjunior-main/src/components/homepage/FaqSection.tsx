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

const FAQ_DATA: FaqTypes[] = [
  {
    key: "first-faq",
    question: "Do you follow the UAE school curriculum?",
    answer: `Yes, we align our lessons with the UAE Ministry of Education standards to support students' school performance.`,
  },
  {
    key: "second-faq",
    question: "Are these classes for native or non-native Arabic speakers?",
    answer: `We offer tailored programs for both native & non-native Arabic speakers.`,
  },
  {
    key: "third-faq",
    question: "Are the sessions one-on-one or group-based?",
    answer: `We provide both one-on-one and small group sessions to suit your child’s learning style.`,
  },
  {
    key: "fourth-faq",
    question: "What is the class schedule and duration?",
    answer: `Flexible scheduling is available, with sessions lasting 60 minutes, up to 5 times a week.`,
  },
  {
    key: "fifth-faq",
    question: "Do you offer a free trial?",
    answer: (
      <>
        Yes! You can book a{" "}
        <Link href={"/register"} className="text-blue-600 font-medium">
          free trial session
        </Link>{" "}
        to experience our teaching approach before enrolling.
      </>
    ),
  },
  {
    key: "sixth-faq",
    question: "How do I enroll my child?",
    answer: (
      <>
        Simply fill out our online{" "}
        <Link href={"/register"} className="text-blue-600 font-medium">
          Registration Form
        </Link>
        , and we’ll contact you to get started.
      </>
    ),
  },
  {
    key: "seventh-faq",
    question: "Who can join these Arabic classes?",
    answer: `Our Arabic tuition is open to all students in UAE schools, from Grade 1 to Grade 10, across MOE, British, American, and IB curricula`,
  },
];
interface FaqSectionProps {
  faqData?: FaqTypes[]
}

const FaqSection: React.FC<FaqSectionProps> = ({ faqData = FAQ_DATA }) => {
  return (
    <React.Fragment>
      <section aria-label="faq-section-home" className="pt-10 md:pt-28 pb-11">
        <div className="container">
          <div
            aria-label="faq-content-wrapper"
            className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-6 place-items-center justify-between"
          >
            <div aria-label="faq-column-left" className="h-full">
              <h3 className="text-neutral-900 text-4xl sm:text-5xl leading-tight sm:leading-tight font-bold mb-16">
                We are often <span className="text-orange-500">Asked</span>
              </h3>

              <div
                aria-label="teacher-info-wrapper"
                className="max-w-[26.125rem] flex flex-col justify-center items-center"
              >
                <div
                  aria-label="teacher-image-wrapper"
                  className="max-w-[22.25rem]"
                >
                  <Image
                    src={ShafiullahImage}
                    width={2000}
                    height={1333}
                    alt="shafiullah teacher"
                    priority
                  />
                </div>

                <div
                  aria-label="info"
                  className="bg-yellow-500 py-5 px-6 rounded-xl flex flex-col items-center justify-center w-full"
                >
                  <h6 className="text-3xl font-bold text-white">
                    John Paul |{" "}
                    <span className="text-lg font-normal">
                      {" "}
                      Student Grade 4
                    </span>
                  </h6>
                </div>
              </div>
            </div>

            <div aria-label="faq-column-right" className="w-full h-full flex flex-col justify-center items-center">
              <Accordion type="single" collapsible className="w-full mb-12">
                {faqData?.map((faq) => (
                  <AccordionItem key={faq.key} value={faq.key}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
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

