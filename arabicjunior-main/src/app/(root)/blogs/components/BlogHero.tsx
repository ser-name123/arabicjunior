import React from "react";

const BlogHero = () => {
  return (
    <React.Fragment>
      <section
        aria-label="all-blogs-hero"
        className="pt-5 pb-5 sm:pt-16 sm:pb-12 relative bg-gradient-to-r from-[#FF60A8] from-5% via-[#FB6238] via-50% to-[#F5AE14] to-100%"
      >
        <div className="container">
          <div aria-label="blogs-hero-wrapper">
            <h5
              aria-label="subtitle"
              className="text-[#FFDA62] text-lg font-medium mb-4"
            >
              Blog
            </h5>
            <h1
              aria-label="title"
              className="text-3xl sm:text-5xl text-white font-bold text-left mb-6"
            >
              Read our blog
            </h1>
            <p
              aria-label="description"
              className="text-sm sm:text-lg font-normal text-white max-w-screen-md"
            >
              We believe strong Arabic skills open doors to academic success,
              cultural connection, and lasting confidence. Mastering Arabic
              empowers students to excel in their studies and build meaningful
              connections.
            </p>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default BlogHero;
