import AboutJuniors from "../models/aboutJuniors";
import AcademyStats from "../models/academyStats";
import Blog from "../models/blog";
import ContactSettings from "../models/contactSettings";
import FaqSection from "../models/faqSection";
import Job from "../models/job";
import { PricingGroup, PricingPlan } from "../models/pricing";
import Teacher from "../models/teacher";
import Testimonial from "../models/testimonial";
import { ChatbotKnowledgeSources } from "../models/chatbotSettings";

/**
 * Turns the parts of the database the chatbot is allowed to see into plain text
 * for the model to answer from.
 *
 * ── What this file may and may not read ──────────────────────────────────────
 *
 * Every collection it touches is imported at the top of this file, and every
 * one of them holds website content an anonymous visitor can already read by
 * loading a page. Nothing here reaches personal data.
 *
 * Deliberately absent, and to stay absent: StudentRegistration,
 * TeacherRegistration, User, ContactMessage, Question, Newsletter,
 * ChatbotSession, JobApplication, Admin, ClientInfo. Those hold children's
 * names, parents' phone numbers, applicants' documents and admin credentials. A
 * chatbot that can be asked "who signed up yesterday?" and answer is a data
 * breach with a friendly face.
 *
 * The safety of that claim rests on the import list above, so adding to it is
 * the thing to look twice at in review.
 *
 * `Teacher` is the published tutor profiles from the public /our-teachers page,
 * not the people who applied for a teaching job — those live in
 * TeacherRegistration and are not imported here.
 *
 * Drafts are filtered out throughout: an unpublished blog post or an unlisted
 * plan is not public yet, and the bot must not be the thing that announces it.
 */

/** One titled block of facts handed to the model. */
export interface KnowledgeSection {
  key: keyof ChatbotKnowledgeSources;
  title: string;
  body: string;
}

/**
 * Rebuilding this on every message would mean a dozen queries per keystroke, so
 * the result is held briefly. Ten minutes matches the site's own page cache: an
 * edit in the admin panel shows up in the chat about as fast as it shows up on
 * the website.
 */
const CACHE_TTL_MS = 10 * 60 * 1000;

let cache: { at: number; key: string; sections: KnowledgeSection[] } | null = null;

/** Strips the HTML that FAQ answers and job descriptions are stored as. */
const toPlainText = (html: string): string =>
  (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (text: string, max: number): string =>
  text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;

const buildPricing = async (): Promise<string> => {
  const [groups, plans] = await Promise.all([
    PricingGroup.find({ status: "published" }).sort({ order: 1 }).lean(),
    PricingPlan.find({ status: "published" }).sort({ order: 1 }).lean(),
  ]);

  if (!plans.length) return "";

  const lines: string[] = [];
  for (const group of groups) {
    const groupPlans = plans.filter((plan) => plan.groupKey === group.key);
    if (!groupPlans.length) continue;

    lines.push(`${group.label}:`);
    for (const plan of groupPlans) {
      const included = (plan.features || [])
        .filter((feature: any) => feature.included)
        .map((feature: any) => feature.title);
      lines.push(
        `- ${plan.title}: ${plan.currency || "AED"} ${plan.price}` +
          (included.length ? ` — includes ${included.join(", ")}` : "")
      );
    }
    if (group.notes?.length) lines.push(`  Notes: ${group.notes.join(" ")}`);
  }

  // A plan whose group was never published would otherwise vanish silently.
  const orphans = plans.filter((plan) => !groups.some((group) => group.key === plan.groupKey));
  for (const plan of orphans) {
    lines.push(`- ${plan.title}: ${plan.currency || "AED"} ${plan.price}`);
  }

  return lines.join("\n");
};

const buildTeachers = async (): Promise<string> => {
  const teachers = await Teacher.find({ status: "published" })
    .sort({ order: 1 })
    .limit(40)
    .lean();

  return teachers
    .map((teacher) => {
      const details = [
        teacher.profession,
        teacher.subject && `teaches ${teacher.subject}`,
        teacher.grade && `grades ${teacher.grade}`,
        teacher.experience,
        teacher.education,
      ]
        .filter(Boolean)
        .join(", ");
      return `- ${teacher.name}: ${details}`;
    })
    .join("\n");
};

const buildFaqs = async (): Promise<string> => {
  const faq = await FaqSection.findOne().lean();
  if (!faq?.items?.length) return "";

  return faq.items
    .slice()
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0))
    .map((item: any) => `Q: ${item.question}\nA: ${truncate(toPlainText(item.answer), 400)}`)
    .join("\n\n");
};

