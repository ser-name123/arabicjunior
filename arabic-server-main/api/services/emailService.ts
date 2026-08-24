import { format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { sendEmail } from "../utils/email";
import { sendEmailToAdmin } from "../utils/sendEmailToAdmin";
import {
  emailLayout,
  detailTable,
  callout,
  button,
  paragraph,
  heading,
  spacer,
  mailLink,
  telLink,
  nl2br,
  type DetailRow,
} from "../utils/emailTemplate";
import {
  StudentRegistrationFormTypes,
  TeacherRegistrationTypes,
  TrialRegFormTypes,
} from "../types";

/**
 * Every message goes through the shared layout in utils/emailTemplate, so the
 * customer confirmations and the internal notifications finally look like they
 * come from the same company. The admin notifications in particular used to be
 * a bare <h2> and a bullet list.
 */

const TIME_ZONE = "Asia/Dubai"; // the audience and the office are both GMT+4

/**
 * Dates are formatted in UAE time everywhere.
 *
 * This was not consistent before: the customer's confirmation ran `format()`
 * on the raw value, which uses the server's own zone — UTC on Render — while
 * the admin's copy of the same booking ran it through `toZonedTime`. A class
 * booked late in the evening therefore showed one date to the parent and the
 * next day's date to the office.
 */
const uaeDate = (value: Date | string | null | undefined): string => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return format(toZonedTime(d, TIME_ZONE), "dd MMMM yyyy");
};

const uaeNow = (): string =>
  format(toZonedTime(new Date(), TIME_ZONE), "dd MMMM yyyy, hh:mm a");

const fullName = (first?: string, last?: string): string =>
  [first, last].filter(Boolean).join(" ").trim();

