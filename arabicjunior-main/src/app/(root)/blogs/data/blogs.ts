// Blog shape definitions.
//
// This file used to also export a hard-coded `BLOGS` array — an earlier,
// pre-database version of the blog system. Blogs now come from the API
// (GET /blogs), and the only remaining reference to the static array was in
// commented-out code, so the data has been removed. The types below are still
// used by AllBlogs and BlogCard.

export type BlogCategory = "Curriculum" | "Grade" | "Exams" | "Schools";

export interface BlogAction {
    link: string;
    text: string;
}

export interface BlogImage {
    link: string;
    width: number;
    height: number;
    altText: string;
}

export interface IBlog {
    "@type": string;
    title: string;
    slug: string;
    shortDescription: string;
    thumbnail: string;
    category: BlogCategory[];
    action: BlogAction;
    imageDetails: BlogImage;
    author: {
        "@type": string;
        name: string;
        url: string;
    }
    datePublished: string;
    dateModified: string;
    image: string;
}
