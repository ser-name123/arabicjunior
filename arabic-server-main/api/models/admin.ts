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
  /** Google's stable user id (`sub`), recorded on first Google sign-in. */
  googleId?: string;
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

    // `sparse` matters: without it, every password-only admin would share a
    // null googleId and the unique index would reject the second one.
    googleId: { type: String, unique: true, sparse: true },
    name: { type: String, trim: true },
    picture: { type: String },
  },
  { timestamps: true }
);

const Admin = mongoose.model<AdminDocument>("Admin", adminSchema);
export default Admin;
