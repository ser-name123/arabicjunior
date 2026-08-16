import { Request, Response } from "express";
import AboutJuniors from "../models/aboutJuniors";
import cloudinary from "../config/cloudinary";

const uploadToCloudinary = async (file: Express.Multer.File) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataUri = `data:${file.mimetype};base64,${b64}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "about-juniors",
    resource_type: "auto",
  });

  return { secure_url: result.secure_url, public_id: result.public_id };
};

const defaultFeatures = [
  {
    title: "Passionate About Arabic Learning",
    desc: "At Arabic Juniors, we make Arabic learning simple, engaging, and accessible for learners of all ages. Our experienced teachers create a supportive environment that builds confidence and strong language skills.",
    icon: "Users",
  },
  {
    title: "Practical Communication Focus",
    desc: "Our instructors help students improve their speaking, reading, writing, and listening skills through structured lessons and regular practice. We encourage active participation so learners can use Arabic naturally in everyday situations.",
    icon: "MessageSquare",
  },
  {
    title: "Well-Planned Arabic Language Course",
    desc: "We offer a well-planned Arabic language course suitable for beginners and students who want to strengthen their existing knowledge. Every lesson helps learners progress step by step with continuous guidance from experienced teachers.",
    icon: "BookOpen",
  },
  {
    title: "Special Approach for Young Learners",
    desc: "Our Arabic for kids program includes engaging activities, interactive exercises, and age-appropriate lessons that make learning both fun and effective. We inspire children to build a strong foundation in the language from an early age.",
    icon: "Smile",
  },
];

const defaultBottom = [
  {
    title: "Experienced Teachers",
    desc: "Qualified and passionate instructors dedicated to your child's success.",
    icon: "Users",
  },
  {
    title: "Interactive Learning",
    desc: "Engaging lessons with activities that make learning enjoyable and effective.",
    icon: "GraduationCap",
  },
  {
    title: "Proven Progress",
    desc: "Structured approach that helps learners build skills step by step.",
    icon: "Target",
  },
  {
    title: "Safe & Supportive",
    desc: "A friendly and encouraging environment where every learner feels valued.",
    icon: "ShieldCheck",
  },
];

export const getAboutJuniorsSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    let settings = await AboutJuniors.findOne();
    if (!settings) {
      settings = await AboutJuniors.create({
        badgeText: "About Arabic Juniors",
        heading: "Making",
        headingHighlight: "Arabic",
        headingSuffix: "Learning Simple, Engaging & Accessible",
        imageUrl: "/free_trial_banner_student.png",
        featureCards: defaultFeatures,
        bottomCards: defaultBottom,
      });
    }
    return res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching about juniors settings:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch about juniors settings" });
  }
};

export const updateAboutJuniorsSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    let settings = await AboutJuniors.findOne();
    if (!settings) {
      settings = new AboutJuniors({
        featureCards: defaultFeatures,
        bottomCards: defaultBottom,
      });
    }

    const {
      badgeText,
      heading,
      headingHighlight,
      headingSuffix,
      featureCards,
      bottomCards,
    } = req.body;

    if (badgeText !== undefined) settings.badgeText = badgeText;
    if (heading !== undefined) settings.heading = heading;
    if (headingHighlight !== undefined) settings.headingHighlight = headingHighlight;
    if (headingSuffix !== undefined) settings.headingSuffix = headingSuffix;

    if (featureCards) {
      try {
        settings.featureCards = typeof featureCards === "string" ? JSON.parse(featureCards) : featureCards;
      } catch (e) {
        console.error("Error parsing featureCards:", e);
      }
    }

    if (bottomCards) {
      try {
        settings.bottomCards = typeof bottomCards === "string" ? JSON.parse(bottomCards) : bottomCards;
      } catch (e) {
        console.error("Error parsing bottomCards:", e);
      }
    }

    // Handle Image Upload
    if (req.file) {
      if (settings.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(settings.imagePublicId);
        } catch (e) {
          console.error("Failed to delete old image from Cloudinary:", e);
        }
      }

      const result = await uploadToCloudinary(req.file);
      settings.imageUrl = result.secure_url;
      settings.imagePublicId = result.public_id;
    }

    await settings.save();
    return res.status(200).json({ success: true, message: "About Juniors settings updated successfully", data: settings });
  } catch (error) {
    console.error("Error updating about juniors settings:", error);
    return res.status(500).json({ success: false, message: "Failed to update about juniors settings" });
  }
};
