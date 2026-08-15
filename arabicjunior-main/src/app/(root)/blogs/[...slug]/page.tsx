
import { notFound } from "next/navigation";
import Image from "next/image";
import React from "react";
import BackButton from "@/components/BackButton";
import BlogCard from "@/components/homepage/BlogCard";
import { sanitizeHtml, createSafeJsonLd } from "@/utils/security";

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  // const slug = params.slug?.length > 0 ? params.slug[0] : null;
  const slugValue = slug?.length > 0 ? slug[0] : undefined;
  if (!slugValue) notFound();
  // const slug = params.slug?.length > 0 ? params.slug[0] : undefined;

  if (!slugValue) {
    return { title: "Blog Not Found", description: "The blog you're looking for doesn't exist." };
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/${slugValue}`, { cache: "no-store" });
    if (!res.ok) return { title: "Blog Not Found", description: "The blog you're looking for doesn't exist." };

    const data = await res.json();
    const blog = data.data;

    if (!blog) {
      return { title: "Blog Not Found", description: "The blog you're looking for doesn't exist." };
    }

    return {
      title: blog.title,
      description: blog.shortDescription,
      openGraph: {
        title: blog.title,
        description: blog.shortDescription,
        images: [{ url: blog.imageDetails.link }],
      },
      alternates: {
    canonical: `https://arabicjuniors.com/blogs/${slugValue}`,
  },
    };
  } catch {
    return { title: "Blog Not Found", description: "The blog you're looking for doesn't exist." };
  }
}

async function fetchBlog(slug: string) {
  // console.log(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/${slug}`)
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}

async function fetchLatestBlogs(limit = 4) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/blogs`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  const blogs = data.data || [];

  // Shuffle the array
  for (let i = blogs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [blogs[i], blogs[j]] = [blogs[j], blogs[i]];
  }

  // Return first N blogs
  return blogs.slice(0, limit);
}

export default async function BlogDetailsPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  // const slug = params.slug?.length > 0 ? params.slug[0] : null;
  const slugValue = slug?.length > 0 ? slug[0] : null;
  if (!slugValue) notFound();
  // if (!slug) notFound();

  const blog = await fetchBlog(slugValue);
  // console.log(blog)
  if (!blog) notFound();

  const latestBlogs = await fetchLatestBlogs();

  return (
    <section
      aria-label="blog-details"
      className="relative z-[1] before:absolute before:w-full before:h-72 before:bg-gradient-to-r before:from-[#FF60A8] before:from-5% before:via-[#FB6238] before:via-50% before:to-[#F5AE14] before:to-100% before:-z-[1]"
    >
      <div className="container">
        <div aria-label="blog-details-wrapper" className="pt-5 sm:pt-10">
          <BackButton label="Back to Blog" />

          <h2
            aria-label="blog-title"
            className="mt-4 mb-7 text-3xl sm:text-4xl font-bold text-white"
          >
            {blog.title.length > 120 ? blog.title.slice(0, 120) + "..." : blog.title}
          </h2>

          <div aria-label="blog-feature-image-wrapper" className="flex w-full mb-8">
            <Image
              src={blog.imageDetails.link}
              alt="blog feature image"
              width={1320}
              height={920}
              priority
              className="rounded-3xl aspect-video w-full object-cover object-top"
            />
          </div>

          <div className="mx-auto seo-blog">
            <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(blog.contentHtml || "") }} />
          </div>

          <div aria-label="latest-blog-area" className="mt-10 mb-6 sm:mb-14 sm:mt-16">
            <h4 aria-label="title" className="text-neutral-800 text-3xl sm:text-4xl font-bold mb-7">
              Latest Blog
            </h4>

            <div aria-label="latest-blog-card-wrapper" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
              <BlogCard CardData={latestBlogs} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


// import { notFound } from "next/navigation";
// import fs from "fs";
// import path from "path";
// import Image from "next/image";
// import React from "react";
// import BackButton from "@/components/BackButton";
// import { BLOGS } from "../data/blogs";
// import BlogCard from "@/components/homepage/BlogCard";
// import { getRandomBlogs } from "@/lib/utils";

// function extractBodyContent(html: string) {
//   html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
//   const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
//   return match ? match[1] : html;
// }

// export async function generateMetadata(props: {
//   params: Promise<{ slug: string[] }>;
// }) {
//   const params = await props.params;
//   const slug = params.slug?.length > 0 ? params.slug[0] : undefined;
//   const blog = BLOGS.find((b) => b.slug === slug);

//   if (!blog) {
//     return {
//       title: "Blog Not Found",
//       description: "The blog you're looking for doesn't exist.",
//     };
//   }

//   return {
//     title: blog.title,
//     description: blog.shortDescription,
//     openGraph: {
//       title: blog.title,
//       description: blog.shortDescription,
//       images: [{ url: blog.imageDetails.link }],
//     },
//   };
// }

// export default async function BlogDetailsPage(props: {
//   params: Promise<{ slug: string[] }>;
// }) {
//   const params = await props.params;
//   const _slug = params.slug?.length > 0 ? params.slug[0] : "discover-arabic-learning-uae";
//   const blog = BLOGS.find((b) => b.slug === _slug);

//   if (!blog) notFound();
//   const filePath = path.join(process.cwd(), "public", "blogs", `${_slug}.html`);

//   if (!fs.existsSync(filePath)) {
//     notFound();
//   }
//   const rawHtml = fs.readFileSync(filePath, "utf-8");
//   const htmlContent = extractBodyContent(rawHtml);

//   const latestBlogs = getRandomBlogs();
//   return (
//     <React.Fragment>
//       <section
//         aria-label="blog-details"
//         className="relative z-[1] before:absolute before:w-full before:h-72 before:bg-gradient-to-r before:from-[#FF60A8] before:from-5% before:via-[#FB6238] before:via-50% before:to-[#F5AE14] before:to-100% before:-z-[1]"
//       >
//         <div className="container">
//           <div aria-label="blog-details-wrapper" className="pt-5 sm:pt-10">

//             <BackButton label="Back to Blog" />

//             <h2
//               aria-label="blog-title"
//               className="mt-4 mb-7 text-3xl sm:text-4xl font-bold text-white"
//             >
//               {blog.title.length > 120 ? blog.title.slice(0, 120) + "..." : blog.title}
//             </h2>
//             <div
//               aria-label="blog-feature-image-wrapper"
//               className="flex w-full mb-8"
//             >
//               <Image
//                 src={blog.imageDetails.link}
//                 alt="blog feature image"
//                 width={1320}
//                 height={920}
//                 priority
//                 className="rounded-3xl aspect-video w-full object-cover object-top"
//               />
//             </div>

//             <div className="mx-auto seo-blog">
//               <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
//             </div>

//             <div aria-label="latest-blog-area" className="mt-10 mb-6 sm:mb-14 sm:mt-16">
//               <h4
//                 aria-label="title"
//                 className="text-neutral-800 text-3xl sm:text-4xl font-bold mb-7"
//               >
//                 Latest Blog
//               </h4>

//               <div
//                 aria-label="latest-blog-card-wrapper"
//                 className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8"
//               >
//                 <BlogCard CardData={latestBlogs} />
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </React.Fragment>
//   );
// }
