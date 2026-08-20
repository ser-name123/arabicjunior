import { Request, Response } from "express";
import Blog, { BlogCategory } from "../models/blog";
import cloudinary from "../config/cloudinary";
import slugify from "slugify"
import { containsRegex } from "../utils/escapeRegex";

// Turn a title into a slug that isn't already taken. createBlog previously
// skipped this (updateBlog did it), so posting a second blog with the same
// title tripped the unique index and returned a raw duplicate-key error.
const buildUniqueSlug = async (title: string, excludeId?: unknown) => {
    let baseSlug = slugify(title, { lower: true, strict: true, trim: true });
    if (baseSlug.length > 70) baseSlug = baseSlug.substring(0, 70);
    if (!baseSlug) baseSlug = "post";

    let slug = baseSlug;
    let counter = 1;
    const scope = excludeId ? { _id: { $ne: excludeId } } : {};
    while (await Blog.exists({ slug, ...scope })) {
        slug = `${baseSlug}-${counter++}`;
    }
    return slug;
};

export interface BlogInput {
    title: string;
    shortDescription: string;
    status: "draft" | "published",
    contentHtml: string;
    contentText?: string;
    category: BlogCategory[];
}

export type BlogUpdateInput = Partial<BlogInput>;



const uploadToCloudinary = async (file: Express.Multer.File) => {
    const b64 = Buffer.from(file.buffer).toString("base64");
    const dataUri = `data:${file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
        folder: "blogs",
        resource_type: "auto",
    });

    return { secure_url: result.secure_url, public_id: result.public_id };
};

// Create Blog
export const createBlog = async (req: Request, res: Response): Promise<any> => {
    let uploadedImage = null;
    try {
        const { title, contentHtml, shortDescription, contentText, category, status }: BlogInput = req.body as BlogInput;

        const files = req.files as {
            [fieldname: string]: Express.Multer.File[];
        };


        if (!title || typeof title !== "string" || !title.trim()) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }

        // The schema marks image and thumbnail as required, and both the blog
        // list and the article page dereference imageDetails.link. Passing null
        // through produced an opaque mongoose validation error; reject clearly
        // instead.
        if (!files?.['cover-image']?.[0]) {
            return res.status(400).json({ success: false, message: "A cover image is required" });
        }

        try {
            uploadedImage = await uploadToCloudinary(files['cover-image'][0]);
        } catch (err) {
            return res.status(500).json({ success: false, message: "Image upload failed" });
        }

        const slug = await buildUniqueSlug(title);

        const blog = await Blog.create({
            title,
            shortDescription,
            contentHtml,
            contentText,
            slug,
            category,
            status,
            image: uploadedImage.secure_url,
            thumbnail: uploadedImage.secure_url,
            imageDetails: {
                link: uploadedImage.secure_url
            },
            imagePublicId: uploadedImage.public_id,
        });

        res.status(201).json({ success: true, data: blog });
    } catch (error: any) {
        console.log('Error creating blog::', error)
        if (uploadedImage) {
            await cloudinary.uploader.destroy(uploadedImage?.public_id, {
                resource_type: "auto",
            })
        }
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get All Blogs for admin
export const getBlogs = async (req: Request, res: Response) => {
    try {
        let { page = "1", limit = "10", search = "", startDate, endDate } = req.query;

        const pageNumber = parseInt(page as string, 10) || 1;
        const pageSize = parseInt(limit as string, 10) || 10;

        // Build search filter
        let filter: any = {};
        if (search && typeof search === "string" && search.trim() !== "") {
            const regex = containsRegex(search); // case-insensitive, input escaped
            filter = {
                $or: [
                    { title: regex },
                    { shortDescription: regex },
                    { contentText: regex }
                ],
            };
        }
        const total = await Blog.countDocuments(filter);

        const blogs = await Blog.find(filter)
            .sort({ createdAt: -1 }) // latest first
            .skip((pageNumber - 1) * pageSize)
            .limit(pageSize);

        res.status(200).json({
            message: "success",
            success: true,
            data: blogs,
            pagination: {
                total,
                page: pageNumber,
                limit: pageSize,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get All Blogs for user
export const getAllBlogs = async (req: Request, res: Response) => {
    try {
        const blogs = await Blog.find({ status: 'published' })
            .sort({ createdAt: -1 }) // latest first

        res.status(200).json({
            message: "success",
            success: true,
            data: blogs,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Single Blog by Slug
export const getBlogBySlug = async (req: Request, res: Response): Promise<any> => {
    try {
        // Public route: only published posts. Without the status filter an
        // unpublished draft was readable by anyone who knew or guessed its slug.
        const blog = await Blog.findOne({ slug: req.params.slug, status: "published" });
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        res.status(200).json({ success: true, data: blog });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getBlogById = async (req: Request, res: Response): Promise<any> => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        res.status(200).json({ success: true, data: blog });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Blog
export const updateBlog = async (req: Request, res: Response): Promise<any> => {
    try {
        const { title, shortDescription, contentHtml, contentText, category, status }: BlogUpdateInput = req.body as BlogUpdateInput;
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        const files = req.files as { [fieldname: string]: Express.Multer.File[] };

        // If new file uploaded → delete old + upload new
        if (files?.["cover-image"]?.[0]) {
            if (blog.imagePublicId) {
                await cloudinary.uploader.destroy(blog.imagePublicId);
            }

            const uploadedImage = await uploadToCloudinary(files["cover-image"][0]);
            blog.image = uploadedImage.secure_url;
            blog.imagePublicId = uploadedImage.public_id;
            blog.imageDetails = {
                link: uploadedImage.secure_url
            }
        }

        if (title && title !== blog.title) {
            blog.title = title;
            blog.slug = await buildUniqueSlug(title, blog._id);
        }

        blog.shortDescription = shortDescription || blog.shortDescription;
        blog.contentHtml = contentHtml || blog.contentHtml;
        blog.contentText = contentText || blog.contentText;
        blog.category = category || blog.category;
        blog.status = status || blog.status;

        await blog.save();

        res.status(200).json({ success: true, data: blog });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete Blog
export const deleteBlog = async (req: Request, res: Response): Promise<any> => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        // delete image from cloudinary
        if (blog.imagePublicId) {
            await cloudinary.uploader.destroy(blog.imagePublicId);
        }

        await blog.deleteOne();
        res.status(200).json({ success: true, message: "Blog deleted successfully" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Delete several blog posts at once.
 *
 * A POST rather than a DELETE because the ids travel in the body, and a body on
 * DELETE is poorly supported by proxies and some HTTP clients.
 */
export const deleteManyBlogs = async (req: Request, res: Response): Promise<any> => {
    try {
        const { ids } = req.body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "No blogs selected" });
        }

        // Guard against a runaway request clearing the blog. The admin screen
        // sends at most one page of rows, so this is far above normal use.
        if (ids.length > 200) {
            return res
                .status(400)
                .json({ success: false, message: "Too many at once. Select up to 200." });
        }

        const blogs = await Blog.find({ _id: { $in: ids } }).select("imagePublicId");

        // Cover images are removed alongside the posts, exactly as the single
        // delete does. Skipping this would leave an orphaned file in Cloudinary
        // for every post deleted this way, costing storage nobody can find.
        const imageResults = await Promise.allSettled(
            blogs
                .filter((blog) => blog.imagePublicId)
                .map((blog) => cloudinary.uploader.destroy(blog.imagePublicId as string))
        );

        const failedImages = imageResults.filter((r) => r.status === "rejected").length;
        if (failedImages) {
            // Logged, not fatal: a stranded image is untidy, but refusing to
            // delete the posts because of it would be worse.
            console.warn(`[blogs] ${failedImages} cover image(s) could not be removed from Cloudinary`);
        }

        const result = await Blog.deleteMany({ _id: { $in: ids } });

        res.status(200).json({
            success: true,
            message: `${result.deletedCount} blog(s) deleted`,
            deletedCount: result.deletedCount,
        });
    } catch (error: any) {
        console.error("Error deleting blogs:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Every blog for the admin export, drafts included and without paging.
 *
 * Separate from the public getAllBlogs, which returns published posts only —
 * an export that silently dropped every draft would be misleading.
 */
export const exportBlogs = async (req: Request, res: Response) => {
    try {
        const { search = "" } = req.query;

        let filter: any = {};
        if (search && typeof search === "string" && search.trim() !== "") {
            const regex = containsRegex(search);
            filter = {
                $or: [{ title: regex }, { shortDescription: regex }, { contentText: regex }],
            };
        }

        // contentHtml is excluded on purpose: it is the whole article as markup
        // and would make the spreadsheet unreadable and enormous.
        const blogs = await Blog.find(filter)
            .select("-contentHtml")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "success",
            data: blogs,
            total: blogs.length,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
