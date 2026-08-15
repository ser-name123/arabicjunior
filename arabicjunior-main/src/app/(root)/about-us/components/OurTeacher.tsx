import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ArrowUpRight } from "lucide-react";

import { fetchContent } from "@/lib/contentApi";
import type { Teacher } from "@/types/Teacher";
import Reveal from "@/components/Reveal";

const OurTeacher = async () => {
  const teachers = await fetchContent<Teacher>("/teachers");

  if (teachers.length === 0) return null;

  return (
    <React.Fragment>
      <section
        aria-label="our-teacher-section"
        className="bg-white py-5 sm:py-16"
      >
        <div className="container">
          <div aria-label="our-teacher-wrapper">
            <Reveal
              variant="up"
              aria-label="our-teacher-content-top"
              className="w-full flex flex-col justify-center  items-center mb-10"
            >
              <h5
                aria-label="subtitle"
                className="text-pink-500 text-base font-semibold text-center mb-5"
              >
                Our Teacher
              </h5>
              <h3
                aria-label="section-title"
                className="text-3xl mb-3 sm:text-5xl sm:leading-tight font-bold text-neutral-900 text-center sm:mb-6"
              >
                Discover our professional Mentors
              </h3>
              <p
                aria-label="description"
                className="text-sm text-center sm:text-base font-medium text-neutral-500"
              >
                Let our expert mentors guide you to Arabic success!
              </p>
            </Reveal>

            <Reveal variant="rise" delay={120} aria-label="our-teacher-carousel" className="mb-10">
              <Carousel className="w-full">
                <CarouselContent>
                  {teachers.map((teacher) => (
                    <CarouselItem
                      key={teacher._id}
                      className="basis-full md:basis-1/2 lg:basis-1/3"
                    >
                      <div
                        aria-label="image-wrapper"
                        className="w-full h-80 flex bg-yellow-200 pt-5 rounded-lg mb-5"
                      >
                        {/* These cards are tall, so a full-length portrait is
                            used when the admin has supplied one; a square
                            headshot is the fallback. */}
                        <Image
                          src={teacher.portrait || teacher.image}
                          alt={`${teacher.name} — Arabic Juniors teacher`}
                          width={921}
                          height={953}
                          className="h-full w-full object-contain object-center"
                        />
                      </div>
                      <div aria-label="card-body" className="px-5">
                        <h3
                          aria-label="teacher-name"
                          className="text-xl font-semibold text-neutral-800 text-center mb-2"
                        >
                          {teacher.name}
                        </h3>
                        <p
                          aria-label="short-description"
                          className="text-neutral-600 text-sm font-normal text-center"
                        >
                          {teacher.shortDescription}
                        </p>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="bg-orange-500 text-white hover:bg-orange-600" />
                <CarouselNext className="bg-orange-500 text-white hover:bg-orange-600" />
              </Carousel>
            </Reveal>

            <Reveal
              variant="up"
              aria-describedby="btn"
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Button asChild>
                <Link href={"/register"}>Connect with your Mentor now!</Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/our-teachers">
                  View All Teachers
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Button>
            </Reveal>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default OurTeacher;
