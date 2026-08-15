
import React from "react";
import MultiStepProvider from "./MultiStepProvider";

const UserRegistrationPage = () => {
  return (
    <React.Fragment>
      <section
        aria-label="registration-page"
        className="relative mb-12 z-[1] before:absolute before:h-96 before:w-full before:bg-gradient-to-r before:from-pink-500 before:from-5% before:via-orange-500 before:via-50% before:to-yellow-500 before:to-100% before:-z-[1]"
      >
        <div className="container pt-20">
          <div
            aria-label="registration-wrapper"
            className="bg-white rounded-2xl px-5 py-7 sm:p-11 flex items-center justify-center flex-col"
          >
            <h1 className="text-neutral-800 font-bold text-3xl leading-tight sm:leading-tight sm:text-5xl text-center mb-8">
              Let&apos;s begin your journey together
            </h1>

            <div
              id="registration-form-wrapper"
              aria-label="registration-form-wrapper"
              className="max-w-screen-md py-14 px-5 sm:px-12 bg-[#FAF8F8] rounded-2xl scroll-mt-[calc(var(--juniors-header-height)+5rem)]"
            >
              <MultiStepProvider />
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default UserRegistrationPage;
