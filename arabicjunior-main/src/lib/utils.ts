import { BLOGS } from "@/app/(root)/blogs/data/blogs";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomBlogs(count = 4) {
  const shuffled = [...BLOGS].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
