export interface SendEmailParams {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
}

const langValues = [
  "eng",
  "urdu",
  "hindi",
  "malayalam",
  "tamil",
  "philippine",
  "bengali",
  "french",
  "german",
] as const;

export interface TeacherRegistrationTypes {
  first_name: string;
  last_name: string;
  gender: "Male" | "Female" | "Custom";
  email: string;
  country_code?: string;
  whatsapp_number?: string;
  address: string;
  where_live: string;
  birth: string;
  materials_status: "Married" | "Unmarried";
  nationality: string;
  occupation: string;
  introduce_yourself: string;
  fb_id: string;
  // personal_image: File;
  education: string;
  teaching_experience: string;
  mother_lang: (typeof langValues)[number];
  other_langs?: (typeof langValues)[number][];
  // doc_1: FileList;
  // doc_2: FileList;
  // doc_3: FileList;
  // doc_4: FileList;
  preferred_interview_time: "morning" | "afternoon" | "evening";
  expected_salary: string; // transform to number
  work_hours: string; // transform to number 
  employment_desire: "full-time" | "part-time" | "full-part";
  what_make_ideal: string;
  how_find_us:
  | "facebook"
  | "linkedin"
  | "google"
  | "al-furqan"
  | "advertisement"
  | "other";
  declaration: string; // transform to boolean
}


export type StudentRegistrationFormTypes = {
  first_name: string;
  last_name?: string;
  email: string;
  phone_number: string;
  class_grade: number;
  school_name: string;
  curriculum: string;
  class_type: "individual" | "group";
  pricing_package: string;
  class_start_date: Date;
  preferred_time: string;
  preferred_days: string[];
  gender: "male" | "female";
  city?: string; // ✅ added for auto-detected city
  submittedAt?: string; // ✅ optional server-side timestamp
};


export interface TrialRegFormTypes {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  grade: number;
  howManyJoin: string;
  preferredTeacher: string;
  classStartDate: Date;
  classStartTime: string;
  howFindUs: string;
  gender: "male" | "female";
  city?: string;
}