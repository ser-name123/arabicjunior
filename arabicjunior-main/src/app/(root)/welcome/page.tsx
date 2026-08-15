import React from "react";
import WhyJoinUs from "./components/WhyJoinUs";
import { FaqSection, StudentReviews } from "@/components/homepage";



const WelcomePage = () => {
  return (
    <React.Fragment>
      <section
        aria-label="welcome-hero"
        className="relative z-[1] before:absolute before:h-full before:w-full before:bg-gradient-to-r before:from-pink-500 before:from-5% before:via-orange-500 before:via-50% before:to-yellow-500 before:to-100% before:-z-[1]"
      >
        <div className="container">
          <div
            aria-label="welcome-hero-wrapper"
            className="py-6 sm:py-12 xl:py-20"
          >
            <h1 className="text-3xl font-bold text-white text-center mb-4 sm:mb-6 sm:text-5xl">
              WELCOME!
            </h1>
            <p className="text-lg font-bold text-white text-center mb-3 mx-auto sm:mb-6 sm:text-3xl sm:leading-tight">
              You've taken the first step towards a beautiful journey. Begin
              exploring now!
            </p>
            <p className="text-sm font-normal text-white text-center max-w-screen-lg mx-auto sm:text-2xl sm:leading-tight">
              we specialize in helping children and students of all ages master the Arabic language through engaging, personalized, and interactive online classes.
            </p>
          </div>
        </div>
      </section>

      <WhyJoinUs />
      <StudentReviews />
      <FaqSection />
    </React.Fragment>
  );
};

export default WelcomePage;
