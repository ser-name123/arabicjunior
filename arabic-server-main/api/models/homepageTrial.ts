import mongoose, { Document, Schema } from "mongoose";

export interface HomepageTrialDocument extends Document {
  badgeText: string;
  heading: string;
  headingHighlight: string;
  headingSuffix: string;
  description: string;
  
  // 4 main feature circles
  features: Array<{
    title: string;
    icon: string;
  }>;
  
  btnBookText: string;
  btnDetailsText: string;
  subtext1: string;
  subtext2: string;
  
  imageUrl: string;
  imagePublicId: string;
  
  // 3 bottom row cards
  bottomCards: Array<{
    title: string;
    desc: string;
    icon: string;
  }>;
}

const homepageTrialSchema = new Schema<HomepageTrialDocument>(
  {
    badgeText: { type: String, default: "Free Trial Class" },
    heading: { type: String, default: "Let Your Child Experience" },
    headingHighlight: { type: String, default: "Arabic Learning" },
    headingSuffix: { type: String, default: "the Right Way" },
    description: { type: String, default: "Give your child a chance to experience a personalized online Arabic lesson with an experienced teacher." },
    
    features: {
      type: [
        {
          title: { type: String },
          icon: { type: String }
        }
      ],
      default: [
        { title: "Personalised Assessment", icon: "ClipboardCheck" },
        { title: "Live Interactive Lesson", icon: "MonitorPlay" },
        { title: "UAE Curriculum Support", icon: "BookOpenCheck" },
        { title: "Parent Feedback", icon: "MessageSquareMore" }
      ]
    },
    
    btnBookText: { type: String, default: "Book a Free Trial for My Child" },
    btnDetailsText: { type: String, default: "More Details" },
    subtext1: { type: String, default: "No long-term commitment." },
    subtext2: { type: String, default: "Discover the right learning approach for your child." },
    
    imageUrl: { type: String, default: "/free_trial_banner_student.png" },
    imagePublicId: { type: String, default: "" },
    
    bottomCards: {
      type: [
        {
          title: { type: String },
          desc: { type: String },
          icon: { type: String }
        }
      ],
      default: [
        { title: "Expert Teachers", desc: "Experienced native & fluent Arabic instructors.", icon: "GraduationCap" },
        { title: "Structured Learning", desc: "Well-planned lessons designed for steady progress.", icon: "BookOpen" },
        { title: "Engaging & Fun", desc: "Interactive activities that make learning enjoyable.", icon: "Users2" }
      ]
    }
  },
  { timestamps: true }
);

export default mongoose.models.HomepageTrial || mongoose.model<HomepageTrialDocument>("HomepageTrial", homepageTrialSchema);
