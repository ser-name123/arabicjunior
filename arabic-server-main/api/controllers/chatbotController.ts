import { Request, Response } from "express";
import ChatbotSession from "../models/chatbotSession";
import { containsRegex } from "../utils/escapeRegex";
import { getClientLocation } from "../utils/getClientLocation";

// Public: Save chatbot lead/session
export const createChatbotSession = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ status: "error", message: "Name and Email are required" });
    }

    // Resolve client location directly from request IP on the backend
    const location = await getClientLocation(req);

    const session = new ChatbotSession({
      name,
      email,
      ip: location.ip || req.ip || "",
      city: location.city || "Unknown",
      country: location.country || "Unknown",
    });

    await session.save();

    res.status(201).json({
      status: "success",
      message: "Chatbot session recorded successfully",
      data: session,
    });
  } catch (error) {
    console.error("Error creating chatbot session:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to record chatbot session",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Admin: Get chatbot sessions with pagination and search
export const getChatbotSessions = async (req: Request, res: Response): Promise<any> => {
  try {
    let { page = "1", limit = "10", search = "" } = req.query;

    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = parseInt(limit as string, 10) || 10;

    let filter: any = {};
    if (search && typeof search === "string" && search.trim() !== "") {
      const regex = containsRegex(search);
      filter.$or = [
        { name: regex },
        { email: regex },
        { city: regex },
        { country: regex },
      ];
    }

    const total = await ChatbotSession.countDocuments(filter);
    const sessions = await ChatbotSession.find(filter)
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.status(200).json({
      status: "success",
      data: sessions,
      pagination: {
        total,
        page: pageNumber,
        limit: pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching chatbot sessions:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch chatbot sessions",
      error: error instanceof Error ? error.message : error,
    });
  }
};

// Admin: Delete chatbot session
export const deleteChatbotSession = async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params;
    const session = await ChatbotSession.findByIdAndDelete(id);

    if (!session) {
      return res.status(404).json({
        status: "error",
        message: "Chatbot session not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Chatbot session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting chatbot session:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete chatbot session",
      error: error instanceof Error ? error.message : error,
    });
  }
};
