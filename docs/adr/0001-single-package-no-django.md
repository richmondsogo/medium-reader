# 0001. One TypeScript Package, No Django/DRF

## Status

Accepted

## Context

The app serves a single user with a single web client. Introducing a separate backend framework such as Django/DRF requires running and maintaining a second runtime, configuring CORS, and duplicating types across language boundaries.

## Decision

Use a single TypeScript package containing both the ingestion CLI and the Next.js web application.

## Consequences

- Simplifies development, deployment, and type-sharing across the stack.
- Eliminates CORS and separate backend infrastructure overhead.
- If specialized Python tooling is ever required for ingestion, a standalone Python worker can be reintroduced later without altering the core architecture.
