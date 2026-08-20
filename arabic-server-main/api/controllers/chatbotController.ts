import { Request, Response } from "express";
import ChatbotSession from "../models/chatbotSession";
import ChatbotSettings, { ChatbotSettingsDocument } from "../models/chatbotSettings";
import ChatbotQa from "../models/chatbotQa";
import { containsRegex } from "../utils/escapeRegex";
import { getClientLocation } from "../utils/getClientLocation";
import { buildKnowledge, clearKnowledgeCache } from "../services/chatbotKnowledge";
import { detectProvider, generateAiReply } from "../services/chatbotAi";
import { buildFallbackReply } from "../services/chatbotFallback";

/** A chat bubble is not an essay box. */
const MAX_MESSAGE_LENGTH = 1000;

/**
 * Sessions are kept forever, so an idle tab left open all afternoon must not be
 * able to grow one document without limit. The oldest messages go first.
 */
const MAX_STORED_MESSAGES = 200;

/**
 * The body parser strips HTML from every incoming string, which is what stops a
 * visitor storing a script tag that later runs in the admin panel. It also
 * escapes the ampersand, so "Fees & timings?" arrives as "Fees &amp; timings?"
 * and would be read back that way in the transcript and sent to the AI that
 * way. Only the entities that cannot carry markup are turned back.
 */
