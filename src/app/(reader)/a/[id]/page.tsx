import { dummyArticles } from "@/lib/dummy-articles";
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
    <article className="mx-auto max-w-[65ch] py-12 px-6 lg:px-8">
      <header className="mb-12 space-y-4">
        <h1 className="font-serif text-3xl font-bold leading-tight md:text-4xl text-foreground">
          {article.title}
        </h1>
        <div className="font-sans text-sm text-muted-foreground">
          {article.authorName}
          {article.publicationName && ` in ${article.publicationName}`}
          {" · "}
          {article.readingTimeMinutes} min read
        </div>
      </header>

      <div className="font-serif text-[18px] md:text-[20px] leading-[1.6] md:leading-[1.7] text-foreground
                      [&_p]:my-6 
                      [&_h2]:font-sans [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:leading-tight
                      [&_h3]:font-sans [&_h3]:font-bold [&_h3]:text-xl [&_h3]:mt-8 [&_h3]:mb-3 [&_h3]:leading-tight
                      [&_blockquote]:border-l-4 [&_blockquote]:border-muted-foreground/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:my-6
                      [&_ul]:list-disc [&_ul]:pl-6 [&_ul_li]:my-2 [&_ul]:my-6
                      [&_ol]:list-decimal [&_ol]:pl-6 [&_ol_li]:my-2 [&_ol]:my-6
                      [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-muted-foreground
                      [&_code]:font-mono [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:text-[0.875em]
                      [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:my-6
                      [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[0.875em]">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {article.contentMarkdown}
        </ReactMarkdown>
      </div>
    </article>
  );
}
