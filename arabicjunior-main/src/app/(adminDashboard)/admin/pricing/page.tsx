"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Check, Plus, Settings2, Tags, X } from "lucide-react";
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
  const [pageSize, setPageSize] = useState(20);

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
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Each row is one card on the pricing page. Only <strong>published</strong>{" "}
        plans are shown to visitors.
      </p>

      <div className="flex justify-end items-center gap-2">
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
    </div>
  );
}
