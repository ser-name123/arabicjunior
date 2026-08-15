export interface ImageType {
  link: string;
  width: number;
  height: number;
  alt: string;
}
export interface GuardianReviewsCardType {
  id: string;
  image: ImageType;
  authorName: string;
  profession: string;
  rating: number;
  comment: string;
}

// faq
export interface FaqTypes {
  key: string;
  question: string;
  answer: string | JSX.Element;
}

export interface TeacherDetailTypes {
  grade: string;
  experience: string;
  education: string;
  subject: string;
  shortDescription: string;
}
export interface TeachersTypes {
  key: string;
  teacherName: string;
  profession: string;
  image: ImageType;
  detail: TeacherDetailTypes;
}
