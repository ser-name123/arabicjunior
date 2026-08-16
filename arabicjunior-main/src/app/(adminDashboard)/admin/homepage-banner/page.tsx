"use client";

import React, { useState, useEffect } from "react";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Upload,
  Sparkles,
} from "lucide-react";

export default function HomepageBannerAdminPage() {
  const { token } = useAuthAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // States
  const [homeBadgeText, setHomeBadgeText] = useState("");
  const [homeHeading, setHomeHeading] = useState("");
  const [homeHeadingHighlight, setHomeHeadingHighlight] = useState("");
  const [homeHeadingSuffix, setHomeHeadingSuffix] = useState("");
  const [homeDescription, setHomeDescription] = useState("");

  const [homeFeatures, setHomeFeatures] = useState<Array<{ title: string; icon: string }>>([
    { title: "Personalised Assessment", icon: "ClipboardCheck" },
    { title: "Live Interactive Lesson", icon: "MonitorPlay" },
    { title: "UAE Curriculum Support", icon: "BookOpenCheck" },
    { title: "Parent Feedback", icon: "MessageSquareMore" },
  ]);

  const [homeBtnBookText, setHomeBtnBookText] = useState("");
  const [homeBtnDetailsText, setHomeBtnDetailsText] = useState("");
  const [homeSubtext1, setHomeSubtext1] = useState("");
  const [homeSubtext2, setHomeSubtext2] = useState("");

  const [homeImageUrl, setHomeImageUrl] = useState("");
  const [homeImageFile, setHomeImageFile] = useState<File | null>(null);
  const [homeImagePreview, setHomeImagePreview] = useState("");

  const [homeBottomCards, setHomeBottomCards] = useState<Array<{ title: string; desc: string; icon: string }>>([
    { title: "Expert Teachers", desc: "Experienced native & fluent Arabic instructors.", icon: "GraduationCap" },
    { title: "Structured Learning", desc: "Well-planned lessons designed for steady progress.", icon: "BookOpen" },
    { title: "Engaging & Fun", desc: "Interactive activities that make learning enjoyable.", icon: "Users2" },
  ]);

  const fetchHomepageTrialSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/homepage-trial`);
      const result = await res.json();
      if (res.ok && result.data) {
        const d = result.data;
        setHomeBadgeText(d.badgeText || "Free Trial Class");
        setHomeHeading(d.heading || "Let Your Child Experience");
        setHomeHeadingHighlight(d.headingHighlight || "Arabic Learning");
        setHomeHeadingSuffix(d.headingSuffix || "the Right Way");
        setHomeDescription(d.description || "Give your child a chance to experience a personalized online Arabic lesson with an experienced teacher.");
        if (d.features && d.features.length) setHomeFeatures(d.features);
        setHomeBtnBookText(d.btnBookText || "Book a Free Trial for My Child");
        setHomeBtnDetailsText(d.btnDetailsText || "More Details");
        setHomeSubtext1(d.subtext1 || "No long-term commitment.");
        setHomeSubtext2(d.subtext2 || "Discover the right learning approach for your child.");
        setHomeImageUrl(d.imageUrl || "/free_trial_banner_student.png");
        setHomeImagePreview(d.imageUrl || "/free_trial_banner_student.png");
        if (d.bottomCards && d.bottomCards.length) setHomeBottomCards(d.bottomCards);
      }
    } catch (err) {
      console.error("Error loading homepage trial settings:", err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHomepageTrialSettings();
  }, []);

  const handleHomeFeatureChange = (idx: number, field: "title" | "icon", val: string) => {
    const next = [...homeFeatures];
    next[idx] = { ...next[idx], [field]: val };
    setHomeFeatures(next);
  };

  const handleHomeBottomCardChange = (idx: number, field: "title" | "desc" | "icon", val: string) => {
    const next = [...homeBottomCards];
    next[idx] = { ...next[idx], [field]: val };
    setHomeBottomCards(next);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("badgeText", homeBadgeText);
      formData.append("heading", homeHeading);
      formData.append("headingHighlight", homeHeadingHighlight);
      formData.append("headingSuffix", homeHeadingSuffix);
      formData.append("description", homeDescription);
      formData.append("features", JSON.stringify(homeFeatures));
      formData.append("btnBookText", homeBtnBookText);
      formData.append("btnDetailsText", homeBtnDetailsText);
      formData.append("subtext1", homeSubtext1);
      formData.append("subtext2", homeSubtext2);
      formData.append("bottomCards", JSON.stringify(homeBottomCards));

      if (homeImageFile) {
        formData.append("imageUrl", homeImageFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/homepage-trial`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Homepage trial banner settings updated successfully!");
        setHomeImageFile(null);
        fetchHomepageTrialSettings();
      } else {
        toast.error(result.message || "Failed to update homepage trial settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating homepage trial settings");
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
            <Sparkles className="h-6 w-6 text-orange-500" />
            <h1 className="text-2xl font-bold text-neutral-800">Homepage Banner Manager</h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Manage all text, feature icons, student illustration artwork, and bottom cards rendered on the main Homepage trial banner section.
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Main Header & Titles */}
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Banner Main Titles Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">Top Badge Pill</label>
              <input
                type="text"
                value={homeBadgeText}
                onChange={(e) => setHomeBadgeText(e.target.value)}
                placeholder="Free Trial Class"
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-black font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">Heading Prefix</label>
              <input
                type="text"
                value={homeHeading}
                onChange={(e) => setHomeHeading(e.target.value)}
                placeholder="Let Your Child Experience"
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">Orange Highlighted Words</label>
              <input
                type="text"
                value={homeHeadingHighlight}
                onChange={(e) => setHomeHeadingHighlight(e.target.value)}
                placeholder="Arabic Learning"
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-black font-bold text-orange-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-1">Heading Suffix</label>
              <input
                type="text"
                value={homeHeadingSuffix}
                onChange={(e) => setHomeHeadingSuffix(e.target.value)}
                placeholder="the Right Way"
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-500 mb-1">Banner Subtitle Description</label>
            <textarea
              value={homeDescription}
              onChange={(e) => setHomeDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-black"
            />
          </div>
        </div>

        {/* 4 Feature Circles */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-neutral-800 pl-1">4 Circle Feature Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {homeFeatures.map((feat, idx) => (
              <div key={idx} className="bg-white border rounded-xl shadow-sm p-4 space-y-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Item #{idx + 1}</span>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Feature Label</label>
                  <input
                    type="text"
                    value={feat.title}
                    onChange={(e) => handleHomeFeatureChange(idx, "title", e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-black font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Icon Name</label>
                  <select
                    value={feat.icon || "ClipboardCheck"}
                    onChange={(e) => handleHomeFeatureChange(idx, "icon", e.target.value)}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black font-medium"
                  >
                    <option value="ClipboardCheck">📋 ClipboardCheck (Assessment)</option>
                    <option value="MonitorPlay">💻 MonitorPlay (Live Lesson)</option>
                    <option value="BookOpenCheck">📖 BookOpenCheck (Curriculum)</option>
                    <option value="MessageSquareMore">💬 MessageSquareMore (Feedback)</option>
                    <option value="GraduationCap">🎓 GraduationCap (Teacher)</option>
                    <option value="Users2">👥 Users2 (Engaging)</option>
                    <option value="BookOpen">📚 BookOpen (Structured)</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Learning Image & CTA Labels */}
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Right Side Student Learning Image & CTA Buttons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Orange CTA Button Label</label>
                <input
                  type="text"
                  value={homeBtnBookText}
                  onChange={(e) => setHomeBtnBookText(e.target.value)}
                  placeholder="Book a Free Trial for My Child"
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-black font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Secondary Details Button Label</label>
                <input
                  type="text"
                  value={homeBtnDetailsText}
                  onChange={(e) => setHomeBtnDetailsText(e.target.value)}
                  placeholder="More Details"
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Subtext Line 1</label>
                <input
                  type="text"
                  value={homeSubtext1}
                  onChange={(e) => setHomeSubtext1(e.target.value)}
                  placeholder="No long-term commitment."
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-black"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-500 mb-1">Subtext Line 2</label>
                <input
                  type="text"
                  value={homeSubtext2}
                  onChange={(e) => setHomeSubtext2(e.target.value)}
                  placeholder="Discover the right learning approach for your child."
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-black"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-neutral-500">Student Learning Artwork Image (Right Side Graphic)</label>
              <div className="border border-dashed rounded-lg p-5 flex flex-col items-center justify-center relative bg-slate-50/50">
                <input
                  type="file"
                  id="home-banner-image-file"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setHomeImageFile(e.target.files[0]);
                      setHomeImagePreview(URL.createObjectURL(e.target.files[0]));
                    }
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <label htmlFor="home-banner-image-file" className="cursor-pointer text-center group">
                  <Upload className="h-8 w-8 text-neutral-400 group-hover:text-orange-500 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-orange-500 group-hover:underline">Choose New Student Image</span>
                </label>
                {homeImagePreview && (
                  <div className="mt-3 w-44 h-28 bg-white rounded border flex items-center justify-center p-1 relative overflow-hidden shadow-sm">
                    <img src={homeImagePreview} alt="Home Banner Preview" className="max-w-full max-h-full object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => { setHomeImageFile(null); setHomeImagePreview(homeImageUrl || ""); }}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 text-[10px] hover:bg-red-600 font-bold px-1.5 z-10"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3 Bottom Bar Features */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-neutral-800 pl-1">3 Bottom Bar Value Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {homeBottomCards.map((bCard, idx) => (
              <div key={idx} className="bg-white border rounded-xl shadow-sm p-4 space-y-3">
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Bottom Card #{idx + 1}</span>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Title</label>
                  <input
                    type="text"
                    value={bCard.title}
                    onChange={(e) => handleHomeBottomCardChange(idx, "title", e.target.value)}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Description</label>
                  <textarea
                    value={bCard.desc}
                    onChange={(e) => handleHomeBottomCardChange(idx, "desc", e.target.value)}
                    rows={2}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-500 mb-1">Icon Name</label>
                  <select
                    value={bCard.icon || "GraduationCap"}
                    onChange={(e) => handleHomeBottomCardChange(idx, "icon", e.target.value)}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black font-medium"
                  >
                    <option value="GraduationCap">🎓 GraduationCap (Expert Teachers)</option>
                    <option value="BookOpen">📚 BookOpen (Structured Learning)</option>
                    <option value="Users2">👥 Users2 (Engaging & Fun)</option>
                    <option value="ClipboardCheck">📋 ClipboardCheck</option>
                    <option value="MonitorPlay">💻 MonitorPlay</option>
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
                Saving Homepage Banner...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Homepage Banner
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
