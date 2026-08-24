/**
 * Renders every email to a file so the templates can be looked at without
 * sending anything.
 *
 *   pnpm email:preview        -> writes email-preview/*.html
 *
 * Open index.html in a browser for the set. A browser is not a mail client, so
 * it proves layout and content, not Outlook rendering — but it catches the
 * things that actually go wrong day to day: a field that came out blank, a
 * date in the wrong zone, a stray `undefined` in a heading.
 *
 * Nothing here touches the database or the network. The senders are stubbed,
 * so this is safe to run with production credentials in the environment.
 */
import fs from "fs";
import path from "path";

// Stub the transports before the service module is loaded, so importing it
// cannot send anything by accident.
const captured: { name: string; subject: string; html: string }[] = [];
let current = "unknown";

stubTransports();

/**
 * TypeScript compiles to CommonJS here, so a call to `sendEmail` becomes a
 * property lookup on the required module at call time. Replacing the property
 * before emailService is loaded is therefore enough — no test framework needed.
 */
function stubTransports() {
  const email = require("../api/utils/email");
  const admin = require("../api/utils/sendEmailToAdmin");

  email.sendEmail = async ({ subject, htmlContent }: any) => {
    captured.push({ name: current, subject, html: htmlContent });
    return {};
  };
  admin.sendEmailToAdmin = async ({ subject, htmlContent }: any) => {
    captured.push({ name: current, subject, html: htmlContent });
    return {};
  };
}

const svc = require("../api/services/emailService");

const OUT = path.join(process.cwd(), "email-preview");

const run = async (name: string, fn: () => Promise<unknown>) => {
  current = name;
  await fn();
};

const main = async () => {
  const classStartDate = new Date("2026-09-01T07:00:00.000Z");

  await run("01-welcome", () => svc.sendWelcomeEmail("Aisha", "parent@example.com"));

  await run("02-trial-confirmation-to-parent", () =>
    svc.sendTrialSessionEmailToUser({
      firstName: "Aisha",
      lastName: "Rahman",
      email: "parent@example.com",
      phoneNumber: "+971501234567",
      grade: 4,
      howManyJoin: "1",
      preferredTeacher: "female",
      classStartDate,
      classStartTime: "4:00 PM",
      howFindUs: "Google",
      gender: "female",
      city: "Dubai",
    })
  );

  await run("03-trial-request-to-admin", () =>
    svc.sendTrialEmailToAdmin({
      firstName: "Aisha",
      lastName: "Rahman",
      email: "parent@example.com",
      phoneNumber: "+971501234567",
      grade: 4,
      howManyJoin: "2",
      preferredTeacher: "female",
      classStartDate,
      classStartTime: "4:00 PM",
      howFindUs: "Instagram",
      gender: "female",
      city: "Sharjah",
    })
  );

  await run("04-enrolment-to-student", () =>
    svc.sendStudentRegConfirmationEmail({
      email: "parent@example.com",
      firstName: "Yusuf",
      lastName: "Khan",
      selectedPackage: "8 classes / month",
      preferredDays: ["Monday", "Wednesday"],
      classStartDate,
      classStartTime: "5:30 PM",
      monthlyHours: 8,
      gender: "male",
    })
  );

  await run("05-student-registration-to-admin", () =>
    svc.sendStudentRegNotifToAdmin({
      first_name: "Yusuf",
      last_name: "Khan",
      email: "parent@example.com",
      phone_number: "+971501234567",
      gender: "male",
      city: "Abu Dhabi",
      class_grade: "5",
      school_name: "Al Noor International",
      curriculum: "UAE MOE",
      class_type: "One to one",
      pricing_package: "8 classes / month",
      class_start_date: classStartDate,
      preferred_time: "5:30 PM",
      preferred_days: ["Monday", "Wednesday"],
    })
  );

  const teacher = {
    first_name: "Mariam",
    last_name: "Saleh",
    email: "teacher@example.com",
    whatsapp_number: "+201001234567",
    fb_id: "mariam.saleh",
    birth: "12 March 1992",
    gender: "female",
    address: "14 Nile Street, Giza",
    where_live: "Egypt",
    nationality: "Egyptian",
    mother_lang: "Arabic",
    other_langs: ["English", "French"],
    occupation: "Arabic teacher",
    education: "BA Arabic Literature, Cairo University",
    teaching_experience: "6 years teaching Arabic to non-native children",
    materials_status: "Yes, own materials",
    employment_desire: "Part time",
    expected_salary: "USD 8 / hour",
    preferred_interview_time: "Weekday evenings, after 6 PM GST",
    work_hours: "20 hours per week",
    how_find_us: "Facebook",
    what_make_ideal:
      "I have taught the UAE MOE curriculum for four years and know exactly where children in Grades 3 to 6 tend to lose confidence.\nI plan every lesson around speaking first, then reading.",
    introduce_yourself:
      "I am an Arabic teacher from Giza with six years of online experience.\n\nMy students are mostly children living outside the Arab world, so I am used to building lessons around a school timetable in another time zone.",
    declaration: "Agreed",
  };

  await run("06-application-received-to-teacher", () =>
    svc.sendTeacherRegistrationReplyEmail(teacher)
  );
  await run("07-teacher-application-to-admin", () => svc.sendTeacherRegToAdmin(teacher));

  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) fs.unlinkSync(path.join(OUT, f));

  const links: string[] = [];
  for (const item of captured) {
    const file = `${item.name}.html`;
    fs.writeFileSync(path.join(OUT, file), item.html, "utf8");
    links.push(
      `<li><a href="./${file}">${item.name}</a> <span style="color:#888">&mdash; ${item.subject}</span></li>`
    );
    console.log(`${file.padEnd(38)} ${String(item.html.length).padStart(6)} bytes   ${item.subject}`);
  }

  fs.writeFileSync(
    path.join(OUT, "index.html"),
    `<!doctype html><meta charset="utf-8"><title>Email previews</title>
<body style="font:15px/1.7 system-ui;padding:32px;max-width:760px;margin:auto">
<h1>Arabic Juniors — email previews</h1>
<p style="color:#666">Generated by <code>pnpm email:preview</code>. A browser is not a mail client; use these to check content and layout, not Outlook fidelity.</p>
<ul>${links.join("\n")}</ul>`,
    "utf8"
  );

  console.log(`\n${captured.length} templates written to ${OUT}`);
  console.log(`Open ${path.join(OUT, "index.html")}`);
};

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
