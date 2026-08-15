"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button-2";

type ResponsibilityCategory = {
  category: string;
  items: string[];
};

type JobFormData = {
  title: string;
  department: string;
  jobLocation: string;
  employmentType: string;
  jobType: string;
  experience: string;
  schedule: string;
  description: string;
  responsibilities: ResponsibilityCategory[];
  applyLabel: string;
  applyUrl: string;
  status: "draft" | "published";
  order: number;
};

interface JobFormProps {
  id?: string;
  token: string | null;
}

export default function JobForm({ id, token }: JobFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Management");
  const [jobLocation, setJobLocation] = useState("Online");
  const [employmentType, setEmploymentType] = useState("Permanent");
  const [jobType, setJobType] = useState("");
  const [experience, setExperience] = useState("");
  const [schedule, setSchedule] = useState("Flexible Hours");
  const [description, setDescription] = useState("");
  const [applyLabel, setApplyLabel] = useState("Apply Now");
  const [applyUrl, setApplyUrl] = useState("/teacher-registration");
  const [status, setStatus] = useState<"draft" | "published">("published");
  const [order, setOrder] = useState<number>(0);
  const [responsibilities, setResponsibilities] = useState<ResponsibilityCategory[]>([]);

  // Fetch job if editing
  useEffect(() => {
    if (!id || !token) return;

    const fetchJob = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/jobs/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const result = await res.json();
        if (res.ok && result.data) {
          const job = result.data;
          setTitle(job.title);
          setDepartment(job.department || "Management");
          setJobLocation(job.jobLocation || "Online");
          setEmploymentType(job.employmentType || "Permanent");
          setJobType(job.jobType || "");
          setExperience(job.experience || "");
          setSchedule(job.schedule || "Flexible Hours");
          setDescription(job.description || "");
          setApplyLabel(job.applyLabel || "Apply Now");
          setApplyUrl(job.applyUrl || "/teacher-registration");
          setStatus(job.status || "published");
          setOrder(job.order || 0);
          setResponsibilities(job.responsibilities || []);
        } else {
          toast.error("Failed to load job details");
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id, token]);

  // Responsibility Action Handlers
  const addCategory = () => {
    setResponsibilities([...responsibilities, { category: "", items: [""] }]);
  };

  const removeCategory = (index: number) => {
    setResponsibilities(responsibilities.filter((_, idx) => idx !== index));
  };

  const handleCategoryNameChange = (index: number, val: string) => {
    const updated = [...responsibilities];
    updated[index].category = val;
    setResponsibilities(updated);
  };

  const addBullet = (catIndex: number) => {
    const updated = [...responsibilities];
    updated[catIndex].items.push("");
    setResponsibilities(updated);
  };

  const removeBullet = (catIndex: number, bulletIndex: number) => {
    const updated = [...responsibilities];
    updated[catIndex].items = updated[catIndex].items.filter((_, idx) => idx !== bulletIndex);
    setResponsibilities(updated);
  };

  const handleBulletChange = (catIndex: number, bulletIndex: number, val: string) => {
    const updated = [...responsibilities];
    updated[catIndex].items[bulletIndex] = val;
    setResponsibilities(updated);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please specify a job title");
      return;
    }
    if (!description.trim()) {
      toast.error("Please fill in the job description");
      return;
    }

    // Filter out completely empty items & categories to clean the data
    const cleanedResponsibilities = responsibilities
      .map((cat) => ({
        category: cat.category.trim(),
        items: cat.items.map((i) => i.trim()).filter((i) => i !== ""),
      }))
      .filter((cat) => cat.category !== "" || cat.items.length > 0);

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        department: department.trim(),
        jobLocation: jobLocation.trim(),
        employmentType: employmentType.trim(),
        jobType: jobType.trim(),
        experience: experience.trim(),
        schedule: schedule.trim(),
        description: description.trim(),
        responsibilities: cleanedResponsibilities,
        applyLabel: applyLabel.trim(),
        applyUrl: applyUrl.trim(),
        status,
        order: Number(order),
      };

      const url = id
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/jobs/${id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/jobs`;

      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(id ? "Job updated successfully!" : "Job position created successfully!");
        router.push("/admin/jobs");
      } else {
        toast.error(result.message || "Failed to save job configuration");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred during save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        <p className="text-neutral-500 text-sm mt-2">Loading job details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push("/admin/jobs")}
          className="p-2 border rounded-lg hover:bg-neutral-50 transition-colors text-black"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-black">
            {id ? "Edit Job Position" : "Create New Job Position"}
          </h1>
          <p className="text-sm text-neutral-500">
            Define role metrics, description, and list categories (responsibilities, requirements, and benefits).
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Core Info Block */}
        <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-semibold text-black border-b pb-2">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Job Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Academic Support Assistant"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white text-black"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Management, Education"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Job Location</label>
              <input
                type="text"
                value={jobLocation}
                onChange={(e) => setJobLocation(e.target.value)}
                placeholder="e.g. Online, Remote, Dubai"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Employment Type</label>
              <input
                type="text"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                placeholder="e.g. Permanent, Part-time"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Experience Detail (Card)</label>
              <input
                type="text"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                placeholder="e.g. 3 years exp."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Experience Requirement (Detail Page)</label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="e.g. Minimum 1-2 Years"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Schedule</label>
              <input
                type="text"
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                placeholder="e.g. Flexible Hours"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Display Order</label>
              <input
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                placeholder="0"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Job Description Overview</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a general summary of the job..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white text-black"
              required
            />
          </div>
        </div>

        {/* Dynamic Responsibilities Lists */}
        <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-lg font-semibold text-black">Section Lists (Responsibilities, Requirements, Benefits, etc.)</h3>
            <Button
              type="button"
              onClick={addCategory}
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-black border-neutral-300 hover:bg-neutral-50"
            >
              <Plus size={14} /> Add Section
            </Button>
          </div>

          {responsibilities.length === 0 ? (
            <div className="text-center py-6 text-neutral-400 text-sm">
              No list sections added yet. Click "Add Section" to add responsibilities, requirements, or what you offer.
            </div>
          ) : (
            <div className="space-y-6">
              {responsibilities.map((cat, catIdx) => (
                <div key={catIdx} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50/50 space-y-3">
                  <div className="flex justify-between items-center gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={cat.category}
                        onChange={(e) => handleCategoryNameChange(catIdx, e.target.value)}
                        placeholder="e.g. Key Responsibilities, Requirements, Why Join Us?"
                        className="w-full font-semibold text-sm px-3 py-1.5 border rounded-lg focus:outline-none bg-white text-black"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCategory(catIdx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Bullet list items */}
                  <div className="space-y-2 pl-4">
                    {cat.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex gap-2 items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 flex-shrink-0" />
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => handleBulletChange(catIdx, itemIdx, e.target.value)}
                          placeholder="Enter detail item..."
                          className="flex-1 text-sm px-3 py-1.5 border rounded-lg focus:outline-none bg-white text-black"
                        />
                        <button
                          type="button"
                          onClick={() => removeBullet(catIdx, itemIdx)}
                          className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-55 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}

                    <Button
                      type="button"
                      onClick={() => addBullet(catIdx)}
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1 text-xs text-neutral-600 border-neutral-300 hover:bg-neutral-50"
                    >
                      <Plus size={12} /> Add Detail Bullet
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Application Link Block */}
        <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-semibold text-black border-b pb-2">Apply Action Config</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Apply Button Text</label>
              <input
                type="text"
                value={applyLabel}
                onChange={(e) => setApplyLabel(e.target.value)}
                placeholder="Apply Now"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white text-black"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Apply Link / URL</label>
              <input
                type="text"
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
                placeholder="/teacher-registration"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white text-black"
              />
            </div>
          </div>
        </div>

        {/* Publish Actions Block */}
        <div className="bg-white border rounded-xl p-6 space-y-4 shadow-sm">
          <h3 className="text-lg font-semibold text-black border-b pb-2">Publish Settings</h3>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Visibility Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "draft" | "published")}
              className="w-full px-3.5 py-2 border rounded-lg focus:outline-none bg-white text-black border-neutral-200"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/jobs")}
            disabled={saving}
            className="text-black border-neutral-300"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-[#FF60A8] to-[#FB6238] hover:from-[#e05493] hover:to-[#e05731] text-white"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Job Position"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