const decodeSafeEntities = (text: string): string =>
  (text || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

/** The one settings document, created with its defaults on first use. */
const getSettings = async (): Promise<ChatbotSettingsDocument> => {
  const existing = await ChatbotSettings.findOne();
  if (existing) return existing;
  return ChatbotSettings.create({});
};

const activeQaEntries = () => ChatbotQa.find({ isActive: true }).sort({ order: 1 });

// ---------------------------------------------------------------------------
// Public
// ---------------------------------------------------------------------------

/**
 * GET /chatbot/config — what the widget needs to draw itself.
 *
 * Only the fields the visitor's browser has to know. The persona, the model
 * name and which collections the bot may read stay on the server: they are
 * instructions, and shipping instructions to the client is how you invite
 * somebody to edit them.
 */
export const getChatbotConfig = async (_req: Request, res: Response): Promise<any> => {
  try {
    const settings = await getSettings();

    res.status(200).json({
      status: "success",
      data: {
        enabled: settings.enabled,
        botName: settings.botName,
        botTagline: settings.botTagline,
        avatarUrl: settings.avatarUrl,
        accentFrom: settings.accentFrom,
        accentTo: settings.accentTo,
        preChatTitle: settings.preChatTitle,
        preChatSubtitle: settings.preChatSubtitle,
        askForPhone: settings.askForPhone,
        inputPlaceholder: settings.inputPlaceholder,
        quickReplies: settings.quickReplies
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((item) => ({ label: item.label })),
        operatorEnabled: settings.operatorEnabled,
        operatorLabel: settings.operatorLabel,
        whatsappNumber: settings.whatsappNumber,
        whatsappMessage: settings.whatsappMessage,
        voiceInputEnabled: settings.voiceInputEnabled,
        voiceReplyEnabled: settings.voiceReplyEnabled,
        voiceLanguage: settings.voiceLanguage,
      },
    });
  } catch (error) {
    console.error("Error loading chatbot config:", error);
    res.status(500).json({ status: "error", message: "Failed to load chatbot config" });
  }
};

/** POST /chatbot/session — records the lead and opens the transcript. */
export const createChatbotSession = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ status: "error", message: "Name and Email are required" });
    }

    const settings = await getSettings();
    if (!settings.enabled) {
      return res.status(403).json({ status: "error", message: "The chat is currently unavailable." });
    }

    // Resolve client location directly from request IP on the backend
    const location = await getClientLocation(req);

    const visitorName = decodeSafeEntities(String(name).trim()).slice(0, 120);
    const greeting = settings.welcomeMessage.replace(/\{name\}/g, visitorName);
    const now = new Date();

    // The opening lines are stored like any other message. Without them a
    // transcript would start mid-conversation with the visitor's first reply.
    const openingMessages = [
      { role: "bot" as const, text: greeting, source: "greeting" as const, at: now },
      {
        role: "bot" as const,
        text: settings.followUpMessage,
        source: "greeting" as const,
        at: now,
      },
    ].filter((message) => message.text.trim());

    const session = new ChatbotSession({
      name: visitorName,
      email: decodeSafeEntities(String(email).trim()).slice(0, 200),
      phone: phone ? String(phone).trim().slice(0, 40) : "",
      ip: location.ip || req.ip || "",
      city: location.city || "Unknown",
      country: location.country || "Unknown",
      messages: openingMessages,
      messageCount: openingMessages.length,
      lastMessageAt: now,
    });

    await session.save();

    res.status(201).json({
      status: "success",
      message: "Chatbot session recorded successfully",
      data: {
        sessionId: session._id,
        messages: openingMessages,
      },
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

/**
 * POST /chatbot/message — the actual conversation.
 *
 * The reply is worked out in this order: an admin-written answer the AI is told
 * to repeat verbatim, then the AI reading the website's own content, then plain
 * keyword matching if the AI is unavailable for any reason. The visitor gets an
 * answer in all three cases.
 */
export const postChatbotMessage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { sessionId, text, quickReplyLabel } = req.body;

    const incoming = decodeSafeEntities(String(text || quickReplyLabel || "").trim());
    if (!incoming) {
      return res.status(400).json({ status: "error", message: "Message is required" });
    }
    if (incoming.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        status: "error",
        message: `Please keep your message under ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    const settings = await getSettings();
    if (!settings.enabled) {
      return res.status(403).json({ status: "error", message: "The chat is currently unavailable." });
    }

    // A session is not required to get an answer — losing the id should not
    // break the conversation — but without one there is nothing to record.
    const session = sessionId ? await ChatbotSession.findById(sessionId) : null;

    // A quick reply the admin gave a fixed answer to skips the AI entirely.
    // It is a button with a scripted response, and paying a model to repeat it
    // would be slower and less predictable.
    const scripted = quickReplyLabel
      ? settings.quickReplies.find(
          (item) => item.label === quickReplyLabel && item.reply.trim()
        )
      : undefined;

    let replyText: string;
    let source: "ai" | "qa" | "knowledge" | "quick-reply" | "fallback";
    let usedQaId: string | undefined;

    if (scripted) {
      replyText = scripted.reply;
      source = "quick-reply";
    } else {
      const [knowledge, qaEntries] = await Promise.all([
        buildKnowledge(settings.knowledge),
        activeQaEntries(),
      ]);

      const history = (session?.messages || [])
        .slice(-10)
        .map((message) => ({ role: message.role, text: message.text }));

      const aiReply = await generateAiReply({
        settings,
        knowledge,
        qaEntries,
        history,
        message: incoming,
      });

      if (aiReply) {
        replyText = aiReply;
        source = "ai";
      } else {
        const fallback = buildFallbackReply({
          settings,
          knowledge,
          qaEntries,
          message: incoming,
        });
        replyText = fallback.text;
        source = fallback.source as typeof source;
        usedQaId = fallback.qaId;
      }
    }

    if (usedQaId) {
      // Best effort — a counter is not worth failing a reply over.
      ChatbotQa.findByIdAndUpdate(usedQaId, { $inc: { timesUsed: 1 } }).catch(() => undefined);
    }

    if (session) {
      const now = new Date();
      session.messages.push(
        { role: "user", text: incoming, at: now },
        { role: "bot", text: replyText, source, at: now }
      );
      if (session.messages.length > MAX_STORED_MESSAGES) {
        session.messages = session.messages.slice(-MAX_STORED_MESSAGES);
      }
      session.messageCount += 2;
      session.lastMessageAt = now;
      await session.save();
    }

    res.status(200).json({
      status: "success",
      data: { reply: replyText, source },
    });
  } catch (error) {
    console.error("Error answering chatbot message:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to answer the message",
    });
  }
};

/**
 * POST /chatbot/handoff — the visitor asked for a human.
 *
 * Flagged on the session so the team can tell, in the leads list, which
 * conversations the bot could not finish.
 */
export const markChatbotHandoff = async (req: Request, res: Response): Promise<any> => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ status: "error", message: "Session is required" });
    }

    await ChatbotSession.findByIdAndUpdate(sessionId, { handedOffToOperator: true });
    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("Error recording chatbot handoff:", error);
    res.status(500).json({ status: "error", message: "Failed to record the handoff" });
  }
};

// ---------------------------------------------------------------------------
// Admin — leads and transcripts
// ---------------------------------------------------------------------------

/** GET /admin/chatbot/sessions — the leads table. */
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
      // The transcripts are not needed to draw a table row, and sending every
      // message of every session would make this the heaviest admin request.
      .select("-messages")
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

/** GET /admin/chatbot/sessions/:id — one conversation, in full. */
export const getChatbotSession = async (req: Request, res: Response): Promise<any> => {
  try {
    const session = await ChatbotSession.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ status: "error", message: "Chatbot session not found" });
    }

    res.status(200).json({ status: "success", data: session });
  } catch (error) {
    console.error("Error fetching chatbot session:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch the conversation" });
  }
};

/** POST /admin/chatbot/sessions/delete-many */
export const deleteManyChatbotSessions = async (req: Request, res: Response): Promise<any> => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: "No conversations selected" });
    }

    // An upper bound so one malformed request cannot wipe the list.
    if (ids.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Please delete at most 500 conversations at a time",
      });
    }

    const result = await ChatbotSession.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} conversation(s) deleted successfully!`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting chatbot sessions:", error);
    res.status(500).json({ success: false, message: "Failed to delete the conversations" });
  }
};

/** DELETE /admin/chatbot/sessions/:id */
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

// ---------------------------------------------------------------------------
// Admin — customisation
// ---------------------------------------------------------------------------

/**
 * GET /admin/chatbot/settings
 *
 * Reports whether an AI key is actually configured. The admin can switch the AI
 * on in this form, but the key lives in the server's environment — without this
 * flag the switch looks like it worked while every reply quietly came from the
 * keyword matcher.
 */
export const getChatbotSettings = async (_req: Request, res: Response): Promise<any> => {
  try {
    const settings = await getSettings();
    const provider = detectProvider();

    res.status(200).json({
      status: "success",
      data: settings,
      ai: {
        keyConfigured: provider !== null,
        provider,
      },
    });
  } catch (error) {
    console.error("Error fetching chatbot settings:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch chatbot settings" });
  }
};

