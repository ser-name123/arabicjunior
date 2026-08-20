import mongoose, { Document, Schema } from "mongoose";

/**
 * A question and answer an admin has written by hand.
 *
 * These outrank everything else the bot knows. When a parent asks something the
 * academy wants answered a particular way — refund terms, class timings, what
 * happens if a lesson is missed — the reply here is sent word for word rather
 * than being rephrased by the AI. That is the point of the feature: the academy
 * decides the wording, not the model.
 */
export interface ChatbotQaDocument extends Document {
  question: string;
  answer: string;
  /**
   * Extra words that should also match this entry. A parent asking about "fees"
   * will not type the question exactly as written, and the AI is not always in
   * play — this is what the keyword matcher searches.
   */
  keywords: string[];
  isActive: boolean;
  order: number;
  /** How often this answer has been sent, so unused entries are easy to spot. */
  timesUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

const chatbotQaSchema = new Schema<ChatbotQaDocument>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    keywords: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    timesUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

chatbotQaSchema.index({ isActive: 1, order: 1 });

export default mongoose.model<ChatbotQaDocument>("ChatbotQa", chatbotQaSchema);
