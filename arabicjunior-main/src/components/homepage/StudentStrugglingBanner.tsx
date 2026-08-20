// import {
//   PriceOnly,
//   StudentStruggling,
//   StudentStrugglingVectorDot,
// } from "@/assets";
import Image from "next/image";
import React from "react";
import { images } from "@/constants/images";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

const StudentStrugglingBanner = () => {
  return (
    <React.Fragment>
      <section
        aria-label="student-struggling-banner-section"
        className="py-10 sm:py-14"
      >
        <div className="container">
          <div aria-describedby="image-wrapper" className="flex items-center justify-center">
            <Image
              src={images.imgArabicStudies}
              alt="arabic juniors"
              width={1640}
              height={624}
              priority
              className="rounded-2xl"
            />
          </div>

          <div
            aria-label="home-curriculam-button-wrapper"
            className="flex items-center justify-center gap-x-5 w-full pt-8"
          >
            <Button asChild className="w-full sm:max-w-max">
              <Link href="/register">
                Enroll Now
                <ArrowRightIcon className="text-xl text-white" />
              </Link>
            </Button>
          </div>

          {/* <div
            aria-label="student-struggling-banner-wrapper"
            className="bg-yellow-500 lg:pt-8 pt-0 md:pb-3 rounded-2xl relative z-10 overflow-hidden flex flex-col gap-y-4 lg:block"
          >
            <div
              aria-label="banner-content"
              className="w-full lg:max-w-[43.375rem] lg:ml-auto lg:mr-40 order-2"
            >
              <h3 className="text-black text-3xl sm:text-5xl font-extrabold leading-tight sm:leading-tight mb-14 text-center">
                Is Your Child{" "}
                <span className="text-orange-500">Struggling</span> with{" "}
                <span className="text-pink-500">Arabic Studies</span> in{" "}
                <span className="text-white"> School?</span>
              </h3>

              <div aria-label="features" className="max-w-[25.25rem] mx-auto text-center flex items-center flex-col justify-center gap-y-2">
                <h4 className="text-2xl md:text-4xl font-extrabold text-neutral-900 leading-tight">
                  Affordable for all Price
                </h4>
                <h6 className="text-2xl md:text-5xl lg:max-w-max lg:ml-auto font-extrabold text-white">
                  {" "}
                  Starting Just
                </h6>
              </div>
            </div>

            <div
              aria-label="student-struggling"
              className="static mx-auto order-1 lg:absolute left-0 bottom-0 -z-[11] max-w-[23.562rem]"
            >
              <Image
                src={StudentStruggling}
                alt="struggling students"
                width={730}
                height={630}
                priority
              />
            </div>

            
            <div aria-label="floating-wrapper" className="static order-3 self-end lg:absolute right-0 bottom-0 -z-10 max-w-52">
              <span
                aria-label="price-only"
                className="max-w-64"
              >
                <Image
                  src={PriceOnly}
                  alt="price only"
                  width={529}
                  height={331}
                  priority
                />
              </span>

              <span
                aria-label="student-struggling-vector-dot"
                className="absolute right-0 bottom-0 -z-[11] max-w-32 sm:max-w-64"
              >
                <Image
                  src={StudentStrugglingVectorDot}
                  alt="student struggling vector"
                  width={175}
                  height={194}
                  priority
                />
              </span>
            </div>
          </div> */}
        </div>
      </section>
    </React.Fragment>
  );
};

export default StudentStrugglingBanner;
