"use client";

import { useCallback, useEffect, useState } from "react";
import { DataTable } from "@/components/admin/data-table";
import { ColumnDef } from "@tanstack/react-table";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import {
  Calendar,
  Globe,
  Headphones,
  MessageCircle,
  MessageSquare,
  Settings2,
  HelpCircle,
  Bot,
  Trash2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button-2";
import { Input } from "@/components/ui/input-2";
import { format } from "date-fns";
import { toast } from "sonner";
import ChatbotQaManager from "@/components/admin/chatbot/ChatbotQaManager";
import ChatbotSettingsForm from "@/components/admin/chatbot/ChatbotSettingsForm";

type ChatbotMessage = {
  role: "user" | "bot";
  text: string;
  source?: string;
  at: string;
};

type ChatbotSession = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  ip: string;
  city: string;
  country: string;
  messageCount: number;
  lastMessageAt: string | null;
  handedOffToOperator: boolean;
  messages?: ChatbotMessage[];
  createdAt: string;
};

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

/** Where a reply came from, in words an admin can act on. */
const SOURCE_LABELS: Record<string, string> = {
  ai: "AI",
  qa: "Your own answer",
  knowledge: "Website content",
  "quick-reply": "Quick reply button",
  greeting: "Greeting",
  fallback: "Not found",
};

const columns: ColumnDef<ChatbotSession>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email Address" },
  {
    accessorKey: "messageCount",
    header: "Conversation",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 text-xs text-neutral-600">
          <MessageCircle className="w-3.5 h-3.5" />
          {row.original.messageCount || 0}
        </span>
        {/* Worth spotting at a glance: these are the parents the bot could not
            help, who then went looking for a human. */}
        {row.original.handedOffToOperator && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            <Headphones className="w-3 h-3" />
            Operator
          </span>
        )}
      </div>
    ),
  },
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

