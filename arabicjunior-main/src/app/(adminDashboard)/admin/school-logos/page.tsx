"use client";

import { useState, useEffect } from "react";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { toast } from "sonner";
import { 
  Loader2, 
  Trash2, 
  Upload, 
  GraduationCap, 
  Image as ImageIcon 
} from "lucide-react";
import Image from "next/image";

type SchoolLogo = {
  _id: string;
  name: string;
  logoUrl: string;
  logoPublicId: string;
  createdAt: string;
};

export default function SchoolLogosAdminPage() {
  const { token } = useAuthAdmin();
  const [logos, setLogos] = useState<SchoolLogo[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchLogos = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/school-logos`);
      const result = await res.json();
      if (res.ok) {
        setLogos(result.data || []);
      } else {
        toast.error(result.message || "Failed to load logos");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server to load logos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchLogos();
    }
  }, [token]);

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
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type.startsWith("image/")) {
        setFile(selectedFile);
      } else {
        toast.error("Please upload an image file (PNG, JPG, WEBP)");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a school name");
      return;
    }
    if (!file) {
      toast.error("Please select or drop a school logo image");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("logo", file);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/school-logos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || "School logo uploaded successfully!");
        setName("");
        setFile(null);
        fetchLogos();
      } else {
        toast.error(result.message || "Failed to upload logo");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during logo upload");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this school logo?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/school-logos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || "Logo deleted successfully!");
        fetchLogos();
      } else {
        toast.error(result.message || "Failed to delete logo");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting logo from server");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-800 flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-orange-500" />
            School Logos Management
          </h1>
          <p className="text-neutral-500 mt-1">
            Upload and manage the school logos displayed in the homepage carousel below student reviews.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form Card */}
        <div className="bg-white border rounded-xl shadow-sm p-6 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800 flex items-center gap-2">
            <Upload className="h-5 w-5 text-orange-500" />
            Upload New Logo
          </h2>
          <form onSubmit={handleUploadSubmit} className="space-y-5">
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-neutral-700 mb-1.5">
                School Name
              </label>
              <input
                id="schoolName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Dubai British School"
                className="w-full px-3.5 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white text-black"
                disabled={uploading}
              />
            </div>

            {/* Drag & Drop File Container */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                Logo Image (Square aspect ratio is best)
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
                  id="logo-file-input"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                />
                
                {file ? (
                  <div className="text-center">
                    <ImageIcon className="h-10 w-10 text-orange-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-neutral-800 truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="mt-3 text-xs text-red-500 hover:text-red-600 font-semibold"
                      disabled={uploading}
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <label htmlFor="logo-file-input" className="cursor-pointer text-center group">
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

            <button
              type="submit"
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-white font-medium bg-gradient-to-r from-[#FF60A8] to-[#FB6238] hover:from-[#e05493] hover:to-[#e05731] disabled:opacity-50 transition-all shadow-sm"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Logo"
              )}
            </button>
          </form>
        </div>

        {/* Existing Logos Grid */}
        <div className="lg:col-span-2 bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-neutral-800 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-orange-500" />
            Uploaded Logos ({logos.length})
          </h2>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-neutral-500 text-sm mt-2">Loading school logos...</p>
            </div>
          ) : logos.length === 0 ? (
            <div className="text-center py-20 border rounded-lg border-dashed">
              <GraduationCap className="h-12 w-12 text-neutral-300 mx-auto mb-2" />
              <p className="text-neutral-700 font-medium">No school logos uploaded yet</p>
              <p className="text-neutral-400 text-xs mt-1">
                Upload school logos using the form on the left.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {logos.map((logo) => (
                <div 
                  key={logo._id} 
                  className="group relative border rounded-xl p-4 flex flex-col items-center justify-center bg-[#F8FAFC] hover:shadow-md transition-all duration-300"
                >
                  <div className="relative w-20 h-20 mb-3 flex items-center justify-center overflow-hidden rounded-lg bg-white p-2 border">
                    <Image
                      src={logo.logoUrl}
                      alt={logo.name}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-neutral-800 text-center truncate w-full px-1" title={logo.name}>
                    {logo.name}
                  </h4>

                  {/* Hover Delete Action Overlay */}
                  <button
                    onClick={() => handleDelete(logo._id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white border text-neutral-400 hover:text-red-500 hover:border-red-200 hover:shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete Logo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
