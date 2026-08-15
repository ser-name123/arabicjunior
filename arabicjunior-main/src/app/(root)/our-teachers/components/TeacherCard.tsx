import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { images } from "@/constants/images";
import Image from "next/image";
import { TeachersTypes } from "@/types";

interface TeacherCardProps {
  teachersData: TeachersTypes[];
}

const TeacherCard: React.FC<TeacherCardProps> = ({ teachersData }) => {
  return (
    <React.Fragment>
      {teachersData.map((teacher) => (
        <div
          key={teacher.key}
          aria-describedby="teacher-card"
          className="bg-white rounded-2xl flex flex-col gap-y-4 items-center justify-center p-11 shadow-sm"
        >
          <div
            aria-describedby="image-wrapper"
            className="max-w-44 w-full rounded-full"
          >
            <Image
              src={teacher.image.link}
              width={teacher.image.width}
              height={teacher.image.height}
              alt={teacher.image.alt}
              className="w-full rounded-full object-cover aspect-square"
            />
          </div>

          <div
            aria-describedby="card-middle"
            className="flex items-center justify-center flex-col gap-y-2"
          >
            <h4
              aria-describedby="teacher-name"
              className="text-2xl font-medium text-neutral-800 text-center"
            >
              {teacher.teacherName}
            </h4>
            <p
              aria-describedby="profession"
              className="text-xl font-normal text-neutral-300 text-center"
            >
              {teacher.profession}
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant={"outline"} className="rounded-md max-w-max">
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-orange-500 rounded-xl border-orange-500 max-w-screen-md">
              {/* for screen reader */}
              <DialogTitle className="sr-only">All Teachers</DialogTitle>

              <div
                aria-describedby="teacher-details"
                className="flex items-start gap-x-10 flex-col gap-y-6 md:flex-row"
              >
                <div
                  aria-describedby="left-column"
                  className="flex-shrink-0 flex-grow-0 basis-auto"
                >
                  <div
                    aria-describedby="image-wrapper"
                    className="max-w-44 w-full rounded-full "
                  >
                    <Image
                      src={teacher.image.link}
                      width={teacher.image.width}
                      height={teacher.image.height}
                      alt={teacher.image.alt}
                      className="w-full rounded-full object-cover aspect-square"
                    />
                  </div>
                </div>

                <div
                  aria-describedby="right-column"
                  className="flex-1 relative"
                >
                  <div aria-describedby="details-wrapper" className="w-full">
                    <h4
                      aria-describedby="name"
                      className="text-3xl font-semibold text-white text-left mb-5"
                    >
                      {teacher.teacherName}
                    </h4>

                    <div
                      aria-describedby="lists"
                      className="grid grid-cols-2 items-center mb-6 max-w-max gap-x-7 gap-y-2"
                    >
                      <p className="text-lg font-normal text-white">Grade:</p>

                      <p className="text-lg font-normal text-white">
                        {teacher.detail.grade}
                      </p>

                      <p className="text-lg font-normal text-white">
                        Experience:
                      </p>

                      <p className="text-lg font-normal text-white">
                        {teacher.detail.experience}
                      </p>

                      <p className="text-lg font-normal text-white">
                        Education:
                      </p>
                      <p className="text-lg font-normal text-white">
                        {teacher.detail.education}
                      </p>

                      <p className="text-lg font-normal text-white">Subject:</p>
                      <p className="text-lg font-normal text-white">
                        {teacher.detail.subject}
                      </p>
                    </div>

                    <p
                      aria-describedby="description"
                      className="text-sm font-normal text-white"
                    >
                      {teacher.detail.shortDescription}
                    </p>
                  </div>

                  {/* FLOATING ELEMENTs */}
                  <div
                    aria-describedby="teacher-review"
                    className="top-0 right-2 absolute z-[1]"
                  >
                    <div
                      aria-describedby="content-wrapper"
                      className="flex items-center gap-x-2"
                    >
                      <p className="text-lg sm:text-2xl font-bold text-white">
                        4.9
                      </p>
                      <div
                        aria-describedby="star-wrapper"
                        className="flex items-center gap-x-2"
                      >
                        <Star className="w-4 sm:w-6 text-white fill-white" />
                        <Star className="w-4 sm:w-6 text-white fill-white" />
                        <Star className="w-4 sm:w-6 text-white fill-white" />
                        <Star className="w-4 sm:w-6 text-white fill-white" />
                        <Star className="w-4 sm:w-6 text-white fill-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main floating */}
              <span
                aria-describedby="circle-line-vector-teacher"
                className="absolute left-0 top-0 w-full h-full -z-[1] opacity-70"
              >
                <Image
                  src={images.svgCircleVector}
                  width={1030}
                  height={256}
                  priority
                  alt="circle vector"
                />
              </span>

              <span
                aria-describedby="dot-vector-teacher"
                className="absolute left-0 top-0 -z-[1] opacity-70"
              >
                <Image
                  src={images.svgDotVector}
                  width={129}
                  height={182}
                  alt="dot vector"
                  priority
                />
              </span>
            </DialogContent>
          </Dialog>
        </div>
      ))}
    </React.Fragment>
  );
};

export default TeacherCard;
