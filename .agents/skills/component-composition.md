---
name: component-composition
description: Guidelines for assembling atomic, reusable, and compound UI patterns
tags: [react, component, architecture]
---

# Component Composition Rules

When the user asks to build "clean websites with components", do not build massive, single-file pages. Segment them:

1. **Atomic Isolation:**
   - Extract cards, custom buttons, badges, and dropdowns into isolated, typed React components.
   - Leverage Tailwind's `cn()` utility class merge function to allow safe style overrides.

2. **Compound Patterns:**
   - Design interactive elements (like custom tabs or dialogs) using context-based compound components:
     ```tsx
     <Tabs>
       <Tabs.List>...</Tabs.List>
       <Tabs.Content>...</Tabs.Content>
     </Tabs>
     ```
3. **Skeleton Loading:**
   - Every complex component must ship with a matching `<ComponentSkeleton />` variant to maintain layout shifts below 0.1 CLS.
