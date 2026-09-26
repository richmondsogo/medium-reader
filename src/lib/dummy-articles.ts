// TEMPORARY: This file provides dummy data for UI development and will be deleted in Step 5C.

export type DummyArticle = {
  id: number;
  url: string;
  title: string;
  authorName: string;
  publicationName: string | null;
  snippet: string;
  contentMarkdown: string;
  wordCount: number;
  readingTimeMinutes: number;
  memberOnly: boolean;
  publishedDate: string;
};

const defaultMarkdown = (topic: string) => `
## The Importance of ${topic}

This is the first paragraph of the article about ${topic.toLowerCase()}. It sets the stage for what we are about to discuss. In this dummy content, we explore the intricate details of a completely fabricated but interesting subject. It is designed to be just long enough to look like a real article when rendered on the page, giving us a good sense of typography and line height.

> "A good blockquote can break up the text and draw the reader's eye to a key point or interesting observation. It adds visual variety to the page." - A Wise Observer

### Deeper Insights

As we delve deeper into ${topic.toLowerCase()}, we encounter several fascinating points that need to be enumerated. Here is a brief list of the most critical aspects:

- **First fundamental aspect:** This is an important detail that shouldn't be missed.
- **Second crucial element:** Another vital piece of information, demonstrating how inline formatting like \`code\` works.
- **Third point:** Concluding our list with a final thought, which might include a link to [somewhere relevant](https://example.com).

Finally, we arrive at the conclusion. The reading experience should feel authentic, allowing us to accurately judge the visual weight of our typographic choices. The combination of serif body text and clear structure helps in maintaining focus throughout the piece. It is imperative that the reader remains engaged from start to finish.
`;

export const dummyArticles: DummyArticle[] = [
  {
    id: 1,
    url: "https://medium.com/p/1",
    title: "Understanding the Nuances of Modern Web Development",
    authorName: "Alice Smith",
    publicationName: "Frontend Weekly",
    snippet: "A deep dive into the latest trends and practices in frontend engineering.",
    contentMarkdown: defaultMarkdown("Modern Web Development"),
    wordCount: 850,
    readingTimeMinutes: 4,
    memberOnly: true,
    publishedDate: "2023-10-25T08:00:00Z",
  },
  {
    id: 2,
    url: "https://medium.com/p/2",
    title: "The Art of Writing Clean and Maintainable Code",
    authorName: "Bob Jones",
    publicationName: null,
    snippet: "Tips and tricks for keeping your codebase healthy over time.",
    contentMarkdown: defaultMarkdown("Clean Code"),
    wordCount: 1200,
    readingTimeMinutes: 6,
    memberOnly: false,
    publishedDate: "2023-10-26T09:30:00Z",
  },
  {
    id: 3,
    url: "https://medium.com/p/3",
    title: "A Comprehensive Guide to TypeScript Generics",
    authorName: "Charlie Brown",
    publicationName: "Type Level",
    snippet: "Mastering one of the most powerful features of TypeScript.",
    contentMarkdown: defaultMarkdown("TypeScript Generics"),
    wordCount: 1500,
    readingTimeMinutes: 8,
    memberOnly: true,
    publishedDate: "2023-10-26T14:15:00Z",
  },
  {
    id: 4,
    url: "https://medium.com/p/4",
    title: "Why Minimalist Design is Here to Stay",
    authorName: "Diana Prince",
    publicationName: "UX Collective",
    snippet: "Exploring the enduring appeal of simplicity in user interfaces.",
    contentMarkdown: defaultMarkdown("Minimalist Design"),
    wordCount: 700,
    readingTimeMinutes: 3,
    memberOnly: false,
    publishedDate: "2023-10-27T10:00:00Z",
  },
  {
    id: 5,
    url: "https://medium.com/p/5",
    title: "Demystifying Server Components in Next.js",
    authorName: "Eve Adams",
    publicationName: "Vercel Insights",
    snippet: "Understanding how Server Components change the React paradigm.",
    contentMarkdown: defaultMarkdown("Server Components"),
    wordCount: 2000,
    readingTimeMinutes: 10,
    memberOnly: true,
    publishedDate: "2023-10-28T11:45:00Z",
  },
  {
    id: 6,
    url: "https://medium.com/p/6",
    title: "Effective Strategies for Remote Team Collaboration",
    authorName: "Frank Wright",
    publicationName: "The Startup",
    snippet: "How to keep your distributed team aligned and productive.",
    contentMarkdown: defaultMarkdown("Remote Collaboration"),
    wordCount: 950,
    readingTimeMinutes: 5,
    memberOnly: false,
    publishedDate: "2023-10-29T16:20:00Z",
  },
  {
    id: 7,
    url: "https://medium.com/p/7",
    title: "An Introduction to SQLite for Web Applications",
    authorName: "Grace Hopper",
    publicationName: "Data Engineering",
    snippet: "Why SQLite might be the perfect database for your next project.",
    contentMarkdown: defaultMarkdown("SQLite"),
    wordCount: 1100,
    readingTimeMinutes: 5,
    memberOnly: true,
    publishedDate: "2023-10-30T13:10:00Z",
  },
  {
    id: 8,
    url: "https://medium.com/p/8",
    title: "Navigating the Complexities of State Management",
    authorName: "Hank Pym",
    publicationName: null,
    snippet: "Comparing different approaches to handling state in React applications.",
    contentMarkdown: defaultMarkdown("State Management"),
    wordCount: 1350,
    readingTimeMinutes: 7,
    memberOnly: true,
    publishedDate: "2023-10-31T09:05:00Z",
  },
  {
    id: 9,
    url: "https://medium.com/p/9",
    title: "The Future of AI in Software Engineering",
    authorName: "Ivy Chen",
    publicationName: "Towards Data Science",
    snippet: "How artificial intelligence is reshaping the way we write code.",
    contentMarkdown: defaultMarkdown("AI in Software Engineering"),
    wordCount: 1600,
    readingTimeMinutes: 8,
    memberOnly: false,
    publishedDate: "2023-11-01T15:30:00Z",
  },
  {
    id: 10,
    url: "https://medium.com/p/10",
    title: "Building Accessible Web Experiences for Everyone",
    authorName: "Jack Black",
    publicationName: "A11y Matters",
    snippet: "A practical guide to making your websites more inclusive.",
    contentMarkdown: defaultMarkdown("Web Accessibility"),
    wordCount: 1050,
    readingTimeMinutes: 5,
    memberOnly: true,
    publishedDate: "2023-11-02T10:50:00Z",
  },
];
