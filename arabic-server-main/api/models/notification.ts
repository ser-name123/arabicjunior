import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  type: "contact" | "trial" | "teacher" | "job" | "support";
  title: string;
  message: string;
  link: string;
  data: any;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: ["contact", "trial", "teacher", "job", "support"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    data: { type: Schema.Types.Mixed, default: {} },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
