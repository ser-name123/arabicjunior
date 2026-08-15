import React from "react";
import TeacherCard from "./components/TeacherCard";
import { FaqTypes } from "@/types";
import { FaqSection } from "@/components/homepage";
import { fetchContent } from "@/lib/contentApi";
import type { Teacher } from "@/types/Teacher";
import Reveal from "@/components/Reveal";

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
  const teachers = await fetchContent<Teacher>("/teachers");

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
            <h1 className="text-4xl leading-snug md:text-5xl font-bold text-white text-center">
              Meet the Expert Teachers
            </h1>
            <p className="text-lg md:text-2xl font-normal text-white text-center">
              Trusted Private Arabic Tutor for UAE Students Excellence
            </p>
          </Reveal>
        </div>
      </section>

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
                className="mb-12 flex items-center justify-center"
              >
                <h3 className=" text-neutral-800 text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl lg:font-bold">
                  Meet our dynamic team or tutors
                </h3>
              </Reveal>

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

      <FaqSection faqData={FAQ_DATA} />
    </React.Fragment>
  );
};

export default TeachersPage;
