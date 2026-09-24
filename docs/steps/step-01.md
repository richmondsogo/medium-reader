# Step 1: Project Scaffolding & Setup

## What was done

1. Initialized Next.js project using `create-next-app` in the root repository folder with TypeScript, Tailwind CSS, ESLint, App Router, `src/` directory, `@/*` import alias, and `pnpm`.
2. Configured `tsconfig.json` with strict mode (`"strict": true`) and enabled `"noUncheckedIndexedAccess": true`.
3. Installed requested dev dependencies only: `prettier`, `vitest`, `zod`, and `tsx`.
4. Established required directory structure with `.gitkeep` placeholders for empty folders:
   - `src/app`
   - `src/components`
   - `src/server`
   - `src/ingest`
   - `src/lib`
   - `fixtures/emails`
   - `fixtures/html`
   - `docs/adr`
   - `docs/steps`
5. Configured `package.json` scripts:
   - `dev`: `next dev`
   - `build`: `next build`
   - `start`: `next start`
   - `lint`: `eslint`
   - `typecheck`: `tsc --noEmit`
   - `test`: `vitest run`
   - `format`: `prettier --write .`
   - `check`: `pnpm lint && pnpm typecheck && pnpm test`
6. Created `src/lib/env.ts` with Zod schema parsing `process.env` with typed defaults (`DATABASE_PATH = "./data/medium-reader.db"`, `LOG_LEVEL = "info"`). Added unit test suite in `src/lib/env.test.ts` verifying defaults and invalid log level error handling.
7. Created `.env.example` with documented environment variables and updated `.gitignore` to ignore `.env*`, `data/`, `node_modules`, `.next`, and `*.db*`, while explicitly allowing `.env.example`.
8. Created `AGENTS.md` at repository root with verbatim project instructions and conventions.
9. Created `docs/architecture.md` (overview and text diagram) and 6 ADRs in `docs/adr/` under 25 lines each (0001 through 0006).

## Commands run

```bash
# Project scaffolding
pnpm dlx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --disable-git --yes

# Dev tooling
pnpm add -D prettier vitest zod tsx
pnpm approve-builds --all

# Directory structure creation
New-Item -ItemType Directory -Force -Path src/components, src/server, src/ingest, src/lib, fixtures/emails, fixtures/html, docs/adr, docs/steps
New-Item -ItemType File -Force -Path src/components/.gitkeep, src/server/.gitkeep, src/ingest/.gitkeep, fixtures/emails/.gitkeep, fixtures/html/.gitkeep

# Quality checks & verification
pnpm check
pnpm build
```

## Versions installed

- **Node.js**: v25.8.1
- **pnpm**: 12.4.1
- **next**: 16.3.6
- **react**: 19.2.8
- **react-dom**: 19.2.8
- **tailwindcss**: 4.3.3
- **@tailwindcss/postcss**: 4.3.3
- **eslint**: 9.39.5
- **eslint-config-next**: 16.3.6
- **typescript**: 5.9.3
- **@types/node**: 20.19.43
- **@types/react**: 19.3.0
- **@types/react-dom**: 19.3.0
- **babel-plugin-react-compiler**: 1.0.0
- **prettier**: 3.9.9
- **vitest**: 5.0.1
- **zod**: 4.6.5
- **tsx**: 4.23.15
