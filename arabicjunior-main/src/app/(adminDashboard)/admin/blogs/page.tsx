"use client"

import { useState, useEffect } from "react"
import { DataTable } from "@/components/admin/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button-2"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Blog } from "@/types/Blog"
import { Newspaper, Plus } from "lucide-react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import useAuthAdmin from "@/hooks/useAuthAdmin"
import { toast } from "sonner"

const columns: ColumnDef<Blog>[] = [
    {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
            <Tooltip>
                <TooltipTrigger asChild>
                    <p className="line-clamp-3 whitespace-normal break-words min-w-[250px] max-w-[250px] cursor-pointer">
                        {row.original.title}
                    </p>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{row.original.title}</p>
                </TooltipContent>
            </Tooltip>
        )
    },
    {
        accessorKey: "shortDescription",
        header: "Description",
        cell: ({ row }) => (
            <Tooltip>
                <TooltipTrigger asChild>
                    <p className="line-clamp-2 whitespace-normal break-words min-w-[300px] max-w-[300px] cursor-pointer">
                        {row.original.shortDescription}
                    </p>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{row.original.shortDescription}</p>
                </TooltipContent>
            </Tooltip>
        )
    },
    {
        accessorKey: "slug", header: "Slug",
        cell: ({ row }) => (
            <Tooltip>
                <TooltipTrigger asChild>
                    <p className="line-clamp-3 whitespace-normal break-words min-w-[200px] max-w-[200px] cursor-pointer">
                        {row.original.slug}
                    </p>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{row.original.slug}</p>
                </TooltipContent>
            </Tooltip>
        )
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${row.original.status === "published"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                    }`}
            >
                {row.original.status}
            </span>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Created On",
        cell: ({ row }) => format(new Date(row.original.createdAt), "dd-MM-yyyy"),
    },
]

export default function BlogsPage() {
    const router = useRouter();
    const { token } = useAuthAdmin()

    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(false)
    const [openDialog, setOpenDialog] = useState(false)
    const [deletingBlog, setDeletingBlog] = useState<Blog | null>(null)

    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const fetchBlogs = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                search: '',
                page: currentPage.toString(),
                limit: pageSize.toString()
            })
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs?${params.toString()}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` }
            })
            const json = await res.json()
            setBlogs(json.data ?? [])
            setTotalPages(json.pagination?.totalPages || 1)
        } catch (err) {
            console.error(err)
            setBlogs([])
        } finally {
            setTimeout(() => {
                setLoading(false)
            }, 500);
        }
    }

    // Fetch Blogs
    useEffect(() => {
        if (token) fetchBlogs()
    }, [token])

    // Handle Save Blog
    const handleDelete = async () => {
        try {
            toast.loading("Deleting blog...", { id: "blog-delete" })
            const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs/${deletingBlog?._id}`

            const res = await fetch(url, {
                method: 'DELETE',
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
            })

            if (!res.ok) throw new Error("Failed to save blog")
            toast.success("Blog deleted successfully!", { id: "blog-delete" })

            setOpenDialog(false)
            setDeletingBlog(null)
            // Refresh
            fetchBlogs()
        } catch (err) {
            console.error(err)
            toast.error("Something went wrong. Please try again.", { id: "blog-delete" })
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-semibold flex items-center gap-2">
                    <Newspaper /> Blogs
                </h3>
            </div>

            <div className="flex justify-end items-center">

                <Button size={'sm'} onClick={() => router.push('/admin/blogs/new')} className="h-8 gap-2">
                    <Plus size={16} /> Add Blog
                </Button>
            </div>
            <DataTable
                columns={columns}
                data={blogs}
                loading={loading}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                    setPageSize(size)
                    setCurrentPage(1)
                }}
                showActions={true}
                actions={["edit", "delete"]}
                onAction={(type, row) => {
                    if (type === "edit") {
                        router.push(`/admin/blogs/${row._id}/edit`)
                    } else if (type === "delete") {
                        setDeletingBlog(row)
                        setOpenDialog(true)
                    }
                }}
            />

            {/* Delete Blog Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete Blog</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>Are you sure you want to delete the blog <strong>{deletingBlog?.title}</strong>? This action cannot be undone.</p>
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setOpenDialog(false);
                                    setDeletingBlog(null);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    )
}