export default function ChatbotAdminPage() {
  const { token } = useAuthAdmin();
  const [activeTab, setActiveTab] = useState<"leads" | "questions" | "settings">("leads");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState<ChatbotSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [deletingSession, setDeletingSession] = useState<ChatbotSession | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [selectedRows, setSelectedRows] = useState<ChatbotSession[]>([]);
  /** Bumped after a delete or a page change to clear the ticked rows. */
  const [selectionKey, setSelectionKey] = useState(0);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [transcript, setTranscript] = useState<ChatbotSession | null>(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(handler);
  }, [search]);

  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      const res = await fetch(`${API}/admin/chatbot/sessions?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch chatbot sessions");

      const json = await res.json();
      setData(json.data ?? []);
      setTotalPages(json.pagination?.totalPages || 1);
      setTotal(json.pagination?.total ?? 0);
    } catch (err) {
      console.error("Error fetching chatbot sessions:", err);
      setData([]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [debouncedSearch, currentPage, pageSize, token]);

  useEffect(() => {
    if (token) void fetchData();
  }, [fetchData, token]);

  // Ticks must not survive a page or search change: the rows behind them are
  // gone, and a later bulk delete would hit conversations nobody looked at.
  useEffect(() => {
    setSelectedRows([]);
    setSelectionKey((key) => key + 1);
  }, [currentPage, pageSize, debouncedSearch]);

  const handleBulkDelete = async () => {
    if (!selectedRows.length || !token) return;

    setBulkDeleting(true);
    try {
      const res = await fetch(`${API}/admin/chatbot/sessions/delete-many`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedRows.map((row) => row._id) }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || "Failed to delete");

      toast.success(json?.message || "Conversations deleted");

      // The page may now be past the end — after deleting the only rows on the
      // last page, staying there would show "No results".
      const remaining = total - selectedRows.length;
      const lastPage = Math.max(1, Math.ceil(remaining / pageSize));
      if (currentPage > lastPage) {
        setCurrentPage(lastPage);
      } else {
        void fetchData();
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

  /**
   * The list request leaves the messages out, so opening a conversation fetches
   * the one session in full rather than every transcript being sent up front.
   */
  const openTranscript = async (session: ChatbotSession) => {
    if (!token) return;
    setTranscript(session);
    setTranscriptLoading(true);
    try {
      const res = await fetch(`${API}/admin/chatbot/sessions/${session._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load the conversation");
      const json = await res.json();
      setTranscript(json.data);
    } catch (error) {
      console.error(error);
      toast.error("Could not load that conversation");
    } finally {
      setTranscriptLoading(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!deletingSession || !token) return;
    toast.loading("Deleting chatbot lead...", { id: "chatbot-delete" });
    try {
      const res = await fetch(`${API}/admin/chatbot/sessions/${deletingSession._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete lead");

      toast.success("Chatbot lead deleted successfully!", { id: "chatbot-delete" });
      setOpenDeleteDialog(false);
      setDeletingSession(null);
      setSelectedRows([]);
      setSelectionKey((key) => key + 1);
      void fetchData();
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
            <MessageSquare className="h-6 w-6 text-orange-500" /> Website Chatbot
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Read the conversations, write your own answers, and change how the chat
            looks and behaves.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("leads")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "leads"
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <MessageCircle size={15} /> Conversations ({total})
        </button>
        <button
          onClick={() => setActiveTab("questions")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "questions"
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <HelpCircle size={15} /> Questions &amp; Answers
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "settings"
              ? "border-orange-500 text-orange-500"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Settings2 size={15} /> Customise
        </button>
      </div>

      {activeTab === "leads" && (
        <>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border shadow-sm">
            <div className="relative w-full sm:max-w-xs">
              <Input
                placeholder="Search by Name, Email, Location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs border-neutral-200 focus-within:border-orange-400 bg-white"
              />
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {selectedRows.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setOpenBulkDialog(true)}
                  className="h-8 gap-2 text-xs"
                >
                  <Trash2 size={16} /> Delete selected ({selectedRows.length})
                </Button>
              )}
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600">
                {total.toLocaleString()}
                {debouncedSearch ? " found" : " total"}
              </span>
            </div>
          </div>

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
              enableSelection
              onSelectionChange={(rows) => setSelectedRows(rows as ChatbotSession[])}
              selectionResetKey={selectionKey}
              showActions={true}
              actions={["view", "delete"]}
              onAction={(type, row) => {
                if (type === "view") void openTranscript(row as ChatbotSession);
                if (type === "delete") {
                  setDeletingSession(row as ChatbotSession);
                  setOpenDeleteDialog(true);
                }
              }}
            />
          </div>
        </>
      )}

      {activeTab === "questions" && (
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <ChatbotQaManager token={token} />
        </div>
      )}

      {activeTab === "settings" && <ChatbotSettingsForm token={token} />}

      {/* Bulk delete confirmation. Names who is going — each row is a real
          enquiry, and the whole conversation goes with it. */}
      <Dialog open={openBulkDialog} onOpenChange={setOpenBulkDialog}>
        <DialogContent className="max-w-md bg-white text-black">
          <DialogHeader>
            <DialogTitle>
              Delete {selectedRows.length} conversation
              {selectedRows.length === 1 ? "" : "s"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              The leads and everything that was said are removed. This cannot be
              undone.
            </p>

            <ul className="max-h-40 overflow-y-auto rounded-lg bg-muted/40 p-3 text-xs">
              {selectedRows.slice(0, 20).map((row) => (
                <li key={row._id} className="truncate">
                  {row.name} &mdash; {row.email}
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
                className="text-black border"
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

      {/* Transcript */}
      <Dialog open={Boolean(transcript)} onOpenChange={(open) => !open && setTranscript(null)}>
        <DialogContent className="max-w-2xl bg-white text-black max-h-[90vh] overflow-y-auto">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="text-orange-500" size={20} />
              Chat with {transcript?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-neutral-50 rounded-lg p-3">
              <div>
                <p className="text-neutral-500">Email</p>
                <p className="font-semibold break-all">{transcript?.email}</p>
              </div>
              {transcript?.phone && (
                <div>
                  <p className="text-neutral-500">Phone</p>
                  <p className="font-semibold">{transcript.phone}</p>
                </div>
              )}
              <div>
                <p className="text-neutral-500">Location</p>
                <p className="font-semibold">
                  {transcript?.city}, {transcript?.country}
                </p>
              </div>
              <div>
                <p className="text-neutral-500">Started</p>
                <p className="font-semibold">
                  {transcript?.createdAt
                    ? format(new Date(transcript.createdAt), "dd-MM-yyyy HH:mm")
                    : "-"}
                </p>
              </div>
            </div>

            {transcript?.handedOffToOperator && (
              <p className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                <Headphones size={14} className="shrink-0" />
                This visitor asked to be put through to an operator on WhatsApp.
              </p>
            )}

            {transcriptLoading ? (
              <p className="text-sm text-neutral-500 py-8 text-center">
                Loading the conversation…
              </p>
            ) : !transcript?.messages?.length ? (
              // Every lead recorded before the messages started being kept has
              // nothing to show, and saying so beats an empty white box.
              <div className="border border-dashed rounded-xl py-10 text-center">
                <Bot size={22} className="mx-auto text-neutral-300 mb-2" />
                <p className="text-sm text-neutral-500">
                  No conversation was recorded for this lead.
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Chats started before this feature was added were never saved.
                </p>
              </div>
            ) : (
              <div className="space-y-3 bg-neutral-50 rounded-xl p-4">
                {transcript.messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[85%] ${
                      message.role === "user" ? "ml-auto items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                        message.role === "user"
                          ? "bg-orange-500 text-white rounded-br-none"
                          : "bg-white border text-neutral-800 rounded-bl-none"
                      }`}
                    >
                      {message.text}
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-1 px-1">
                      {format(new Date(message.at), "HH:mm")}
                      {message.role === "bot" && message.source
                        ? ` · ${SOURCE_LABELS[message.source] ?? message.source}`
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button onClick={() => setTranscript(null)}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <DialogContent className="max-w-md bg-white text-black p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Delete Chatbot Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              Are you sure you want to delete the chatbot lead for{" "}
              <strong>{deletingSession?.name}</strong>? The conversation is deleted
              with it. This action cannot be undone.
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
