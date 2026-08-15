"use client";

import React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import type { Teacher } from "@/types/Teacher";

/**
 * The interactive half of the homepage teachers slider. Its parent is a server
 * component that fetches the roster, so the names are in the server-rendered
 * HTML. Autoplay is instantiated here because an embla plugin is a live object
 * and cannot be passed across the server/client boundary.
 */
const TeachersSliderCarousel = ({ teachers }: { teachers: Teacher[] }) => (
  <Carousel
    opts={{ align: "start", loop: teachers.length > 4 }}
    plugins={[Autoplay({ delay: 2000, stopOnMouseEnter: true })]}
    className="w-full max-w-[680px] mx-auto"
  >
    <CarouselContent>
      {teachers.map((teacher) => (
        <CarouselItem
          key={teacher._id}
          className="basis-full md:basis-1/2 lg:basis-1/4"
        >
          <div className="flex flex-col items-center justify-center">
            <div aria-label="teacher-image-wrapper" className="max-w-32 mb-6">
              <Image
                src={teacher.image}
                width={256}
                height={256}
                alt={`${teacher.name} — Arabic Juniors teacher`}
                className="rounded-full aspect-square object-cover"
              />
            </div>
            <h4 className="text-lg font-semibold text-white text-center mb-1">
              {teacher.name}
            </h4>
            <p className="text-sm font-normal text-white/95 text-center">
              {teacher.profession}
            </p>
          </div>
        </CarouselItem>
      ))}
    </CarouselContent>
    <CarouselPrevious />
    <CarouselNext />
  </Carousel>
);

export default TeachersSliderCarousel;
