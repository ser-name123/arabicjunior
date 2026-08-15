/**
 * Moves the pricing tables that were hard-coded in the pricing page into the
 * database, so switching that page over to the API does not empty it.
 *
 * Run once:   pnpm seed-pricing
 *
 * Safe to re-run: it matches on key / (groupKey + title) and skips anything
 * already there.
 *
 * `accentColor` is now stored per plan. It used to be derived by matching the
 * plan title against a hard-coded list of names, so renaming a plan silently
 * reverted its card to the default yellow.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { PricingGroup, PricingPlan, AccentColor } from "../api/models/pricing";

const GROUPS = [
  {
    key: "individual",
    label: "Individual",
    order: 1,
    notes: [
      "According to your plan, you must inform the teacher and admin team at least 4 hours in advance to cancel a class.",
      "All cancelled or rescheduled classes must be completed within the same month as the invoice date and cannot be carried over to the next month.",
      "We offer discounts for families enrolling two or more siblings on the same plan. This does not apply to group lessons.",
      "Once you join, an invoice will be generated automatically every 4 weeks.",
      "Enjoy focused group learning with just 3 to 5 students per session!",
    ],
  },
  {
    key: "group-class",
    label: "Group Class",
    order: 2,
    notes: [
      "According to your plan, all the group’s students must inform the teacher and admin team at least 4 hours in advance to cancel a class.",
      "If any student in the group misses a class, it will still be marked as completed for him or her.",
      "All cancelled or rescheduled group classes must be completed within the same month as the invoice date and cannot be carried over to the next month.",
      "We do not offer any discount in group classes.",
      "Once you join, an invoice will be generated automatically every 4 weeks.",
      "Enjoy focused group learning with just 3 to 5 students per session!",
    ],
  },
];

const feature = (title: string, included: boolean) => ({ title, included });

const INDIVIDUAL_CLASS = "1-1 Live Class";
const GROUP_CLASS = "Group Classes";

const makePlan = (
  groupKey: string,
  title: string,
  price: number,
  accentColor: AccentColor,
  order: number,
  classLine: string,
  weekly: string,
  hours: string,
  eSyllabus: boolean,
  weeklyTest: boolean,
  reschedule: string | false,
  cancellation: string | false,
  discount: string | false
) => ({
  groupKey,
  title,
  price,
  currency: "AED",
  accentColor,
  order,
  status: "published" as const,
  actionLabel: "Lets start",
  actionUrl: "/register",
  features: [
    feature(weekly, true),
    feature(hours, true),
    feature(classLine, true),
    feature("Exam Preparation", true),
    feature("Multilingual Teacher", true),
    feature("E-Syllabus access", eSyllabus),
    feature("Weekly Test", weeklyTest),
    feature(reschedule || "Reschedule Class", Boolean(reschedule)),
    feature(cancellation || "Lesson Cancellation", Boolean(cancellation)),
    feature(discount || "Family Discount", Boolean(discount)),
  ],
});

const PLANS = [
  // Individual
  makePlan("individual", "Starter", 200, "yellow", 1, INDIVIDUAL_CLASS,
    "1 Weekly Class", "4 Hours per Month", false, false, false, false, false),
  makePlan("individual", "Essential", 300, "pink", 2, "1-1 Live class",
    "2 Weekly Classes", "8 Hours per Month", true, true, "Reschedule 2 Classes", false, false),
  makePlan("individual", "Premium", 400, "green", 3, "1-1 Live class",
    "3 Weekly Classes", "12 Hours per Month", true, true, "Reschedule 4 Classes", "1 Lesson Cancellation", "Family 5% Discount"),
  makePlan("individual", "Elite", 500, "orange", 4, "1-1 Live class",
    "4 Weekly Classes", "16 Hours per Month", true, true, "Reschedule 6 Classes", "3 Lesson Cancellations", "Family 10% Discount"),

  // Group Class
  makePlan("group-class", "Starter", 150, "yellow", 1, GROUP_CLASS,
    "1 Weekly Class", "4 Hours per Month", false, false, false, false, false),
  makePlan("group-class", "Essential", 250, "pink", 2, GROUP_CLASS,
    "2 Weekly Classes", "8 Hours per Month", true, true, "Reschedule 2 Classes", false, false),
  makePlan("group-class", "Premium", 350, "green", 3, GROUP_CLASS,
    "3 Weekly Classes", "12 Hours per Month", true, true, "Reschedule 4 Classes", "1 Lesson Cancellation", "Family 5% Discount"),
  makePlan("group-class", "Elite", 450, "orange", 4, GROUP_CLASS,
    "4 Weekly Classes", "16 Hours per Month", true, true, "Reschedule 6 Classes", "3 Lesson Cancellations", "Family 10% Discount"),
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

  console.log("\nTabs:");
  for (const group of GROUPS) {
    if (await PricingGroup.findOne({ key: group.key })) {
      console.log(`  skip    ${group.label} — already present`);
      skipped++;
      continue;
    }
    await PricingGroup.create({ ...group, status: "published" });
    console.log(`  created ${group.label} (${group.notes.length} notes)`);
    created++;
  }

  console.log("\nPlans:");
  for (const plan of PLANS) {
    if (await PricingPlan.findOne({ groupKey: plan.groupKey, title: plan.title })) {
      console.log(`  skip    ${plan.groupKey}/${plan.title} — already present`);
      skipped++;
      continue;
    }
    await PricingPlan.create(plan);
    console.log(`  created ${plan.groupKey}/${plan.title.padEnd(10)} ${plan.currency} ${plan.price}  [${plan.accentColor}]`);
    created++;
  }

  const groupCount = await PricingGroup.countDocuments();
  const planCount = await PricingPlan.countDocuments();
  console.log(`\n${created} created, ${skipped} skipped.`);
  console.log(`Now holding ${groupCount} pricing tabs and ${planCount} plans.`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
