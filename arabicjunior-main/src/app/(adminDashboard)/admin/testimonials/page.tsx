"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { MessageSquareQuote, Play, Plus, Star } from "lucide-react";
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
  const [pageSize, setPageSize] = useState(10);

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
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        These appear in the scrolling section on the homepage. Only{" "}
        <strong>published</strong> ones are shown, ordered by the display order.
      </p>

      <div className="flex justify-end items-center">
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
    </div>
  );
}
