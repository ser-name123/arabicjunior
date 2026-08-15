export type Blog = {
    _id: string
    title: string
    shortDescription: string;
    slug: string
    content: string
    coverImage?: string
    createdAt: string
    updatedAt: string
    status: "draft" | "published"
}