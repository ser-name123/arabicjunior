import mongoose, { Document, Types } from "mongoose";

/**
 * One visitor's chat: who they are, and what was actually said.
 *
 * The conversation used to live only in the visitor's browser and was thrown
 * away when they closed the tab, so a lead in the admin panel was a name and an
 * email with no way to find out what the person had asked. The messages are
 * kept here so that chat can be read back.
 */

export type ChatbotMessageRole = "user" | "bot";

/** Where a bot reply came from — useful when tuning the answers. */
export type ChatbotReplySource =
  | "ai"
  | "qa"
  | "knowledge"
  | "quick-reply"
  | "greeting"
  | "fallback";

export interface ChatbotMessage {
  role: ChatbotMessageRole;
  text: string;
  source?: ChatbotReplySource;
  at: Date;
}

export interface ChatbotSessionDocument extends Document {
  name: string;
  email: string;
  phone: string;
  ip: string;
  city: string;
  country: string;
  messages: ChatbotMessage[];
  messageCount: number;
  lastMessageAt: Date | null;
  /** Set when the visitor gave up on the bot and asked for a human. */
  handedOffToOperator: boolean;
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatbotMessageSchema = new mongoose.Schema<ChatbotMessage>(
  {
    role: { type: String, enum: ["user", "bot"], required: true },
    text: { type: String, required: true },
    source: {
      type: String,
      enum: ["ai", "qa", "knowledge", "quick-reply", "greeting", "fallback"],
    },
    at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const chatbotSessionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: "" },
    ip: { type: String },
    city: { type: String },
    country: { type: String },
    messages: { type: [chatbotMessageSchema], default: [] },
    // Denormalised so the leads table can show a count and sort by activity
    // without pulling every message of every session.
    messageCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: null },
    handedOffToOperator: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ChatbotSession = mongoose.model<ChatbotSessionDocument>("ChatbotSession", chatbotSessionSchema);
export default ChatbotSession;
