import { Request, Response } from "express";
import Blog, { BlogCategory } from "../models/blog";
import cloudinary from "../config/cloudinary";
import slugify from "slugify"

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


        if (files?.['cover-image']?.[0]) {
            try {
                uploadedImage = await uploadToCloudinary(files['cover-image'][0]);
            } catch (err) {
                return res.status(500).json({ success: false, message: "Image upload failed" });
            }
        }

        let baseSlug = slugify(title, { lower: true, strict: true, trim: true })
        if (baseSlug.length > 70) baseSlug = baseSlug.substring(0, 70)

        const blog = await Blog.create({
            title,
            shortDescription,
            contentHtml,
            contentText,
            slug: baseSlug,
            category,
            status,
            image: uploadedImage?.secure_url || null,
            thumbnail: uploadedImage?.secure_url || null,
            imageDetails: {
                link: uploadedImage?.secure_url || null
            },
            imagePublicId: uploadedImage?.public_id || null,
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
            const regex = new RegExp(search, "i"); // case-insensitive
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
        const blog = await Blog.findOne({ slug: req.params.slug });
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

            // generate new slug
            let baseSlug = slugify(title, { lower: true, strict: true, trim: true });
            if (baseSlug.length > 70) baseSlug = baseSlug.substring(0, 70);

            let slug = baseSlug;
            let counter = 1;
            while (await Blog.exists({ slug, _id: { $ne: blog._id } })) {
                slug = `${baseSlug}-${counter++}`;
            }
            blog.slug = slug;
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
