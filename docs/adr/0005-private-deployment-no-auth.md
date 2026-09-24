# 0005. Private Deployment Model Without App-Level Auth

## Status

Accepted

## Context

Medium articles retrieved by the ingestion pipeline may include paywalled content. Distributing or hosting this content on the public internet would violate terms and create copyright concerns. Building user authentication and session management adds complexity to a single-user tool.

## Decision

Deploy the application exclusively on a private network (such as Tailscale) without an application-level authentication system.

## Consequences

- Network-level isolation serves as the primary security control.
- Eliminates auth databases, token handling, login flows, and session management overhead.
- Requires private network configuration (e.g. Tailscale node or VPN) to access the reader UI.
