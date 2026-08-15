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

  return (
    <React.Fragment>
      <section aria-label="student-reviews-home" className="pt-12 pb-14">
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
              We believe in real outcomes, not just empty promises. Personalized
              teaching transforms learning every day. Hear what our students and
              parents say!
            </p>
          </Reveal>

          <Reveal variant="rise" delay={120}>
            <TestimonialCarousel testimonials={testimonials} />
          </Reveal>
        </div>
      </section>
    </React.Fragment>
  );
};

export default StudentReviews;
