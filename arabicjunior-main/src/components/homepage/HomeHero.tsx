import {
  Ahlaa,
  AlArabia,
  ArabicKhaap,
  LearningKidsRound,
  UaeLineVector,
  VectorDirectionLeft,
  VectorDirectionRight,
  YoungBoyAttendingSchool,
} from "@/assets";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { ArrowRightIcon } from "./svgIcons";
import Link from "next/link";
import Reveal from "../Reveal";

const HomeHero = () => {
  return (
    <React.Fragment>
      <section
        aria-label="home-hero-section"
        className="pt-10 pb-10 sm:pb-16 lg:py-20 overflow-hidden relative before:absolute before:h-full before:w-[378px] before:bg-[rgba(255,96,168,0.48)] before:blur-[350px] before:top-0 before:-left-32 after:absolute after:h-full after:w-72 after:bg-[rgba(245,174,20,0.48)] after:-right-44 after:top-0 after:blur-[400px]"
      >
        <div className="container">
          <div
            aria-label="home-hero-wrapper"
            className="max-w-[910px] mx-auto flex flex-col items-center justify-center relative z-10"
          >
            {/* The hero is above the fold, so its parts are given explicit
                delays and come in as a short sequence: headline, supporting
                line, then the call to action. */}
            <Reveal
              as="h1"
              variant="rise"
              className="text-4xl gap-y-1 sm:gap-y-2 sm:text-5xl md:text-7xl font-bold text-neutral-800 text-center flex items-center flex-wrap justify-center gap-x-5 mb-14"
            >
              <span>Online</span>
              <Image
                src={
                  "https://res.cloudinary.com/dromjx3rx/image/upload/v1737470053/Group_1_gwbqo5.png"
                }
                width={408}
                height={468}
                priority
                alt="boy with folder standing"
                className="w-9 sm:w-16 md:w-24 object-cover object-center"
              />
              <span className="text-orange-500">Arabic Tuition</span>{" "}
              <span>for</span>{" "}
              <span className="relative z-10">
                UAE
                <Image
                  src={UaeLineVector}
                  width={188}
                  height={44}
                  priority
                  alt="UAE students"
                  className="absolute -bottom-[30%] right-0 -z-10 min-w-[120%]"
                />
              </span>{" "}
              <span className="text-yellow-500">Students</span>{" "}
              <Image
                src={YoungBoyAttendingSchool}
                alt="boy with folder standing"
                width={248}
                height={205}
                priority
                className="w-12 sm:w-20 md:w-32"
              />{" "}
            </Reveal>

            <Reveal
              as="p"
              variant="up"
              delay={140}
              className="text-neutral-700 text-base sm:text-lg md:text-2xl font-normal max-w-screen-md mx-auto text-center mb-12"
            >
              Arabic Made Easy with our Arabic Tuition Online, Fun and Interactive lessons to support your child&apos;s learning journey!
            </Reveal>

            <Reveal
              variant="up"
              delay={260}
              aria-label="home-hero-button-wrapper"
              className="flex items-center justify-center gap-x-5 w-full"
            >
              <Button asChild className="w-full sm:max-w-max hover-shine">
                <Link href="/register">
                  Get started
                  <ArrowRightIcon className="text-xl text-white" />
                </Link>
              </Button>
            </Reveal>

            {/* Floating elements */}
            <span
              aria-label="al-arabia"
              className="absolute -right-[20%] top-0 -z-10 hidden md:block animate-float-slow"
            >
              <Image
                src={AlArabia}
                alt="al arabia"
                width={169}
                height={113}
                priority
              />
            </span>
            <span
              aria-label="vector-dir-right"
              className="absolute -right-[8%] top-[30%] -z-10 hidden md:block animate-float-slow"
              style={{ animationDelay: '0.4s' }}
            >
              <Image
                src={VectorDirectionRight}
                alt="vector direction right"
                width={124}
                height={69}
                priority
              />
            </span>

            <span
              aria-label="learning-round-sign"
              className="absolute -right-[8%] bottom-0 -z-10 hidden md:block"
            >
              <Image
                src={LearningKidsRound}
                alt="learning kids round sign"
                width={109}
                height={109}
                priority
                className="animate-spin-slow"
              />
            </span>

            <span
              aria-label="arabic-letter-khaap"
              className="absolute -left-[5%] top-[32%] -z-10 hidden md:block animate-float-slow"
              style={{ animationDelay: '1s' }}
            >
              <Image
                src={ArabicKhaap}
                alt="khaap letter of arabic"
                width={54}
                height={54}
                priority
              />
            </span>

            <span
              aria-label="vector-direction-left"
              className="absolute -left-[17%] top-[18%] -z-10 hidden md:block animate-float-slow"
              style={{ animationDelay: '1.2s' }}
            >
              <Image
                src={VectorDirectionLeft}
                alt="vector direction left"
                width={100}
                height={93}
                priority
              />
            </span>

            <span
              aria-label="arabic-lang"
              className="absolute -left-[18%] bottom-[5%] -z-10 hidden md:block animate-float-slow"
              style={{ animationDelay: '2s' }}
            >
              <Image
                src={Ahlaa}
                alt="arabic language"
                width={324}
                height={182}
                priority
              />
            </span>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default HomeHero;
