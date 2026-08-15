import { Request, Response } from "express";
import FooterSettings from "../models/footerSettings";

// GET: Fetch footer settings (Public)
export const getFooterSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    let settings = await FooterSettings.findOne();
    if (!settings) {
      settings = new FooterSettings();
      await settings.save();
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching footer settings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch footer settings" });
  }
};

// PUT: Update footer settings (Admin Only)
export const updateFooterSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      description,
      facebook,
      linkedin,
      youtube,
      instagram,
      phone,
      phoneLink,
      email,
      location,
      copyright
    } = req.body;

    let settings = await FooterSettings.findOne();
    if (!settings) {
      settings = new FooterSettings();
    }

    if (description !== undefined) settings.description = description;
    if (facebook !== undefined) settings.facebook = facebook;
    if (linkedin !== undefined) settings.linkedin = linkedin;
    if (youtube !== undefined) settings.youtube = youtube;
    if (instagram !== undefined) settings.instagram = instagram;
    if (phone !== undefined) settings.phone = phone;
    if (phoneLink !== undefined) settings.phoneLink = phoneLink;
    if (email !== undefined) settings.email = email;
    if (location !== undefined) settings.location = location;
    if (copyright !== undefined) settings.copyright = copyright;

    await settings.save();

    res.status(200).json({
      success: true,
      message: "Footer settings updated successfully!",
      data: settings
    });
  } catch (error) {
    console.error("Error updating footer settings:", error);
    res.status(500).json({ success: false, message: "Failed to update footer settings" });
  }
};
