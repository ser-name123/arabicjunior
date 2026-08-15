import { Separator } from "@/components/ui/separator";
import React from "react";
import { JOB_POSTS } from "./data";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ slug: string }>;
};

const CareerDetailsPage = async ({ params }: Props) => {
  const { slug } = await params;

  const jobPost = JOB_POSTS.find((p) => p.slug === slug);
  console.log(jobPost);

  if (!jobPost) {
    notFound();
  }

  const {
    title,
    apply,
    description,
    experience,
    location,
    position_type,
    responsibilities,
    schedule,
  } = jobPost;

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
                  {title}
                </h1>

                <ul>
                  <li>
                    <strong>Location:</strong> {location}
                  </li>
                  <li>
                    <strong>Position Type:</strong> {position_type}
                  </li>
                  <li>
                    <strong>Schedule:</strong> {schedule}
                  </li>
                  <li>
                    <strong>Experience:</strong> {experience}
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
                <p>{description}</p>
                <Separator className="my-4" />
              </div>

              <div aria-describedby="job-details">
                <h3
                  aria-describedby="title"
                  className="text-xl font-medium text-neutral-800 mb-2"
                >
                  Key Responsibilities:
                </h3>

                <ol aria-describedby="topics" className="space-y-4">
                  {responsibilities.map((resp, index) => (
                    <li aria-describedby="topic-item" key={index}>
                      {resp.category && (
                        <h6 className="text-lg font-medium text-neutral-800 mb-2">
                          {resp.category}:
                        </h6>
                      )}

                      <ul
                        aria-describedby="lists"
                        className="list-disc pl-8 space-y-1 text-base font-normal"
                      >
                        {resp.items.map((item, index) => (
                          <li
                            aria-describedby="list-item"
                            key={index}
                            className="text-sm"
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ol>
              </div>

              <div
                aria-describedby="apply-btn"
                className="mt-8 w-full flex items-center justify-center flex-col"
              >
                <Button asChild>
                  <Link href={apply.url}>{apply.label}</Link>
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
