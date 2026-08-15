import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "../ui/button";
import { fetchContent } from "@/lib/contentApi";
import type { Teacher } from "@/types/Teacher";
import TeachersSliderCarousel from "./TeachersSliderCarousel";
import Reveal from "../Reveal";

const TeachersSlider = async () => {
  // The homepage shows a highlight reel, not the full roster — which teachers
  // appear here is a per-teacher switch in the admin screen.
  const teachers = await fetchContent<Teacher>("/teachers?homepage=true");

  return (
    <React.Fragment>
      <section
        aria-label="teacher-slider-section-home"
        className="py-10 sm:py-16 bg-gradient-to-r from-[#FF60A8] from-5% via-[#FB6238] via-50% to-[#F5AE14] to-100%"
      >
        <div className="container">
          <div aria-label="teachers-slider-wrapper">
            <Reveal as="h3" variant="up" className="text-white text-4xl leading-tight sm:text-6xl sm:leading-tight font-bold text-center mb-14">
              UAE Experienced Teachers
            </Reveal>

            {teachers.length > 0 && (
              <Reveal variant="scale" delay={120}>
                <TeachersSliderCarousel teachers={teachers} />
              </Reveal>
            )}
          </div>

          <Reveal
            variant="up"
            aria-label="home-curriculam-button-wrapper"
            className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-5 w-full pt-12"
          >
            <Button
              asChild
              className="w-full sm:max-w-max bg-white text-orange-500 hover:bg-white hover-shine"
            >
              <Link href="/register">Meet a Tutor</Link>
            </Button>

            {/* The slider only carries the teachers flagged for the homepage,
                so there is always more to see on the full roster page. */}
            <Button
              asChild
              variant="outline"
              className="w-full sm:max-w-max bg-transparent border-white text-white hover:bg-white hover:text-orange-500"
            >
              <Link href="/our-teachers">
                View All Teachers
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </React.Fragment>
  );
};

export default TeachersSlider;
