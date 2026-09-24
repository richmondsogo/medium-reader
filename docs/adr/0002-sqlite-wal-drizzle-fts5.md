# 0002. SQLite (WAL) + Drizzle and FTS5 for Search

## Status

Accepted

## Context

The application is a single-writer personal reader managing approximately 1,000 articles. Running a client-server database like PostgreSQL adds operational complexity and hosting overhead without necessity.

## Decision

Use SQLite in WAL mode with Drizzle ORM for data storage, and SQLite FTS5 for fast full-text article search.

## Consequences

- Zero-maintenance local database with high read throughput and safe single-writer access.
- Requires persistent disk storage in the deployment environment.
- Because all data access is encapsulated behind `src/server`, the database layer can be migrated to Postgres in the future if hosting requirements change.