const buildBlogs = async (): Promise<string> => {
  const blogs = await Blog.find({ status: "published" })
    .sort({ datePublished: -1 })
    .limit(25)
    .select("title slug shortDescription")
    .lean();

  return blogs
    .map(
      (blog) =>
        `- "${blog.title}" (/blogs/${blog.slug}): ${truncate(blog.shortDescription || "", 160)}`
    )
    .join("\n");
};

const buildJobs = async (): Promise<string> => {
  const jobs = await Job.find({ status: "published" }).sort({ order: 1 }).limit(20).lean();

  return jobs
    .map(
      (job) =>
        `- ${job.title} (${job.department}, ${job.jobLocation}, ${job.employmentType}): ` +
        `${truncate(toPlainText(job.description || ""), 200)} ` +
        `Apply at ${job.applyUrl || "/careers"}.`
    )
    .join("\n");
};

const buildContact = async (): Promise<string> => {
  const contact: any = await ContactSettings.findOne().lean();
  if (!contact) return "";

  return [
    contact.contactPhone && `Phone: ${contact.contactPhone}`,
    contact.headerPhone && `Alternate phone: ${contact.headerPhone}`,
    contact.contactWhatsApp && `WhatsApp: ${contact.contactWhatsApp}`,
    contact.contactEmail && `Email: ${contact.contactEmail}`,
    contact.contactLocation && `Location: ${contact.contactLocation}`,
  ]
    .filter(Boolean)
    .join("\n");
};

const buildAbout = async (): Promise<string> => {
  const [about, stats] = await Promise.all([
    AboutJuniors.findOne().lean(),
    AcademyStats.findOne().lean(),
  ]);

  const lines: string[] = [];

  if (about) {
    const content: any = about;
    lines.push(
      `${content.heading} ${content.headingHighlight} ${content.headingSuffix}`.trim()
    );
    for (const card of [...(content.featureCards || []), ...(content.bottomCards || [])]) {
      lines.push(`- ${card.title}: ${card.desc}`);
    }
  }

  if (stats) {
    const content: any = stats;
    if (content.description) lines.push(content.description);
    for (const stat of content.stats || []) {
      lines.push(`- ${stat.value} ${stat.label}: ${stat.desc}`);
    }
  }

  return lines.join("\n");
};

const buildTestimonials = async (): Promise<string> => {
  const items = await Testimonial.find({ status: "published", type: "text" })
    .sort({ order: 1 })
    .limit(15)
    .lean();

  return items
    .filter((item) => item.comment)
    .map(
      (item) =>
        `- ${item.authorName} (${item.profession}): "${truncate(item.comment || "", 220)}"`
    )
    .join("\n");
};

/** Source key -> how to fetch it, and what to call it in the prompt. */
const BUILDERS: Record<
  keyof ChatbotKnowledgeSources,
  { title: string; build: () => Promise<string> }
> = {
  pricing: { title: "Pricing plans", build: buildPricing },
  teachers: { title: "Our teachers", build: buildTeachers },
  faqs: { title: "Frequently asked questions", build: buildFaqs },
  blogs: { title: "Blog articles", build: buildBlogs },
  jobs: { title: "Open job positions", build: buildJobs },
  contact: { title: "Contact details", build: buildContact },
  about: { title: "About Arabic Juniors", build: buildAbout },
  testimonials: { title: "What parents say", build: buildTestimonials },
};

/**
 * Every source the admin has switched on, as text. A source that is switched
 * off is never queried at all — not fetched and then filtered, but never read.
 */
export const buildKnowledge = async (
  sources: ChatbotKnowledgeSources
): Promise<KnowledgeSection[]> => {
  const enabled = (Object.keys(BUILDERS) as (keyof ChatbotKnowledgeSources)[]).filter(
    (key) => sources?.[key]
  );

  // The cache has to be keyed on the switches, or turning a source off would
  // keep answering from it for another ten minutes.
  const cacheKey = enabled.join(",");
  if (cache && cache.key === cacheKey && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.sections;
  }

  const built = await Promise.all(
    enabled.map(async (key) => {
      try {
        return { key, title: BUILDERS[key].title, body: await BUILDERS[key].build() };
      } catch (error) {
        // One unreadable collection must not take the whole chatbot down.
        console.error(`[chatbot] could not read "${key}":`, error);
        return { key, title: BUILDERS[key].title, body: "" };
      }
    })
  );

  const sections = built.filter((section) => section.body.trim());
  cache = { at: Date.now(), key: cacheKey, sections };
  return sections;
};

/** Drops the cache so an admin edit shows up in the chat straight away. */
export const clearKnowledgeCache = (): void => {
  cache = null;
};

export const knowledgeToText = (sections: KnowledgeSection[]): string =>
  sections.map((section) => `## ${section.title}\n${section.body}`).join("\n\n");
