import mongoose, { Document, Types } from "mongoose";

export interface AdminDocument extends Document {
  email: string;
  /**
   * Optional so an admin can exist without one — a Google-only account never
   * sets a password. Every account created before Google sign-in has one, and
   * the password login path rejects any account that does not.
   */
  passwordHash?: string;
  twoFactorSecret?: string;
  isTwoFactorEnabled: boolean;
  /** Human-readable name and picture from Google, for the admin header. */
  name?: string;
  picture?: string;
  _id: Types.ObjectId;
}

const adminSchema = new mongoose.Schema(
  {
    // Stored lower-case so "Anas@Gmail.com" and "anas@gmail.com" cannot become
    // two accounts, and so a Google lookup by email always matches.
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    twoFactorSecret: { type: String },
    isTwoFactorEnabled: { type: Boolean, default: false },

    name: { type: String, trim: true },
    picture: { type: String },
  },
  { timestamps: true }
);

const Admin = mongoose.model<AdminDocument>("Admin", adminSchema);
export default Admin;
