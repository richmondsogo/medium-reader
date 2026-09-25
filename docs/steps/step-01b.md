# Step 1b: Runtime Dependencies, Line Endings, and Fixture Safety

## What was done

1. Moved `zod` from `devDependencies` to runtime `dependencies` in `package.json`.
2. Updated `@types/node` from `^20` to `^25` in `devDependencies` to match the local Node.js version (`v25.8.1`).
3. Created `.gitattributes` configuring repository-wide LF normalization while preventing CRLF conversion on email and HTML fixtures:
   ```
   * text=auto eol=lf
   *.eml -text
   fixtures/html/** -text
   ```
4. Added `.prettierrc` configuring `"endOfLine": "lf"`.
5. Updated `AGENTS.md` Security section to mandate fixture data privacy and prohibit pasting raw fixtures into public places.
6. Executed `git add --renormalize .` to normalize line endings across the repository.
7. Verified that `pnpm check` and `pnpm build` pass cleanly.

## Commands run

```bash
pnpm install
git add --renormalize .
git status
pnpm check
pnpm build
```

## Versions updated

- **@types/node**: 25.9.8
- **zod**: 4.6.5 (moved to dependencies)
