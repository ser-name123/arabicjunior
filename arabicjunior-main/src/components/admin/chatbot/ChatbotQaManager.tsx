"use client";

import { useCallback, useEffect, useState } from "react";
import { HelpCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button-2";
import { Input } from "@/components/ui/input-2";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ChatbotQaEntry {
  _id: string;
  question: string;
  answer: string;
  keywords: string[];
  isActive: boolean;
  order: number;
  timesUsed: number;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

const emptyDraft = { question: "", answer: "", keywords: "", isActive: true };

/**
 * The questions the academy answers in its own words.
 *
 * These are not suggestions to the AI — an entry that matches is sent exactly
 * as written. That is what makes it safe to put a refund policy or a timing
 * rule in here: the wording that reaches the parent is the wording that was
 * approved, not a paraphrase.
 */
const ChatbotQaManager = ({ token }: { token: string | null }) => {
  const [entries, setEntries] = useState<ChatbotQaEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<ChatbotQaEntry | null>(null);
  const [draft, setDraft] = useState(emptyDraft);

  const [deleting, setDeleting] = useState<ChatbotQaEntry | null>(null);

  const fetchEntries = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/chatbot/qa`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load the questions");
      const json = await res.json();
      setEntries(json.data ?? []);
    } catch (error) {
      console.error(error);
      toast.error("Could not load the questions");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchEntries();
  }, [fetchEntries]);

  const openAdd = () => {
    setEditing(null);
    setDraft(emptyDraft);
    setOpenForm(true);
  };

  const openEdit = (entry: ChatbotQaEntry) => {
    setEditing(entry);
    setDraft({
      question: entry.question,
      answer: entry.answer,
      keywords: entry.keywords.join(", "),
      isActive: entry.isActive,
    });
    setOpenForm(true);
  };

  const handleSave = async () => {
    if (!token) return;
    if (!draft.question.trim() || !draft.answer.trim()) {
      toast.error("Both a question and an answer are needed");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(
        editing ? `${API}/admin/chatbot/qa/${editing._id}` : `${API}/admin/chatbot/qa`,
        {
          method: editing ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: draft.question.trim(),
            answer: draft.answer.trim(),
            keywords: draft.keywords,
            isActive: draft.isActive,
          }),
        }
      );

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || "Failed to save");

      toast.success(editing ? "Question updated" : "Question added");
      setOpenForm(false);
      void fetchEntries();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting || !token) return;
    try {
      const res = await fetch(`${API}/admin/chatbot/qa/${deleting._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Question deleted");
      setDeleting(null);
      void fetchEntries();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete the question");
    }
  };

  /** Switching an entry off keeps it for later without the bot using it. */
  const toggleActive = async (entry: ChatbotQaEntry) => {
    if (!token) return;
    // Flip it on screen straight away; a toggle that waits on the network feels
    // broken. Put it back if the save fails.
    setEntries((prev) =>
      prev.map((item) =>
        item._id === entry._id ? { ...item, isActive: !item.isActive } : item
      )
    );

    try {
      const res = await fetch(`${API}/admin/chatbot/qa/${entry._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !entry.isActive }),
      });
      if (!res.ok) throw new Error("Failed");
    } catch {
      toast.error("Could not change that question");
      setEntries((prev) =>
        prev.map((item) =>
          item._id === entry._id ? { ...item, isActive: entry.isActive } : item
        )
      );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-black flex items-center gap-2">
            <HelpCircle size={18} className="text-orange-500" />
            Your own questions &amp; answers
            <span className="rounded-full bg-orange-100 px-3 py-0.5 text-xs font-semibold text-orange-600">
              {entries.length}
            </span>
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl">
            When a visitor asks one of these, the chatbot replies with your answer
            word for word instead of writing its own. Use it for anything the
            wording matters on — fees, refunds, timings, policies.
          </p>
        </div>

        <Button onClick={openAdd} size="sm" className="h-8 gap-2 self-start">
          <Plus size={16} /> Add Question
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500 py-8 text-center">Loading…</p>
      ) : entries.length === 0 ? (
        <div className="border border-dashed rounded-xl py-10 text-center">
          <p className="text-sm text-neutral-500">No questions added yet.</p>
          <p className="text-xs text-neutral-400 mt-1">
            Without these the chatbot answers only from your website content.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={entry._id}
              className={`border rounded-xl p-4 bg-white transition-opacity ${
                entry.isActive ? "" : "opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-black">{entry.question}</p>
                  <p className="text-xs text-neutral-600 mt-1.5 whitespace-pre-wrap">
                    {entry.answer}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                    {entry.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        className="text-[10px] font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full"
                      >
                        {keyword}
                      </span>
                    ))}
                    {/* Surfaced so entries nobody ever hits are easy to spot. */}
                    <span className="text-[10px] text-neutral-400">
                      used {entry.timesUsed}×
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Switch
                    checked={entry.isActive}
                    onCheckedChange={() => toggleActive(entry)}
                    aria-label="Use this answer"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEdit(entry)}
                    className="h-8 w-8 p-0 text-neutral-500"
                    aria-label="Edit"
                  >
                    <Pencil size={15} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleting(entry)}
                    className="h-8 w-8 p-0 text-red-500"
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-lg bg-white text-black">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit question" : "Add a question"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600">Question</label>
              <Input
                value={draft.question}
                onChange={(e) => setDraft({ ...draft, question: e.target.value })}
                placeholder="Do you offer a refund?"
                className="h-10 text-sm bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600">
                Answer — sent exactly as you write it
              </label>
              <Textarea
                value={draft.answer}
                onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
                placeholder="Fees are refundable within 7 days of the first class."
                rows={4}
                className="text-sm bg-white"
              />
              <p className="text-[11px] text-neutral-400">
                To link a page write it as [Book a trial](/register).
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-600">
                Other words that should match (comma separated)
              </label>
              <Input
                value={draft.keywords}
                onChange={(e) => setDraft({ ...draft, keywords: e.target.value })}
                placeholder="refund, money back, cancel"
                className="h-10 text-sm bg-white"
              />
              <p className="text-[11px] text-neutral-400">
                Parents rarely type the question the way you wrote it. Add the words
                they would actually use.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={draft.isActive}
                onCheckedChange={(checked) => setDraft({ ...draft, isActive: checked })}
              />
              <span className="text-sm text-neutral-600">Use this answer</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpenForm(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editing ? "Save changes" : "Add question"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="max-w-md bg-white text-black">
          <DialogHeader>
            <DialogTitle>Delete this question</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-500">
              The chatbot will stop giving this answer. If you only want to pause it,
              switch it off instead.
            </p>
            <p className="text-sm font-semibold">{deleting?.question}</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleting(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
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
};

export default ChatbotQaManager;