/** Fields an admin may set. Anything else in the body is ignored. */
const EDITABLE_FIELDS = [
  "enabled",
  "botName",
  "botTagline",
  "avatarUrl",
  "avatarPublicId",
  "accentFrom",
  "accentTo",
  "preChatTitle",
  "preChatSubtitle",
  "askForPhone",
  "welcomeMessage",
  "followUpMessage",
  "inputPlaceholder",
  "fallbackMessage",
  "quickReplies",
  "operatorEnabled",
  "operatorLabel",
  "whatsappNumber",
  "whatsappMessage",
  "voiceInputEnabled",
  "voiceReplyEnabled",
  "voiceLanguage",
  "aiEnabled",
  "aiModel",
  "aiPersona",
  "aiMaxReplyWords",
  "knowledge",
] as const;

/** PUT /admin/chatbot/settings */
export const updateChatbotSettings = async (req: Request, res: Response): Promise<any> => {
  try {
    const settings = await getSettings();

    for (const field of EDITABLE_FIELDS) {
      if (req.body[field] === undefined) continue;

      if (field === "quickReplies" && Array.isArray(req.body.quickReplies)) {
        settings.quickReplies = req.body.quickReplies
          .filter((item: any) => item?.label?.trim())
          .map((item: any, index: number) => ({
            label: String(item.label).trim(),
            reply: String(item.reply || "").trim(),
            order: index + 1,
          }));
        continue;
      }

      (settings as any)[field] = req.body[field];
    }

    await settings.save();

    // Turning a source off has to take effect now, not in ten minutes.
    clearKnowledgeCache();

    res.status(200).json({
      status: "success",
      message: "Chatbot settings saved",
      data: settings,
    });
  } catch (error) {
    console.error("Error saving chatbot settings:", error);
    res.status(500).json({
      status: "error",
      message: error instanceof Error ? error.message : "Failed to save chatbot settings",
    });
  }
};

// ---------------------------------------------------------------------------
// Admin — the questions the academy writes itself
// ---------------------------------------------------------------------------

