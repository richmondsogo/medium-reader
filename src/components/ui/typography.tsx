import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export const typographyVariants = cva(
  "",
  {
    variants: {
      variant: {
        "article-title": "font-serif text-3xl md:text-4xl font-bold leading-tight",
        "article-heading-2": "font-serif text-2xl font-bold leading-tight",
        "article-heading-3": "font-serif text-xl font-bold leading-snug",
        "article-body": "font-serif text-lg leading-[1.7]",
        "list-item-title": "font-sans text-[16px] leading-[24px] font-medium",
        "list-item-title-selected": "font-sans text-[16px] leading-[24px] font-semibold",
        "meta": "font-sans text-[14px] leading-[20px] font-normal text-muted-foreground",
        "section-label": "font-sans text-[15px] font-medium",
        "ui-label": "font-sans text-sm",
      }
    }
  }
)

export function ArticleTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h1 className={cn(typographyVariants({ variant: "article-title" }), className)} {...props} />
}

export function ArticleHeading2({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn(typographyVariants({ variant: "article-heading-2" }), className)} {...props} />
}

export function ArticleHeading3({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn(typographyVariants({ variant: "article-heading-3" }), className)} {...props} />
}

export function ArticleBody({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(typographyVariants({ variant: "article-body" }), className)} {...props} />
}

export function ListItemTitle({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn(typographyVariants({ variant: "list-item-title" }), className)} {...props} />
}

export function ListItemTitleSelected({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn(typographyVariants({ variant: "list-item-title-selected" }), className)} {...props} />
}

export function Meta({ className, as: Component = "span", ...props }: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType }) {
  return <Component className={cn(typographyVariants({ variant: "meta" }), className)} {...props} />
}

export function SectionLabel({ className, as: Component = "span", ...props }: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType }) {
  return <Component className={cn(typographyVariants({ variant: "section-label" }), className)} {...props} />
}

export function UiLabel({ className, as: Component = "span", ...props }: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType }) {
  return <Component className={cn(typographyVariants({ variant: "ui-label" }), className)} {...props} />
}
