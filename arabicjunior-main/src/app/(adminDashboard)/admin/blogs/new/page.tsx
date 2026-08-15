"use client"

import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { MoveLeft, Save } from "lucide-react"

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
    FormDescription,
} from "@/components/ui/form"

import RichTextEditor from "@/components/rich-text-editor"
import CoverImageUploader from "@/components/CoverImagePicker"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { toast } from "sonner"
import Loader from "@/components/loader"
import useAuthAdmin from "@/hooks/useAuthAdmin"

const categories = [
    {
        id: "Curriculum",
        label: "Curriculum",
    },
    {
        id: "Grade",
        label: "Grade",
    },
    {
        id: "Exams",
        label: "Exams",
    },
    {
        id: "Schools",
        label: "Schools",
    }
] as const

// Validation schema
const blogSchema = z.object({
    title: z.string().min(10, "Title must be at least 10 characters.")
        .max(80, "Title should not exceed 80 characters."),
    shortDescription: z.string().min(50, "Short description must be at least 50 characters.")
        .max(160, "Short description should not exceed 160 characters."),
    contentHtml: z.string().min(1, "Content is required."),
    contentText: z.string().min(1, "Content text is required."),
    category: z.array(z.string()).refine((value) => value.some((item) => item), {
        message: "You have to select at least one category.",
    }),
    coverImage: z.instanceof(File, { message: "Cover image is required." }),
    status: z.enum(['draft', 'published'])
})

type BlogFormData = z.infer<typeof blogSchema>

export default function NewBlogPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { token } = useAuthAdmin()

    const form = useForm<BlogFormData>({
        resolver: zodResolver(blogSchema),
        defaultValues: {
            title: "",
            shortDescription: "",
            contentHtml: "",
            contentText: "",
            status: 'draft',
            category: ['Curriculum'],
            coverImage: undefined as any,
        },
    })

    const onSubmit = async (data: BlogFormData) => {
        try {
            setIsLoading(true)
            toast.loading("Saving blog...", { id: "blog-save" })

            const formData = new FormData()
            formData.append("title", data.title)
            formData.append("shortDescription", data.shortDescription)
            formData.append("contentHtml", data.contentHtml)
            formData.append("contentText", data.contentText)
            data.category.forEach((cat) => {
                formData.append("category[]", cat);
            });
            formData.append("cover-image", data.coverImage)
            formData.append("status", data.status)
            console.log(data)
            console.log(formData)
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs`, {
                method: "POST",
                body: formData,
                headers: { Authorization: `Bearer ${token}` }
            })

            if (!res.ok) throw new Error("Failed to save blog")


            toast.success("Blog saved successfully!", { id: "blog-save" })
            router.push("/admin/blogs")
        } catch (err) {
            console.error(err)
            toast.error("Something went wrong. Please try again.", { id: "blog-save" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-6 space-y-6">
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
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger className="h-9 w-40 text-xs mr-4">
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

                        <Button
                            type="submit"
                            className="ml-auto w-[120px] flex items-center gap-2"
                            size="sm"
                            disabled={isLoading}
                        >
                            {isLoading ? <div className="flex gap-2 items-center">
                                <Loader noPadding />
                                Saving...
                            </div> : <><Save size={16} /> Save</>}
                        </Button>
                    </div>

                    <div className="w-full space-y-8">
                        <FormField
                            control={form.control}
                            name="category"
                            render={() => (
                                <FormItem>
                                    <div className="-mb-3">
                                        <FormLabel className="text-base">Category</FormLabel>
                                    </div>

                                    <div className="flex gap-10 items-center">
                                        {categories.map((item) => (
                                            <FormField
                                                key={item.id}
                                                control={form.control}
                                                name="category"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={item.id}
                                                            className="flex flex-row items-center gap-2"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    className="mt-3 border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500 hover:data-[state=checked]:bg-orange-600 focus:ring-2 focus:ring-orange-500"
                                                                    checked={field.value?.includes(item.id)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, item.id])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== item.id
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="text-sm font-normal -mt-3">
                                                                {item.label}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
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
                                    <FormLabel className="text-base">Short description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={2}
                                            placeholder="Short description..."
                                            {...field}
                                        />
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
                                    <FormLabel className="text-base">Cover Image</FormLabel>

                                    <CoverImageUploader
                                        initialUrl={undefined} // for edit mode
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
                                    <FormLabel className="text-base">Blog Content</FormLabel>

                                    <div className="border rich-text-editor rounded-lg p-3 bg-white">
                                        <RichTextEditor
                                            content={field.value}
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