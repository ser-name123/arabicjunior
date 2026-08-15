"use client";
import { CurricolumnLeft } from "@/assets";
import Image from "next/image";
import React, { useState } from "react";
import {
  KgClassStudentIcon,
  NativeArabicUserIcon,
  NonArabUserIcon,
} from "./svgIcons";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRightIcon, Plus, Minus, BookOpenCheck, DollarSign } from "lucide-react";

const ArabicCurriculumn = () => {
  const [expandedItems, setExpandedItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setExpandedItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const curriculumItems = [
    {
      icon: <NativeArabicUserIcon className="text-3xl text-[#0062FC]" />,
      bgColor: "bg-[#F4F5F7]",
      title: "Online Arabic Tuition Aligned with UAE MOE Standards",
      description: "We specialize in delivering online Arabic tuition aligned with the UAE Ministry of Education (MOE) standards. Our curriculum-based approach ensures students meet school learning objectives while strengthening their understanding of Arabic through structured and guided online lessons."
    },
    {
      icon: <NonArabUserIcon className="text-3xl text-yellow-500" />,
      bgColor: "bg-[#F4F5F7]",
      title: "Comprehensive Arabic Language Skills Development",
      description: "Our online Arabic language classes focus on developing all core skills, including reading, writing, speaking, listening, and grammar. Lessons are carefully designed to help students improve fluency and build a strong foundation in the Arabic language at every level."
    },
    {
      icon: <DollarSign className="text-3xl text-green-500" />,
      bgColor: "bg-[#F4F5F7]",
      title: "Affordable Arabic Tuition Online in the UAE",
      description: "At Arabic Juniors, we believe quality education should be accessible to everyone. Our affordable online Arabic tuition online in the UAE allows students to learn Arabic from the comfort of their homes while receiving personalized attention. Flexible scheduling and interactive lessons make our online classes ideal for busy families and working parents."
    },
    {
      icon: <BookOpenCheck className="text-3xl text-pink-500" />,
      bgColor: "bg-[#F4F5F7]",
      title: "Arabic Language Classes for UAE School Students",
      description: "We offer structured online Arabic language classes for beginners and advanced learners, with all School curriculum support for CBSE, British, IB, American, and MOE curricula. Our lessons focus on reading, writing, speaking, grammar, Quranic Arabic, and conversational Arabic, helping students build confidence and long-term fluency."
    }
  ];

  return (
    <React.Fragment>
      <section
        aria-label="arabic-curricolumn-section"
        className="py-10 sm:py-16"
      >
        <div className="container">
          <div
            aria-label="arabic-curricolumn-wrapper"
            className="flex items-center gap-x-16 flex-col gap-y-10 lg:flex-row"
          >
            <div
              aria-label="arabic-curricolumn-left"
              className="max-w-[26.75rem] xl:max-w-[30rem] mx-auto lg:mx-0 flex-shrink-0"
            >
              <Image
                src={CurricolumnLeft}
                width={920}
                height={1220}
                priority
                alt="Experience in UAE School Arabic Curriculum"
                className="w-full h-auto"
              />
            </div>

            <div aria-label="arabic-curricolumn-right" className="flex-1 min-w-0">
              <h3 className="text-neutral-900 text-3xl sm:text-4xl xl:text-5xl font-bold leading-tight mb-6">
                Experience in UAE School{" "}
                <span className="text-orange-500">Arabic Curriculum</span>
              </h3>

              <p className="text-neutral-700 font-normal text-base sm:text-lg xl:text-xl mb-8">
                Arabic Juniors provides expert online Arabic tuition in Dubai and
                across the UAE. Our online Arabic classes in the UAE support school
                curricula while building strong reading, writing, and speaking skills.  
              </p>

              <ul
                aria-label="arabic-curricolumn-lists"
                className="flex flex-col gap-y-4 mb-12"
              >
                {curriculumItems.map((item, index) => (
                  <li
                    key={index}
                    aria-label="curricolumn-list-item"
                    className="bg-white p-5 xl:p-6 rounded-2xl border border-neutral-100 transition-shadow ease-in-out duration-300 hover:shadow-md"
                  >
                    <div
                      className="flex items-center gap-x-6 xl:gap-x-8 cursor-pointer"
                      onClick={() => toggleItem(index)}
                    >
                      <span
                        aria-label="icon-wrapper"
                        className={`flex-grow-0 flex-shrink-0 basis-auto p-4 xl:p-5 rounded-xl ${item.bgColor}`}
                      >
                        {item.icon}
                      </span>
                      <div className="flex flex-col gap-y-2 flex-1 min-w-0">
                        <h4 className="text-lg sm:text-xl xl:text-2xl font-semibold text-neutral-900 leading-tight">
                          {item.title}
                        </h4>
                      </div>
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors">
                        {expandedItems.includes(index) ? (
                          <Minus className="w-4 h-4 xl:w-5 xl:h-5 text-neutral-600" />
                        ) : (
                          <Plus className="w-4 h-4 xl:w-5 xl:h-5 text-neutral-600" />
                        )}
                      </div>
                    </div>
                    
                    {expandedItems.includes(index) && (
                      <div className="mt-5 xl:mt-6 pl-16 xl:pl-20 transition-all duration-200 ease-in-out">
                        <p className="text-base sm:text-lg xl:text-xl font-normal text-neutral-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>

              <div
                aria-label="home-curriculam-button-wrapper"
                className="flex items-center justify-center gap-x-5 w-full"
              >
                <Button asChild className="w-full sm:max-w-max text-base xl:text-lg px-6 xl:px-8 py-3 xl:py-4">
                  <Link href="/register">
                    Book Your Free Trial
                    <ArrowRightIcon className="text-xl xl:text-2xl text-white ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default ArabicCurriculumn;