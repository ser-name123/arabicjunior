import mongoose, { Document, Types } from "mongoose";

export interface AdminDocument extends Document {
  email: string;
  passwordHash: string;
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  _id: Types.ObjectId;
}

const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  twoFactorSecret: { type: String },
  isTwoFactorEnabled: { type: Boolean, default: false },
});

const Admin = mongoose.model<AdminDocument>("Admin", adminSchema);
export default Admin;
