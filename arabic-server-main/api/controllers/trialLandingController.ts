import { Request, Response } from "express";
import TrialLanding from "../models/trialLanding";
import cloudinary from "../config/cloudinary";

const uploadToCloudinary = async (file: Express.Multer.File) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "trial-landing",
    resource_type: "auto",
  });

  return { secure_url: result.secure_url, public_id: result.public_id };
};

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")           // Replace spaces with -
    .replace(/[^\w\-]+/g, "")       // Remove all non-word chars
    .replace(/\-\-+/g, "-");        // Replace multiple - with single -
};

// GET: Fetch trial landing page settings by slug (Public)
export const getTrialLandingSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    const slugParam = req.params.slug || "trial-landing";

    // Auto-clean any accidental duplicates in DB
    if (slugParam === "trial-landing") {
      const duplicates = await TrialLanding.find({ slug: "trial-landing" }).sort({ createdAt: -1 });
      if (duplicates.length > 1) {
        const [keep, ...removeList] = duplicates;
        const idsToRemove = removeList.map((d) => d._id);
        await TrialLanding.deleteMany({ _id: { $in: idsToRemove } });
      }
    }

    let settings = await TrialLanding.findOne({ slug: slugParam });
    
    // If it's the default slug and doesn't exist, bootstrap it
    if (!settings && slugParam === "trial-landing") {
      settings = new TrialLanding({ title: "Free Trial Landing Page", slug: "trial-landing" });
      await settings.save();
    }

    if (!settings) {
      return res.status(404).json({ success: false, message: "Landing page not found" });
    }
    
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching trial landing settings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch trial landing settings" });
  }
};

// GET: List all trial landing pages (Admin Only)
export const listTrialLandings = async (req: Request, res: Response): Promise<any> => {
  try {
    // Auto-clean any accidental duplicates in DB
    const duplicates = await TrialLanding.find({ slug: "trial-landing" }).sort({ createdAt: -1 });
    if (duplicates.length > 1) {
      const [keep, ...removeList] = duplicates;
      const idsToRemove = removeList.map((d) => d._id);
      await TrialLanding.deleteMany({ _id: { $in: idsToRemove } });
    }

    const list = await TrialLanding.find({}, "_id title slug createdAt updatedAt").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error("Error listing trial landings:", error);
    res.status(500).json({ success: false, message: "Failed to list landing pages" });
  }
};

// GET: Fetch full settings by ID (Admin Only)
export const getTrialLandingById = async (req: Request, res: Response): Promise<any> => {
  try {
    const settings = await TrialLanding.findById(req.params.id);
    if (!settings) {
      return res.status(404).json({ success: false, message: "Landing page not found" });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching trial landing by ID:", error);
    res.status(500).json({ success: false, message: "Failed to fetch landing page settings" });
  }
};

// POST: Create a new trial landing page (Admin Only)
export const createTrialLanding = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, slug } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }

    const targetSlug = slugify(slug || title);

    // Verify uniqueness
    const existing = await TrialLanding.findOne({ slug: targetSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: `Slug "${targetSlug}" is already in use` });
    }

    const newPage = new TrialLanding({
      title: title.trim(),
      slug: targetSlug,
    });

    await newPage.save();

    res.status(201).json({
      success: true,
      message: "Landing page created successfully!",
      data: newPage
    });
  } catch (error) {
    console.error("Error creating landing page:", error);
    res.status(500).json({ success: false, message: "Server error during landing page creation" });
  }
};

