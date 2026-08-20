import mongoose, { Document, Schema } from "mongoose";

/**
 * Everything about the website chat widget that an admin can change without a
 * developer: what it is called, how it looks, what it says, which parts of the
 * database it is allowed to read, and whether it may speak.
 *
 * Stored as a single document. There is only ever one chat widget.
 */

export interface ChatbotQuickReply {
  label: string;
  /** Left blank to let the AI answer the label as if it had been typed. */
  reply: string;
  order: number;
}

/**
 * Which collections the bot may read when answering.
 *
 * This is an allowlist, deliberately. A denylist would quietly start leaking
 * the day somebody adds a collection and forgets to exclude it — and the
 * collections not named here are enquiry forms, applications and registrations,
 * which hold children's names, parents' phone numbers and job applicants'
 * documents. Nothing personal is reachable from this list at all.
 */
export interface ChatbotKnowledgeSources {
  /** Plan names, prices and what each includes. */
  pricing: boolean;
  /** The published teacher profiles already shown on the public site. */
  teachers: boolean;
  /** The FAQ section from the homepage. */
  faqs: boolean;
  /** Blog titles, summaries and links. */
  blogs: boolean;
  /** Open job positions. */
  jobs: boolean;
  /** Phone, email, WhatsApp and address. */
  contact: boolean;
  /** The academy's own description and headline numbers. */
  about: boolean;
  /** Published parent and student reviews. */
  testimonials: boolean;
}

export interface ChatbotSettingsDocument extends Document {
  enabled: boolean;

  botName: string;
  botTagline: string;
  avatarUrl: string;
  avatarPublicId: string;
  accentFrom: string;
  accentTo: string;

  preChatTitle: string;
  preChatSubtitle: string;
  askForPhone: boolean;
  welcomeMessage: string;
  followUpMessage: string;
  inputPlaceholder: string;
  fallbackMessage: string;

  quickReplies: ChatbotQuickReply[];

  operatorEnabled: boolean;
  operatorLabel: string;
  whatsappNumber: string;
  whatsappMessage: string;

  voiceInputEnabled: boolean;
  voiceReplyEnabled: boolean;
  voiceLanguage: string;

  aiEnabled: boolean;
  aiModel: string;
  aiPersona: string;
  aiMaxReplyWords: number;

  knowledge: ChatbotKnowledgeSources;

  createdAt: Date;
  updatedAt: Date;
}

const quickReplySchema = new Schema<ChatbotQuickReply>(
  {
    label: { type: String, required: true, trim: true },
    reply: { type: String, default: "", trim: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const chatbotSettingsSchema = new Schema<ChatbotSettingsDocument>(
  {
    enabled: { type: Boolean, default: true },

    botName: { type: String, default: "Juniors Support Bot", trim: true },
    botTagline: { type: String, default: "Online", trim: true },
    avatarUrl: { type: String, default: "" },
    avatarPublicId: { type: String, default: "" },
    // Held as hex, not as Tailwind class names: a class assembled from a
    // database string is stripped out at build time and the colour silently
    // disappears. These are applied as inline styles instead.
    accentFrom: { type: String, default: "#FF60A8", trim: true },
    accentTo: { type: String, default: "#FB6238", trim: true },

    preChatTitle: { type: String, default: "Start Chatting", trim: true },
    preChatSubtitle: {
      type: String,
      default: "Introduce yourself and speak with our advisors.",
      trim: true,
    },
    askForPhone: { type: Boolean, default: false },
    // {name} is replaced with whatever the visitor typed in the pre-chat form.
    welcomeMessage: {
      type: String,
      default: "Hi {name}! Welcome to Arabic Juniors Academy. 👋",
      trim: true,
    },
    followUpMessage: {
      type: String,
      default:
        "How can we help you today? Please choose one of the options below or type your question.",
      trim: true,
    },
    inputPlaceholder: { type: String, default: "Type your message...", trim: true },
    fallbackMessage: {
      type: String,
      default:
        "I don't have that detail to hand. Tap \"Talk with Operator\" and someone from our team will help you right away.",
      trim: true,
    },

    quickReplies: {
      type: [quickReplySchema],
      default: [
        { label: "📅 Book a Free Trial Class", reply: "", order: 1 },
        { label: "💰 Course Pricing & Packages", reply: "", order: 2 },
        { label: "📚 Tutors & Curriculum", reply: "", order: 3 },
      ],
    },

    operatorEnabled: { type: Boolean, default: true },
    operatorLabel: { type: String, default: "Talk with Operator", trim: true },
    whatsappNumber: { type: String, default: "971505344645", trim: true },
    whatsappMessage: {
      type: String,
      default:
        "Hello! I'm interested in enrolling in Arabic tuition classes. Please get in touch with me",
      trim: true,
    },

    voiceInputEnabled: { type: Boolean, default: true },
    voiceReplyEnabled: { type: Boolean, default: true },
    voiceLanguage: { type: String, default: "en-US", trim: true },

    aiEnabled: { type: Boolean, default: true },
    aiModel: { type: String, default: "claude-haiku-4-5-20251001", trim: true },
    aiPersona: {
      type: String,
      default:
        "You are the assistant for Arabic Juniors, an online Arabic tuition academy for children based in the UAE. Parents are your audience: be warm, brief and practical. Encourage booking a free trial class when it fits naturally.",
      trim: true,
    },
    // Long answers read badly in a 380px wide window.
    aiMaxReplyWords: { type: Number, default: 90, min: 20, max: 400 },

    knowledge: {
      pricing: { type: Boolean, default: true },
      teachers: { type: Boolean, default: true },
      faqs: { type: Boolean, default: true },
      blogs: { type: Boolean, default: true },
      jobs: { type: Boolean, default: true },
      contact: { type: Boolean, default: true },
      about: { type: Boolean, default: true },
      testimonials: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ChatbotSettingsDocument>(
  "ChatbotSettings",
  chatbotSettingsSchema
);
