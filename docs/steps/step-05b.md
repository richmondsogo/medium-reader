# Step 5b: Reader Layout Fixes

Fixed three layout and typography issues in the reader UI:

1. **Sidebar Scroll**: Wrapped the `ScrollArea` in the sidebar in a `<div className="flex-1 min-h-0">` container and added `h-full` to the `ScrollArea` itself. This forces the scroll area to respect the bounds of the flex column parent, allowing the article list to scroll independently.
2. **Typography**: Updated `src/app/layout.tsx` to import and apply `Inter` and `Source Serif 4` via `next/font/google`, mapping them to `--font-sans` and `--font-serif`. Added `--font-serif` to the `@theme inline` block in `globals.css`. This fixes the issue where `font-sans` and `font-serif` Tailwind utilities were falling back to system default fonts like Times New Roman in the reader components.
3. **Theme Provider**: Populated the empty `src/components/theme-provider.tsx` with a `next-themes` provider setup, and wrapped the application in `src/app/layout.tsx` with `<ThemeProvider attribute="class" defaultTheme="system" enableSystem>`. This ensures the application respects the OS dark/light mode preference by default.
