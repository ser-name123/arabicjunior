import { Separator } from "@/components/ui/separator";
import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ slug: string }>;
};

const CareerDetailsPage = async ({ params }: Props) => {
  const { slug } = await params;

  let jobPost = null;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/jobs/${slug}`, {
      cache: "no-store",
    });
    if (res.ok) {
      const result = await res.json();
      jobPost = result.data;
    }
  } catch (err) {
    console.error("Error fetching job details:", err);
  }

  if (!jobPost) {
    notFound();
  }

  return (
    <React.Fragment>
      <section
        aria-label="career-details-page"
        className="relative z-[1] before:absolute before:w-full before:h-72 before:bg-gradient-to-r before:from-[#FF60A8] before:from-5% before:via-[#FB6238] before:via-50% before:to-[#F5AE14] before:to-100% before:-z-[1]"
      >
        <div className="container">
          <div aria-label="career-details-wrapper" className="pt-10 sm:pt-20">
            <div
              aria-describedby="content-wrapper"
              className="bg-white sm:px-20 px-6 py-8 sm:py-12 rounded-xl"
            >
              <div aria-describedby="meta" className="mb-8">
                <h1
                  aria-describedby="job-title"
                  className="text-5xl text-neutral-800 font-semibold mb-4"
                >
                  {jobPost.title}
                </h1>

                <ul className="text-black">
                  <li>
                    <strong>Location:</strong> {jobPost.jobLocation}
                  </li>
                  <li>
                    <strong>Position Type:</strong> {jobPost.employmentType}
                  </li>
                  <li>
                    <strong>Schedule:</strong> {jobPost.schedule}
                  </li>
                  <li>
                    <strong>Experience:</strong> {jobPost.experience}
                  </li>
                </ul>
              </div>

              <div aria-describedby="job-overview">
                <h3
                  aria-describedby="title"
                  className="text-4xl font-semibold text-neutral-800"
                >
                  Job Description
                </h3>
                <Separator className="my-4" />
                <p className="text-black">{jobPost.description}</p>
                <Separator className="my-4" />
              </div>

              {jobPost.responsibilities && jobPost.responsibilities.length > 0 && (
                <div aria-describedby="job-details">
                  <h3
                    aria-describedby="title"
                    className="text-xl font-medium text-neutral-800 mb-4"
                  >
                    Job Details & Responsibilities:
                  </h3>

                  <ol aria-describedby="topics" className="space-y-6">
                    {jobPost.responsibilities.map((resp: any, index: number) => (
                      <li aria-describedby="topic-item" key={index} className="text-black">
                        {resp.category && (
                          <h6 className="text-lg font-medium text-neutral-850 mb-2">
                            {resp.category}:
                          </h6>
                        )}

                        <ul
                          aria-describedby="lists"
                          className="list-disc pl-8 space-y-1.5 text-base font-normal text-neutral-700"
                        >
                          {resp.items.map((item: string, itemIdx: number) => (
                            <li
                              aria-describedby="list-item"
                              key={itemIdx}
                              className="text-sm text-neutral-600"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div
                aria-describedby="apply-btn"
                className="mt-8 w-full flex items-center justify-center flex-col"
              >
                <Button asChild>
                  <Link href={jobPost.applyUrl || "/teacher-registration"}>
                    {jobPost.applyLabel || "Apply Now"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default CareerDetailsPage;
