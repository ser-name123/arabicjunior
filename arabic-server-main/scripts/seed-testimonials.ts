/**
 * Moves the three testimonials that were hard-coded in the homepage component
 * into the database, so switching the section over to the API does not blank
 * it out.
 *
 * Run once:   pnpm seed-testimonials
 *
 * Safe to re-run: it matches on author name and skips anyone already there.
 * The image paths stay relative — those files live in the frontend's public/
 * folder and are served by Next.js. Anything added through the admin screen
 * from now on gets a full Cloudinary URL instead, and the frontend handles
 * both.
 */
import "dotenv/config";
import mongoose from "mongoose";
import Testimonial from "../api/models/testimonial";

const SEED = [
  {
    type: "text" as const,
    authorName: "Danial Jack",
    profession: "Father",
    comment:
      "I wanted structured Arabic lessons for my daughter. These classes are now our go-to, and I recommend them to every parent.",
    image: "/review-author.png",
    rating: 5,
    status: "published" as const,
    order: 1,
  },
  {
    type: "text" as const,
    authorName: "SobiyaNaaz Momin",
    profession: "Mother",
    comment:
      "Rafat is a wonderful teacher and she teaches with a lot of care and patience . My 10 year old son had good support under her classes.",
    image: "/Sobiya.png",
    rating: 5,
    status: "published" as const,
    order: 2,
  },
  {
    type: "text" as const,
    authorName: "Aarav Mehta",
    profession: "Father",
    comment:
      "Finding trusted Arabic tuition was tough. This program fits the UAE school curriculum perfectly. It’s now our go-to and I recommend it to every parent I know",
    image: "/aarav-mehta.png",
    rating: 5,
    status: "published" as const,
    order: 3,
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
    const exists = await Testimonial.findOne({ authorName: entry.authorName });
    if (exists) {
      console.log(`  skip    ${entry.authorName} — already present`);
      skipped++;
      continue;
    }
    await Testimonial.create(entry);
    console.log(`  created ${entry.authorName}`);
    created++;
  }

  const total = await Testimonial.countDocuments();
  const published = await Testimonial.countDocuments({ status: "published" });
  console.log(`\n${created} created, ${skipped} skipped.`);
  console.log(`Collection now holds ${total} testimonials (${published} published).`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
