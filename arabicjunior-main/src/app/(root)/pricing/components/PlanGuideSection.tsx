import { Button } from "@/components/ui/button";
import { images } from "@/constants/images";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

const PlanGuideSection = () => {
  return (
    <section aria-describedby="plan-guide-section" className="py-16">
      <div className="container">
        <div
          aria-describedby="content-wrapper"
          className="py-14 bg-light-green-300 rounded-3xl flex flex-col justify-center items-center relative z-[1] overflow-hidden"
        >
          <h3 className="text-3xl font-bold text-neutral-800 text-center mb-5">
            Not sure which plan is right fo you?
          </h3>
          <p className="text-neutral-900 text-lg font-normal text-center">
            Start with free lesson
          </p>

          <div
            aria-label="create-study-plan"
            className="flex items-center justify-center flex-col mt-8"
          >
            <Button asChild className="md:text-base max-w-max w-full">
              <Link href="/register">
                Create Your Study Plan
                <ArrowUpRight className="w-4 h-4 flex-shrink-0 flex-grow-0 basis-auto" />
              </Link>
            </Button>
          </div>

          {/* FLOATING ELEMENTS */}
          <span
            aria-describedby="circle-vector"
            className="absolute w-full top-0 left-0 -z-[1] flex items-center"
          >
            <Image
              src={images.svgCircleVector}
              width={1030}
              height={256}
              alt="circle svg"
              priority
              className="w-full"
            />
          </span>

          <span
            aria-describedby="dot-vector"
            className="absolute -z-[1] top-0 left-0 flex items-center"
          >
            <Image
              src={images.svgDotVector}
              height={129}
              width={182}
              priority
              alt="dot svg"
              className="w-full"
            />
          </span>
        </div>
      </div>
    </section>
  );
};

export default PlanGuideSection;
