import React from "react";
import type { Testimonial } from "@/types/Testimonial";
import { fetchContent } from "@/lib/contentApi";
import TestimonialCarousel from "./TestimonialCarousel";
import Reveal from "../Reveal";

const StudentReviews = async () => {
  const testimonials = await fetchContent<Testimonial>("/testimonials");

  // Nothing to show — render nothing at all rather than a heading over blank
  // space.
  if (testimonials.length === 0) return null;

  // The two formats get a section each. Sharing one row made every card as
  // tall as the tallest video card, so the text reviews sat in a lot of empty
  // space, and a visitor scanning quotes had to scroll past players to find
  // the next one.
  const videoReviews = testimonials.filter((item) => item.type === "video");
  const textReviews = testimonials.filter((item) => item.type !== "video");

  // Keeps the outer spacing of the pair identical to the single section it
  // replaced, instead of doubling the gap when both are present.
  const bothShown = videoReviews.length > 0 && textReviews.length > 0;

  return (
    <React.Fragment>
      {videoReviews.length > 0 && (
        <section
          aria-label="video-reviews-home"
          className={`pt-12 ${bothShown ? "pb-6" : "pb-14"}`}
        >
          <div className="container">
            <Reveal
              variant="up"
              aria-label="video-reviews-top-home"
              className="max-w-[44.875rem] mx-auto mb-14"
            >
              <h3 className="text-4xl leading-tight sm:text-5xl sm:leading-tight font-bold text-neutral-800 mb-6 text-center">
                Video <span className="text-orange-500">Testimonials</span>
              </h3>
              <p className="text-sm sm:text-lg font-normal text-neutral-700 text-center">
                Hear it straight from the families who learn with us — real
                parents and students, in their own words.
              </p>
            </Reveal>

            <Reveal variant="rise" delay={120}>
              <TestimonialCarousel
                testimonials={videoReviews}
                name="video testimonial"
              />
            </Reveal>
          </div>
        </section>
      )}

      {textReviews.length > 0 && (
        <section
          aria-label="student-reviews-home"
          className={`${bothShown ? "pt-6" : "pt-12"} pb-14`}
        >
          <div className="container">
            <Reveal
              variant="up"
              aria-label="reviews-top-home"
              className="max-w-[44.875rem] mx-auto mb-14"
            >
              <h3 className="text-4xl leading-tight sm:text-5xl sm:leading-tight font-bold text-neutral-800 mb-6 text-center">
                Our Happy <span className="text-orange-500">Students</span>
              </h3>
              <p className="text-sm sm:text-lg font-normal text-neutral-700 text-center">
                We believe in real outcomes, not just empty promises.
                Personalized teaching transforms learning every day. Hear what
                our students and parents say!
              </p>
            </Reveal>

            <Reveal variant="rise" delay={120}>
              <TestimonialCarousel
                testimonials={textReviews}
                name="student review"
              />
            </Reveal>
          </div>
        </section>
      )}
    </React.Fragment>
  );
};

export default StudentReviews;