// PUT: Update specific trial landing page settings (Admin Only)
export const updateTrialLandingSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      title,
      slug,
      heroBadgeText,
      heroHeading,
      heroHeadingHighlight,
      heroSubheading,
      heroDescription1,
      heroDescription2,
      heroBullets,
      heroCtaText,
      heroCtaSubtext,

      whySubheader,
      whyHeading,
      whyDescription,
      whyCards,

      processSubheader,
      processHeading,

      assessSubheader,
      assessTitle,
      assessDescription,
      assessSkills,

      curriculaSubheader,
      curriculaTitle,
      curriculaDescription,
      curriculaBadges,

      chooseSubheader,
      chooseHeading,
      chooseCards,

      onboardingSubheader,
      onboardingHeading,
      onboardingSteps,

      suitabilitySubheader,
      suitabilityTitle,
      suitabilityDescription,
      suitabilityBullets,

      faqSubheader,
      faqTitle,
      faqItems,

      ctaHeading,
      ctaDescription,
      ctaButtonText,
      ctaSubtext
    } = req.body;

    const settings = await TrialLanding.findById(req.params.id);
    if (!settings) {
      return res.status(404).json({ success: false, message: "Landing page not found" });
    }

    // Helper to parse potential stringified JSON arrays
    const parseField = (field: any) => {
      if (typeof field === "string") {
        try {
          return JSON.parse(field);
        } catch (e) {
          return field;
        }
      }
      return field;
    };

    // Update Title and Slug
    if (title !== undefined && title.trim() !== "") settings.title = title.trim();
    
    if (slug !== undefined && slug.trim() !== "") {
      const targetSlug = slugify(slug);
      if (targetSlug !== settings.slug) {
        // Verify uniqueness
        const existing = await TrialLanding.findOne({ slug: targetSlug });
        if (existing) {
          return res.status(400).json({ success: false, message: `Slug "${targetSlug}" is already in use` });
        }
        settings.slug = targetSlug;
      }
    }

    // Update Text Fields (Hero)
    if (heroBadgeText !== undefined) settings.heroBadgeText = heroBadgeText;
    if (heroHeading !== undefined) settings.heroHeading = heroHeading;
    if (heroHeadingHighlight !== undefined) settings.heroHeadingHighlight = heroHeadingHighlight;
    if (heroSubheading !== undefined) settings.heroSubheading = heroSubheading;
    if (heroDescription1 !== undefined) settings.heroDescription1 = heroDescription1;
    if (heroDescription2 !== undefined) settings.heroDescription2 = heroDescription2;
    if (heroBullets !== undefined) settings.heroBullets = parseField(heroBullets);
    if (heroCtaText !== undefined) settings.heroCtaText = heroCtaText;
    if (heroCtaSubtext !== undefined) settings.heroCtaSubtext = heroCtaSubtext;

    // Update Text Fields (Why)
    if (whySubheader !== undefined) settings.whySubheader = whySubheader;
    if (whyHeading !== undefined) settings.whyHeading = whyHeading;
    if (whyDescription !== undefined) settings.whyDescription = whyDescription;
    if (whyCards !== undefined) settings.whyCards = parseField(whyCards);

    // Update Text Fields (Process)
    if (processSubheader !== undefined) settings.processSubheader = processSubheader;
    if (processHeading !== undefined) settings.processHeading = processHeading;

    // Update Text Fields (Skills & Assessment)
    if (assessSubheader !== undefined) settings.assessSubheader = assessSubheader;
    if (assessTitle !== undefined) settings.assessTitle = assessTitle;
    if (assessDescription !== undefined) settings.assessDescription = assessDescription;
    if (assessSkills !== undefined) settings.assessSkills = parseField(assessSkills);

    // Update Text Fields (Curricula)
    if (curriculaSubheader !== undefined) settings.curriculaSubheader = curriculaSubheader;
    if (curriculaTitle !== undefined) settings.curriculaTitle = curriculaTitle;
    if (curriculaDescription !== undefined) settings.curriculaDescription = curriculaDescription;
    if (curriculaBadges !== undefined) settings.curriculaBadges = parseField(curriculaBadges);

    // Update Text Fields (Choose)
    if (chooseSubheader !== undefined) settings.chooseSubheader = chooseSubheader;
    if (chooseHeading !== undefined) settings.chooseHeading = chooseHeading;
    if (chooseCards !== undefined) settings.chooseCards = parseField(chooseCards);

    // Update Text Fields (Onboarding)
    if (onboardingSubheader !== undefined) settings.onboardingSubheader = onboardingSubheader;
    if (onboardingHeading !== undefined) settings.onboardingHeading = onboardingHeading;
    if (onboardingSteps !== undefined) settings.onboardingSteps = parseField(onboardingSteps);

    // Update Text Fields (Suitability)
    if (suitabilitySubheader !== undefined) settings.suitabilitySubheader = suitabilitySubheader;
    if (suitabilityTitle !== undefined) settings.suitabilityTitle = suitabilityTitle;
    if (suitabilityDescription !== undefined) settings.suitabilityDescription = suitabilityDescription;
    if (suitabilityBullets !== undefined) settings.suitabilityBullets = parseField(suitabilityBullets);

    // Update Text Fields (FAQ)
    if (faqSubheader !== undefined) settings.faqSubheader = faqSubheader;
    if (faqTitle !== undefined) settings.faqTitle = faqTitle;
    if (faqItems !== undefined) settings.faqItems = parseField(faqItems);

    // Update Text Fields (CTA)
    if (ctaHeading !== undefined) settings.ctaHeading = ctaHeading;
    if (ctaDescription !== undefined) settings.ctaDescription = ctaDescription;
    if (ctaButtonText !== undefined) settings.ctaButtonText = ctaButtonText;
    if (ctaSubtext !== undefined) settings.ctaSubtext = ctaSubtext;

    // Handle Image Uploads
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // 1. Hero Image
    if (files?.["heroImage"]?.[0]) {
      if (settings.heroImagePublicId) {
        try {
          await cloudinary.uploader.destroy(settings.heroImagePublicId);
        } catch (err) {
          console.error("Failed to delete previous hero image:", err);
        }
      }
      const uploaded = await uploadToCloudinary(files["heroImage"][0]);
      settings.heroImageUrl = uploaded.secure_url;
      settings.heroImagePublicId = uploaded.public_id;
    }

    // 2. Suitability Image
    if (files?.["suitabilityImage"]?.[0]) {
      if (settings.suitabilityImagePublicId) {
        try {
          await cloudinary.uploader.destroy(settings.suitabilityImagePublicId);
        } catch (err) {
          console.error("Failed to delete previous suitability image:", err);
        }
      }
      const uploaded = await uploadToCloudinary(files["suitabilityImage"][0]);
      settings.suitabilityImageUrl = uploaded.secure_url;
      settings.suitabilityImagePublicId = uploaded.public_id;
    }

    // 3. CTA Image
    if (files?.["ctaImage"]?.[0]) {
      if (settings.ctaImagePublicId) {
        try {
          await cloudinary.uploader.destroy(settings.ctaImagePublicId);
        } catch (err) {
          console.error("Failed to delete previous cta image:", err);
        }
      }
      const uploaded = await uploadToCloudinary(files["ctaImage"][0]);
      settings.ctaImageUrl = uploaded.secure_url;
      settings.ctaImagePublicId = uploaded.public_id;
    }

    // 4. Curricula Image (Dubai Skyline)
    if (files?.["curriculaImage"]?.[0]) {
      if (settings.curriculaImagePublicId) {
        try {
          await cloudinary.uploader.destroy(settings.curriculaImagePublicId);
        } catch (err) {
          console.error("Failed to delete previous curricula image:", err);
        }
      }
      const uploaded = await uploadToCloudinary(files["curriculaImage"][0]);
      settings.curriculaImageUrl = uploaded.secure_url;
      settings.curriculaImagePublicId = uploaded.public_id;
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Landing page updated successfully!",
      data: settings,
    });
  } catch (error) {
    console.error("Error updating trial landing settings:", error);
    res.status(500).json({ success: false, message: "Server error during settings update" });
  }
};

// DELETE: Delete specific trial landing page (Admin Only)
export const deleteTrialLanding = async (req: Request, res: Response): Promise<any> => {
  try {
    const settings = await TrialLanding.findById(req.params.id);
    if (!settings) {
      return res.status(404).json({ success: false, message: "Landing page not found" });
    }

    // If it's the default one, only block deletion if it's the ONLY default page
    if (settings.slug === "trial-landing") {
      const count = await TrialLanding.countDocuments({ slug: "trial-landing" });
      if (count <= 1) {
        return res.status(400).json({ success: false, message: "Default trial landing page cannot be deleted" });
      }
    }

    // Cleanup images in Cloudinary
    if (settings.heroImagePublicId) {
      try { await cloudinary.uploader.destroy(settings.heroImagePublicId); } catch(e){}
    }
    if (settings.suitabilityImagePublicId) {
      try { await cloudinary.uploader.destroy(settings.suitabilityImagePublicId); } catch(e){}
    }
    if (settings.ctaImagePublicId) {
      try { await cloudinary.uploader.destroy(settings.ctaImagePublicId); } catch(e){}
    }

    await TrialLanding.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Landing page deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting landing page:", error);
    res.status(500).json({ success: false, message: "Server error during landing page deletion" });
  }
};
