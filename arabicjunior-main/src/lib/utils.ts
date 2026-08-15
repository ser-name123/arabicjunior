import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// `getRandomBlogs` lived here and shuffled the old hard-coded BLOGS array.
// Blogs come from the API now and every call site was already commented out,
// so it has been removed along with the static data.
