"use client"

import { useState, useEffect, useCallback } from "react"
import { DataTable } from "@/components/admin/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button-2"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Blog } from "@/types/Blog"
import { FileSpreadsheet, Newspaper, Plus, Trash2 } from "lucide-react"
import * as XLSX from "xlsx"
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
    const [total, setTotal] = useState(0)
    const [pageSize, setPageSize] = useState(10)

    const [selectedRows, setSelectedRows] = useState<Blog[]>([])
    /** Bumped after a delete or a page change to clear the ticked rows. */
    const [selectionKey, setSelectionKey] = useState(0)
    const [openBulkDialog, setOpenBulkDialog] = useState(false)
    const [bulkDeleting, setBulkDeleting] = useState(false)
    const [exporting, setExporting] = useState(false)

    const fetchBlogs = useCallback(async () => {
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
            setTotal(json.pagination?.total ?? 0)
        } catch (err) {
            console.error(err)
            setBlogs([])
        } finally {
            setTimeout(() => {
                setLoading(false)
            }, 500);
        }
    }, [currentPage, pageSize, token])

    // currentPage and pageSize were missing from this list, so the pagination
    // controls moved the page number without ever fetching the new page.
    useEffect(() => {
        if (token) fetchBlogs()
    }, [fetchBlogs, token])

    // Ticks must not survive a page change: the rows behind them are gone, and
    // a later bulk delete would hit posts nobody looked at.
    useEffect(() => {
        setSelectedRows([])
        setSelectionKey((k) => k + 1)
    }, [currentPage, pageSize])

    const handleBulkDelete = async () => {
        if (!selectedRows.length || !token) return

        setBulkDeleting(true)
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs/delete-many`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ ids: selectedRows.map((b) => b._id) }),
                }
            )
            const json = await res.json().catch(() => null)
            if (!res.ok) throw new Error(json?.message || "Failed to delete")

            toast.success(json?.message || "Blogs deleted")

            // The page may now be past the end — after deleting the only posts
            // on page 3, staying there would show "No results".
            const remaining = total - selectedRows.length
            const lastPage = Math.max(1, Math.ceil(remaining / pageSize))
            if (currentPage > lastPage) {
                setCurrentPage(lastPage)
            } else {
                fetchBlogs()
            }

            setSelectedRows([])
            setSelectionKey((k) => k + 1)
            setOpenBulkDialog(false)
        } catch (error) {
            console.error(error)
            toast.error(error instanceof Error ? error.message : "Failed to delete")
        } finally {
            setBulkDeleting(false)
        }
    }

    const handleExport = async () => {
        if (!token) return

        setExporting(true)
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/blogs/export`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (!res.ok) throw new Error("Failed to fetch the blogs")

            const json = await res.json()
            const all: any[] = json.data ?? []

            if (!all.length) {
                toast.error("There are no blogs to export")
                return
            }

            const worksheet = XLSX.utils.json_to_sheet(
                all.map((b) => ({
                    Title: b.title,
                    Slug: b.slug,
                    "Short Description": b.shortDescription,
                    Status: b.status,
                    Category: Array.isArray(b.category) ? b.category.join(", ") : "",
                    Author: b.author?.name ?? "",
                    "Read Time": b.readTime ?? "",
                    // The live address, so a row can be opened straight from the sheet.
                    URL: `https://arabicjuniors.com/blogs/${b.slug}`,
                    "Created On": b.createdAt ? format(new Date(b.createdAt), "dd-MM-yyyy") : "-",
                    "Last Updated": b.updatedAt ? format(new Date(b.updatedAt), "dd-MM-yyyy") : "-",
                }))
            )
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Blogs")
            XLSX.writeFile(workbook, "blogs.xlsx")
            toast.success(`${all.length} blog(s) exported`)
        } catch (error) {
            console.error(error)
            toast.error("Could not export the blogs")
        } finally {
            setExporting(false)
        }
    }

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
            setSelectedRows([])
            setSelectionKey((k) => k + 1)
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
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
                        {total.toLocaleString()} total
                    </span>
                </h3>
            </div>

            <div className="flex flex-wrap justify-end items-center gap-3">
                {selectedRows.length > 0 && (
                    <Button
                        size={'sm'}
                        variant={'destructive'}
                        onClick={() => setOpenBulkDialog(true)}
                        className="h-8 gap-2 text-xs mr-auto"
                    >
                        <Trash2 size={16} /> Delete selected ({selectedRows.length})
                    </Button>
                )}

                <Button
                    size={'sm'}
                    variant={'secondary'}
                    onClick={handleExport}
                    disabled={exporting}
                    className="h-8 gap-2 text-black text-xs"
                >
                    <FileSpreadsheet size={18} />
                    {exporting ? "Exporting…" : "Export to Excel"}
                </Button>

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
                enableSelection
                onSelectionChange={(rows) => setSelectedRows(rows as Blog[])}
                selectionResetKey={selectionKey}
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


            {/* Bulk Delete Confirmation. Names which posts are going, not just
                how many — deleting a blog also removes its cover image. */}
            <Dialog open={openBulkDialog} onOpenChange={setOpenBulkDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Delete {selectedRows.length} blog
                            {selectedRows.length === 1 ? "" : "s"}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-neutral-500">
                            This permanently removes the selected posts and their cover
                            images. It cannot be undone.
                        </p>

                        <ul className="max-h-40 overflow-y-auto rounded-lg bg-muted/40 p-3 text-xs">
                            {selectedRows.slice(0, 20).map((b) => (
                                <li key={b._id} className="truncate">
                                    {b.title}
                                </li>
                            ))}
                            {selectedRows.length > 20 && (
                                <li className="pt-1 font-semibold">
                                    …and {selectedRows.length - 20} more
                                </li>
                            )}
                        </ul>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                disabled={bulkDeleting}
                                onClick={() => setOpenBulkDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleBulkDelete}
                                disabled={bulkDeleting}
                                className="bg-red-600 text-white hover:bg-red-700"
                            >
                                {bulkDeleting ? "Deleting…" : "Delete"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
