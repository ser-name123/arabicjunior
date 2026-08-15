"use client"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useMemo, useState } from "react";
import FaqForm from "./components/FaqForm";

const FAQ_DATA = [
  {
    label: "Enrollment & Payment",
    value: "enrollment",
    faqs: [
      {
        key: "enroll-1",
        question: "How do I sign up for classes?",
        answer:
          "You can sign up by clicking the registration button on the homepage and filling out the form. Our admin team will contact you to help with the next steps.",
      },
      {
        key: "enroll-2",
        question: "What is the pricing plan?",
        answer: "Please visit the Pricing Page for more details.",
      },
      {
        key: "enroll-3",
        question: "Do you offer any discounts?",
        answer:
          "Yes, we offer discounts for families who enroll two or more siblings on the same plan. Please note that this discount does not apply to group lessons.",
      },
      {
        key: "enroll-4",
        question: "Are you a registered business in the UAE?",
        answer:
          "We are registered as The Learning Hub FZE LLC Business Centre, Sharjah Publishing City Free Zone, Sharjah, United Arab Emirates, U.A.E.",
      },
      {
        key: "enroll-5",
        question: "Is it safe to pay at Arabic Juniors Academy?",
        answer:
          "Yes, your payments are secure. We use trusted payment methods, such as Stripe and direct bank transfers, to keep your information secure.",
      },
      {
        key: "enroll-6",
        question: "What is your refund and cancellation policy?",
        answer:
          "You can cancel or reschedule a class if you inform the teacher and admin at least 4 hours in advance. Rescheduled classes must be completed within the same month and cannot be carried over. If your tutor is unavailable, we will provide a qualified replacement. You will be notified in advance and may choose to continue or request a refund. If you would like to change your tutor, please contact our Admin Team. We will do our best to accommodate your request. Refunds are not provided for missed classes or late cancellations.",
      },
      {
        key: "enroll-7",
        question: "What happens if I do not pay on time?",
        answer:
          "If payment is delayed, we kindly ask you to contact us as soon as possible so we can assist you. Overdue payments may affect your access to classes until the balance is cleared.",
      },
    ],
  },
  {
    label: "Courses & Teaching",
    value: "courses-coaching",
    faqs: [
      {
        key: "courses-1",
        question: "Are the classes live or recorded?",
        answer:
          "All our classes are live with experienced Arabic teachers. We do not provide pre-recorded lessons.",
      },
      {
        key: "courses-2",
        question:
          "Do you teach students from all schools and grades in the UAE?",
        answer:
          "We offer Arabic classes for students from all UAE schools and curricula, from Grade 1 to Grade 10.",
      },
      {
        key: "courses-3",
        question: "What syllabus do you teach?",
        answer:
          "We teach the official Arabic syllabus followed by all major UAE educational boards, including MOE, American, British, IB, and Indian (CBSE) curricula.",
      },
      {
        key: "courses-4",
        question: "Do you have female teachers for girls?",
        answer:
          "We have experienced female Arabic teachers for girls. We make sure they feel comfortable and supported in class.",
      },
      {
        key: "courses-5",
        question: "Are your teachers multilingual?",
        answer:
          "Yes, our teachers can speak Urdu, English, Malayalam, and Tamil. This helps students from diverse backgrounds feel comfortable and understand better.",
      },
    ],
  },
  {
    label: "Scheduling & Access",
    value: "scheduling",
    faqs: [
      {
        key: "schedule-1",
        question: "What if I need to cancel or reschedule a class?",
        answer:
          "According to your plan, you must inform the teacher and admin team at least 4 hours in advance to cancel or reschedule a class.",
      },
      {
        key: "schedule-2",
        question: "What happens if the tutor is unavailable?",
        answer:
          "If the tutor is unavailable, we will inform you in advance and arrange a makeup class at a time that works for you.",
      },
      {
        key: "schedule-3",
        question: "What if I have internet or technical issues during a class?",
        answer:
          "Connection problems, such as freezing video, poor audio, or disconnection, can happen on either the tutor’s or student’s side. If you face any of these issues, try the following steps:\n- Stay close to your Wi-Fi router: Walls and distance can weaken your connection.\n- Use the 2.4GHz network: It works better over longer distances.\n- Restart your device: A quick restart can solve minor connectivity problems.",
      },
    ],
  },
  {
    label: "Teachers",
    value: "teachers",
    faqs: [
      {
        key: "teachers-1",
        question: "How do I apply to work with Arabic Juniors Academy?",
        answer:
          "You can apply by filling out the teacher application form on our website. Once submitted, our team will review your profile and contact you if you are shortlisted.",
      },
      {
        key: "teachers-2",
        question: "How will I follow the curriculum as a teacher?",
        answer:
          "We provide detailed curriculum guidelines, lesson plans, and resources aligned with UAE school standards. Training and support are also available to help you deliver classes effectively.",
      },
      {
        key: "teachers-3",
        question: "What computer skills do I need?",
        answer:
          "Basic computer knowledge is required. You should be able to use Microsoft Word, Excel, PowerPoint, Google Workspace, Zoom, and tools like Canva for creating worksheets or presentations.",
      },
      {
        key: "teachers-4",
        question: "How can I request a vacation?",
        answer:
          "To request leave, please notify the admin team 15 days in advance through email or WhatsApp. All leaves are subject to approval and should not conflict with scheduled classes unless it is an emergency.",
      },
      {
        key: "teachers-5",
        question: "How do I reschedule a class?",
        answer:
          "If you need to reschedule a class, inform the admin team and the student at least 24 hours in advance. A new time will be arranged based on availability.",
      },
      {
        key: "teachers-6",
        question: "How do I cancel a class?",
        answer:
          "To cancel a class, you must notify the admin team and the student as early as possible, preferably at least 24 hours in advance, for a valid reason. Avoid frequent cancellations.",
      },
      {
        key: "teachers-7",
        question: "What is the exit policy if I want to leave the academy?",
        answer:
          "Teachers should provide one month notice before leaving. A formal resignation email must be sent to the admin team, and any pending classes should be completed or handed over properly.",
      },
      {
        key: "teachers-8",
        question: "What qualifications do I need to teach Arabic?",
        answer:
          "Teachers must have a relevant degree and a teaching certificate (e.g., Master's in Arabic or equivalent). Prior experience in teaching Arabic, especially to non-native speakers, is highly preferred.",
      },
      {
        key: "teachers-9",
        question: "Is teaching experience required?",
        answer:
          "Yes, we prefer candidates with at least 2–3 years of teaching experience, particularly those familiar with the UAE school curriculum.",
      },
      {
        key: "teachers-10",
        question: "Are there any penalties for missed classes or absences?",
        answer:
          "Uninformed or unexcused absences may result in payment deductions or formal warnings. Please notify the academy early if you are unable to attend a class.",
      },
      {
        key: "teachers-11",
        question: "Do you provide training or professional development?",
        answer:
          "Yes, we offer regular training and support to help teachers stay updated with the latest teaching methods and curriculum changes.",
      },
      {
        key: "teachers-12",
        question: "Are there any growth opportunities?",
        answer:
          "Yes, experienced teachers may be offered leadership roles, involvement in curriculum design, or the chance to mentor new staff.",
      },
    ],
  },
];

