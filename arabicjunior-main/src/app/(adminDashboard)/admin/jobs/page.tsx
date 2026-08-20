"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Briefcase, Plus, FileText, CheckCircle2, User, Globe, Calendar, Award, DollarSign, Clock, MapPin, Mail, Phone, ExternalLink, Maximize2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { DataTable } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button-2";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useAuthAdmin from "@/hooks/useAuthAdmin";

/** PDF, JPG, DOCX… taken from the stored Cloudinary link. */
const fileExtension = (url?: string): string => {
  if (!url) return "";
  const lastSegment = url.split("?")[0].split("/").pop() || "";
  const dot = lastSegment.lastIndexOf(".");
  return dot > -1 ? lastSegment.slice(dot + 1).toUpperCase() : "";
};

/**
 * The name the candidate gave the file. Applications submitted before the
 * server started keeping it have nothing to show, and the Cloudinary link is a
 * random id — so those fall back to the numbered label plus the file type
 * rather than a meaningless string of characters.
 */
const documentLabel = (app: any, slot: number): string => {
  const stored = app?.[`doc_${slot}_name`];
  if (typeof stored === "string" && stored.trim()) return stored.trim();

  const extension = fileExtension(app?.[`doc_${slot}`]);
  return extension ? `Document ${slot} (${extension})` : `Document ${slot}`;
};

