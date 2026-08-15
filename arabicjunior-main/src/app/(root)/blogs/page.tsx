import React from "react";
import BlogHero from "./components/BlogHero";
import AllBlogs from "./components/AllBlogs";

const BlogsPage = () => {
  return (
    <React.Fragment>
      <BlogHero />
      <AllBlogs />
    </React.Fragment>
  );
};

export default BlogsPage;
