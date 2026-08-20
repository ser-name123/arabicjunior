import { DeliverLeftImage } from "@/assets";
import Image from "next/image";
import React from "react";
import {
  ConceptualClarityIcon,
  MultilingualTeachersIcon,
  PersonalizeLearningIcon,
  PrivateTutoringIcon,
} from "./svgIcons";
import { Button } from "../ui/button";
import Link from "next/link";
import Reveal from "../Reveal";

const PROGRAMS_LIST = [
  {
    title: "Live 1-on-1 Private Tutoring",
    short_description: "Undivided attention for unmatched outcomes",
    icon: <PrivateTutoringIcon className="text-3xl text-[#0062FC]" />,
  },
  {
    title: "100% Personalized Learning",
    short_description: "Tailored lessons to fit each student’s needs",
    icon: <PersonalizeLearningIcon className="text-3xl text-[#EE2A52]" />,
  },
  {
    title: "Multilingual Teachers",
    short_description: "Learn in multiple languages for better clarity",
    icon: <MultilingualTeachersIcon className="text-3xl text-yellow-500" />,
  },
  {
    title: "Proven Success Strategies",
    short_description: "Proven methods for measurable progress",
    icon: <ConceptualClarityIcon className="text-3xl text-pink-500" />,
  },
];

const DeliverResult = () => {
  return (
    <React.Fragment>
      <section
        aria-label="deliver-result-section-home"
        className="py-10 sm:pt-14 sm:pb-16 bg-neutral-50"
      >
        <div className="container">
          <div aria-label="deliver-content">
            <Reveal as="h3" variant="up" className="text-3xl leading-tight sm:text-5xl sm:leading-tight font-bold text-black text-center mb-11">
              Programs designed to{" "}
              <span className="text-orange-500">Deliver Results</span>
            </Reveal>

            <div
              aria-label="deliver-result-wrapper"
              className="flex items-center gap-x-14 flex-col gap-y-9 lg:flex-row"
            >
              <Reveal
                variant="left"
                aria-label="deliver-left-column"
                className="max-w-80 xl:max-w-[34rem] mx-auto lg:mr-auto"
              >
                <Image
                  src={DeliverLeftImage}
                  width={1088}
                  height={1088}
                  alt="deliver result in juniors"
                  priority
                />
              </Reveal>

              <div aria-label="deliver-right-column" className="flex-1">
                <ul aria-label="result-lists" className="flex flex-col gap-y-5">
                  {PROGRAMS_LIST?.map((program, index) => (
                    <Reveal
                      as="li"
                      key={index}
                      variant="right"
                      index={index}
                      step={90}
                      aria-label="result-item"
                      className="bg-white p-4 rounded-2xl border border-neutral-100 flex items-center gap-x-9 hover-lift"
                    >
                      <span
                        aria-label="icon-wrapper"
                        className="flex-grow-0 flex-shrink-0 basis-auto p-5 rounded-xl bg-[#F4F5F7]"
                      >
                        {program.icon}
                      </span>
                      <div className="flex flex-col gap-y-3">
                        <h5 className="text-lg sm:text-2xl font-semibold text-neutral-900">
                          {program.title}
                        </h5>
                        <p className="text-base sm:text-xl font-normal text-neutral-600">
                          {program.short_description}
                        </p>
                      </div>
                    </Reveal>
                  ))}
                </ul>
                <Reveal
                  variant="up"
                  aria-label="home-curriculam-button-wrapper"
                  className="flex items-center justify-center gap-x-5 w-full pt-8"
                >
                  <Button asChild className="w-full sm:max-w-max hover-shine">
                    <Link href="/register">
                      Join Now
                    </Link>
                  </Button>
                </Reveal>
              </div>

            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default DeliverResult;
