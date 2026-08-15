import { StaticImageData } from "next/image";

export interface BlogCardAction {
  link: string;
  text: string;
}
export interface BlogCardImage {
  link: string | StaticImageData;
  width: number;
  height: number;
  altText: string;
}

export interface BlogCardData {
    key: string;
    title: string;
    shortDescription: string;
    action: BlogCardAction;
    image: BlogCardImage;
  }