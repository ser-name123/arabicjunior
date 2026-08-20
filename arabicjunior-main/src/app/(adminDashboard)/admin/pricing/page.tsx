"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Check, Plus, Settings2, Tags, Trash2, X } from "lucide-react";
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
import type { AccentColor, PricingGroup, PricingPlan } from "@/types/Pricing";

const ACCENT_SWATCH: Record<AccentColor, string> = {
  yellow: "bg-yellow-500",
  pink: "bg-pink-500",
  green: "bg-light-green-500",
  orange: "bg-orange-500",
};

export default function PricingPage() {
  const router = useRouter();
  const { token } = useAuthAdmin();

  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [groups, setGroups] = useState<PricingGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleting, setDeleting] = useState<PricingPlan | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [selectedRows, setSelectedRows] = useState<PricingPlan[]>([]);
  /** Bumped after a delete or a page change to clear the ticked rows. */
  const [selectionKey, setSelectionKey] = useState(0);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      });
      const [plansRes, groupsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/pricing/plans?${params.toString()}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/pricing/groups`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const plansJson = await plansRes.json();
      const groupsJson = await groupsRes.json();

      setPlans(plansJson.data ?? []);
      setTotalPages(plansJson.pagination?.totalPages || 1);
      setTotal(plansJson.pagination?.total ?? 0);
      setGroups(groupsJson.data ?? []);
    } catch (err) {
      console.error(err);
      setPlans([]);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  }, [token, currentPage, pageSize]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Built inside the component so the tab column can show the human label
  // rather than the slug.
  const groupLabel = (key: string) =>
    groups.find((group) => group.key === key)?.label ?? key;

  const columns: ColumnDef<PricingPlan>[] = [
    {
      accessorKey: "groupKey",
      header: "Tab",
      cell: ({ row }) => (
        <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-700">
          {groupLabel(row.original.groupKey)}
        </span>
      ),
    },
    {
      accessorKey: "title",
      header: "Plan",
      cell: ({ row }) => (
        <span className="flex items-center gap-2 font-medium">
          <span
            className={`w-3 h-3 rounded-full shrink-0 ${
              ACCENT_SWATCH[row.original.accentColor] ?? ACCENT_SWATCH.yellow
            }`}
          />
          {row.original.title}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <span className="tabular-nums whitespace-nowrap">
          {row.original.currency} {row.original.price}
        </span>
      ),
    },
    {
      accessorKey: "features",
      header: "Features",
      cell: ({ row }) => {
        const included = row.original.features.filter((f) => f.included).length;
        const total = row.original.features.length;
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="inline-flex items-center gap-2 cursor-pointer whitespace-nowrap">
                <span className="inline-flex items-center gap-1 text-green-700">
                  <Check size={13} /> {included}
                </span>
                <span className="inline-flex items-center gap-1 text-neutral-400">
                  <X size={13} /> {total - included}
                </span>
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <ul className="space-y-0.5">
                {row.original.features.map((f, i) => (
                  <li key={i} className={f.included ? "" : "opacity-60 line-through"}>
                    {f.title}
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => <span className="tabular-nums">{row.original.order}</span>,
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

  // Ticks must not survive a page change: the rows behind them are gone, and a
  // later bulk delete would hit plans nobody looked at.
  useEffect(() => {
    setSelectedRows([]);
    setSelectionKey((key) => key + 1);
  }, [currentPage, pageSize]);

  const handleBulkDelete = async () => {
    if (!selectedRows.length || !token) return;

    setBulkDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/pricing/plans/delete-many`,
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
      toast.success(json?.message || "Plans deleted");

      // The page may now be past the end — after deleting the only rows on the
      // last page, staying there would show "No results".
      const remaining = total - selectedRows.length;
      const lastPage = Math.max(1, Math.ceil(remaining / pageSize));
      if (currentPage > lastPage) {
        setCurrentPage(lastPage);
      } else {
        fetchAll();
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
      toast.loading("Deleting plan...", { id: "plan-delete" });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/pricing/plans/${deleting?._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete plan");

      await revalidateContent(token);

      toast.success("Plan deleted successfully!", { id: "plan-delete" });
      setOpenDialog(false);
      setDeleting(null);
      setSelectedRows([]);
      setSelectionKey((key) => key + 1);
      fetchAll();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.", { id: "plan-delete" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold flex items-center gap-2">
          <Tags /> Pricing
          <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-600">
            {total.toLocaleString()} total
          </span>
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Each row is one card on the pricing page. Only <strong>published</strong>{" "}
        plans are shown to visitors.
      </p>

      <div className="flex flex-wrap justify-end items-center gap-2">
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
          variant="outline"
          onClick={() => router.push("/admin/pricing/tabs")}
          className="h-8 gap-2"
        >
          <Settings2 size={16} /> Tabs &amp; notes
        </Button>
        <Button
          size="sm"
          onClick={() => router.push("/admin/pricing/new")}
          className="h-8 gap-2"
        >
          <Plus size={16} /> Add Plan
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={plans}
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
        onSelectionChange={(rows) => setSelectedRows(rows as PricingPlan[])}
        selectionResetKey={selectionKey}
        showActions={true}
        actions={["edit", "delete"]}
        onAction={(type, row) => {
          if (type === "edit") {
            router.push(`/admin/pricing/${row._id}/edit`);
          } else if (type === "delete") {
            setDeleting(row);
            setOpenDialog(true);
          }
        }}
      />

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete the{" "}
              <strong>{deleting?.title}</strong> plan from{" "}
              <strong>{deleting ? groupLabel(deleting.groupKey) : ""}</strong>? This
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

      {/* Bulk delete confirmation. Names the plans, not just the count — these
          are the cards visitors see and prices they are quoted. */}
      <Dialog open={openBulkDialog} onOpenChange={setOpenBulkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Delete {selectedRows.length} plan
              {selectedRows.length === 1 ? "" : "s"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              These cards will disappear from the pricing page. This cannot be
              undone.
            </p>

            <ul className="max-h-40 overflow-y-auto rounded-lg bg-muted/40 p-3 text-xs">
              {selectedRows.slice(0, 20).map((row) => (
                <li key={row._id} className="truncate">
                  {row.title} &mdash; {row.currency} {row.price}
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