const FaqPage = () => {
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = useMemo(() => {
    const query = searchQuery.toLowerCase();

    return FAQ_DATA.map((category) => {
      const filteredQuestions = category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(query) ||
          faq.answer.toLowerCase().includes(query)
      );

      return { ...category, faqs: filteredQuestions };
    });
  }, [searchQuery]);

  const defaultTab = filteredFaqs[0]?.value ?? "";

  return (
    <React.Fragment>
      <div aria-describedby="faq-page">
        <section
          aria-describedby=""
          className=" bg-gradient-to-r from-[-5%] from-[#FF60A8] via-50% via-[#FB6238] to-100% to-[#F5AE14] py-12 sm:py-24"
        >
          <div className="container">
            <div
              aria-describedby="content-wrapper"
              className="flex items-center justify-center flex-col gap-y-5 max-w-screen-lg mx-auto"
            >
              <h1 className="text-4xl sm:text-6xl font-bold text-white">
                FAQs
              </h1>
              <p className="text-lg sm:text-xl font-normal text-white text-center">
                Find quick answers to common questions about enrollment,
                courses, and support, everything you need to start your Qurani
                and Arabic journey with ease!
              </p>
            </div>
          </div>
        </section>

        <section
          aria-describedby="faq-main"
          className="bg-[#EBEFF3] py-9 sm:py-16"
        >
          <div className="container">
            <div aria-describedby="main-wrapper">
              <div
                aria-describedby="search-area"
                className="max-w-screen-sm mx-auto mb-14"
              >
                <div
                  aria-describedby="content-wrapper"
                  className="flex items-center flex-col gap-y-5 mb-10"
                >
                  <h3 className="text-3xl sm:text-5xl text-center font-bold text-gray-900">
                    Got Questions?
                  </h3>
                  <h5 className="text-lg sm:text-xl font-medium text-gray-700 text-center">
                    We&apos;ve Got Answers
                  </h5>
                </div>

                <div
                  aria-describedby="search-input-wrapper"
                  className="relative"
                >
                  <Input placeholder="Enter the keyword..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="h-14"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setSearchQuery(inputValue);
                    }}
                  />
                  <Button
                    onClick={() => setSearchQuery(inputValue)}
                    className="absolute right-0 top-1/2 h-full md:h-full -translate-y-1/2 z-[2] bg-[#F4AF2F]">
                    Search
                  </Button>
                </div>
              </div>

              <div aria-describedby="faq-tab-wrapper">
                <Tabs defaultValue={filteredFaqs[0]?.value ?? ""}>
                  <TabsList className="flex-wrap gap-4 p-0 bg-transparent">
                    {FAQ_DATA.map((tab) => (
                      <TabsTrigger
                        key={tab.value}
                        value={tab.value}
                        className="bg-white rounded-lg text-base font-medium"
                      >
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {filteredFaqs.map((tab) => (
                    <TabsContent key={tab.value} value={tab.value}>
                      {tab.faqs.length > 0 ? (
                        <Accordion type="single" collapsible className="w-full">
                          {tab.faqs.map((faq) => (
                            <AccordionItem key={faq.key} value={faq.key}>
                              <AccordionTrigger>{faq.question}</AccordionTrigger>
                              <AccordionContent>{faq.answer}</AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <div className="text-gray-500 text-center py-6">
                          No matching FAQs in this category.
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            </div>
          </div>
        </section>

        <section aria-describedby="faq-form" className="py-9 sm:py-16">
          <div className="container">
            <div aria-describedby="main-wrapper">
              <FaqForm />
            </div>
          </div>
        </section>
      </div>
    </React.Fragment>
  );
};

export default FaqPage;
