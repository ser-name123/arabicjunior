"use client";

import React, { useState, useEffect } from "react";
import useAuthAdmin from "@/hooks/useAuthAdmin";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button-2";
import { 
  Loader2, 
  Save, 
  Settings, 
  BookOpen, 
  HelpCircle, 
  Upload, 
  Image as ImageIcon, 
  Plus, 
  Trash, 
  Compass, 
  UserCheck, 
  FileText,
  BadgeAlert,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  Layers,
  LayoutGrid,
  Sparkles
} from "lucide-react";

type WhyCardItem = {
  title: string;
  desc: string;
  titleColor: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
  icon: string;
};

type AssessSkillItem = {
  title: string;
  desc: string;
  textColor: string;
  bgColor: string;
  icon: string;
};

type ChooseCardItem = {
  title: string;
  desc: string;
  icon: string;
  bgColor: string;
  borderColor: string;
  iconColor: string;
};

type OnboardingStepItem = {
  num: string;
  title: string;
  desc: string;
  numBg: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type LandingPageListItem = {
  _id: string;
  title: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export default function TrialLandingAdminPage() {
  const { token } = useAuthAdmin();
  const [loadingList, setLoadingList] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // List vs Edit Mode
  const [pagesList, setPagesList] = useState<LandingPageListItem[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openBulkDialog, setOpenBulkDialog] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Creation States
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");

  // Editor Tabs for Dynamic Page Edit
  const [activeTab, setActiveTab] = useState<"hero" | "why" | "onboarding" | "skills" | "choose" | "faq" | "cta">("hero");

  // Page Editor States
  const [pageTitle, setPageTitle] = useState("");
  const [slug, setSlug] = useState("");

  // Hero Section State
  const [heroBadgeText, setHeroBadgeText] = useState("");
  const [heroHeading, setHeroHeading] = useState("");
  const [heroHeadingHighlight, setHeroHeadingHighlight] = useState("");
  const [heroSubheading, setHeroSubheading] = useState("");
  const [heroDescription1, setHeroDescription1] = useState("");
  const [heroDescription2, setHeroDescription2] = useState("");
  const [heroBullets, setHeroBullets] = useState<string[]>([]);
  const [heroCtaText, setHeroCtaText] = useState("");
  const [heroCtaSubtext, setHeroCtaSubtext] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState("");

  // Why Section State
  const [whySubheader, setWhySubheader] = useState("");
  const [whyHeading, setWhyHeading] = useState("");
  const [whyDescription, setWhyDescription] = useState("");
  const [whyCards, setWhyCards] = useState<WhyCardItem[]>([]);

  // Process Section State
  const [processSubheader, setProcessSubheader] = useState("");
  const [processHeading, setProcessHeading] = useState("");

  // Skills & Curricula State
  const [assessSubheader, setAssessSubheader] = useState("");
  const [assessTitle, setAssessTitle] = useState("");
  const [assessDescription, setAssessDescription] = useState("");
  const [assessSkills, setAssessSkills] = useState<AssessSkillItem[]>([]);
  
  const [curriculaSubheader, setCurriculaSubheader] = useState("");
  const [curriculaTitle, setCurriculaTitle] = useState("");
  const [curriculaDescription, setCurriculaDescription] = useState("");
  const [curriculaBadges, setCurriculaBadges] = useState<string[]>([]);
  const [curriculaImageUrl, setCurriculaImageUrl] = useState("");
  const [curriculaImageFile, setCurriculaImageFile] = useState<File | null>(null);
  const [curriculaImagePreview, setCurriculaImagePreview] = useState("");

  // Choose Cards State
  const [chooseSubheader, setChooseSubheader] = useState("");
  const [chooseHeading, setChooseHeading] = useState("");
  const [chooseCards, setChooseCards] = useState<ChooseCardItem[]>([]);

  // Onboarding Steps State
  const [onboardingSubheader, setOnboardingSubheader] = useState("");
  const [onboardingHeading, setOnboardingHeading] = useState("");
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStepItem[]>([]);

  // Suitability State
  const [suitabilitySubheader, setSuitabilitySubheader] = useState("");
  const [suitabilityTitle, setSuitabilityTitle] = useState("");
  const [suitabilityDescription, setSuitabilityDescription] = useState("");
  const [suitabilityBullets, setSuitabilityBullets] = useState<string[]>([]);
  const [suitabilityImageUrl, setSuitabilityImageUrl] = useState("");
  const [suitabilityImageFile, setSuitabilityImageFile] = useState<File | null>(null);
  const [suitabilityImagePreview, setSuitabilityImagePreview] = useState("");

  // FAQs State
  const [faqSubheader, setFaqSubheader] = useState("");
  const [faqTitle, setFaqTitle] = useState("");
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  // CTA State
  const [ctaHeading, setCtaHeading] = useState("");
  const [ctaDescription, setCtaDescription] = useState("");
  const [ctaButtonText, setCtaButtonText] = useState("");
  const [ctaSubtext, setCtaSubtext] = useState("");
  const [ctaImageUrl, setCtaImageUrl] = useState("");
  const [ctaImageFile, setCtaImageFile] = useState<File | null>(null);
  const [ctaImagePreview, setCtaImagePreview] = useState("");

  const fetchPagesList = async () => {
    setLoadingList(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/trial-landing`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (res.ok && result.data) {
        // Deduplicate items by slug so multiple identical pages never render
        const uniquePages: LandingPageListItem[] = [];
        const seenSlugs = new Set<string>();
        for (const item of result.data) {
          if (!seenSlugs.has(item.slug)) {
            seenSlugs.add(item.slug);
            uniquePages.push(item);
          }
        }
        setPagesList(uniquePages);
      } else {
        toast.error("Failed to load landing pages list");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error loading landing pages list");
    } finally {
      setLoadingList(false);
    }
  };

  const fetchPageSettings = async (id: string) => {
    setLoadingPage(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/trial-landing/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const d = result.data;
        
        setPageTitle(d.title || "");
        setSlug(d.slug || "");

        // Hero
        setHeroBadgeText(d.heroBadgeText || "");
        setHeroHeading(d.heroHeading || "");
        setHeroHeadingHighlight(d.heroHeadingHighlight || "");
        setHeroSubheading(d.heroSubheading || "");
        setHeroDescription1(d.heroDescription1 || "");
        setHeroDescription2(d.heroDescription2 || "");
        setHeroBullets(d.heroBullets || []);
        setHeroCtaText(d.heroCtaText || "");
        setHeroCtaSubtext(d.heroCtaSubtext || "");
        setHeroImageUrl(d.heroImageUrl || "");
        setHeroImagePreview(d.heroImageUrl || "");

        // Why
        setWhySubheader(d.whySubheader || "");
        setWhyHeading(d.whyHeading || "");
        setWhyDescription(d.whyDescription || "");
        setWhyCards(d.whyCards || []);

        // Process
        setProcessSubheader(d.processSubheader || "");
        setProcessHeading(d.processHeading || "");

        // Skills
        setAssessSubheader(d.assessSubheader || "");
        setAssessTitle(d.assessTitle || "");
        setAssessDescription(d.assessDescription || "");
        setAssessSkills(d.assessSkills || []);

        // Curricula
        setCurriculaSubheader(d.curriculaSubheader || "");
        setCurriculaTitle(d.curriculaTitle || "");
        setCurriculaDescription(d.curriculaDescription || "");
        setCurriculaBadges(d.curriculaBadges || []);
        setCurriculaImageUrl(d.curriculaImageUrl || "");
        setCurriculaImagePreview(d.curriculaImageUrl || "");

        // Choose Cards
        setChooseSubheader(d.chooseSubheader || "");
        setChooseHeading(d.chooseHeading || "");
        setChooseCards(d.chooseCards || []);

        // Onboarding Steps
        setOnboardingSubheader(d.onboardingSubheader || "");
        setOnboardingHeading(d.onboardingHeading || "");
        setOnboardingSteps(d.onboardingSteps || []);

        // Suitability
        setSuitabilitySubheader(d.suitabilitySubheader || "");
        setSuitabilityTitle(d.suitabilityTitle || "");
        setSuitabilityDescription(d.suitabilityDescription || "");
        setSuitabilityBullets(d.suitabilityBullets || []);
        setSuitabilityImageUrl(d.suitabilityImageUrl || "");
        setSuitabilityImagePreview(d.suitabilityImageUrl || "");

        // FAQ
        setFaqSubheader(d.faqSubheader || "");
        setFaqTitle(d.faqTitle || "");
        setFaqItems(d.faqItems || []);

        // CTA
        setCtaHeading(d.ctaHeading || "");
        setCtaDescription(d.ctaDescription || "");
        setCtaButtonText(d.ctaButtonText || "");
        setCtaSubtext(d.ctaSubtext || "");
        setCtaImageUrl(d.ctaImageUrl || "");
        setCtaImagePreview(d.ctaImageUrl || "");

      } else {
        toast.error("Failed to load landing page settings.");
        setSelectedPageId(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading page settings.");
      setSelectedPageId(null);
    } fillly: {
      setLoadingPage(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPagesList();
    }
  }, [token]);

  const handleCreatePageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Page title is required");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/trial-landing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          slug: newSlug.trim() || undefined,
        }),
      });

      const result = await res.json();
      if (res.ok && result.data) {
        toast.success("Landing page created successfully!");
        setNewTitle("");
        setNewSlug("");
        setIsCreating(false);
        // Refresh list and jump to edit
        fetchPagesList();
        setSelectedPageId(result.data._id);
        fetchPageSettings(result.data._id);
      } else {
        toast.error(result.message || "Failed to create landing page");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating landing page");
    }
  };

  /**
   * The live /trial-landing page cannot be deleted, exactly as the Delete button
   * on its row is disabled. Excluding it here means a select-all can never put
   * the admin in front of a confirmation that will silently skip a row.
   */
  const deletablePages = pagesList.filter((page) => page.slug !== "trial-landing");

  const toggleOne = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );

  const allSelected =
    deletablePages.length > 0 && selectedIds.length === deletablePages.length;

  const toggleAll = () =>
    setSelectedIds(allSelected ? [] : deletablePages.map((page) => page._id));

  const selectedPages = pagesList.filter((page) => selectedIds.includes(page._id));

  const handleBulkDeletePages = async () => {
    if (!selectedIds.length || !token) return;

    setBulkDeleting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/trial-landing/delete-many`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selectedIds }),
        }
      );
      const result = await res.json().catch(() => null);
      if (!res.ok) throw new Error(result?.message || "Failed to delete");

      toast.success(result?.message || "Landing pages deleted");
      setSelectedIds([]);
      setOpenBulkDialog(false);
      fetchPagesList();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to delete the pages");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDeletePage = async (id: string, slugName: string) => {
    const defaultCount = pagesList.filter((p) => p.slug === "trial-landing").length;
    if (slugName === "trial-landing" && defaultCount <= 1) {
      toast.error("Default trial landing page cannot be deleted");
      return;
    }

    if (!confirm("Are you sure you want to delete this landing page? All custom texts and uploaded illustrations will be deleted forever.")) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/trial-landing/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Landing page deleted successfully!");
        fetchPagesList();
      } else {
        toast.error(result.message || "Failed to delete landing page");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting page");
    }
  };

  const handleHeroBulletChange = (idx: number, val: string) => {
    const next = [...heroBullets];
    next[idx] = val;
    setHeroBullets(next);
  };

  const handleWhyCardChange = (idx: number, field: keyof WhyCardItem, val: string) => {
    const next = [...whyCards];
    next[idx] = { ...next[idx], [field]: val };
    setWhyCards(next);
  };

  const handleSkillChange = (idx: number, field: keyof AssessSkillItem, val: string) => {
    const next = [...assessSkills];
    next[idx] = { ...next[idx], [field]: val };
    setAssessSkills(next);
  };

  const handleChooseCardChange = (idx: number, field: keyof ChooseCardItem, val: string) => {
    const next = [...chooseCards];
    next[idx] = { ...next[idx], [field]: val };
    setChooseCards(next);
  };

  const handleOnboardingStepChange = (idx: number, field: keyof OnboardingStepItem, val: string) => {
    const next = [...onboardingSteps];
    next[idx] = { ...next[idx], [field]: val };
    setOnboardingSteps(next);
  };

  // Add / remove for the repeatable blocks. New entries copy the colour and
  // icon settings of the last row so a fresh card looks like the rest instead
  // of landing unstyled.
  const addHeroBullet = () => setHeroBullets((p) => [...p, ""]);
  const removeHeroBullet = (idx: number) =>
    setHeroBullets((p) => p.filter((_, i) => i !== idx));

  const addWhyCard = () =>
    setWhyCards((p) => [
      ...p,
      {
        title: "",
        desc: "",
        titleColor: p[p.length - 1]?.titleColor || "text-neutral-900",
        bgColor: p[p.length - 1]?.bgColor || "bg-white",
        borderColor: p[p.length - 1]?.borderColor || "border-neutral-200",
        iconColor: p[p.length - 1]?.iconColor || "text-orange-500",
        icon: p[p.length - 1]?.icon || "Star",
      },
    ]);
  const removeWhyCard = (idx: number) =>
    setWhyCards((p) => p.filter((_, i) => i !== idx));

  const addChooseCard = () =>
    setChooseCards((p) => [
      ...p,
      {
        title: "",
        desc: "",
        icon: p[p.length - 1]?.icon || "Star",
        bgColor: p[p.length - 1]?.bgColor || "bg-white",
        borderColor: p[p.length - 1]?.borderColor || "border-neutral-200",
        iconColor: p[p.length - 1]?.iconColor || "text-orange-500",
      },
    ]);
  const removeChooseCard = (idx: number) =>
    setChooseCards((p) => p.filter((_, i) => i !== idx));

  const addAssessSkill = () =>
    setAssessSkills((p) => [
      ...p,
      {
        title: "",
        desc: "",
        textColor: p[p.length - 1]?.textColor || "text-neutral-900",
        bgColor: p[p.length - 1]?.bgColor || "bg-white",
        icon: p[p.length - 1]?.icon || "Star",
      },
    ]);
  const removeAssessSkill = (idx: number) =>
    setAssessSkills((p) => p.filter((_, i) => i !== idx));

  const addOnboardingStep = () =>
    setOnboardingSteps((p) => [
      ...p,
      {
        num: String(p.length + 1).padStart(2, "0"),
        title: "",
        desc: "",
        numBg: p[p.length - 1]?.numBg || "bg-orange-500",
      },
    ]);
  const removeOnboardingStep = (idx: number) =>
    setOnboardingSteps((p) => p.filter((_, i) => i !== idx));

  const handleSuitabilityBulletChange = (idx: number, val: string) => {
    const next = [...suitabilityBullets];
    next[idx] = val;
    setSuitabilityBullets(next);
  };

  const addSuitabilityBullet = () => {
    setSuitabilityBullets([...suitabilityBullets, ""]);
  };

  const removeSuitabilityBullet = (idx: number) => {
    setSuitabilityBullets(suitabilityBullets.filter((_, i) => i !== idx));
  };

  const handleFaqChange = (idx: number, field: keyof FaqItem, val: string) => {
    const next = [...faqItems];
    next[idx] = { ...next[idx], [field]: val };
    setFaqItems(next);
  };

  const addFaqItem = () => {
    setFaqItems([...faqItems, { question: "", answer: "" }]);
  };

  const removeFaqItem = (idx: number) => {
    setFaqItems(faqItems.filter((_, i) => i !== idx));
  };

  const copyToClipboard = (slugText: string) => {
    const url = `${window.location.origin}/${slugText}`;
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPageId) return;
    setSaving(true);

    try {
      const formData = new FormData();
      
      // Page Meta
      formData.append("title", pageTitle);
      formData.append("slug", slug);

      // Hero fields
      formData.append("heroBadgeText", heroBadgeText);
      formData.append("heroHeading", heroHeading);
      formData.append("heroHeadingHighlight", heroHeadingHighlight);
      formData.append("heroSubheading", heroSubheading);
      formData.append("heroDescription1", heroDescription1);
      formData.append("heroDescription2", heroDescription2);
      formData.append("heroBullets", JSON.stringify(heroBullets.filter(b => b.trim() !== "")));
      formData.append("heroCtaText", heroCtaText);
      formData.append("heroCtaSubtext", heroCtaSubtext);

      // Why fields
      formData.append("whySubheader", whySubheader);
      formData.append("whyHeading", whyHeading);
      formData.append("whyDescription", whyDescription);
      formData.append("whyCards", JSON.stringify(whyCards));

      // Process fields
      formData.append("processSubheader", processSubheader);
      formData.append("processHeading", processHeading);

      // Skills & curricula
      formData.append("assessSubheader", assessSubheader);
      formData.append("assessTitle", assessTitle);
      formData.append("assessDescription", assessDescription);
      formData.append("assessSkills", JSON.stringify(assessSkills));
      
      formData.append("curriculaSubheader", curriculaSubheader);
      formData.append("curriculaTitle", curriculaTitle);
      formData.append("curriculaDescription", curriculaDescription);
      formData.append("curriculaBadges", JSON.stringify(curriculaBadges));

      // Choose Cards
      formData.append("chooseSubheader", chooseSubheader);
      formData.append("chooseHeading", chooseHeading);
      formData.append("chooseCards", JSON.stringify(chooseCards));

      // Onboarding Steps
      formData.append("onboardingSubheader", onboardingSubheader);
      formData.append("onboardingHeading", onboardingHeading);
      formData.append("onboardingSteps", JSON.stringify(onboardingSteps));

      // Suitability fields
      formData.append("suitabilitySubheader", suitabilitySubheader);
      formData.append("suitabilityTitle", suitabilityTitle);
      formData.append("suitabilityDescription", suitabilityDescription);
      formData.append("suitabilityBullets", JSON.stringify(suitabilityBullets.filter(b => b.trim() !== "")));

      // FAQ fields
      formData.append("faqSubheader", faqSubheader);
      formData.append("faqTitle", faqTitle);
      formData.append("faqItems", JSON.stringify(faqItems.filter(f => f.question.trim() !== "")));

      // CTA fields
      formData.append("ctaHeading", ctaHeading);
      formData.append("ctaDescription", ctaDescription);
      formData.append("ctaButtonText", ctaButtonText);
      formData.append("ctaSubtext", ctaSubtext);

      // Images
      if (heroImageFile) formData.append("heroImage", heroImageFile);
      if (suitabilityImageFile) formData.append("suitabilityImage", suitabilityImageFile);
      if (ctaImageFile) formData.append("ctaImage", ctaImageFile);
      if (curriculaImageFile) formData.append("curriculaImage", curriculaImageFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/trial-landing/${selectedPageId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || "Landing page updated successfully!");
        setHeroImageFile(null);
        setSuitabilityImageFile(null);
        setCtaImageFile(null);
        fetchPageSettings(selectedPageId);
      } else {
        toast.error(result.message || "Failed to save settings updates.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred during settings update.");
    } finally {
      setSaving(false);
    }
  };

  // 1. LIST OR HOMEPAGE BANNER VIEW
  if (!selectedPageId) {
    return (
      <div className="space-y-6 w-full mx-auto">
        
        {/* Main Panel Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-neutral-800 flex items-center gap-2">
              <Compass className="h-8 w-8 text-orange-500 animate-spin-slow" />
              Trial & Landing Pages CMS
            </h1>
            <p className="text-neutral-500 mt-1">
              Create and manage custom sub-landing pages. The homepage trial banner is edited under Homepage Banner.
            </p>
          </div>
        </div>

        <div className="space-y-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-neutral-800">
              Dynamic Landing Pages
              <span className="ml-2 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-600 align-middle">
                {pagesList.length} total
              </span>
            </h2>
            {selectedIds.length > 0 && (
              <button
                onClick={() => setOpenBulkDialog(true)}
                className="ml-auto mr-3 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                <Trash size={16} /> Delete selected ({selectedIds.length})
              </button>
            )}
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-white font-semibold bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm whitespace-nowrap shrink-0 text-sm"
            >
              <Plus size={16} />
              Create Landing Page
            </button>
          </div>

          {/* Creation Box */}
          {isCreating && (
            <form onSubmit={handleCreatePageSubmit} className="bg-white border border-[#E2E8F0] rounded-xl p-6 shadow-sm space-y-4 max-w-2xl">
              <h3 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
                <Settings size={18} className="text-orange-500" />
                New Page Configurations
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Page Title / Name</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Dubai Summer Camp"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-1">Custom URL Slug (Optional)</label>
                  <input
                    type="text"
                    value={newSlug}
                    onChange={(e) => setNewSlug(e.target.value)}
                    placeholder="e.g. dubai-summer (defaults to slugified title)"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white text-black"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 border rounded-lg text-neutral-500 hover:bg-neutral-50 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-semibold flex items-center gap-1"
                >
                  <Plus size={16} /> Create Page
                </button>
              </div>
            </form>
          )}

          {/* Loading list */}
          {loadingList ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-neutral-400 text-sm mt-2">Fetching landing pages list...</p>
            </div>
          ) : (
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-100 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                    <th className="pl-6 pr-2 py-4 w-10">
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAll}
                        disabled={deletablePages.length === 0}
                        aria-label="Select all landing pages"
                        className="h-4 w-4 cursor-pointer accent-orange-500 disabled:cursor-not-allowed"
                      />
                    </th>
                    <th className="px-6 py-4">Page Title</th>
                    <th className="px-6 py-4">URL Route</th>
                    <th className="px-6 py-4">Date Created</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm text-neutral-700">
                  {pagesList.map((page) => (
                    <tr
                      key={page._id}
                      className={`transition-colors ${
                        selectedIds.includes(page._id)
                          ? "bg-orange-50/60"
                          : "hover:bg-neutral-50/50"
                      }`}
                    >
                      <td className="pl-6 pr-2 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(page._id)}
                          onChange={() => toggleOne(page._id)}
                          disabled={page.slug === "trial-landing"}
                          aria-label={
                            page.slug === "trial-landing"
                              ? "The default landing page cannot be deleted"
                              : `Select ${page.title}`
                          }
                          title={
                            page.slug === "trial-landing"
                              ? "The default landing page cannot be deleted"
                              : undefined
                          }
                          className="h-4 w-4 cursor-pointer accent-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                        />
                      </td>
                      <td className="px-6 py-4 font-bold text-neutral-800">{page.title}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 px-2.5 py-1 rounded text-xs font-semibold text-slate-600 select-all border">
                            /{page.slug}
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => copyToClipboard(page.slug)}
                            className="p-1 text-neutral-400 hover:text-orange-500 border rounded bg-white"
                            title="Copy Link"
                          >
                            <Copy size={13} />
                          </button>
                          
                          <a
                            href={`/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-neutral-400 hover:text-orange-500 border rounded bg-white"
                            title="Live Preview"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-neutral-400">
                        {new Date(page.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedPageId(page._id);
                            fetchPageSettings(page._id);
                          }}
                          className="px-3.5 py-1.5 bg-orange-55 text-orange-600 border border-orange-200 hover:bg-orange-100 rounded-lg text-xs font-bold transition-all"
                        >
                          Edit Content
                        </button>
                        <button
                          disabled={page.slug === "trial-landing"}
                          onClick={() => handleDeletePage(page._id, page.slug)}
                          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            page.slug === "trial-landing"
                              ? "bg-neutral-55 text-neutral-300 border cursor-not-allowed"
                              : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                          }`}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  
                  {pagesList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-neutral-400">
                        No custom landing pages found. Click the button to create your first page!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>


        {/* Bulk delete confirmation. Names the pages — each one is a live URL
            that may be linked from an advert. */}
        <Dialog open={openBulkDialog} onOpenChange={setOpenBulkDialog}>
          <DialogContent className="max-w-md bg-white text-black">
            <DialogHeader>
              <DialogTitle>
                Delete {selectedIds.length} landing page
                {selectedIds.length === 1 ? "" : "s"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-neutral-500">
                Their URLs will stop working and their images are deleted. This
                cannot be undone.
              </p>

              <ul className="max-h-40 overflow-y-auto rounded-lg bg-neutral-50 border p-3 text-xs">
                {selectedPages.slice(0, 20).map((page) => (
                  <li key={page._id} className="truncate">
                    {page.title} &mdash; /{page.slug}
                  </li>
                ))}
                {selectedPages.length > 20 && (
                  <li className="pt-1 font-semibold">
                    …and {selectedPages.length - 20} more
                  </li>
                )}
              </ul>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  disabled={bulkDeleting}
                  onClick={() => setOpenBulkDialog(false)}
                  className="text-black border"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkDeletePages}
                  disabled={bulkDeleting}
                  className="bg-red-600 text-white hover:bg-red-700"
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

  // 2. DYNAMIC PAGE EDITOR VIEW
  if (loadingPage) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-orange-500" />
        <p className="text-neutral-500 text-sm mt-2">Fetching landing page configurations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full mx-auto pb-20">
      
      {/* Header Info */}
      <div className="flex items-center gap-4 border-b pb-5">
        <button
          type="button"
          onClick={() => {
            setSelectedPageId(null);
            fetchPagesList();
          }}
          className="p-2 border rounded-lg text-neutral-500 hover:bg-neutral-50 bg-white shadow-sm transition-colors"
          title="Back to List"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800 flex items-center gap-2">
            <Settings className="h-7 w-7 text-orange-500" />
            Edit Landing Page: <span className="text-orange-500">{pageTitle}</span>
          </h1>
          <p className="text-neutral-400 text-xs mt-0.5">
            Database Document ID: <code className="bg-slate-100 px-1 border rounded">{selectedPageId}</code>
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        <button
          onClick={() => setActiveTab("hero")}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "hero" ? "bg-orange-500 text-white shadow-sm" : "bg-white border text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          <Compass size={15} />
          1. Hero Section
        </button>
        <button
          onClick={() => setActiveTab("why")}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "why" ? "bg-orange-500 text-white shadow-sm" : "bg-white border text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          <FileText size={15} />
          2. Why Take a Trial
        </button>
        <button
          onClick={() => setActiveTab("onboarding")}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "onboarding" ? "bg-orange-500 text-white shadow-sm" : "bg-white border text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          <Layers size={15} />
          3. How It Works (4 Steps)
        </button>
        <button
          onClick={() => setActiveTab("skills")}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "skills" ? "bg-orange-500 text-white shadow-sm" : "bg-white border text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          <BookOpen size={15} />
          4. Assessments & Curricula
        </button>
        <button
          onClick={() => setActiveTab("choose")}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "choose" ? "bg-orange-500 text-white shadow-sm" : "bg-white border text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          <LayoutGrid size={15} />
          5. Why Parents Choose Us
        </button>
        <button
          onClick={() => setActiveTab("faq")}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "faq" ? "bg-orange-500 text-white shadow-sm" : "bg-white border text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          <HelpCircle size={15} />
          6. Audience & FAQs
        </button>
        <button
          onClick={() => setActiveTab("cta")}
          className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === "cta" ? "bg-orange-500 text-white shadow-sm" : "bg-white border text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          <UserCheck size={15} />
          7. Bottom CTA Banner
        </button>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-8">
        
        {/* TAB 1: HERO SECTION */}
        {activeTab === "hero" && (
          <div className="space-y-6">
            <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
              
              <div className="bg-orange-50/30 border border-orange-100 rounded-lg p-4 space-y-3 mb-4">
                <h4 className="text-sm font-bold text-orange-800">Landing Page URL Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">Page Title / Identification</label>
                    <input
                      type="text"
                      required
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      placeholder="e.g. Dubai Summer Camp"
                      className="w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-orange-500/20 bg-white text-black font-semibold text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">URL path (Page Slug)</label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-neutral-400 font-medium select-none">
                        {typeof window !== "undefined" ? window.location.origin : ""}/
                      </span>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="e.g. trial-landing"
                        className="flex-1 px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-orange-500/20 bg-white text-black font-semibold text-sm"
                      />
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-neutral-500 block leading-relaxed">
                  Changing the Page Slug automatically updates the web URL immediately. The landing page matches the custom path prefix and falls back to a 404 handler on old paths.
                </span>
              </div>

              <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Hero Text & Slogans</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Hero Badge Text</label>
                  <input
                    type="text"
                    value={heroBadgeText}
                    onChange={(e) => setHeroBadgeText(e.target.value)}
                    placeholder="e.g. Free Trial Class"
                    className="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Hero Heading (Pre-Highlight)</label>
                  <input
                    type="text"
                    value={heroHeading}
                    onChange={(e) => setHeroHeading(e.target.value)}
                    placeholder="e.g. Discover Your Child's"
                    className="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Highlight Text (Orange word)</label>
                  <input
                    type="text"
                    value={heroHeadingHighlight}
                    onChange={(e) => setHeroHeadingHighlight(e.target.value)}
                    placeholder="e.g. Arabic"
                    className="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Hero Subtitle</label>
                  <input
                    type="text"
                    value={heroSubheading}
                    onChange={(e) => setHeroSubheading(e.target.value)}
                    placeholder="e.g. Start With a Free Trial Class"
                    className="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description Paragraph 1</label>
                  <textarea
                    value={heroDescription1}
                    onChange={(e) => setHeroDescription1(e.target.value)}
                    rows={3}
                    placeholder="Provide details..."
                    className="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description Paragraph 2</label>
                  <textarea
                    value={heroDescription2}
                    onChange={(e) => setHeroDescription2(e.target.value)}
                    rows={3}
                    placeholder="Provide details..."
                    className="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors bg-white text-black"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Hero Illustration & Checklist</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Hero Student Graphic</label>
                  <div className="border border-dashed rounded-lg p-5 flex flex-col items-center justify-center relative">
                    <input
                      type="file"
                      id="hero-image-file"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setHeroImageFile(e.target.files[0]);
                          setHeroImagePreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <label htmlFor="hero-image-file" className="cursor-pointer text-center group">
                      <Upload className="h-8 w-8 text-neutral-400 group-hover:text-orange-500 mx-auto mb-1" />
                      <span className="text-xs font-semibold text-orange-500 group-hover:underline">Choose New Image</span>
                    </label>
                    {heroImagePreview && (
                      <div className="mt-4 w-32 h-32 bg-slate-50 rounded border flex items-center justify-center p-1 relative">
                        <img src={heroImagePreview} alt="Hero Preview" className="max-w-full max-h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => { setHeroImageFile(null); setHeroImagePreview(heroImageUrl || ""); }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 text-[10px] hover:bg-red-600 font-bold px-1.5"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="block text-sm font-medium text-neutral-700">
                    Checklist Bullet points ({heroBullets.length})
                  </span>
                  {heroBullets.map((bullet, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-neutral-400">#{idx + 1}</span>
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => handleHeroBulletChange(idx, e.target.value)}
                        placeholder="Bullet text..."
                        className="w-full px-3 py-1.5 border rounded-lg focus:ring-2 focus:ring-orange-500/20 text-xs bg-white text-black"
                      />
                      <button
                        type="button"
                        onClick={() => removeHeroBullet(idx)}
                        aria-label={`Remove bullet ${idx + 1}`}
                        className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 border rounded-lg transition-colors shrink-0"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addHeroBullet}
                    className="mt-1 text-xs font-semibold text-orange-500 hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Bullet
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Hero CTA Button Label</label>
                  <input
                    type="text"
                    value={heroCtaText}
                    onChange={(e) => setHeroCtaText(e.target.value)}
                    placeholder="Book My Child's Free Trial"
                    className="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Hero CTA Subtext</label>
                  <input
                    type="text"
                    value={heroCtaSubtext}
                    onChange={(e) => setHeroCtaSubtext(e.target.value)}
                    placeholder="For UAE School Students | KG – Grade 6"
                    className="w-full px-3.5 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white text-black"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VALUE PROPOSITIONS */}
        {activeTab === "why" && (
          <div className="space-y-6">
            <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Why Take a Trial (Section 2) Header</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Orange Subheader</label>
                  <input
                    type="text"
                    value={whySubheader}
                    onChange={(e) => setWhySubheader(e.target.value)}
                    placeholder="Why Take a Trial?"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Main Title Heading</label>
                  <input
                    type="text"
                    value={whyHeading}
                    onChange={(e) => setWhyHeading(e.target.value)}
                    placeholder="Before You Enrol..."
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Section Description</label>
                <textarea
                  value={whyDescription}
                  onChange={(e) => setWhyDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 pl-1">
                <h3 className="text-lg font-semibold text-neutral-800">Cards Value Proposition Configuration ({whyCards.length})</h3>
                <button
                  type="button"
                  onClick={addWhyCard}
                  className="text-xs font-semibold text-orange-500 hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Card
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {whyCards.map((card, idx) => (
                  <div key={idx} className="bg-white border rounded-xl shadow-sm p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Card #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeWhyCard(idx)}
                        aria-label={`Remove card ${idx + 1}`}
                        className="p-1 text-red-500 hover:text-white hover:bg-red-500 border rounded-lg transition-colors shrink-0"
                      >
                        <Trash size={13} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Title</label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => handleWhyCardChange(idx, "title", e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Description</label>
                      <textarea
                        value={card.desc}
                        onChange={(e) => handleWhyCardChange(idx, "desc", e.target.value)}
                        rows={3}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Card Icon</label>
                      <select
                        value={card.icon || "FileText"}
                        onChange={(e) => handleWhyCardChange(idx, "icon", e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black font-medium"
                      >
                        <option value="FileText">📄 FileText (Document)</option>
                        <option value="Monitor">💻 Monitor (Laptop/Computer)</option>
                        <option value="UserCheck">👤 UserCheck (Teacher/Person)</option>
                        <option value="HeartHandshake">🤝 HeartHandshake (Feedback)</option>
                        <option value="BookOpen">📖 BookOpen (Reading)</option>
                        <option value="Edit">✏️ Edit (Writing)</option>
                        <option value="Mic">🎙️ Mic (Speaking)</option>
                        <option value="Headphones">🎧 Headphones (Listening)</option>
                        <option value="Brain">🧠 Brain (Knowledge)</option>
                        <option value="Sparkles">✨ Sparkles (Evaluation)</option>
                        <option value="CheckCircle">✅ CheckCircle (Success)</option>
                        <option value="GraduationCap">🎓 GraduationCap (Education)</option>
                        <option value="Award">🏆 Award (Achievement)</option>
                        <option value="Star">⭐ Star (Rating)</option>
                        <option value="Target">🎯 Target (Goal)</option>
                        <option value="Clock">⏰ Clock (Time)</option>
                        <option value="ShieldCheck">🛡️ ShieldCheck (Trust)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">What Happens During The Trial (Section 3) Header</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Orange Subheader</label>
                  <input
                    type="text"
                    value={processSubheader}
                    onChange={(e) => setProcessSubheader(e.target.value)}
                    placeholder="What Happens During The Trial?"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Process Main Title Heading</label>
                  <input
                    type="text"
                    value={processHeading}
                    onChange={(e) => setProcessHeading(e.target.value)}
                    placeholder="A Simple 4-Step Process"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: WHY PARENTS CHOOSE US (SECTION 5) */}
        {activeTab === "choose" && (
          <div className="space-y-6">
            <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">More Than Just a Demo (Section 5) Header</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Orange Subheader</label>
                  <input
                    type="text"
                    value={chooseSubheader}
                    onChange={(e) => setChooseSubheader(e.target.value)}
                    placeholder="Why Parents Choose Our Trial"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Main Title Heading</label>
                  <input
                    type="text"
                    value={chooseHeading}
                    onChange={(e) => setChooseHeading(e.target.value)}
                    placeholder="More Than Just a Demo Class"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 pl-1">
                <h3 className="text-lg font-semibold text-neutral-800">Cards Value Grid Configuration ({chooseCards.length})</h3>
                <button
                  type="button"
                  onClick={addChooseCard}
                  className="text-xs font-semibold text-orange-500 hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Card
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {chooseCards.map((card, idx) => (
                  <div key={idx} className="bg-white border rounded-xl shadow-sm p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Choose Card #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeChooseCard(idx)}
                        aria-label={`Remove card ${idx + 1}`}
                        className="p-1 text-red-500 hover:text-white hover:bg-red-500 border rounded-lg transition-colors shrink-0"
                      >
                        <Trash size={13} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Title</label>
                      <input
                        type="text"
                        value={card.title}
                        onChange={(e) => handleChooseCardChange(idx, "title", e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Description</label>
                      <textarea
                        value={card.desc}
                        onChange={(e) => handleChooseCardChange(idx, "desc", e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Card Icon</label>
                      <select
                        value={card.icon || "BookOpen"}
                        onChange={(e) => handleChooseCardChange(idx, "icon", e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black font-medium"
                      >
                        <option value="BookOpen">📖 BookOpen (Reading)</option>
                        <option value="FileText">📄 FileText (Document)</option>
                        <option value="Monitor">💻 Monitor (Laptop/Computer)</option>
                        <option value="UserCheck">👤 UserCheck (Teacher/Person)</option>
                        <option value="HeartHandshake">🤝 HeartHandshake (Feedback)</option>
                        <option value="Edit">✏️ Edit (Writing)</option>
                        <option value="Mic">🎙️ Mic (Speaking)</option>
                        <option value="Headphones">🎧 Headphones (Listening)</option>
                        <option value="Brain">🧠 Brain (Knowledge)</option>
                        <option value="Sparkles">✨ Sparkles (Evaluation)</option>
                        <option value="CheckCircle">✅ CheckCircle (Success)</option>
                        <option value="GraduationCap">🎓 GraduationCap (Education)</option>
                        <option value="Award">🏆 Award (Achievement)</option>
                        <option value="Star">⭐ Star (Rating)</option>
                        <option value="Target">🎯 Target (Goal)</option>
                        <option value="Clock">⏰ Clock (Time)</option>
                        <option value="ShieldCheck">🛡️ ShieldCheck (Trust)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HOW IT WORKS (4 STEPS TIMELINE) */}
        {activeTab === "onboarding" && (
          <div className="space-y-6">
            <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Getting Started Is Easy (Section 6) Header</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Orange Subheader</label>
                  <input
                    type="text"
                    value={onboardingSubheader}
                    onChange={(e) => setOnboardingSubheader(e.target.value)}
                    placeholder="How It Works"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Main Title Heading</label>
                  <input
                    type="text"
                    value={onboardingHeading}
                    onChange={(e) => setOnboardingHeading(e.target.value)}
                    placeholder="Getting Started Is Easy"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 pl-1">
                <h3 className="text-lg font-semibold text-neutral-800">Step Cards Configuration ({onboardingSteps.length})</h3>
                <button
                  type="button"
                  onClick={addOnboardingStep}
                  className="text-xs font-semibold text-orange-500 hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Step
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {onboardingSteps.map((step, idx) => (
                  <div key={idx} className="bg-white border rounded-xl shadow-sm p-5 space-y-3">
                    <div className="flex items-center justify-between border-b pb-2">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Step #{idx + 1}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white px-2.5 py-0.5 rounded-full bg-blue-600">Circle #{step.num}</span>
                        <button
                        type="button"
                        onClick={() => removeOnboardingStep(idx)}
                        aria-label={`Remove step ${idx + 1}`}
                        className="p-1 text-red-500 hover:text-white hover:bg-red-500 border rounded-lg transition-colors shrink-0"
                      >
                        <Trash size={13} />
                      </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Step Title</label>
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => handleOnboardingStepChange(idx, "title", e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-black font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Step Description</label>
                      <textarea
                        value={step.desc}
                        onChange={(e) => handleOnboardingStepChange(idx, "desc", e.target.value)}
                        rows={3}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-black"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ASSESSMENTS & CURRICULA */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Skills Evaluation (Section 4) Header</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Orange Subheader</label>
                  <input
                    type="text"
                    value={assessSubheader}
                    onChange={(e) => setAssessSubheader(e.target.value)}
                    placeholder="What Do We Assess?"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Main Title Heading</label>
                  <input
                    type="text"
                    value={assessTitle}
                    onChange={(e) => setAssessTitle(e.target.value)}
                    placeholder="A Trial Designed Around Your Child"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Section Description</label>
                <textarea
                  value={assessDescription}
                  onChange={(e) => setAssessDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 pl-1">
                <h3 className="text-lg font-semibold text-neutral-800">Radial skills Hub Detail ({assessSkills.length})</h3>
                <button
                  type="button"
                  onClick={addAssessSkill}
                  className="text-xs font-semibold text-orange-500 hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add Skill
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {assessSkills.map((skill, idx) => (
                  <div key={idx} className="bg-white border rounded-xl shadow-sm p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Skill #{idx + 1}: {skill.title}</span>
                      <button
                        type="button"
                        onClick={() => removeAssessSkill(idx)}
                        aria-label={`Remove skill ${idx + 1}`}
                        className="p-1 text-red-500 hover:text-white hover:bg-red-500 border rounded-lg transition-colors shrink-0"
                      >
                        <Trash size={13} />
                      </button>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Title</label>
                      <input
                        type="text"
                        value={skill.title}
                        onChange={(e) => handleSkillChange(idx, "title", e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Description</label>
                      <textarea
                        value={skill.desc}
                        onChange={(e) => handleSkillChange(idx, "desc", e.target.value)}
                        rows={2}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Skill Icon</label>
                      <select
                        value={skill.icon || "BookOpen"}
                        onChange={(e) => handleSkillChange(idx, "icon", e.target.value)}
                        className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-black font-medium"
                      >
                        <option value="BookOpen">📖 BookOpen (Reading)</option>
                        <option value="Edit">✏️ Edit (Writing)</option>
                        <option value="Mic">🎙️ Mic (Speaking)</option>
                        <option value="Headphones">🎧 Headphones (Listening)</option>
                        <option value="Brain">🧠 Brain (Grammar/Vocabulary)</option>
                        <option value="Sparkles">✨ Sparkles (Evaluation)</option>
                        <option value="CheckCircle">✅ CheckCircle (Assessment)</option>
                        <option value="GraduationCap">🎓 GraduationCap (Education)</option>
                        <option value="Award">🏆 Award (Achievement)</option>
                        <option value="Star">⭐ Star (Rating)</option>
                        <option value="Target">🎯 Target (Goal)</option>
                        <option value="Clock">⏰ Clock (Time)</option>
                        <option value="ShieldCheck">🛡️ ShieldCheck (Trust)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">UAE School Curricula Badges Header</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Orange Subheader</label>
                  <input
                    type="text"
                    value={curriculaSubheader}
                    onChange={(e) => setCurriculaSubheader(e.target.value)}
                    placeholder="Arabic Support For UAE Curricula"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Main Title Heading</label>
                  <input
                    type="text"
                    value={curriculaTitle}
                    onChange={(e) => setCurriculaTitle(e.target.value)}
                    placeholder="We Support All Major UAE School Curricula"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Curricula Description</label>
                <textarea
                  value={curriculaDescription}
                  onChange={(e) => setCurriculaDescription(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">School Board Badges (Comma-separated list)</label>
                <input
                  type="text"
                  value={curriculaBadges.join(", ")}
                  onChange={(e) => setCurriculaBadges(e.target.value.split(",").map(b => b.trim()).filter(Boolean))}
                  placeholder="UAE MOE, CBSE, British, IB, American"
                  className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                />
                <span className="text-xs text-neutral-400 mt-1 block">Separate badges using a comma (e.g. CBSE, IB, UAE MOE)</span>
              </div>

              {/* Curricula Skyline Image Uploader */}
              <div className="pt-4 border-t space-y-3">
                <label className="block text-sm font-medium text-neutral-700 mb-1.5 font-semibold">UAE Curricula Bottom Image (Dubai Skyline Illustration)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="border border-dashed rounded-lg p-5 flex flex-col items-center justify-center relative">
                    <input
                      type="file"
                      id="curricula-image-file"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setCurriculaImageFile(e.target.files[0]);
                          setCurriculaImagePreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <label htmlFor="curricula-image-file" className="cursor-pointer text-center group">
                      <Upload className="h-8 w-8 text-neutral-400 group-hover:text-orange-500 mx-auto mb-1" />
                      <span className="text-xs font-semibold text-orange-500 group-hover:underline">Choose New Image</span>
                    </label>
                    {curriculaImagePreview && (
                      <div className="mt-4 w-44 h-24 bg-slate-50 rounded border flex items-center justify-center p-1 relative overflow-hidden">
                        <img src={curriculaImagePreview} alt="Skyline Preview" className="max-w-full max-h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => { setCurriculaImageFile(null); setCurriculaImagePreview(curriculaImageUrl || ""); }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 text-[10px] hover:bg-red-600 font-bold px-1.5 z-10"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400 leading-relaxed">
                    This image represents the Dubai Skyline illustration at the bottom of the UAE Curricula card in Section 4. Upload any new PNG/JPG/SVG graphic to change this image.
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: AUDIENCE & FAQS */}
        {activeTab === "faq" && (
          <div className="space-y-6">
            
            <div className="bg-white border rounded-xl shadow-sm p-6 space-y-5">
              <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Suitability Checklist & Student Image</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Orange Subheader</label>
                  <input
                    type="text"
                    value={suitabilitySubheader}
                    onChange={(e) => setSuitabilitySubheader(e.target.value)}
                    placeholder="Who Is The Trial For?"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black mb-4"
                  />
                  
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Title Heading</label>
                  <input
                    type="text"
                    value={suitabilityTitle}
                    onChange={(e) => setSuitabilityTitle(e.target.value)}
                    placeholder="Is This Right for Your Child?"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black mb-4"
                  />

                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">List Description</label>
                  <input
                    type="text"
                    value={suitabilityDescription}
                    onChange={(e) => setSuitabilityDescription(e.target.value)}
                    placeholder="Our trial class is ideal for UAE school students who:"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Checklist Suitability Bullets</label>
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
                    {suitabilityBullets.map((bullet, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={bullet}
                          onChange={(e) => handleSuitabilityBulletChange(idx, e.target.value)}
                          className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black"
                        />
                        <button
                          type="button"
                          onClick={() => removeSuitabilityBullet(idx)}
                          className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 border rounded-lg transition-colors shrink-0"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addSuitabilityBullet}
                    className="mt-3 text-xs font-semibold text-orange-500 hover:underline flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Checklist Item
                  </button>
                </div>
              </div>

              <div className="border-t pt-5">
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Student Portrait Graphic (Suitability Card Base)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="border border-dashed rounded-lg p-5 flex flex-col items-center justify-center relative">
                    <input
                      type="file"
                      id="suitability-image-file"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setSuitabilityImageFile(e.target.files[0]);
                          setSuitabilityImagePreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <label htmlFor="suitability-image-file" className="cursor-pointer text-center group">
                      <Upload className="h-8 w-8 text-neutral-400 group-hover:text-orange-500 mx-auto mb-1" />
                      <span className="text-xs font-semibold text-orange-500 group-hover:underline">Choose New Image</span>
                    </label>
                    {suitabilityImagePreview && (
                      <div className="mt-4 w-32 h-32 bg-slate-50 rounded border flex items-center justify-center p-1 relative">
                        <img src={suitabilityImagePreview} alt="Suitability Preview" className="max-w-full max-h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => { setSuitabilityImageFile(null); setSuitabilityImagePreview(suitabilityImageUrl || ""); }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 text-[10px] hover:bg-red-600 font-bold px-1.5"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400 leading-normal">
                    This image is aligned to the bottom right of the child suitability card. Transparent background PNG illustration is recommended. Defaults to the child reading books illustration.
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Frequently Asked Questions Editor</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">FAQ Orange Subheader</label>
                  <input
                    type="text"
                    value={faqSubheader}
                    onChange={(e) => setFaqSubheader(e.target.value)}
                    placeholder="Frequently Asked Questions"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">FAQ Main Title Heading</label>
                  <input
                    type="text"
                    value={faqTitle}
                    onChange={(e) => setFaqTitle(e.target.value)}
                    placeholder="Frequently Asked Questions"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
              </div>

              <div className="space-y-4 pt-3 border-t">
                <span className="block text-sm font-medium text-neutral-700">FAQ Question & Answer Pairs ({faqItems.length})</span>
                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2">
                  {faqItems.map((item, idx) => (
                    <div key={idx} className="bg-neutral-50/50 p-4 border rounded-lg space-y-3 relative group">
                      <button
                        type="button"
                        onClick={() => removeFaqItem(idx)}
                        className="absolute top-2 right-2 p-1.5 text-neutral-400 hover:text-red-500 hover:bg-neutral-100 border rounded-lg transition-colors"
                      >
                        <Trash size={14} />
                      </button>
                      
                      <div className="grid grid-cols-1 gap-2 pr-6">
                        <div>
                          <label className="block text-xs font-bold text-neutral-500 mb-1">Question #{idx + 1}</label>
                          <input
                            type="text"
                            value={item.question}
                            onChange={(e) => handleFaqChange(idx, "question", e.target.value)}
                            placeholder="Enter question..."
                            className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-500 mb-1">Answer</label>
                          <textarea
                            value={item.answer}
                            onChange={(e) => handleFaqChange(idx, "answer", e.target.value)}
                            placeholder="Enter answer..."
                            rows={2}
                            className="w-full px-3 py-1.5 border rounded-lg text-xs bg-white text-black"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addFaqItem}
                  className="text-xs font-semibold text-orange-500 hover:underline flex items-center gap-1"
                >
                  <Plus size={14} /> Add FAQ Question
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: CTA BANNER */}
        {activeTab === "cta" && (
          <div className="space-y-6">
            <div className="bg-white border rounded-xl shadow-sm p-6 space-y-5">
              <h3 className="text-lg font-semibold text-neutral-800 border-b pb-2">Final Call to Action Banner</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Banner Main Heading</label>
                  <input
                    type="text"
                    value={ctaHeading}
                    onChange={(e) => setCtaHeading(e.target.value)}
                    placeholder="Ready to See Your Child Grow..."
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Banner Description</label>
                  <textarea
                    value={ctaDescription}
                    onChange={(e) => setCtaDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">Orange CTA Button Label</label>
                  <input
                    type="text"
                    value={ctaButtonText}
                    onChange={(e) => setCtaButtonText(e.target.value)}
                    placeholder="Book a Free Trial Class Today"
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1.5">CTA Button Subtext</label>
                  <input
                    type="text"
                    value={ctaSubtext}
                    onChange={(e) => setCtaSubtext(e.target.value)}
                    placeholder="No long-term commitment..."
                    className="w-full px-3.5 py-2 border rounded-lg bg-white text-black"
                  />
                </div>
              </div>

              <div className="border-t pt-5">
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Teacher Illustration (CTA Banner Left Side)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="border border-dashed rounded-lg p-5 flex flex-col items-center justify-center relative">
                    <input
                      type="file"
                      id="cta-image-file"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setCtaImageFile(e.target.files[0]);
                          setCtaImagePreview(URL.createObjectURL(e.target.files[0]));
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    <label htmlFor="cta-image-file" className="cursor-pointer text-center group">
                      <Upload className="h-8 w-8 text-neutral-400 group-hover:text-orange-500 mx-auto mb-1" />
                      <span className="text-xs font-semibold text-orange-500 group-hover:underline">Choose New Image</span>
                    </label>
                    {ctaImagePreview && (
                      <div className="mt-4 w-32 h-32 bg-slate-50 rounded border flex items-center justify-center p-1 relative">
                        <img src={ctaImagePreview} alt="CTA Preview" className="max-w-full max-h-full object-contain" />
                        <button
                          type="button"
                          onClick={() => { setCtaImageFile(null); setCtaImagePreview(ctaImageUrl || ""); }}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 text-[10px] hover:bg-red-600 font-bold px-1.5"
                        >
                          Reset
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-neutral-400 leading-normal">
                    This image is aligned to the left of the banner, surrounded by floating purple letters. Transparent background PNG illustration is recommended. Defaults to the female hijab teacher avatar.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Save bar */}
        <div className="flex justify-end pt-4 border-t">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 py-3 px-8 rounded-lg text-white font-medium bg-gradient-to-r from-[#FF60A8] to-[#FB6238] hover:from-[#e05493] hover:to-[#e05731] disabled:opacity-50 transition-all shadow-md"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving Trial Settings...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Landing Settings
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
