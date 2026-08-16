"use client";

import React, { useState, useEffect } from "react";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Upload,
  BookOpen,
} from "lucide-react";

export default function AboutJuniorsAdminPage() {
  const { token } = useAuthAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [badgeText, setBadgeText] = useState("");
  const [heading, setHeading] = useState("");
  const [headingHighlight, setHeadingHighlight] = useState("");
  const [headingSuffix, setHeadingSuffix] = useState("");

  const [featureCards, setFeatureCards] = useState<Array<{ title: string; desc: string; icon: string }>>([
    { title: "Passionate About Arabic Learning", desc: "", icon: "Users" },
    { title: "Practical Communication Focus", desc: "", icon: "MessageSquare" },
    { title: "Well-Planned Arabic Language Course", desc: "", icon: "BookOpen" },
    { title: "Special Approach for Young Learners", desc: "", icon: "Smile" },
  ]);

  const [bottomCards, setBottomCards] = useState<Array<{ title: string; desc: string; icon: string }>>([
    { title: "Experienced Teachers", desc: "", icon: "Users" },
    { title: "Interactive Learning", desc: "", icon: "GraduationCap" },
    { title: "Proven Progress", desc: "", icon: "Target" },
    { title: "Safe & Supportive", desc: "", icon: "ShieldCheck" },
  ]);

  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/about-juniors`);
      const result = await res.json();
      if (res.ok && result.data) {
        const d = result.data;
        setBadgeText(d.badgeText || "About Arabic Juniors");
        setHeading(d.heading || "Making");
        setHeadingHighlight(d.headingHighlight || "Arabic");
        setHeadingSuffix(d.headingSuffix || "Learning Simple, Engaging & Accessible");
        setImageUrl(d.imageUrl || "/free_trial_banner_student.png");
        setImagePreview(d.imageUrl || "/free_trial_banner_student.png");
        if (d.featureCards && d.featureCards.length) setFeatureCards(d.featureCards);
        if (d.bottomCards && d.bottomCards.length) setBottomCards(d.bottomCards);
      }
    } catch (err) {
      console.error("Error loading About Juniors settings:", err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFeatureChange = (idx: number, field: "title" | "desc" | "icon", val: string) => {
    const next = [...featureCards];
    next[idx] = { ...next[idx], [field]: val };
    setFeatureCards(next);
  };

  const handleBottomCardChange = (idx: number, field: "title" | "desc" | "icon", val: string) => {
    const next = [...bottomCards];
    next[idx] = { ...next[idx], [field]: val };
    setBottomCards(next);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("badgeText", badgeText);
      formData.append("heading", heading);
      formData.append("headingHighlight", headingHighlight);
      formData.append("headingSuffix", headingSuffix);
      formData.append("featureCards", JSON.stringify(featureCards));
      formData.append("bottomCards", JSON.stringify(bottomCards));

      if (imageFile) {
        formData.append("imageUrl", imageFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/about-juniors`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("About Juniors section settings updated successfully!");
        setImageFile(null);
        fetchSettings();
      } else {
        toast.error(result.message || "Failed to update settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-neutral-800">About Arabic Juniors Manager</h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Manage titles, 4 feature cards, student illustration graphic, and bottom value cards on the About Us page.
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Titles & Badge */}
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Header Title Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">Top Badge Label</label>
              <input
                type="text"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value)}
                placeholder="About Arabic Juniors"
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-black font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">Heading Prefix</label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="Making"
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">Orange Highlighted Word</label>
              <input
                type="text"
                value={headingHighlight}
                onChange={(e) => setHeadingHighlight(e.target.value)}
                placeholder="Arabic"
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-black font-bold text-orange-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">Heading Suffix</label>
              <input
                type="text"
                value={headingSuffix}
                onChange={(e) => setHeadingSuffix(e.target.value)}
                placeholder="Learning Simple, Engaging & Accessible"
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-black"
              />
            </div>
          </div>
        </div>

        {/* Student Image & 4 Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Student Image Upload */}
          <div className="lg:col-span-5 bg-white border rounded-xl shadow-sm p-6 space-y-3">
            <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Student Learning Illustration</h3>
            <label className="block text-xs font-bold text-neutral-500">Left Column Graphic Image</label>
            <div className="border border-dashed rounded-lg p-5 flex flex-col items-center justify-center relative bg-slate-50/50">
              <input
                type="file"
                id="about-juniors-image-file"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setImageFile(e.target.files[0]);
                    setImagePreview(URL.createObjectURL(e.target.files[0]));
                  }
                }}
                accept="image/*"
                className="hidden"
              />
              <label htmlFor="about-juniors-image-file" className="cursor-pointer text-center group">
                <Upload className="h-8 w-8 text-neutral-400 group-hover:text-orange-500 mx-auto mb-1" />
                <span className="text-xs font-semibold text-orange-500 group-hover:underline">Choose New Image</span>
              </label>
              {imagePreview && (
                <div className="mt-3 w-48 h-32 bg-white rounded border flex items-center justify-center p-1 relative overflow-hidden shadow-sm">
                  <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(imageUrl || ""); }}
                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 text-[10px] hover:bg-red-600 font-bold px-1.5 z-10"
                  >
                    Reset
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 4 Feature Cards */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-lg font-semibold text-neutral-800 pl-1">4 Feature Cards</h3>
            <div className="space-y-3">
              {featureCards.map((card, idx) => (
                <div key={idx} className="bg-white border rounded-xl shadow-sm p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-bold text-neutral-400 uppercase">Card #{idx + 1}</span>
                    <select
                      value={card.icon || "Users"}
                      onChange={(e) => handleFeatureChange(idx, "icon", e.target.value)}
                      className="px-2 py-1 border rounded text-xs bg-white text-black font-semibold"
                    >
                      <option value="Users">👥 Users (Orange)</option>
                      <option value="MessageSquare">💬 MessageSquare (Gold)</option>
                      <option value="BookOpen">📖 BookOpen (Pink)</option>
                      <option value="Smile">👶 Smile (Purple)</option>
                      <option value="GraduationCap">🎓 GraduationCap</option>
                      <option value="Target">🎯 Target</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Title</label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => handleFeatureChange(idx, "title", e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-500 mb-1">Description</label>
                    <textarea
                      value={card.desc}
                      onChange={(e) => handleFeatureChange(idx, "desc", e.target.value)}
                      rows={2}
                      className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 Bottom Cards */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-neutral-800 pl-1">4 Bottom Bar Value Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {bottomCards.map((card, idx) => (
              <div key={idx} className="bg-white border rounded-xl shadow-sm p-4 space-y-2">
                <span className="text-xs font-bold text-neutral-400 uppercase">Bottom Card #{idx + 1}</span>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => handleBottomCardChange(idx, "title", e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-black font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Description</label>
                  <textarea
                    value={card.desc}
                    onChange={(e) => handleBottomCardChange(idx, "desc", e.target.value)}
                    rows={2}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Icon Name</label>
                  <select
                    value={card.icon || "Users"}
                    onChange={(e) => handleBottomCardChange(idx, "icon", e.target.value)}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black font-medium"
                  >
                    <option value="Users">👥 Users (Experienced Teachers)</option>
                    <option value="GraduationCap">🎓 GraduationCap (Interactive Learning)</option>
                    <option value="Target">🎯 Target (Proven Progress)</option>
                    <option value="ShieldCheck">🛡️ ShieldCheck (Safe & Supportive)</option>
                    <option value="BookOpen">📖 BookOpen</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Save bar */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 py-3 px-8 rounded-lg text-white font-medium bg-gradient-to-r from-[#FF60A8] to-[#FB6238] hover:from-[#e05493] hover:to-[#e05731] disabled:opacity-50 transition-all shadow-md text-sm font-bold"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving Section Settings...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Section Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
