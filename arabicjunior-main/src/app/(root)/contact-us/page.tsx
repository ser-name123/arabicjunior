import React from "react";
import ContactForm from "./components/ContactForm";
import ContactInfo from "./components/ContactInfo";
import {
  GraduationCap,
  BookOpen,
  CalendarCheck,
  Home,
  ClipboardList,
  Award,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const ContactUsPage = () => {
  return (
    <React.Fragment>
      <section
        aria-label="contact-us-page"
        className="relative z-[1] before:absolute before:h-56 before:sm:h-96 before:w-full before:bg-gradient-to-r before:from-pink-500 before:from-5% before:via-orange-500 before:via-50% before:to-yellow-500 before:to-100% before:-z-[1]"
      >
        <div className="container pt-10 sm:pt-12 md:pt-20">
          <div
            aria-label="contact-us-wrapper"
            className="p-5 sm:p-10 md:p-12 rounded-xl bg-white"
          >
            {/* Page Title */}
            <h1
              aria-label="title"
              className="text-3xl font-bold text-neutral-800 text-center mb-4 sm:text-4xl md:text-5xl lg:mb-5"
            >
              Get In Touch
            </h1>

            {/* Short Description */}
            <p
              aria-label="short-description"
              className="text-neutral-700 font-normal text-sm text-center mb-8 max-w-[477px] mx-auto sm:text-lg lg:mb-14"
            >
              Looking for trusted Arabic tuition for kids near me? Reach out today
              to connect with expert tutors.
            </p>

            {/* Form + Contact Info */}
            <div
              aria-label="wrapper-main"
              className="w-full flex flex-col lg:flex-row gap-x-10 lg:items-center lg:justify-between"
            >
              <div
                aria-label="form-wrapper-main"
                className="bg-[#FAF8F8] w-full p-5 rounded-2xl mb-9 max-w-screen-sm lg:mb-0 lg:order-2 xl:py-10 xl:px-16"
              >
                <ContactForm />
              </div>

              <ContactInfo />
            </div>

            {/* SEO + WHY CHOOSE US SECTION */}
            <div className="mt-20 bg-light-green-300 rounded-3xl px-6 py-10 sm:px-10 sm:py-14">
              <div className="text-center mb-10">
                <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-3">
                  Arabic Tuition for Kids Near Me – Expert Local Arabic Classes
                </h2>
                <p className="text-neutral-600 text-sm sm:text-base max-w-3xl mx-auto">
                 Looking for Online Arabic Tuition for Kids that's engaging and trusted by parents? Arabic Juniors offers expert Online Arabic Tuition, making it easy for families searching for Arabic tuition near me to access quality learning from anywhere.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                <div className="flex gap-4">
                  <GraduationCap className="w-7 h-7 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                      Qualified Arabic Tutors
                    </h3>
                    <p className="text-sm text-neutral-600">
                      We deliver expert Arabic tuition for kids
                      with a focus on reading, writing, and speaking skills using
                      proven and child-friendly teaching methods.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <BookOpen className="w-7 h-7 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                      Engaging Learning Experience
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Engaging, child-friendly lessons are designed to build confidence and interest, making Arabic learning simple, enjoyable, and effective at every stage.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <CalendarCheck className="w-7 h-7 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                      Flexible Class Scheduling
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Our online Arabic tuition offers flexible scheduling, allowing each child to learn at a comfortable pace while fitting smoothly into their daily routine.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Home className="w-7 h-7 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                      Online Arabic Tuition
                    </h3>
                    <p className="text-sm text-neutral-600">
                      Personalized Arabic tuition classes delivered online ensure focused one-on-one attention, helping children make steady and confident progress.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <ClipboardList className="w-7 h-7 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                      CBSE Arabic Tuition Support
                    </h3>
                    <p className="text-sm text-neutral-600">
                      We specialize in Arabic tuition classes for CBSE near me,
                      helping students understand syllabus, complete homework,
                      and prepare for exams.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Award className="w-7 h-7 text-orange-500 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800 mb-1">
                      Strong Foundation in Arabic
                    </h3>
                    <p className="text-sm text-neutral-600">
                      With a supportive learning environment and proven teaching methods, Arabic Juniors helps children build a strong foundation in Arabic for success.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-neutral-800 mb-3">
                  Ready to start your child's Arabic learning journey?
                </h3>
                <p className="text-neutral-900 text-lg font-normal mb-6">
                  Book a free trial lesson today
                </p>
                
                <div
                  aria-label="book-free-trial"
                  className="flex items-center justify-center flex-col"
                >
                  <Button asChild className="md:text-base max-w-max w-full">
                    <Link href="/register">
                      Book Free Trial
                      <ArrowUpRight className="w-4 h-4 flex-shrink-0 flex-grow-0 basis-auto" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
            {/* END SEO SECTION */}
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default ContactUsPage;