/** One question/answer pair as stored in the database. */
export interface FaqSectionItem {
  question: string;
  /** HTML, so answers can carry links. Sanitised before it is rendered. */
  answer: string;
  order: number;
}

/** The editable FAQ block on the homepage, managed from Admin → FAQ Section. */
export interface FaqSectionContent {
  heading: string;
  headingHighlight: string;
  introLines: string[];
  imageUrl: string;
  personName: string;
  personLabel: string;
  items: FaqSectionItem[];
}