/** The slots that actually hold a file, in order. */
const filledDocumentSlots = (app: any): number[] =>
  [1, 2, 3, 4].filter((slot) => Boolean(app?.[`doc_${slot}`]));

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "order",
    header: "Order",
    cell: ({ row }) => <span className="tabular-nums">{row.original.order}</span>,
  },
  {
    accessorKey: "title",
    header: "Job Title",
    cell: ({ row }) => (
      <div className="min-w-[180px]">
        <p className="font-semibold text-black">{row.original.title}</p>
        <p className="text-xs text-muted-foreground">{row.original.department}</p>
      </div>
    ),
  },
  {
    accessorKey: "jobLocation",
    header: "Location",
    cell: ({ row }) => <span className="text-black">{row.original.jobLocation}</span>,
  },
  {
    accessorKey: "employmentType",
    header: "Type",
    cell: ({ row }) => <span className="text-black">{row.original.employmentType}</span>,
  },
  {
    accessorKey: "jobType",
    header: "Experience Detail",
    cell: ({ row }) => <span className="text-black">{row.original.jobType}</span>,
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

export default function JobsPage() {
  const router = useRouter();
  const { token } = useAuthAdmin();

  const [activeTab, setActiveTab] = useState<"positions" | "applications">("positions");

  // Job Positions State
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleting, setDeleting] = useState<any | null>(null);

  // Teacher Registrations State
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [openAppDialog, setOpenAppDialog] = useState(false);
  const [deletingApp, setDeletingApp] = useState<any | null>(null);

  // Application Details View State
  const [viewingApp, setViewingApp] = useState<any | null>(null);
  const [openViewModal, setOpenViewModal] = useState(false);

  // Bulk selection. Kept per tab, because the two tables hold different things
  // and a tick carried across would delete the wrong kind of record.
  const [selectedJobs, setSelectedJobs] = useState<any[]>([]);
  const [selectedApps, setSelectedApps] = useState<any[]>([]);
  const [selectionKey, setSelectionKey] = useState(0);
  const [openBulkJobsDialog, setOpenBulkJobsDialog] = useState(false);
  const [openBulkAppsDialog, setOpenBulkAppsDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchJobs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/jobs`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      setJobs(json.data ?? []);
    } catch (err) {
      console.error(err);
      setJobs([]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [token]);

  const fetchApplications = useCallback(async () => {
    if (!token) return;
    setLoadingApps(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/teacher-registrations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      setApplications(json.data ?? []);
    } catch (err) {
      console.error(err);
      setApplications([]);
    } finally {
      setTimeout(() => setLoadingApps(false), 300);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchJobs();
      fetchApplications();
    }
  }, [token, fetchJobs, fetchApplications]);

  const handleDelete = async () => {
    try {
      toast.loading("Deleting job opening...", { id: "job-delete" });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/jobs/${deleting?._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete job");

      toast.success("Job opening deleted successfully!", { id: "job-delete" });
      setOpenDialog(false);
      setDeleting(null);
      fetchJobs();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.", { id: "job-delete" });
    }
  };

  // Switching tabs clears both sets: the rows behind the ticks are no longer on
  // screen, and a bulk delete afterwards would hit records nobody looked at.
  useEffect(() => {
    setSelectedJobs([]);
    setSelectedApps([]);
    setSelectionKey((key) => key + 1);
  }, [activeTab]);

  const handleBulkDeleteJobs = async () => {
    if (!selectedJobs.length || !token) return;

    setBulkDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/jobs/delete-many`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedJobs.map((row) => row._id) }),
        }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || "Failed to delete");

      toast.success(json?.message || "Positions deleted");
      setSelectedJobs([]);
      setSelectionKey((key) => key + 1);
      setOpenBulkJobsDialog(false);
      fetchJobs();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleBulkDeleteApps = async () => {
    if (!selectedApps.length || !token) return;

    setBulkDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/teacher-registrations/delete-many`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedApps.map((row) => row._id) }),
        }
      );
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || "Failed to delete");

      toast.success(json?.message || "Applications deleted");
      setSelectedApps([]);
      setSelectionKey((key) => key + 1);
      setOpenBulkAppsDialog(false);
      fetchApplications();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDeleteApp = async () => {
    try {
      toast.loading("Deleting application...", { id: "app-delete" });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/teacher-registrations/${deletingApp?._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete application");

      toast.success("Teacher registration deleted successfully!", { id: "app-delete" });
      setOpenAppDialog(false);
      setDeletingApp(null);
      fetchApplications();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.", { id: "app-delete" });
    }
  };

  const appColumns: ColumnDef<any>[] = [
    {
      accessorKey: "first_name",
      header: "Teacher Candidate",
      cell: ({ row }) => (
        <div className="min-w-[280px] py-1 text-black flex items-center gap-2.5">
          {row.original.personal_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.original.personal_image}
              alt=""
              className="w-10 h-10 rounded-full object-cover bg-neutral-100 border shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-semibold shrink-0">
              {row.original.first_name[0]}{row.original.last_name[0]}
            </div>
          )}
          <div>
            <p className="font-semibold text-sm">
              {row.original.first_name} {row.original.last_name}
            </p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
            <p className="text-xs text-muted-foreground">
              {row.original.country_code ? `(${row.original.country_code}) ` : ""}
              {row.original.whatsapp_number || "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "occupation",
      header: "Occupation / Desire",
      cell: ({ row }) => (
        <div className="text-black max-w-[180px] w-[180px] truncate">
          <p className="font-medium text-xs truncate" title={row.original.occupation}>
            {row.original.occupation}
          </p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
            {row.original.employment_desire}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "expected_salary",
      header: "Salary & Hours",
      cell: ({ row }) => (
        <div className="text-xs text-neutral-600 space-y-0.5">
          <p><strong>Expected:</strong> AED {row.original.expected_salary}</p>
          <p><strong>Hours/Week:</strong> {row.original.work_hours} hrs</p>
        </div>
      ),
    },
    {
      accessorKey: "personal_image",
      header: "Supporting Docs",
      cell: ({ row }) => {
        // The badges stay short so the column keeps its width; the real file
        // name is on the tooltip.
        const docs = filledDocumentSlots(row.original).map((slot) => ({
          label: `Doc ${slot}`,
          title: documentLabel(row.original, slot),
          url: row.original[`doc_${slot}`] as string,
        }));

        return (
          <div className="flex flex-wrap gap-1">
            {docs.length === 0 ? (
              <span className="text-xs text-neutral-400 italic">No files</span>
            ) : (
              docs.map((doc, idx) => (
                <a
                  key={idx}
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  title={doc.title}
                  className="px-2 py-0.5 border rounded text-[10px] font-semibold text-orange-500 border-orange-200 bg-orange-50 hover:bg-orange-100 transition-colors shadow-sm inline-flex items-center gap-0.5"
                >
                  {doc.label} <ExternalLink size={8} />
                </a>
              ))
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Applied On",
      cell: ({ row }) => (
        <span className="text-xs text-neutral-500">
          {new Date(row.original.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-black">
            <Briefcase className="h-6 w-6 text-orange-500" /> Jobs & Hiring Center
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Manage your active job listings and view submissions from the teacher registration form in one place.
          </p>
        </div>
        {selectedJobs.length > 0 && activeTab === "positions" && (
          <Button
            onClick={() => setOpenBulkJobsDialog(true)}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white self-start"
          >
            <Trash2 size={16} /> Delete selected ({selectedJobs.length})
          </Button>
        )}

        {selectedApps.length > 0 && activeTab === "applications" && (
          <Button
            onClick={() => setOpenBulkAppsDialog(true)}
            className="gap-2 bg-red-600 hover:bg-red-700 text-white self-start"
          >
            <Trash2 size={16} /> Delete selected ({selectedApps.length})
          </Button>
        )}

        {activeTab === "positions" && (
          <Button
            onClick={() => router.push("/admin/jobs/new")}
            className="gap-2 bg-gradient-to-r from-[#FF60A8] to-[#FB6238] hover:from-[#e05493] hover:to-[#e05731] text-white self-start"
          >
            <Plus size={16} /> Add Job Position
          </Button>
        )}
      </div>

      {/* Segmented Tab Headers */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => setActiveTab("positions")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
            activeTab === "positions"
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Active Job Positions ({jobs.length})
        </button>
        <button
          onClick={() => setActiveTab("applications")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === "applications"
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          Received Applications ({applications.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "positions" ? (
        <div className="bg-white rounded-xl border shadow-sm">
          <DataTable
            columns={columns}
            data={jobs}
            loading={loading}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
            pageSize={100}
            onPageSizeChange={() => {}}
            enableSelection
            onSelectionChange={(rows) => setSelectedJobs(rows as any[])}
            selectionResetKey={`jobs-${selectionKey}`}
            showActions={true}
            actions={["edit", "delete"]}
            onAction={(type, row) => {
              if (type === "edit") {
                router.push(`/admin/jobs/${row._id}/edit`);
              } else if (type === "delete") {
                setDeleting(row);
                setOpenDialog(true);
              }
            }}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm">
          <DataTable
            columns={appColumns}
            data={applications}
            loading={loadingApps}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
            pageSize={100}
            onPageSizeChange={() => {}}
            enableSelection
            onSelectionChange={(rows) => setSelectedApps(rows as any[])}
            selectionResetKey={`apps-${selectionKey}`}
            showActions={true}
            actions={["view", "delete"]}
            onAction={(type, row) => {
              if (type === "view") {
                setViewingApp(row);
                setOpenViewModal(true);
              } else if (type === "delete") {
                setDeletingApp(row);
                setOpenAppDialog(true);
              }
            }}
          />
        </div>
      )}

      {/* Delete Job Modal */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Delete Job Position</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-neutral-650 text-sm">
              Are you sure you want to delete <strong>{deleting?.title}</strong>? It
              will be removed from the Careers Page. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenDialog(false);
                  setDeleting(null);
                }}
                className="text-black"
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Application Modal */}
      <Dialog open={openAppDialog} onOpenChange={setOpenAppDialog}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-black">Delete Candidate Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-neutral-650 text-sm">
              Are you sure you want to delete the registration from <strong>{deletingApp?.first_name} {deletingApp?.last_name}</strong>?
              This will permanently delete their registration details and files.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenAppDialog(false);
                  setDeletingApp(null);
                }}
                className="text-black"
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteApp} className="bg-red-600 text-white hover:bg-red-700">
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk delete: job positions. */}
      <Dialog open={openBulkJobsDialog} onOpenChange={setOpenBulkJobsDialog}>
        <DialogContent className="max-w-md bg-white text-black p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              Delete {selectedJobs.length} position
              {selectedJobs.length === 1 ? "" : "s"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              These will be removed from the Careers page. Applications already
              received are kept.
            </p>

            <ul className="max-h-40 overflow-y-auto rounded-lg bg-neutral-50 border p-3 text-xs">
              {selectedJobs.slice(0, 20).map((row) => (
                <li key={row._id} className="truncate">
                  {row.title} &mdash; {row.department}
                </li>
              ))}
              {selectedJobs.length > 20 && (
                <li className="pt-1 font-semibold">
                  …and {selectedJobs.length - 20} more
                </li>
              )}
            </ul>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={bulkDeleting}
                onClick={() => setOpenBulkJobsDialog(false)}
                className="text-black"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDeleteJobs}
                disabled={bulkDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {bulkDeleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk delete: candidate applications. */}
      <Dialog open={openBulkAppsDialog} onOpenChange={setOpenBulkAppsDialog}>
        <DialogContent className="max-w-md bg-white text-black p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              Delete {selectedApps.length} application
              {selectedApps.length === 1 ? "" : "s"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              Their photos and uploaded documents are deleted too. This cannot be
              undone.
            </p>

            <ul className="max-h-40 overflow-y-auto rounded-lg bg-neutral-50 border p-3 text-xs">
              {selectedApps.slice(0, 20).map((row) => (
                <li key={row._id} className="truncate">
                  {row.first_name} {row.last_name} &mdash; {row.email}
                </li>
              ))}
              {selectedApps.length > 20 && (
                <li className="pt-1 font-semibold">
                  …and {selectedApps.length - 20} more
                </li>
              )}
            </ul>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={bulkDeleting}
                onClick={() => setOpenBulkAppsDialog(false)}
                className="text-black"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleBulkDeleteApps}
                disabled={bulkDeleting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {bulkDeleting ? "Deleting…" : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Application Details View Dialog */}
      <Dialog open={openViewModal} onOpenChange={setOpenViewModal}>
        <DialogContent className="max-w-3xl bg-white overflow-y-auto max-h-[90vh] p-6 rounded-xl text-black">
          <DialogHeader className="border-b pb-4 mb-4">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="text-orange-500" /> Candidate Profile: {viewingApp?.first_name} {viewingApp?.last_name}
            </DialogTitle>
          </DialogHeader>

          {viewingApp && (
            <div className="space-y-6">
              {/* Header Profile Summary */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-neutral-50 p-4 rounded-xl border">
                {viewingApp.personal_image ? (
                  // The thumbnail is too small to judge a candidate by, so it
                  // opens the full-size upload in a new tab.
                  <a
                    href={viewingApp.personal_image}
                    target="_blank"
                    rel="noreferrer"
                    title="Open the full-size photo"
                    className="group relative shrink-0 rounded-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={viewingApp.personal_image}
                      alt="Personal"
                      className="w-20 h-20 rounded-full object-cover border bg-white shadow"
                    />
                    <span className="absolute inset-0 flex items-center justify-center rounded-full bg-scrim/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                      <Maximize2 size={16} />
                    </span>
                  </a>
                ) : (
                  <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center text-2xl font-bold text-orange-500">
                    {viewingApp.first_name[0]}{viewingApp.last_name[0]}
                  </div>
                )}
                <div className="text-center sm:text-left space-y-1">
                  <h3 className="text-xl font-bold">{viewingApp.first_name} {viewingApp.last_name}</h3>
                  <p className="text-sm font-semibold text-neutral-600 uppercase tracking-wide inline-flex items-center gap-1.5">
                    <Briefcase size={14} className="text-orange-500" /> {viewingApp.occupation}
                  </p>
                  <p className="text-xs text-neutral-500 flex items-center gap-1 justify-center sm:justify-start">
                    <Globe size={12} className="text-neutral-400" /> {viewingApp.nationality} · Lives in {viewingApp.where_live}
                  </p>
                </div>
              </div>

              {/* Data Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="border rounded-xl p-4 space-y-3 bg-white">
                  <h4 className="font-bold text-sm text-orange-500 border-b pb-1.5 flex items-center gap-1.5">
                    <Phone size={14} /> Contact Details
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Email Address:</span>
                      <a href={`mailto:${viewingApp.email}`} className="font-semibold text-orange-500 hover:underline">{viewingApp.email}</a>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-neutral-500">WhatsApp Phone:</span>
                      <span className="font-semibold">
                        {viewingApp.country_code ? `(${viewingApp.country_code}) ` : ""}
                        {viewingApp.whatsapp_number || "—"}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Facebook Profile ID:</span>
                      <span className="font-semibold">{viewingApp.fb_id || "—"}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Residential Address:</span>
                      <span className="font-semibold text-right max-w-[200px] truncate" title={viewingApp.address}>{viewingApp.address || "—"}</span>
                    </li>
                  </ul>
                </div>

                {/* Engagement Expectations */}
                <div className="border rounded-xl p-4 space-y-3 bg-white">
                  <h4 className="font-bold text-sm text-orange-500 border-b pb-1.5 flex items-center gap-1.5">
                    <DollarSign size={14} /> Employment Desire
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Desire Type:</span>
                      <span className="font-semibold uppercase">{viewingApp.employment_desire}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Expected Salary (AED):</span>
                      <span className="font-bold text-green-700">AED {viewingApp.expected_salary}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Work Hours/Week:</span>
                      <span className="font-semibold">{viewingApp.work_hours} hrs</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Interview Availability:</span>
                      <span className="font-semibold uppercase text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">{viewingApp.preferred_interview_time}</span>
                    </li>
                  </ul>
                </div>

                {/* Professional Qualifications */}
                <div className="border rounded-xl p-4 space-y-3 bg-white">
                  <h4 className="font-bold text-sm text-orange-500 border-b pb-1.5 flex items-center gap-1.5">
                    <Award size={14} /> Qualifications
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <p className="text-neutral-500 font-medium">Education & Degrees:</p>
                      <p className="font-semibold text-neutral-800 mt-0.5">{viewingApp.education}</p>
                    </div>
                    <div>
                      <p className="text-neutral-500 font-medium">Teaching Experience:</p>
                      <p className="font-semibold text-neutral-800 mt-0.5">{viewingApp.teaching_experience}</p>
                    </div>
                  </div>
                </div>

                {/* Languages & Personal */}
                <div className="border rounded-xl p-4 space-y-3 bg-white">
                  <h4 className="font-bold text-sm text-orange-500 border-b pb-1.5 flex items-center gap-1.5">
                    <Globe size={14} /> Personal Details
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Mother Tongue:</span>
                      <span className="font-semibold uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded text-[10px]">{viewingApp.mother_lang}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Other Languages:</span>
                      <span className="font-semibold uppercase truncate max-w-[160px]" title={viewingApp.other_langs?.join(", ")}>
                        {viewingApp.other_langs?.join(", ") || "—"}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Gender / Status:</span>
                      <span className="font-semibold">{viewingApp.gender} · {viewingApp.materials_status}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-neutral-500">Birth Date:</span>
                      <span className="font-semibold">{viewingApp.birth}</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Bio & Intro Text blocks */}
              <div className="space-y-4">
                <div className="border rounded-xl p-4 bg-neutral-50/50">
                  <h4 className="font-bold text-sm text-neutral-800 border-b pb-1 mb-2">Introduction</h4>
                  <p className="text-xs text-neutral-600 whitespace-pre-wrap leading-relaxed">{viewingApp.introduce_yourself}</p>
                </div>

                <div className="border rounded-xl p-4 bg-neutral-50/50">
                  <h4 className="font-bold text-sm text-neutral-800 border-b pb-1 mb-2">Why make an ideal candidate?</h4>
                  <p className="text-xs text-neutral-600 whitespace-pre-wrap leading-relaxed">{viewingApp.what_make_ideal}</p>
                </div>
              </div>

              {/* Attachments / Supporting Documents */}
              <div className="border rounded-xl p-4 space-y-3 bg-white">
                <h4 className="font-bold text-sm text-orange-500 border-b pb-1.5 flex items-center gap-1.5">
                  <FileText size={14} /> Attached Credentials & Supporting Documents
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {filledDocumentSlots(viewingApp).length === 0 ? (
                    <p className="text-xs text-neutral-400 col-span-full italic text-center py-2">No supporting documents uploaded.</p>
                  ) : (
                    filledDocumentSlots(viewingApp).map((slot) => {
                      // Already carries its own extension, either from the
                      // stored name or from the fallback label.
                      const name = documentLabel(viewingApp, slot);

                      return (
                        <a
                          key={slot}
                          href={viewingApp[`doc_${slot}`]}
                          target="_blank"
                          rel="noreferrer"
                          title={name}
                          className="flex flex-col items-center justify-center p-3 border rounded-lg hover:bg-neutral-50 text-center transition-all bg-neutral-50/20"
                        >
                          <FileText className="text-orange-500 h-8 w-8 mb-1.5" />
                          {/* A long file name must not stretch the tile, so it
                              truncates and the full name sits on the tooltip. */}
                          <span className="w-full truncate text-[10px] font-semibold text-neutral-700">
                            {name}
                          </span>
                        </a>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Close Button Footer */}
              <div className="flex justify-end pt-3 border-t">
                <Button onClick={() => setOpenViewModal(false)}>
                  Close Profile
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
