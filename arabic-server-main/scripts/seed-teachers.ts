/**
 * Moves the teachers that were hard-coded across three components into the
 * database, so switching those pages over to the API does not empty them.
 *
 * Run once:   pnpm seed-teachers
 *
 * Safe to re-run: it matches on name and skips anyone already there.
 *
 * The same six people appeared in three different lists with three different
 * sets of facts — the homepage slider carried only a name and a photo, About Us
 * carried a different description and a different photo again, and two of the
 * About Us entries (Abdullah Soliman, Hassan Ibrahim) were not on the teachers
 * page at all. This merges them into one record per person. Where About Us had
 * a full-length photo it becomes `portrait`, which is what that carousel uses.
 *
 * Image paths stay relative where the original was a file in the frontend's
 * public/ folder; anything added through the admin screen gets a Cloudinary URL
 * instead, and the frontend handles both.
 */
import "dotenv/config";
import mongoose from "mongoose";
import Teacher from "../api/models/teacher";

const SEED = [
  {
    name: "Rafat Sayed",
    profession: "Arabic Teacher",
    image: "/first-teacher.png",
    portrait: "/female-teacher.png",
    grade: "1-10",
    experience: "5+ Years exp.",
    education: "B.Ed., Master’s in Arabic study",
    subject: "Arabic",
    shortDescription:
      "Skilled Arabic teacher with over 5 years of experience teaching Grades 1–10 across UAE school curricula. Expert in delivering engaging online lessons in grammar, reading, and writing using interactive tools.",
    showOnHomepage: true,
    order: 1,
  },
  {
    name: "Mohommad Taha",
    profession: "Arabic Teacher",
    image: "/second-teacher.png",
    grade: "1-10",
    experience: "3+ Years exp.",
    education: "Master’s in Arabic study",
    subject: "Arabic",
    shortDescription:
      "Qualified Arabic tutor with deep knowledge of UAE Ministry of Education standards. Successfully teaches students from primary to secondary level through effective and personalized online sessions.",
    showOnHomepage: true,
    order: 2,
  },
  {
    name: "Rawan Hossam",
    profession: "Arabic Teacher",
    image: "/third-teacher.png",
    grade: "1-10",
    experience: "8+ Years exp.",
    education: "Bachelor’s in Arabic study, B.Ed.",
    subject: "Arabic",
    shortDescription:
      "Experienced in teaching Arabic language to Grades 1–10 students, this teacher focuses on building strong language skills aligned with UAE school requirements. Specializes in one-to-one online support.",
    showOnHomepage: true,
    order: 3,
  },
  {
    name: "Samara Youssef",
    profession: "Arabic Teacher",
    image: "/fourth-teacher.png",
    grade: "1-10",
    experience: "2+ Years exp.",
    education: "Diploma in Arabic study",
    subject: "Arabic",
    shortDescription:
      "Certified Arabic educator with a proven record of helping school-aged learners excel in Arabic. Familiar with UAE curriculum structures and skilled in teaching both native and non-native Arabic students online.",
    showOnHomepage: false,
    order: 4,
  },
  {
    name: "Eptehal Elgendy",
    profession: "Arabic Teacher",
    image: "/first-teacher.png",
    portrait:
      "https://res.cloudinary.com/dromjx3rx/image/upload/v1737991303/our-teacher-3_opctfy.png",
    grade: "1-10",
    experience: "6+ Years exp.",
    education: "Master’s in Arabic Study",
    subject: "Arabic",
    shortDescription:
      "Dedicated online Arabic teacher with experience teaching across British and MOE curriculum schools in the UAE. Tailors each session to meet the specific level and pace of each student from Grades 1–10.",
    showOnHomepage: true,
    order: 5,
  },
  {
    name: "Narmeen Saeed",
    profession: "Arabic Teacher",
    image: "/third-teacher.png",
    grade: "1-10",
    experience: "4+ Years exp.",
    education: "Master’s in Arabic Study",
    subject: "Arabic",
    shortDescription:
      "Native Arabic speaker with several years of online tutoring experience for UAE-based students. Focuses on improving academic performance in reading, comprehension, and written expression for all grade levels.",
    showOnHomepage: true,
    order: 6,
  },
  // Present only in the About Us carousel before this migration.
  {
    name: "Abdullah Soliman",
    profession: "Arabic Teacher",
    image: "/noah-pierr.png",
    portrait: "/noah-pierr.png",
    grade: "1-10",
    experience: "",
    education: "",
    subject: "Arabic",
    shortDescription:
      "Experienced Arabic tutor helping students excel in speaking, writing, and reading with personalized lessons.",
    showOnHomepage: false,
    order: 7,
  },
  {
    name: "Hassan Ibrahim",
    profession: "Arabic Teacher",
    image:
      "https://res.cloudinary.com/dromjx3rx/image/upload/v1737991306/our-teacher-1_zp1qar.png",
    portrait:
      "https://res.cloudinary.com/dromjx3rx/image/upload/v1737991306/our-teacher-1_zp1qar.png",
    grade: "1-10",
    experience: "",
    education: "",
    subject: "Arabic",
    shortDescription:
      "Dedicated Arabic teacher supporting students across UAE school curricula with patient, structured online lessons.",
    showOnHomepage: true,
    order: 8,
  },
];

const run = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("FATAL: MONGODB_URI is not set");
    process.exit(1);
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
  console.log(`Connected to MongoDB (database: "${mongoose.connection.name}")`);

  let created = 0;
  let skipped = 0;

  for (const entry of SEED) {
    const exists = await Teacher.findOne({ name: entry.name });
    if (exists) {
      console.log(`  skip    ${entry.name} — already present`);
      skipped++;
      continue;
    }
    await Teacher.create({ ...entry, status: "published", rating: 5 });
    console.log(`  created ${entry.name}${entry.showOnHomepage ? " (homepage)" : ""}`);
    created++;
  }

  const total = await Teacher.countDocuments();
  const published = await Teacher.countDocuments({ status: "published" });
  const homepage = await Teacher.countDocuments({ status: "published", showOnHomepage: true });
  console.log(`\n${created} created, ${skipped} skipped.`);
  console.log(`Collection now holds ${total} teachers (${published} published, ${homepage} on the homepage).`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
