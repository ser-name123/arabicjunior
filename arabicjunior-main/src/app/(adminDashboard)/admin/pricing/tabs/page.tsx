"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MoveLeft, Plus, Save, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button-2";
import { Input } from "@/components/ui/input-2";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Loader from "@/components/loader";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { revalidateContent } from "@/lib/revalidateContent";
import type { PricingGroup } from "@/types/Pricing";

interface Draft {
  _id?: string;
  label: string;
  notes: string[];
  status: "draft" | "published";
  order: number;
}

const emptyDraft = (order: number): Draft => ({
  label: "",
  notes: [""],
  status: "draft",
  order,
});

export default function PricingTabsPage() {
  const router = useRouter();
  const { token } = useAuthAdmin();

  const [groups, setGroups] = useState<PricingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<PricingGroup | null>(null);

  const fetchGroups = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/pricing/groups`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const json = await res.json();
      setGroups(json.data ?? []);
    } catch (err) {
      console.error(err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const save = async () => {
    if (!draft || !token) return;

    if (!draft.label.trim()) {
      toast.error("Tab name is required.");
      return;
    }

    try {
      setSaving(true);
      toast.loading("Saving tab...", { id: "tab-save" });

      const isEdit = Boolean(draft._id);
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/pricing/groups/${draft._id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/pricing/groups`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          label: draft.label.trim(),
          // Blank lines are how an admin clears a note; drop them here rather
          // than storing empty bullets.
          notes: draft.notes.map((n) => n.trim()).filter(Boolean),
          status: draft.status,
          order: draft.order,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to save tab");

      await revalidateContent(token);

      toast.success(isEdit ? "Tab updated!" : "Tab added!", { id: "tab-save" });
      setDraft(null);
      fetchGroups();
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "Something went wrong.",
        { id: "tab-save" }
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting || !token) return;
    try {
      toast.loading("Deleting tab...", { id: "tab-delete" });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/pricing/groups/${deleting._id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const json = await res.json().catch(() => ({}));
      // The API refuses while the tab still has plans, and says how many.
      if (!res.ok) throw new Error(json?.message || "Failed to delete tab");

      await revalidateContent(token);

      toast.success("Tab deleted.", { id: "tab-delete" });
      setDeleting(null);
      fetchGroups();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Something went wrong.", {
        id: "tab-delete",
      });
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="link" size="icon" type="button" onClick={() => router.back()}>
          <MoveLeft />
        </Button>
        <h3 className="text-2xl font-semibold flex items-center gap-2 flex-1">
          <Settings2 /> Pricing tabs &amp; notes
        </h3>
        <Button
          size="sm"
          className="h-8 gap-2"
          onClick={() => setDraft(emptyDraft(groups.length + 1))}
        >
          <Plus size={16} /> Add Tab
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        Tabs sit above the pricing cards. The notes are the small bullet points
        printed underneath, and each tab has its own.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groups.map((group) => (
          <div key={group._id} className="rounded-xl border p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-lg font-semibold truncate">{group.label}</h4>
                <p className="text-xs text-muted-foreground">
                  order {group.order} · {group.notes.length} note
                  {group.notes.length === 1 ? "" : "s"}
                </p>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                  group.status === "published"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {group.status}
              </span>
            </div>

            {group.notes.length > 0 && (
              <ul className="text-xs text-neutral-600 list-disc pl-4 space-y-1">
                {group.notes.slice(0, 3).map((note, index) => (
                  <li key={index} className="line-clamp-1">
                    {note}
                  </li>
                ))}
                {group.notes.length > 3 && (
                  <li className="list-none text-neutral-400">
                    + {group.notes.length - 3} more
                  </li>
                )}
              </ul>
            )}

            <div className="flex gap-2 pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setDraft({
                    _id: group._id,
                    label: group.label,
                    notes: group.notes.length ? [...group.notes] : [""],
                    status: group.status,
                    order: group.order,
                  })
                }
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-600 hover:text-red-700"
                onClick={() => setDeleting(group)}
              >
                <Trash2 size={14} /> Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <p className="text-muted-foreground py-8 text-center">
          No pricing tabs yet. Add one to get started.
        </p>
      )}

      {/* Add / edit */}
      <Dialog open={Boolean(draft)} onOpenChange={(open) => !open && setDraft(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{draft?._id ? "Edit tab" : "Add tab"}</DialogTitle>
          </DialogHeader>

          {draft && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Tab name</label>
                  <Input
                    value={draft.label}
                    placeholder="Individual"
                    onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  />
                  {draft._id && (
                    <p className="text-xs text-muted-foreground">
                      Renaming is safe — the plans stay attached.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Order</label>
                  <Input
                    type="number"
                    min={0}
                    value={draft.order}
                    onChange={(e) =>
                      setDraft({ ...draft, order: Number(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={draft.status}
                  onValueChange={(v) =>
                    setDraft({ ...draft, status: v as Draft["status"] })
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Notes under the cards
                  </label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    onClick={() => setDraft({ ...draft, notes: [...draft.notes, ""] })}
                  >
                    <Plus size={14} /> Add note
                  </Button>
                </div>

                <div className="space-y-2">
                  {draft.notes.map((note, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-neutral-400 pt-2 text-sm">•</span>
                      <Textarea
                        rows={2}
                        value={note}
                        placeholder="Cancellations must be requested 4 hours in advance."
                        onChange={(e) => {
                          const notes = [...draft.notes];
                          notes[index] = e.target.value;
                          setDraft({ ...draft, notes });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Remove note"
                        className="shrink-0 text-neutral-400 hover:text-red-600"
                        onClick={() =>
                          setDraft({
                            ...draft,
                            notes: draft.notes.filter((_, i) => i !== index),
                          })
                        }
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setDraft(null)}>
                  Cancel
                </Button>
                <Button onClick={save} disabled={saving} className="gap-2 w-[120px]">
                  {saving ? (
                    <>
                      <Loader noPadding /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Tab</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Are you sure you want to delete the <strong>{deleting?.label}</strong>{" "}
              tab? Tabs that still have plans cannot be deleted.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={remove}>
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
