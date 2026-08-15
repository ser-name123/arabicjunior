import mongoose, { Document, Schema } from "mongoose";

export interface ContactSettingsDocument extends Document {
  headerPhone: string;
  headerPhoneLink: string;
  contactEmail: string;
  contactLocation: string;
  contactPhone: string;
  contactWhatsApp: string;
  contactWhatsAppLink: string;
}

const contactSettingsSchema = new Schema<ContactSettingsDocument>(
  {
    headerPhone: { type: String, default: "+971 50 534 4645" },
    headerPhoneLink: { type: String, default: "tel:+971505344645" },
    contactEmail: { type: String, default: "hello@ArabicJuniors.com" },
    contactLocation: { type: String, default: "United Arab Emirates" },
    contactPhone: { type: String, default: "+971 50 992 1470" },
    contactWhatsApp: { type: String, default: "+971 50 534 4645" },
    contactWhatsAppLink: { type: String, default: "https://wa.me/971505344645?text=Hello!%20I'm%20interested%20in%20enrolling%20in%20Arabic%20tuition%20classes.%20Please%20get%20in%20touch%20with%20me" }
  },
  { timestamps: true }
);

export default mongoose.models.ContactSettings || mongoose.model<ContactSettingsDocument>("ContactSettings", contactSettingsSchema);
