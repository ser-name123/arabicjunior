import { ChatbotQaDocument } from "../models/chatbotQa";
import { ChatbotSettingsDocument } from "../models/chatbotSettings";
import { KnowledgeSection } from "./chatbotKnowledge";
import { ChatbotReplySource } from "../models/chatbotSession";

/**
 * The answer the chatbot gives when the AI cannot.
 *
 * This runs when there is no API key, when the provider is down, when the bill
 * has not been paid, or when the admin has switched the AI off. It is plain
 * keyword matching — no cleverness, no cost, no network call — and it is what
 * makes the widget safe to leave switched on regardless of what is happening
 * with the AI account.
 *
 * The admin's own questions and answers are searched first, because those are
 * the replies the academy has actually approved.
 */

export interface FallbackReply {
  text: string;
  source: ChatbotReplySource;
  /** Set when an admin-written entry answered, so its usage count can go up. */
  qaId?: string;
}

/** Words too common to tell two questions apart. */
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "but", "by", "can", "could", "did",
  "do", "does", "for", "from", "get", "give", "had", "has", "have", "how", "i",
  "if", "in", "is", "it", "its", "just", "me", "my", "of", "on", "or", "our",
  "please", "so", "tell", "that", "the", "their", "them", "there", "these",
  "they", "this", "to", "us", "want", "was", "we", "were", "what", "when",
  "where", "which", "who", "why", "will", "with", "would", "you", "your",
]);

const tokenize = (text: string): string[] =>
  (text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));

/**
 * Words that point at a section of the website. Deliberately generous and
 * multilingual-ish, because parents in the UAE type "fees", "fee", "kitna" and
 * "charges" for the same question.
 */
const SECTION_HINTS: Record<string, string[]> = {
  pricing: [
    "price", "prices", "pricing", "fee", "fees", "cost", "costs", "charge",
    "charges", "package", "packages", "plan", "plans", "monthly", "rate",
    "rates", "afford", "expensive", "cheap", "discount", "aed", "dirham",
    "payment", "subscription", "kitna", "kitne",
  ],
  teachers: [
    "teacher", "teachers", "tutor", "tutors", "ustad", "ustadh", "staff",
    "faculty", "instructor", "instructors", "qualified", "native", "teaches",
    "teaching", "experience",
  ],
  contact: [
    "contact", "phone", "number", "call", "email", "mail", "whatsapp",
    "address", "location", "reach", "office", "support",
  ],
  jobs: [
    "job", "jobs", "career", "careers", "vacancy", "vacancies", "hiring",
    "hire", "recruit", "apply", "application", "position", "positions",
    "employment", "work",
  ],
  blogs: ["blog", "blogs", "article", "articles", "post", "posts", "read", "guide"],
  about: [
    "about", "academy", "school", "company", "students", "why", "trust",
    "quality", "method", "curriculum", "syllabus", "cbse", "igcse",
  ],
  testimonials: [
    "review", "reviews", "testimonial", "testimonials", "feedback", "rating",
    "ratings", "parents", "happy", "satisfied",
  ],
  faqs: ["faq", "faqs", "question", "questions", "doubt", "doubts"],
};

/** How many words of a question have to land before a match is believable. */
const MIN_QA_SCORE = 2;
const MIN_SECTION_HITS = 1;

const scoreQaEntry = (entry: ChatbotQaDocument, asked: string[]): number => {
  const haystack = new Set([...tokenize(entry.question), ...entry.keywords.flatMap(tokenize)]);

  let score = 0;
  for (const word of asked) {
    if (haystack.has(word)) score += 1;
  }

  // A keyword the admin typed on purpose is a stronger signal than a word that
  // happens to appear in the question text.
  const explicit = new Set(entry.keywords.flatMap(tokenize));
  for (const word of asked) {
    if (explicit.has(word)) score += 1;
  }

  return score;
};

/**
 * Trims a knowledge block down to something that reads as a chat reply rather
 * than a data dump. The full list still beats "I don't know" for a parent
 * asking what the plans cost.
 */
const asChatReply = (section: KnowledgeSection): string => {
  const MAX_LINES = 8;
  const MAX_CHARS = 600;

  const lines = section.body.split("\n").filter(Boolean);
  const shown = lines.slice(0, MAX_LINES).join("\n");
  const body = shown.length > MAX_CHARS ? `${shown.slice(0, MAX_CHARS).trimEnd()}…` : shown;
  const trimmed = lines.length > MAX_LINES;

  return `${section.title}:\n${body}${trimmed ? "\n…and more." : ""}`;
};

/**
 * Best effort at answering without the AI.
 *
 * Order matters: an approved answer, then the website's own content, then an
 * honest "ask a human". Never a guess.
 */
export const buildFallbackReply = (options: {
  settings: ChatbotSettingsDocument;
  knowledge: KnowledgeSection[];
  qaEntries: ChatbotQaDocument[];
  message: string;
}): FallbackReply => {
  const asked = tokenize(options.message);

  if (asked.length) {
    let best: { entry: ChatbotQaDocument; score: number } | null = null;
    for (const entry of options.qaEntries) {
      const score = scoreQaEntry(entry, asked);
      if (score >= MIN_QA_SCORE && (!best || score > best.score)) {
        best = { entry, score };
      }
    }

    if (best) {
      return {
        text: best.entry.answer,
        source: "qa",
        qaId: String(best.entry._id),
      };
    }

    let bestSection: { section: KnowledgeSection; hits: number } | null = null;
    for (const section of options.knowledge) {
      const hints = SECTION_HINTS[section.key] || [];
      const hits = asked.filter((word) => hints.includes(word)).length;
      if (hits >= MIN_SECTION_HITS && (!bestSection || hits > bestSection.hits)) {
        bestSection = { section, hits };
      }
    }

    if (bestSection) {
      return { text: asChatReply(bestSection.section), source: "knowledge" };
    }
  }

  return { text: options.settings.fallbackMessage, source: "fallback" };
};
