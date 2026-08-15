import mongoose, { Document, Types } from "mongoose";

export interface TrialLandingDocument extends Document {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  slug: string;
  title: string;

  // Hero Section
  heroBadgeText: string;
  heroHeading: string;
  heroHeadingHighlight: string;
  heroSubheading: string;
  heroDescription1: string;
  heroDescription2: string;
  heroBullets: string[];
  heroCtaText: string;
  heroCtaSubtext: string;
  heroImageUrl: string;
  heroImagePublicId: string;

  // Why Section
  whySubheader: string;
  whyHeading: string;
  whyDescription: string;
  whyCards: Array<{
    title: string;
    desc: string;
    titleColor: string;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    icon: string;
  }>;

  // Process Section
  processSubheader: string;
  processHeading: string;

  // Skills Section
  assessSubheader: string;
  assessTitle: string;
  assessDescription: string;
  assessSkills: Array<{
    title: string;
    desc: string;
    textColor: string;
    bgColor: string;
    icon: string;
  }>;

  // Curricula Section
  curriculaSubheader: string;
  curriculaTitle: string;
  curriculaDescription: string;
  curriculaBadges: string[];

  // Choose Section
  chooseSubheader: string;
  chooseHeading: string;
  chooseCards: Array<{
    title: string;
    desc: string;
    icon: string;
    bgColor: string;
    borderColor: string;
    iconColor: string;
  }>;

  // Onboarding Section
  onboardingSubheader: string;
  onboardingHeading: string;
  onboardingSteps: Array<{
    num: string;
    title: string;
    desc: string;
    numBg: string;
  }>;

  // Suitability Section
  suitabilitySubheader: string;
  suitabilityTitle: string;
  suitabilityDescription: string;
  suitabilityBullets: string[];
  suitabilityImageUrl: string;
  suitabilityImagePublicId: string;

  // FAQ Section
  faqSubheader: string;
  faqTitle: string;
  faqItems: Array<{
    question: string;
    answer: string;
  }>;

  // CTA Section
  ctaHeading: string;
  ctaDescription: string;
  ctaButtonText: string;
  ctaSubtext: string;
  ctaImageUrl: string;
  ctaImagePublicId: string;
}

const trialLandingSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Free Trial Landing Page", required: true },
    slug: { type: String, default: "trial-landing", unique: true },
    // Hero Section
    heroBadgeText: { type: String, default: "Free Trial Class" },
    heroHeading: { type: String, default: "Discover Your Child's" },
    heroHeadingHighlight: { type: String, default: "Arabic" },
    heroSubheading: { type: String, default: "Start With a Free Trial Class" },
    heroDescription1: { type: String, default: "Not sure what level your child is at or what kind of Arabic support they need?" },
    heroDescription2: { type: String, default: "Let your child experience a personalized online Arabic class with one of our experienced teachers." },
    heroBullets: { 
      type: [String], 
      default: [
        "Personalised Evaluation",
        "Live Interactive Lesson",
        "Parent Feedback",
        "UAE Curriculum Support"
      ] 
    },
    heroCtaText: { type: String, default: "Book My Child's Free Trial" },
    heroCtaSubtext: { type: String, default: "For UAE School Students | KG – Grade 6" },
    heroImageUrl: { type: String, default: "/free_trial_landing_student.png" },
    heroImagePublicId: { type: String, default: "" },

    // Why Section
    whySubheader: { type: String, default: "Why Take a Trial?" },
    whyHeading: { type: String, default: "Before You Enrol, See How Your Child Learns" },
    whyDescription: { type: String, default: "Our trial class gives both parents and students an opportunity to experience our teaching approach before committing to a course." },
    whyCards: {
      type: [
        {
          title: String,
          desc: String,
          titleColor: String,
          bgColor: String,
          borderColor: String,
          iconColor: String,
          icon: String
        }
      ],
      default: [
        {
          title: "Understand Their Level",
          desc: "We identify your child's current Arabic abilities.",
          titleColor: "text-[#0B46AD]",
          bgColor: "bg-[#EBF2FC]",
          borderColor: "border-[#D0E7FF]",
          iconColor: "text-[#0B46AD]",
          icon: "ClipboardList"
        },
        {
          title: "Experience Our Classes",
          desc: "See how our interactive lessons work.",
          titleColor: "text-[#FB6238]",
          bgColor: "bg-[#FFF5F1]",
          borderColor: "border-[#FFD0BD]",
          iconColor: "text-[#FB6238]",
          icon: "Monitor"
        },
        {
          title: "Meet a Teacher",
          desc: "Meet an experienced Arabic teacher.",
          titleColor: "text-[#00A389]",
          bgColor: "bg-[#E6F7F0]",
          borderColor: "border-[#A7E2CB]",
          iconColor: "text-[#00A389]",
          icon: "UserCheck"
        },
        {
          title: "Get Parent Feedback",
          desc: "Understand strengths and areas to improve.",
          titleColor: "text-[#FFA800]",
          bgColor: "bg-[#FFFDF0]",
          borderColor: "border-[#FEEFD0]",
          iconColor: "text-[#FFA800]",
          icon: "HeartHandshake"
        }
      ]
    },

    // Process Section
    processSubheader: { type: String, default: "What Happens During The Trial?" },
    processHeading: { type: String, default: "A Simple 4-Step Process" },

    // Skills Section
    assessSubheader: { type: String, default: "What Do We Assess?" },
    assessTitle: { type: String, default: "A Trial Designed Around Your Child" },
    assessDescription: { type: String, default: "We evaluate important Arabic skills to understand your child's current level." },
    assessSkills: {
      type: [
        {
          title: String,
          desc: String,
          textColor: String,
          bgColor: String,
          icon: String
        }
      ],
      default: [
        { title: "Reading", desc: "Ability to read Arabic words and sentences.", textColor: "text-[#00A389]", bgColor: "bg-[#E6F7F0]", icon: "BookOpen" },
        { title: "Writing", desc: "Letter formation, word writing and sentence writing.", textColor: "text-[#FB6238]", bgColor: "bg-[#FFF5F1]", icon: "ClipboardList" },
        { title: "Speaking", desc: "Oral fluency and pronunciation.", textColor: "text-[#E05493]", bgColor: "bg-[#FDF2F8]", icon: "UserCheck" },
        { title: "Vocabulary", desc: "Knowledge of words and expressions.", textColor: "text-[#0062FC]", bgColor: "bg-[#EFF6FF]", icon: "HeartHandshake" },
        { title: "Listening", desc: "Understanding spoken Arabic at their level.", textColor: "text-[#FFA800]", bgColor: "bg-[#FFFDF0]", icon: "Gift" },
        { title: "Grammar", desc: "Understanding grammar rules and structure.", textColor: "text-[#EF4444]", bgColor: "bg-[#FFF0F0]", icon: "CheckCircle2" }
      ]
    },

    // Curricula Section
    curriculaSubheader: { type: String, default: "Arabic Support For UAE Curricula" },
    curriculaTitle: { type: String, default: "We Support All Major UAE School Curricula" },
    curriculaDescription: { type: String, default: "We tailor our classes to match your child's school requirements." },
    curriculaBadges: { type: [String], default: ["UAE MOE", "CBSE", "British", "IB", "American"] },

    // Choose Section
    chooseSubheader: { type: String, default: "Why Parents Choose Our Trial" },
    chooseHeading: { type: String, default: "More Than Just a Demo Class" },
    chooseCards: {
      type: [
        {
          title: String,
          desc: String,
          icon: String,
          bgColor: String,
          borderColor: String,
          iconColor: String
        }
      ],
      default: [
        { title: "Personalised Learning", desc: "Lessons adapted to your child's current ability.", icon: "PencilRuler", bgColor: "bg-[#FFF5F1]", borderColor: "border-[#FFD0BD]", iconColor: "text-[#FB6238]" },
        { title: "One-to-One Attention", desc: "Focused attention from the teacher in every class.", icon: "Tv", bgColor: "bg-[#E6F7F0]", borderColor: "border-[#A7E2CB]", iconColor: "text-[#00A389]" },
        { title: "Experienced Teachers", desc: "Teachers who understand how children learn.", icon: "UserCheck", bgColor: "bg-[#EBF2FC]", borderColor: "border-[#D0E7FF]", iconColor: "text-[#0B46AD]" },
        { title: "Interactive Classes", desc: "Engaging lessons that keep children involved.", icon: "Hourglass", bgColor: "bg-[#FFFDF0]", borderColor: "border-[#FEEFD0]", iconColor: "text-[#FFA800]" },
        { title: "School Support", desc: "Help with school curriculum, homework and exams.", icon: "School", bgColor: "bg-[#F5F3FF]", borderColor: "border-[#DDD6FE]", iconColor: "text-[#7C3AED]" },
        { title: "Clear Parent Feedback", desc: "Know your child's strengths and areas of improvement.", icon: "Target", bgColor: "bg-[#FFF0F0]", borderColor: "border-[#FECACA]", iconColor: "text-[#EF4444]" }
      ]
    },

    // Onboarding Section
    onboardingSubheader: { type: String, default: "How It Works" },
    onboardingHeading: { type: String, default: "Getting Started Is Easy" },
    onboardingSteps: {
      type: [
        {
          num: String,
          title: String,
          desc: String,
          numBg: String
        }
      ],
      default: [
        { num: "1", title: "Tell Us About Your Child", desc: "Fill in the short trial request form.", numBg: "bg-[#0B46AD]" },
        { num: "2", title: "We Arrange the Trial", desc: "We find a suitable teacher and convenient time.", numBg: "bg-[#FB6238]" },
        { num: "3", title: "Your Child Attends the Trial", desc: "Join the online Arabic class and enjoy learning.", numBg: "bg-[#FFA800]" },
        { num: "4", title: "Receive Feedback", desc: "We discuss your child's level and learning plan.", numBg: "bg-[#9333EA]" }
      ]
    },

    // Suitability Section
    suitabilitySubheader: { type: String, default: "Who Is The Trial For?" },
    suitabilityTitle: { type: String, default: "Is This Right for Your Child?" },
    suitabilityDescription: { type: String, default: "Our trial class is ideal for UAE school students who:" },
    suitabilityBullets: {
      type: [String],
      default: [
        "Need help with Arabic at school",
        "Find Arabic reading or writing difficult",
        "Need help with grammar and vocabulary",
        "Want to improve speaking skills",
        "Need extra support before exams",
        "Are starting Arabic for the first time",
        "Want personalised one-to-one tuition"
      ]
    },
    suitabilityImageUrl: { type: String, default: "/arabic-studies.png" },
    suitabilityImagePublicId: { type: String, default: "" },

    // FAQ Section
    faqSubheader: { type: String, default: "Frequently Asked Questions" },
    faqTitle: { type: String, default: "Frequently Asked Questions" },
    faqItems: {
      type: [
        {
          question: String,
          answer: String
        }
      ],
      default: [
        { question: "Is the trial class free?", answer: "Yes, the trial class is 100% free with no commitment required." },
        { question: "How long is the trial class?", answer: "The trial class is typically 30 to 45 minutes long, allowing the teacher to evaluate your child and conduct a mini-lesson." },
        { question: "Who can attend the trial?", answer: "The trial is for school-aged children (KG to Grade 6) who want to improve their school Arabic performance or start learning Arabic." },
        { question: "Is the trial one-to-one?", answer: "Yes, all our trial classes and regular classes are strictly 1-on-1 to ensure personalized attention." },
        { question: "Will you assess my child's Arabic level?", answer: "Yes, our teacher will evaluate your child's reading, writing, speaking, and listening skills during the session." },
        { question: "Do you support UAE school curricula?", answer: "Yes, we support all major school boards in the UAE, including UAE MOE, CBSE, British, IB, and American." },
        { question: "Do I have to enroll after the trial?", answer: "No, there is absolutely no obligation to enroll. The trial is for you to experience our classes first." }
      ]
    },

    // CTA Section
    ctaHeading: { type: String, default: "Ready to See Your Child Grow in Arabic?" },
    ctaDescription: { type: String, default: "Give your child the opportunity to experience a personalized Arabic lesson with an experienced teacher." },
    ctaButtonText: { type: String, default: "Book a Free Trial Class Today" },
    ctaSubtext: { type: String, default: "No long-term commitment. Discover the right learning approach for your child." },
    ctaImageUrl: { type: String, default: "/female-teacher.png" },
    ctaImagePublicId: { type: String, default: "" }
  },
  { timestamps: true }
);

const TrialLanding = mongoose.model<TrialLandingDocument>("TrialLanding", trialLandingSchema);
export default TrialLanding;
