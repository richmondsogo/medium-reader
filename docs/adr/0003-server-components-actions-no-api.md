# 0003. Server Components and Actions Without an API Layer

## Status

Accepted

## Context

With a single web UI and a single user, creating REST or GraphQL endpoints introduces unnecessary boilerplate, serialization overhead, and endpoint maintenance.

## Decision

Use React Server Components for direct database reads and Next.js Server Actions for mutations (saving, marking as read, purging).

## Consequences

- Eliminates endpoint boilerplate, client data fetching libraries, and manual serialization logic.
- Direct typed access between UI components and the `src/server` database layer.
- Route handlers (API routes) will only be introduced if an external client (e.g. mobile app or browser extension) requires access.
