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

const OurTeacher = () => {
  return (
    <React.Fragment>
      <section
        aria-label="our-teacher-section"
        className="bg-white py-5 sm:py-16"
      >
        <div className="container">
          <div aria-label="our-teacher-wrapper">
            <div
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
            </div>

            <div aria-label="our-teacher-carousel" className="mb-10">
              <Carousel className="w-full">
                <CarouselContent>
                  {OUR_TEACHERS.map((teacher) => (
                    <React.Fragment key={teacher.key}>
                      <CarouselItem className="basis-full md:basis-1/2 lg:basis-1/3">
                        <div
                          aria-label="image-wrapper"
                          className="w-full h-80 flex bg-yellow-200 pt-5 rounded-lg mb-5"
                        >
                          <Image
                            src={teacher.image.url}
                            alt="teacher photo"
                            width={teacher.image.width}
                            height={teacher.image.height}
                            priority
                            className="h-full object-contain object-center"
                          />
                        </div>
                        <div aria-label="card-boyd" className="px-5">
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
                    </React.Fragment>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="bg-orange-500 text-white hover:bg-orange-600" />
                <CarouselNext className="bg-orange-500 text-white hover:bg-orange-600" />
              </Carousel>
            </div>

            <div
              aria-describedby="btn"
              className="flex items-center justify-center"
            >
              <Button asChild>
                <Link href={"/register"}>
                  Connect with your Mentor now!
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default OurTeacher;

const OUR_TEACHERS = [
  {
    key: "josh-knight",
    name: "Eptehal Elgendy",
    image: {
      width: 921,
      height: 953,
      url: "https://res.cloudinary.com/dromjx3rx/image/upload/v1737991303/our-teacher-3_opctfy.png",
    },
    shortDescription:
      "Experienced Arabic teacher helping students speak, read, and write confidently—aligned with UAE standards.",
  },
  {
    key: "noah-pierre",
    name: "Abdullah Soliman",
    image: {
      width: 784,
      height: 918,
      url: "/noah-pierr.png",
    },
    shortDescription:
      "Experienced Arabic tutor helping students excel in speaking, writing, and reading with personalized lessons.",
  },
  {
    key: "koray-ikumus",
    name: "Rafat Sayed",
    image: {
      width: 699,
      height: 897,
      url: "/female-teacher.png",
    },
    shortDescription:
      "Skilled Arabic teacher dedicated to developing students’ language skills, aligned with UAE school standards.",
  },

  {
    key: "Sarah-Johnson",
    name: "Hassan Ibrahim",
    image: {
      width: 921,
      height: 953,
      url: "https://res.cloudinary.com/dromjx3rx/image/upload/v1737991306/our-teacher-1_zp1qar.png",
    },
    shortDescription:
      "Building strong mathematical foundations with care and precision. Focuses on Physics, Chemistry, and hands-on experiments.",
  },
];
