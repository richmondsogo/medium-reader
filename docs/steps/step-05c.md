# Step 05c: Design system enforcement

## Summary
Added centralized typography system to enforce design tokens structurally instead of visually. This is an infrastructure change preventing ad-hoc text styling across the app.

## Changes
- Created src/components/ui/typography.tsx with class-variance-authority.
- Defined a central list of typography variants corresponding to specific app roles (rticle-title, meta, etc.).
- Refactored src/app/style-guide/page.tsx, src/app/(reader)/sidebar.tsx, src/app/(reader)/page.tsx, and src/app/(reader)/a/[id]/page.tsx to use the wrapper components and removed inline sizing classes.
- Configured ESLint (eslint-plugin-tailwindcss and 
o-restricted-syntax) to prevent use of raw 	ext-, ont-, and leading- classes outside of the 	ypography.tsx file.
- Updated DESIGN.md with typography rules and explicit tokens.