"use client";

import { useState, useEffect } from "react";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { toast } from "sonner";
import { Loader2, Save, Layout, Info, Share2, PhoneCall } from "lucide-react";

export default function FooterSettingsAdminPage() {
  const { token } = useAuthAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [description, setDescription] = useState("");
  const [copyright, setCopyright] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [youtube, setYoutube] = useState("");
  const [instagram, setInstagram] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneLink, setPhoneLink] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");

  const fetchFooterSettings = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/footer-settings`);
      const result = await res.json();
      if (res.ok && result.data) {
        const d = result.data;
        setDescription(d.description || "");
        setCopyright(d.copyright || "");
        setFacebook(d.facebook || "");
        setLinkedin(d.linkedin || "");
        setYoutube(d.youtube || "");
        setInstagram(d.instagram || "");
        setPhone(d.phone || "");
        setPhoneLink(d.phoneLink || "");
        setEmail(d.email || "");
        setLocation(d.location || "");
        setSeoKeywords(
          Array.isArray(d.seoKeywords) ? d.seoKeywords.join("\n") : ""
        );
      } else {
        toast.error("Failed to load footer settings");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading footer settings from database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFooterSettings();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    toast.loading("Updating footer settings...", { id: "footer-save" });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/footer-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          description,
          copyright,
          facebook,
          linkedin,
          youtube,
          instagram,
          phone,
          phoneLink,
          email,
          location,
          seoKeywords: seoKeywords
            .split("\n")
            .map((k) => k.trim())
            .filter(Boolean),
        }),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || "Footer settings updated!", { id: "footer-save" });
        fetchFooterSettings();
      } else {
        toast.error(result.message || "Failed to update footer settings", { id: "footer-save" });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating footer settings", { id: "footer-save" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-neutral-500 font-medium">Loading footer settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b pb-4 mb-4">
        <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
          <Layout className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">Footer Manager</h2>
          <p className="text-sm text-neutral-500">
            Manage global footer text descriptions, links, copyright settings, and contact information.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: General Info */}
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2 border-b pb-2">
            <Info className="h-5 w-5 text-orange-500" />
            General Information & Copy
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1.5">
                Footer Description Text
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description text displayed under the logo..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1.5">
                Copyright Text
              </label>
              <input
                type="text"
                value={copyright}
                onChange={(e) => setCopyright(e.target.value)}
                placeholder="e.g. ©2026 www.arabicjuniors.com | All Rights Reserved by..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1.5">
                Footer Keywords
              </label>
              <textarea
                value={seoKeywords}
                onChange={(e) => setSeoKeywords(e.target.value)}
                placeholder={"Arabic Classes Online\nArabic Language Centre Dubai\nOnline Arabic Classes"}
                rows={8}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                disabled={saving}
              />
              <p className="mt-1.5 text-xs text-neutral-500">
                One per line. Shown as a single row above the copyright line.
                Leave empty to hide the row.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Information */}
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2 border-b pb-2">
            <PhoneCall className="h-5 w-5 text-orange-500" />
            Help Center & Contact Coordinates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1.5">
                Display Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +971 50 534 4645"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1.5">
                WhatsApp Chat Link
              </label>
              <input
                type="text"
                value={phoneLink}
                onChange={(e) => setPhoneLink(e.target.value)}
                placeholder="e.g. https://wa.me/..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. hello@arabicjuniors.com"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1.5">
                Office Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Dubai - United Arab Emirates"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Social Media Links */}
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-lg font-semibold text-neutral-800 flex items-center gap-2 border-b pb-2">
            <Share2 className="h-5 w-5 text-orange-500" />
            Social Connect Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1.5">
                Facebook Link
              </label>
              <input
                type="text"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1.5">
                LinkedIn Link
              </label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/company/..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1.5">
                YouTube Link
              </label>
              <input
                type="text"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="https://youtube.com/..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                disabled={saving}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-neutral-600 mb-1.5">
                Instagram Link
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="https://instagram.com/..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors text-sm bg-white text-black"
                disabled={saving}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 py-3 px-6 rounded-lg text-white font-medium bg-gradient-to-r from-[#FF60A8] to-[#FB6238] hover:from-[#e05493] hover:to-[#e05731] disabled:opacity-50 transition-all shadow-sm cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Footer Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
