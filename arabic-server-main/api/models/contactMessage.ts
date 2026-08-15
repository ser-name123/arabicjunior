import mongoose, { Document, Schema } from "mongoose";

export enum ActionTaken {
    PENDING = "pending",
    REPLIED = "replied",
    RESOLVED = "resolved",
    DISMISSED = "dismissed",
}

export interface ContactMessageDocument extends Document {
    fullName: string;
    email: string;
    contactingPurpose: string;
    message: string;
    action_taken: ActionTaken;
    action_date?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const contactMessageSchema = new Schema<ContactMessageDocument>(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        contactingPurpose: { type: String, required: true },
        message: { type: String, required: true },
        action_taken: {
            type: String,
            enum: Object.values(ActionTaken),
            default: ActionTaken.PENDING,
        },

        action_date: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const ContactMessage = mongoose.model<ContactMessageDocument>("ContactMessage", contactMessageSchema);
export default ContactMessage;
