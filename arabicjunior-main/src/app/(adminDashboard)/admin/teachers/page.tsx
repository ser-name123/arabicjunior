"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { FileSpreadsheet, GraduationCap, Home, Plus, Star, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
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
import type { Teacher } from "@/types/Teacher";

const columns: ColumnDef<Teacher>[] = [
  {
    accessorKey: "order",
    header: "Order",
    cell: ({ row }) => <span className="tabular-nums">{row.original.order}</span>,
  },
  {
    accessorKey: "name",
    header: "Teacher",
    cell: ({ row }) => (
      <div className="flex items-center gap-3 min-w-[200px]">
        {/* Cloudinary and public/ URLs both appear here; next/image would need
            every host configured, and this is a small admin thumbnail. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={row.original.image}
          alt=""
          className="w-9 h-9 rounded-full object-cover bg-neutral-100 shrink-0"
        />
        <div className="min-w-0">
          <p className="font-medium truncate">{row.original.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {row.original.profession}
          </p>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "experience",
    header: "Experience",
    cell: ({ row }) => row.original.experience || <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "shortDescription",
    header: "About",
    cell: ({ row }) =>
      row.original.shortDescription ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <p className="line-clamp-2 whitespace-normal break-words min-w-[260px] max-w-[260px] cursor-pointer">
              {row.original.shortDescription}
            </p>
          </TooltipTrigger>
          <TooltipContent className="max-w-sm">
            <p>{row.original.shortDescription}</p>
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
    accessorKey: "showOnHomepage",
    header: "Homepage",
    cell: ({ row }) =>
      row.original.showOnHomepage ? (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
          <Home size={11} /> Yes
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">No</span>
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
];

export default function TeachersPage() {
  const router = useRouter();
  const { token } = useAuthAdmin();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleting, setDeleting] = useState<Teacher | null>(null);
  const [viewing, setViewing] = useState<Teacher | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [selectedRows, setSelectedRows] = useState<Teacher[]>([]);
  /** Bumped after a delete or a page change to clear the ticked rows. */
  const [selectionKey, setSelectionKey] = useState(0);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const fetchTeachers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/teachers?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      setTeachers(json.data ?? []);
      setTotalPages(json.pagination?.totalPages || 1);
      setTotal(json.pagination?.total ?? 0);
    } catch (err) {
      console.error(err);
      setTeachers([]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [token, currentPage, pageSize]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  // Ticks must not survive a page change: the rows behind them are gone, and a
  // later bulk delete would hit profiles nobody looked at.
  useEffect(() => {
    setSelectedRows([]);
    setSelectionKey((k) => k + 1);
  }, [currentPage, pageSize]);

  const handleBulkDelete = async () => {
    if (!selectedRows.length || !token) return;

    setBulkDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/teachers/delete-many`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ids: selectedRows.map((t) => t._id) }),
        }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || "Failed to delete");

      toast.success(json?.message || "Teachers deleted");

      // The page may now be past the end — after deleting the only rows on
      // page 2, staying there would show "No results".
      const remaining = total - selectedRows.length;
      const lastPage = Math.max(1, Math.ceil(remaining / pageSize));
      if (currentPage > lastPage) {
        setCurrentPage(lastPage);
      } else {
        fetchTeachers();
      }

      setSelectedRows([]);
      setSelectionKey((k) => k + 1);
      setOpenBulkDialog(false);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to delete");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleExport = async () => {
    if (!token) return;

    setExporting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/teachers/export`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch the teachers");

      const json = await res.json();
      const all: any[] = json.data ?? [];

      if (!all.length) {
        toast.error("There are no teachers to export");
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(
        all.map((t) => ({
          Order: t.order ?? "",
          Name: t.name,
          Title: t.profession,
          Experience: t.experience || "-",
          Education: t.education || "-",
          Subject: t.subject || "-",
          Grades: t.grade || "-",
          Rating: t.rating ?? "",
          Status: t.status,
          "On Homepage": t.showOnHomepage ? "Yes" : "No",
          About: t.shortDescription || "-",
          // The image links are included so a row can be traced back to its
          // photo without opening the admin panel.
          "Photo URL": t.image || "-",
          "Portrait URL": t.portrait || "-",
          "Added On": t.createdAt ? format(new Date(t.createdAt), "dd-MM-yyyy") : "-",
          "Last Updated": t.updatedAt ? format(new Date(t.updatedAt), "dd-MM-yyyy") : "-",
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Teachers");
      XLSX.writeFile(workbook, "teachers.xlsx");
      toast.success(`${all.length} teacher(s) exported`);
    } catch (error) {
      console.error(error);
      toast.error("Could not export the teachers");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    try {
      toast.loading("Deleting teacher...", { id: "teacher-delete" });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/teachers/${deleting?._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete teacher");

      await revalidateContent(token);

      toast.success("Teacher deleted successfully!", { id: "teacher-delete" });
      setOpenDialog(false);
      setSelectedRows([]);
      setSelectionKey((k) => k + 1);
      setDeleting(null);
      fetchTeachers();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.", { id: "teacher-delete" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold flex items-center gap-2">
          <GraduationCap /> Teachers
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
            {total.toLocaleString()} total
          </span>
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        These appear on the <strong>Teachers</strong> page, the{" "}
        <strong>About Us</strong> carousel and — when Homepage is on — the homepage
        slider. Only <strong>published</strong> teachers are shown.
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
          variant="secondary"
          onClick={handleExport}
          disabled={exporting}
          className="h-8 gap-2 text-black text-xs"
        >
          <FileSpreadsheet size={18} />
          {exporting ? "Exporting…" : "Export to Excel"}
        </Button>

        <Button
          size="sm"
          onClick={() => router.push("/admin/teachers/new")}
          className="h-8 gap-2"
        >
          <Plus size={16} /> Add Teacher
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={teachers}
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
        onSelectionChange={(rows) => setSelectedRows(rows as Teacher[])}
        selectionResetKey={selectionKey}
        showActions={true}
        actions={["view", "edit", "delete"]}
        onAction={(type, row) => {
          if (type === "view") {
            setViewing(row);
          } else if (type === "edit") {
            router.push(`/admin/teachers/${row._id}/edit`);
          } else if (type === "delete") {
            setDeleting(row);
            setOpenDialog(true);
          }
        }}
      />

      <TeacherDetailsDialog
        teacher={viewing}
        onClose={() => setViewing(null)}
        onEdit={(id) => router.push(`/admin/teachers/${id}/edit`)}
      />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Teacher</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete <strong>{deleting?.name}</strong>? They
              will be removed from the Teachers page, About Us and the homepage. This
              action cannot be undone.
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

      {/* Bulk Delete Confirmation. Names who is going, not just how many —
          deleting a teacher also removes their photos. */}
      <Dialog open={openBulkDialog} onOpenChange={setOpenBulkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Delete {selectedRows.length} teacher
              {selectedRows.length === 1 ? "" : "s"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              They will be removed from the Teachers page, About Us and the
              homepage, along with their photos. This cannot be undone.
            </p>

            <ul className="max-h-40 overflow-y-auto rounded-lg bg-muted/40 p-3 text-xs">
              {selectedRows.slice(0, 20).map((t) => (
                <li key={t._id} className="truncate">
                  {t.name} &mdash; {t.profession}
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

/**
 * Shows the whole record, including the fields the table has no room for —
 * education, subject, grades and the full-length photo — laid out the way the
 * public "View Details" popup presents them.
 */
function TeacherDetailsDialog({
  teacher,
  onClose,
  onEdit,
}: {
  teacher: Teacher | null;
  onClose: () => void;
  onEdit: (id: string) => void;
}) {
  const rows: [string, string][] = teacher
    ? [
        ["Title", teacher.profession],
        ["Grades", teacher.grade],
        ["Experience", teacher.experience],
        ["Education", teacher.education],
        ["Subject", teacher.subject],
        ["Rating", `${teacher.rating} / 5`],
        ["Display order", String(teacher.order)],
        ["On homepage", teacher.showOnHomepage ? "Yes" : "No"],
      ]
    : [];

  return (
    <Dialog open={Boolean(teacher)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{teacher?.name ?? "Teacher"}</DialogTitle>
        </DialogHeader>

        {teacher && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-start gap-5">
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={teacher.image}
                  alt={teacher.name}
                  className="w-28 h-28 rounded-full object-cover bg-neutral-100"
                />
                <p className="text-xs text-muted-foreground mt-2">Photo</p>
              </div>

              {teacher.portrait ? (
                <div className="text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={teacher.portrait}
                    alt={`${teacher.name} full length`}
                    className="w-24 h-28 object-contain rounded-xl bg-yellow-50 border"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Full-length</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-28 rounded-xl border border-dashed flex items-center justify-center text-xs text-muted-foreground px-2">
                    None
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Full-length</p>
                </div>
              )}

              <div className="flex-1 min-w-[180px] space-y-2">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                    teacher.status === "published"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {teacher.status}
                </span>

                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                  {rows.map(([label, value]) => (
                    <div key={label} className="contents">
                      <dt className="text-muted-foreground">{label}</dt>
                      <dd className="font-medium break-words">
                        {value || <span className="text-muted-foreground">—</span>}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-1">About</p>
              <p className="text-sm">
                {teacher.shortDescription || (
                  <span className="text-muted-foreground">
                    No description added yet.
                  </span>
                )}
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              Appears on the Teachers page and About Us
              {teacher.showOnHomepage ? ", and in the homepage slider" : ""}.
            </p>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button onClick={() => onEdit(teacher._id)}>Edit</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
