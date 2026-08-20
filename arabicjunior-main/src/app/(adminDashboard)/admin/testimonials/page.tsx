"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MessageSquareQuote, Play, Plus, Star, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button-2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { revalidateContent } from "@/lib/revalidateContent";
import type { Testimonial } from "@/types/Testimonial";

const columns: ColumnDef<Testimonial>[] = [
  {
    accessorKey: "order",
    header: "Order",
    cell: ({ row }) => <span className="tabular-nums">{row.original.order}</span>,
  },
  {
    accessorKey: "authorName",
    header: "Name",
    cell: ({ row }) => (
      <div className="min-w-[160px]">
        <p className="font-medium">{row.original.authorName}</p>
        <p className="text-xs text-muted-foreground">{row.original.profession}</p>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) =>
      row.original.type === "video" ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          <Play size={11} /> Video
          <span className="font-normal opacity-70">
            {row.original.videoSource === "upload" ? "· file" : "· link"}
          </span>
        </span>
      ) : (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
          Text
        </span>
      ),
  },
  {
    accessorKey: "comment",
    header: "Comment",
    cell: ({ row }) =>
      row.original.comment ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="line-clamp-2 whitespace-normal break-words min-w-[280px] max-w-[280px] cursor-pointer">
              {row.original.comment}
            </p>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p>{row.original.comment}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1 tabular-nums">
        {row.original.rating}
        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          row.original.status === "published"
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
];

export default function TestimonialsPage() {
  const router = useRouter();
  const { token } = useAuthAdmin();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleting, setDeleting] = useState<Testimonial | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [selectedRows, setSelectedRows] = useState<Testimonial[]>([]);
  /** Bumped after a delete or a page change to clear the ticked rows. */
  const [selectionKey, setSelectionKey] = useState(0);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchTestimonials = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/testimonials?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      setTestimonials(json.data ?? []);
      setTotalPages(json.pagination?.totalPages || 1);
      setTotal(json.pagination?.total ?? 0);
    } catch (err) {
      console.error(err);
      setTestimonials([]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [token, currentPage, pageSize]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Ticks must not survive a page change: the rows behind them are gone, and a
  // later bulk delete would hit records nobody looked at.
  useEffect(() => {
    setSelectedRows([]);
    setSelectionKey((key) => key + 1);
  }, [currentPage, pageSize]);

  const handleBulkDelete = async () => {
    if (!selectedRows.length || !token) return;

    setBulkDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/testimonials/delete-many`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedRows.map((row) => row._id) }),
        }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || "Failed to delete");

      await revalidateContent(token);
      toast.success(json?.message || "Testimonials deleted");

      // The page may now be past the end — after deleting the only rows on
      // page 3, staying there would show "No results".
      const remaining = total - selectedRows.length;
      const lastPage = Math.max(1, Math.ceil(remaining / pageSize));
      if (currentPage > lastPage) {
        setCurrentPage(lastPage);
      } else {
        fetchTestimonials();
      }

      setSelectedRows([]);
      setSelectionKey((key) => key + 1);
      setOpenBulkDialog(false);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDelete = async () => {
    try {
      toast.loading("Deleting testimonial...", { id: "testimonial-delete" });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/testimonials/${deleting?._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete testimonial");

      await revalidateContent(token);

      toast.success("Testimonial deleted successfully!", { id: "testimonial-delete" });
      setOpenDialog(false);
      setDeleting(null);
      setSelectedRows([]);
      setSelectionKey((key) => key + 1);
      fetchTestimonials();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.", {
        id: "testimonial-delete",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold flex items-center gap-2">
          <MessageSquareQuote /> Testimonials
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
            {total.toLocaleString()} total
          </span>
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        These appear in the scrolling section on the homepage. Only{" "}
        <strong>published</strong> ones are shown, ordered by the display order.
      </p>

      <div className="flex flex-wrap justify-end items-center gap-3">
        {selectedRows.length > 0 && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setOpenBulkDialog(true)}
            className="h-8 gap-2 text-xs mr-auto"
          >
            <Trash2 size={16} /> Delete selected ({selectedRows.length})
          </Button>
        )}

        <Button
          size="sm"
          onClick={() => router.push("/admin/testimonials/new")}
          className="h-8 gap-2"
        >
          <Plus size={16} /> Add Testimonial
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={testimonials}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        enableSelection
        onSelectionChange={(rows) => setSelectedRows(rows as Testimonial[])}
        selectionResetKey={selectionKey}
        showActions={true}
        actions={["edit", "delete"]}
        onAction={(type, row) => {
          if (type === "edit") {
            router.push(`/admin/testimonials/${row._id}/edit`);
          } else if (type === "delete") {
            setDeleting(row);
            setOpenDialog(true);
          }
        }}
      />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Testimonial</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete the testimonial from{" "}
              <strong>{deleting?.authorName}</strong>? This action cannot be undone
              {deleting?.videoSource === "upload"
                ? ", and the uploaded video will be removed as well"
                : ""}
              .
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenDialog(false);
                  setDeleting(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk delete confirmation. Names who is going, not just how many —
          deleting a testimonial also removes its photo or video. */}
      <Dialog open={openBulkDialog} onOpenChange={setOpenBulkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Delete {selectedRows.length} testimonial
              {selectedRows.length === 1 ? "" : "s"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              They will be removed from the homepage along with their photos and
              videos. This cannot be undone.
            </p>

            <ul className="max-h-40 overflow-y-auto rounded-lg bg-muted/40 p-3 text-xs">
              {selectedRows.slice(0, 20).map((row) => (
                <li key={row._id} className="truncate">
                  {row.authorName} &mdash; {row.profession}
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
              >
                {bulkDeleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
