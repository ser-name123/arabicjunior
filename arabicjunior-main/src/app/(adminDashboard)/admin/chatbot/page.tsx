"use client";

import { useState, useEffect } from "react";
import { DataTable } from "@/components/admin/data-table";
import { ColumnDef } from "@tanstack/react-table";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { MessageSquare, Calendar, Globe, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button-2";
import { Input } from "@/components/ui/input-2";
import { format } from "date-fns";
import { toast } from "sonner";

type ChatbotSession = {
  _id: string;
  name: string;
  email: string;
  ip: string;
  city: string;
  country: string;
  createdAt: string;
};

const columns: ColumnDef<ChatbotSession>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email Address" },
  { accessorKey: "ip", header: "IP Address" },
  {
    accessorKey: "city",
    header: "Location",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1">
        <Globe className="w-3.5 h-3.5 text-neutral-450" />
        {row.original.city}, {row.original.country}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Submitted At",
    cell: ({ row }) => (
      <span className="inline-flex items-center gap-1.5 text-xs text-neutral-500">
        <Calendar className="w-3.5 h-3.5" />
        {format(new Date(row.original.createdAt), "dd-MM-yyyy HH:mm")}
      </span>
    ),
  },
];

export default function ChatbotLeadsPage() {
  const { token } = useAuthAdmin();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState<ChatbotSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [deletingSession, setDeletingSession] = useState<ChatbotSession | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1); // reset to page 1
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch chatbot sessions from API
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/chatbot/sessions?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch chatbot sessions");

      const json = await res.json();
      setData(json.data ?? []);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Error fetching chatbot sessions:", err);
      setData([]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [debouncedSearch, currentPage, pageSize, token]);

  // Handle delete action
  const handleDeleteSession = async () => {
    if (!deletingSession || !token) return;
    toast.loading("Deleting chatbot lead...", { id: "chatbot-delete" });
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/chatbot/sessions/${deletingSession._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete lead");
      
      toast.success("Chatbot lead deleted successfully!", { id: "chatbot-delete" });
      setOpenDeleteDialog(false);
      setDeletingSession(null);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete chatbot lead", { id: "chatbot-delete" });
    }
  };

  return (
    <div className="space-y-6 w-full text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-black">
            <MessageSquare className="h-6 w-6 text-orange-500" /> Chatbot Lead Submissions
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            View details and geolocation metadata collected from the website chatbot widget.
          </p>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Input
            placeholder="Search by Name, Email, Location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs border-neutral-200 focus-within:border-orange-400 bg-white"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border shadow-sm">
        <DataTable
          columns={columns}
          data={data}
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
          actions={["delete"]}
          onAction={(type, row) => {
            if (type === "delete") {
              setDeletingSession(row as ChatbotSession);
              setOpenDeleteDialog(true);
            }
          }}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="max-w-md bg-white text-black p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Chatbot Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              Are you sure you want to delete the chatbot lead for{" "}
              <strong>{deletingSession?.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setOpenDeleteDialog(false);
                  setDeletingSession(null);
                }}
                className="text-black border"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSession}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
