"use client";

import { useState, useEffect } from "react";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { toast } from "sonner";
import { Loader2, Save, BarChart3, HelpCircle, Upload, Image as ImageIcon } from "lucide-react";

type StatItem = {
  key: string;
  value: string;
  label: string;
  desc: string;
};

type AcademyStatsData = {
  heading: string;
  subHeading: string;
  description: string;
  imageUrl?: string;
  imagePublicId?: string;
  stats: StatItem[];
};

export default function AcademyStatsAdminPage() {
  const { token } = useAuthAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [heading, setHeading] = useState("");
  const [subHeading, setSubHeading] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [stats, setStats] = useState<StatItem[]>([
    { key: "students", value: "", label: "", desc: "" },
    { key: "teachers", value: "", label: "", desc: "" },
    { key: "classes", value: "", label: "", desc: "" },
    { key: "schools", value: "", label: "", desc: "" },
  ]);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/academy-stats`);
      const result = await res.json();
      if (res.ok && result.data) {
        const d = result.data as AcademyStatsData;
        setHeading(d.heading);
        setSubHeading(d.subHeading);
        setDescription(d.description);
        if (d.imageUrl) {
          setImageUrl(d.imageUrl);
          setImagePreview(d.imageUrl);
        } else {
          setImageUrl("");
          setImagePreview("");
        }
        if (d.stats && d.stats.length === 4) {
          setStats(d.stats);
        }
      } else {
        toast.error("Failed to load academy stats");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading academy stats from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token]);

  const handleStatChange = (index: number, field: keyof StatItem, val: string) => {
    const updatedStats = [...stats];
    updatedStats[index] = {
      ...updatedStats[index],
      [field]: val,
    };
    setStats(updatedStats);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!heading.trim() || !subHeading.trim() || !description.trim()) {
      toast.error("Please fill in the main heading, subheading, and description fields.");
      return;
    }

    for (const item of stats) {
      if (!item.value.trim() || !item.label.trim() || !item.desc.trim()) {
        toast.error(`Please fill in all fields for the "${item.label || item.key}" stat card.`);
        return;
      }
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("heading", heading.trim());
      formData.append("subHeading", subHeading.trim());
      formData.append("description", description.trim());
      formData.append("stats", JSON.stringify(stats));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/academy-stats`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || "Academy stats updated successfully!");
        setImageFile(null);
        fetchStats();
      } else {
        toast.error(result.message || "Failed to save stats updates");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during stats update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-neutral-500 text-sm mt-2">Loading configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-800 flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-orange-500" />
            Academy Stats Manager
          </h1>
          <p className="text-neutral-500 mt-1">
            Update metrics, main slogans, and image displayed in the Academy Stats block on the landing page.
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* Slogan / Main Text Panel */}
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2 flex items-center gap-2">
            Slogan & Description
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Main Slogan (Plain Text)
              </label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="e.g. Growing Together."
                className="w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white text-black"
                disabled={saving}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Slogan Highlight (Orange Text)
              </label>
              <input
                type="text"
                value={subHeading}
                onChange={(e) => setSubHeading(e.target.value)}
                placeholder="e.g. Learning Without Limits."
                className="w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white text-black"
                disabled={saving}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Section Description Paragraph
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Thousands of students across the UAE..."
              rows={3}
              className="w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white text-black"
              disabled={saving}
            />
          </div>
        </div>

        {/* Section Image Panel */}
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2 flex items-center gap-2">
            Section Image
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Image Upload Input */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Upload Image (Transparent PNG or light background is recommended)
              </label>
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center transition-all ${
                  dragActive ? "border-orange-500 bg-orange-50/50" : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <input
                  type="file"
                  id="stats-image-file-input"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={saving}
                />
                
                {imageFile ? (
                  <div className="text-center">
                    <Upload className="h-10 w-10 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-neutral-800 truncate max-w-[200px]">
                      {imageFile.name}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {(imageFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(imageUrl || "");
                      }}
                      className="mt-3 text-xs text-red-500 hover:text-red-600 font-semibold"
                      disabled={saving}
                    >
                      Remove Selection
                    </button>
                  </div>
                ) : (
                  <label htmlFor="stats-image-file-input" className="cursor-pointer text-center group w-full h-full block">
                    <Upload className="h-10 w-10 text-neutral-400 group-hover:text-orange-500 mx-auto mb-2 transition-colors" />
                    <p className="text-sm font-medium text-neutral-700">
                      Drag & drop your image here, or{" "}
                      <span className="text-orange-500 font-semibold group-hover:underline">browse</span>
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Supports PNG, JPG, WEBP (Max 5MB)
                    </p>
                  </label>
                )}
              </div>
            </div>

            {/* Image Preview */}
            <div className="flex flex-col items-center justify-center p-4 border border-dashed rounded-lg bg-neutral-50/50 h-full min-h-[180px]">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">Image Preview</span>
              {imagePreview ? (
                <div className="relative w-40 h-40 bg-white border rounded-lg overflow-hidden flex items-center justify-center p-2 shadow-sm">
                  <img
                    src={imagePreview}
                    alt="Academy Stats Preview"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="text-center py-6 text-neutral-400">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No image selected or uploaded yet.</p>
                  <p className="text-[10px] mt-0.5">Will fallback to default boy illustration.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4 Cards Form Settings */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2 pl-1">
            Stat Cards Configuration
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((item, index) => {
              const bgColors = [
                "border-orange-200 bg-orange-50/10",
                "border-pink-200 bg-pink-50/10",
                "border-blue-200 bg-blue-50/10",
                "border-purple-200 bg-purple-50/10",
              ];
              const borderStyles = bgColors[index % bgColors.length];

              return (
                <div 
                  key={item.key} 
                  className={`bg-white border rounded-xl shadow-sm p-6 space-y-4 border-l-4 ${borderStyles}`}
                >
                  <h4 className="font-semibold text-neutral-800 capitalize flex items-center justify-between">
                    <span>Card #{index + 1}: {item.key}</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                        Stat Value
                      </label>
                      <input
                        type="text"
                        value={item.value}
                        onChange={(e) => handleStatChange(index, "value", e.target.value)}
                        placeholder="e.g. 3,500+"
                        className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                        disabled={saving}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                        Label
                      </label>
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => handleStatChange(index, "label", e.target.value)}
                        placeholder="e.g. Happy Students"
                        className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                        disabled={saving}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                      Card Description
                    </label>
                    <textarea
                      value={item.desc}
                      onChange={(e) => handleStatChange(index, "desc", e.target.value)}
                      placeholder="Enter card description..."
                      rows={2}
                      className="w-full px-3 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                      disabled={saving}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 py-3 px-6 rounded-lg text-white font-medium bg-gradient-to-r from-[#FF60A8] to-[#FB6238] hover:from-[#e05493] hover:to-[#e05731] disabled:opacity-50 transition-all shadow-sm"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Slogans & Stats
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
