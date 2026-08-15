import mongoose, { Document, Types } from "mongoose";

export interface SchoolLogoDocument extends Document {
  name: string;
  logoUrl: string;
  logoPublicId: string;
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const schoolLogoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logoUrl: { type: String, required: true },
    logoPublicId: { type: String, required: true },
  },
  { timestamps: true }
);

const SchoolLogo = mongoose.model<SchoolLogoDocument>("SchoolLogo", schoolLogoSchema);
export default SchoolLogo;
