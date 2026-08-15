import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import React from "react";
import { JobCardDataTypes } from "../types";
import Link from "next/link";

interface JobCardProps {
  jobCardData?: JobCardDataTypes[];
}

const JobCard: React.FC<JobCardProps> = ({ jobCardData = JOB_CARD_DATA }) => {
  return (
    <React.Fragment>
      {jobCardData.map((job, index) => (
        <div
          key={index}
          aria-label="job-card"
          className="bg-[#F5F6F8] w-full p-7 pb-3 rounded-xl min-h-72 flex h-full items-start justify-between flex-col transition-colors ease-in-out duration-300 group hover:cursor-pointer hover:bg-gradient-to-r hover:from-[#FF60A8] hover:from-5% hover:via-[#FB6238] hover:via-50% hover:to-[#F5AE14] hover:to-100%"
        >
          <Badge className="bg-light-green-200 px-5 rounded-full py-1 mb-7 text-neutral-800 text-lg font-normal hover:bg-light-green-300 hover:text-neutral-800">
            {job.department}
          </Badge>
          <div aria-label="job-info-wrapper" className="w-full">
            <h4
              aria-label="job-title"
              className="text-2xl font-semibold text-neutral-800 mb-4 group-hover:text-white transition-colors ease-in-out duration-300"
            >
              {job.jobTitle}
            </h4>

            <div
              aria-label="job-meta-info"
              className="flex items-center gap-x-2 mb-6"
            >
              <span
                aria-label="location"
                className="text-base font-semibold text-neutral-500 group-hover:text-neutral-100 transition-colors ease-in-out duration-300"
              >
                {job.jobLocation}
              </span>
              <Separator
                orientation="vertical"
                className="min-h-5 bg-neutral-200"
              />
              <span
                aria-label="employment-type"
                className="text-base font-semibold text-neutral-500 group-hover:text-neutral-100 transition-colors ease-in-out duration-300"
              >
                {job.employmentType}
              </span>
              <Separator
                orientation="vertical"
                className="min-h-5 bg-neutral-200"
              />
              <span
                aria-label="job-type"
                className="text-base line-clamp-1 font-semibold text-neutral-500 group-hover:text-neutral-100 transition-colors ease-in-out duration-300"
              >
                {job.jobType}
              </span>
            </div>

            <Button
              variant={"outline"}
              asChild
              className="w-full rounded-xl bg-transparent group-hover:bg-white group-hover:border-white group-hover:text-neutral-800"
            >
              <Link href={job.action.url}>{job.action.btnText}</Link>
            </Button>
          </div>
        </div>
      ))}
    </React.Fragment>
  );
};

export default JobCard;

// default data
const JOB_CARD_DATA: JobCardDataTypes[] = [
  {
    department: "Management",
    jobTitle: "Academic Support Assistant",
    jobLocation: "Online",
    employmentType: "Permanent",
    jobType: "3 years exp.",
    action: {
      btnText: "Apply Now",
      url: "/careers/academic-support-assistant",
    },
  },
  {
    department: "Management",
    jobTitle: "Academic Head",
    jobLocation: "Online",
    employmentType: "Permanent",
    jobType: "2-4 Years Exp.",
    action: {
      btnText: "Apply Now",
      url: "/careers/academic-head",
    },
  },
  {
    department: "Management",
    jobTitle: "Arabic Teacher",
    jobLocation: "Online",
    employmentType: "Permanent",
    jobType: "2-3 Years UAE Exp.",
    action: {
      btnText: "Apply Now",
      url: "/careers/academic-teacher",
    },
  },
];
