"use client";

import React, { useState, useEffect } from "react";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Trash,
  Trash2,
  Settings,
  Mail,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle,
  Inbox,
  Calendar,
  FileSpreadsheet
} from "lucide-react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button-2";

type ContactMessageItem = {
  _id: string;
  fullName: string;
  email: string;
  contactingPurpose: string;
  message: string;
  action_taken: "pending" | "replied" | "resolved" | "dismissed";
  action_date?: string;
  createdAt: string;
};

export default function ContactAdminPage() {
  const { token } = useAuthAdmin();
  const [activeTab, setActiveTab] = useState<"submissions" | "settings">("submissions");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Submissions States
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Settings States
  const [headerPhone, setHeaderPhone] = useState("");
  const [headerPhoneLink, setHeaderPhoneLink] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactLocation, setContactLocation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsApp, setContactWhatsApp] = useState("");
  const [contactWhatsAppLink, setContactWhatsAppLink] = useState("");

  const fetchContactMessages = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contact/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (res.ok && result.data) {
        setMessages(result.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load contact messages");
    }
  };

  const fetchContactSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contact/settings`);
      const result = await res.json();
      if (res.ok && result.data) {
        const d = result.data;
        setHeaderPhone(d.headerPhone || "");
        setHeaderPhoneLink(d.headerPhoneLink || "");
        setContactEmail(d.contactEmail || "");
        setContactLocation(d.contactLocation || "");
        setContactPhone(d.contactPhone || "");
        setContactWhatsApp(d.contactWhatsApp || "");
        setContactWhatsAppLink(d.contactWhatsAppLink || "");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load contact settings");
    }
  };

  const loadData = async () => {
    setLoading(true);
    if (token) {
      await Promise.all([fetchContactMessages(), fetchContactSettings()]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contact/messages/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action_taken: newStatus }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Message status updated!");
        fetchContactMessages();
      } else {
        toast.error(result.message || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating message status");
    }
  };

  const pendingCount = messages.filter((msg) => msg.action_taken === "pending").length;

  const toggleOne = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

  const allSelected = messages.length > 0 && selectedIds.length === messages.length;

  const toggleAll = () =>
    setSelectedIds(allSelected ? [] : messages.map((msg) => msg._id));

  const selectedMessages = messages.filter((msg) => selectedIds.includes(msg._id));

  const handleBulkDelete = async () => {
    if (!selectedIds.length || !token) return;

    setBulkDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/contact/messages/delete-many`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedIds }),
        }
      );
      const result = await res.json().catch(() => null);
      if (!res.ok) throw new Error(result?.message || "Failed to delete");

      toast.success(result?.message || "Messages deleted");
      setSelectedIds([]);
      setOpenBulkDialog(false);
      fetchContactMessages();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to delete the messages");
    } finally {
      setBulkDeleting(false);
    }
  };

  /**
   * Every submission is already loaded on this page, so the sheet is built from
   * what is on screen rather than fetched again. If a filter is ever added here,
   * this will need to export the full list from the server instead.
   */
  const handleExport = () => {
    if (!messages.length) {
      toast.error("There are no submissions to export");
      return;
    }

    setExporting(true);
    try {
      const worksheet = XLSX.utils.json_to_sheet(
        messages.map((msg) => ({
          "Full Name": msg.fullName,
          Email: msg.email,
          Purpose: msg.contactingPurpose,
          // The whole message, not the truncated version the table shows.
          Message: msg.message,
          Status: msg.action_taken,
          "Received On": msg.createdAt
            ? new Date(msg.createdAt).toLocaleDateString("en-GB")
            : "-",
          "Status Changed On": msg.action_date
            ? new Date(msg.action_date).toLocaleDateString("en-GB")
            : "-",
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Contact Messages");
      XLSX.writeFile(workbook, "contact-messages.xlsx");
      toast.success(`${messages.length} submission(s) exported`);
    } catch (err) {
      console.error(err);
      toast.error("Could not export the submissions");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this contact submission?")) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contact/messages/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Message deleted successfully!");
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        fetchContactMessages();
      } else {
        toast.error(result.message || "Failed to delete message");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting message");
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contact/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          headerPhone,
          headerPhoneLink,
          contactEmail,
          contactLocation,
          contactPhone,
          contactWhatsApp,
          contactWhatsAppLink,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Contact settings updated successfully!");
        fetchContactSettings();
      } else {
        toast.error(result.message || "Failed to update contact settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving settings");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center gap-1 bg-yellow-55 text-yellow-600 px-2 py-1 rounded text-xs font-bold border border-yellow-200">Pending</span>;
      case "replied":
        return <span className="inline-flex items-center gap-1 bg-blue-55 text-blue-600 px-2 py-1 rounded text-xs font-bold border border-blue-200">Replied</span>;
      case "resolved":
        return <span className="inline-flex items-center gap-1 bg-green-55 text-green-600 px-2 py-1 rounded text-xs font-bold border border-green-200">Resolved</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 px-2 py-1 rounded text-xs font-bold border">Dismissed</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 w-full">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-neutral-500 text-sm mt-2">Loading contact logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full mx-auto p-4">
      
      {/* Title */}
      <div className="border-b pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-800 flex items-center gap-2">
          <Mail className="h-8 w-8 text-orange-500" />
          Contact Us Manager
        </h1>
        <p className="text-neutral-500 mt-1">
          View user messages submitted from the contact form and manage global contact phone numbers and email paths.
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
            {messages.length.toLocaleString()} total messages
          </span>
          {/* The number that actually needs acting on. */}
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
              {pendingCount.toLocaleString()} pending
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-3">
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === "submissions"
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-white border text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <Inbox size={16} />
          Form Submissions ({messages.length})
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
            activeTab === "settings"
              ? "bg-orange-500 text-white shadow-sm"
              : "bg-white border text-neutral-600 hover:bg-neutral-50"
          }`}
        >
          <Settings size={16} />
          Contact Info & Header Settings
        </button>
      </div>

      {/* Submissions Tab */}
      {activeTab === "submissions" && (
        <div className="space-y-3">

        <div className="flex flex-wrap items-center justify-end gap-3">
          {selectedIds.length > 0 && (
            <button
              onClick={() => setOpenBulkDialog(true)}
              className="mr-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              <Trash2 size={16} /> Delete selected ({selectedIds.length})
            </button>
          )}

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border bg-white text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-60"
          >
            <FileSpreadsheet size={16} />
            {exporting ? "Exporting…" : "Export to Excel"}
          </button>
        </div>

        <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                <th className="pl-6 pr-2 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all submissions"
                    className="h-4 w-4 cursor-pointer accent-orange-500"
                  />
                </th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Purpose</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">
              {messages.map((msg) => (
                <tr
                  key={msg._id}
                  className={`transition-colors ${
                    selectedIds.includes(msg._id) ? "bg-orange-50/60" : "hover:bg-neutral-50/50"
                  }`}
                >
                  <td className="pl-6 pr-2 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(msg._id)}
                      onChange={() => toggleOne(msg._id)}
                      aria-label={`Select the message from ${msg.fullName}`}
                      className="h-4 w-4 cursor-pointer accent-orange-500"
                    />
                  </td>
                  <td className="px-6 py-4 font-bold text-neutral-800">{msg.fullName}</td>
                  <td className="px-6 py-4 font-medium text-[#0062FC] select-all">{msg.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-block whitespace-nowrap bg-neutral-100 border text-neutral-600 text-xs font-bold px-2 py-0.5 rounded">
                      {msg.contactingPurpose}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="text-neutral-500 truncate leading-relaxed" title={msg.message}>
                      {msg.message}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-xs text-neutral-400">
                    <div className="flex items-center gap-1.5 whitespace-nowrap">
                      <Calendar size={13} />
                      {new Date(msg.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div>{getStatusBadge(msg.action_taken)}</div>
                      <select
                        value={msg.action_taken}
                        onChange={(e) => handleStatusChange(msg._id, e.target.value)}
                        className="text-xs border rounded px-1.5 py-0.5 bg-white text-neutral-600 focus:outline-none focus:ring-1 focus:ring-orange-500/20"
                      >
                        <option value="pending">Pending</option>
                        <option value="replied">Replied</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteMessage(msg._id)}
                      className="p-2 text-red-500 hover:text-white hover:bg-red-500 border border-red-200 rounded-lg transition-colors"
                      title="Delete Submission"
                    >
                      <Trash size={15} />
                    </button>
                  </td>
                </tr>
              ))}

              {messages.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-neutral-400">
                    No contact form submissions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        </div>
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && (
        <form onSubmit={handleSettingsSubmit} className="space-y-6">
          
          {/* Header Contact Settings */}
          <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-800 border-b pb-2 flex items-center gap-2">
              <Settings size={18} className="text-orange-500" />
              Header Action Button Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Header Phone Number (displays next to icon)</label>
                <input
                  type="text"
                  required
                  value={headerPhone}
                  onChange={(e) => setHeaderPhone(e.target.value)}
                  placeholder="e.g. +971 50 534 4645"
                  className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Header Button Link (Phone Call / Redirect link)</label>
                <input
                  type="text"
                  required
                  value={headerPhoneLink}
                  onChange={(e) => setHeaderPhoneLink(e.target.value)}
                  placeholder="e.g. tel:+971505344645 or https://wa.me/..."
                  className="w-full px-3.5 py-2 border rounded-lg bg-white text-black font-semibold text-sm"
                />
              </div>
            </div>
          </div>

          {/* Contact Page Settings */}
          <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-neutral-800 border-b pb-2 flex items-center gap-2">
              <MessageSquare size={18} className="text-orange-500" />
              Contact Page Left Cards Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Contact Email Address</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g. hello@ArabicJuniors.com"
                  className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Contact Location</label>
                <input
                  type="text"
                  required
                  value={contactLocation}
                  onChange={(e) => setContactLocation(e.target.value)}
                  placeholder="e.g. United Arab Emirates"
                  className="w-full px-3.5 py-2 border rounded-lg bg-white text-black font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">Phone Number (Calling Row)</label>
                <input
                  type="text"
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +971 50 992 1470"
                  className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-1">WhatsApp Number (WhatsApp Row)</label>
                <input
                  type="text"
                  required
                  value={contactWhatsApp}
                  onChange={(e) => setContactWhatsApp(e.target.value)}
                  placeholder="e.g. +971 50 534 4645"
                  className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1">WhatsApp Redirect Link URL</label>
              <textarea
                required
                value={contactWhatsAppLink}
                onChange={(e) => setContactWhatsAppLink(e.target.value)}
                rows={2}
                placeholder="e.g. https://wa.me/971505344645?text=Hello!..."
                className="w-full px-3.5 py-2 border rounded-lg bg-white text-black text-xs font-semibold"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 py-3 px-8 rounded-lg text-white font-bold bg-gradient-to-r from-[#FF60A8] to-[#FB6238] hover:from-[#e05493] hover:to-[#e05731] disabled:opacity-50 transition-all shadow-md text-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving Contact Settings...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Save Contact Settings
                </>
              )}
            </button>
          </div>

        </form>
      )}


      {/* Bulk delete confirmation. Names who is going, not just how many —
          a deleted enquiry is a lost customer, not a tidied row. */}
      <Dialog open={openBulkDialog} onOpenChange={setOpenBulkDialog}>
        <DialogContent className="max-w-md bg-white text-black">
          <DialogHeader>
            <DialogTitle>
              Delete {selectedIds.length} message
              {selectedIds.length === 1 ? "" : "s"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              This permanently removes the selected submissions. It cannot be undone.
            </p>

            <ul className="max-h-40 overflow-y-auto rounded-lg bg-neutral-50 border p-3 text-xs">
              {selectedMessages.slice(0, 20).map((msg) => (
                <li key={msg._id} className="truncate">
                  {msg.fullName} &mdash; {msg.email}
                </li>
              ))}
              {selectedMessages.length > 20 && (
                <li className="pt-1 font-semibold">
                  …and {selectedMessages.length - 20} more
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
  );
}
