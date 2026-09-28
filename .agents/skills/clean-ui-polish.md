---
name: clean-ui-polish
description: Workflow for polishing UI elements to match modern aesthetic standards (Linear, Vercel, Stripe style)
tags: [frontend, tailwind, css, animation]
---

# Clean UI Polish Workflow

When building or refining user interfaces, strictly enforce these structural aesthetics:

1. **The Grid & Alignment:**
   - Enforce an 8px spacing scale (`space-y-2`, `space-y-4`, `p-6`, `p-8`).
   - Use strict flex container alignments. Never let child elements guess their widths.

2. **Typography Hierarchy:**
   - Use high-contrast font weights rather than massive font sizes to separate content.
   - Set subtle tracking shifts: `tracking-tight` for large headings, `tracking-wide` for uppercase labels.

3. **Subtle Elevation & Borders:**
   - Use borders with high transparency (`border-black/5` or `border-white/10`) instead of solid gray borders.
   - Use multi-layered soft shadows (`shadow-sm` layered with `ring-1 ring-black/5`).

4. **Micro-interactions:**
   - Every clickable button or card must feature an explicit transition state (`transition-all duration-200 ease-out`).
