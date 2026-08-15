"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const JobCard = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs`);
        const result = await res.json();
        if (res.ok && result.data) {
          setJobs(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  if (loading) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-neutral-500 text-sm mt-2">Loading job openings...</p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="col-span-full text-center py-10 text-neutral-500">
        No job openings at the moment. Please check back later!
      </div>
    );
  }

  return (
    <React.Fragment>
      {jobs.map((job, index) => (
        <div
          key={job._id || index}
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
              {job.title}
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
              <Link href={`/careers/${job.slug}`}>{job.applyLabel || "Apply Now"}</Link>
            </Button>
          </div>
        </div>
      ))}
    </React.Fragment>
  );
};

export default JobCard;
