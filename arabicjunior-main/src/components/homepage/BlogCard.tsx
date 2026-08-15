import React from "react";
import { BlogCardData } from "./types";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BlogImage2, BlogImage3, BlogImage4, LearningWithGameBlog } from "@/assets";
import { IBlog } from "@/app/(root)/blogs/data/blogs";

interface BlogCardProps {
  CardData?: IBlog[];
}

const BlogCard: React.FC<BlogCardProps> = ({ CardData = [] }: BlogCardProps) => {
  return (
    <React.Fragment>
      {CardData?.map((cardItem) => (
        <div
          key={cardItem.slug}
          aria-label="blog-card"
          className="h-full flex flex-col border border-transparent rounded-2xl bg-[#F5F5F5] transition-all ease-in-out duration-300 hover:border-neutral-100"
        >
          <div
            aria-label="blog-image-wrapper"
            className="max-w-screen-sm flex-shrink-0 flex-grow-0 basis-auto"
          >
            <Image
              src={cardItem.imageDetails.link}
              width={cardItem.imageDetails.width}
              height={cardItem.imageDetails.height}
              alt={cardItem.imageDetails.altText}
              priority
              className="rounded-t-2xl aspect-video object-cover object-center"
            />
          </div>

          <div
            aria-label="blog-card-body"
            className="p-4 flex-1 flex flex-col justify-between"
          >
            <div>
              <h4 className="text-base text-neutral-900 font-semibold mb-2">
                {cardItem.title.length >= 26
                  ? cardItem.title.slice(0, 26) + "..."
                  : cardItem.title}
              </h4>

              <p className="text-neutral-700 text-xs font-normal mb-5">
                {cardItem.shortDescription.length > 75
                  ? cardItem.shortDescription.slice(0, 75) + "..."
                  : cardItem.shortDescription}
              </p>
            </div>

            <Button asChild variant={"destructive"} className="md:text-base w-full">
              <Link href={cardItem.action?.link || `/blogs/${cardItem.slug}`} className="!text-sm">
                {cardItem.action.text}
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </React.Fragment>
  );
};

export default BlogCard;
