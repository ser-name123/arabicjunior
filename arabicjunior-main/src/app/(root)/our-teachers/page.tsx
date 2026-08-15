import React from "react";
import TeacherCard from "./components/TeacherCard";
import { FaqTypes, TeachersTypes } from "@/types";
import { FaqSection } from "@/components/homepage";

const TEACHERS_DATA: TeachersTypes[] = [
  {
    key: "1",
    teacherName: "Rafat Sayed",
    profession: "Arabic Teacher",
    image: {
      link: "/first-teacher.png",
      width: 256,
      height: 256,
      alt: "Teacher Photo",
    },
    detail: {
      grade: "1-10",
      experience: "5+ Years exp.",
      education: "B.Ed., Master’s in Arabic study",
      subject: "Arabic",
      shortDescription:
        "Skilled Arabic teacher with over 5 years of experience teaching Grades 1–10 across UAE school curricula. Expert in delivering engaging online lessons in grammar, reading, and writing using interactive tools.",
    },
  },
  {
    key: "2",
    teacherName: "Mohommad Taha",
    profession: "Arabic Teacher",
    image: {
      link: "/second-teacher.png",
      width: 256,
      height: 256,
      alt: "Teacher Photo",
    },
    detail: {
      grade: "1-10",
      experience: "3+ Years exp.",
      education: "Master’s in Arabic study",
      subject: "Arabic",
      shortDescription:
        "Qualified Arabic tutor with deep knowledge of UAE Ministry of Education standards. Successfully teaches students from primary to secondary level through effective and personalized online sessions.",
    },
  },
  {
    key: "3",
    teacherName: "Rawan Hossam",
    profession: "Arabic Teacher",
    image: {
      link: "/third-teacher.png",
      width: 256,
      height: 256,
      alt: "Teacher Photo",
    },
    detail: {
      grade: "1-10",
      experience: "8+ Years exp.",
      education: "Bachelor’s in Arabic study, B.Ed.",
      subject: "Arabic",
      shortDescription:
        "Experienced in teaching Arabic language to Grades 1–10 students, this teacher focuses on building strong language skills aligned with UAE school requirements. Specializes in one-to-one online support.",
    },
  },
  {
    key: "4",
    teacherName: "Samara Youssef",
    profession: "Arabic Teacher",
    image: {
      link: "/fourth-teacher.png",
      width: 256,
      height: 256,
      alt: "Teacher Photo",
    },
    detail: {
      grade: "1-10",
      experience: "2+ Years exp.",
      education: "Diploma in Arabic study",
      subject: "Arabic",
      shortDescription:
        "Certified Arabic educator with a proven record of helping school-aged learners excel in Arabic. Familiar with UAE curriculum structures and skilled in teaching both native and non-native Arabic students online.",
    },
  },
  {
    key: "5",
    teacherName: "Eptehal Elgendy",
    profession: "Arabic Teacher",
    image: {
      link: "/first-teacher.png",
      width: 256,
      height: 256,
      alt: "Teacher Photo",
    },
    detail: {
      grade: "1-10",
      experience: "6+ Years exp.",
      education: "Master’s in Arabic Study",
      subject: "Arabic",
      shortDescription:
        "Dedicated online Arabic teacher with experience teaching across British and MOE curriculum schools in the UAE. Tailors each session to meet the specific level and pace of each student from Grades 1–10.",
    },
  },
  {
    key: "6",
    teacherName: "Narmeen Saeed",
    profession: "Arabic Teacher",
    image: {
      link: "/third-teacher.png",
      width: 256,
      height: 256,
      alt: "Teacher Photo",
    },
    detail: {
      grade: "1-10",
      experience: "4+ Years exp.",
      education: "Master’s in Arabic Study",
      subject: "Arabic",
      shortDescription:
        "Native Arabic speaker with several years of online tutoring experience for UAE-based students. Focuses on improving academic performance in reading, comprehension, and written expression for all grade levels.",
    },
  },
];

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

const TeachersPage = () => {
  return (
    <React.Fragment>
      <section
        aria-describedby="teacher-page-hero"
        className="py-24 bg-gradient-to-r from-[-5%] from-[#FF60A8] via-50% via-[#FB6238] to-100% to-[#F5AE14]"
      >
        <div className="container">
          <div
            aria-describedby="content-wrapper"
            className="flex items-center justify-center flex-col gap-y-6"
          >
            <h1 className="text-4xl leading-snug md:text-5xl font-bold text-white text-center">
              Meet the Expert Teachers
            </h1>
            <p className="text-lg md:text-2xl font-normal text-white text-center">
              Trusted Private Arabic Tutor for UAE Students Excellence
            </p>
          </div>
        </div>
      </section>

      <section
        aria-describedby="all-teachers-section"
        className="bg-[#F3F7F4] py-20"
      >
        <div className="container">
          <div aria-describedby="main-wrapper">
            <div
              aria-describedby="title-wrapper"
              className="mb-12 flex items-center justify-center"
            >
              <h3 className=" text-neutral-800 text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl lg:font-bold">
                Meet our dynamic team or tutors
              </h3>
            </div>

            <div
              aria-describedby="teacher-card-wrapper"
              className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <TeacherCard teachersData={TEACHERS_DATA} />
            </div>
          </div>
        </div>
      </section>

      <FaqSection faqData={FAQ_DATA} />
    </React.Fragment>
  );
};

export default TeachersPage;
