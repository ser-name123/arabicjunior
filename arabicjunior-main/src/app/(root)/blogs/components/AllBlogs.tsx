"use client"
import BlogCard from "@/components/homepage/BlogCard";
import { BlogCardData } from "@/components/homepage/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { BlogCategory, BLOGS } from "../data/blogs";
import Head from "next/head";
import Script from "next/script";
import { sanitizeHtml, createSafeJsonLd } from "@/utils/security";

const ALL_CATEGORIES: (BlogCategory | "All")[] = [
  "All",
  "Curriculum",
  "Grade",
  "Exams",
  "Schools",
];

const AllBlogs = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  // Fetch blogs from API
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs`); // public endpoint
        if (!res.ok) throw new Error("Failed to fetch blogs");
        const data = await res.json();
        setBlogs(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchBlogs();
  }, []);

  // Filter blogs by category and search
  useEffect(() => {
    let temp = blogs;

    if (activeCategory !== "All") {
      temp = temp.filter((b) => b.category.includes(activeCategory));
    }

    if (search.trim() !== "") {
      const regex = new RegExp(search, "i");
      temp = temp.filter(
        (b) => regex.test(b.title) || regex.test(b.shortDescription)
      );
    }

    setFilteredBlogs(temp);
  }, [activeCategory, search, blogs]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    url: "https://arabicjuniors.com/blogs",
    name: "Arabic Juniors",
    description: "A blog about Arabic education and school life.",
    blogPost: blogs.map((blog) => ({
      "@type": "BlogPosting",
      headline: blog.title,
      url: `https://arabicjuniors.com/blogs/${blog.slug}`,
      image: blog.imageDetails.link,
      datePublished: blog.datePublished ?? "2025-07-31T00:00:00+05:30",
      author: {
        "@type": "Person",
        name: blog.author?.name ?? "Arabic Juniors",
        url: blog.author?.url,
      },
      description: blog.shortDescription,
    })),
  };

  console.log(JSON.stringify(jsonLd))
  return (
    <React.Fragment>
      <Head>
        <title>Arabic Juniors Blog</title>
        <meta name="description" content="Explore articles about Arabic curriculum, exams, schools, and more." />
        <link rel="canonical" href="https://arabicjuniors.com/blogs" />
      </Head>
      <Script
        id="blog-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: createSafeJsonLd(jsonLd) }}
      />
      <section aria-label="all-blogs-section" className="py-5 sm:py-10">
        <div className="container">
          <div aria-label="all-blogs-wrapper">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <div
                aria-label="blog-top-operation-bar"
                className="flex items-center justify-between gap-x-10 flex-wrap gap-y-4"
              >
                <TabsList className="mx-0 bg-transparent p-0 gap-x-3">
                  {ALL_CATEGORIES.map((category) => (
                    <TabsTrigger
                      key={category}
                      value={category}
                      className="rounded-lg border border-neutral-100 shadow-sm text-sm hover:text-white hover:bg-orange-500 transition-colors ease-in-out duration-300"
                    >
                      {category}
                    </TabsTrigger>
                  ))}
                  {/* {BLOGS?.map((blog) => (
                    <TabsTrigger
                      key={blog.slug}
                      value={blog.key}
                      className="rounded-lg border border-neutral-100 shadow-sm text-sm md:text-sm lg:text-sm hover:text-white hover:bg-orange-500 transition-colors ease-in-out duration-300"
                    >
                      {blog.category}
                    </TabsTrigger>
                  ))} */}
                </TabsList>

                <div aria-label="blog-search-bar">
                  <Input
                    placeholder="Search..."
                    className="border border-neutral-100 rounded-lg h-10 transition-colors ease-in-out duration-300 focus-within:border-pink-400"
                  />
                </div>
              </div>

              {/* {ALL_CATEGORIES.map((category) => {
                const filteredBlogs =
                  category === "All"
                    ? BLOGS
                    : BLOGS.filter((blog) => blog.category.includes(category));

                return (
                  <TabsContent key={category} value={category}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8 mt-6">

                      <BlogCard CardData={filteredBlogs} />

                    </div>
                  </TabsContent>
                );
              })} */}
              {ALL_CATEGORIES.map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8 mt-6">
                    <BlogCard CardData={filteredBlogs} />
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div
              aria-label="all-blog-button"
              className="flex items-center justify-center flex-col mt-10 md:mt-20"
            >
              <Button asChild className="md:text-base max-w-60 w-full">
                <Link href="/blogs">
                  See all blog
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

export default AllBlogs;