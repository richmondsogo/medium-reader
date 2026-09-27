import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { dummyArticles } from "@/lib/dummy-articles";
import {
  ArticleTitle,
  ArticleHeading2,
  ArticleHeading3,
  ArticleBody,
  ArticleBlockquote,
} from "@/components/ui/typography";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  const article = dummyArticles.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4">
          <h2 className="font-sans text-xl font-bold">Article not found</h2>
          <p className="text-muted-foreground">The article you are looking for does not exist or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <article className="mx-auto w-full max-w-[720px] py-12 px-6">
      <div className="mb-8 md:hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>
      </div>

      <header className="mb-12 space-y-4">
        <ArticleTitle>{article.title}</ArticleTitle>
        <div className="font-sans text-sm text-muted-foreground">
          {article.authorName}
          {article.publicationName && ` in ${article.publicationName}`}
          {" · "}
          {article.readingTimeMinutes} min read
        </div>
      </header>

      <ArticleBody
        as="div"
        className="text-foreground
                   [&_ul]:list-disc [&_ul]:pl-6 [&_ul_li]:my-2 [&_ul]:my-6
                   [&_ol]:list-decimal [&_ol]:pl-6 [&_ol_li]:my-2 [&_ol]:my-6
                   [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-muted-foreground
                   [&_code]:font-mono [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:text-[0.875em]
                   [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:my-6
                   [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[0.875em]"
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            h2: ({ node, ...props }) => <ArticleHeading2 {...props} />,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            h3: ({ node, ...props }) => <ArticleHeading3 {...props} />,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            blockquote: ({ node, ...props }) => <ArticleBlockquote {...props} />,
          }}
        >
          {article.contentMarkdown}
        </ReactMarkdown>
      </ArticleBody>
    </article>
  );
}
