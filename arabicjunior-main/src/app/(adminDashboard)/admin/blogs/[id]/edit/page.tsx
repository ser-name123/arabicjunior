"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, MoveLeft, Save } from "lucide-react"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "@/components/ui/input-2"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button-2"
import {
    Form,
    FormField,
    FormItem,
    FormControl,
    FormMessage,
    FormLabel,
} from "@/components/ui/form"
import RichTextEditor from "@/components/rich-text-editor"
import CoverImageUploader from "@/components/CoverImagePicker"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import Loader from "@/components/loader"
import useAuthAdmin from "@/hooks/useAuthAdmin"

const categories = [
    { id: "Curriculum", label: "Curriculum" },
    { id: "Grade", label: "Grade" },
    { id: "Exams", label: "Exams" },
    { id: "Schools", label: "Schools" }
] as const

// Validation schema (same as new blog)
const blogSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters.").max(80, "Title should not exceed 80 characters."),
    shortDescription: z.string().min(50, "Short description must be at least 50 characters.").max(160, "Short description should not exceed 160 characters."),
    contentHtml: z.string().min(1, "Content is required."),
    contentText: z.string().min(1, "Content text is required."),
    category: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one category.",
    }),
    coverImage: z.instanceof(File, { message: "Cover image is required." }).optional(),
    status: z.enum(['draft', 'published'])
})

type BlogFormData = z.infer<typeof blogSchema>

export default function EditBlogPage() {
    const router = useRouter()
    const params = useParams()
    const id = params?.id as string
    const { token } = useAuthAdmin()

    const [isLoading, setIsLoading] = useState(false)
    const [editorContent, setEditorContent] = useState("");

    const form = useForm<BlogFormData>({
        resolver: zodResolver(blogSchema),
        defaultValues: {
            title: "",
            shortDescription: "",
            contentHtml: "",
            contentText: "",
            status: 'draft',
            category: [],
            coverImage: undefined as any
        }
    })

    // Fetch existing blog
    useEffect(() => {
        if (!id || !token) return
        const fetchBlog = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (!res.ok) throw new Error("Failed to fetch blog")
                const json = await res.json()
                const data = json?.data;

                form.reset({
                    title: data.title,
                    shortDescription: data.shortDescription,
                    contentHtml: data.contentHtml,
                    contentText: data.contentText,
                    status: data.status,
                    category: data.category || [],
                    coverImage: undefined // We'll use CoverImageUploader initialUrl
                })
                setEditorContent(data.contentHtml || "")
                setCoverImage(data.image || "")
            } catch (err) {
                console.error(err)
            }
        }
        if (id) fetchBlog()
    }, [id, token])

    const [coverImage, setCoverImage] = useState("")

    const onSubmit = async (data: BlogFormData) => {
        try {
            setIsLoading(true)
            toast.loading("Updating blog...", { id: "blog-update" })

            const formData = new FormData()
            formData.append("title", data.title)
            formData.append("shortDescription", data.shortDescription)
            formData.append("contentHtml", data.contentHtml)
            formData.append("contentText", data.contentText)
            data.category.forEach(cat => formData.append("category[]", cat))
            if (data.coverImage) formData.append("cover-image", data.coverImage)
            formData.append("status", data.status)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs/${id}`, {
                method: "PUT",
                body: formData,
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!res.ok) throw new Error("Failed to update blog")
            toast.success("Blog updated successfully!", { id: "blog-update" })
            router.push("/admin/blogs")
        } catch (err) {
            console.error(err)
            toast.error("Something went wrong. Please try again.", { id: "blog-update" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-5xl mx-auto py-6 space-y-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-2">
                        <Button variant="link" size="icon" type="button" onClick={() => router.back()}>
                            <MoveLeft />
                        </Button>

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormControl>
                                        <Input
                                            placeholder="Blog title..."
                                            className="!text-2xl placeholder:text-2xl font-semibold border-none shadow-none focus-visible:ring-0"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger className="h-8 w-40 text-xs mr-4">
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="draft">Draft</SelectItem>
                                                <SelectItem value="published">Published</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="ml-auto w-[120px] h-8 flex items-center gap-2" size="sm" disabled={isLoading}>
                            {isLoading ? <Loader noPadding /> : <><Save size={16} /> Update</>}
                        </Button>
                    </div>

                    {/* Categories, Short Description, Cover Image, Content */}
                    <div className="w-full space-y-8">
                        {/* Categories */}
                        <FormField
                            control={form.control}
                            name="category"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <div className="flex gap-10 items-center">
                                        {categories.map(item => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem className="flex items-center gap-2">
                                                        <FormControl>
                                                            <Checkbox
                                                                className="mt-3 border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 hover:data-[state=checked]:bg-orange-600 focus:ring-2 focus:ring-orange-500"
                                                                checked={field.value?.includes(item.id)}
                                                                onCheckedChange={(checked) =>
                                                                    checked
                                                                        ? field.onChange([...field.value, item.id])
                                                                        : field.onChange(field.value.filter(v => v !== item.id))
                                                                }
                                                            />
                                                        </FormControl>
                                                        <FormLabel>{item.label}</FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Short Description */}
                        <FormField
                            control={form.control}
                            name="shortDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Short Description</FormLabel>
                                    <FormControl>
                                        <Textarea rows={2} placeholder="Short description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Cover Image */}
                        <FormField
                            control={form.control}
                            name="coverImage"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cover Image</FormLabel>
                                    <CoverImageUploader
                                        initialUrl={coverImage}
                                        onSelect={(file) => field.onChange(file)}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Rich Text Editor */}
                        <FormField
                            control={form.control}
                            name="contentHtml"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Blog Content</FormLabel>
                                    <div className="border rich-text-editor rounded-lg p-3 bg-white">
                                        <RichTextEditor
                                            content={editorContent}
                                            onChange={(html, text) => {
                                                field.onChange(html)
                                                form.setValue("contentText", text, { shouldValidate: true })
                                            }}
                                        />
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </form>
            </Form>
        </div>
    )
}
