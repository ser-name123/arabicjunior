import { images } from "@/constants/images";
import Image from "next/image";
import React from "react";
import NewsletterForm from "./NewsletterForm";

const Newsletter = () => {
  return (
    <React.Fragment>
      <section aria-describedby="newsletter" className="py-16">
        <div className="container">
          <div
            aria-describedby="main-wrapper"
            className="bg-[#FFA0CB] rounded-3xl relative"
          >
            <div
              aria-describedby="content-wrapper"
              className="flex items-center gap-x-20 justify-center flex-col gap-y-8 md:flex-row"
            >
              <div aria-describedby="left-column" className="flex-1">
                <div
                  aria-describedby="left-content-wrapper"
                  className="px-4 pt-7 md:pl-16 md:py-4"
                >
                  <h3 className="text-neutral-900 text-3xl text-center md:text-left md:text-[2.75rem] leading-tight font-bold mb-2">
                    Start your journey today
                  </h3>
                  <p className="text-neutral-800 text-xl text-center md:text-left md:text-2xl font-semibold mb-8">
                    Fuel Your Day with Inspiring Emails!
                  </p>

                  {/* <div aria-describedby="btn-wrapper" className="flex items-center justify-center md:justify-start md:items-start">
                    <Button asChild className="text-sm md:text-sm lg:text-sm">
                      <Link href="#">
                        Get started Now
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </div> */}

                  <NewsletterForm />
                </div>
              </div>

              <div
                aria-describedby="right-column"
                className="flex-shrink-0 flex-grow-0 basis-auto lg:pr-40 lg:pt-9"
              >
                <div
                  aria-describedby="image-wrapper"
                  className="max-w-72 flex items-center w-full"
                >
                  <Image
                    src={images.imgFemaleTeacher}
                    alt="arabic juniors female teachers"
                    width={2128}
                    height={4096}
                    priority
                  />
                </div>
              </div>
            </div>

            {/* FLOATING ELEMENTS */}
            <span
              aria-describedby="newsletter-tie"
              className="absolute top-0 right-0 z-[2] select-none hidden lg:block"
            >
              <Image
                src={images.svgTie}
                alt="arabic juniors tie"
                width={203}
                height={180}
                priority
              />
            </span>

            <span
              aria-describedby="color-swatch"
              className="absolute z-[2] top-1/2 -translate-y-1/2 right-10 hidden lg:block"
            >
              <Image
                src={images.svgColorSwatch}
                width={70}
                height={71}
                alt="arabic juniors color swatch svg"
              />
            </span>

            <span
              aria-describedby="quran-open"
              className="absolute bottom-9 left-1/2 -translate-x-1/2 z-[2] hidden lg:block"
            >
              <Image
                alt="arabic juniors quran open svg"
                src={images.svgQuranOpen}
                width={123}
                height={86}
                priority
              />
            </span>

            <span
              aria-describedby="newsletter-union"
              className="absolute z-[2] bottom-0 left-6 hidden lg:block"
            >
              <Image
                src={images.svgUnionNewsletter}
                alt="arabic juniors union svg"
                width={197}
                height={80}
                priority
              />
            </span>

            <span
              aria-describedby="newsletter-scale"
              className="absolute top-8 left-16 z-[2] hidden lg:block"
            >
              <Image
                src={images.svgNewsletterScale}
                alt="scale"
                width={84}
                height={62}
                priority
              />
            </span>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default Newsletter;