const titleCase = (s?: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : "";

/** Common tail on every internal notification. */
const adminFooterNote = (submittedAt: string) =>
  `Submitted ${submittedAt} (GMT+4) through the Arabic Juniors website. Reply directly to this email to reach the applicant.`;

// ---------------------------------------------------------------------------
// Customer-facing
// ---------------------------------------------------------------------------

export const sendWelcomeEmail = async (firstName: string, email: string) => {
  const subject = "Welcome to Arabic Juniors";

  const html = emailLayout({
    preheader: "Your Arabic Juniors account is ready.",
    eyebrow: "Welcome",
    title: `Hi ${firstName}, welcome aboard`,
    accent: "orange",
    content: `
      ${paragraph("Thank you for registering with Arabic Juniors. We're glad to have you with us.")}
      ${paragraph("You can browse our teachers, pricing and free trial class from your account at any time.")}
      ${spacer(6)}
      ${button({ label: "Visit Arabic Juniors", url: "https://arabicjuniors.com" })}
      ${spacer(10)}
    `,
    footerNote: "If you did not create this account, you can ignore this email.",
  });

  await sendEmail({ toEmail: email, toName: firstName, subject, htmlContent: html });
};

export const sendTrialSessionEmailToUser = async ({
  classStartDate,
  classStartTime,
  email,
  firstName,
}: TrialRegFormTypes) => {
  const subject = "Your free trial class is booked — Arabic Juniors";
  const when = uaeDate(classStartDate);

  const html = emailLayout({
    preheader: `We have your trial request for ${when || "your chosen date"}. Our team will confirm shortly.`,
    eyebrow: "Trial request received",
    title: `Thank you, ${firstName}`,
    accent: "orange",
    content: `
      ${paragraph("We've received your request for a free trial class. Here is what you asked for:")}
      ${callout({
        tone: "blue",
        title: `${when}${classStartTime ? ` at ${classStartTime}` : ""}`,
        body: "Times shown in UAE time (GMT+4).",
      })}
      ${spacer()}
      ${heading("What happens next")}
      ${paragraph(
        "Our team will contact you shortly to confirm the exact time and match your child with a suitable teacher. Please allow up to 12 hours for a reply."
      )}
      ${paragraph(
        `If you'd like to reach us sooner, message us on WhatsApp at <a href="https://wa.me/971509921470" style="color:#0B46AD;font-weight:600;text-decoration:none;">+971 50 992 1470</a>.`
      )}
      ${spacer(6)}
      ${button({ label: "Message us on WhatsApp", url: "https://wa.me/971509921470" })}
      ${spacer(10)}
    `,
    footerNote: "No payment is needed for the trial class.",
  });

  await sendEmail({ toEmail: email, toName: firstName, subject, htmlContent: html });
};

export const sendTeacherRegistrationReplyEmail = async ({
  email,
  first_name,
}: TeacherRegistrationTypes) => {
  const subject = "We've received your application — Arabic Juniors";

  const html = emailLayout({
    preheader: "Your teaching application has reached our recruitment team.",
    eyebrow: "Application received",
    title: `Thank you, ${first_name}`,
    accent: "blue",
    content: `
      ${paragraph(
        "Thank you for applying to teach with Arabic Juniors. Your application has been received and our recruitment team will review it carefully."
      )}
      ${spacer(4)}
      ${heading("What happens next")}
      ${paragraph(
        "We'll assess your qualifications and teaching experience, and get in touch if your profile matches a current opening. Please allow a few days for a response."
      )}
      ${spacer(4)}
      ${callout({
        tone: "green",
        title: "No further action needed right now",
        body: "There is nothing to send us at this stage. We'll reach out directly if we need anything more.",
      })}
      ${spacer(10)}
    `,
    footerNote: "We appreciate your interest in joining our team.",
  });

  await sendEmail({ toEmail: email, toName: first_name, subject, htmlContent: html });
};

interface StudentRegConfEmailParams {
  email: string;
  firstName: string;
  lastName: string;
  selectedPackage: string;
  preferredDays: string[];
  classStartDate: Date;
  classStartTime: string;
  monthlyHours: number;
  gender: "male" | "female";
}

export const sendStudentRegConfirmationEmail = async ({
  email,
  firstName,
  lastName,
  classStartDate,
  classStartTime,
  preferredDays,
  selectedPackage,
  monthlyHours,
}: StudentRegConfEmailParams) => {
  const subject = "You're enrolled — Arabic Juniors";
  const when = uaeDate(classStartDate);

  const rows: DetailRow[] = [
    { label: "Pricing package", value: selectedPackage },
    { label: "Monthly hours", value: monthlyHours },
    { label: "Preferred days", value: preferredDays?.join(", ") },
    { label: "Classes begin", value: [when, classStartTime].filter(Boolean).join(" at ") },
  ];

  const html = emailLayout({
    preheader: `Classes begin ${when || "soon"}. Your teacher will be in touch shortly.`,
    eyebrow: "Enrolment confirmed",
    title: `Welcome, ${fullName(firstName, lastName)}`,
    accent: "green",
    content: `
      ${paragraph("We're delighted to have you starting your Arabic learning journey with us. Here are your enrolment details:")}
      ${detailTable(rows)}
      ${spacer()}
      ${callout({
        tone: "blue",
        title: "Your teacher will contact you shortly",
        body: "They'll confirm the joining link and settle the weekly schedule with you before the first class.",
      })}
      ${spacer(10)}
    `,
    footerNote: "All times are UAE time (GMT+4).",
  });

  return await sendEmail({ toEmail: email, toName: firstName, subject, htmlContent: html });
};

// ---------------------------------------------------------------------------
// Internal notifications
// ---------------------------------------------------------------------------

export const sendStudentRegNotifToAdmin = async ({
  class_grade,
  class_start_date,
  class_type,
  curriculum,
  email,
  first_name,
  last_name,
  phone_number,
  preferred_days,
  preferred_time,
  pricing_package,
  school_name,
  gender,
  city,
}: StudentRegistrationFormTypes) => {
  const name = fullName(first_name, last_name);
  const subject = `Student registration: ${name}`;
  const submittedAt = uaeNow();

  const rows: DetailRow[] = [
    { label: "Student", value: name },
    { label: "Email", value: mailLink(email) },
    { label: "Phone", value: telLink(phone_number) },
    { label: "Gender", value: titleCase(gender) },
    { label: "City", value: city },
    { label: "Grade", value: class_grade },
    { label: "School", value: school_name },
    { label: "Curriculum", value: curriculum },
    { label: "Class type", value: class_type },
    { label: "Package", value: pricing_package },
    { label: "Start date", value: uaeDate(class_start_date) },
    { label: "Preferred time", value: preferred_time },
    { label: "Preferred days", value: preferred_days?.join(", ") },
  ];

  const html = emailLayout({
    preheader: `${name} · Grade ${class_grade} · ${pricing_package || "no package"}`,
    eyebrow: "New student registration",
    title: name,
    accent: "green",
    content: `
      ${callout({
        tone: "green",
        title: `${pricing_package || "Package not specified"}`,
        body: `Starting ${uaeDate(class_start_date) || "date not given"}${preferred_time ? `, ${preferred_time}` : ""}.`,
      })}
      ${spacer()}
      ${detailTable(rows)}
      ${spacer(10)}
    `,
    footerNote: adminFooterNote(submittedAt),
  });

  return await sendEmailToAdmin({ subject, htmlContent: html });
};

export const sendTrialEmailToAdmin = async ({
  classStartDate,
  classStartTime,
  email,
  firstName,
  lastName,
  grade,
  howFindUs,
  howManyJoin,
  phoneNumber,
  preferredTeacher,
  gender,
  city,
}: TrialRegFormTypes) => {
  const name = fullName(firstName, lastName);
  const subject = `Trial request: ${name}`;
  const submittedAt = uaeNow();
  const when = uaeDate(classStartDate);

  const rows: DetailRow[] = [
    { label: "Name", value: name },
    { label: "Email", value: mailLink(email) },
    { label: "Phone", value: telLink(phoneNumber) },
    { label: "Gender", value: titleCase(gender) },
    { label: "City", value: city },
    { label: "Grade", value: grade },
    { label: "Students joining", value: howManyJoin },
    { label: "Preferred teacher", value: titleCase(preferredTeacher) },
    { label: "Found us via", value: howFindUs },
  ];

  const html = emailLayout({
    preheader: `${name} · Grade ${grade} · ${when || "no date"} ${classStartTime || ""}`.trim(),
    eyebrow: "New trial request",
    title: name,
    accent: "orange",
    content: `
      ${callout({
        tone: "orange",
        title: `${when || "Date not given"}${classStartTime ? ` at ${classStartTime}` : ""}`,
        body: "Requested trial slot, UAE time (GMT+4).",
      })}
      ${spacer()}
      ${detailTable(rows)}
      ${spacer(6)}
      ${button({ label: "Reply to parent", url: `mailto:${email}` })}
      ${spacer(10)}
    `,
    footerNote: adminFooterNote(submittedAt),
  });

  return await sendEmailToAdmin({ subject, htmlContent: html });
};

export const sendTeacherRegToAdmin = async ({
  address,
  birth,
  declaration,
  education,
  email,
  employment_desire,
  expected_salary,
  fb_id,
  first_name,
  gender,
  how_find_us,
  introduce_yourself,
  last_name,
  materials_status,
  mother_lang,
  nationality,
  occupation,
  preferred_interview_time,
  teaching_experience,
  what_make_ideal,
  where_live,
  work_hours,
  other_langs,
  whatsapp_number,
}: TeacherRegistrationTypes) => {
  const name = fullName(first_name, last_name);
  const subject = `Teacher application: ${name}`;
  const submittedAt = uaeNow();

  // Split into two tables so twenty-three fields do not arrive as one slab.
  const contactRows: DetailRow[] = [
    { label: "Applicant", value: name },
    { label: "Email", value: mailLink(email) },
    { label: "WhatsApp", value: telLink(whatsapp_number) },
    { label: "Facebook", value: fb_id },
    { label: "Date of birth", value: birth },
    { label: "Gender", value: titleCase(gender) },
    { label: "Nationality", value: nationality },
    { label: "Lives in", value: where_live },
    { label: "Address", value: address },
  ];

  const professionalRows: DetailRow[] = [
    { label: "Occupation", value: occupation },
    { label: "Education", value: education },
    { label: "Teaching experience", value: teaching_experience },
    { label: "Mother language", value: mother_lang },
    { label: "Other languages", value: other_langs?.join(", ") },
    { label: "Has materials", value: materials_status },
    { label: "Employment desired", value: employment_desire },
    { label: "Expected salary", value: expected_salary },
    { label: "Available hours", value: work_hours },
    { label: "Interview time", value: preferred_interview_time },
    { label: "Found us via", value: how_find_us },
    { label: "Declaration", value: declaration },
  ];

  // nl2br, because these are the two free-text boxes on the form. Without it a
  // paragraphed answer arrives as one unbroken block.
  const freeTextRows: DetailRow[] = [
    { label: "Why they are an ideal candidate", value: nl2br(what_make_ideal), wide: true },
    { label: "Introduction", value: nl2br(introduce_yourself), wide: true },
  ];

  const html = emailLayout({
    preheader: `${name} · ${nationality || "nationality not given"} · ${teaching_experience || "experience not given"}`,
    eyebrow: "New teacher application",
    title: name,
    accent: "blue",
    content: `
      ${heading("Contact & personal")}
      ${detailTable(contactRows)}
      ${spacer()}
      ${heading("Professional")}
      ${detailTable(professionalRows)}
      ${spacer()}
      ${heading("In their own words")}
      ${detailTable(freeTextRows)}
      ${spacer(6)}
      ${button({ label: "Reply to applicant", url: `mailto:${email}` })}
      ${spacer(10)}
    `,
    footerNote: adminFooterNote(submittedAt),
  });

  return await sendEmailToAdmin({ subject, htmlContent: html });
};
