import mongoose, { Document, Schema } from "mongoose";

// Enum type for action taken
export enum ActionTaken {
    PENDING = "pending",
    REPLIED = "replied",
    RESOLVED = "resolved",
    DISMISSED = "dismissed",
}

export interface QuestionDocument extends Document {
    your_name: string;
    email: string;
    user_message: string;
    action_taken: ActionTaken;
    action_date?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const questionSchema = new Schema<QuestionDocument>(
    {
        your_name: { type: String, required: true },
        email: { type: String, required: true },
        user_message: { type: String, required: true },

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

const Question = mongoose.model<QuestionDocument>("Question", questionSchema);
export default Question;