/** GET /admin/chatbot/qa */
export const getChatbotQaEntries = async (_req: Request, res: Response): Promise<any> => {
  try {
    const entries = await ChatbotQa.find().sort({ order: 1, createdAt: 1 });
    res.status(200).json({ status: "success", data: entries });
  } catch (error) {
    console.error("Error fetching chatbot questions:", error);
    res.status(500).json({ status: "error", message: "Failed to fetch the questions" });
  }
};

/** Accepts either an array or a comma separated string. */
const normaliseKeywords = (value: unknown): string[] => {
  const raw = Array.isArray(value) ? value : String(value || "").split(",");
  return raw
    .map((item) => String(item).trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 40);
};

/** POST /admin/chatbot/qa */
export const createChatbotQaEntry = async (req: Request, res: Response): Promise<any> => {
  try {
    const { question, answer, keywords, isActive, order } = req.body;

    if (!question?.trim() || !answer?.trim()) {
      return res
        .status(400)
        .json({ status: "error", message: "Both a question and an answer are required" });
    }

    const last = await ChatbotQa.findOne().sort({ order: -1 }).select("order");

    const entry = await ChatbotQa.create({
      question: question.trim(),
      answer: answer.trim(),
      keywords: normaliseKeywords(keywords),
      isActive: isActive !== false,
      order: typeof order === "number" ? order : (last?.order || 0) + 1,
    });

    res.status(201).json({ status: "success", message: "Question added", data: entry });
  } catch (error) {
    console.error("Error creating chatbot question:", error);
    res.status(500).json({ status: "error", message: "Failed to add the question" });
  }
};

/** PUT /admin/chatbot/qa/:id */
export const updateChatbotQaEntry = async (req: Request, res: Response): Promise<any> => {
  try {
    const { question, answer, keywords, isActive, order } = req.body;

    const update: Record<string, unknown> = {};
    if (question !== undefined) update.question = String(question).trim();
    if (answer !== undefined) update.answer = String(answer).trim();
    if (keywords !== undefined) update.keywords = normaliseKeywords(keywords);
    if (isActive !== undefined) update.isActive = Boolean(isActive);
    if (order !== undefined) update.order = Number(order) || 0;

    const entry = await ChatbotQa.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!entry) {
      return res.status(404).json({ status: "error", message: "Question not found" });
    }

    res.status(200).json({ status: "success", message: "Question updated", data: entry });
  } catch (error) {
    console.error("Error updating chatbot question:", error);
    res.status(500).json({ status: "error", message: "Failed to update the question" });
  }
};

/** DELETE /admin/chatbot/qa/:id */
export const deleteChatbotQaEntry = async (req: Request, res: Response): Promise<any> => {
  try {
    const entry = await ChatbotQa.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ status: "error", message: "Question not found" });
    }

    res.status(200).json({ status: "success", message: "Question deleted" });
  } catch (error) {
    console.error("Error deleting chatbot question:", error);
    res.status(500).json({ status: "error", message: "Failed to delete the question" });
  }
};

/**
 * POST /admin/chatbot/preview — try a question without going to the website.
 *
 * Runs the real answering path, so what comes back is what a visitor would get.
 * Nothing is saved: this is not a lead.
 */
export const previewChatbotReply = async (req: Request, res: Response): Promise<any> => {
  try {
    const message = String(req.body?.text || "").trim();
    if (!message) {
      return res.status(400).json({ status: "error", message: "Type a question to try" });
    }

    const settings = await getSettings();
    const [knowledge, qaEntries] = await Promise.all([
      buildKnowledge(settings.knowledge),
      activeQaEntries(),
    ]);

    const aiReply = await generateAiReply({
      settings,
      knowledge,
      qaEntries,
      history: [],
      message,
    });

    if (aiReply) {
      return res.status(200).json({ status: "success", data: { reply: aiReply, source: "ai" } });
    }

    const fallback = buildFallbackReply({ settings, knowledge, qaEntries, message });
    res.status(200).json({
      status: "success",
      data: { reply: fallback.text, source: fallback.source },
    });
  } catch (error) {
    console.error("Error previewing chatbot reply:", error);
    res.status(500).json({ status: "error", message: "Failed to generate a preview" });
  }
};
