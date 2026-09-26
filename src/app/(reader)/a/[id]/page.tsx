import { dummyArticles } from "@/lib/dummy-articles";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  ArticleTitle,
  ArticleHeading2,
  ArticleHeading3,
  ArticleBody,
  ListItemTitleSelected,
  UiLabel,
  Meta,
} from "@/components/ui/typography";

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = parseInt(resolvedParams.id, 10);
  const article = dummyArticles.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="max-w-md space-y-4">
          <ListItemTitleSelected as="h2">Article not found</ListItemTitleSelected>
          <UiLabel as="p" className="text-muted-foreground">The article you are looking for does not exist or has been removed.</UiLabel>
        </div>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-[65ch] py-12 px-6 lg:px-8">
      <header className="mb-8 space-y-4">
        <ArticleTitle className="text-foreground">
          {article.title}
        </ArticleTitle>
        <Meta as="div">
          {article.authorName}
          {article.publicationName && ` in ${article.publicationName}`}
          {" · "}
          {article.readingTimeMinutes} min read
        </Meta>
      </header>

      <div className="text-foreground
                      [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6
                      [&_ul]:list-disc [&_ul]:pl-6 [&_ul_li]:my-2 [&_ul]:my-6
                      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol_li]:my-2 [&_ol]:my-6
                      [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-muted-foreground
                      [&_code]:font-mono [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:text-[0.875em]
                      [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:my-6
                      [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[0.875em]">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h2: ({ node, ...props }) => <ArticleHeading2 className="mt-10 mb-4" {...props} />,
            h3: ({ node, ...props }) => <ArticleHeading3 className="mt-8 mb-3" {...props} />,
            p: ({ node, ...props }) => <ArticleBody className="my-6" {...props} />,
            li: ({ node, ...props }) => <ArticleBody as="li" className="my-2" {...props} />,
          }}
        >
          {article.contentMarkdown}
        </ReactMarkdown>
      </div>
    </article>
  );
}
