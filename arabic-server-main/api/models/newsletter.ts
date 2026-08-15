import mongoose, { Document, Schema } from "mongoose";

// Enum for action taken
export enum NewsletterAction {
    SUBSCRIBED = "subscribed",
    UNSUBSCRIBED = "unsubscribed",
}

export interface NewsletterDocument extends Document {
    email: string;
    action_taken: NewsletterAction;
    action_date?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const newsletterSchema = new Schema<NewsletterDocument>(
    {
        email: { type: String, required: true, unique: true },

        action_taken: {
            type: String,
            enum: Object.values(NewsletterAction),
            default: NewsletterAction.SUBSCRIBED,
        },

        action_date: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

const Newsletter = mongoose.model<NewsletterDocument>("Newsletter", newsletterSchema);
export default Newsletter;
