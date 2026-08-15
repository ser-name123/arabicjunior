import mongoose, { Document, Types } from "mongoose";

export interface ChatbotSessionDocument extends Document {
  name: string;
  email: string;
  ip: string;
  city: string;
  country: string;
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatbotSessionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    ip: { type: String },
    city: { type: String },
    country: { type: String },
  },
  { timestamps: true }
);

const ChatbotSession = mongoose.model<ChatbotSessionDocument>("ChatbotSession", chatbotSessionSchema);
export default ChatbotSession;
