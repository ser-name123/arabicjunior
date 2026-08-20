"use client";
import { CurricolumnLeft } from "@/assets";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRightIcon, Plus, Minus } from "lucide-react";
import Reveal from "../Reveal";
import { CURRICULUM_ITEMS } from "./data/curriculum";

const ArabicCurriculumn = () => {
  // Only one panel is open at a time; opening another closes the previous one.
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggleItem = (key: string) =>
    setOpenKey((current) => (current === key ? null : key));

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
            <Reveal
              variant="left"
              aria-label="arabic-curricolumn-left"
              className="max-w-[26.75rem] xl:max-w-[30rem] mx-auto lg:mx-0 flex-shrink-0"
            >
              <Image
                src={CurricolumnLeft}
                width={920}
                height={1220}
                priority
                alt="Experience in UAE School Arabic Curriculum"
                className="w-full h-auto transition-transform duration-700 ease-out hover:scale-105 hover:rotate-1"
              />
            </Reveal>

            <div aria-label="arabic-curricolumn-right" className="flex-1 min-w-0">
              <Reveal as="h3" variant="up" className="text-neutral-900 text-3xl sm:text-4xl xl:text-5xl font-bold leading-tight mb-6">
                Experience in UAE School{" "}
                <span className="text-orange-500">Arabic Curriculum</span>
              </Reveal>

              <Reveal as="p" variant="up" delay={100} className="text-neutral-700 font-normal text-base sm:text-lg xl:text-xl mb-8">
                Arabic Juniors provides expert online Arabic tuition in Dubai and
                across the UAE. Our online Arabic classes in the UAE support school
                curricula while building strong reading, writing, and speaking skills.
              </Reveal>

              <ul
                aria-label="arabic-curricolumn-lists"
                className="flex flex-col gap-y-4 mb-12"
              >
                {CURRICULUM_ITEMS.map((item, index) => {
                  const isOpen = openKey === item.key;
                  const Icon = item.icon;
                  const panelId = `curriculum-panel-${item.key}`;

                  return (
                    <Reveal
                      as="li"
                      key={item.key}
                      variant="up"
                      index={index}
                      step={90}
                      aria-label="curricolumn-list-item"
                      className="bg-white p-5 xl:p-6 rounded-2xl border border-neutral-100 hover-lift"
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(item.key)}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        className="w-full flex items-center gap-x-6 xl:gap-x-8 text-left"
                      >
                        <span
                          aria-label="icon-wrapper"
                          className={`flex-grow-0 flex-shrink-0 basis-auto p-4 xl:p-5 rounded-xl ${item.iconBgClassName}`}
                        >
                          <Icon className={item.iconClassName} />
                        </span>
                        <div className="flex flex-col gap-y-2 flex-1 min-w-0">
                          <h4 className="text-lg sm:text-xl xl:text-2xl font-semibold text-neutral-900 leading-tight">
                            {item.title}
                          </h4>
                        </div>
                        <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 xl:w-9 xl:h-9 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors">
                          {isOpen ? (
                            <Minus className="w-4 h-4 xl:w-5 xl:h-5 text-neutral-600" />
                          ) : (
                            <Plus className="w-4 h-4 xl:w-5 xl:h-5 text-neutral-600" />
                          )}
                        </span>
                      </button>

                      {/* The 0fr -> 1fr grid row animates to the panel's natural height
                          without hard-coding one, and keeps the copy in the DOM so it
                          stays crawlable while collapsed. */}
                      <div
                        id={panelId}
                        className={`grid transition-all duration-300 ease-in-out ${
                          isOpen
                            ? "grid-rows-[1fr] opacity-100 mt-5 xl:mt-6"
                            : "grid-rows-[0fr] opacity-0 mt-0"
                        }`}
                      >
                        <div className="overflow-hidden pl-16 xl:pl-20">
                          <p className="text-sm sm:text-[0.95rem] xl:text-base font-normal text-neutral-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </Reveal>
                  );
                })}
              </ul>

              <Reveal
                variant="up"
                aria-label="home-curriculam-button-wrapper"
                className="flex items-center justify-center gap-x-5 w-full"
              >
                <Button asChild className="w-full sm:max-w-max text-base xl:text-lg px-6 xl:px-8 py-3 xl:py-4 hover-shine">
                  <Link href="/register">
                    Book Your Free Trial
                    <ArrowRightIcon className="text-xl xl:text-2xl text-white ml-2" />
                  </Link>
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default ArabicCurriculumn;
