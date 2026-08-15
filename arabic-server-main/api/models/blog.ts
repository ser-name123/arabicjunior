import mongoose, { Schema, Document } from "mongoose";

export type BlogCategory = "Curriculum" | "Grade" | "Exams" | "Schools";

export interface BlogAction {
    link: string;
    text: string;
}

export interface BlogImage {
    link: string;
    width?: number;
    height?: number;
    altText?: string;
}

export interface IBlog extends Document {
    "@type": string;
    title: string;
    slug: string;
    shortDescription: string;
    contentHtml: string;
    contentText?: string;
    thumbnail: string;
    category: BlogCategory[];
    action?: BlogAction;
    imageDetails?: BlogImage;
    author: {
        "@type": string;
        name: string;
        url?: string;
    };
    datePublished: Date;
    dateModified: Date;
    image: string;
    imagePublicId?: string;
    status: 'draft' | 'published'
}

const BlogSchema = new Schema<IBlog>(
    {
        "@type": { type: String, default: "BlogPosting" },
        title: { type: String, required: true },
        slug: { type: String, unique: true, required: true },
        shortDescription: { type: String, required: true },
        contentHtml: { type: String, required: true },
        contentText: { type: String },
        thumbnail: { type: String, required: true },
        category: [{ type: String, enum: ["Curriculum", "Grade", "Exams", "Schools"] }],
        action: {
            link: { type: String },
            text: { type: String, default: 'Read More' },
        },
        imageDetails: {
            link: { type: String },
            width: { type: Number, default: 1380 },
            height: { type: Number, default: 920 },
            altText: { type: String, default: 'Blog Banner Img' },
        },
        author: {
            "@type": { type: String, default: "Person" },
            name: { type: String, default: 'Arabic Juniors' },
            url: { type: String, default: 'https://arabicjuniors.com' },
        },
        datePublished: { type: Date, default: Date.now },
        dateModified: { type: Date, default: Date.now },
        image: { type: String, required: true },
        imagePublicId: { type: String },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "draft",
        }
    },
    { timestamps: true }
);

// Slug auto-generation
// BlogSchema.pre("validate", function (next) {
//     if (!this.slug && this.title) {
//         this.slug = this.title
//             .toLowerCase()
//             .replace(/[^a-z0-9]+/g, "-")
//             .replace(/(^-|-$)+/g, "");
//     }
//     next();
// });

BlogSchema.pre("validate", async function (next) {
    // if (this.isModified("title") || !this.slug) {
    //     let baseSlug = slugify(this.title, { lower: true, strict: true, trim: true })
    //     if (baseSlug.length > 70) baseSlug = baseSlug.substring(0, 70)

    //     let slug = baseSlug
    //     let counter = 1
    //     while (await mongoose.models.Blog.exists({ slug })) {
    //         slug = `${baseSlug}-${counter++}`
    //     }
    //     this.slug = slug
    // }

    this.dateModified = new Date()
    next()
})


// Indexes for search
// NOTE: no index on `slug` here — `unique: true` on the field already creates
// one, and declaring it twice makes mongoose emit a duplicate-index warning.
BlogSchema.index({ category: 1 });
BlogSchema.index({ title: "text", shortDescription: "text", contentText: "text" });

const Blog = mongoose.model<IBlog>("Blog", BlogSchema);

export default Blog;
